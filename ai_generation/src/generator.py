from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from .schema import validate_deck


SYSTEM_SPEC = (
    "You are a team of cooperative agents (Planner, Drafter, Reviewer). "
    "Always output strict JSON only (no markdown fences). "
    "Accepted shapes: {\"plan\": {...}}, {\"outline\": [...]}, or {\"slides\": [...]}. "
)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```[a-zA-Z]*\n", "", text)
    text = re.sub(r"\n```$", "", text)
    return text.strip()


def _extract_first_json_segment(text: str) -> str:
    """Extract the first balanced JSON object/array from a text blob."""
    if not text:
        return text
    start_obj = text.find('{')
    start_arr = text.find('[')
    starts = [i for i in [start_obj, start_arr] if i != -1]
    if not starts:
        return text
    i = min(starts)
    opener = text[i]
    closer = '}' if opener == '{' else ']'
    depth = 0
    in_string = False
    escape = False
    for j in range(i, len(text)):
        ch = text[j]
        if in_string:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
            continue
        if ch == opener:
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0:
                return text[i:j+1]
    # Fallback if not balanced
    return text[i:]


@dataclass
class DataContext:
    templates: Any
    themes: Any
    allowed_layouts: List[str]


def load_datacontext(templates_path, themes_path) -> DataContext:
    # Read with utf-8-sig to safely strip BOM if present
    templates = json.loads(open(templates_path, "r", encoding="utf-8-sig").read())
    themes = json.loads(open(themes_path, "r", encoding="utf-8-sig").read())
    allowed: List[str] = []
    if isinstance(templates, list):
        for t in templates:
            if isinstance(t, dict):
                lk = t.get("layout_key")
                if isinstance(lk, str):
                    allowed.append(lk)
    if not allowed:
        allowed = [
            "Title Slide",
            "Title and Content",
            "Image Only",
            "Video Slide",
            "Markmap Export",
            "Agenda / Outline Slide",
            "Text + Image Slide",
            "Comparison Slide",
            "Chart / Graph Slide",
            "Process / Flow Slide",
            "Problem-Solution Slide",
            "Quote / Key Message Slide",
            "Team / Organizational Slide",
            "Summary / Thank You Slide",
        ]
    return DataContext(templates=templates, themes=themes, allowed_layouts=allowed)


def stub_outline(topic: str, *, max_slides: int, ctx: DataContext) -> List[Dict[str, Any]]:
    outline: List[Dict[str, Any]] = []
    def allow(k: str) -> bool: return k in ctx.allowed_layouts

    if allow("Title Slide"):
        outline.append({"layout_key": "Title Slide", "title": topic})
    if allow("Agenda / Outline Slide"):
        outline.append({"layout_key": "Agenda / Outline Slide", "title": "План"})
    if allow("Title and Content"):
        outline.append({"layout_key": "Title and Content", "title": "Вступ"})
    if allow("Text + Image Slide"):
        outline.append({"layout_key": "Text + Image Slide", "title": "Ключові ідеї"})
    if allow("Comparison Slide"):
        outline.append({"layout_key": "Comparison Slide", "title": "Порівняння підходів"})
    if allow("Quote / Key Message Slide"):
        outline.append({"layout_key": "Quote / Key Message Slide", "title": "Цитата"})
    if allow("Summary / Thank You Slide"):
        outline.append({"layout_key": "Summary / Thank You Slide", "title": "Підсумок"})

    return outline[: max(1, min(max_slides, len(outline)))]


def stub_generate(topic: str, *, max_slides: int, lang: str, ctx: DataContext) -> Dict[str, Any]:
    title = "Автоматично згенерована презентація" if str(lang).startswith("uk") else "Auto-generated Presentation"
    outline = stub_outline(topic, max_slides=max_slides, ctx=ctx)
    slides: List[Dict[str, Any]] = []
    for item in outline:
        lk = item.get("layout_key")
        if lk == "Title Slide":
            slides.append({"layout_key": lk, "fields": {"title": topic or title, "subtitle": title}})
        elif lk == "Agenda / Outline Slide":
            slides.append({"layout_key": lk, "fields": {"title": "План", "items": ["Мета", "Підхід", "Етапи"]}})
        elif lk == "Title and Content":
            slides.append({"layout_key": lk, "fields": {"title": "Вступ", "body": ["Контекст", "Завдання", "Очікування"]}})
        elif lk == "Text + Image Slide":
            slides.append({"layout_key": lk, "fields": {"title": "Ключові ідеї", "body": ["Проблема", "Рішення", "Вплив"], "image": {"src": "example.png", "alt": "Ілюстрація"}}})
        elif lk == "Comparison Slide":
            slides.append({"layout_key": lk, "fields": {"title": "Порівняння", "a_title": "A", "a": ["Плюси", "Мінуси"], "b_title": "B", "b": ["Плюси", "Мінуси"]}})
        elif lk == "Quote / Key Message Slide":
            slides.append({"layout_key": lk, "fields": {"title": "Головна думка", "quote": "Коротко, чітко, по суті."}})
        elif lk == "Summary / Thank You Slide":
            slides.append({"layout_key": lk, "fields": {"title": "Підсумок", "points": ["Результати", "Кроки далі"], "thanks": "Дякую за увагу!"}})
        else:
            slides.append({"layout_key": lk, "fields": {"title": item.get("title", topic)}})
    return {"slides": slides}


def generate_outline_with_gemini(api_key: str, model_name: str, *, topic: str, max_slides: int, lang: str, ctx: DataContext) -> List[Dict[str, Any]]:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    allowed = ", ".join(ctx.allowed_layouts)
    prompt = (
        f"Language: {lang}. Produce JSON only with key 'outline'. "
        f"Each outline item: {{layout_key, title?}}. Max {max_slides} items. "
        f"Use these layout_key values only: {allowed}. "
        f"Topic: {topic}"
    )
    res = model.generate_content([SYSTEM_SPEC, prompt], generation_config={"response_mime_type": "application/json"})
    text = getattr(res, "text", None)
    if not text and getattr(res, "candidates", None):
        for c in res.candidates:
            content = getattr(c, "content", None)
            if content and getattr(content, "parts", None):
                text = "".join(getattr(p, "text", "") for p in content.parts)
                if text:
                    break
    if not text:
        raise RuntimeError("Empty response from model (outline)")
    cleaned = _extract_first_json_segment(_strip_code_fences(text))
    data = json.loads(cleaned)
    outline = data.get("outline") if isinstance(data, dict) else None
    if not isinstance(outline, list):
        raise ValueError("Model outline missing or not a list")
    return outline


def generate_slides_with_gemini(api_key: str, model_name: str, *, topic: str, outline: List[Dict[str, Any]], lang: str, ctx: DataContext) -> Dict[str, Any]:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    prompt = (
        f"Language: {lang}. Produce JSON only with key 'slides'. "
        f"Respect provided outline order and layout_key strictly. Fields must match layout conventions from templates. "
        f"Keep bullets concise (<= 8 words, 3-6 items). Topic: {topic}. "
        f"Outline JSON: {json.dumps(outline, ensure_ascii=False)} "
        f"Templates JSON (sample schemas): {json.dumps(ctx.templates, ensure_ascii=False)[:8000]}"
    )
    res = model.generate_content([SYSTEM_SPEC, prompt], generation_config={"response_mime_type": "application/json"})
    text = getattr(res, "text", None)
    if not text and getattr(res, "candidates", None):
        for c in res.candidates:
            content = getattr(c, "content", None)
            if content and getattr(content, "parts", None):
                text = "".join(getattr(p, "text", "") for p in content.parts)
                if text:
                    break
    if not text:
        raise RuntimeError("Empty response from model (slides)")
    cleaned = _extract_first_json_segment(_strip_code_fences(text))
    data = json.loads(cleaned)
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Model slides missing or not a list")
    return {"slides": slides}


def agent_generate(
    topic: str,
    *,
    max_slides: int,
    lang: str,
    api_key: Optional[str],
    model_name: str,
    ctx: DataContext,
    verbose: bool = False,
    max_calls: int = 3,
    groq_api_key: Optional[str] = None,
    groq_model: str = "llama3-70b-8192",
) -> Dict[str, Any]:
    return multi_agent_generate(
        topic,
        max_slides=max_slides,
        lang=lang,
        api_key=api_key,
        model_name=model_name,
        ctx=ctx,
        verbose=verbose,
        max_calls=max_calls,
        groq_api_key=groq_api_key,
        groq_model=groq_model,
    )


# ===== Multi-agent pipeline =====

def plan_with_gemini(api_key: str, model_name: str, *, topic: str, max_slides: int, lang: str, ctx: DataContext) -> Dict[str, Any]:
    """Planner agent: returns { plan: { title, audience?, goals?, outline: [ {layout_key, title, intent?} ] } }"""
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    allowed = ", ".join(ctx.allowed_layouts)
    prompt = (
        f"Language: {lang}. Return valid JSON only. Preferred shape: {{\"plan\": {{ \"title\": string, \"outline\": [{{layout_key, title, intent?}}] }} }}. "
        f"Acceptable alternative: {{\"outline\": [ ... ]}} or a raw array of outline items. "
        f"Use these layout_key values only: {allowed}. Max slides: {max_slides}. "
        f"Each outline item: {{layout_key, title, intent?}} with concise titles (<= 6 words). "
        f"Topic: {topic}."
    )
    res = model.generate_content([SYSTEM_SPEC, prompt], generation_config={"response_mime_type": "application/json"})
    text = getattr(res, "text", None)
    if not text and getattr(res, "candidates", None):
        for c in res.candidates:
            content = getattr(c, "content", None)
            if content and getattr(content, "parts", None):
                text = "".join(getattr(p, "text", "") for p in content.parts)
                if text:
                    break
    if not text:
        raise RuntimeError("Empty response from model (plan)")
    cleaned = _extract_first_json_segment(_strip_code_fences(text))
    data = json.loads(cleaned)
    outline = None
    title = topic
    if isinstance(data, list):
        outline = data
    elif isinstance(data, dict):
        if isinstance(data.get("plan"), dict) and isinstance(data["plan"].get("outline"), list):
            title = data["plan"].get("title") or title
            outline = data["plan"]["outline"]
        elif isinstance(data.get("outline"), list):
            outline = data["outline"]
        elif isinstance(data.get("slides"), list):
            outline = [
                {"layout_key": s.get("layout_key"), "title": (s.get("fields") or {}).get("title", "")}
                for s in data["slides"] if isinstance(s, dict) and isinstance(s.get("layout_key"), str)
            ]
    if not isinstance(outline, list):
        raise ValueError("Model plan invalid")
    norm_outline = []
    for it in outline:
        if isinstance(it, dict) and isinstance(it.get("layout_key"), str):
            norm_outline.append({"layout_key": it.get("layout_key"), "title": it.get("title", ""), "intent": it.get("intent")})
    allowed_set = set(ctx.allowed_layouts)
    norm_outline = [it for it in norm_outline if it["layout_key"] in allowed_set][: max_slides]
    return {"title": title, "outline": norm_outline}


def _groq_complete_json(api_key: str, model_name: str, system: str, user: str) -> str:
    from groq import Groq
    client = Groq(api_key=api_key)
    resp = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
    )
    return resp.choices[0].message.content or ""


def plan_with_groq(api_key: str, model_name: str, *, topic: str, max_slides: int, lang: str, ctx: DataContext) -> Dict[str, Any]:
    allowed = ", ".join(ctx.allowed_layouts)
    prompt = (
        f"Language: {lang}. Return valid JSON only. Preferred shape: {{\"plan\": {{ \"title\": string, \"outline\": [{{layout_key, title, intent?}}] }} }}. "
        f"Acceptable alternative: {{\"outline\": [ ... ]}} or a raw array of outline items. "
        f"Use these layout_key values only: {allowed}. Max slides: {max_slides}. "
        f"Each outline item: {{layout_key, title, intent?}} with concise titles (<= 6 words). "
        f"Topic: {topic}."
    )
    text = _groq_complete_json(api_key, model_name, SYSTEM_SPEC, prompt)
    cleaned = _extract_first_json_segment(_strip_code_fences(text))
    data = json.loads(cleaned)
    outline = None
    title = topic
    if isinstance(data, list):
        outline = data
    elif isinstance(data, dict):
        if isinstance(data.get("plan"), dict) and isinstance(data["plan"].get("outline"), list):
            title = data["plan"].get("title") or title
            outline = data["plan"]["outline"]
        elif isinstance(data.get("outline"), list):
            outline = data["outline"]
        elif isinstance(data.get("slides"), list):
            outline = [
                {"layout_key": s.get("layout_key"), "title": (s.get("fields") or {}).get("title", "")}
                for s in data["slides"] if isinstance(s, dict) and isinstance(s.get("layout_key"), str)
            ]
    if not isinstance(outline, list):
        raise ValueError("Model plan invalid (groq)")
    norm_outline = []
    for it in outline:
        if isinstance(it, dict) and isinstance(it.get("layout_key"), str):
            norm_outline.append({"layout_key": it.get("layout_key"), "title": it.get("title", ""), "intent": it.get("intent")})
    allowed_set = set(ctx.allowed_layouts)
    norm_outline = [it for it in norm_outline if it["layout_key"] in allowed_set][: max_slides]
    return {"title": title, "outline": norm_outline}


def plan_stub(topic: str, *, max_slides: int, lang: str, ctx: DataContext) -> Dict[str, Any]:
    outline = stub_outline(topic, max_slides=max_slides, ctx=ctx)
    return {"title": topic, "outline": outline}


def draft_with_gemini(api_key: str, model_name: str, *, topic: str, plan: Dict[str, Any], lang: str, ctx: DataContext) -> Dict[str, Any]:
    """Drafter agent: expand plan into concrete slides fields using templates as guidance."""
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    prompt = (
        f"Language: {lang}. Return valid JSON object with key 'slides' (array). "
        f"Each slide: {{layout_key:string, fields:object}}. Use only layout_key from templates and include all REQUIRED fields (no '?' in fieldsSchema); use correct types: string, array-of-strings, boolean as specified. "
        f"Keep bullets concise (<= 8 words, 3-6 items). Topic: {topic}. "
        f"Plan JSON: {json.dumps(plan, ensure_ascii=False)} "
        f"Templates JSON (schemas): {json.dumps(ctx.templates, ensure_ascii=False)[:8000]}"
    )
    res = model.generate_content([SYSTEM_SPEC, prompt], generation_config={"response_mime_type": "application/json"})
    text = getattr(res, "text", None)
    if not text and getattr(res, "candidates", None):
        for c in res.candidates:
            content = getattr(c, "content", None)
            if content and getattr(content, "parts", None):
                text = "".join(getattr(p, "text", "") for p in content.parts)
                if text:
                    break
    if not text:
        raise RuntimeError("Empty response from model (draft)")
    cleaned = _extract_first_json_segment(_strip_code_fences(text))
    data = json.loads(cleaned)
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Draft: slides missing or not a list")
    return {"slides": slides}


def draft_with_groq(api_key: str, model_name: str, *, topic: str, plan: Dict[str, Any], lang: str, ctx: DataContext) -> Dict[str, Any]:
    prompt = (
        f"Language: {lang}. Return valid JSON object with key 'slides' (array). "
        f"Each slide: {{layout_key:string, fields:object}}. Use only layout_key from templates and include all REQUIRED fields (no '?' in fieldsSchema); use correct types: string, array-of-strings, boolean as specified. "
        f"Keep bullets concise (<= 8 words, 3-6 items). Topic: {topic}. "
        f"Plan JSON: {json.dumps(plan, ensure_ascii=False)} "
        f"Templates JSON (schemas): {json.dumps(ctx.templates, ensure_ascii=False)[:8000]}"
    )
    text = _groq_complete_json(api_key, model_name, SYSTEM_SPEC, prompt)
    data = json.loads(_strip_code_fences(text))
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Draft: slides missing or not a list (groq)")
    return {"slides": slides}


def draft_stub(topic: str, *, plan: Dict[str, Any], lang: str, ctx: DataContext) -> Dict[str, Any]:
    # Convert outline to simple slides, similar to stub_generate
    outline = plan.get("outline", []) if isinstance(plan, dict) else []
    return stub_generate(topic, max_slides=len(outline) or 8, lang=lang, ctx=ctx)


def review_and_refine_with_gemini(api_key: str, model_name: str, *, topic: str, draft: Dict[str, Any], lang: str, ctx: DataContext) -> Dict[str, Any]:
    """Reviewer agent: enforce constraints, fix wording length, ensure allowed layouts."""
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    allowed = ", ".join(ctx.allowed_layouts)
    prompt = (
        f"Language: {lang}. Return valid JSON object with key 'slides' (array). "
        f"Review and refine: use only allowed layout_key ({allowed}); ensure REQUIRED fields present with correct types per fieldsSchema (string, array-of-strings, boolean); limit bullets (3-6, <= 8 words); keep meaning; ensure UTF-8; do not add keys not in fieldsSchema. "
        f"Input slides JSON: {json.dumps(draft, ensure_ascii=False)}"
    )
    res = model.generate_content([SYSTEM_SPEC, prompt], generation_config={"response_mime_type": "application/json"})
    text = getattr(res, "text", None)
    if not text and getattr(res, "candidates", None):
        for c in res.candidates:
            content = getattr(c, "content", None)
            if content and getattr(content, "parts", None):
                text = "".join(getattr(p, "text", "") for p in content.parts)
                if text:
                    break
    if not text:
        raise RuntimeError("Empty response from model (review)")
    data = json.loads(_strip_code_fences(text))
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Review: slides missing or not a list")
    return {"slides": slides}


def review_and_refine_with_groq(api_key: str, model_name: str, *, topic: str, draft: Dict[str, Any], lang: str, ctx: DataContext) -> Dict[str, Any]:
    allowed = ", ".join(ctx.allowed_layouts)
    prompt = (
        f"Language: {lang}. Return valid JSON object with key 'slides' (array). "
        f"Review and refine: use only allowed layout_key ({allowed}); ensure REQUIRED fields present with correct types per fieldsSchema (string, array-of-strings, boolean); limit bullets (3-6, <= 8 words); keep meaning; ensure UTF-8; do not add keys not in fieldsSchema. "
        f"Input slides JSON: {json.dumps(draft, ensure_ascii=False)}"
    )
    text = _groq_complete_json(api_key, model_name, SYSTEM_SPEC, prompt)
    data = json.loads(_strip_code_fences(text))
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Review: slides missing or not a list (groq)")
    return {"slides": slides}


def _heuristic_trim_bullets(slide: Dict[str, Any]) -> None:
    fields = slide.get("fields")
    if not isinstance(fields, dict):
        return
    # normalize body/items/points arrays
    for key in ("body", "items", "points"):
        val = fields.get(key)
        if isinstance(val, list):
            # limit to 3-6 items
            val = [str(x) for x in val if isinstance(x, (str, int, float))]
            if len(val) > 6:
                val = val[:6]
            if len(val) < 3 and len(val) > 0:
                # pad by splitting long items if possible
                while len(val) < 3 and any(len(str(x).split()) > 8 for x in val):
                    for i, x in enumerate(list(val)):
                        words = str(x).split()
                        if len(words) > 8:
                            mid = len(words) // 2
                            val[i] = " ".join(words[:mid])
                            val.insert(i + 1, " ".join(words[mid:]))
                            break
                    if len(val) >= 3:
                        break
            # enforce <= 8 words per bullet
            val = [" ".join(str(x).split()[:8]) for x in val]
            fields[key] = val


def review_stub(draft: Dict[str, Any], *, ctx: DataContext) -> Dict[str, Any]:
    allowed = set(ctx.allowed_layouts)
    slides = [s for s in draft.get("slides", []) if isinstance(s, dict) and s.get("layout_key") in allowed]
    for s in slides:
        _heuristic_trim_bullets(s)
    return {"slides": slides}


def multi_agent_generate(
    topic: str,
    *,
    max_slides: int,
    lang: str,
    api_key: Optional[str],
    model_name: str,
    ctx: DataContext,
    verbose: bool = False,
    max_calls: int = 3,
    groq_api_key: Optional[str] = None,
    groq_model: str = "llama3-70b-8192",
) -> Dict[str, Any]:
    calls_left = max(0, int(max_calls))

    def can_call() -> bool:
        return bool(api_key) and calls_left > 0

    # 1) Planner (consume 1 call if online and budget allows)
    if can_call() and calls_left >= 2:
        # Full pipeline path with enough budget
        calls_left -= 1
        try:
            if verbose:
                print("[planner] planning outline…")
            plan = plan_with_gemini(api_key, model_name, topic=topic, max_slides=max_slides, lang=lang, ctx=ctx)
        except Exception as e:
            if verbose:
                print(f"[planner] gemini failed: {e}; trying groq…")
            try:
                if not groq_api_key:
                    raise RuntimeError("missing GROQ_API_KEY")
                plan = plan_with_groq(groq_api_key, groq_model, topic=topic, max_slides=max_slides, lang=lang, ctx=ctx)
            except Exception as e2:
                if verbose:
                    print(f"[planner] groq failed: {e2}; using stub")
                plan = plan_stub(topic, max_slides=max_slides, lang=lang, ctx=ctx)
    else:
        # No budget for separate planning → use local stub outline
        if verbose:
            print("[planner] skipped (budget/offline): using stub")
        plan = plan_stub(topic, max_slides=max_slides, lang=lang, ctx=ctx)

    # 2) Drafter
    if can_call():
        calls_left -= 1
        try:
            if verbose:
                print("[drafter] drafting slides…")
            draft = draft_with_gemini(api_key, model_name, topic=topic, plan=plan, lang=lang, ctx=ctx)
        except Exception as e:
            if verbose:
                print(f"[drafter] gemini failed: {e}; trying groq…")
            try:
                if not groq_api_key:
                    raise RuntimeError("missing GROQ_API_KEY")
                draft = draft_with_groq(groq_api_key, groq_model, topic=topic, plan=plan, lang=lang, ctx=ctx)
            except Exception as e2:
                if verbose:
                    print(f"[drafter] groq failed: {e2}; using stub")
                draft = draft_stub(topic, plan=plan, lang=lang, ctx=ctx)
    else:
        if verbose:
            print("[drafter] offline/no budget: using stub")
        draft = draft_stub(topic, plan=plan, lang=lang, ctx=ctx)

    # 3) Reviewer
    if can_call() and calls_left >= 1:
        calls_left -= 1
        try:
            if verbose:
                print("[reviewer] refining slides…")
            refined = review_and_refine_with_gemini(api_key, model_name, topic=topic, draft=draft, lang=lang, ctx=ctx)
        except Exception as e:
            if verbose:
                print(f"[reviewer] gemini failed: {e}; trying groq…")
            try:
                if not groq_api_key:
                    raise RuntimeError("missing GROQ_API_KEY")
                refined = review_and_refine_with_groq(groq_api_key, groq_model, topic=topic, draft=draft, lang=lang, ctx=ctx)
            except Exception as e2:
                if verbose:
                    print(f"[reviewer] groq failed: {e2}; using heuristic review")
                refined = review_stub(draft, ctx=ctx)
    else:
        if verbose:
            print("[reviewer] skipped (budget/offline): heuristic review")
        refined = review_stub(draft, ctx=ctx)

    # Final validation (Pydantic + templates requirements)
    allowed = set(ctx.allowed_layouts)
    slides = [s for s in refined.get("slides", []) if isinstance(s, dict) and s.get("layout_key") in allowed]
    valid, errs = validate_deck(slides, ctx.templates)
    if verbose and errs:
        print("[validator] issues:")
        for e in errs[:10]:
            print(" -", e)
        if len(errs) > 10:
            print(f" - ... and {len(errs)-10} more")
    if not valid:
        valid = stub_generate(topic, max_slides=max_slides, lang=lang, ctx=ctx)["slides"]
    return {"slides": valid}
