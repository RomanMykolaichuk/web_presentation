(function(){
  // "Давайте порахуємо" slide: left text with task, right interactive calculator
  // Fields:
  // - title: string?
  // - task: string | string[]
  // - footer, notes: optional (handled by the shell)
  function uid(){
    return 'c' + Math.random().toString(36).slice(2, 9);
  }

  function sanitizeExpr(s){
    // Allow digits, operators, parentheses, dot, percent, whitespace
    let t = String(s || '').replace(/,/g, '.').replace(/\s+/g, '');
    if (!/^[-+/*()%\.0-9^]*$/.test(t)) return null;
    // Replace caret with exponentiation
    t = t.replace(/\^/g, '**');
    return t;
  }

  function renderCalc(id){
    return `
      <div class="calc-widget" id="${id}" aria-label="Калькулятор">
        <input class="calc-display" type="text" inputmode="decimal" aria-label="Ввід виразу" placeholder="Введіть вираз…" readonly />
        <div class="calc-grid" aria-hidden="false">
          <button data-k="7">7</button>
          <button data-k="8">8</button>
          <button data-k="9">9</button>
          <button data-k="/" title="Ділення">÷</button>

          <button data-k="4">4</button>
          <button data-k="5">5</button>
          <button data-k="6">6</button>
          <button data-k="*" title="Множення">×</button>

          <button data-k="1">1</button>
          <button data-k="2">2</button>
          <button data-k="3">3</button>
          <button data-k="-" title="Мінус">−</button>

          <button data-k="0">0</button>
          <button data-k=".">.</button>
          <button data-k="(">(</button>
          <button data-k=")">)</button>

          <button data-act="clear" class="muted" title="Очистити">C</button>
          <button data-act="back" class="muted" title="Стерти">⌫</button>
          <button data-k="+" class="muted" title="Плюс">+</button>
          <button data-act="eq" class="accent" title="Обчислити">=</button>
        </div>
      </div>
      <style>
        /* Scoped styles: rely on container id to avoid leaking */
        #${id}.calc-widget { display: grid; grid-template-rows: auto 1fr; gap: 10px; align-self: stretch; }
        #${id} .calc-display { width: 100%; font-size: clamp(18px, 2.4vw, 28px); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); color: var(--fg); background: transparent; }
        #${id} .calc-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; align-content: start; }
        #${id} .calc-grid button { font-size: clamp(18px, 2.2vw, 26px); padding: 10px; border-radius: 10px; border: 1px solid var(--line); color: var(--fg); background: var(--card); cursor: pointer; }
        #${id} .calc-grid button:hover { background: rgba(77,163,255,0.12); }
        #${id} .calc-grid button.accent { background: var(--accent); color: #fff; border-color: var(--accent); }
        #${id} .calc-grid button.muted { color: var(--muted); }
      </style>
    `;
  }

  registerSlideRenderer("Давайте порахуємо", function(slide, { escapeHTML }, { titleHTML }){
    const f = slide.fields || {};
    const items = Array.isArray(f.task) ? f.task : (f.task ? [f.task] : []);
    const left = items.length
      ? `<div class="calc-task"><ul>${items.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul></div>`
      : `<div class="calc-task"><p>${escapeHTML(f.body || '')}</p></div>`;
    const id = uid();
    const right = `<div class="calc-side">${renderCalc(id)}</div>`;
    const html = `${titleHTML}<div class="content two-col">${left}${right}</div>`;
    return { html };
  });

  // Global delegated handlers to ensure functionality after dynamic slide render
  function getDisplay(root){ return root.querySelector('.calc-display'); }
  function insertText(root, txt){
    const el = getDisplay(root); if (!el) return;
    el.value = String(el.value || '') + String(txt || '');
  }
  function backspace(root){
    const el = getDisplay(root); if (!el) return;
    el.value = String(el.value || '');
    if (!el.value) return;
    el.value = el.value.slice(0, -1);
  }
  function calculateRoot(root){
    const el = getDisplay(root); if (!el) return;
    let raw = String(el.value || '');
    raw = raw.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    const expr = sanitizeExpr(raw);
    if (!expr) { el.value = 'Помилка'; return; }
    try {
      // eslint-disable-next-line no-new-func
      const val = Function('return (' + expr + ')')();
      el.value = (typeof val === 'number' && isFinite(val)) ? String(val) : 'Помилка';
    } catch {
      el.value = 'Помилка';
    }
  }

  if (!window.__calcDelegated__) {
    window.__calcDelegated__ = true;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-widget button');
      if (!btn) return;
      const root = btn.closest('.calc-widget');
      if (!root) return;
      const k = btn.getAttribute('data-k');
      const act = btn.getAttribute('data-act');
      if (k) insertText(root, k);
      else if (act === 'clear') { const d = getDisplay(root); if (d) d.value = ''; }
      else if (act === 'back') backspace(root);
      else if (act === 'percent') insertText(root, '%');
      else if (act === 'eq') calculateRoot(root);
    });
    // Prevent typing into display, calculator is button-driven
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('calc-display')) {
        e.preventDefault();
      }
    }, true);
  }
})();
