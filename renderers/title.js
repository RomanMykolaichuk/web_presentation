(function(){
  registerSlideRenderer("Title Slide", function(slide, helpers, shared){
    const bgUrl = 'logo/title.png';
    const bgImg = `<img class=\"title-bg\" src=\"${bgUrl}\" alt=\"\" onerror=\"this.style.display='none'\">`;
    const bigLogo = `<img class=\"title-logo-big\" src=\"logo/logo.png\" alt=\"\" onerror=\"this.style.display='none'\">`;
    const html = `
      <div class=\"title-hero\">
        ${bgImg}
        <div class=\"title-veil\"></div>
        <div class=\"title-center\">${bigLogo}${shared.titleHTML}${shared.subtitleHTML}</div>
      </div>`;
    return { html, classes: ["title-hero-present"] };
  });
})();
