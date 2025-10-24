(function(){
  registerSlideRenderer("Problem–Solution Slide", function(slide, { escapeHTML }, { titleHTML }){
    const f = slide.fields || {};
    const probItems = Array.isArray(f.problem) ? f.problem : (f.problem ? [f.problem] : []);
    const solItems = Array.isArray(f.solution) ? f.solution : (f.solution ? [f.solution] : []);
    const prob = `<div class="col"><h3>Проблема</h3><ul>${probItems.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul></div>`;
    const sol = `<div class="col"><h3>Рішення</h3><ul>${solItems.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul></div>`;
    return { html: `${titleHTML}<div class="content two-col">${prob}${sol}</div>` };
  });
})();

