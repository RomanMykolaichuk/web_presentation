(function(){
  registerSlideRenderer("Quote / Key Message Slide", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
    const f = slide.fields || {};
    const quote = escapeHTML(f.quote || f.text || '');
    const author = f.author ? `<footer>— ${escapeHTML(f.author)}</footer>` : '';
    const photo = f.photo && f.photo.src ? `<div class="q-photo"><img src="${getAssetUrl(f.photo.src)}" alt="${escapeHTML(f.photo.alt||'')}"></div>` : '';
    return { html: `${titleHTML}<div class="content quote"><blockquote>${quote}${author}</blockquote>${photo}</div>` };
  });
})();

