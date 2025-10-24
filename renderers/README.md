# Slide Renderers

This folder contains modular slide renderers. Each renderer is a small JS file that registers a function for a specific `slide.layout_key` via a global helper.

## How it works
- The registry is defined in `renderers/registry.js` and exposes:
  - `window.SlideRenderers` — a map from `layout_key` to renderer function
  - `window.registerSlideRenderer(key, fn)` — helper to register renderers
  - `SlideRenderers.__default__` — fallback renderer used when a key is unknown
- `app.js` calls the appropriate renderer for each slide and renders its returned HTML inside the slide wrapper, adding any optional classes.

## Renderer signature
A renderer is a function with the signature:

```
registerSlideRenderer("Your Layout Key", function(slide, helpers, shared) {
  // slide: full slide object { layout_key, fields, ... }
  // helpers: { escapeHTML, getAssetUrl, asArray, state }
  // shared:  { titleHTML, subtitleHTML }
  // Return either a string HTML or an object:
  //   { html: string, classes?: string[] }
  const html = `${shared.titleHTML}<div class="content">...</div>`;
  return { html, classes: ["optional-class"] };
});
```

## Add a new layout
1. Create a file under this folder, e.g. `renderers/quote.js`.
2. Register a renderer using the exact `slide.layout_key` string you plan to use:
```
registerSlideRenderer("Quote", (slide, { escapeHTML }, { titleHTML }) => {
  const q = escapeHTML(slide?.fields?.quote || "");
  const a = escapeHTML(slide?.fields?.author || "");
  return { html: `${titleHTML}<blockquote>${q}<footer>${a}</footer></blockquote>` };
});
```
3. Include the script in `index.html` before `app.js`:
```
<script src="renderers/quote.js"></script>
```

## Built-in helpers
- `escapeHTML(str)` — safe escape for text nodes
- `getAssetUrl(src)` — resolves asset URL from the uploaded assets index or `assets/` fallback
- `asArray(v)` — ensures value is an array
- `state` — global application state (read-only recommended)

## Conventions
- One renderer per file, keep it small and focused.
- Keep `layout_key` values human-readable and consistent.
- Prefer using `escapeHTML` for any user-provided content.
- Return additional CSS classes via `{ classes: ["..."] }` only when needed.

## Files here
- `registry.js` — registry and default renderer
- Other `*.js` — per-template renderers registered via `registerSlideRenderer`
