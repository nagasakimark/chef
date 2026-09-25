(function () {
  const TOTAL = 3;
  const LETTER_COLORS = ["#e53935", "#1e88e5", "#43a047"];
  const MAX_STACK = 6;
  const MAX_TOPS = 12;
  const MAX_PER_TOPPING = 4;
  const SAVE_KEY = "food-maker-progress";

  const els = {
    screens: {
      title: document.getElementById("screen-title"),
      pick: document.getElementById("screen-pick"),
      country: document.getElementById("screen-country"),
      sauce: document.getElementById("screen-sauce"),
      cheese: document.getElementById("screen-cheese"),
      pizza: document.getElementById("screen-pizza"),
      burgerPatty: document.getElementById("screen-burger-patty"),
      burgerCheese: document.getElementById("screen-burger-cheese"),
      stack: document.getElementById("screen-stack"),
      cook: document.getElementById("screen-cook"),
      result: document.getElementById("screen-result")
    },
    mute: document.getElementById("btn-mute"),
    home: document.getElementById("btn-home"),
    qr: document.getElementById("btn-qr"),
    qrModal: document.getElementById("qr-modal"),
    qrClose: document.getElementById("qr-close"),
    confirmQ: document.getElementById("confirm-q"),
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
    // burger patty/cheese
    burgerPattyGrid: document.getElementById("burger-patty-grid"),
    burgerPattyPreview: document.getElementById("burger-patty-preview"),
    burgerPattyNext: document.getElementById("btn-burger-patty-next"),
    burgerPattyBack: document.getElementById("btn-burger-patty-back"),
    burgerCheeseGrid: document.getElementById("burger-cheese-grid"),
    burgerCheesePreview: document.getElementById("burger-cheese-preview"),
    burgerCheeseNext: document.getElementById("btn-burger-cheese-next"),
    burgerCheeseBack: document.getElementById("btn-burger-cheese-back"),
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
    menu: document.getElementById("btn-home"),
    print: document.getElementById("btn-print"),
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
    stack: { kind: "burger", layers: [] },
    burger: { patty: null, cheese: null }
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
    document.body.dataset.screen = name;
    Object.entries(els.screens).forEach(([key, node]) => {
      if (node) node.classList.toggle("is-active", key === name);
    });
    // Every step is saved, including the finished dish (cook/result), so a
    // reload lands back where the student was.
    if (name !== "title") saveProgress();
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

  function saveProgress(screenOverride) {
    if (!state.mode) return;
    const ingredientId = (ingredient) => ingredient && ingredient.id;
    const countryId = (country) => country && country.id;
    const saved = {
      mode: state.mode,
      screen: screenOverride || state.screen,
      slot: state.slot,
      picks: state.picks.map((pick) => ({ ingredient: ingredientId(pick.ingredient), country: countryId(pick.country) })),
      pending: ingredientId(state.pending),
      burger: {
        patty: state.burger?.patty ? state.burger.patty.id : null,
        cheese: state.burger?.cheese ? state.burger.cheese.id : null
      },
      pizza: {
        sauce: state.pizza.sauce,
        sauceUrl: state.pizza.sauceUrl,
        cheeseType: state.pizza.cheeseType,
        cheese: state.pizza.cheese,
        drops: state.pizza.drops.map((drop) => ({ ...drop, ing: ingredientId(drop.ing || drop.ingredient), country: countryId(drop.country) }))
      },
      stack: {
        kind: state.stack.kind,
        layers: state.stack.layers.map((layer) => ({ ingredient: ingredientId(layer.ingredient || layer.ing), country: countryId(layer.country) }))
      }
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
    } catch (error) {
      void error;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      void error;
    }
  }

  function restoreProgress() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    } catch (error) {
      void error;
      return false;
    }
    if (!saved || !saved.mode || saved.screen === "title") return false;
    const ingredient = (id) => getIngredient(id) || VIRTUAL_INGREDIENTS[id] || getBurgerTopping(id) || getBurgerPatty(id) || getBurgerCheese(id) || null;
    const country = (id) => getCountry(id) || null;
    state.mode = saved.mode;
    state.slot = saved.slot || 0;
    state.picks = (saved.picks || []).map((pick) => ({ ingredient: ingredient(pick.ingredient), country: country(pick.country) })).filter((pick) => pick.ingredient);
    state.pending = ingredient(saved.pending);
    // burger
    state.burger = {
      patty: (typeof getBurgerPatty === "function" ? getBurgerPatty(saved.burger?.patty) : null),
      cheese: (typeof getBurgerCheese === "function" ? getBurgerCheese(saved.burger?.cheese) : null)
    };
    state.pizza = {
      sauce: saved.pizza?.sauce || "tomato",
      sauceUrl: saved.pizza?.sauceUrl || null,
      cheeseType: saved.pizza?.cheeseType || null,
      cheese: saved.pizza?.cheese || null,
      drops: (saved.pizza?.drops || []).map((drop) => ({ ...drop, ing: ingredient(drop.ing), country: country(drop.country) })).filter((drop) => drop.ing)
    };
    state.stack = {
      kind: saved.stack?.kind || (state.mode === "sandwich" ? "sandwich" : "burger"),
      layers: (saved.stack?.layers || []).map((layer) => ({ ingredient: ingredient(layer.ingredient), country: country(layer.country) })).filter((layer) => layer.ingredient)
    };
    if (state.mode === "pizza") {
      pizzaSession += 1;
      paintBuiltFor = 0;
      syncSauceButtons();
    }
    if (saved.screen === "cook" || saved.screen === "result") {
      // Finished dish: play the cooking animation again, then the result.
      if (state.picks.length >= TOTAL) {
        beginCook();
        return true;
      }
    }
    if (state.mode === "burger") {
      // burger flow restore
      if (saved.screen === "burgerCheese" && state.burger.patty) {
        renderBurgerCheese();
        showScreen("burgerCheese");
        return true;
      }
      if (saved.screen === "burgerPatty") {
        renderBurgerPatty();
        showScreen("burgerPatty");
        return true;
      }
    }
    if (saved.screen === "country" && state.pending) {
      renderCountry();
      showScreen("country");
    } else if (saved.screen === "sauce" || (state.mode === "pizza" && !state.pizza.cheeseType && !state.picks.length)) {
      buildPaintCanvas();
      showScreen("sauce");
    } else if (saved.screen === "cheese") {
      renderCheese();
      showScreen("cheese");
    } else if (saved.screen === "pizza" && state.picks.length >= TOTAL) {
      renderPizzaTop();
      showScreen("pizza");
    } else if (saved.screen === "stack") {
      renderStack();
      showScreen("stack");
    } else {
      // for burger, ensure we are on pick if burger ready
      if (state.mode === "burger" && (!state.burger.patty || !state.burger.cheese)) {
        if (!state.burger.patty) { renderBurgerPatty(); showScreen("burgerPatty"); }
        else { renderBurgerCheese(); showScreen("burgerCheese"); }
      } else {
        renderPick();
        showScreen("pick");
      }
    }
    return true;
  }

  function resetGame() {
    clearTimers();
    busy = false;
    confirmOnYes = null;
    if (els.confirmModal) els.confirmModal.hidden = true;
    state.slot = 0;
    state.picks = [];
    state.pending = null;
    state.burger = { patty: null, cheese: null };
    els.fly.innerHTML = "";
    els.confetti.innerHTML = "";
  }

  function goTitle() {
    resetGame();
    state.mode = null;
    clearProgress();
    showScreen("title");
  }

  // ---------- mode select ----------

  function startMode(mode) {
    AudioFx.unlock();
    AudioFx.click();
    resetGame();
    state.mode = mode;
    if (mode === "burger") {
      state.burger = { patty: null, cheese: null };
      state.stack = { kind: "burger", layers: [] };
      renderBurgerPatty();
      showScreen("burgerPatty");
      return;
    }
    // All other modes now start with the champon-style ingredient + country flow
    // so every maker offers the full ingredient list with origin selection.
    if (mode === "pizza") {
      pizzaSession += 1;
      paintBuiltFor = 0;
      sauceDabs = 0;
      state.pizza = { sauce: "tomato", sauceUrl: null, drops: [], cheeseType: null, cheese: null };
      syncSauceButtons();
      enterSauce();
      return;
    }
    if (mode === "sandwich") {
      state.stack = { kind: mode, layers: [] };
    }
    renderPick();
    showScreen("pick");
  }

  // ---------- burger patty / cheese choosers ----------
  function renderBurgerPatty() {
    if (els.burgerPattyPreview) {
      els.burgerPattyPreview.innerHTML = Art.burgerPreview(state.burger.patty, state.burger.cheese, state.picks);
    }
    if (els.burgerPattyGrid) {
      els.burgerPattyGrid.innerHTML = BURGER_PATTIES.map((p) => {
        const sel = state.burger.patty && state.burger.patty.id === p.id ? " is-selected" : "";
        return `<button class="ing-btn burger-pick-btn${sel}" type="button" data-id="${p.id}">
          <img class="food-img" src="${p.image}" alt="${p.name}" draggable="false">
          <span class="ing-ja">${p.nameJa}</span>
          <span class="ing-en">${p.name}</span>
        </button>`;
      }).join("");
    }
    if (els.burgerPattyNext) els.burgerPattyNext.disabled = !state.burger.patty;
  }

  function renderBurgerCheese() {
    if (els.burgerCheesePreview) {
      els.burgerCheesePreview.innerHTML = Art.burgerPreview(state.burger.patty, state.burger.cheese, state.picks);
    }
    if (els.burgerCheeseGrid) {
      els.burgerCheeseGrid.innerHTML = BURGER_CHEESES.map((c) => {
        const sel = state.burger.cheese && state.burger.cheese.id === c.id ? " is-selected" : "";
        return `<button class="ing-btn burger-pick-btn${sel}" type="button" data-id="${c.id}">
          <img class="food-img" src="${c.image}" alt="${c.name}" draggable="false">
          <span class="ing-ja">${c.nameJa}</span>
          <span class="ing-en">${c.name}</span>
        </button>`;
      }).join("");
    }
    if (els.burgerCheeseNext) els.burgerCheeseNext.disabled = !state.burger.cheese;
  }

  function selectBurgerPatty(id) {
    const patty = getBurgerPatty(id);
    if (!patty) return;
    AudioFx.select();
    state.burger.patty = patty;
    renderBurgerPatty();
    saveProgress();
    if (els.burgerPattyPreview) {
      els.burgerPattyPreview.classList.remove("is-pop");
      void els.burgerPattyPreview.offsetWidth;
      els.burgerPattyPreview.classList.add("is-pop");
    }
  }

  function selectBurgerCheese(id) {
    const cheese = getBurgerCheese(id);
    if (!cheese) return;
    AudioFx.select();
    state.burger.cheese = cheese;
    renderBurgerCheese();
    saveProgress();
    if (els.burgerCheesePreview) {
      els.burgerCheesePreview.classList.remove("is-pop");
      void els.burgerCheesePreview.offsetWidth;
      els.burgerCheesePreview.classList.add("is-pop");
    }
  }

  // ---------- champon flow (unchanged) ----------

  function openConfirm(artHtml, en, ja, onYes, question) {
    confirmOnYes = onYes;
    if (els.confirmQ) els.confirmQ.textContent = question || "これでいい？";
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
    if (state.mode === "pizza") return "トッピング";
    if (state.mode === "burger") return "具材";
    if (state.mode === "sandwich") return "具材";
    return "材料";
  }

  function modeDockLabel() {
    if (state.mode === "pizza") return "あなたのピザ";
    if (state.mode === "burger") return "あなたのバーガー";
    if (state.mode === "sandwich") return "あなたのサンドイッチ";
    return "あなたのちゃんぽん";
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
      return Art.pizza(state.pizza.sauceUrl, previewDropsFromPicks(state.pending), { size: size || "md", cheese: state.pizza.cheese });
    }
    if (state.mode === "burger") {
      // Show burger preview: patty + cheese + picked toppings (+ pending ghost topping)
      const tops = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
      if (state.pending) tops.push({ ingredient: state.pending, country: null });
      return Art.burger(state.burger.patty, state.burger.cheese, tops, { cooked: false });
    }
    if (state.mode === "sandwich") {
      const layers = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
      if (state.pending) layers.push({ ingredient: state.pending, country: null });
      return Art.stack(layers, "sandwich");
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
    els.pickBack.disabled = false;
    // Burger toppings use dedicated PNG list
    const used = usedIds();
    let source = INGREDIENTS;
    let isBurgerTopping = false;
    if (state.mode === "burger") {
      source = BURGER_TOPPINGS;
      isBurgerTopping = true;
    }
    els.ingGrid.innerHTML = source.map((ing) => {
      const usedCls = used.has(ing.id) ? "is-used" : "";
      const imgHtml = isBurgerTopping
        ? `<img class="food-img" src="${ing.image}" alt="${ing.name}">`
        : `${Art.ingredient(ing.id)}`;
      return `<button class="ing-btn ${usedCls}" type="button" data-id="${ing.id}">
        ${imgHtml}
        <span class="ing-ja">${ing.nameJa}</span>
        <span class="ing-en">${ing.name}</span>
      </button>`;
    }).join("");
    els.ingGrid.scrollTop = 0;
  }

  function burgerIngredientHtml(ing) {
    if (!ing) return "";
    // Burger toppings/patties/cheeses use direct image, others use SVG Art
    if (ing.image && ing.image.indexOf("assets/food/burger/") === 0) {
      return `<img class="food-img" src="${ing.image}" alt="${ing.name}">`;
    }
    return Art.ingredient(ing.id);
  }

  function renderCountry() {
    const ing = state.pending;
    if (!ing) {
      renderPick();
      showScreen("pick");
      return;
    }
    els.countryPills.innerHTML = pillsHtml(state.slot);
    els.countryTitle.textContent = `この ${ing.nameJa} はどこから？`;
    els.countryHint.textContent = `国をえらぼう！ ↓ スクロールしてね`;
    els.countryHero.innerHTML = `${burgerIngredientHtml(ing)}<h3>${ing.nameJa}</h3><p class="hero-ja">${ing.name}</p><p class="hero-sub">どこから？</p>`;
    if (els.countryDockLabel) els.countryDockLabel.textContent = modeDockLabel();
    els.countryBowl.innerHTML = pickPreviewHtml("sm");
    els.countryGrid.innerHTML = COUNTRY_LIST.map((c) => {
      return `<button class="country-btn" type="button" data-id="${c.id}">
        ${Art.flag(c.id)}
        <span class="country-ja">${c.nameJa}</span>
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
    flyer.className = "flyer flyer-dip";
    flyer.innerHTML = html;
    flyer.style.left = `${a.left + a.width / 2 - 45}px`;
    flyer.style.top = `${a.top + a.height / 2 - 45}px`;
    els.fly.appendChild(flyer);
    AudioFx.whoosh();
    const dx = b.left + b.width / 2 - 45 - (a.left + a.width / 2 - 45);
    const dy = b.top + b.height * 0.62 - 45 - (a.top + a.height / 2 - 45);
    flyer.style.setProperty("--fly-dx", `${dx}px`);
    flyer.style.setProperty("--fly-dy", `${dy}px`);
    requestAnimationFrame(() => flyer.classList.add("is-flying"));
    toEl.classList.add("broth-dip");
    return new Promise((resolve) => {
      later(() => {
        flyer.remove();
        toEl.classList.remove("broth-dip");
        resolve();
      }, 760);
    });
  }

  function onIngredient(id, btn) {
    if (busy || !els.confirmModal.hidden || usedIds().has(id)) return;
    let ing = null;
    if (state.mode === "burger") {
      ing = getBurgerTopping(id);
    } else {
      ing = getIngredient(id);
    }
    if (!ing) return;
    AudioFx.select();
    btn.classList.add("is-pop");
    openConfirm(burgerIngredientHtml(ing), ing.name, ing.nameJa, () => {
      els.confirmModal.hidden = true;
      confirmOnYes = null;
      state.pending = ing;
      saveProgress("country");
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
    await flyToBowl(from, to, burgerIngredientHtml(state.pending));
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
      enterToppings();
      return;
    }
    if (state.mode === "burger") {
      // Burger toppings collected after patty+cheese
      beginCook();
      return;
    }
    if (state.mode === "sandwich") {
      enterStack();
      return;
    }
    beginCook();
  }

  function enterToppings() {
    // keep toppings already placed, as long as they're still picked
    const ids = new Set(state.picks.map((p) => p.ingredient.id));
    state.pizza.drops = state.pizza.drops.filter((d) => ids.has((d.ing || {}).id));
    AudioFx.whoosh();
    renderPizzaTop();
    showScreen("pizza");
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
    AudioFx.whoosh();
    showScreen("sauce");
  }

  function enterStack() {
    const kind = state.mode === "sandwich" ? "sandwich" : "burger";
    AudioFx.whoosh();
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


  function syncSauceButtons() {
    document.querySelectorAll(".sauce-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sauce === state.pizza.sauce);
    });
    const ladle = els.pizzaPaint.querySelector(".ladle");
    const sauce = PIZZA_SAUCES[state.pizza.sauce] || PIZZA_SAUCES.tomato;
    if (ladle) ladle.style.setProperty("--sauce", sauce.color);
  }

  // ---------- pizza: sauce painting ----------
  // Students "paint" with a ladle. Each stroke builds a soft-edged mask; the
  // mask reveals a pre-made sauce texture (colour mottling, herb flecks,
  // gloss), so it looks like real sauce instead of flat blobs. Painting with
  // a new sauce starts a new layer on top. Coverage drives the meter.
  const SAUCE_SIZE = 480;
  const SAUCE_R = 170;       // inside the crust
  const sauceTextures = {};
  let painter = null;

  function sauceTexture(id) {
    if (sauceTextures[id]) return sauceTextures[id];
    const sauce = PIZZA_SAUCES[id] || PIZZA_SAUCES.tomato;
    const c = document.createElement("canvas");
    c.width = c.height = SAUCE_SIZE;
    const g = c.getContext("2d");
    g.fillStyle = sauce.color;
    g.fillRect(0, 0, SAUCE_SIZE, SAUCE_SIZE);
    let seed = id.length * 97 + 13;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    // soft mottling, lighter and darker
    for (let i = 0; i < 420; i += 1) {
      const x = rnd() * SAUCE_SIZE, y = rnd() * SAUCE_SIZE, r = 8 + rnd() * 30;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      const col = rnd() < 0.5 ? sauce.light : sauce.dark;
      grad.addColorStop(0, col);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = 0.18 + rnd() * 0.18;
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    // flecks: herbs / pepper / basil bits
    g.globalAlpha = 0.9;
    (sauce.flecks || []).forEach((f) => {
      for (let i = 0; i < f.n; i += 1) {
        const x = rnd() * SAUCE_SIZE, y = rnd() * SAUCE_SIZE;
        g.save();
        g.translate(x, y);
        g.rotate(rnd() * Math.PI);
        g.fillStyle = f.color;
        g.fillRect(-f.w / 2, -f.h / 2, f.w * (0.6 + rnd() * 0.8), f.h);
        g.restore();
      }
    });
    // glossy streaks
    g.globalAlpha = 0.14;
    g.strokeStyle = "#fff";
    g.lineCap = "round";
    for (let i = 0; i < 40; i += 1) {
      const x = rnd() * SAUCE_SIZE, y = rnd() * SAUCE_SIZE;
      g.lineWidth = 2 + rnd() * 4;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 10, y - 6, x + 18 + rnd() * 16, y - 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    sauceTextures[id] = c;
    return c;
  }

  function buildPaintCanvas() {
    if (paintBuiltFor === pizzaSession) return;
    paintBuiltFor = pizzaSession;
    els.pizzaPaint.innerHTML = `${Art.pizzaBase()}<canvas id="sauce-canvas" width="${SAUCE_SIZE}" height="${SAUCE_SIZE}"></canvas>` +
      `<div class="ladle" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M44 36 L74 6" stroke="#8d5a1b" stroke-width="9" stroke-linecap="round"/><path d="M44 36 L74 6" stroke="#c98b4f" stroke-width="4" stroke-linecap="round"/><ellipse cx="30" cy="48" rx="24" ry="17" fill="#cfd8dc" stroke="#1a0a04" stroke-width="4"/><ellipse class="ladle-sauce" cx="30" cy="45" rx="17" ry="10"/></svg></div>` +
      `<div class="sauce-hint" aria-hidden="true"><span></span></div>`;
    const canvas = els.pizzaPaint.querySelector("#sauce-canvas");
    const ladle = els.pizzaPaint.querySelector(".ladle");
    const ctx = canvas.getContext("2d");
    painter = { canvas, ctx, layers: [], base: null, dirty: false, strokes: 0 };
    syncSauceButtons();

    const newMask = () => {
      const m = document.createElement("canvas");
      m.width = m.height = SAUCE_SIZE;
      return m;
    };
    const topLayer = () => {
      const top = painter.layers[painter.layers.length - 1];
      if (top && top.sauce === state.pizza.sauce) return top;
      const layer = { sauce: state.pizza.sauce, mask: newMask() };
      painter.layers.push(layer);
      return layer;
    };
    const scratch = newMask();

    function render() {
      painter.dirty = false;
      ctx.clearRect(0, 0, SAUCE_SIZE, SAUCE_SIZE);
      ctx.save();
      ctx.shadowColor = "rgba(90, 20, 0, .35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      if (painter.base) ctx.drawImage(painter.base, 0, 0, SAUCE_SIZE, SAUCE_SIZE);
      painter.layers.forEach((layer) => {
        const s = scratch.getContext("2d");
        s.globalCompositeOperation = "source-over";
        s.clearRect(0, 0, SAUCE_SIZE, SAUCE_SIZE);
        s.drawImage(sauceTexture(layer.sauce), 0, 0);
        s.globalCompositeOperation = "destination-in";
        s.drawImage(layer.mask, 0, 0);
        ctx.drawImage(scratch, 0, 0);
      });
      ctx.restore();
      // soften the rim where sauce meets crust
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      const edge = ctx.createRadialGradient(240, 240, SAUCE_R - 10, 240, 240, SAUCE_R + 2);
      edge.addColorStop(0, "#000");
      edge.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, SAUCE_SIZE, SAUCE_SIZE);
      ctx.restore();
    }
    painter.render = render;

    function queueRender() {
      if (painter.dirty) return;
      painter.dirty = true;
      requestAnimationFrame(render);
    }

    function coverage() {
      const data = ctx.getImageData(0, 0, SAUCE_SIZE, SAUCE_SIZE).data;
      let hit = 0, total = 0;
      for (let y = 80; y < 400; y += 8) {
        for (let x = 80; x < 400; x += 8) {
          if (Math.hypot(x - 240, y - 240) > SAUCE_R - 14) continue;
          total += 1;
          if (data[(y * SAUCE_SIZE + x) * 4 + 3] > 120) hit += 1;
        }
      }
      return total ? hit / total : 0;
    }
    painter.coverage = coverage;

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * SAUCE_SIZE,
        y: ((e.clientY - r.top) / r.height) * SAUCE_SIZE,
        px: e.clientX - r.left,
        py: e.clientY - r.top
      };
    }

    function dab(layer, x, y) {
      if (Math.hypot(x - 240, y - 240) > SAUCE_R + 20) return;
      const m = layer.mask.getContext("2d");
      const r = 30 + Math.random() * 6;
      m.save();
      m.beginPath();
      m.arc(240, 240, SAUCE_R, 0, Math.PI * 2);
      m.clip();
      const grad = m.createRadialGradient(x, y, r * 0.45, x, y, r);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = grad;
      m.beginPath();
      m.arc(x, y, r, 0, Math.PI * 2);
      m.fill();
      m.restore();
      // newer sauce covers older sauce underneath
      painter.layers.forEach((other) => {
        if (other === layer) return;
        const o = other.mask.getContext("2d");
        o.save();
        o.globalCompositeOperation = "destination-out";
        const g2 = o.createRadialGradient(x, y, r * 0.3, x, y, r * 0.85);
        g2.addColorStop(0, "rgba(0,0,0,.9)");
        g2.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = g2;
        o.beginPath();
        o.arc(x, y, r, 0, Math.PI * 2);
        o.fill();
        o.restore();
      });
      sauceDabs += 1;
      painter.strokes += 1;
      if (sauceDabs % 16 === 1) AudioFx.tone(300 + (sauceDabs % 3) * 40, 0, 0.06, "triangle", 0.04);
    }

    let painting = false;
    let last = null;
    let layer = null;
    function strokeTo(p) {
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        const steps = Math.max(1, Math.floor(dist / 8));
        for (let i = 1; i <= steps; i += 1) {
          dab(layer, last.x + ((p.x - last.x) * i) / steps, last.y + ((p.y - last.y) * i) / steps);
        }
      } else {
        dab(layer, p.x, p.y);
      }
      last = p;
      queueRender();
      if (painter.strokes % 12 === 0) later(updateSauceMeter, 30);
    }
    function moveLadle(p) {
      ladle.style.transform = `translate(${p.px}px, ${p.py}px)`;
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      AudioFx.unlock();
      painting = true;
      last = null;
      layer = topLayer();
      canvas.setPointerCapture(e.pointerId);
      els.pizzaPaint.classList.add("is-painting", "has-painted");
      const p = toLocal(e);
      moveLadle(p);
      strokeTo(p);
    });
    canvas.addEventListener("pointermove", (e) => {
      const p = toLocal(e);
      moveLadle(p);
      els.pizzaPaint.classList.add("is-hovering");
      if (!painting) return;
      e.preventDefault();
      strokeTo(p);
    });
    ["pointerup", "pointercancel"].forEach((ev) => {
      canvas.addEventListener(ev, () => {
        painting = false;
        last = null;
        els.pizzaPaint.classList.remove("is-painting");
        later(updateSauceMeter, 40);
      });
    });
    canvas.addEventListener("pointerleave", () => {
      if (!painting) els.pizzaPaint.classList.remove("is-hovering");
    });

    // restore previous sauce when coming back to this screen
    if (state.pizza.sauceUrl) {
      const img = new Image();
      img.onload = () => {
        painter.base = img;
        render();
        els.pizzaPaint.classList.add("has-painted");
        updateSauceMeter();
      };
      img.src = state.pizza.sauceUrl;
    } else {
      render();
      updateSauceMeter();
    }
  }

  function updateSauceMeter() {
    if (!painter) return;
    if (painter.dirty) painter.render();
    const pct = Math.round(painter.coverage() * 100);
    const shown = Math.min(100, Math.round(pct / 0.9));
    if (els.sauceFill) els.sauceFill.style.width = `${shown}%`;
    const pctEl = document.getElementById("sauce-pct");
    if (pctEl) pctEl.textContent = `${shown}%`;
    const tip = document.getElementById("sauce-tip");
    const meter = els.sauceFill ? els.sauceFill.parentElement : null;
    const done = shown >= 85;
    if (meter) meter.classList.toggle("is-full", done);
    if (tip) {
      tip.textContent = done ? "Perfect! かんぺき！ つぎへ →" : shown > 40 ? "Good! もうすこし！" : "ピザを なぞって ぬろう！";
    }
    if (done && !painter.cheered) {
      painter.cheered = true;
      AudioFx.celebrate();
    }
  }

  function captureSauce() {
    const canvas = els.pizzaPaint.querySelector("#sauce-canvas");
    if (!canvas || !painter || (sauceDabs === 0 && !painter.base)) {
      return state.pizza.sauceUrl;
    }
    if (painter.dirty) painter.render();
    state.pizza.sauceUrl = canvas.toDataURL("image/png");
    saveProgress();
    return state.pizza.sauceUrl;
  }

  function restoreSauceCanvas() {
    paintBuiltFor = 0;
    sauceDabs = 0;
    buildPaintCanvas();
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
    return clampToPizza(50 + (Math.random() * 40 - 20), 50 + (Math.random() * 40 - 20));
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
    AudioFx.whoosh();
    renderCheese();
    showScreen("cheese");
  }

  const CHEESE_ICONS = {
    cheddar: ["assets/food/burger/cheese_cheddar_unmelted.png"],
    mozzarella: ["assets/food/burger/cheese_mozarella_unmelted.png"],
    both: ["assets/food/burger/cheese_mozarella_unmelted.png", "assets/food/burger/cheese_cheddar_unmelted.png"]
  };

  function renderCheese() {
    els.cheesePreview.innerHTML = Art.pizza(state.pizza.sauceUrl, [], {
      size: "free",
      cheese: state.pizza.cheese
    });
    els.cheeseGrid.innerHTML = Object.values(CHEESES)
      .map((ch) => {
        const sel = state.pizza.cheeseType === ch.id ? " is-active" : "";
        const icons = (CHEESE_ICONS[ch.id] || []).map((src, i) => `<img class="cheese-icon cheese-icon-${i}" src="${src}" alt="">`).join("");
        const en = ch.id === "both" ? "Mozzarella &amp; Cheddar" : ch.name;
        return `<button class="sauce-btn cheese-btn${sel}" type="button" data-id="${ch.id}">
          <span class="cheese-icons${ch.id === "both" ? " is-pair" : ""}">${icons}</span>
          <span class="sauce-en">${en}</span>
          <span class="sauce-ja">${ch.nameJa || ""}</span>
        </button>`;
      })
      .join("");
    if (els.cheeseNext) els.cheeseNext.disabled = !state.pizza.cheeseType;
    if (els.cheeseHint) {
      const ch = typeof getCheese === "function" ? getCheese(state.pizza.cheeseType) : CHEESES[state.pizza.cheeseType];
      els.cheeseHint.textContent = ch
        ? `${ch.name}! ${ch.nameJa} だね！ パラパラ〜！`
        : "チーズをえらんでね！";
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
    saveProgress();
    // sprinkle the new cheese on
    els.cheesePreview.classList.remove("is-sprinkle");
    void els.cheesePreview.offsetWidth;
    els.cheesePreview.classList.add("is-sprinkle");
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
    if (!state.picks.length) return `${state.pizza.drops.length} / ${MAX_TOPS} まい`;
    const counts = pizzaPlacedCounts();
    return state.picks.map((p) => `${p.ingredient.nameJa} ×${counts[p.ingredient.id] || 0}/${MAX_PER_TOPPING}`).join(" · ");
  }

  function syncPizzaDone() {
    if (els.pizzaDone) els.pizzaDone.disabled = !pizzaReadyToCook();
    if (els.pizzaHint) {
      els.pizzaHint.textContent = pizzaReadyToCook()
        ? "おいしそう！ やく で やこう！ 👩‍🍳"
        : "3つのトッピングをピザにのせよう！";
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
          <span class="ing-ja">${ing.nameJa || ""}</span>
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
    const max = 27;
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
      if (els.pizzaHint) els.pizzaHint.textContent = `${ing.nameJa}は ${MAX_PER_TOPPING}まいまで！ もどす で けしてね。`;
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
    saveProgress();
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
    els.stackTitle.textContent = kind === "sandwich" ? "サンドイッチを作ろう！" : "バーガーを作ろう！";
    els.stackLive.innerHTML = Art.stack(state.stack.layers, kind);
    els.stackCount.textContent = `${state.stack.layers.length} / ${MAX_STACK} まい — スタックをタップでへらせるよ`;
    const scroll = els.stackGrid.scrollTop;
    els.stackGrid.innerHTML = stackPalette()
      .map((ing) => {
        const st = layerStyle(ing.id);
        const c = state.picks.find((p) => p.ingredient.id === ing.id);
        const flag = c ? Art.flag(c.country.id) : "";
        return `<button class="ing-btn stack-ing-btn" type="button" data-id="${ing.id}">
          <img class="food-img" src="${ing.image}" alt="${ing.name}" draggable="false">
          <span class="ing-ja">${ing.nameJa || ""}</span>
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
    AudioFx.sizzle();
    const pick = state.picks.find((p) => p.ingredient.id === id);
    state.stack.layers.push(
      pick ? { ingredient: pick.ingredient, country: pick.country } : { ingredient: ing, country: null }
    );
    renderStack();
    saveProgress();
  }

  // ---------- cook + result (all modes) ----------

  function beginCook() {
    showScreen("cook");
    if (state.mode === "pizza") return cookPizza();
    if (state.mode === "burger") return cookBurger();
    if (state.mode === "sandwich") return cookStack();
    return cookChampon();
  }

  // Resolves after ms via later(), so clearTimers() (menu / start over)
  // simply freezes any in-flight cook sequence.
  function wait(ms) {
    return new Promise((resolve) => later(resolve, ms));
  }

  function setCookText(title, sub) {
    els.cookTitle.textContent = title;
    els.cookSub.textContent = sub;
    [els.cookTitle, els.cookSub].forEach((node) => {
      node.classList.remove("is-pop");
      void node.offsetWidth;
      node.classList.add("is-pop");
    });
  }

  function finishCook(delay) {
    later(() => {
      AudioFx.celebrate();
      renderResult();
      showScreen("result");
    }, delay || 700);
  }

  async function cookBurger() {
    const patty = state.burger.patty;
    const cheese = state.burger.cheese;
    const tops = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
    const sizzleBits = Array.from({ length: 10 }, (_, i) => `<i style="--x:${8 + ((i * 37) % 84)}%;--d:${(i * 0.13).toFixed(2)}s"></i>`).join("");
    els.cookBowl.innerHTML = `
      <div class="burger-scene">
        <div class="grill-station">
          <div class="grill-glow"></div>
          <div class="grill-flames"><span></span><span></span><span></span><span></span><span></span></div>
          <div class="grill-plate"></div>
          <div class="grill-food">
            <img class="grill-patty" src="${patty ? patty.image : BURGER_PATTIES[0].image}" alt="">
            ${cheese ? `<img class="grill-cheese" src="${cheese.image}" alt=""><img class="grill-melt" src="${cheese.meltImage}" alt="">` : ""}
          </div>
          <div class="sizzle">${sizzleBits}</div>
          <div class="smoke"><span></span><span></span><span></span></div>
        </div>
        <div class="burger-board">
          ${Art.burger(patty, cheese, tops, { cooked: true, pending: true })}
        </div>
      </div>`;
    const scene = els.cookBowl.querySelector(".burger-scene");
    const grill = scene.querySelector(".grill-station");
    const burgerEl = scene.querySelector(".burger");
    const layerEls = [...burgerEl.querySelectorAll(".burger-layer")];

    setCookText("Grill!", `${patty ? patty.nameJa : "パティ"}をやこう！ ジュ〜ッ！`);
    AudioFx.sizzle();
    await wait(450);
    AudioFx.sizzle();
    await wait(650);
    grill.classList.add("is-flip");
    AudioFx.whoosh();
    await wait(700);
    AudioFx.sizzle();
    if (cheese) {
      grill.classList.add("is-cheese");
      setCookText(layerLabel(cheese, "cheese"), `${cheese.nameJa}チーズ！ とろ〜り！`);
      AudioFx.thump();
      await wait(450);
      grill.classList.add("is-melt");
      AudioFx.sizzle();
      await wait(1000);
    }
    scene.classList.add("is-assembling");
    AudioFx.whoosh();
    await wait(450);

    const labels = layerEls.map((node) => node.querySelector("img").alt);
    for (let i = 0; i < layerEls.length; i += 1) {
      const node = layerEls[i];
      const kind = node.classList.contains("burger-cheese") ? "cheese" : "";
      const ja = i === 0 ? "下のバンズ！" : i === layerEls.length - 1 ? "上のバンズ！ のせて〜！" : "のせたよ！";
      const jaName = i === 0 || i === layerEls.length - 1 ? "" : jaFor(i, patty, cheese, tops);
      if (kind !== "cheese") setCookText(`${labels[i]}!`, `${jaName}${ja}`);
      node.classList.remove("is-pending");
      node.classList.add("is-dropping");
      AudioFx.thump(i);
      await wait(kind === "cheese" ? 300 : 620);
    }
    burgerEl.classList.add("is-squish");
    setCookText("Squish!", "ぎゅっ！ できあがり！");
    AudioFx.cook();
    await wait(650);
    burgerEl.insertAdjacentHTML("beforeend", `<div class="cook-sparkles">${sparkleBits(10)}</div>`);
    finishCook(900);
  }

  function layerLabel(cheese) {
    return `${/cheese/i.test(cheese.name) ? cheese.name : `${cheese.name} Cheese`}!`;
  }

  // Japanese name for stacked layer i (bun, patty, cheese, toppings…, bun).
  function jaFor(i, patty, cheese, tops) {
    const mids = [];
    if (patty) mids.push(patty.nameJa + "パティ");
    if (cheese) mids.push(cheese.nameJa + "チーズ");
    tops.forEach((t) => mids.push(t.ingredient.nameJa));
    return mids[i - 1] ? `${mids[i - 1]}！ ` : "";
  }

  function sparkleBits(n) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return `<i style="--tx:${(Math.cos(a) * 60).toFixed(0)}%;--ty:${(Math.sin(a) * 60).toFixed(0)}%;--d:${(i % 3) * 0.08}s"></i>`;
    }).join("");
  }

  async function cookChampon() {
    const ings = state.picks.map((p) => p.ingredient);
    els.cookBowl.innerHTML = Art.bowl(ings, { size: "xl", stage: "empty", cooking: true });
    const bowl = els.cookBowl.querySelector(".bowl");
    const setStage = (stage, add) => {
      bowl.className = bowl.className.replace(/bowl-stage-\S+/, `bowl-stage-${stage}`);
      if (add) bowl.classList.add(add);
    };
    setCookText("Hot soup!", "あつあつスープ！ トポトポ〜！");
    AudioFx.pour();
    await wait(1300);
    setStage("noodles", "show-noodles");
    setCookText("Noodles!", "めんをいれるよ！ ちゅるちゅる〜！");
    AudioFx.plop();
    await wait(1100);
    for (let i = 0; i < ings.length; i += 1) {
      setStage(`top${i + 1}`, `show-t${i}`);
      setCookText(`${ings[i].name}!`, `${ings[i].nameJa}！ ポチャン！`);
      AudioFx.plop();
      later(() => AudioFx.plop(), 160);
      await wait(1000);
    }
    setStage("done", "show-garnish");
    setCookText("Champon!", "ちゃんぽん！ いただきます！");
    AudioFx.cook();
    bowl.insertAdjacentHTML("beforeend", `<div class="cook-sparkles">${sparkleBits(10)}</div>`);
    finishCook(1100);
  }

  function cookPizza() {
    const { sauceUrl, drops, cheese } = state.pizza;
    const raw = Art.pizza(sauceUrl, drops, { size: "free", cheese });
    const baked = Art.pizza(sauceUrl, drops, { size: "free", cheese, cooked: true, sliced: true });
    els.cookBowl.innerHTML = Art.pizzaCookStage(raw, baked);
    const stage = els.cookBowl.querySelector(".pz-stage");
    const mover = stage.querySelector(".pz-mover");
    const tilt = stage.querySelector(".pz-tilt");
    const build = stage.querySelector(".pz-raw");
    const bakedEl = stage.querySelector(".pz-baked");
    const unit = () => stage.getBoundingClientRect().width / 500;
    // Positions in the oven's 500x400 drawing: centre x/y, pizza width, tilt.
    const P = {
      counter: { x: 250, y: 190, w: 300, t: 0 },
      peel: { x: 250, y: 300, w: 262, t: 62 },
      oven: { x: 250, y: 246, w: 172, t: 68 },
      reveal: { x: 250, y: 196, w: 330, t: 0 }
    };
    const moverT = (p) => {
      const u = unit();
      const base = 0.62 * 500;
      const s = p.w / base;
      return `translate(${((p.x - base / 2) * u).toFixed(1)}px, ${((p.y - base / 2) * u).toFixed(1)}px) scale(${s.toFixed(3)})`;
    };
    const tiltT = (p) => `perspective(1100px) rotateX(${p.t}deg)`;
    const place = (p) => {
      mover.style.transform = moverT(p);
      tilt.style.transform = tiltT(p);
    };
    const move = (from, to, ms, easing) => {
      const opts = { duration: ms, easing: easing || "cubic-bezier(.45,0,.3,1)", fill: "forwards" };
      mover.animate([{ transform: moverT(from) }, { transform: moverT(to) }], opts);
      tilt.animate([{ transform: tiltT(from) }, { transform: tiltT(to) }], opts);
      return wait(ms);
    };

    (async () => {
      place(P.counter);
      setCookText("Dough!", "きじを のばそう！ くるくる〜！");
      build.classList.add("b-dough");
      AudioFx.whoosh();
      await wait(800);
      setCookText("Sauce!", "ソースを ぬりぬり！");
      build.classList.add("b-sauce");
      AudioFx.pour();
      await wait(950);
      setCookText("Cheese!", "チーズを パラパラ〜！");
      build.classList.add("b-cheese");
      AudioFx.select();
      await wait(900);
      setCookText("Toppings!", "トッピングを のせたよ！");
      build.classList.add("b-tops");
      [0, 120, 240].forEach((d) => later(() => AudioFx.thump(d / 60), d));
      await wait(1100);

      setCookText("Into the oven!", "オーブンへ！ シュッ！");
      stage.classList.add("show-oven", "show-peel");
      AudioFx.whoosh();
      await move(P.counter, P.peel, 800, "cubic-bezier(.3,1.2,.5,1)");
      await wait(150);
      AudioFx.whoosh();
      await move(P.peel, P.oven, 900, "cubic-bezier(.5,0,.3,1)");

      stage.classList.add("is-baking");
      setCookText("Bake!", "やいているよ… 3");
      AudioFx.sizzle();
      bakedEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2100, easing: "ease-in", fill: "forwards" });
      await wait(700);
      els.cookSub.textContent = "やいているよ… 2";
      AudioFx.sizzle();
      await wait(700);
      els.cookSub.textContent = "やいているよ… 1";
      AudioFx.sizzle();
      await wait(700);
      stage.classList.remove("is-baking");
      setCookText("Ding!", "できたて！ あちち！");
      AudioFx.ding();
      stage.classList.add("is-hot");
      await wait(300);
      await move(P.oven, P.peel, 850, "cubic-bezier(.4,0,.2,1)");
      await wait(150);
      stage.classList.remove("show-oven");
      setCookText("Pizza!", "ピザ！ こんがり とろ〜り！");
      AudioFx.cook();
      await move(P.peel, P.reveal, 800, "cubic-bezier(.3,1.25,.5,1)");
      stage.classList.remove("show-peel");
      stage.classList.add("is-slicing");
      setCookText("Cut!", "8つに カット！");
      [0, 1, 2, 3].forEach((i) => later(() => AudioFx.chop(), i * 320 + 60));
      await wait(1400);
      stage.insertAdjacentHTML("beforeend", `<div class="cook-sparkles">${sparkleBits(12)}</div>`);
      finishCook(900);
    })();
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
    const label = kind === "sandwich" ? "サンドイッチ！" : "バーガー！";
    const stages = [
      { n: 0, title: kind === "sandwich" ? "パン！" : "下のパン！", sub: kind === "sandwich" ? "パン！ いくよ〜！" : "下のパン！ いくよ〜！" },
      ...layers.map((layer, i) => ({ n: i + 1, title: `${layerIng(layer).nameJa || layerIng(layer).name}！`, sub: `${layerIng(layer).nameJa || layerIng(layer).name}！ のせてのせて！` })),
      { n: layers.length, title: label, sub: label + " できた！ いただきます！", done: true }
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

  const FOOD_NOUN = { champon: "champon", pizza: "pizza", burger: "burger", sandwich: "sandwich" };

  // "an MPS pizza" vs "a BLT burger": letters whose NAME starts with a vowel sound.
  function articleFor(letter) {
    return "AEFHILMNORSX".indexOf(letter) !== -1 ? "an" : "a";
  }

  function countryInSentence(c) {
    return c.name.replace(/^The /, "the ");
  }

  function resultFoodHtml() {
    if (state.mode === "pizza") {
      return Art.pizza(state.pizza.sauceUrl, state.pizza.drops, {
        size: "xl",
        cheese: state.pizza.cheese,
        cooked: true,
        sliced: true
      });
    }
    if (state.mode === "burger") {
      const tops = state.picks.map((p) => ({ ingredient: p.ingredient, country: p.country }));
      return Art.burger(state.burger.patty, state.burger.cheese, tops, { cooked: true, labels: true }) +
        `<div class="tap-chip">👆 Tap the burger!</div>`;
    }
    if (state.mode === "sandwich") return Art.stack(state.stack.layers, "sandwich");
    return Art.bowl(state.picks.map((p) => p.ingredient), { size: "xl", stage: "done", still: true });
  }

  // The speaking frame students read out loud:
  //   "My burger is a BLT burger. B is for Bacon. It's from Vietnam."
  function renderResult() {
    const mode = state.mode || "champon";
    const noun = FOOD_NOUN[mode];
    const nounCap = noun.charAt(0).toUpperCase() + noun.slice(1);
    const picks = state.picks.filter((p) => p.ingredient);
    const letters = picks.map((p) => (p.ingredient.name || "?").charAt(0).toUpperCase());
    const acro = letters.join("");
    const tile = (l, i, cls) => `<span class="${cls}" style="--c:${LETTER_COLORS[i % LETTER_COLORS.length]};--d:${(0.15 + i * 0.12).toFixed(2)}s">${l}</span>`;

    els.resultBanner.innerHTML =
      `<span class="acro-word">${letters.map((l, i) => tile(l, i, "acro-tile")).join("")}</span>` +
      `<span class="banner-food">${nounCap}!</span>`;
    els.resultBowl.innerHTML = resultFoodHtml();
    els.resultList.innerHTML =
      `<div class="say-main">My ${noun} is ${articleFor(letters[0] || "B")} ` +
      `<span class="say-acro">${letters.map((l, i) => tile(l, i, "say-letter")).join("")}</span> ${noun}.</div>` +
      picks.map((pick, i) => {
        const ing = pick.ingredient;
        const c = pick.country;
        const color = LETTER_COLORS[i % LETTER_COLORS.length];
        return `<div class="letter-row is-in" style="animation-delay:${(0.35 + i * 0.18).toFixed(2)}s">
          <div class="letter-circle" style="background:${color}">${letters[i]}</div>
          <div class="letter-copy">
            <div class="name"><b style="color:${color}">${letters[i]}</b> is for ${ing.name}.</div>
            <div class="from">${c ? `${Art.flag(c.id)}<span>It's from ${countryInSentence(c)}.</span>` : ""}</div>
          </div>
        </div>`;
      }).join("");
    els.resultList.setAttribute("aria-label", `My ${noun} is ${articleFor(letters[0] || "B")} ${acro} ${noun}.`);
    if (mode === "burger") later(() => attachBurgerPressToggle(), 100);
    els.resultChef.innerHTML = Art.chef(mode);
    els.resultChef.className = `mascot mascot-result chef-${mode}`;
    burstConfetti();
  }

  // Tap the finished burger to pull the layers apart and read every
  // layer's English name; tap again to squish it back together.
  function attachBurgerPressToggle() {
    const burger = els.resultBowl.querySelector(".burger");
    if (!burger) return;
    burger.setAttribute("role", "button");
    burger.setAttribute("tabindex", "0");
    burger.setAttribute("aria-label", "Tap to look inside the burger");
    function toggle() {
      const open = burger.classList.toggle("is-exploded");
      if (open) AudioFx.whoosh(); else AudioFx.thump(2);
      burger.classList.remove("is-bounce");
      void burger.offsetWidth;
      if (!open) burger.classList.add("is-bounce");
    }
    burger.addEventListener("click", toggle);
    burger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
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

  function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // An <svg><foreignObject> image can't load outside files, so every
  // src/href is swapped for an inline data: URL before rasterising.
  async function inlineAssets(html) {
    const urls = new Set();
    html.replace(/(?:src|href)="((?!data:|#)[^"]+)"/g, (_m, url) => { urls.add(url); return _m; });
    const map = {};
    await Promise.all([...urls].map(async (url) => {
      try {
        const blob = await fetch(new URL(url, location.href).href).then((r) => r.blob());
        map[url] = await blobToDataUrl(blob);
      } catch (error) {
        void error;
      }
    }));
    return html.replace(/((?:src|href)=")((?!data:|#)[^"]+)"/g, (_m, pre, url) => `${pre}${map[url] || url}"`);
  }

  async function downloadResultImage() {
    const css = await fetch("css/game.css").then((response) => response.text());
    const xhtml = (html) => html
      .replace(/<img([^>]*?)\/?>/g, "<img$1 />")
      .replace(/<br>/g, "<br />")
      .replace(/&nbsp;/g, "&#160;")
      .replace(/<svg(?![^>]*xmlns=)/g, '<svg xmlns="http://www.w3.org/2000/svg"');
    const food = els.resultBowl.cloneNode(true);
    food.querySelectorAll(".tap-chip, .burger-label, .cook-sparkles").forEach((node) => node.remove());
    food.querySelectorAll(".is-exploded").forEach((node) => node.classList.remove("is-exploded"));
    const defs = document.querySelector(".svg-defs");
    const [resultBowl, resultList, chef, title, defsHtml] = await Promise.all([
      inlineAssets(xhtml(food.innerHTML)),
      inlineAssets(xhtml(els.resultList.innerHTML)),
      inlineAssets(xhtml(els.resultChef.innerHTML)),
      Promise.resolve(xhtml(els.resultBanner.innerHTML)),
      Promise.resolve(defs ? xhtml(defs.outerHTML) : "")
    ]);
    const exportCss = `
      ${css}
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .export-page { position: relative; width: 1200px; height: 900px; box-sizing: border-box; padding: 26px 28px 24px; background: #c62828; background-image: linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.08) 75%), linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.08) 75%); background-size: 64px 64px; background-position: 0 0, 32px 32px; font-family: Nunito, "Hiragino Maru Gothic ProN", sans-serif; overflow: hidden; }
      .export-banner { margin: 0 0 20px; font-size: 72px !important; padding: 0 !important; min-height: 0; flex-wrap: nowrap; }
      .export-layout { height: 720px; display: flex; gap: 24px; }
      .export-left { position: relative; width: 57%; display: flex; align-items: center; justify-content: center; padding: 18px; box-sizing: border-box; background: repeating-linear-gradient(180deg, #66bb6a 0 24px, #43a047 24px 48px); border: 8px solid #ffe082; border-radius: 30px; }
      .export-left #result-bowl { width: 100%; display: flex; align-items: center; justify-content: center; }
      .export-left #result-bowl .bowl { width: 600px; }
      .export-left #result-bowl .pizza { width: 600px; max-width: 600px; }
      .export-left #result-bowl .burger { width: 540px; }
      .export-left #result-bowl .stack { width: 480px; }
      .export-right { flex: 1; display: flex; }
      .export-left #result-bowl { padding-left: 0 !important; }
      .export-left #result-bowl .burger { width: 480px !important; }
      .export-right .letter-board { gap: 22px; padding: 26px 24px; }
      .export-right .say-main { font-size: 28px !important; }
      .export-right .letter-circle { width: 96px !important; height: 96px !important; font-size: 60px !important; }
      .export-right .letter-copy .name { font-size: 34px !important; }
      .export-right .letter-copy .from { font-size: 24px !important; }
      .export-right .flag-img { width: 56px !important; }
      .export-chef { position: absolute; left: 36px; bottom: 26px; width: 150px; }
      .export-chef img { width: 100%; }
    `;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="900"><foreignObject width="1200" height="900"><div xmlns="http://www.w3.org/1999/xhtml"><style>${exportCss}</style>${defsHtml}<main class="export-page"><h1 class="result-banner export-banner">${title}</h1><div class="export-layout"><section class="export-left"><div id="result-bowl">${resultBowl}</div></section><section class="export-right"><div id="result-list" class="letter-board">${resultList}</div></section></div><div class="export-chef">${chef}</div></main></div></foreignObject></svg>`;
    const image = await loadCanvasImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    // give the browser a beat to decode the inlined pictures
    await new Promise((resolve) => setTimeout(resolve, 150));
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;
    canvas.getContext("2d").drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tomachi-chef-${state.mode || "dish"}.png`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1000);
    }, "image/png");
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
        if (state.mode === "burger") {
          renderBurgerCheese();
          showScreen("burgerCheese");
        } else if (state.mode === "pizza") {
          renderCheese();
          showScreen("cheese");
        } else {
          goTitle();
        }
      }
      return;
    }
    if (state.screen === "burgerCheese") {
      renderBurgerPatty();
      showScreen("burgerPatty");
      return;
    }
    if (state.screen === "burgerPatty") {
      goTitle();
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
      enterSauce();
      return;
    }
    if (mode === "burger") {
      state.burger = { patty: null, cheese: null };
      state.stack = { kind: mode, layers: [] };
      renderBurgerPatty();
      showScreen("burgerPatty");
      return;
    }
    if (mode === "sandwich") {
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
  // Menu button: always reachable. Mid-creation it asks first, because
  // going home clears the saved dish.
  if (els.menu) els.menu.addEventListener("click", () => {
    AudioFx.click();
    if (state.screen === "title") return;
    if (!els.confirmModal.hidden) closeConfirm(true);
    if (state.screen === "result" || state.screen === "cook") {
      goTitle();
      return;
    }
    openConfirm(Art.chef(state.mode || "champon"), "Back to the menu?", "メニューにもどる？", () => {
      els.confirmModal.hidden = true;
      confirmOnYes = null;
      busy = false;
      goTitle();
    }, "いま作っているものは きえるよ。いい？");
  });
  if (els.print) els.print.addEventListener("click", () => {
    AudioFx.click();
    downloadResultImage().catch(() => els.print.setAttribute("aria-label", "Image download failed"));
  });

  els.pickBack.addEventListener("click", goBack);
  els.countryBack.addEventListener("click", goBack);
  els.pickRestart.addEventListener("click", startOver);
  els.countryRestart.addEventListener("click", startOver);
  els.mute.addEventListener("click", () => {
    const muted = AudioFx.toggleMute();
    els.mute.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${muted ? "mute" : "sound"}"/></svg>`;
    els.mute.classList.toggle("is-muted", muted);
    els.mute.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  });

  // QR code for sharing the game with the class
  function openQr() {
    AudioFx.click();
    els.qrModal.hidden = false;
  }
  function closeQr() {
    AudioFx.click();
    els.qrModal.hidden = true;
  }
  if (els.qr) els.qr.addEventListener("click", openQr);
  if (els.qrClose) els.qrClose.addEventListener("click", closeQr);
  if (els.qrModal) els.qrModal.addEventListener("click", (e) => {
    if (e.target === els.qrModal) closeQr();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.qrModal && !els.qrModal.hidden) closeQr();
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
      saveProgress();
    });
  });
  if (els.sauceClear) els.sauceClear.addEventListener("click", () => {
    AudioFx.click();
    sauceDabs = 0;
    state.pizza.sauceUrl = null;
    paintBuiltFor = 0;
    buildPaintCanvas();
    saveProgress();
  });
  // Sauce is the first pizza step, so "back" means back to the menu.
  if (els.sauceBack) els.sauceBack.addEventListener("click", () => {
    AudioFx.click();
    goTitle();
  });
  // keep the save fresh while painting
  if (els.pizzaPaint) els.pizzaPaint.addEventListener("pointerup", () => {
    later(() => {
      if (state.screen === "sauce") captureSauce();
    }, 120);
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
    // sauce + cheese are on: now choose the 3 toppings (and where they're from)
    if (state.picks.length >= TOTAL) {
      enterToppings();
      return;
    }
    state.slot = state.picks.length;
    state.pending = null;
    renderPick();
    showScreen("pick");
  });

  // pizza toppings
  setupPizzaDrag();
  if (els.pizzaBack) els.pizzaBack.addEventListener("click", () => {
    AudioFx.click();
    backToPickEdit();
  });
  if (els.pizzaUndo) els.pizzaUndo.addEventListener("click", () => {
    AudioFx.click();
    state.pizza.drops.pop();
    refreshPizzaLive();
    saveProgress();
  });
  if (els.pizzaDone) els.pizzaDone.addEventListener("click", () => {
    if (!pizzaReadyToCook()) {
      AudioFx.click();
      if (els.pizzaHint) {
        els.pizzaHint.textContent = "3つのトッピングをそれぞれのせてね！ 🍕";
      }
      els.pizzaLive.classList.remove("is-drop");
      void els.pizzaLive.offsetWidth;
      els.pizzaLive.classList.add("is-drop");
      return;
    }
    AudioFx.click();
    beginCook();
  });

  // burger patty / cheese
  if (els.burgerPattyGrid) els.burgerPattyGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".burger-pick-btn");
    if (!btn) return;
    AudioFx.click();
    selectBurgerPatty(btn.dataset.id);
  });
  if (els.burgerCheeseGrid) els.burgerCheeseGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".burger-pick-btn");
    if (!btn) return;
    AudioFx.click();
    selectBurgerCheese(btn.dataset.id);
  });
  if (els.burgerPattyNext) els.burgerPattyNext.addEventListener("click", () => {
    if (!state.burger.patty) return;
    AudioFx.click();
    renderBurgerCheese();
    showScreen("burgerCheese");
  });
  if (els.burgerPattyBack) els.burgerPattyBack.addEventListener("click", () => {
    AudioFx.click();
    goTitle();
  });
  if (els.burgerCheeseNext) els.burgerCheeseNext.addEventListener("click", () => {
    if (!state.burger.cheese) return;
    AudioFx.click();
    // now go to topping picks (3)
    state.picks = [];
    state.pending = null;
    state.slot = 0;
    renderPick();
    showScreen("pick");
  });
  if (els.burgerCheeseBack) els.burgerCheeseBack.addEventListener("click", () => {
    AudioFx.click();
    renderBurgerPatty();
    showScreen("burgerPatty");
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
    saveProgress();
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
    saveProgress();
  });
  if (els.stackDone) els.stackDone.addEventListener("click", () => {
    AudioFx.click();
    beginCook();
  });

  // Test hook: open index.html?dev to drive screens from the console.
  if (/[?&]dev\b/.test(location.search)) {
    window.TC = { state, renderResult, showScreen, beginCook, renderPick, renderCountry, goTitle, startMode, downloadResultImage };
  }

  if (!restoreProgress()) goTitle();
})();
