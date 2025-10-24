(function(){
  registerSlideRenderer("Video Slide", function(slide, helpers, shared){
    const f = slide.fields || {};
    const vids = helpers.asArray(f.videos);
    const media = vids.map(v => {
      const autoplay = v.autoplay !== false;
      const muted = v.muted !== false || autoplay;
      const controls = v.controls === true;
      const loop = v.loop === true;
      const attrs = [
        controls ? "controls" : "",
        autoplay ? "autoplay" : "",
        loop ? "loop" : "",
        muted ? "muted" : "",
        "playsinline",
      ].join(" ");
      const src = helpers.getAssetUrl(v.src);
      return `<div class="media contain"><video ${attrs} src="${src}"></video></div>`;
    }).join("");
    const classes = vids.some(v => v.controls) ? ["video-controls"] : [];
    return { html: `${shared.titleHTML}${media}`, classes };
  });
})();

