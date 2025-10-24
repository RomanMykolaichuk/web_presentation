(function(){
  registerSlideRenderer("Image Only", function(slide, helpers, shared){
    const f = slide.fields || {};
    const imgs = helpers.asArray(f.images);
    const media = imgs.map(img => {
      const fit = (img.fit || "contain").toLowerCase();
      const style = `${img.w ? `width:${helpers.escapeHTML(img.w)};` : ""}${img.h ? `height:${helpers.escapeHTML(img.h)};` : ""}`;
      const src = helpers.getAssetUrl(img.src);
      return `<div class="media ${fit}" style="${style}"><img src="${src}" alt="${helpers.escapeHTML(img.alt || "")}"></div>`;
    }).join("");
    const titlePart = f.title ? shared.titleHTML : "";
    return { html: `${titlePart}${media}` };
  });
})();

