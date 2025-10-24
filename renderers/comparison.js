(function(){
  registerSlideRenderer("Comparison Slide", function(slide, { escapeHTML }, { titleHTML }){
    const f = slide.fields || {};
    const cols = [
      { title: f.a_title || 'A', items: f.a || [] },
      { title: f.b_title || 'B', items: f.b || [] },
      ...(f.c ? [{ title: f.c_title || 'C', items: f.c }] : [])
    ];
    const colHTML = cols.map(c => {
      const items = Array.isArray(c.items) ? c.items : (c.items ? [c.items] : []);
      const li = items.map(x => `<li>${escapeHTML(x)}</li>`).join("");
      return `<div class="cmp-col"><h3>${escapeHTML(c.title)}</h3><ul>${li}</ul></div>`;
    }).join("");
    return { html: `${titleHTML}<div class="content cmp-grid">${colHTML}</div>` };
  });
})();

