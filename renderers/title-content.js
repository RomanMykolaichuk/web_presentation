(function(){
  registerSlideRenderer("Title and Content", function(slide, helpers, shared){
    const f = slide.fields || {};
    const body = f.body;
    let inner = "";
    if (Array.isArray(body)) {
      inner = `<ul>${body.map(x => `<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul>`;
    } else if (typeof body === "string") {
      inner = `<p>${helpers.escapeHTML(body)}</p>`;
    } else {
      inner = `<p></p>`;
    }
    const side = f.side && f.side.src ? `<img class="side-strip" src="${helpers.getAssetUrl(f.side.src)}" alt="">` : '';
    const classes = f.side && f.side.src ? ["has-side-strip"] : [];
    return { html: `${shared.titleHTML}<div class="content">${inner}</div>${side}`, classes };
  });
})();

