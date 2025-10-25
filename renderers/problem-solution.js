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
  registerSlideRenderer("Problem–Solution Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const probItems = Array.isArray(f.problem) ? f.problem : (f.problem ? [f.problem] : []);
    const solItems = Array.isArray(f.solution) ? f.solution : (f.solution ? [f.solution] : []);
    const prob = `<div class="col"><h3>Проблема</h3><ul>${probItems.map(x=>`<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul></div>`;
    const sol = `<div class="col"><h3>Рішення</h3><ul>${solItems.map(x=>`<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul></div>`;
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content two-col">${prob}${sol}</div>${decorHTML}` };
  });
})();

