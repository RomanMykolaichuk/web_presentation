(function(){
  registerSlideRenderer("Chart / Graph Slide", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
    const f = slide.fields || {};
    const img = f.chartImage || f.image || {};
    const src = img.src ? getAssetUrl(img.src) : '';
    const alt = escapeHTML(img.alt || f.title || 'Chart');
    const caption = f.caption ? `<figcaption>${escapeHTML(f.caption)}</figcaption>` : '';
    // Allow explicit height via fields: image.h or h; default 380px
    const height = escapeHTML(img.h || f.h || '380px');
    const figure = src
      ? `<figure class="chart"><img src="${src}" alt="${alt}" style="height:${height};width:auto;object-fit:contain">${caption}</figure>`
      : `<div class="chart placeholder">${escapeHTML(f.placeholder || 'Chart goes here')}</div>`;
    return { html: `${titleHTML}<div class="content">${figure}</div>` };
  });
})();
