(function(){
  const g = (typeof window !== 'undefined') ? window : globalThis;
  if (!g.SlideRenderers) g.SlideRenderers = {};
  g.registerSlideRenderer = function(key, fn){ g.SlideRenderers[key] = fn; };
  // default renderer key
  if (!g.SlideRenderers.__default__) {
    g.SlideRenderers.__default__ = function(slide, helpers, shared){
      const f = slide.fields || {};
      const body = Array.isArray(f.body)
        ? `<ul>${f.body.map(x => `<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul>`
        : (typeof f.body === "string" ? `<p>${helpers.escapeHTML(f.body)}</p>` : "");
      return { html: `${shared.titleHTML}${shared.subtitleHTML}<div class="content">${body}</div>` };
    };
  }
})();

