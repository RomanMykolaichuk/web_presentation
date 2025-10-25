(function(){
  function pickDecor(helpers){
    try {
      const keys = helpers && helpers.state ? Array.from(helpers.state.assets.keys()) : [];
      let cands = keys.filter(k => /^right\w*\.(png|jpe?g|webp|svg)$/i.test(k));
      const exts = ['png','jpg','jpeg','webp','svg'];
      for (let i=1;i<=8;i++) for (const e of exts) { cands.push(`assets/right${i}.${e}`); cands.push(`logo/right${i}.${e}`); }
      cands = Array.from(new Set(cands));
      const k = cands[Math.floor(Math.random()*cands.length)];
      return k ? (helpers.getAssetUrl ? helpers.getAssetUrl(k) : k) : '';
    } catch { return ''; }
  }
  registerSlideRenderer("Comparison Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const cols = [
      { title: f.a_title || 'A', items: f.a || [] },
      { title: f.b_title || 'B', items: f.b || [] },
      ...(f.c ? [{ title: f.c_title || 'C', items: f.c }] : [])
    ];
    const colHTML = cols.map(c => {
      const items = Array.isArray(c.items) ? c.items : (c.items ? [c.items] : []);
      const li = items.map(x => `<li>${helpers.escapeHTML(x)}</li>`).join("");
      return `<div class="cmp-col"><h3>${helpers.escapeHTML(c.title)}</h3><ul>${li}</ul></div>`;
    }).join("");
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content cmp-grid">${colHTML}</div>${decorHTML}` };
  });
})();

