(function(){
  registerSlideRenderer("Summary / Thank You Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const points = Array.isArray(f.points) ? f.points : (f.points ? [f.points] : []);
    const ul = points.length ? `<ul>${points.map(x=>`<li>${helpers.escapeHTML(x)}</li>`).join("")}</ul>` : '';
    const contacts = f.contacts ? `<div class="contacts">${helpers.escapeHTML(f.contacts)}</div>` : '';
    const qr = f.qr && f.qr.src ? `<div class="qr"><img src="${helpers.getAssetUrl(f.qr.src)}" alt="QR"></div>` : '';
    const thanks = helpers.escapeHTML(f.thanks || 'Дякую за увагу!');
    return { html: `${titleHTML}<div class="content summary">${ul}${contacts}${qr}<div class="thanks">${thanks}</div></div>` };
  });
})();
