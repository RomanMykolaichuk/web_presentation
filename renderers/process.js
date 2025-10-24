(function(){
  registerSlideRenderer("Process / Flow Slide", function(slide, { escapeHTML }, { titleHTML }){
    const f = slide.fields || {};
    const steps = Array.isArray(f.steps) ? f.steps : (f.steps ? [f.steps] : []);
    const items = steps.map((s,i) => `<div class="step"><span class="idx">${i+1}</span><span class="txt">${escapeHTML(s)}</span></div>`).join(`<div class="arrow">→</div>`);
    return { html: `${titleHTML}<div class="content flow">${items}</div>` };
  });
})();

