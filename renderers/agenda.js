(function(){
  registerSlideRenderer("Agenda / Outline Slide", function(slide, { escapeHTML }, { titleHTML }){
    const f = slide.fields || {};
    const items = Array.isArray(f.items) ? f.items : (Array.isArray(f.body) ? f.body : (f.body ? [f.body] : []));
    const list = items.map(x => `<li>${escapeHTML(x)}</li>`).join("");
    return { html: `${titleHTML}<div class="content"><ul class="agenda">${list}</ul></div>` };
  });
})();

