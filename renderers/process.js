(function(){
  registerSlideRenderer("Process / Flow Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const steps = Array.isArray(f.steps) ? f.steps : (f.steps ? [f.steps] : []);
    const items = steps
      .map((s) => `<div class="step"><span class="txt">${helpers.escapeHTML(s)}</span></div>`)
      .join(`<div class="arrow">&rarr;</div>`);
    return { html: `${titleHTML}<div class="content flow">${items}</div>` };
  });
})();
