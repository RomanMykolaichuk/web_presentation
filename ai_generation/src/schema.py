from __future__ import annotations

from typing import Any, Dict, List, Tuple
from pydantic import BaseModel, Field, ValidationError


class Slide(BaseModel):
    layout_key: str
    fields: Dict[str, Any]


class Deck(BaseModel):
    slides: List[Slide]


def _simplify_type(spec: str) -> str:
    s = (spec or "").strip().lower()
    if s.endswith("?"):
        s = s[:-1].strip()
    if s in {"string", "str"}:
        return "string"
    if s in {"boolean", "bool"}:
        return "boolean"
    if s.endswith("[]") or s.startswith("["):
        # treat any [T] as array
        return "array"
    if s.startswith("{") and s.endswith("}"):
        return "object"
    # unknown/complex -> any
    return "any"


def build_layout_requirements(templates: Any) -> Dict[str, Dict[str, str]]:
    """Return mapping: layout_key -> { field_name -> simplified_type } for required fields only."""
    out: Dict[str, Dict[str, str]] = {}
    if not isinstance(templates, list):
        return out
    for t in templates:
        if not isinstance(t, dict):
            continue
        lk = t.get("layout_key")
        fs = t.get("fieldsSchema")
        if not isinstance(lk, str) or not isinstance(fs, dict):
            continue
        req: Dict[str, str] = {}
        for name, spec in fs.items():
            if not isinstance(name, str) or not isinstance(spec, str):
                continue
            if spec.strip().endswith("?"):
                # optional
                continue
            req[name] = _simplify_type(spec)
        out[lk] = req
    return out


def _is_string(x: Any) -> bool:
    return isinstance(x, str)


def _is_array_of_strings(x: Any) -> bool:
    return isinstance(x, list) and all(isinstance(i, str) for i in x)


def validate_fields_against_requirements(layout_key: str, fields: Dict[str, Any], reqs: Dict[str, Dict[str, str]]) -> List[str]:
    errors: List[str] = []
    expected = reqs.get(layout_key, {})
    for name, typ in expected.items():
        if name not in fields:
            errors.append(f"missing field '{name}'")
            continue
        val = fields[name]
        if typ == "string" and not _is_string(val):
            errors.append(f"field '{name}' must be string")
        elif typ == "array" and not _is_array_of_strings(val):
            # allow single string that can be coerced to [string]
            if _is_string(val):
                pass
            else:
                errors.append(f"field '{name}' must be array of strings")
        elif typ == "boolean" and not isinstance(val, bool):
            errors.append(f"field '{name}' must be boolean")
        # object/any -> skip deep validation
    return errors


def try_fix_fields(layout_key: str, fields: Dict[str, Any], reqs: Dict[str, Dict[str, str]]) -> Dict[str, Any]:
    fixed = dict(fields)
    expected = reqs.get(layout_key, {})
    for name, typ in expected.items():
        if name not in fixed:
            continue
        val = fixed[name]
        if typ == "string" and isinstance(val, list) and val:
            fixed[name] = str(val[0])
        elif typ == "array" and isinstance(val, str):
            fixed[name] = [val]
    return fixed


def validate_deck(slides: List[Dict[str, Any]], templates: Any) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Validate slides with Pydantic and templates. Returns (valid_slides, errors)."""
    errors: List[str] = []
    # Base schema validation
    try:
        _ = Deck(slides=slides)
    except ValidationError as e:
        errors.append(f"pydantic: {e}")

    # Templates-based checks
    reqs = build_layout_requirements(templates)
    valid: List[Dict[str, Any]] = []
    for idx, s in enumerate(slides):
        if not isinstance(s, dict):
            errors.append(f"slide[{idx}] not an object")
            continue
        lk = s.get("layout_key")
        fields = s.get("fields")
        if not isinstance(lk, str) or not isinstance(fields, dict):
            errors.append(f"slide[{idx}] invalid layout_key/fields")
            continue
        # attempt soft fix
        fixed_fields = try_fix_fields(lk, fields, reqs)
        field_errors = validate_fields_against_requirements(lk, fixed_fields, reqs)
        if field_errors:
            errors.append(f"slide[{idx}]: " + "; ".join(field_errors))
            # keep, but only if basic shape is fine; otherwise drop
            # drop slides with missing required fields
            if any(msg.startswith("missing field") for msg in field_errors):
                continue
        valid.append({"layout_key": lk, "fields": fixed_fields})
    return valid, errors

