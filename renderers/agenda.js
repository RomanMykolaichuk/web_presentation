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
  registerSlideRenderer("Agenda / Outline Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const items = Array.isArray(f.items) ? f.items : (Array.isArray(f.body) ? f.body : (f.body ? [f.body] : []));
    const list = items.map(x => `<li>${helpers.escapeHTML(x)}</li>`).join("");
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content"><ul class="agenda">${list}</ul></div>${decorHTML}` };
  });
})();

