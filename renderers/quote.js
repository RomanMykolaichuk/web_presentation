(function(){
  registerSlideRenderer("Quote / Key Message Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const quote = helpers.escapeHTML(f.quote || f.text || '');
    const author = f.author ? `<footer>— ${helpers.escapeHTML(f.author)}</footer>` : '';
    const photo = f.photo && f.photo.src ? `<div class="q-photo"><img src="${helpers.getAssetUrl(f.photo.src)}" alt="${helpers.escapeHTML(f.photo.alt||'')}"></div>` : '';
    return { html: `${titleHTML}<div class="content quote"><blockquote>${quote}${author}</blockquote>${photo}</div>` };
  });
})();
