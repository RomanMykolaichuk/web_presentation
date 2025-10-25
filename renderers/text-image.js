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
  registerSlideRenderer("Text + Image Slide", function(slide, { escapeHTML, getAssetUrl, state }, { titleHTML }){
    const f = slide.fields || {};
    const items = Array.isArray(f.body) ? f.body : (f.body ? [f.body] : []);
    const list = items.map(x => `<li>${escapeHTML(x)}</li>`).join("");
    const img = f.image || f.img || {};
    const pos = (img.pos || 'right').toLowerCase();
    const src = img.src ? getAssetUrl(img.src) : '';
    const alt = escapeHTML(img.alt || '');
    const imageHTML = src ? `<div class="ti-image"><img src="${src}" alt="${alt}"></div>` : "";
    const textHTML = `<div class="ti-text"><ul>${list}</ul></div>`;
    const content = pos === 'left' ? `${imageHTML}${textHTML}` : `${textHTML}${imageHTML}`;
    const decor = pickDecor({ state, getAssetUrl });
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content two-col">${content}</div>${decorHTML}` };
  });
})();
+'{i}'+".")+""+"); cands.push(logo/right")+""+".")+""+"); }
      cands = Array.from(new Set(cands));
      const k = cands[Math.floor(Math.random()*cands.length)];
      if(!k) return '';
      return helpers.getAssetUrl ? helpers.getAssetUrl(k) : k;
    } catch { return ''; }
  }
  registerSlideRenderer("Text + Image Slide", function(slide, { escapeHTML, getAssetUrl, state }, { titleHTML }){
    const f = slide.fields || {};
    const items = Array.isArray(f.body) ? f.body : (f.body ? [f.body] : []);
    const list = items.map(x => `<li>${escapeHTML(x)}</li>`).join("");
    const img = f.image || f.img || {};
    const pos = (img.pos || 'right').toLowerCase();
    const src = img.src ? getAssetUrl(img.src) : '';
    const alt = escapeHTML(img.alt || '');
    const imageHTML = src ? `<div class="ti-image"><img src="${src}" alt="${alt}"></div>` : "";
    const textHTML = `<div class="ti-text"><ul>${list}</ul></div>`;
    const content = pos === 'left' ? `${imageHTML}${textHTML}` : `${textHTML}${imageHTML}`;
    const decor = pickDecor({ state, getAssetUrl });
    const decorHTML = decor ? `<img class="side-decor" src="${decor}" alt="" onerror="this.style.display='none'">` : '';
    return { html: `${titleHTML}<div class="content two-col">${content}</div>${decorHTML}` };
  });
})();
