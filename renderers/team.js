(function(){
  registerSlideRenderer("Team / Organizational Slide", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
    const f = slide.fields || {};
    const people = Array.isArray(f.members) ? f.members : [];
    const grid = people.map(p => {
      const photo = p.photo ? `<img src="${getAssetUrl(p.photo)}" alt="${escapeHTML(p.name||'')}">` : '';
      const name = escapeHTML(p.name || '');
      const role = escapeHTML(p.role || '');
      return `<div class="member">${photo}<div class="name">${name}</div><div class="role">${role}</div></div>`;
    }).join("");
    return { html: `${titleHTML}<div class="content team-grid">${grid}</div>` };
  });
})();

