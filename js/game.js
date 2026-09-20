(function () {
  const TOTAL = 3;
  const LETTER_COLORS = ["#e53935", "#1e88e5", "#43a047"];
  const MAX_STACK = 6;
  const MAX_TOPS = 12;
  const MAX_PER_TOPPING = 4;

  const els = {
    screens: {
      title: document.getElementById("screen-title"),
      pick: document.getElementById("screen-pick"),
      country: document.getElementById("screen-country"),
      sauce: document.getElementById("screen-sauce"),
      cheese: document.getElementById("screen-cheese"),
      pizza: document.getElementById("screen-pizza"),
      stack: document.getElementById("screen-stack"),
      cook: document.getElementById("screen-cook"),
      result: document.getElementById("screen-result")
    },
    mute: document.getElementById("btn-mute"),
    modeGrid: document.getElementById("mode-grid"),
    pickTitle: document.getElementById("pick-title"),
    pickPills: document.getElementById("pick-pills"),
    pickBowl: document.getElementById("pick-bowl"),
    pickDockLabel: document.getElementById("pick-dock-label"),
    pickChef: document.getElementById("pick-chef"),
    ingGrid: document.getElementById("ing-grid"),
    pickBack: document.getElementById("btn-pick-back"),
    pickRestart: document.getElementById("btn-pick-restart"),
    countryPills: document.getElementById("country-pills"),
    countryTitle: document.getElementById("country-title"),
    countryHint: document.getElementById("country-hint"),
    countryHero: document.getElementById("country-hero"),
    countryGrid: document.getElementById("country-grid"),
    countryBowl: document.getElementById("country-bowl"),
    countryDockLabel: document.getElementById("country-dock-label"),
    countryBack: document.getElementById("btn-country-back"),
    countryRestart: document.getElementById("btn-country-restart"),
    // pizza sauce
    pizzaPaint: document.getElementById("pizza-paint"),
    sauceFill: document.getElementById("sauce-fill"),
    sauceClear: document.getElementById("btn-sauce-clear"),
    sauceBack: document.getElementById("btn-sauce-back"),
    sauceNext: document.getElementById("btn-sauce-next"),
    // pizza cheese
    cheesePreview: document.getElementById("cheese-preview"),
    cheeseGrid: document.getElementById("cheese-grid"),
    cheeseHint: document.getElementById("cheese-hint"),
    cheeseBack: document.getElementById("btn-cheese-back"),
    cheeseNext: document.getElementById("btn-cheese-next"),
    // pizza tops
    pizzaLive: document.getElementById("pizza-live"),
    pizzaGrid: document.getElementById("pizza-grid"),
    pizzaCount: document.getElementById("pizza-count"),
    pizzaHint: document.getElementById("pizza-hint"),
    pizzaBack: document.getElementById("btn-pizza-back"),
    pizzaUndo: document.getElementById("btn-pizza-undo"),
    pizzaDone: document.getElementById("btn-pizza-done"),
    // stack
    stackTitle: document.getElementById("stack-title"),
    stackLive: document.getElementById("stack-live"),
    stackGrid: document.getElementById("stack-grid"),
    stackCount: document.getElementById("stack-count"),
    stackBack: document.getElementById("btn-stack-back"),
    stackClear: document.getElementById("btn-stack-clear"),
    stackDone: document.getElementById("btn-stack-done"),
    cookTitle: document.getElementById("cook-title"),
    cookSub: document.getElementById("cook-sub"),
    cookBowl: document.getElementById("cook-bowl"),
    resultBanner: document.getElementById("result-banner"),
    resultBowl: document.getElementById("result-bowl"),
    resultList: document.getElementById("result-list"),
    resultChef: document.getElementById("result-chef"),
    again: document.getElementById("btn-again"),
    menu: document.getElementById("btn-menu"),
    confetti: document.getElementById("confetti"),
    fly: document.getElementById("fly-layer"),
    confirmModal: document.getElementById("confirm-modal"),
    confirmArt: document.getElementById("confirm-art"),
    confirmEn: document.getElementById("confirm-en"),
    confirmJa: document.getElementById("confirm-ja"),
    confirmYes: document.getElementById("confirm-yes"),
    confirmNo: document.getElementById("confirm-no")
  };

  const state = {
    screen: "title",
    mode: null, // champon | pizza | burger | sandwich
    slot: 0,
    picks: [],
    pending: null,
    pizza: { sauce: "tomato", sauceUrl: null, drops: [], cheeseType: null, cheese: null },
    stack: { kind: "burger", layers: [] }
  };

  let confirmOnYes = null;
  let timers = [];
  let busy = false;
  let sauceDabs = 0;
  let paintBuiltFor = 0;
  let pizzaSession = 0;

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function showScreen(name) {
    state.screen = name;
    Object.entries(els.screens).forEach(([key, node]) => {
      if (node) node.classList.toggle("is-active", key === name);
    });
  }

  function pillsHtml(activeIndex) {
    return Array.from({ length: TOTAL }, (_, i) => {
      const cls = i < state.picks.length ? "is-done" : i === activeIndex ? "is-now" : "";
      return `<div class="pill ${cls}"></div>`;
    }).join("");
  }

  function usedIds() {
    return new Set(state.picks.map((p) => p.ingredient.id));
  }

  function resetGame() {
    clearTimers();
    busy = false;
    confirmOnYes = null;
    if (els.confirmModal) els.confirmModal.hidden = true;
    state.slot = 0;
    state.picks = [];
    state.pending = null;
    els.fly.innerHTML = "";
    els.confetti.innerHTML = "";
  }

  function goTitle() {
    resetGame();
    state.mode = null;
    showScreen("title");
  }

  // ---------- mode select ----------

  function startMode(mode) {
    AudioFx.unlock();
    AudioFx.click();
    resetGame();
    state.mode = mode;
    // All modes now start with the champon-style ingredient + country flow
    // so every maker offers the full ingredient list with origin selection.
    if (mode === "pizza") {
      pizzaSession += 1;
      paintBuiltFor = 0;
      sauceDabs = 0;
      state.pizza = { sauce: "tomato", sauceUrl: null, drops: [], cheeseType: null, cheese: null };
      syncSauceButtons();
      if (els.sauceFill) els.sauceFill.style.width = "0%";
    }
    if (mode === "burger" || mode === "sandwich") {
      state.stack = { kind: mode, layers: [] };
    }
    renderPick();
    showScreen("pick");
  }

  // ---------- champon flow (unchanged) ----------

  function openConfirm(artHtml, en, ja, onYes) {
    confirmOnYes = onYes;
    els.confirmArt.innerHTML = artHtml;
    els.confirmEn.textContent = en;
    els.confirmJa.textContent = ja;
    els.confirmModal.hidden = false;
    busy = true;
  }

  function closeConfirm(cancelled) {
    els.confirmModal.hidden = true;
    if (cancelled) {
      confirmOnYes = null;
      busy = false;
      document.querySelectorAll(".is-pop").forEach((node) => node.classList.remove("is-pop"));
    }
  }

  function modeNoun() {
    if (state.mode === "pizza") return "TOPPING";
    if (state.mode === "burger") return "LAYER";
    if (state.mode === "sandwich") return "FILLING";
    return "INGREDIENT";
  }

  function modeDockLabel() {
    if (state.mode === "pizza") return "Your pizza";
    if (state.mode === "burger") return "Your burger";
    if (state.mode === "sandwich") return "Your sandwich";
    return "Your bowl";
  }

  let selectedTopping = null;

  // Live mode-specific preview for the pick / country screens so pizza,
  // burger and sandwich makers never show a champon bowl.
  function previewDropsFromPicks(extra) {
    const spots = [
      { x: 36, y: 40 }, { x: 64, y: 40 }, { x: 50, y: 64 }
    ];
    const drops = state.picks.map((p, i) => ({
      ing: p.ingredient,
      x: spots[i % spots.length].x,
      y: spots[i % spots.length].y,
      r: (i * 70) % 360,
      s: 1
    }));
    if (extra) {
      drops.push({
        ing: extra,
        x: spots[drops.length % spots.length].x,
        y: spots[drops.length % spots.length].y,
        r: 20,
        s: 1
      });
    }
    return drops;
  }

  function pickPreviewHtml(size) {
    if (state.mode === "pizza") {
      return Art.pizza(null, previewDropsFromPicks(state.pending), { size: size || "md" });
    }
    if (state.mode === "burger" || state.mode === "sandwich") {
      const layers = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
      if (state.pending) layers.push({ ingredient: state.pending, country: null });
      return Art.stack(layers, state.mode === "sandwich" ? "sandwich" : "burger");
    }
    return Art.bowl(state.picks.map((p) => p.ingredient), {
      size: size || "md",
      stage: state.picks.length ? "done" : "noodles"
    });
  }

  function renderPick() {
    const n = state.slot + 1;
    els.pickTitle.textContent = `${modeNoun()} ${n} / ${TOTAL}`;
    els.pickPills.innerHTML = pillsHtml(state.slot);
    if (els.pickDockLabel) els.pickDockLabel.textContent = modeDockLabel();
    els.pickBowl.innerHTML = pickPreviewHtml("md");
    els.pickChef.innerHTML = Art.chef(state.mode || "champon");
    els.pickBack.disabled = state.slot === 0 && state.picks.length === 0 && !state.pending;
    const used = usedIds();
    els.ingGrid.innerHTML = INGREDIENTS.map((ing) => {
      const usedCls = used.has(ing.id) ? "is-used" : "";
      return `<button class="ing-btn ${usedCls}" type="button" data-id="${ing.id}">
        ${Art.ingredient(ing.id)}
        <span class="ing-en">${ing.name}</span>
      </button>`;
    }).join("");
    els.ingGrid.scrollTop = 0;
  }

  function renderCountry() {
    const ing = state.pending;
    if (!ing) {
      renderPick();
      showScreen("pick");
      return;
    }
    els.countryPills.innerHTML = pillsHtml(state.slot);
    els.countryTitle.textContent = `Where is your ${ing.name} from?`;
    els.countryHint.textContent = `${modeNoun()} ${state.slot + 1} / ${TOTAL} - Scroll to see all countries ↓`;
    els.countryHero.innerHTML = `${Art.ingredient(ing.id)}<h3>${ing.name}</h3>`;
    if (els.countryDockLabel) els.countryDockLabel.textContent = modeDockLabel();
    els.countryBowl.innerHTML = pickPreviewHtml("sm");
    els.countryGrid.innerHTML = COUNTRY_LIST.map((c) => {
      return `<button class="country-btn" type="button" data-id="${c.id}">
        ${Art.flag(c.id)}
        <span class="country-en">${c.name}</span>
      </button>`;
    }).join("");
    els.countryGrid.scrollTop = 0;
  }

  function flyToBowl(fromEl, toEl, html) {
    if (!fromEl || !toEl) return Promise.resolve();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const flyer = document.createElement("div");
    flyer.className = "flyer";
    flyer.innerHTML = html;
    flyer.style.left = `${a.left + a.width / 2 - 45}px`;
    flyer.style.top = `${a.top + a.height / 2 - 45}px`;
    els.fly.appendChild(flyer);
    AudioFx.whoosh();
    const dx = b.left + b.width / 2 - 45 - (a.left + a.width / 2 - 45);
    const dy = b.top + b.height / 2 - 45 - (a.top + a.height / 2 - 45);
    requestAnimationFrame(() => {
      flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.45)`;
      flyer.style.opacity = "0.2";
    });
    return new Promise((resolve) => {
      later(() => {
        flyer.remove();
        resolve();
      }, 560);
    });
  }

  function onIngredient(id, btn) {
    if (busy || !els.confirmModal.hidden || usedIds().has(id)) return;
    const ing = getIngredient(id);
    if (!ing) return;
    AudioFx.select();
    btn.classList.add("is-pop");
    openConfirm(Art.ingredient(ing.id), ing.name, ing.nameJa, () => {
      els.confirmModal.hidden = true;
      confirmOnYes = null;
      state.pending = ing;
      later(() => {
        busy = false;
        renderCountry();
        showScreen("country");
      }, 220);
    });
  }

  async function commitCountry(id) {
    const country = getCountry(id);
    if (!country || !state.pending) {
      busy = false;
      return;
    }
    AudioFx.country();
    const from = els.countryHero.querySelector(".food-img");
    const to = els.countryBowl;
    await flyToBowl(from, to, Art.ingredient(state.pending.id));
    state.picks.push({ ingredient: state.pending, country });
    state.pending = null;
    state.slot += 1;
    busy = false;
    if (state.slot < TOTAL) {
      renderPick();
      showScreen("pick");
    } else {
      afterPicksComplete();
    }
  }

  function afterPicksComplete() {
    if (state.mode === "pizza") {
      enterSauce();
      return;
    }
    if (state.mode === "burger" || state.mode === "sandwich") {
      enterStack();
      return;
    }
    beginCook();
  }

  function enterSauce() {
    sauceDabs = 0;
    state.pizza.drops = [];
    state.pizza.sauceUrl = null;
    state.pizza.cheeseType = null;
    state.pizza.cheese = null;
    if (els.sauceFill) els.sauceFill.style.width = "0%";
    syncSauceButtons();
    paintBuiltFor = 0;
    buildPaintCanvas();
    showScreen("sauce");
  }

  function enterStack() {
    const kind = state.mode === "sandwich" ? "sandwich" : "burger";
    state.stack = {
      kind,
      // keep country info per layer so the result can show origins
      layers: state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }))
    };
    renderStack();
    showScreen("stack");
  }

  function onCountry(id, btn) {
    if (busy || !els.confirmModal.hidden) return;
    const country = getCountry(id);
    if (!country || !state.pending) return;
    AudioFx.select();
    btn.classList.add("is-pop");
    openConfirm(Art.flag(id), country.name, country.nameJa, () => {
      els.confirmModal.hidden = true;
      confirmOnYes = null;
      commitCountry(id);
    });
  }

  // ---------- pizza: sauce painting ----------

  function syncSauceButtons() {
    document.querySelectorAll(".sauce-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sauce === state.pizza.sauce);
    });
  }

  function buildPaintCanvas() {
    if (paintBuiltFor === pizzaSession) return;
    paintBuiltFor = pizzaSession;
    els.pizzaPaint.innerHTML = `${Art.pizzaBase()}<canvas id="sauce-canvas" width="480" height="480"></canvas>`;
    const canvas = els.pizzaPaint.querySelector("#sauce-canvas");
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let painting = false;
    let last = null;

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 480,
        y: ((e.clientY - r.top) / r.height) * 480
      };
    }

    function inside(x, y) {
      const dx = x - 240;
      const dy = y - 240;
      return Math.hypot(dx, dy) < 168;
    }

    function dab(x, y) {
      if (!inside(x, y)) return;
      const sauce = PIZZA_SAUCES[state.pizza.sauce];
      // Smooth solid coat: single color only. The old dark speckles left
      // visible darker spots, so they are intentionally gone.
      ctx.fillStyle = sauce.color;
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
      sauceDabs += 1;
      if (els.sauceFill) els.sauceFill.style.width = `${Math.min(100, sauceDabs / 2.4)}%`;
    }

    function strokeTo(p) {
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        const steps = Math.max(1, Math.floor(dist / 10));
        for (let i = 1; i <= steps; i += 1) {
          dab(last.x + ((p.x - last.x) * i) / steps, last.y + ((p.y - last.y) * i) / steps);
        }
      } else {
        dab(p.x, p.y);
      }
      last = p;
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      AudioFx.unlock();
      painting = true;
      last = null;
      canvas.setPointerCapture(e.pointerId);
      strokeTo(toLocal(e));
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!painting) return;
      e.preventDefault();
      strokeTo(toLocal(e));
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => {
      canvas.addEventListener(ev, () => {
        painting = false;
        last = null;
      });
    });

    // restore previous sauce when coming BACK from toppings
    if (state.pizza.sauceUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = state.pizza.sauceUrl;
    }
  }

  function captureSauce() {
    const canvas = els.pizzaPaint.querySelector("#sauce-canvas");
    if (!canvas || sauceDabs === 0) {
      // keep previous capture when going back/forth without repainting
      return state.pizza.sauceUrl;
    }
    state.pizza.sauceUrl = canvas.toDataURL("image/png");
    return state.pizza.sauceUrl;
  }

  function restoreSauceCanvas() {
    // Rebuild the paint canvas (which wipes it) and re-draw saved sauce.
    paintBuiltFor = 0;
    buildPaintCanvas();
    const canvas = els.pizzaPaint.querySelector("#sauce-canvas");
    if (canvas && state.pizza.sauceUrl) {
      const img = new Image();
      img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0);
      img.src = state.pizza.sauceUrl;
    }
  }

  // ---------- pizza: cheese choice ----------

  // Mozzarella goes on as imperfect little balls; cheddar/provolone as thin
  // shred sticks; the mix gets both. Positions are clamped to the cheese circle.
  const BALL_SHAPES = [
    "48% 52% 55% 45% / 52% 46% 54% 48%",
    "55% 45% 48% 52% / 46% 55% 45% 54%",
    "50% 50% 46% 54% / 54% 48% 52% 46%"
  ];

  function cheeseSpot() {
    return clampToPizza(50 + (Math.random() * 48 - 24), 50 + (Math.random() * 48 - 24));
  }

  function makeBall(color) {
    const p = cheeseSpot();
    return {
      kind: "ball",
      x: p.x,
      y: p.y,
      r: Math.random() * 180,
      w: 7 + Math.random() * 3,
      color,
      br: BALL_SHAPES[Math.floor(Math.random() * BALL_SHAPES.length)]
    };
  }

  function makeShred(color) {
    const p = cheeseSpot();
    return {
      kind: "shred",
      x: p.x,
      y: p.y,
      r: Math.random() * 180,
      w: 15 + Math.random() * 6,
      color
    };
  }

  function makeCheesePieces(type) {
    // Canonicalize legacy / alternate spellings: "mozarella" -> mozzarella,
    // "mix" -> both. Raw (pre-cook) graphics are unchanged: mozzarella as
    // balls, cheddar as shreds, both as balls + shreds.
    const canon = type === "mozarella" ? "mozzarella" : type === "mix" ? "both" : type;
    const def = (typeof getCheese === "function" ? getCheese(canon) : CHEESES[canon]) || CHEESES.mozzarella;
    const pieces = [];
    if (canon === "mozzarella" || canon === "mozarella") {
      for (let i = 0; i < 24; i += 1) pieces.push(makeBall(def.colors[i % def.colors.length]));
    } else if (canon === "both" || canon === "mix") {
      const ballColors = [def.colors[0], def.colors[2]];
      const shredColors = [def.colors[1], def.colors[3], def.colors[5], def.colors[4]];
      for (let i = 0; i < 12; i += 1) pieces.push(makeBall(ballColors[i % ballColors.length]));
      for (let i = 0; i < 26; i += 1) pieces.push(makeShred(shredColors[i % shredColors.length]));
    } else {
      for (let i = 0; i < 44; i += 1) pieces.push(makeShred(def.colors[i % def.colors.length]));
    }
    return pieces;
  }

  function enterCheese() {
    renderCheese();
    showScreen("cheese");
  }

  function renderCheese() {
    els.cheesePreview.innerHTML = Art.pizza(state.pizza.sauceUrl, [], {
      size: "md",
      cheese: state.pizza.cheese
    });
    els.cheeseGrid.innerHTML = Object.values(CHEESES)
      .map((ch) => {
        const dot = ch.id === "both"
          ? "background: conic-gradient(#fff6e3 0 50%, #f6a93b 0)"
          : `background:${ch.colors[0]}`;
        const sel = state.pizza.cheeseType === ch.id ? " is-selected" : "";
        return `<button class="cheese-btn${sel}" type="button" data-id="${ch.id}">
          <span class="cheese-dot" style="${dot}"></span>
          <span class="ing-en">${ch.name}</span>
        </button>`;
      })
      .join("");
    if (els.cheeseNext) els.cheeseNext.disabled = !state.pizza.cheeseType;
    if (els.cheeseHint) {
      const ch = typeof getCheese === "function" ? getCheese(state.pizza.cheeseType) : CHEESES[state.pizza.cheeseType];
      els.cheeseHint.textContent = ch
        ? `${ch.name} — looking melty already! Change your mind or go on. 🧀`
        : "Tap a cheese to see it on your pizza 🧀";
    }
  }

  function selectCheese(type) {
    const canon = type === "mozarella" ? "mozzarella" : type === "mix" ? "both" : type;
    const def = typeof getCheese === "function" ? getCheese(canon) : CHEESES[canon];
    if (!def) return;
    AudioFx.select();
    state.pizza.cheeseType = def.id;
    state.pizza.cheese = { type: def.id, pieces: makeCheesePieces(def.id) };
    renderCheese();
    els.cheesePreview.classList.remove("is-drop");
    void els.cheesePreview.offsetWidth;
    els.cheesePreview.classList.add("is-drop");
  }

  // ---------- pizza: toppings drag & drop ----------

  function pizzaPalette() {
    // Toppings come from the champon-style picks (full ingredient list +
    // country), falling back to the legacy list only if picks are empty.
    if (state.picks.length) return state.picks.map((p) => p.ingredient);
    return toppingList(PIZZA_TOPPING_IDS);
  }

  function pickCountryFor(id) {
    const found = state.picks.find((p) => p.ingredient.id === id);
    return found ? found.country : null;
  }

  function pizzaPlacedCounts() {
    const counts = {};
    state.pizza.drops.forEach((d) => {
      const id = (d.ing || d.ingredient || {}).id;
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }

  function pizzaReadyToCook() {
    if (!state.picks.length) return state.pizza.drops.length > 0;
    return state.picks.every((p) => pizzaPlacedCounts()[p.ingredient.id] > 0);
  }

  function pizzaCountText() {
    if (!state.picks.length) return `${state.pizza.drops.length} / ${MAX_TOPS} placed`;
    const counts = pizzaPlacedCounts();
    return state.picks.map((p) => `${p.ingredient.name} ×${counts[p.ingredient.id] || 0}/${MAX_PER_TOPPING}`).join(" · ");
  }

  function syncPizzaDone() {
    if (els.pizzaDone) els.pizzaDone.disabled = !pizzaReadyToCook();
    if (els.pizzaHint) {
      els.pizzaHint.textContent = pizzaReadyToCook()
        ? "Looking tasty! Hit COOK when you're happy. 👩‍🍳"
        : "Place each of your 3 toppings on the pizza! Drag one over — or tap one, then tap the pizza.";
    }
  }

  function renderPizzaGrid() {
    const counts = pizzaPlacedCounts();
    els.pizzaGrid.innerHTML = pizzaPalette()
      .map((ing) => {
        const n = counts[ing.id] || 0;
        const maxed = n >= MAX_PER_TOPPING ? " is-maxed" : "";
        const sel = selectedTopping === ing.id ? " is-selected" : "";
        return `<button class="ing-btn pizza-ing-btn${maxed}${sel}" type="button" data-id="${ing.id}">
          <img class="food-img" src="${ing.image}" alt="${ing.name}" draggable="false">
          <span class="ing-en">${ing.name}</span>
          <span class="topping-badge">×${n}/${MAX_PER_TOPPING}</span>
        </button>`;
      })
      .join("");
  }

  function renderPizzaTop() {
    // No auto-scatter: the pizza starts with sauce + cheese and the user
    // places every topping themselves by dragging (or tap-then-tap).
    selectedTopping = null;
    els.pizzaLive.innerHTML = Art.pizza(state.pizza.sauceUrl, state.pizza.drops, {
      size: "xl",
      cheese: state.pizza.cheese
    });
    els.pizzaCount.textContent = pizzaCountText();
    renderPizzaGrid();
    syncPizzaDone();
  }

  function refreshPizzaLive() {
    els.pizzaLive.innerHTML = Art.pizza(state.pizza.sauceUrl, state.pizza.drops, {
      size: "xl",
      cheese: state.pizza.cheese
    });
    els.pizzaCount.textContent = pizzaCountText();
    renderPizzaGrid();
    syncPizzaDone();
    els.pizzaLive.classList.remove("is-drop");
    void els.pizzaLive.offsetWidth;
    els.pizzaLive.classList.add("is-drop");
  }

  function findPizzaIng(id) {
    return pizzaPalette().find((i) => i.id === id);
  }

  function clampToPizza(x, y) {
    // x,y in percent; keep inside cheese circle
    const dx = x - 50;
    const dy = y - 50;
    const d = Math.hypot(dx, dy);
    const max = 30;
    if (d > max) {
      return { x: 50 + (dx / d) * max, y: 50 + (dy / d) * max };
    }
    return { x, y };
  }

  function addPizzaDrop(id, point) {
    const ing = findPizzaIng(id);
    if (!ing || state.pizza.drops.length >= MAX_TOPS) return;
    // Manual placement only — a drop needs an explicit spot on the pizza.
    if (!point) return;
    // Max 4 of each topping per pizza.
    const already = state.pizza.drops.filter((d) => (d.ing || {}).id === id).length;
    if (already >= MAX_PER_TOPPING) {
      if (els.pizzaHint) els.pizzaHint.textContent = `Only ${MAX_PER_TOPPING} ${ing.name} per pizza! Undo one to move it.`;
      els.pizzaLive.classList.remove("is-drop");
      void els.pizzaLive.offsetWidth;
      els.pizzaLive.classList.add("is-drop");
      return;
    }
    const p = clampToPizza(point.x, point.y);
    state.pizza.drops.push({
      ing,
      country: pickCountryFor(id),
      x: p.x,
      y: p.y,
      r: Math.random() * 360,
      s: 0.85 + Math.random() * 0.55
    });
    AudioFx.select();
    refreshPizzaLive();
  }

  function dropPointFromEvent(clientX, clientY) {
    const r = els.pizzaLive.getBoundingClientRect();
    return clampToPizza(((clientX - r.left) / r.width) * 100, ((clientY - r.top) / r.height) * 100);
  }

  function isOverPizza(clientX, clientY) {
    const r = els.pizzaLive.getBoundingClientRect();
    const pad = 10;
    return (
      clientX >= r.left - pad && clientX <= r.right + pad &&
      clientY >= r.top - pad && clientY <= r.bottom + pad
    );
  }

  function setupPizzaDrag() {
    // Tap a topping = select it (highlight). Then tap the pizza to place it
    // at that exact spot — touch friendly. Press + drag onto the pizza =
    // drop at that exact spot. No random scattering: the user places all.
    function selectTopping(id) {
      selectedTopping = id;
      els.pizzaGrid.querySelectorAll(".pizza-ing-btn").forEach((btn) => {
        btn.classList.toggle("is-selected", btn.dataset.id === id);
      });
      AudioFx.select();
    }

    els.pizzaGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".pizza-ing-btn");
      if (!btn || btn.dataset.dragged === "1") return;
      selectTopping(btn.dataset.id);
    });

    // Tap / click on the pizza places the selected topping there.
    els.pizzaLive.addEventListener("pointerdown", (e) => {
      if (!selectedTopping) return;
      // Don't fight an in-progress drag from the tray.
      if (e.target.closest && e.target.closest(".pizza-ing-btn")) return;
      addPizzaDrop(selectedTopping, dropPointFromEvent(e.clientX, e.clientY));
    });

    els.pizzaGrid.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".pizza-ing-btn");
      if (!btn || e.pointerType === "mouse" && e.button !== 0) return;
      const dragId = btn.dataset.id;
      const startX = e.clientX;
      const startY = e.clientY;
      let ghost = null;
      btn.dataset.dragged = "0";
      const move = (ev) => {
        if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 12) {
          const ing = findPizzaIng(dragId);
          if (!ing) return;
          AudioFx.unlock();
          ghost = document.createElement("div");
          ghost.className = "drag-ghost";
          ghost.innerHTML = `<img src="${ing.image}" alt="">`;
          els.fly.appendChild(ghost);
          btn.dataset.dragged = "1";
        }
        if (ghost) {
          ghost.style.left = `${ev.clientX - 34}px`;
          ghost.style.top = `${ev.clientY - 34}px`;
        }
      };
      const up = (ev) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        if (ghost) {
          ghost.remove();
          ghost = null;
          if (isOverPizza(ev.clientX, ev.clientY)) {
            addPizzaDrop(dragId, dropPointFromEvent(ev.clientX, ev.clientY));
          }
          // swallow the click that follows a real drag
          setTimeout(() => { btn.dataset.dragged = "0"; }, 0);
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });
  }

  // ---------- burger / sandwich stacking ----------

  function stackPalette() {
    // Fillings come from the champon-style picks (full list + country).
    if (state.picks.length) return state.picks.map((p) => p.ingredient);
    const ids = state.stack.kind === "sandwich" ? SANDWICH_FILLING_IDS : BURGER_FILLING_IDS;
    return toppingList(ids);
  }

  function renderStack() {
    const kind = state.stack.kind;
    els.stackTitle.textContent = kind === "sandwich" ? "Build your sandwich!" : "Build your burger!";
    els.stackLive.innerHTML = Art.stack(state.stack.layers, kind);
    els.stackCount.textContent = `${state.stack.layers.length} / ${MAX_STACK} layers — tap stack to remove top`;
    const scroll = els.stackGrid.scrollTop;
    els.stackGrid.innerHTML = stackPalette()
      .map((ing) => {
        const st = layerStyle(ing.id);
        const c = state.picks.find((p) => p.ingredient.id === ing.id);
        const flag = c ? Art.flag(c.country.id) : "";
        return `<button class="ing-btn stack-ing-btn" type="button" data-id="${ing.id}">
          <img class="food-img" src="${ing.image}" alt="${ing.name}" draggable="false">
          <span class="ing-en">${ing.name}</span>
          ${flag ? `<span class="ing-flag">${flag}</span>` : ""}
          <span class="ing-layer" style="background:${st.color}"></span>
        </button>`;
      })
      .join("");
    els.stackGrid.scrollTop = scroll;
  }

  function addStackLayer(id) {
    const ing = stackPalette().find((i) => i.id === id);
    if (!ing || state.stack.layers.length >= MAX_STACK) return;
    AudioFx.select();
    const pick = state.picks.find((p) => p.ingredient.id === id);
    state.stack.layers.push(
      pick ? { ingredient: pick.ingredient, country: pick.country } : { ingredient: ing, country: null }
    );
    renderStack();
  }

  // ---------- cook + result (all modes) ----------

  function beginCook() {
    showScreen("cook");
    if (state.mode === "pizza") return cookPizza();
    if (state.mode === "burger" || state.mode === "sandwich") return cookStack();
    return cookChampon();
  }

  function cookChampon() {
    const ings = state.picks.map((p) => p.ingredient);
    const stages = [
      { stage: "empty", title: "Hot soup!", sub: "Here's the bowl..." },
      { stage: "noodles", title: "Noodles!", sub: "Noodles going in..." },
      { stage: "top1", title: ings[0].name + "!", sub: "In it goes..." },
      { stage: "top2", title: ings[1].name + "!", sub: "Yum yum..." },
      { stage: "done", title: "CHAMPON!", sub: "Ready to eat!" }
    ];
    function paint(i) {
      const s = stages[i];
      els.cookTitle.textContent = s.title;
      els.cookSub.textContent = s.sub;
      els.cookBowl.innerHTML = Art.bowl(ings, { size: "xl", stage: s.stage });
      AudioFx.cook();
    }
    paint(0);
    stages.forEach((_, i) => {
      if (i === 0) return;
      later(() => paint(i), i * 700);
    });
    later(() => {
      AudioFx.celebrate();
      renderResult();
      showScreen("result");
    }, stages.length * 700 + 250);
  }

  function cookPizza() {
    const { sauceUrl, drops, cheese } = state.pizza;
    const rawCheesy = () => Art.pizza(sauceUrl, [], { size: "xl", cheese });
    const rawFull = () => Art.pizza(sauceUrl, drops, { size: "xl", cheese });
    const bakedFull = () => Art.pizza(sauceUrl, drops, { size: "xl", cheese, cooked: true });
    const ovenRaw = () => Art.pizza(sauceUrl, drops, { size: "md", cheese });
    const ovenBaked = () => Art.pizza(sauceUrl, drops, { size: "md", cheese, cooked: true });
    const stages = [
      { title: "Stretch the dough!", sub: "Spin spin spin...", html: () => Art.pizza(null, [], { size: "xl" }) },
      { title: "Sauce + cheese!", sub: "Swirl + sprinkle...", html: rawCheesy },
      { title: "Your toppings!", sub: "Placed by a true chef...", html: rawFull },
      { title: "Into the oven!", sub: "On the paddle... whoosh!", html: () => Art.ovenScene("in", ovenRaw()) },
      { title: "Baking...", sub: "Watch the flames dance!", html: () => Art.ovenScene("bake", ovenRaw()) },
      { title: "Fresh out!", sub: "Careful, it's hot!", html: () => Art.ovenScene("out", ovenBaked()) },
      { title: "PIZZA!", sub: "Golden, melty, perfect!", html: bakedFull }
    ];
    function paint(i) {
      const s = stages[i];
      els.cookTitle.textContent = s.title;
      els.cookSub.textContent = s.sub;
      els.cookBowl.innerHTML = s.html();
      AudioFx.cook();
    }
    paint(0);
    stages.forEach((_, i) => {
      if (i === 0) return;
      later(() => paint(i), i * 1300);
    });
    later(() => {
      AudioFx.celebrate();
      renderResult();
      showScreen("result");
    }, stages.length * 1300 + 500);
  }

  function layerIng(layer) {
    return layer.ingredient || layer.ing || layer;
  }

  function layerCountry(layer) {
    if (layer.country) return layer.country;
    const ing = layerIng(layer);
    const pick = state.picks.find((p) => p.ingredient.id === ing.id);
    return pick ? pick.country : null;
  }

  function cookStack() {
    const kind = state.stack.kind;
    const layers = state.stack.layers;
    const label = kind === "sandwich" ? "SANDWICH!" : "BURGER!";
    const stages = [
      { n: 0, title: kind === "sandwich" ? "Bread!" : "Bottom bun!", sub: "Here we go..." },
      ...layers.map((layer, i) => ({ n: i + 1, title: `${layerIng(layer).name}!`, sub: "Layer it on..." })),
      { n: layers.length, title: label, sub: "Ready to eat!", done: true }
    ];
    function paint(i) {
      const s = stages[i];
      els.cookTitle.textContent = s.title;
      els.cookSub.textContent = s.sub;
      els.cookBowl.innerHTML = Art.stack(layers.slice(0, s.n), kind);
      AudioFx.cook();
    }
    paint(0);
    stages.forEach((_, i) => {
      if (i === 0) return;
      later(() => paint(i), i * 650);
    });
    later(() => {
      AudioFx.celebrate();
      renderResult();
      showScreen("result");
    }, stages.length * 650 + 250);
  }

  function resultRows(items) {
    return items
      .map((item, i) => {
        return `<div class="letter-row is-in" style="animation-delay:${i * 0.16}s">
          <div class="letter-circle" style="background:${LETTER_COLORS[i % LETTER_COLORS.length]}">${item.initial}</div>
          <div class="letter-copy">
            <div class="name">${item.name}</div>
            <div class="from">${item.sub || ""}</div>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderResult() {
    if (state.mode === "pizza") {
      els.resultBanner.textContent = "YOUR PIZZA!";
      els.resultBowl.innerHTML = Art.pizza(state.pizza.sauceUrl, state.pizza.drops, {
        size: "xl",
        cheese: state.pizza.cheese,
        cooked: true
      });
      // Sauce is intentionally excluded — only toppings with origins are listed.
      els.resultList.innerHTML = state.picks
        .map((pick, i) => {
          const ing = pick.ingredient;
          const c = pick.country;
          return `<div class="letter-row is-in" style="animation-delay:${i * 0.16}s">
            <div class="letter-circle" style="background:${LETTER_COLORS[i % LETTER_COLORS.length]}">${ing.initial}</div>
            <div class="letter-copy">
              <div class="name">${ing.name}</div>
              <div class="from">${c ? `${Art.flag(c.id)} from ${c.name}` : "tasty topping"}</div>
            </div>
          </div>`;
        })
        .join("");
    } else if (state.mode === "burger" || state.mode === "sandwich") {
      const isSand = state.mode === "sandwich";
      els.resultBanner.textContent = isSand ? "YOUR SANDWICH!" : "YOUR BURGER!";
      els.resultBowl.innerHTML = Art.stack(state.stack.layers, state.mode);
      els.resultList.innerHTML = state.stack.layers
        .map((layer, i) => {
          const ing = layerIng(layer);
          const c = layerCountry(layer);
          return `<div class="letter-row is-in" style="animation-delay:${i * 0.16}s">
            <div class="letter-circle" style="background:${LETTER_COLORS[i % LETTER_COLORS.length]}">${ing.name.charAt(0).toUpperCase()}</div>
            <div class="letter-copy">
              <div class="name">${ing.name}</div>
              <div class="from">${c ? `${Art.flag(c.id)} from ${c.name}` : layerStyle(ing.id).label}</div>
            </div>
          </div>`;
        })
        .join("");
    } else {
      const ings = state.picks.map((p) => p.ingredient);
      els.resultBanner.textContent = "YOUR CHAMPON!";
      els.resultBowl.innerHTML = Art.bowl(ings, { size: "xl", stage: "done" });
      els.resultList.innerHTML = state.picks
        .map((pick, i) => {
          const ing = pick.ingredient;
          const c = pick.country;
          return `<div class="letter-row is-in" style="animation-delay:${i * 0.16}s">
            <div class="letter-circle" style="background:${LETTER_COLORS[i]}">${ing.initial}</div>
            <div class="letter-copy">
              <div class="name">${ing.name}</div>
              <div class="from">${Art.flag(c.id)} from ${c.name}</div>
            </div>
          </div>`;
        })
        .join("");
    }
    els.resultChef.innerHTML = Art.chef(state.mode || "champon");
    els.resultChef.className = `mascot mascot-result chef-${state.mode || "champon"}`;
    burstConfetti();
  }

  function burstConfetti() {
    els.confetti.innerHTML = "";
    const colors = ["#ffeb3b", "#ff7043", "#4fc3f7", "#81c784", "#f48fb1", "#fff"];
    for (let i = 0; i < 28; i += 1) {
      const bit = document.createElement("div");
      bit.className = "confetti-bit";
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = `${Math.random() * 0.4}s`;
      bit.style.animationDuration = `${1.4 + Math.random()}s`;
      els.confetti.appendChild(bit);
    }
    later(() => {
      els.confetti.innerHTML = "";
    }, 2500);
  }

  function backToPickEdit() {
    if (state.picks.length) {
      const last = state.picks.pop();
      state.slot = Math.max(0, state.slot - 1);
      state.pending = last.ingredient;
      renderCountry();
      showScreen("country");
    } else {
      state.pending = null;
      state.slot = 0;
      renderPick();
      showScreen("pick");
    }
  }

  function goBack() {
    if (!els.confirmModal.hidden) {
      AudioFx.click();
      closeConfirm(true);
      return;
    }
    if (busy) return;
    AudioFx.click();
    if (state.screen === "country") {
      state.pending = null;
      renderPick();
      showScreen("pick");
      return;
    }
    if (state.screen === "pick") {
      if (state.picks.length) {
        const last = state.picks.pop();
        state.slot = Math.max(0, state.slot - 1);
        state.pending = last.ingredient;
        renderCountry();
        showScreen("country");
      } else {
        goTitle();
      }
      return;
    }
    if (state.screen === "pizza") {
      renderCheese();
      showScreen("cheese");
      return;
    }
    if (state.screen === "cheese") {
      restoreSauceCanvas();
      showScreen("sauce");
      return;
    }
    if (state.screen === "sauce" || state.screen === "stack") {
      if (state.screen === "sauce") captureSauce();
      backToPickEdit();
      return;
    }
    goTitle();
  }

  function startOver() {
    AudioFx.click();
    const mode = state.mode || "champon";
    // Restart the current maker from the ingredient + country flow.
    resetGame();
    state.mode = mode;
    if (mode === "pizza") {
      pizzaSession += 1;
      paintBuiltFor = 0;
      sauceDabs = 0;
      state.pizza = { sauce: "tomato", sauceUrl: null, drops: [], cheeseType: null, cheese: null };
      syncSauceButtons();
      if (els.sauceFill) els.sauceFill.style.width = "0%";
    }
    if (mode === "burger" || mode === "sandwich") {
      state.stack = { kind: mode, layers: [] };
    }
    renderPick();
    showScreen("pick");
  }

  // ---------- events ----------

  if (els.modeGrid) {
    els.modeGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".mode-card");
      if (!btn) return;
      startMode(btn.dataset.mode);
    });
  }

  els.again.addEventListener("click", () => {
    const mode = state.mode || "champon";
    startMode(mode);
  });
  if (els.menu) els.menu.addEventListener("click", () => {
    AudioFx.click();
    goTitle();
  });

  els.pickBack.addEventListener("click", goBack);
  els.countryBack.addEventListener("click", goBack);
  els.pickRestart.addEventListener("click", startOver);
  els.countryRestart.addEventListener("click", startOver);
  els.mute.addEventListener("click", () => {
    const muted = AudioFx.toggleMute();
    els.mute.textContent = muted ? "🔇" : "🔊";
    els.mute.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  });

  els.ingGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".ing-btn");
    if (!btn || btn.classList.contains("is-used")) return;
    onIngredient(btn.dataset.id, btn);
  });

  els.countryGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".country-btn");
    if (!btn) return;
    onCountry(btn.dataset.id, btn);
  });

  els.confirmYes.addEventListener("click", () => {
    if (!confirmOnYes) return;
    AudioFx.click();
    const cb = confirmOnYes;
    confirmOnYes = null;
    els.confirmModal.hidden = true;
    cb();
  });

  els.confirmNo.addEventListener("click", () => {
    AudioFx.click();
    closeConfirm(true);
  });

  // sauce screen
  document.querySelectorAll(".sauce-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.pizza.sauce = btn.dataset.sauce;
      AudioFx.click();
      syncSauceButtons();
    });
  });
  if (els.sauceClear) els.sauceClear.addEventListener("click", () => {
    AudioFx.click();
    sauceDabs = 0;
    state.pizza.sauceUrl = null;
    if (els.sauceFill) els.sauceFill.style.width = "0%";
    paintBuiltFor = 0;
    buildPaintCanvas();
  });
  if (els.sauceBack) els.sauceBack.addEventListener("click", () => {
    AudioFx.click();
    captureSauce();
    backToPickEdit();
  });
  if (els.sauceNext) els.sauceNext.addEventListener("click", () => {
    AudioFx.click();
    captureSauce();
    enterCheese();
  });

  // cheese choice
  if (els.cheeseGrid) els.cheeseGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".cheese-btn");
    if (!btn) return;
    selectCheese(btn.dataset.id);
  });
  if (els.cheeseBack) els.cheeseBack.addEventListener("click", () => {
    AudioFx.click();
    restoreSauceCanvas();
    showScreen("sauce");
  });
  if (els.cheeseNext) els.cheeseNext.addEventListener("click", () => {
    if (!state.pizza.cheeseType) return;
    AudioFx.click();
    renderPizzaTop();
    showScreen("pizza");
  });

  // pizza toppings
  setupPizzaDrag();
  if (els.pizzaBack) els.pizzaBack.addEventListener("click", () => {
    AudioFx.click();
    captureSauce();
    renderCheese();
    showScreen("cheese");
  });
  if (els.pizzaUndo) els.pizzaUndo.addEventListener("click", () => {
    AudioFx.click();
    state.pizza.drops.pop();
    refreshPizzaLive();
  });
  if (els.pizzaDone) els.pizzaDone.addEventListener("click", () => {
    if (!pizzaReadyToCook()) {
      AudioFx.click();
      if (els.pizzaHint) {
        els.pizzaHint.textContent = "Place each of your 3 toppings at least once first! 🍕";
      }
      els.pizzaLive.classList.remove("is-drop");
      void els.pizzaLive.offsetWidth;
      els.pizzaLive.classList.add("is-drop");
      return;
    }
    AudioFx.click();
    beginCook();
  });

  // stack builder
  if (els.stackGrid) els.stackGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".stack-ing-btn");
    if (!btn) return;
    addStackLayer(btn.dataset.id);
  });
  if (els.stackLive) els.stackLive.addEventListener("click", () => {
    if (!state.stack.layers.length) return;
    AudioFx.click();
    state.stack.layers.pop();
    renderStack();
  });
  if (els.stackBack) els.stackBack.addEventListener("click", () => {
    AudioFx.click();
    backToPickEdit();
  });
  if (els.stackClear) els.stackClear.addEventListener("click", () => {
    AudioFx.click();
    // Reset to the picked fillings (with countries) rather than empty.
    state.stack.layers = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
    renderStack();
  });
  if (els.stackDone) els.stackDone.addEventListener("click", () => {
    AudioFx.click();
    beginCook();
  });

  goTitle();
})();
