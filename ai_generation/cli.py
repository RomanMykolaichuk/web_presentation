from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from src.config import load_settings
from src.generator import load_datacontext, agent_generate


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Agentic generator of slide JSON using templates/themes context")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--topic", type=str, help="Topic/title for the presentation")
    g.add_argument("--prompt-file", type=str, help="Path to a text/markdown prompt file (topic/brief)")
    p.add_argument("--data-dir", type=str, default=None, help="Directory containing templates.json and themes.json (defaults to ../data)")
    p.add_argument("--templates", type=str, default=None, help="Explicit path to templates.json (overrides --data-dir)")
    p.add_argument("--themes", type=str, default=None, help="Explicit path to themes.json (overrides --data-dir)")
    p.add_argument("--out", type=str, default=None, help="Output JSON path (defaults to <data-dir>/slides_<slug>.json)")
    p.add_argument("--lang", type=str, default="uk", help="Language hint (uk/en/...) for generation")
    p.add_argument("--max-slides", type=int, default=8, help="Max slides to generate (hint)")
    p.add_argument("--offline", action="store_true", help="Force stub (no network)")
    p.add_argument("--verbose", action="store_true", help="Verbose agent logs")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    settings = load_settings()

    if args.topic:
        topic_text = args.topic
    else:
        topic_path = Path(args.prompt_file)
        topic_text = topic_path.read_text(encoding="utf-8").strip()

    # Resolve data paths
    data_dir = Path(args.data_dir) if args.data_dir else (Path(__file__).resolve().parents[1] / "data")
    templates_path = Path(args.templates) if args.templates else (data_dir / "templates.json")
    themes_path = Path(args.themes) if args.themes else (data_dir / "themes.json")

    if not templates_path.exists():
        raise FileNotFoundError(f"templates.json not found at {templates_path}")
    if not themes_path.exists():
        raise FileNotFoundError(f"themes.json not found at {themes_path}")

    ctx = load_datacontext(templates_path, themes_path)

    # Default output: same folder as templates/themes
    def slugify(s: str) -> str:
        import re as _re
        s = s.lower().strip()
        s = _re.sub(r"[^a-z0-9\u0400-\u04FF]+", "-", s)  # keep latin + cyrillic
        s = _re.sub(r"-+", "-", s).strip("-")
        return s or "generated"

    out_path = Path(args.out) if args.out else (templates_path.parent / f"slides_{slugify(topic_text) or 'generated'}.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        data = agent_generate(
            topic=topic_text,
            max_slides=args.max_slides,
            lang=args.lang,
            api_key=None if args.offline else settings.google_api_key,
            model_name=settings.model,
            ctx=ctx,
            verbose=args.verbose,
        )
    except Exception as e:
        sys.stderr.write(f"[warn] agent failed ({e}); writing stub deck\n")
        data = agent_generate(
            topic=topic_text,
            max_slides=args.max_slides,
            lang=args.lang,
            api_key=None,
            model_name=settings.model,
            ctx=ctx,
            verbose=args.verbose,
        )

    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
