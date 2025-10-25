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
  registerSlideRenderer("Team / Organizational Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const people = Array.isArray(f.members) ? f.members : [];
    const grid = people.map(p => {
      const photo = p.photo ? `<img src="${helpers.getAssetUrl(p.photo)}" alt="${helpers.escapeHTML(p.name||'')}">` : '';
      const name = helpers.escapeHTML(p.name || '');
      const role = helpers.escapeHTML(p.role || '');
      return `<div class="member">${photo}<div class="name">${name}</div><div class="role">${role}</div></div>`;
    }).join("");
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content team-grid">${grid}</div>${decorHTML}` };
  });
})();

