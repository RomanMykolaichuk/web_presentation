// Р вЂ™Р ВµР В±-Р С—РЎР‚Р ВµР В·Р ВµР Р…РЎвЂљР В°РЎвЂљР С•РЎР‚ Р Р…Р В° РЎвЂЎР С‘РЎРѓРЎвЂљР С•Р СРЎС“ JS. Р СџРЎР‚Р В°РЎвЂ РЎР‹РЎвЂќ Р В»Р С•Р С”Р В°Р В»РЎРЉР Р…Р С• (file://), Р В±Р ВµР В· Р СР ВµРЎР‚Р ВµР В¶Р ВµР Р†Р С‘РЎвЂ¦ Р В·Р В°Р В»Р ВµР В¶Р Р…Р С•РЎРѓРЎвЂљР ВµР в„–.
// Р С™Р С•Р СР ВµР Р…РЎвЂљР В°РЎР‚РЎвЂ“ РЎС“Р С”РЎР‚Р В°РЎвЂ”Р Р…РЎРѓРЎРЉР С”Р С•РЎР‹ Р Т‘Р В»РЎРЏ Р С—РЎвЂ“Р Т‘РЎвЂљРЎР‚Р С‘Р СР С”Р С‘ РЎвЂљР В° РЎР‚Р С•Р В·Р Р†Р С‘РЎвЂљР С”РЎС“.

// ---- Р вЂњР В»Р С•Р В±Р В°Р В»РЎРЉР Р…Р С‘Р в„– РЎРѓРЎвЂљР В°Р Р… Р С—РЎР‚Р С•Р С–РЎР‚Р В°Р СР С‘ ----
const state = {
  slides: [],
  current: 0,
  assets: new Map(), // filename(lowercase) -> { url, file? }
  settings: {
    trustedHTML: false,
    notesVisible: false,
    timerVisible: false,
    slideNumbersVisible: false,
    assetsBaseHref: "assets",
  },
  logoUrl: null,

  timer: {
    startAt: 0,
    elapsed: 0,
    running: false,
    id: null,
  },
  db: null,
  templates: [],
  themes: [],
  activeThemeId: null,
};

// Persistence helpers: keep deck and current index across reloads
function saveDeckToStorage() {
  try {
    localStorage.setItem("savedSlides", JSON.stringify(state.slides || []));
    localStorage.setItem("savedIndex", String(Math.max(0, state.current | 0)));
  } catch (_) {}
}
function saveIndexToStorage() {
  try {
    localStorage.setItem("savedIndex", String(Math.max(0, state.current | 0)));
  } catch (_) {}
}
function loadDeckFromStorage() {
  try {
    const raw = localStorage.getItem("savedSlides");
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || !arr.length) return null;
    const idx = Math.max(
      0,
      Math.min(
        parseInt(localStorage.getItem("savedIndex") || "0", 10) || 0,
        arr.length - 1
      )
    );
    return { slides: arr, index: idx };
  } catch (_) {
    return null;
  }
}

// Р вЂ™Р В±РЎС“Р Т‘Р С•Р Р†Р В°Р Р…РЎвЂ“ Р Т‘Р ВµР СР С•-Р Т‘Р В°Р Р…РЎвЂ“ (РЎР‚Р ВµР В·Р ВµРЎР‚Р Р†Р Р…Р С•, РЎРЏР С”РЎвЂ°Р С• Р Р…Р Вµ Р Р†Р Т‘Р В°РЎРѓРЎвЂљРЎРЉРЎРѓРЎРЏ Р В·РЎвЂЎР С‘РЎвЂљР В°РЎвЂљР С‘ РЎвЂћР В°Р в„–Р В»Р С‘ Р С—Р С•РЎР‚РЎРЏР Т‘)
const DEMO_SLIDES = [
  {
    layout_key: "Title Slide",
    fields: {
      title: "Р вЂ™Р ВµР В±-Р С—РЎР‚Р ВµР В·Р ВµР Р…РЎвЂљР В°РЎвЂљР С•РЎР‚",
      subtitle: "JSON + Р СћР ВµР СР С‘ + Р СљР ВµР Т‘РЎвЂ“Р В°",
      footer: "Р Т‘Р ВµР СР С•",
      notes:
        "Р С™Р С•РЎР‚Р С•РЎвЂљР С”Р В° РЎР‚Р ВµР СР В°РЎР‚Р С”Р В° Р Т‘Р В»РЎРЏ Р Т‘Р С•Р С—Р С•Р Р†РЎвЂ“Р Т‘Р В°РЎвЂЎР В°",
    },
  },
  {
    layout_key: "Title and Content",
    fields: {
      title: "Р СљР С•Р В¶Р В»Р С‘Р Р†Р С•РЎРѓРЎвЂљРЎвЂ“",
      body: [
        "Р РЃР В°Р В±Р В»Р С•Р Р…Р С‘ (CRUD)",
        "Р СћР ВµР СР С‘ (CRUD)",
        "Р С›РЎвЂћР В»Р В°Р в„–Р Р… + USB-Р С”Р В»РЎвЂ“Р С”Р ВµРЎР‚Р С‘",
        "Р СљР ВµР Т‘РЎвЂ“Р В°: Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…Р Р…РЎРЏ/Р Р†РЎвЂ“Р Т‘Р ВµР С•/HTML",
      ],
      footer: "Р Т‘Р ВµР СР С•",
    },
  },
  {
    layout_key: "Image Only",
    fields: {
      title: "Р вЂќРЎР‚Р С•Р Р…",
      images: [
        {
          src: "drone.svg",
          alt: "Р вЂР С—Р вЂєР С’",
          fit: "contain",
          w: "70%",
        },
      ],
    },
  },
];

const DEMO_TEMPLATES = [
  {
    id: "tpl-title",
    name: "Title Slide",
    layout_key: "Title Slide",
    fieldsSchema: {
      title: "string",
      subtitle: "string?",
      footer: "string?",
      notes: "string?",
    },
  },
  {
    id: "tpl-content",
    name: "Title and Content",
    layout_key: "Title and Content",
    fieldsSchema: {
      title: "string",
      body: "string|string[]",
      footer: "string?",
      notes: "string?",
    },
  },
  {
    id: "tpl-image",
    name: "Image Only",
    layout_key: "Image Only",
    fieldsSchema: { title: "string?", images: "[Image]" },
  },
];

const DEMO_THEMES = [
  {
    id: "dark-blue",
    name: "Dark Blue",
    vars: {
      "--bg": "#0e0f13",
      "--fg": "#e9edf1",
      "--accent": "#4da3ff",
      "--muted": "#9aa4af",
      "--card": "#141824",
      "--line": "#2a2f3a",
      fontFamily: "system-ui, Segoe UI, Roboto, Arial, sans-serif",
    },
  },
  {
    id: "light",
    name: "Light",
    vars: {
      "--bg": "#ffffff",
      "--fg": "#121212",
      "--accent": "#005fcc",
      "--muted": "#5b6570",
      "--card": "#f4f6f8",
      "--line": "#d9dee5",
      fontFamily: "system-ui, Segoe UI, Roboto, Arial, sans-serif",
    },
  },
];

// ---- Р Р€РЎвЂљР С‘Р В»РЎвЂ“РЎвЂљР С‘ ----
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHTML(str = "") {
  const pre = document.createElement("pre");
  pre.textContent = String(str);
  return pre.innerHTML;
}

function byFileNameKey(name) {
  return name?.split(/[\\/]/).pop().toLowerCase();
}

function getAssetEntry(src) {
  if (!src) return src;
  const key = byFileNameKey(src);
  if (state.assets.has(key)) return state.assets.get(key);
  return null;
}

function getAssetUrl(src) {
  if (!src) return src;
  const entry = getAssetEntry(src);
  if (entry && entry.url) return entry.url;
  // Р Р‡Р С”РЎвЂ°Р С• Р Р…Р Вµ Р В·Р Р…Р В°Р в„–РЎв‚¬Р В»Р С‘ Р Р† Р СР В°Р С—РЎвЂ“ assets РЎвЂ“ РЎв‚¬Р В»РЎРЏРЎвЂ¦ Р Р…Р Вµ Р В°Р В±РЎРѓР С•Р В»РЎР‹РЎвЂљР Р…Р С‘Р в„– РІР‚вЂќ
  // fallback РЎС“ Р В»Р С•Р С”Р В°Р В»РЎРЉР Р…РЎС“ РЎвЂљР ВµР С”РЎС“ `assets/` Р Т‘Р В»РЎРЏ Р В·РЎР‚РЎС“РЎвЂЎР Р…Р С•РЎРѓРЎвЂљРЎвЂ“ Р Т‘Р ВµР СР С•.
  if (!/^((data|blob|https?|file):)/i.test(src)) {
    if (!src.includes("/")) return `assets/${src}`;
  }
  return src; // РЎРѓР С—РЎР‚Р С•Р В±Р В° Р Р…Р В°Р С—РЎР‚РЎРЏР СРЎС“ (file:// Р Р†РЎвЂ“Р Т‘Р Р…Р С•РЎРѓР Р…Р Вµ Р С—Р С•РЎРѓР С‘Р В»Р В°Р Р…Р Р…РЎРЏ)
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// Override asset URL resolution to support a user-configurable base path.
function getAssetUrl(src) {
  if (!src) return src;
  const entry = getAssetEntry(src);
  if (entry && entry.url) return entry.url;
  const s = String(src);
  // Keep absolute/protocol URLs and rooted paths as-is
  if (/^((data|blob|https?|file):)/i.test(s) || s.startsWith("/")) return s;
  // Build from configured assets base (default 'assets')
  const base = (state.settings.assetsBaseHref || "assets").replace(/\/+$/, "");
  const normalized = s.replace(/^\.\/+/, "");
  if (normalized.startsWith(base + "/")) return normalized;
  return `${base}/${normalized}`;
}

// Discover optional logo at logo/logo.png and cache URL
function discoverLogo() {
  try {
    const url = "logo/logo.png";
    const img = new Image();
    img.onload = () => {
      state.logoUrl = url;
      try {
        renderSlides();
      } catch (_) {}
    };
    img.onerror = () => {};
    img.decoding = "async";
    img.src = url;
  } catch (_) {}
}

// Discover optional title background at logo/title.png
// title/background and side decorations removed

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// ---- IndexedDB (Р С—РЎР‚Р С•РЎРѓРЎвЂљР С‘Р в„– Р С•Р В±Р С–Р С•РЎР‚РЎвЂљР С”Р В°) ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("web-presenter", 1);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains("templates"))
        db.createObjectStore("templates", { keyPath: "id" });
      if (!db.objectStoreNames.contains("themes"))
        db.createObjectStore("themes", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbAll(store) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(store, "readonly");
    const st = tx.objectStore(store);
    const req = st.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
function idbPut(store, value) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(store, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(store).put(value);
  });
}
function idbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(store, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(store).delete(key);
  });
}

// ---- Р СћР вЂўР СљР В ----
function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars || {})) {
    if (k.startsWith("--")) root.style.setProperty(k, v);
  }
  if (theme.vars?.fontFamily)
    root.style.setProperty("--font", theme.vars.fontFamily);
  state.activeThemeId = theme.id;
  localStorage.setItem("activeThemeId", state.activeThemeId);
  // Р СџР С•Р Р†РЎвЂ“Р Т‘Р С•Р СР С‘РЎвЂљР С‘ iframes Р С—РЎР‚Р С• Р В·Р СРЎвЂ“Р Р…РЎС“ РЎвЂљР ВµР СР С‘ (Р Т‘Р В»РЎРЏ markmap export)
  broadcastThemeToIframes();
}

async function loadThemesFromDBOrFile() {
  // Р В·РЎвЂЎР С‘РЎвЂљРЎС“РЎвЂќР СР С•, Р В° Р С—Р С•РЎвЂљРЎвЂ“Р С Р Р…Р В°Р СР В°Р С–Р В°РЎвЂќР СР С•РЎРѓРЎРЉ Р С—РЎвЂ“Р Т‘Р СР ВµРЎР‚Р Т‘Р В¶Р С‘РЎвЂљР С‘ РЎвЂљР Вµ, РЎвЂ°Р С• Р Р† themes.json
  let dbThemes = await idbAll("themes");
  let fileThemes = null;
  try {
    const r = await fetch("data/themes.json");
    if (r.ok) fileThemes = await r.json();
  } catch {}
  if (!dbThemes.length) {
    state.themes = fileThemes?.length ? fileThemes : DEMO_THEMES;
    for (const th of state.themes) await idbPut("themes", th);
  } else {
    // Р СР ВµРЎР‚Р Т‘Р В¶: Р Т‘Р С•Р Т‘Р В°РЎвЂќР СР С• Р Р…Р С•Р Р†РЎвЂ“ Р В· РЎвЂћР В°Р в„–Р В»РЎС“, РЎРЏР С”РЎвЂ°Р С• РЎвЂ”РЎвЂ¦ Р Р…Р ВµР СР В°РЎвЂќ Р Р† IndexedDB
    if (Array.isArray(fileThemes)) {
      const existing = new Set(dbThemes.map((t) => t.id));
      for (const th of fileThemes) {
        if (!existing.has(th.id)) {
          await idbPut("themes", th);
          dbThemes.push(th);
        }
      }
    }
    state.themes = dbThemes;
  }
  const saved = localStorage.getItem("activeThemeId");
  const active = state.themes.find((t) => t.id === saved) || state.themes[0];
  applyTheme(active);
  renderThemesList();
}

// ---- Р РЃР С’Р вЂР вЂєР С›Р СњР В ----
async function loadTemplatesFromDBOrFile() {
  let dbTpl = await idbAll("templates");
  let fileTpl = null;
  try {
    const r = await fetch("data/templates.json");
    if (r.ok) fileTpl = await r.json();
  } catch {}
  if (!dbTpl.length) {
    state.templates = fileTpl?.length ? fileTpl : DEMO_TEMPLATES;
    for (const t of state.templates) await idbPut("templates", t);
  } else {
    if (Array.isArray(fileTpl)) {
      const existing = new Set(dbTpl.map((t) => t.id));
      for (const t of fileTpl) {
        if (!existing.has(t.id)) {
          await idbPut("templates", t);
          dbTpl.push(t);
        }
      }
    }
    state.templates = dbTpl;
  }
  renderTemplatesList();
}

// ---- Р РЋР В»Р В°Р в„–Р Т‘Р С‘: Р В·Р В°Р Р†Р В°Р Р…РЎвЂљР В°Р В¶Р ВµР Р…Р Р…РЎРЏ ----
async function autoLoadSlides() {
  try {
    const restored = loadDeckFromStorage();
    if (restored) {
      state.slides = restored.slides;
      state.current = restored.index;
      renderSlides();
      return;
    }
    const r = await fetch("data/slides_plan.json", { cache: "no-store" });
    if (!r.ok) throw new Error("not ok");
    const json = await r.json();
    setSlides(json);
  } catch (e) {
    // РЎР‚Р ВµР В·Р ВµРЎР‚Р Р†Р Р…Р С‘Р в„– Р Р†Р В°РЎР‚РЎвЂ“Р В°Р Р…РЎвЂљ РІР‚вЂќ Р Т‘Р ВµР СР С•
    setSlides(DEMO_SLIDES);
  }
}

function setSlides(slides) {
  state.slides = Array.isArray(slides) ? slides : [];
  state.current = Math.min(
    Math.max(0, fromHashIndex() ?? 0),
    state.slides.length - 1
  );
  renderSlides();
  saveDeckToStorage();
}

// ---- Р В Р вЂўР СњР вЂќР вЂўР В  Р РЋР вЂєР С’Р в„ўР вЂќР вЂ Р вЂ™ ----
function renderSlides() {
  const cont = $("#slides-container");
  cont.innerHTML = "";
  state.slides.forEach((s, i) => {
    const el = renderSlideElement(s);
    el.dataset.index = i;
    if (i === state.current) el.classList.add("active");
    cont.appendChild(el);
  });
  updateUI();
}

function asArray(v) {
  return Array.isArray(v) ? v : v != null ? [v] : [];
}

function renderSlideElement(slide) {
  const wrap = document.createElement("section");
  wrap.className = "slide";

  const f = slide.fields || {};
  if (f.fullbleed) wrap.classList.add("fullbleed");
  const title = f.title ? `<h1 class="title">${escapeHTML(f.title)}</h1>` : "";
  const subtitle = f.subtitle
    ? `<h2 class="subtitle">${escapeHTML(f.subtitle)}</h2>`
    : "";
  const footerLeft = f.footer
    ? `<div class="left">${escapeHTML(f.footer)}</div>`
    : `<div class="left"></div>`;
  const footerRight = `<div class="right"><span class="timer" data-timer></span></div>`;
  const footer = `<div class="footer">${footerLeft}${footerRight}</div>`;

  // Modular renderers: if registered, delegate rendering and return early
  try {
    const reg = window.SlideRenderers || {};
    const k = (slide.layout_key || "").trim();
    const fn = reg[k] || reg.__default__;
    if (typeof fn === "function") {
      const helpers = { escapeHTML, getAssetUrl, asArray, state };
      const shared = { titleHTML: title, subtitleHTML: subtitle };
      const result = fn(slide, helpers, shared);
      const bodyHTML = typeof result === "string" ? result : result?.html || "";
      const classes =
        typeof result === "object" && Array.isArray(result.classes)
          ? result.classes
          : [];
      classes.forEach((c) => {
        if (c) wrap.classList.add(c);
      });
      wrap.innerHTML = `${bodyHTML}${footer}`;
      // Inject logo mark if configured
      if (state.logoUrl) {
        try {
          wrap.classList.add("has-logo");
        } catch (_) {}
        const mark = document.createElement("img");
        mark.className = "logo-mark";
        mark.src = state.logoUrl;
        mark.alt = "";
        mark.setAttribute("draggable", "false");
        wrap.insertBefore(mark, wrap.firstChild);
      }
      // Optional right side decorative strip
      // side decorations removed

      return wrap;
    }
  } catch (_) {}

  // Render via registry (modular path only)
  const helpers = { escapeHTML, getAssetUrl, asArray, state };
  const shared = { titleHTML: title, subtitleHTML: subtitle };
  {
    const reg = window.SlideRenderers || {};
    const key = (slide.layout_key || "").trim();
    const fn = typeof reg[key] === "function" ? reg[key] : reg.__default__;
    const result =
      typeof fn === "function" ? fn(slide, helpers, shared) : { html: "" };
    const bodyHTML = typeof result === "string" ? result : result?.html || "";
    const classes =
      typeof result === "object" && Array.isArray(result.classes)
        ? result.classes
        : [];
    classes.forEach((c) => {
      if (c) wrap.classList.add(c);
    });
    wrap.innerHTML = `${bodyHTML}${footer}`;
    return wrap;
  }

  let bodyHTML = "";
  switch ((slide.layout_key || "").trim()) {
    case "Title Slide": {
      bodyHTML = `${title}${subtitle}`;
      break;
    }
    case "Title and Content": {
      const body = f.body;
      if (Array.isArray(body)) {
        bodyHTML = `${title}<div class="content"><ul>${body
          .map((x) => `<li>${escapeHTML(x)}</li>`)
          .join("")}</ul></div>`;
      } else if (typeof body === "string") {
        bodyHTML = `${title}<div class="content"><p>${escapeHTML(
          body
        )}</p></div>`;
      } else {
        bodyHTML = `${title}<div class="content"><p></p></div>`;
      }
      break;
    }
    case "Image Only": {
      const imgs = asArray(f.images);
      const media = imgs
        .map((img) => {
          const fit = (img.fit || "contain").toLowerCase();
          const style = `${img.w ? `width:${escapeHTML(img.w)};` : ""}${
            img.h ? `height:${escapeHTML(img.h)};` : ""
          }`;
          const src = getAssetUrl(img.src);
          return `<div class="media ${fit}" style="${style}"><img src="${src}" alt="${escapeHTML(
            img.alt || ""
          )}"></div>`;
        })
        .join("");
      bodyHTML = `${f.title ? title : ""}${media}`;
      break;
    }
    case "Video Slide": {
      const vids = asArray(f.videos);
      const media = vids
        .map((v) => {
          // Р вЂ”Р В° Р В·Р В°Р СР С•Р Р†РЎвЂЎРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏР С: autoplay + muted (Р Т‘Р В»РЎРЏ Р С–Р В°РЎР‚Р В°Р Р…РЎвЂљР С•Р Р†Р В°Р Р…Р С•Р С–Р С• Р В°Р Р†РЎвЂљР С•РЎРѓРЎвЂљР В°РЎР‚РЎвЂљРЎС“ Р Р† Р В±РЎР‚Р В°РЎС“Р В·Р ВµРЎР‚Р В°РЎвЂ¦)
          const autoplay = v.autoplay !== false; // default true
          const muted = v.muted !== false || autoplay; // default true, РЎвЂ“ РЎРЏР С”РЎвЂ°Р С• autoplay РІР‚вЂќ Р С•Р В±Р С•Р Р†'РЎРЏР В·Р С”Р С•Р Р†Р С• muted
          const controls = v.controls === true; // Р В·Р В° Р С—Р С•РЎвЂљРЎР‚Р ВµР В±Р С‘
          const loop = v.loop === true;
          const attrs = [
            controls ? "controls" : "",
            autoplay ? "autoplay" : "",
            loop ? "loop" : "",
            muted ? "muted" : "",
            "playsinline",
          ].join(" ");
          const src = getAssetUrl(v.src);
          return `<div class="media contain"><video ${attrs} src="${src}"></video></div>`;
        })
        .join("");
      bodyHTML = `${title}${media}`;
      if (vids.some((v) => v.controls)) wrap.classList.add("video-controls");
      break;
    }
    case "IFrame": {
      const src = getAssetUrl(f.src || "");
      const style = `${f.w ? `width:${escapeHTML(f.w)};` : ""}${
        f.h ? `height:${escapeHTML(f.h)};` : "height:100%;"
      }`;
      const center = f.center !== false; // Р В·Р В° Р В·Р В°Р СР С•Р Р†РЎвЂЎРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏР С РЎвЂ Р ВµР Р…РЎвЂљРЎР‚РЎС“РЎвЂќР СР С• Р Р†Р СРЎвЂ“РЎРѓРЎвЂљ, РЎРЏР С”РЎвЂ°Р С• Р СР С•Р В¶Р В»Р С‘Р Р†Р С•
      if (f.pannable) {
        bodyHTML = `${title}
          <div class="embed pan-container" style="${style}" data-pannable>
            <div class="pan-content"><iframe src="${src}" allowfullscreen data-center="${
          center ? 1 : 0
        }"></iframe></div>
          </div>`;
      } else {
        bodyHTML = `${title}
          <div class="embed" style="${style}"><iframe src="${src}" allowfullscreen data-center="${
          center ? 1 : 0
        }"></iframe></div>`;
      }
      break;
    }
    case "Markmap Export": {
      // Р РЋР С—Р ВµРЎвЂ РЎвЂ“Р В°Р В»РЎРЉР Р…Р С‘Р в„– РЎРѓР В»Р В°Р в„–Р Т‘ Р Т‘Р В»РЎРЏ HTML, Р ВµР С”РЎРѓР С—Р С•РЎР‚РЎвЂљР С•Р Р†Р В°Р Р…Р С‘РЎвЂ¦ Р В· markmap
      const src = getAssetUrl(f.src || "");
      const style = `${f.w ? `width:${escapeHTML(f.w)};` : ""}${
        f.h ? `height:${escapeHTML(f.h)};` : "height:100%;"
      }`;
      const center = f.center !== false;
      bodyHTML = `${title}
        <div class="embed" style="${style}"><iframe src="${src}" allowfullscreen data-center="${
        center ? 1 : 0
      }" data-mmexport="1"></iframe></div>`;
      break;
    }
    case "Mindmap": {
      // Р СњР В°РЎвЂљР С‘Р Р†Р Р…Р С‘Р в„– РЎР‚Р ВµР Р…Р Т‘Р ВµРЎР‚ mindmap Р В±Р ВµР В· iframe
      // Р СџРЎвЂ“Р Т‘РЎвЂљРЎР‚Р С‘Р СРЎС“РЎвЂќ: fields.mm_tree (JSON-Р Т‘Р ВµРЎР‚Р ВµР Р†Р С•) Р В°Р В±Р С• fields.src (JSON-РЎвЂћР В°Р в„–Р В» РЎС“ assets)
      const src = f.src ? getAssetUrl(f.src) : "";
      const mmData = f.mm_tree ? JSON.stringify(f.mm_tree) : "";
      const dataScript = mmData
        ? `<script type=\"application/json\" class=\"mm-data\">${mmData.replace(
            /</g,
            "\\u003c"
          )}</script>`
        : "";
      bodyHTML = `${title}
        <div class=\"mindmap\" data-mindmap ${
          src ? `data-src=\"${src}\"` : ""
        }></div>${dataScript}`;
      break;
    }
    case "Custom": {
      const html = typeof f.html === "string" ? f.html : "";
      const safe = state.settings.trustedHTML ? html : escapeHTML(html);
      bodyHTML = `${title}<div class="content">${safe}</div>`;
      break;
    }
    default: {
      // Р СњР ВµР Р†РЎвЂ“Р Т‘Р С•Р СР С‘Р в„– Р СР В°Р С”Р ВµРЎвЂљ РІР‚вЂќ РЎР‚Р ВµР Р…Р Т‘Р ВµРЎР‚ Р В±Р В°Р В·Р С•Р Р†Р С•
      const body = f.body;
      const content = Array.isArray(body)
        ? `<ul>${body.map((x) => `<li>${escapeHTML(x)}</li>`).join("")}</ul>`
        : typeof body === "string"
        ? `<p>${escapeHTML(body)}</p>`
        : "";
      bodyHTML = `${title}${subtitle}<div class="content">${content}</div>`;
    }
  }

  wrap.innerHTML = `${bodyHTML}${footer}`;
  return wrap;
}

function updateUI() {
  const slides = $$(".slide");
  slides.forEach((el, i) => {
    el.classList.toggle("active", i === state.current);
    let badge = el.querySelector(".slide-number");
    const total = slides.length;
    if (state.settings.slideNumbersVisible) {
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "slide-number";
        el.appendChild(badge);
      }
      badge.textContent = `${i + 1} / ${total}`;
      badge.style.display = "";
    } else if (badge) {
      badge.style.display = "none";
    }
  });
  const total = slides.length;
  const counter = $("#counter");
  counter.textContent = `${total ? state.current + 1 : 0} / ${total}`;
  const prog = $("#progress-bar");
  prog.style.width = total
    ? `${(state.current / (total - 1 || 1)) * 100}%`
    : "0%";
  // Р СњР С•РЎвЂљР В°РЎвЂљР С”Р С‘ Р Т‘Р В»РЎРЏ Р В°Р С”РЎвЂљР С‘Р Р†Р Р…Р С•Р С–Р С• РЎРѓР В»Р В°Р в„–Р Т‘РЎС“
  const notesBlock = $("#notes");
  const slide = state.slides[state.current] || {};
  const notes = slide?.fields?.notes || "";
  notesBlock.textContent = notes || "";
  notesBlock.classList.toggle(
    "visible",
    state.settings.notesVisible && !!notes
  );
  // Р СћР В°Р в„–Р СР ВµРЎР‚ Р С—Р С•Р С”Р В°Р В· РЎС“ РЎвЂћРЎС“РЎвЂљР ВµРЎР‚РЎвЂ“
  $$("[data-timer]").forEach((el) => {
    el.textContent = state.settings.timerVisible
      ? fmtTime(state.timer.elapsed)
      : "";
  });
  // Р С›Р Р…Р С•Р Р†Р С‘РЎвЂљР С‘ hash
  setHashIndex(state.current);
  // Р С™Р ВµРЎР‚РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р С—РЎР‚Р С•Р С–РЎР‚Р В°Р Р†Р В°Р Р…Р Р…РЎРЏР С Р Р†РЎвЂ“Р Т‘Р ВµР С•
  updateMediaPlayback();
  // Р СџР С•РЎРѓР С‘Р В»Р С‘РЎвЂљР С‘ РЎвЂ“ Р Р†РЎвЂ“Р Т‘РЎвЂ Р ВµР Р…РЎвЂљРЎР‚Р С‘РЎР‚РЎС“Р Р†Р В°РЎвЂљР С‘ iframe Р Р…Р В° Р В°Р С”РЎвЂљР С‘Р Р†Р Р…Р С•Р СРЎС“ РЎРѓР В»Р В°Р в„–Р Т‘РЎвЂ“ (Р В·Р В° Р С—Р С•РЎвЂљРЎР‚Р ВµР В±Р С‘)
  mmEnhanceIframes();
  // Р вЂ Р Р…РЎвЂ“РЎвЂ РЎвЂ“Р В°Р В»РЎвЂ“Р В·РЎС“Р Р†Р В°РЎвЂљР С‘ Р Р…Р В°РЎвЂљР С‘Р Р†Р Р…РЎвЂ“ mindmap Р Р…Р В° Р В°Р С”РЎвЂљР С‘Р Р†Р Р…Р С•Р СРЎС“ РЎРѓР В»Р В°Р в„–Р Т‘РЎвЂ“
  initActiveMindmaps();
}

// ---- Р СњР В°Р Р†РЎвЂ“Р С–Р В°РЎвЂ РЎвЂ“РЎРЏ ----
function nextSlide() {
  goTo(Math.min(state.current + 1, state.slides.length - 1));
}
function prevSlide() {
  goTo(Math.max(state.current - 1, 0));
}
function firstSlide() {
  goTo(0);
}
function lastSlide() {
  goTo(Math.max(0, state.slides.length - 1));
}
function goTo(i) {
  if (i === state.current) return;
  state.current = i;
  updateUI();
  saveIndexToStorage();
}

// URL hash (#3) РІвЂ вЂ™ РЎвЂ“Р Р…Р Т‘Р ВµР С”РЎРѓ 0-based
function fromHashIndex() {
  const h = window.location.hash.slice(1);
  const n = parseInt(h, 10);
  if (!Number.isNaN(n) && n > 0) return n - 1;
  return null;
}
let suppressHash = false;
function setHashIndex(i) {
  suppressHash = true;
  window.location.hash = `#${i + 1}`;
  setTimeout(() => (suppressHash = false), 0);
}

window.addEventListener("hashchange", () => {
  if (suppressHash) return;
  const idx = fromHashIndex();
  if (idx != null) goTo(Math.max(0, Math.min(idx, state.slides.length - 1)));
});

// ---- Р СџР С•Р Р†Р Р…Р С‘Р в„– Р ВµР С”РЎР‚Р В°Р Р… / blackout ----
function toggleFullscreen() {
  if (!document.fullscreenElement)
    document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}
function toggleBlackout() {
  $("#blackout").classList.toggle("hidden");
}

// ---- Р СћР В°Р в„–Р СР ВµРЎР‚ ----
function toggleTimer() {
  state.settings.timerVisible = !state.settings.timerVisible;
  if (state.settings.timerVisible && !state.timer.running) startTimer();
  if (!state.settings.timerVisible && state.timer.running) stopTimer();
  updateUI();
}
function startTimer() {
  state.timer.running = true;
  state.timer.startAt = performance.now() - state.timer.elapsed * 1000;
  state.timer.id = setInterval(() => {
    state.timer.elapsed = (performance.now() - state.timer.startAt) / 1000;
    updateUI();
  }, 250);
}
function stopTimer() {
  state.timer.running = false;
  clearInterval(state.timer.id);
  state.timer.id = null;
}
function resetTimer() {
  state.timer.elapsed = 0;
  state.timer.startAt = performance.now();
  updateUI();
}

// ---- Р С›Р С–Р В»РЎРЏР Т‘ РЎвЂљР В° Р Т‘Р С•Р Р†РЎвЂ“Р Т‘Р С”Р В° ----
function openOverlay(id) {
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}
function closeOverlay(id) {
  const el = document.getElementById(id);
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
}
function toggleOverview() {
  const id = "overview";
  const el = document.getElementById(id);
  if (el.classList.contains("hidden")) {
    buildOverview();
    openOverlay(id);
  } else {
    closeOverlay(id);
  }
}
function toggleHelp() {
  const id = "help";
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
  el.setAttribute("aria-hidden", String(el.classList.contains("hidden")));
}

function buildOverview() {
  const grid = $("#overview-grid");
  grid.innerHTML = "";
  state.slides.forEach((s, i) => {
    const li = document.createElement("div");
    li.className = "thumb";
    const title =
      s.fields?.title || s.layout_key || `Р РЋР В»Р В°Р в„–Р Т‘ ${i + 1}`;
    const first = Array.isArray(s.fields?.body)
      ? s.fields.body[0]
      : typeof s.fields?.body === "string"
      ? s.fields.body
      : "";
    li.innerHTML = `<div class="mini">${escapeHTML(
      title
    )}</div><h4>${escapeHTML(title)}</h4><p>${escapeHTML(first || "")}</p>`;
    li.addEventListener("click", () => {
      closeOverlay("overview");
      goTo(i);
    });
    grid.appendChild(li);
  });
}

// ---- Р вЂ™РЎвЂ“Р Т‘Р ВµР С•: Р В°Р Р†РЎвЂљР С•Р С—Р В»Р ВµР в„–/Р С—Р В°РЎС“Р В·Р С‘ Р С—РЎР‚Р С‘ Р Р…Р В°Р Р†РЎвЂ“Р С–Р В°РЎвЂ РЎвЂ“РЎвЂ” ----
function updateMediaPlayback() {
  const slides = $$(".slide");
  slides.forEach((slideEl, i) => {
    const vids = $$("video", slideEl);
    vids.forEach((v) => {
      try {
        if (i === state.current) {
          // Р В·Р В°Р В±Р ВµР В·Р С—Р ВµРЎвЂЎР С‘РЎвЂљР С‘ muted Р Т‘Р В»РЎРЏ Р В°Р Р†РЎвЂљР С•Р С—Р В»Р ВµРЎР‹
          if (v.hasAttribute("autoplay") && !v.muted) v.muted = true;
          const p = v.play?.();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          v.pause?.();
        }
      } catch {}
    });
  });
}

// ---- Р вЂ Р СР С—Р С•РЎР‚РЎвЂљ JSON (slides) ----
async function handleSlidesFile(file) {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    setSlides(json);
    firstSlide();
    saveDeckToStorage();
  } catch (e) {
    alert(
      "Р СњР Вµ Р Р†Р Т‘Р В°Р В»Р С•РЎРѓРЎРЏ Р С—РЎР‚Р С•РЎвЂЎР С‘РЎвЂљР В°РЎвЂљР С‘ JSON: " +
        e.message
    );
  }
}

// ---- Р СџР В°Р С—Р С”Р В° assets ----
async function addAssetsFromFileList(fileList) {
  for (const file of fileList) {
    const key = byFileNameKey(file.name);
    // РЎвЂћРЎвЂ“Р В»РЎРЉРЎвЂљРЎР‚РЎС“РЎвЂќР СР С• РЎвЂљР С‘Р С—Р С‘ Р В·Р С•Р В±РЎР‚Р В°Р В¶Р ВµР Р…РЎРЉ/Р Р†РЎвЂ“Р Т‘Р ВµР С•
    if (
      /\.(png|jpg|jpeg|gif|webp|svg|mp4|webm|ogg|html|htm|json)$/i.test(key)
    ) {
      const url = URL.createObjectURL(file);
      state.assets.set(key, { url, file });
    } else {
      // Р В·Р В±Р ВµРЎР‚РЎвЂ“Р С–Р В°РЎвЂќР СР С• РЎРЏР С” Р Р…Р ВµР Р†РЎвЂ“Р Т‘Р С•Р СР С‘Р в„–, Р В°Р В»Р Вµ Р В· Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р Р…Р С‘Р С URL
      const url = URL.createObjectURL(file);
      state.assets.set(key, { url, file });
    }
  }
  // Р С•Р Р…Р С•Р Р†Р В»Р ВµР Р…Р Р…РЎРЏ Р В°Р С”РЎвЂљР С‘Р Р†Р Р…Р С•Р С–Р С• РЎРѓР В»Р В°Р в„–Р Т‘РЎС“ (Р Т‘Р В»РЎРЏ Р С—РЎвЂ“Р Т‘РЎРѓРЎвЂљР В°Р Р…Р С•Р Р†Р С”Р С‘ URL)
  updateUI();
}

// Drag&drop Р Т‘Р В»РЎРЏ JSON РЎвЂљР В° assets
function setupDragDrop() {
  const dropHint = $("#drop-hint");
  const root = document.body;
  let dragCounter = 0;
  function showHint() {
    dropHint.style.display = "block";
  }
  function hideHint() {
    dropHint.style.display = "none";
  }
  ["dragenter", "dragover"].forEach((ev) => {
    root.addEventListener(ev, (e) => {
      e.preventDefault();
      dragCounter++;
      showHint();
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    root.addEventListener(ev, (e) => {
      e.preventDefault();
      dragCounter = Math.max(0, dragCounter - 1);
      if (dragCounter === 0) hideHint();
    });
  });
  root.addEventListener("drop", async (e) => {
    const items = e.dataTransfer.items;
    const files = e.dataTransfer.files;
    // Р Р‡Р С”РЎвЂ°Р С• РЎвЂќ JSON РІР‚вЂќ РЎвЂЎР С‘РЎвЂљР В°РЎвЂќР СР С• РЎРЏР С” Р С—Р В»Р В°Р Р… РЎРѓР В»Р В°Р в„–Р Т‘РЎвЂ“Р Р†, РЎР‚Р ВµРЎв‚¬РЎвЂљРЎС“ Р Т‘Р С•Р Т‘Р В°РЎвЂќР СР С• РЎРЏР С” assets
    const jsonFile = Array.from(files).find((f) => /\.json$/i.test(f.name));
    if (jsonFile) await handleSlidesFile(jsonFile);
    await addAssetsFromFileList(files);
  });
}

// ---- Templates CRUD UI ----
function renderTemplatesList(activeId) {
  const list = $("#tpl-list");
  list.innerHTML = "";
  state.templates.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.name} (${t.layout_key})`;
    li.dataset.id = t.id;
    if (t.id === activeId) li.classList.add("active");
    li.addEventListener("click", () => fillTemplateForm(t.id));
    list.appendChild(li);
  });
}
function fillTemplateForm(id) {
  const t = state.templates.find((x) => x.id === id) || {
    id: "",
    name: "",
    layout_key: "",
    fieldsSchema: {},
  };
  const form = $("#tpl-form");
  form.id.value = t.id;
  form.name.value = t.name;
  form.layout_key.value = t.layout_key;
  form.fieldsSchema.value = JSON.stringify(t.fieldsSchema || {}, null, 2);
  renderTemplatesList(t.id);
}
async function saveTemplateFromForm(e) {
  e.preventDefault();
  const form = e.target;
  try {
    const t = {
      id: form.id.value.trim() || crypto.randomUUID(),
      name: form.name.value.trim() || "",
      layout_key: form.layout_key.value.trim() || "",
      fieldsSchema: JSON.parse(form.fieldsSchema.value || "{}"),
    };
    const idx = state.templates.findIndex((x) => x.id === t.id);
    if (idx >= 0) state.templates[idx] = t;
    else state.templates.push(t);
    await idbPut("templates", t);
    renderTemplatesList(t.id);
    alert("Р вЂ”Р В±Р ВµРЎР‚Р ВµР В¶Р ВµР Р…Р С•");
  } catch (err) {
    alert(
      "Р СџР С•Р СР С‘Р В»Р С”Р В° Р В·Р В±Р ВµРЎР‚Р ВµР В¶Р ВµР Р…Р Р…РЎРЏ: " +
        err.message
    );
  }
}
async function deleteTemplate() {
  const id = $("#tpl-form").id.value.trim();
  if (!id) return;
  await idbDelete("templates", id);
  state.templates = state.templates.filter((t) => t.id !== id);
  renderTemplatesList();
  fillTemplateForm("");
}
function previewTemplate() {
  const form = $("#tpl-form");
  const name = form.name.value || "Р РЃР В°Р В±Р В»Р С•Р Р…";
  const layout_key = form.layout_key.value || "Title and Content";
  const prev = $("#tpl-preview-area");
  const slide = {
    layout_key,
    fields: {
      title: name,
      body: ["РџРѕРїРµСЂРµРґРЅС–Р№ РїРµСЂРµРіР»СЏРґ"],
      footer: "",
    },
  };
  if (layout_key === "Title and Content") {
    slide.fields.side = { src: "assets/right1.jpg" };
  }
  prev.innerHTML = "";
  const el = renderSlideElement(slide);
  el.style.position = "static";
  el.style.display = "block";
  el.style.width = "100%";
  el.style.aspectRatio = "auto";
  prev.appendChild(el);
}
function exportTemplates() {
  downloadJSON("templates.json", state.templates);
}
function importTemplatesFromFile(file) {
  file
    .text()
    .then((txt) => JSON.parse(txt))
    .then(async (json) => {
      if (!Array.isArray(json))
        throw new Error(
          "Р С›РЎвЂЎРЎвЂ“Р С”РЎС“РЎвЂќРЎвЂљРЎРЉРЎРѓРЎРЏ Р СР В°РЎРѓР С‘Р Р†"
        );
      // replace all
      state.templates = json;
      // Р С•РЎвЂЎР С‘РЎРѓРЎвЂљР С”Р В° РЎвЂ“ Р В·Р В°Р С—Р С‘РЎРѓ
      const tx = state.db.transaction("templates", "readwrite");
      const st = tx.objectStore("templates");
      st.clear();
      json.forEach((x) => st.put(x));
      return new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
    })
    .then(() => {
      renderTemplatesList();
      alert("Р вЂ Р СР С—Р С•РЎР‚РЎвЂљР С•Р Р†Р В°Р Р…Р С•");
    })
    .catch((e) =>
      alert(
        "Р СџР С•Р СР С‘Р В»Р С”Р В° РЎвЂ“Р СР С—Р С•РЎР‚РЎвЂљРЎС“: " +
          e.message
      )
    );
}

// ---- Themes CRUD UI ----
function renderThemesList(activeId) {
  const list = $("#th-list");
  list.innerHTML = "";
  state.themes.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.name}`;
    li.dataset.id = t.id;
    if (t.id === activeId || t.id === state.activeThemeId)
      li.classList.add("active");
    li.addEventListener("click", () => fillThemeForm(t.id));
    list.appendChild(li);
  });
}
function fillThemeForm(id) {
  const t = state.themes.find((x) => x.id === id) || {
    id: "",
    name: "",
    vars: {},
  };
  const form = $("#th-form");
  form.id.value = t.id;
  form.name.value = t.name;
  form.vars.value = JSON.stringify(t.vars || {}, null, 2);
  renderThemesList(t.id);
}
async function saveThemeFromForm(e) {
  e.preventDefault();
  const form = e.target;
  try {
    const t = {
      id: form.id.value.trim() || crypto.randomUUID(),
      name: form.name.value.trim() || "",
      vars: JSON.parse(form.vars.value || "{}"),
    };
    const idx = state.themes.findIndex((x) => x.id === t.id);
    if (idx >= 0) state.themes[idx] = t;
    else state.themes.push(t);
    await idbPut("themes", t);
    renderThemesList(t.id);
    alert("Р вЂ”Р В±Р ВµРЎР‚Р ВµР В¶Р ВµР Р…Р С•");
  } catch (err) {
    alert(
      "Р СџР С•Р СР С‘Р В»Р С”Р В° Р В·Р В±Р ВµРЎР‚Р ВµР В¶Р ВµР Р…Р Р…РЎРЏ: " +
        err.message
    );
  }
}
async function deleteTheme() {
  const id = $("#th-form").id.value.trim();
  if (!id) return;
  await idbDelete("themes", id);
  state.themes = state.themes.filter((t) => t.id !== id);
  renderThemesList();
  fillThemeForm("");
}
function applyThemeFromForm() {
  const id = $("#th-form").id.value.trim();
  const th = state.themes.find((t) => t.id === id);
  if (th) applyTheme(th);
}
function exportThemes() {
  downloadJSON("themes.json", state.themes);
}
function importThemesFromFile(file) {
  file
    .text()
    .then((txt) => JSON.parse(txt))
    .then(async (json) => {
      if (!Array.isArray(json))
        throw new Error(
          "Р С›РЎвЂЎРЎвЂ“Р С”РЎС“РЎвЂќРЎвЂљРЎРЉРЎРѓРЎРЏ Р СР В°РЎРѓР С‘Р Р†"
        );
      state.themes = json;
      const tx = state.db.transaction("themes", "readwrite");
      const st = tx.objectStore("themes");
      st.clear();
      json.forEach((x) => st.put(x));
      return new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
    })
    .then(() => {
      renderThemesList();
      alert("Р вЂ Р СР С—Р С•РЎР‚РЎвЂљР С•Р Р†Р В°Р Р…Р С•");
    })
    .catch((e) =>
      alert(
        "Р СџР С•Р СР С‘Р В»Р С”Р В° РЎвЂ“Р СР С—Р С•РЎР‚РЎвЂљРЎС“: " +
          e.message
      )
    );
}

// ---- Р СџР С•Р Т‘РЎвЂ“РЎвЂ” РЎвЂљР В° РЎвЂ“Р Р…РЎвЂ“РЎвЂ РЎвЂ“Р В°Р В»РЎвЂ“Р В·Р В°РЎвЂ РЎвЂ“РЎРЏ ----
function setupUI() {
  // Р В¤Р В°Р в„–Р В»Р С‘
  $("#btn-open-json").addEventListener("click", () => $("#input-json").click());
  $("#input-json").addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f) handleSlidesFile(f);
  });

  $("#btn-open-assets").addEventListener("click", () => {
    const current = state.settings.assetsBaseHref || "assets";
    const val = prompt(
      "Вкажіть URL/шлях до папки assets (відносний або абсолютний)",
      current
    );
    if (typeof val === "string" && val.trim()) {
      state.settings.assetsBaseHref = val.trim();
      try {
        localStorage.setItem("assetsBaseHref", state.settings.assetsBaseHref);
      } catch (_) {}
      renderSlides();
    }
  });
  $("#input-assets").addEventListener("change", (e) =>
    addAssetsFromFileList(e.target.files || [])
  );

  // Р С›Р С–Р В»РЎРЏР Т‘, Р Т‘Р С•Р Р†РЎвЂ“Р Т‘Р С”Р В°, Р В¤Р РЋ
  $("#btn-overview").addEventListener("click", toggleOverview);
  $("#close-overview").addEventListener("click", () =>
    closeOverlay("overview")
  );
  $("#btn-help").addEventListener("click", toggleHelp);
  $("#close-help").addEventListener("click", () => closeOverlay("help"));
  $("#btn-fullscreen").addEventListener("click", toggleFullscreen);

  // Hide UI in fullscreen: toggle a class on body
  const onFsChange = () => {
    document.body.classList.toggle(
      "is-fullscreen",
      !!document.fullscreenElement
    );
  };
  document.addEventListener("fullscreenchange", onFsChange);
  // Safari/WebKit compatibility
  document.addEventListener("webkitfullscreenchange", onFsChange);

  // Р СњР С•РЎвЂљР В°РЎвЂљР С”Р С‘, Р Т‘Р С•Р Р†РЎвЂ“РЎР‚Р ВµР Р…Р С‘Р в„– HTML
  const toggleNotes = $("#toggle-notes");
  const toggleTrusted = $("#toggle-trusted");
  let toggleNumbers = $("#toggle-slide-numbers");
  if (!toggleNumbers) {
    const right = document.querySelector(".topbar .right");
    if (right) {
      const lbl = document.createElement("label");
      lbl.className = "toggle";
      lbl.innerHTML =
        '<input id="toggle-slide-numbers" type="checkbox"> Номери слайдів';
      right.appendChild(lbl);
      toggleNumbers = lbl.querySelector("input");
    }
  }
  state.settings.notesVisible = localStorage.getItem("notesVisible") === "1";
  state.settings.trustedHTML = localStorage.getItem("trustedHTML") === "1";
  state.settings.assetsBaseHref =
    localStorage.getItem("assetsBaseHref") || state.settings.assetsBaseHref || "assets";
  state.settings.slideNumbersVisible =
    localStorage.getItem("slideNumbersVisible") === "1";
  toggleNotes.checked = state.settings.notesVisible;
  toggleTrusted.checked = state.settings.trustedHTML;
  if (toggleNumbers) toggleNumbers.checked = state.settings.slideNumbersVisible;
  toggleNotes.addEventListener("change", () => {
    state.settings.notesVisible = toggleNotes.checked;
    localStorage.setItem("notesVisible", toggleNotes.checked ? "1" : "0");
    updateUI();
  });
  toggleTrusted.addEventListener("change", () => {
    state.settings.trustedHTML = toggleTrusted.checked;
    localStorage.setItem("trustedHTML", toggleTrusted.checked ? "1" : "0");
    renderSlides();
  });
  if (toggleNumbers)
    toggleNumbers.addEventListener("change", () => {
      state.settings.slideNumbersVisible = toggleNumbers.checked;
      localStorage.setItem(
        "slideNumbersVisible",
        toggleNumbers.checked ? "1" : "0"
      );
      updateUI();
    });

  // Templates modal
  $("#btn-templates").addEventListener("click", () =>
    openOverlay("templates-modal")
  );
  $("#close-templates").addEventListener("click", () =>
    closeOverlay("templates-modal")
  );
  $("#tpl-new").addEventListener("click", () => fillTemplateForm(""));
  $("#tpl-form").addEventListener("submit", saveTemplateFromForm);
  $("#tpl-delete").addEventListener("click", deleteTemplate);
  $("#tpl-preview").addEventListener("click", previewTemplate);
  $("#tpl-export").addEventListener("click", exportTemplates);
  $("#tpl-import").addEventListener("click", () => $("#tpl-file").click());
  $("#tpl-file").addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f) importTemplatesFromFile(f);
  });

  // Themes modal
  $("#btn-themes").addEventListener("click", () => openOverlay("themes-modal"));
  $("#close-themes").addEventListener("click", () =>
    closeOverlay("themes-modal")
  );
  $("#th-new").addEventListener("click", () => fillThemeForm(""));
  $("#th-form").addEventListener("submit", saveThemeFromForm);
  $("#th-delete").addEventListener("click", deleteTheme);
  $("#th-apply").addEventListener("click", applyThemeFromForm);
  $("#th-export").addEventListener("click", exportThemes);
  $("#th-import").addEventListener("click", () => $("#th-file").click());
  $("#th-file").addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f) importThemesFromFile(f);
  });

  // Р С™Р В»Р В°Р Р†РЎвЂ“Р В°РЎвЂљРЎС“РЎР‚Р В°
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    const tag = (e.target && (e.target.tagName || "")).toLowerCase();
    if (["input", "textarea"].includes(tag)) return; // Р Р…Р Вµ Р В·Р В°Р Р†Р В°Р В¶Р В°РЎвЂљР С‘ Р Р†Р Р†Р С•Р Т‘Р С‘РЎвЂљР С‘
    if (["ArrowRight", " ", "PageDown", "Enter"].includes(k)) {
      nextSlide();
      e.preventDefault();
    } else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) {
      prevSlide();
      e.preventDefault();
    } else if (k === "Home") {
      firstSlide();
      e.preventDefault();
    } else if (k === "End") {
      lastSlide();
      e.preventDefault();
    } else if (k.toLowerCase() === "f") {
      toggleFullscreen();
      e.preventDefault();
    } else if (k.toLowerCase() === "b" || k === ".") {
      toggleBlackout();
      e.preventDefault();
    } else if (k.toLowerCase() === "t") {
      toggleTimer();
      e.preventDefault();
    } else if (k.toLowerCase() === "r") {
      resetTimer();
      e.preventDefault();
    } else if (k.toLowerCase() === "o") {
      toggleOverview();
      e.preventDefault();
    } else if (k === "?" || (k.toLowerCase() === "/" && e.shiftKey)) {
      toggleHelp();
      e.preventDefault();
    } else if (k.toLowerCase() === "n") {
      $("#toggle-notes").click();
      e.preventDefault();
    }
  });
  // Р вЂ Р Р…РЎвЂ“РЎвЂ РЎвЂ“Р В°Р В»РЎвЂ“Р В·Р В°РЎвЂ РЎвЂ“РЎРЏ Р С—Р В°Р Р…Р С•РЎР‚Р В°Р СРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р Т‘Р В»РЎРЏ Р Р†Р В±РЎС“Р Т‘Р С•Р Р†Р В°Р Р…Р С‘РЎвЂ¦ Р С•Р В±Р В»Р В°РЎРѓРЎвЂљР ВµР в„–
  initPannable();
}

// ---- Р РЋРЎвЂљР В°РЎР‚РЎвЂљ ----
async function main() {
  setupUI();
  setupDragDrop();
  state.db = await openDB();
  await Promise.all([loadTemplatesFromDBOrFile(), loadThemesFromDBOrFile()]);
  await autoLoadSlides();
  discoverLogo();
  // РЎвЂ“Р Р…РЎвЂ“РЎвЂ РЎвЂ“Р В°Р В»РЎвЂ“Р В·РЎС“Р Р†Р В°РЎвЂљР С‘ Р С—Р В°Р Р…Р С•РЎР‚Р В°Р СРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р С—РЎвЂ“РЎРѓР В»РЎРЏ РЎР‚Р ВµР Р…Р Т‘Р ВµРЎР‚Р В°
  initPannable();
}

document.addEventListener("DOMContentLoaded", main);

// ---- Р СџР В°Р Р…Р С•РЎР‚Р В°Р СРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р СР С‘РЎв‚¬Р ВµРЎР‹ Р Т‘Р В»РЎРЏ iframe/Р Р†Р СРЎвЂ“РЎРѓРЎвЂљРЎС“ ----
function initPannable() {
  // Р вЂ™РЎвЂ“РЎв‚¬Р В°РЎвЂќР СР С• Р С•Р В±РЎР‚Р С•Р В±Р Р…Р С‘Р С”Р С‘ Р С•Р Т‘Р С‘Р Р… РЎР‚Р В°Р В· Р Р…Р В° Р С”Р С•Р Р…РЎвЂљР ВµР в„–Р Р…Р ВµРЎР‚, Р Т‘Р ВµР В»Р ВµР С–РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏР С
  if (initPannable._init) return;
  initPannable._init = true;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;
  let targetCont = null;
  document.addEventListener("mousedown", (e) => {
    const cont = e.target.closest(".pan-container[data-pannable]");
    if (!cont) return;
    dragging = true;
    targetCont = cont;
    startX = e.clientX;
    startY = e.clientY;
    const x = parseFloat(
      getComputedStyle(cont).getPropertyValue("--pan-x") || "0"
    );
    const y = parseFloat(
      getComputedStyle(cont).getPropertyValue("--pan-y") || "0"
    );
    origX = isNaN(x) ? 0 : x;
    origY = isNaN(y) ? 0 : y;
    cont.classList.add("grabbing");
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging || !targetCont) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    targetCont.style.setProperty("--pan-x", `${origX + dx}px`);
    targetCont.style.setProperty("--pan-y", `${origY + dy}px`);
  });
  document.addEventListener("mouseup", () => {
    if (targetCont) targetCont.classList.remove("grabbing");
    dragging = false;
    targetCont = null;
  });
  document.addEventListener("mouseleave", () => {
    if (targetCont) targetCont.classList.remove("grabbing");
    dragging = false;
    targetCont = null;
  });
  document.addEventListener("dblclick", (e) => {
    const cont = e.target.closest(".pan-container[data-pannable]");
    if (!cont) return;
    cont.style.setProperty("--pan-x", `0px`);
    cont.style.setProperty("--pan-y", `0px`);
  });
}

// ---- Р В¦Р ВµР Р…РЎвЂљРЎР‚РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ iframeРІР‚вЂР С”Р С•Р Р…РЎвЂљР ВµР Р…РЎвЂљРЎС“ (same-origin file:// only) ----
async function enhanceAndCenterActiveIframes() {
  const active = document.querySelector(".slide.active");
  if (!active) return;
  const iframes = active.querySelectorAll('iframe[data-center="1"]');
  iframes.forEach(async (ifr) => {
    // Р С›Р Т‘Р С‘Р Р… РЎР‚Р В°Р В· Р Р…Р В° iframe: РЎРѓР С—РЎР‚Р С•Р В±Р В° Р В·Р В°Р Р†Р В°Р Р…РЎвЂљР В°Р В¶Р С‘РЎвЂљР С‘ HTML РЎвЂљР В° Р Р†РЎРѓРЎвЂљР В°Р Р†Р С‘РЎвЂљР С‘ РЎвЂЎР ВµРЎР‚Р ВµР В· srcdoc РЎвЂ“Р В· РЎвЂ Р ВµР Р…РЎвЂљРЎР‚РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏР С РЎвЂ“ Р С—РЎР‚Р С•Р С”Р С‘Р Т‘Р С”Р С•РЎР‹ Р С”Р В»Р В°Р Р†РЎвЂ“РЎв‚¬
    if (!ifr._enhanced) {
      const src = ifr.getAttribute("src");
      try {
        const res = await fetch(src, { cache: "no-store" });
        if (res.ok) {
          let html = await res.text();
          const baseHref = new URL(src, location.href).toString();
          (function () {
            const css = getComputedStyle(document.documentElement);
            const bg = (css.getPropertyValue("--bg") || "#ffffff").trim();
            const fg = (css.getPropertyValue("--fg") || "#121212").trim();
            const accent = (
              css.getPropertyValue("--accent") || "#0aa3b8"
            ).trim();
            const muted = (css.getPropertyValue("--muted") || "#808080").trim();
            function hexToRgb(h) {
              const m = h.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
              if (!m) return { r: 255, g: 255, b: 255 };
              return {
                r: parseInt(m[1], 16),
                g: parseInt(m[2], 16),
                b: parseInt(m[3], 16),
              };
            }
            const { r, g, b } = hexToRgb(bg);
            const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            const isLight = lum > 0.6;
            const mmCSS =
              `:root{--bg:${bg};--fg:${fg};--accent:${accent};--muted:${muted}}\n` +
              `html,body{background:var(--bg) !important;color:var(--fg) !important}` +
              `svg text{fill:var(--fg) !important}` +
              `path, line{stroke:${
                isLight ? "#94a3b8" : "#2a2f3a"
              } !important}` +
              `circle{fill:var(--accent) !important}`;
            const injectHead = `\n<base href="${baseHref}">\n<style>\n${mmCSS}\nhtml,body{height:100%;margin:0;overflow:hidden}\n#fitwrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--s,1));transform-origin:center center;display:inline-block}\nsvg,canvas{max-width:100%;max-height:100%;height:auto;width:auto;display:block;margin:auto}\n</style>\n<script>(function(){\n  // РЎвЂљР ВµР СР В° markmap: Р Т‘Р С•Р Т‘Р В°РЎвЂљР С‘/Р В·Р Р…РЎРЏРЎвЂљР С‘ Р С”Р В»Р В°РЎРѓ Р В·Р В°Р В»Р ВµР В¶Р Р…Р С• Р Р†РЎвЂ“Р Т‘ РЎвЂљР ВµР СР С‘ Р В±Р В°РЎвЂљРЎРЉР С”РЎвЂ“Р Р†РЎРѓРЎРЉР С”Р С•Р С–Р С• Р Т‘Р С•Р С”РЎС“Р СР ВµР Р…РЎвЂљР В°\n  try{document.documentElement.classList.toggle('markmap-dark', ${"${isLight?0:1}"}==1);}catch(_){ }\n  // Р С—РЎР‚Р С•Р С”Р С‘Р Т‘Р В°Р Р…Р Р…РЎРЏ Р С”Р В»Р В°Р Р†РЎвЂ“РЎв‚¬ РЎС“ Р В±Р В°РЎвЂљРЎРЉР С”РЎвЂ“Р Р†РЎРѓРЎРЉР С”Р С‘Р в„– Р Т‘Р С•Р С”РЎС“Р СР ВµР Р…РЎвЂљ\n  window.addEventListener('keydown',function(e){try{parent.postMessage({__pptNav:true,key:e.key,shift:e.shiftKey,alt:e.altKey,ctrl:e.ctrlKey},'*')}catch(_){}});\n  function fit(){try{var wrap=document.getElementById('fitwrap');if(!wrap)return;wrap.style.setProperty('--s',1);var w=wrap.scrollWidth||1,h=wrap.scrollHeight||1;var s=Math.min(window.innerWidth/w,window.innerHeight/h);wrap.style.setProperty('--s',s);}catch(_){}}\n  function init(){try{var wrap=document.createElement('div');wrap.id='fitwrap';while(document.body.firstChild){wrap.appendChild(document.body.firstChild);}document.body.appendChild(wrap);fit();window.addEventListener('resize',fit);}catch(_){}}\n  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);\n})();</script>`;
            window.__INJECT_HEAD__ = injectHead; // debug
          })();
          const injectHead = window.__INJECT_HEAD__;
          if (html.includes("</head>"))
            html = html.replace("</head>", injectHead + "\n</head>");
          else html = `<head>${injectHead}</head>` + html;
          ifr.srcdoc = html;
        }
      } catch (_) {
        /* РЎвЂ“Р С–Р Р…Р С•РЎР‚РЎС“РЎвЂќР СР С•, Р В·Р В°Р В»Р С‘РЎв‚¬Р В°РЎвЂќР СР С• src РЎРЏР С” РЎвЂќ */
      }
      ifr._enhanced = true;
    }

    if (ifr._centerInit) return; // РЎвЂ Р ВµР Р…РЎвЂљРЎР‚РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р Т‘Р В»РЎРЏ Р Р†Р С‘Р С—Р В°Р Т‘Р С”РЎС“ Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—РЎС“ Р Т‘Р С• DOM
    const tryCenter = () => {
      try {
        const doc = ifr.contentDocument || ifr.contentWindow?.document;
        if (!doc) return;
        const style = doc.createElement("style");
        style.textContent = `html,body{height:100%;margin:0} body{display:flex;align-items:center;justify-content:center;}
          svg{max-width:100%;max-height:100%;height:auto;width:auto;display:block;margin:auto}`;
        doc.head?.appendChild(style);
        const svg = doc.querySelector("svg");
        if (svg) {
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
          const vb = svg.getAttribute("viewBox");
          if (!vb) {
            try {
              const bb = svg.getBBox();
              svg.setAttribute(
                "viewBox",
                `0 0 ${Math.max(1, bb.width)} ${Math.max(1, bb.height)}`
              );
            } catch {}
          }
        }
      } catch {}
    };
    ifr.addEventListener("load", tryCenter, { once: true });
    tryCenter();
    ifr._centerInit = true;
  });
}

// Р СџРЎР‚Р С‘Р в„–Р С•Р С Р С—Р С•Р Р†РЎвЂ“Р Т‘Р С•Р СР В»Р ВµР Р…РЎРЉ Р В· iframe Р Т‘Р В»РЎРЏ Р Р…Р В°Р Р†РЎвЂ“Р С–Р В°РЎвЂ РЎвЂ“РЎвЂ” (Р С”Р С•Р В»Р С‘ РЎвЂћР С•Р С”РЎС“РЎРѓ Р Р†РЎРѓР ВµРЎР‚Р ВµР Т‘Р С‘Р Р…РЎвЂ“ iframe)
window.addEventListener("message", (e) => {
  const m = e.data;
  if (!m || !m.__pptNav) return;
  const k = (m.key || "").toString();
  if (["ArrowRight", " ", "PageDown", "Enter"].includes(k)) nextSlide();
  else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) prevSlide();
  else if (k === "Home") firstSlide();
  else if (k === "End") lastSlide();
  else if (k.toLowerCase && k.toLowerCase() === "f") toggleFullscreen();
  else if (k.toLowerCase && (k.toLowerCase() === "b" || k === "."))
    toggleBlackout();
  else if (k.toLowerCase && k.toLowerCase() === "t") toggleTimer();
  else if (k.toLowerCase && k.toLowerCase() === "r") resetTimer();
  else if (k.toLowerCase && k.toLowerCase() === "o") toggleOverview();
  else if (k === "?" || (k.toLowerCase && k.toLowerCase() === "/" && m.shift))
    toggleHelp();
  else if (k.toLowerCase && k.toLowerCase() === "n") {
    const tn = document.getElementById("toggle-notes");
    tn && tn.click();
  }
});

function getComputedThemeVars() {
  const css = getComputedStyle(document.documentElement);
  return {
    bg: (css.getPropertyValue("--bg") || "#ffffff").trim(),
    card: (css.getPropertyValue("--card") || "#ffffff").trim(),
    fg: (css.getPropertyValue("--fg") || "#121212").trim(),
    accent: (css.getPropertyValue("--accent") || "#0aa3b8").trim(),
    muted: (css.getPropertyValue("--muted") || "#808080").trim(),
  };
}

function isDarkColor(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
  if (!m) return false;
  const r = parseInt(m[1], 16),
    g = parseInt(m[2], 16),
    b = parseInt(m[3], 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.55;
}

function broadcastThemeToIframes() {
  const vars = getComputedThemeVars();
  const theme = {
    bg: vars.bg,
    card: vars.card,
    fg: vars.fg,
    accent: vars.accent,
    muted: vars.muted,
    isDark: isDarkColor(vars.card || vars.bg),
  };
  document
    .querySelectorAll("iframe[data-center], iframe[data-mmexport]")
    .forEach((ifr) => {
      try {
        ifr.contentWindow?.postMessage({ __mmTheme: theme }, "*");
      } catch {}
    });
}

// Р СњР С•Р Р†Р В°, РЎРѓРЎвЂљРЎвЂ“Р в„–Р С”Р В° РЎР‚Р ВµР В°Р В»РЎвЂ“Р В·Р В°РЎвЂ РЎвЂ“РЎРЏ Р С—РЎвЂ“Р Т‘Р Р†Р В°Р Р…РЎвЂљР В°Р В¶Р ВµР Р…Р Р…РЎРЏ РЎвЂ“ РЎвЂ Р ВµР Р…РЎвЂљРЎР‚РЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ Р ВµР С”РЎРѓР С—Р С•РЎР‚РЎвЂљР С•Р Р†Р В°Р Р…Р С‘РЎвЂ¦ HTML РЎС“ iframe
async function mmEnhanceIframes() {
  const active = document.querySelector(".slide.active");
  if (!active) return;
  const iframes = active.querySelectorAll('iframe[data-center="1"]');
  for (const ifr of iframes) {
    if (!ifr._mmHandled) {
      const src = ifr.getAttribute("src") || "";
      try {
        let html = null;
        const entry = getAssetEntry(src);
        if (entry?.file) html = await entry.file.text();
        else {
          const res = await fetch(src, { cache: "no-store" });
          if (res.ok) html = await res.text();
        }
        if (html != null) {
          const css = getComputedStyle(document.documentElement);
          const bg = (css.getPropertyValue("--bg") || "#ffffff").trim();
          const fg = (css.getPropertyValue("--fg") || "#121212").trim();
          const accent = (css.getPropertyValue("--accent") || "#0aa3b8").trim();
          const muted = (css.getPropertyValue("--muted") || "#808080").trim();
          function hexToRgb(h) {
            const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || "");
            if (!m) return { r: 255, g: 255, b: 255 };
            return {
              r: parseInt(m[1], 16),
              g: parseInt(m[2], 16),
              b: parseInt(m[3], 16),
            };
          }
          const { r, g, b } = hexToRgb(bg);
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const isLight = lum > 0.6;
          const baseHref = new URL(src, location.href).toString();
          const inj = `\n<base href="${baseHref}">\n<meta charset=\"utf-8\">\n<style>\n:root{--bg:${bg};--fg:${fg};--accent:${accent};--muted:${muted}}\nhtml,body{height:100%;margin:0;background:var(--bg);color:var(--fg);overflow:hidden}\n#mindmap, svg#mindmap{width:100% !important;height:100% !important;display:block}\nsvg{width:100% !important;height:100% !important;display:block}\n</style>\n<script>(function(){\n  try{document.documentElement.classList.toggle('markmap-dark', ${
            isLight ? 0 : 1
          }==1);}catch(_){ }\n  window.addEventListener('keydown',function(e){try{parent.postMessage({__pptNav:true,key:e.key,shift:e.shiftKey,alt:e.altKey,ctrl:e.ctrlKey},'*')}catch(_){}});\n  function fit(){try{ if(window.mm && typeof window.mm.fit==='function'){ window.mm.fit(); } }catch(_){}}\n  window.addEventListener('load', function(){ setTimeout(fit, 50); });\n  window.addEventListener('resize', function(){ setTimeout(fit, 50); });\n})();</script>`;
          if (html.includes("</head>"))
            html = html.replace("</head>", inj + "\n</head>");
          else html = `<head>${inj}</head>` + html;
          ifr.removeAttribute("src");
          ifr.srcdoc = html;
          // Р вЂќР С•Р Т‘Р В°РЎвЂљР С”Р С•Р Р†Р С• Р С—РЎвЂ“РЎРѓР В»РЎРЏ Р В·Р В°Р Р†Р В°Р Р…РЎвЂљР В°Р В¶Р ВµР Р…Р Р…РЎРЏ: РЎРѓР В»РЎС“РЎвЂ¦Р В°РЎвЂЎ РЎвЂљР ВµР СР С‘ РЎвЂљР В° РЎвЂћР С•РЎР‚РЎРѓ РЎРѓРЎвЂљР С‘Р В»РЎвЂ“Р Р† РЎвЂљР ВµР С”РЎРѓРЎвЂљРЎС“
          ifr.addEventListener(
            "load",
            () => {
              try {
                const d = ifr.contentDocument;
                if (!d) return;
                const st = d.createElement("style");
                st.textContent =
                  "svg text{fill:var(--fg) !important;opacity:1 !important}";
                d.head && d.head.appendChild(st);
                const sc = d.createElement("script");
                sc.textContent =
                  "window.addEventListener('message',function(e){var m=e.data;if(!m||!m.__mmTheme)return;try{var v=m.__mmTheme;var r=document.documentElement;r.style.setProperty('--bg',v.bg);r.style.setProperty('--card',v.card||v.bg);r.style.setProperty('--fg',v.fg);r.style.setProperty('--accent',v.accent);r.style.setProperty('--muted',v.muted);document.documentElement.classList.toggle('markmap-dark',!!v.isDark);if(window.mm&&window.mm.fit) setTimeout(function(){window.mm.fit()},30);}catch(_){}});";
                d.head && d.head.appendChild(sc);
                // Р С•Р Т‘РЎР‚Р В°Р В·РЎС“ Р Р…Р В°Р Т‘РЎвЂ“РЎРѓР В»Р В°РЎвЂљР С‘ Р С—Р С•РЎвЂљР С•РЎвЂЎР Р…РЎС“ РЎвЂљР ВµР СРЎС“
                broadcastThemeToIframes();
              } catch {}
            },
            { once: true }
          );
        }
      } catch {}
      ifr._mmHandled = true;
    }
  }
}

// ---- Mindmap (Р Р…Р В°РЎвЂљР С‘Р Р†Р Р…Р С‘Р в„– SVG Р В±Р ВµР В· iframe) ----
function initActiveMindmaps() {
  const active = document.querySelector(".slide.active");
  if (!active) return;
  const containers = active.querySelectorAll(".mindmap[data-mindmap]");
  containers.forEach(async (el) => {
    if (el._inited) return;
    el._inited = true;
    let data = null;
    const inline = active.querySelector("script.mm-data");
    if (inline?.textContent?.trim()) {
      try {
        data = JSON.parse(inline.textContent);
      } catch {}
    }
    if (!data && el.dataset.src) {
      try {
        const res = await fetch(el.dataset.src, { cache: "no-store" });
        if (res.ok) data = await res.json();
      } catch {}
    }
    if (!data) {
      // Р СљРЎвЂ“Р Р…РЎвЂ“Р СР В°Р В»РЎРЉР Р…Р В° Р В·Р В°Р С–Р В»РЎС“РЎв‚¬Р С”Р В°
      data = {
        text: "Mindmap",
        children: [
          { text: "Р СџРЎС“Р Р…Р С”РЎвЂљ 1" },
          { text: "Р СџРЎС“Р Р…Р С”РЎвЂљ 2" },
        ],
      };
    }
    renderMindmap(el, data);
  });
}

function renderMindmap(rootEl, tree) {
  // Р вЂ”РЎвЂЎР С‘РЎвЂљРЎС“РЎвЂќР СР С• Р С”Р С•Р В»РЎРЉР С•РЎР‚Р С‘ РЎвЂљР ВµР СР С‘
  const css = getComputedStyle(document.documentElement);
  const COLORS = {
    bg: css.getPropertyValue("--card").trim() || "#141824",
    fg: css.getPropertyValue("--fg").trim() || "#e9edf1",
    line: css.getPropertyValue("--line").trim() || "#2a2f3a",
    accent: css.getPropertyValue("--accent").trim() || "#4da3ff",
  };
  rootEl.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "mm-svg");
  svg.setAttribute("role", "img");
  svg.style.width = "100%";
  svg.style.height = "100%";
  const gp = document.createElementNS(svgNS, "g");
  gp.setAttribute("class", "mm-viewport");
  svg.appendChild(gp);
  rootEl.appendChild(svg);

  // Р вЂєР ВµР в„–Р В°РЎС“РЎвЂљ: Р С—РЎР‚Р С•РЎРѓРЎвЂљР Вµ РЎР‚Р С•Р В·Р СРЎвЂ“РЎвЂ°Р ВµР Р…Р Р…РЎРЏ Р Р†РЎС“Р В·Р В»РЎвЂ“Р Р† Р В»РЎвЂ“Р Р†Р С•РЎР‚РЎС“РЎвЂЎ/Р С—РЎР‚Р В°Р Р†Р С•РЎР‚РЎС“РЎвЂЎ Р Р†РЎвЂ“Р Т‘ Р С”Р С•РЎР‚Р ВµР Р…РЎРЏ
  const V_GAP = 44,
    H_GAP = 140;
  const nodes = [];
  const links = [];
  const sizeOf = (text) => {
    const len = (text || "").length;
    const w = Math.max(110, len * 9 + 30);
    return [w, 32];
  };
  function addNode(x, y, text, depth, side, parentIdx) {
    const sz = sizeOf(text);
    const idx = nodes.push({ x, y, text, sz, depth, side }) - 1;
    if (parentIdx != null) links.push([parentIdx, idx]);
    return idx;
  }
  const rootIdx = addNode(0, 0, tree.text || "Mindmap", 0, 0, null);
  const children = Array.isArray(tree.children) ? tree.children : [];
  const left = children.slice(0, Math.ceil(children.length / 2));
  const right = children.slice(Math.ceil(children.length / 2));
  function layoutSide(arr, side, parentIdx, parentW) {
    const baseY = -((arr.length - 1) * V_GAP) / 2;
    arr.forEach((n, i) => {
      const [w, h] = sizeOf(n.text);
      const x = (side > 0 ? 1 : -1) * (parentW / 2 + H_GAP + w / 2);
      const y = baseY + i * V_GAP;
      const idx = addNode(x, y, n.text, 1, side, parentIdx);
      const ch = Array.isArray(n.children) ? n.children : [];
      const baseY2 = y - ((ch.length - 1) * V_GAP) / 2;
      ch.forEach((c, j) => {
        const [cw, chh] = sizeOf(c.text);
        const xx = x + (side > 0 ? 1 : -1) * (H_GAP + cw / 2 + w / 2);
        const yy = baseY2 + j * V_GAP;
        const idx2 = addNode(xx, yy, c.text, 2, side, idx);
      });
    });
  }
  const rootW = nodes[rootIdx].sz[0];
  layoutSide(left, -1, rootIdx, rootW);
  layoutSide(right, 1, rootIdx, rootW);

  // Р В Р ВµР Р…Р Т‘Р ВµРЎР‚ Р В»РЎвЂ“Р Р…Р С”РЎвЂ“Р Р†
  const gLinks = document.createElementNS(svgNS, "g");
  gLinks.setAttribute("class", "mm-links");
  links.forEach(([a, b]) => {
    const A = nodes[a],
      B = nodes[b];
    const x1 = A.x + (A.side >= 0 ? A.sz[0] / 2 : -A.sz[0] / 2),
      y1 = A.y;
    const x2 = B.x + (B.side >= 0 ? -B.sz[0] / 2 : B.sz[0] / 2),
      y2 = B.y;
    const mx = (x1 + x2) / 2;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
    );
    path.setAttribute("stroke", COLORS.line);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    gLinks.appendChild(path);
  });
  gp.appendChild(gLinks);

  // Р В Р ВµР Р…Р Т‘Р ВµРЎР‚ Р Р†РЎС“Р В·Р В»РЎвЂ“Р Р†
  const gNodes = document.createElementNS(svgNS, "g");
  gNodes.setAttribute("class", "mm-nodes");
  nodes.forEach((n, i) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute(
      "transform",
      `translate(${n.x - n.sz[0] / 2}, ${n.y - n.sz[1] / 2})`
    );
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("width", n.sz[0]);
    rect.setAttribute("height", n.sz[1]);
    rect.setAttribute("rx", "6");
    rect.setAttribute("ry", "6");
    rect.setAttribute(
      "fill",
      i === 0 ? shade(COLORS.bg, 0.08) : shade(COLORS.bg, 0.02)
    );
    rect.setAttribute("stroke", COLORS.line);
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "10");
    text.setAttribute("y", String(n.sz[1] / 2 + 1));
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", COLORS.fg);
    text.textContent = n.text;
    g.appendChild(rect);
    g.appendChild(text);
    gNodes.appendChild(g);
  });
  gp.appendChild(gNodes);

  // Р В¤РЎвЂ“РЎвЂљ РЎС“ Р Р†РЎвЂ“Р С”Р Р…Р С• + Р С—Р В°Р Р…Р С•РЎР‚Р В°Р СРЎС“Р Р†Р В°Р Р…Р Р…РЎРЏ/Р В·РЎС“Р С
  let scale = 1,
    tx = 0,
    ty = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function apply() {
    gp.setAttribute("transform", `translate(${tx},${ty}) scale(${scale})`);
  }
  function fit() {
    try {
      const bb = gp.getBBox();
      const w = rootEl.clientWidth,
        h = rootEl.clientHeight;
      const sx = (w - 32) / (bb.width || 1),
        sy = (h - 32) / (bb.height || 1);
      scale = clamp(Math.min(sx, sy), 0.2, 3);
      const cx = bb.x + bb.width / 2,
        cy = bb.y + bb.height / 2;
      tx = w / 2 - cx * scale;
      ty = h / 2 - cy * scale;
      apply();
    } catch {
      /* ignore */
    }
  }
  fit();
  let drag = false,
    sx = 0,
    sy = 0,
    stx = 0,
    sty = 0;
  svg.addEventListener("mousedown", (e) => {
    drag = true;
    sx = e.clientX;
    sy = e.clientY;
    stx = tx;
    sty = ty;
  });
  window.addEventListener("mousemove", (e) => {
    if (!drag) return;
    tx = stx + (e.clientX - sx);
    ty = sty + (e.clientY - sy);
    apply();
  });
  window.addEventListener("mouseup", () => {
    drag = false;
  });
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const nx = (px - tx) / scale,
        ny = (py - ty) / scale;
      const ns = clamp(scale * factor, 0.2, 3);
      tx = px - nx * ns;
      ty = py - ny * ns;
      scale = ns;
      apply();
    },
    { passive: false }
  );
  window.addEventListener("resize", fit);

  function shade(hex, amt) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
    if (!m) return hex;
    const c = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].map(
      (v) =>
        clamp(v + (amt > 0 ? 1 : -1) * Math.round(255 * Math.abs(amt)), 0, 255)
    );
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  }
}
