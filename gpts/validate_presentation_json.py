
#!/usr/bin/env python3
# validate_presentation_json.py
# Usage:
#   python validate_presentation_json.py --templates templates.json --candidate slides.json
#
# The templates file must contain a list of layouts where each layout has:
#   - layout_key: string
#   - fieldsSchema: object like {"title": "string", "items": "string[]", "footer": "string?"}
#
import json, argparse, sys

def parse_field_spec(spec: str):
    is_optional = spec.endswith("?")
    if is_optional:
        spec = spec[:-1]
    is_array = spec.endswith("[]")
    base = spec[:-2] if is_array else spec
    return base, is_array, is_optional

def type_check(value, base, is_array):
    if is_array:
        if not isinstance(value, list):
            return False
        if base == "string":
            return all(isinstance(x, str) for x in value)
        if base == "object":
            return all(isinstance(x, dict) for x in value)
        return True
    else:
        if base == "string":
            return isinstance(value, str)
        if base == "object":
            return isinstance(value, dict)
        return True

def load_templates(path: str):
    with open(path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if isinstance(data, dict):
        for k in ("templates", "layouts", "items", "slides"):
            if k in data and isinstance(data[k], list):
                data = data[k]
                break
    if not isinstance(data, list):
        raise ValueError("Templates root must be a list or contain a list under 'templates/layouts/items/slides'.")
    layouts = {}
    for t in data:
        lk = t.get("layout_key") or t.get("name") or t.get("id")
        fs = t.get("fieldsSchema") or t.get("fields_schema") or t.get("schema")
        if not lk or not isinstance(fs, dict):
            continue
        layouts[lk] = fs
    if not layouts:
        raise ValueError("No layouts with 'layout_key' and 'fieldsSchema' found.")
    return layouts

def validate_candidate(candidate, layouts):
    if not isinstance(candidate, list):
        return ["Root must be a JSON array of slides."]
    errors = []
    for idx, slide in enumerate(candidate):
        ctx = f"Slide[{idx}]"
        if not isinstance(slide, dict):
            errors.append(f"{ctx}: must be an object.")
            continue
        lk = slide.get("layout_key")
        fields = slide.get("fields")
        if not isinstance(lk, str):
            errors.append(f"{ctx}: layout_key must be a string.")
            continue
        if lk not in layouts:
            errors.append(f"{ctx}: layout_key '{lk}' is not in templates.")
            continue
        if not isinstance(fields, dict):
            errors.append(f"{ctx}: fields must be an object.")
            continue
        schema = layouts[lk]
        for fname, spec in schema.items():
            base, is_array, is_optional = parse_field_spec(spec)
            if not is_optional and fname not in fields:
                errors.append(f"{ctx}: missing required field '{fname}' for layout '{lk}'.")
                continue
            if fname in fields and not type_check(fields[fname], base, is_array):
                errors.append(f"{ctx}: field '{fname}' has wrong type; expected '{spec}'.")
        for fname in fields.keys():
            if fname not in schema:
                errors.append(f"{ctx}: extra field '{fname}' not defined in schema for layout '{lk}'.")
    return errors

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--templates", required=True)
    parser.add_argument("--candidate", required=True)
    args = parser.parse_args()
    try:
        layouts = load_templates(args.templates)
    except Exception as e:
        print(f"ERROR: cannot load templates: {e}", file=sys.stderr)
        sys.exit(2)
    try:
        with open(args.candidate, "r", encoding="utf-8") as f:
            candidate = json.load(f)
    except Exception as e:
        print(f"ERROR: cannot load candidate JSON: {e}", file=sys.stderr)
        sys.exit(2)
    errors = validate_candidate(candidate, layouts)
    if errors:
        print("❌ Validation failed:")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print("✅ Validation passed.")
        sys.exit(0)

if __name__ == "__main__":
    main()
