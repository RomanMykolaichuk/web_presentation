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
  registerSlideRenderer("Process / Flow Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const steps = Array.isArray(f.steps) ? f.steps : (f.steps ? [f.steps] : []);
    const items = steps.map((s,i) => `<div class="step"><span class="idx">${i+1}</span><span class="txt">${helpers.escapeHTML(s)}</span></div>`).join(`<div class="arrow">→</div>`);
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content flow">${items}</div>${decorHTML}` };
  });
})();

