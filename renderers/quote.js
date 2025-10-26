(function(){
  registerSlideRenderer("Quote / Key Message Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const quote = helpers.escapeHTML(f.quote || f.text || '');
    const author = f.author ? `<footer>- ${helpers.escapeHTML(f.author)}</footer>` : '';
    // Accept both object {src, alt?} and string "image.png"
    let photoHTML = '';
    if (f.photo) {
      let src = null;
      let alt = '';
      if (typeof f.photo === 'string') {
        src = f.photo;
      } else if (typeof f.photo === 'object' && f.photo.src) {
        src = f.photo.src;
        alt = f.photo.alt || '';
      }
      if (src) {
        photoHTML = `<div class="q-photo"><img src="${helpers.getAssetUrl(src)}" alt="${helpers.escapeHTML(alt)}"></div>`;
      }
    }
    return { html: `${titleHTML}<div class="content quote"><blockquote>${quote}${author}</blockquote>${photoHTML}</div>` };
  });
})();

