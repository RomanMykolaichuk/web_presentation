(function(){
    function pickDecor(helpers){
    try {
      const keys = helpers?.state ? Array.from(helpers.state.assets.keys()) : [];
      let cands = keys.filter(k => /^right\\w*\\.(png|jpe?g|webp|svg)$/i.test(k));
      const exts = ['png','jpg','jpeg','webp','svg'];
      for (let i=1;i<=8;i++) for (const e of exts) { cands.push(ssets/right"+'
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
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${shared.titleHTML}<div class="content">${inner}</div>${decorHTML}` };
  });
})();
+'{i}'+".")+""+"); cands.push(logo/right")+""+".")+""+"); }
      cands = Array.from(new Set(cands));
      const k = cands[Math.floor(Math.random()*cands.length)];
      if(!k) return '';
      return helpers.getAssetUrl ? helpers.getAssetUrl(k) : k;
    } catch { return ''; }
  }
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
    const decor = pickDecor(helpers);
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${shared.titleHTML}<div class="content">${inner}</div>${decorHTML}` };
  });
})();
