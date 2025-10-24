(function(){
  registerSlideRenderer("Markmap Export", function(slide, helpers, shared){
    const f = slide.fields || {};
    const src = helpers.getAssetUrl(f.src || "");
    const style = `${f.w ? `width:${helpers.escapeHTML(f.w)};` : ""}${f.h ? `height:${helpers.escapeHTML(f.h)};` : "height:100%;"}`;
    const center = f.center !== false;
    return { html: `${shared.titleHTML}
      <div class="embed" style="${style}"><iframe src="${src}" allowfullscreen data-center="${center ? 1 : 0}" data-mmexport="1"></iframe></div>` };
  });
})();

