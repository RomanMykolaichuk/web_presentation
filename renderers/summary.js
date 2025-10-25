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
  registerSlideRenderer("Summary / Thank You Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const points = Array.isArray(f.points) ? f.points : (f.points ? [f.points] : []);
    const ul = points.length ? `<ul>${points.map(x=>`<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul>` : '';
    const contacts = f.contacts ? `<div class="contacts">${helpers.escapeHTML(f.contacts)}</div>` : '';
    const qr = f.qr && f.qr.src ? `<div class="qr"><img src="${helpers.getAssetUrl(f.qr.src)}" alt="QR"></div>` : '';
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content summary">${ul}${contacts}${qr}<div class="thanks">${helpers.escapeHTML(f.thanks || 'Дякую за увагу!')}</div></div>${decorHTML}` };
  });
})();

