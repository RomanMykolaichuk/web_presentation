(function(){
  registerSlideRenderer("Title Slide", function(slide, helpers, shared){
    return { html: `${shared.titleHTML}${shared.subtitleHTML}` };
  });
})();

