(function(){
  registerSlideRenderer("Text + Image Slide", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
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
    return { html: `${titleHTML}<div class="content two-col">${content}</div>` };
  });
})();
