(function(){
  registerSlideRenderer("Summary / Thank You Slide", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
    const f = slide.fields || {};
    const points = Array.isArray(f.points) ? f.points : (f.points ? [f.points] : []);
    const ul = points.length ? `<ul>${points.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>` : '';
    const contacts = f.contacts ? `<div class="contacts">${escapeHTML(f.contacts)}</div>` : '';
    const qr = f.qr && f.qr.src ? `<div class="qr"><img src="${getAssetUrl(f.qr.src)}" alt="QR"></div>` : '';
    return { html: `${titleHTML}<div class="content summary">${ul}${contacts}${qr}<div class="thanks">${escapeHTML(f.thanks || 'Дякую за увагу!')}</div></div>` };
  });
})();

