from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


SYSTEM_SPEC = (
    "You are a slide generation agent. Always output strict JSON only. "
    "Never include markdown fences. "
    "Shape: either {\"outline\": [...]} or {\"slides\": [...]}. "
)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```[a-zA-Z]*\n", "", text)
    text = re.sub(r"\n```$", "", text)
    return text.strip()


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
    res = model.generate_content([SYSTEM_SPEC, prompt])
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
    data = json.loads(_strip_code_fences(text))
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
    res = model.generate_content([SYSTEM_SPEC, prompt])
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
    data = json.loads(_strip_code_fences(text))
    if isinstance(data, list):
        data = {"slides": data}
    slides = data.get("slides") if isinstance(data, dict) else None
    if not isinstance(slides, list):
        raise ValueError("Model slides missing or not a list")
    return {"slides": slides}


def agent_generate(topic: str, *, max_slides: int, lang: str, api_key: Optional[str], model_name: str, ctx: DataContext, verbose: bool = False) -> Dict[str, Any]:
    if not api_key:
        if verbose:
            print("[agent] offline stub: no API key")
        return stub_generate(topic, max_slides=max_slides, lang=lang, ctx=ctx)
    try:
        if verbose:
            print("[agent] generating outline via Gemini…")
        outline = generate_outline_with_gemini(api_key, model_name, topic=topic, max_slides=max_slides, lang=lang, ctx=ctx)
    except Exception as e:
        if verbose:
            print(f"[agent] outline failed: {e}; using stub")
        outline = stub_outline(topic, max_slides=max_slides, ctx=ctx)
    try:
        if verbose:
            print("[agent] generating slides via Gemini…")
        data = generate_slides_with_gemini(api_key, model_name, topic=topic, outline=outline, lang=lang, ctx=ctx)
    except Exception as e:
        if verbose:
            print(f"[agent] slides failed: {e}; using stub")
        data = stub_generate(topic, max_slides=max_slides, lang=lang, ctx=ctx)
    allowed = set(ctx.allowed_layouts)
    slides = [s for s in data.get("slides", []) if isinstance(s, dict) and s.get("layout_key") in allowed]
    if not slides:
        slides = stub_generate(topic, max_slides=max_slides, lang=lang, ctx=ctx)["slides"]
    return {"slides": slides}
