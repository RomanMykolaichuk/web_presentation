(function(){
  registerSlideRenderer("Team / Organizational Slide", function(slide, helpers, { titleHTML }){
    const f = slide.fields || {};
    const people = Array.isArray(f.members) ? f.members : [];
    const grid = people.map(p => {
      const photoHTML = p.photo ? `<div class="photo"><img src="${helpers.getAssetUrl(p.photo)}" alt="${helpers.escapeHTML(p.name||'')}"></div>` : '';
      const name = helpers.escapeHTML(p.name || '');
      const role = helpers.escapeHTML(p.role || '');
      return `<div class="member">${photoHTML}<div class="name">${name}</div><div class="role">${role}</div></div>`;
    }).join("");
    return { html: `${titleHTML}<div class="content team-grid">${grid}</div>` };
  });
})();
