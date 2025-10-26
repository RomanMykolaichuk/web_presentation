(function(){
  function isYouTube(url){
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url || "");
  }
  function youTubeId(url){
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.replace(/^\//, "");
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/embed\/([^/?#]+)/);
      if (m) return m[1];
    } catch(_) {}
    return null;
  }

  registerSlideRenderer("Video Slide", function(slide, helpers, shared){
    const f = slide.fields || {};
    const vids = helpers.asArray(f.videos);
    const media = vids.map(v => {
      const srcInput = (v && v.src) || "";
      const autoplay = v && v.autoplay !== false;
      const muted = (v && v.muted !== false) || autoplay;
      const controls = v && v.controls === true;
      const loop = v && v.loop === true;

      if (isYouTube(srcInput)) {
        const id = youTubeId(srcInput);
        if (!id) return "";
        const params = new URLSearchParams();
        if (autoplay) params.set("autoplay", "1");
        if (muted) params.set("mute", "1");
        params.set("controls", controls ? "1" : "0");
        if (loop) { params.set("loop", "1"); params.set("playlist", id); }
        params.set("rel", "0");
        params.set("playsinline", "1");
        params.set("disablekb", "1");
        const embedUrl = `https://www.youtube.com/embed/${id}?${params.toString()}`;
        return `<div class="embed"><iframe tabindex="-1" src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
      }

      const attrs = [
        controls ? "controls" : "",
        autoplay ? "autoplay" : "",
        loop ? "loop" : "",
        muted ? "muted" : "",
        "playsinline",
      ].join(" ");
      const src = helpers.getAssetUrl(srcInput);
      return `<div class="media contain"><video ${attrs} src="${src}"></video></div>`;
    }).join("");
    const classes = vids.some(v => v && v.controls) ? ["video-controls"] : [];
    return { html: `${shared.titleHTML}${media}`, classes };
  });
})();
