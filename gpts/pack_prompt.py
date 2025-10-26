
#!/usr/bin/env python3
# pack_prompt.py
# Build a single prompt bundle that includes: TEMPLATES_JSON, optional EXAMPLE_JSON, and TASK.
# Usage examples:
#   python pack_prompt.py --templates templates.json --topic "AI in Education" --audience "Викладачі" --goal "Ознайомлення" --slides 12
#   python pack_prompt.py --templates templates.json --example slides_example.json --topic "..." --audience "..." --goal "..." --slides 15 --video https://youtube.com/...
#
import json, argparse, sys, os

def read_json_file(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--templates", required=True, help="Path to templates.json")
    ap.add_argument("--example", help="Optional path to an example slides JSON (1–2 slides)")
    ap.add_argument("--topic", required=True)
    ap.add_argument("--audience", required=True)
    ap.add_argument("--goal", required=True)
    ap.add_argument("--slides", type=int, default=12, help="Desired number of slides (10–15 recommended)")
    ap.add_argument("--language", default="uk")
    ap.add_argument("--tone", default="професійно-академічний")
    ap.add_argument("--outline", nargs="*", default=[], help="Optional outline hints, space-separated items")
    ap.add_argument("--needs_video", action="store_true")
    ap.add_argument("--video", default="", help="YouTube URL if needs_video is set")
    ap.add_argument("--image_prefix", default="image_ai_topic_")
    ap.add_argument("--chart_prefix", default="chart_ai_topic_")
    ap.add_argument("--output", default="prompt_bundle.txt", help="Output prompt bundle file")
    args = ap.parse_args()

    # Load templates
    try:
        templates = read_json_file(args.templates)
    except Exception as e:
        print(f"ERROR: cannot read templates: {e}", file=sys.stderr)
        sys.exit(2)

    # Optional example
    example = None
    if args.example:
        try:
            example = read_json_file(args.example)
        except Exception as e:
            print(f"WARNING: cannot read example JSON: {e}", file=sys.stderr)

    # Build TASK object
    task = {
        "topic": args.topic,
        "audience": args.audience,
        "goal": args.goal,
        "duration_slides": args.slides,
        "language": args.language,
        "tone": args.tone,
        "outline_hints": args.outline if args.outline else None,
        "needs_video": bool(args.needs_video),
        "video_url": args.video if args.needs_video else None,
        "image_placeholders_prefix": args.image_prefix,
        "chart_placeholders_prefix": args.chart_prefix,
        "constraints": [
            "Використовувати лише layout_key та поля із TEMPLATES_JSON",
            "Без Markdown/HTML у полях",
            "Короткі, інформативні пункти (3–6 на слайд)",
            "Починати з Title Slide, завершувати Summary / Thank You Slide"
        ]
    }

    # Clean None values
    task = {k: v for k, v in task.items() if v is not None}

    # Assemble prompt bundle text
    header = "=== AI Presentation JSON Generator — PROMPT BUNDLE ===\n"
    body = []
    body.append("TEMPLATES_JSON:\n" + json.dumps(templates, ensure_ascii=False, indent=2))
    if example is not None:
        body.append("EXAMPLE_JSON:\n" + json.dumps(example, ensure_ascii=False, indent=2))
    body.append("TASK:\n" + json.dumps(task, ensure_ascii=False, indent=2))
    body.append("EXPECTED_OUTPUT:\nReturn ONLY a valid JSON array of slides.")
    bundle_text = header + "\n\n".join(body) + "\n"

    # Write out
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(bundle_text)

    print(f"✅ Prompt bundle saved to: {args.output}")

if __name__ == "__main__":
    main()
