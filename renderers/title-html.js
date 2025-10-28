(function(){
  // Slide: Заголовок + HTML-файл нижче (iframe займає решту слайду)
  // Fields: { title: string, src: string, w?: string, h?: string, allow?: string }
  function uid(){ return 'ih' + Math.random().toString(36).slice(2,9); }
  registerSlideRenderer("Заголовок + HTML", function(slide, { escapeHTML, getAssetUrl }, { titleHTML }){
    const f = slide.fields || {};
    const src = getAssetUrl(f.src || "");
    const style = `${f.w ? `width:${escapeHTML(f.w)};` : ""}${f.h ? `height:${escapeHTML(f.h)};` : "height:100%;"}`;
    const allow = escapeHTML(f.allow || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    const id = uid();
    const html = `${titleHTML}
      <div class=\"embed\" style=\"${style}; overflow:hidden;\">
        <iframe id=\"${id}\" src=\"${src}\" allow=\"${allow}\" allowfullscreen loading=\"lazy\" scrolling=\"no\" style=\"width:100%; height:100%; border:0; display:block; overflow:hidden;\"></iframe>
      </div>
      <script>(function(){
        try{
          var ifr = document.getElementById(${JSON.stringify(id)});
          if (!ifr) return;
          function hideScroll(){
            try{
              var d = ifr.contentDocument; if(!d) return;
              d.documentElement && (d.documentElement.style.overflow='hidden');
              d.body && (d.body.style.overflow='hidden');
              d.body && (d.body.style.margin='0');
            }catch(_){ /* cross-origin or not ready */ }
          }
          ifr.addEventListener('load', function(){ setTimeout(hideScroll, 30); });
          // run once in case it is already loaded
          setTimeout(hideScroll, 100);
        }catch(_){ }
      })();<\/script>`;
    return { html };
  });
})();
