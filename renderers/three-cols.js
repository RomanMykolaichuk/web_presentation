(function(){
  registerSlideRenderer("Three Columns Image+Text Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const cols = helpers.asArray(f.columns);
    const colHTML = cols.map(c => {
      const pos = (c && c.imagePos) === 'bottom' ? 'bottom' : 'top';
      const imgPart = c && c.img && c.img.src
        ? `<div class="tc-img"><img src="${helpers.getAssetUrl(c.img.src)}" alt="${helpers.escapeHTML(c.img.alt||'')}"></div>`
        : '';
      const texts = Array.isArray(c?.text) ? c.text : (c && c.text ? [c.text] : []);
      const textHTML = texts.map(t => `<p>${helpers.escapeHTML(t)}</p>`).join("");
      return `<div class="tc-col ${pos}">${pos==='top' ? imgPart+textHTML : textHTML+imgPart}</div>`;
    }).join("");
    return { html: `${titleHTML}<div class="content three-cols">${colHTML}</div>` };
  });
})();

