const Art = {
  ingredient(id) {
    const ing = getIngredient(id);
    const src = ing ? ing.image : "assets/food/tomato.svg";
    const name = ing ? ing.name : "";
    return `<img class="food-img" src="${src}" alt="${name}">`;
  },

  flag(id) {
    const country = getCountry(id);
    const code = country ? country.code : "jp";
    const name = country ? country.name : "";
    return `<img class="flag-img" src="assets/flags/${code}.svg" alt="${name}">`;
  },

  steam() {
    return `
      <div class="steam" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>`;
  },

  chef(mode) {
    const chefs = {
      champon: "assets/chef.png",
      pizza: "assets/pizzachef.png",
      burger: "assets/burgerchef.png",
      sandwich: "assets/sandwichchef.png"
    };
    const src = chefs[mode] || chefs.champon;
    const label = mode && chefs[mode] ? `${mode} chef` : "Chef";
    return `<img class="chef-img" src="${src}" alt="${label}">`;
  },

  noodles() {
    const rows = [
      "M6 26 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0",
      "M14 40 q10 14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0",
      "M6 54 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0",
      "M26 68 q10 12 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0",
      "M52 50 q48 -34 96 0",
      "M70 50 q30 -20 60 0",
      "M30 22 c10 -8 22 -2 18 8 c-3 8 -15 8 -18 0",
      "M152 60 c10 -8 22 -2 18 8 c-3 8 -15 8 -18 0"
    ];
    const dark = rows
      .map((d) => `<path d="${d}" stroke="#c9a35c" stroke-width="11"/>`)
      .join("");
    const light = rows
      .map((d) => `<path d="${d}" stroke="#fff8e6" stroke-width="7"/>`)
      .join("");
    return `
      <svg class="noodle-overlay" viewBox="0 0 200 90" aria-hidden="true">
        <g class="noodles" fill="none" stroke-linecap="round">
          ${dark}
          ${light}
        </g>
      </svg>`;
  },

  noodleDrape() {
    const rows = [
      "M30 22 q10 -12 20 0 t20 0 t20 0 t20 0 t20 0 t20 0",
      "M44 44 q10 12 20 0 t20 0 t20 0 t20 0 t20 0"
    ];
    const dark = rows
      .map((d) => `<path d="${d}" stroke="#c9a35c" stroke-width="10"/>`)
      .join("");
    const light = rows
      .map((d) => `<path d="${d}" stroke="#fff8e6" stroke-width="6"/>`)
      .join("");
    return `
      <svg class="noodle-drape" viewBox="0 0 200 70" aria-hidden="true">
        <g fill="none" stroke-linecap="round">
          ${dark}
          ${light}
        </g>
      </svg>`;
  },

  pizzaBase(cooked) {
    if (!cooked) {
      return `
      <svg class="pizza-base" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill="#b97a2a"/>
        <circle cx="100" cy="100" r="88" fill="#e8b26a"/>
        <circle cx="100" cy="100" r="72" fill="#f7d9a0"/>
        <circle cx="100" cy="100" r="72" fill="none" stroke="#e0b96f" stroke-width="3" opacity="0.7"/>
        <ellipse cx="78" cy="70" rx="30" ry="16" fill="#fff" opacity="0.25"/>
      </svg>`;
    }
    // Cooked pizza uses the baked base photo, with sauce + melted cheese
    // images layered on top in pizza().
    return `<img class="pizza-base-img" src="assets/pizzabase.png" alt="">`;
  },

  // Cooked melted-cheese overlays. Cheddar goes down first, mozzarella on
  // top, so the combo lists cheddar before mozzarella in the DOM.
  cookedCheese(type) {
    const def = typeof getCheese === "function" ? getCheese(type) : (CHEESES[type] || null);
    if (!def) return "";
    if (def.meltImgs && def.meltImgs.length) {
      return def.meltImgs
        .map((src) => {
          const cls = src.indexOf("mozarella") !== -1 || src.indexOf("mozzarella") !== -1
            ? "pizza-melt-img pizza-melt-mozz"
            : "pizza-melt-img pizza-melt-cheddar";
          return `<img class="${cls}" src="${src}" alt="">`;
        })
        .join("");
    }
    if (def.meltImg) {
      const cls = def.id === "mozzarella" || def.id === "mozarella"
        ? "pizza-melt-img pizza-melt-mozz"
        : "pizza-melt-img pizza-melt-cheddar";
      return `<img class="${cls}" src="${def.meltImg}" alt="">`;
    }
    return "";
  },

  // Melted cheese as its own layer ABOVE the sauce image but UNDER toppings.
  // Slightly narrower than the sauce zone so a red rim still peeks out.
  meltLayer(melt) {
    const spotAngles = [12, 48, 83, 120, 158, 195, 232, 268, 305, 340];
    const spots = spotAngles
      .map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const rr = 10 + ((i * 37) % 40);
        const cx = (100 + rr * Math.cos(rad)).toFixed(1);
        const cy = (100 + rr * Math.sin(rad)).toFixed(1);
        const rx = (2 + ((i * 13) % 25) / 10).toFixed(1);
        const op = (0.25 + ((i * 23) % 20) / 100).toFixed(2);
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx * 0.8).toFixed(1)}" fill="${melt.spot}" opacity="${op}"/>`;
      })
      .join("");
    const blisters = [[80, 72], [126, 112], [96, 132]]
      .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${melt.spot}" opacity="0.55"/>`)
      .join("");
    return `
      <svg class="pizza-melt" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="65" fill="${melt.base}"/>
        <ellipse cx="100" cy="94" rx="44" ry="38" fill="#ffffff" opacity="0.12"/>
        ${spots}
        ${blisters}
        <circle cx="100" cy="100" r="65" fill="none" stroke="${melt.wash}" stroke-width="3" opacity="0.7"/>
      </svg>`;
  },

  pizza(sauceUrl, drops, opts) {
    const options = opts || {};
    const size = options.size || "lg";
    const cooked = !!options.cooked;
    const cheese = options.cheese || null;
    const tops = (drops || [])
      .map((d) => {
        const ing = d.ing || d.ingredient || d;
        const x = d.x !== undefined ? d.x : 20 + Math.random() * 60;
        const y = d.y !== undefined ? d.y : 20 + Math.random() * 60;
        const r = d.r !== undefined ? d.r : Math.random() * 360;
        const s = d.s || 0.9 + Math.random() * 0.5;
        return `<img class="pizza-top${cooked ? " is-baked" : ""}" src="${ing.image}" alt="${ing.name}" ` +
          `style="left:${x}%;top:${y}%;--r:${r}deg;--s:${s}">`;
      })
      .join("");
    const shreds = cheese && cheese.pieces
      ? cheese.pieces
        .map((pc) => {
          const base = `left:${pc.x}%;top:${pc.y}%;--r:${pc.r}deg;width:${pc.w}%;background:${pc.color}`;
          if (pc.kind === "ball") {
            return `<span class="cheese-ball" style="${base};border-radius:${pc.br}"></span>`;
          }
          return `<span class="cheese-shred" style="${base}"></span>`;
        })
        .join("")
      : "";
    const cheeseType = cheese ? (cheese.type || cheese.id) : null;
    // Cooked: photo overlays (cheddar first, mozzarella on top). Raw keeps
    // the scatter pieces below and never uses the photos.
    const meltImgs = cooked && cheeseType ? this.cookedCheese(cheeseType) : "";
    return `
      <div class="pizza pizza-${size}${cooked ? " is-cooked" : ""}">
        ${this.pizzaBase(cooked)}
        ${sauceUrl ? `<img class="pizza-sauce-img${cooked ? " is-baked" : ""}" src="${sauceUrl}" alt="">` : ""}
        ${meltImgs}
        ${shreds ? `<div class="pizza-cheese">${shreds}</div>` : ""}
        <div class="pizza-toppings">${tops}</div>
        ${cooked ? `<div class="pizza-char" aria-hidden="true"></div>` : ""}
      </div>`;
  },

  ovenScene(mode, pizzaHtml) {
    // mode: "in" (paddle rises into the mouth, trim overlaps it = inside),
    // "bake" (pizza on the stone amid flames), "out" (paddle lowers back, cooked).
    const peel = mode === "bake" ? "" : `
      <div class="peel ${mode === "in" ? "peel-in" : "peel-out"}">
        <div class="peel-pizza">${pizzaHtml || ""}${mode === "out" ? this.steam() : ""}</div>
        <div class="peel-blade"></div>
        <div class="peel-handle"></div>
      </div>`;
    const inside = mode === "bake" ? `<div class="mouth-pizza">${pizzaHtml || ""}</div>` : "";
    return `
      <div class="oven-scene oven-${mode}">
        <div class="brick-dome">
          <div class="dome-sign">PIZZA OVEN</div>
          <div class="mouth-interior">
            <div class="mouth-glow"></div>
            <div class="mouth-fire"><span></span><span></span><span></span></div>
            ${inside}
            <div class="mouth-stone"></div>
          </div>
          ${peel}
          <div class="mouth-frame"></div>
          <div class="fg-flame"><span></span><span></span></div>
        </div>
      </div>`;
  },

  bunTop() {
    return `
      <svg class="stack-cap" viewBox="0 0 200 90" aria-hidden="true">
        <path d="M10 78 Q12 22 100 18 Q188 22 190 78 Z" fill="#efb45e" stroke="#8d5a1b" stroke-width="5"/>
        <path d="M10 78 L190 78 L184 88 L16 88 Z" fill="#e09a3e" stroke="#8d5a1b" stroke-width="4"/>
        <g fill="#fff3d6">
          <ellipse cx="70" cy="45" rx="7" ry="4" transform="rotate(-20 70 45)"/>
          <ellipse cx="100" cy="36" rx="7" ry="4"/>
          <ellipse cx="130" cy="45" rx="7" ry="4" transform="rotate(20 130 45)"/>
          <ellipse cx="85" cy="60" rx="7" ry="4" transform="rotate(-10 85 60)"/>
          <ellipse cx="115" cy="60" rx="7" ry="4" transform="rotate(10 115 60)"/>
        </g>
      </svg>`;
  },

  bunBottom() {
    return `
      <svg class="stack-cap" viewBox="0 0 200 50" aria-hidden="true">
        <path d="M12 8 L188 8 L184 34 Q182 44 100 44 Q18 44 16 34 Z" fill="#efb45e" stroke="#8d5a1b" stroke-width="5"/>
      </svg>`;
  },

  breadTop() {
    return `
      <svg class="stack-cap" viewBox="0 0 200 70" aria-hidden="true">
        <path d="M30 62 L30 30 Q30 8 100 8 Q170 8 170 30 L170 62 Z" fill="#f5d492" stroke="#8d5a1b" stroke-width="5"/>
        <path d="M44 62 L44 32 Q44 18 100 18 Q156 18 156 32 L156 62 Z" fill="#fbe3ae" />
      </svg>`;
  },

  breadBottom() {
    return `
      <svg class="stack-cap" viewBox="0 0 200 40" aria-hidden="true">
        <rect x="30" y="6" width="140" height="28" rx="6" fill="#f5d492" stroke="#8d5a1b" stroke-width="5"/>
      </svg>`;
  },

  stack(layers, kind) {
    const isBurger = kind !== "sandwich";
    const capTop = isBurger ? this.bunTop() : this.breadTop();
    const capBottom = isBurger ? this.bunBottom() : this.breadBottom();
    const items = (layers || []).slice().reverse().map((layer) => {
      const ing = layer.ingredient || layer.ing || layer;
      const st = layerStyle(ing.id);
      return `<div class="stack-layer" style="--c:${st.color};--e:${st.edge}" title="${ing.name}">` +
        `<img src="${ing.image}" alt="${ing.name}"><span>${st.label}</span></div>`;
    }).join("");
    return `
      <div class="stack stack-${isBurger ? "burger" : "sandwich"}">
        <div class="stack-capwrap">${capTop}</div>
        <div class="stack-layers">${items || `<div class="stack-empty">Tap yummy things →</div>`}</div>
        <div class="stack-capwrap">${capBottom}</div>
      </div>`;
  },

  bowl(ingredients, opts) {
    const options = opts || {};
    const size = options.size || "lg";
    const stage = options.stage || "done";
    const showSteam = options.steam !== false;
    const scales = [1, 0.9, 1.08];
    const toppings = (ingredients || [])
      .map((ing, i) => {
        return `<span class="topping-wrap topping-${i}" style="--d:${i * 0.35}s;--s:${scales[i % scales.length]}">` +
          `<img class="topping" src="${ing.image}" alt="${ing.name}">` +
          `<span class="broth-sheen" aria-hidden="true"></span></span>`;
      })
      .join("");

    return `
      <div class="bowl bowl-${size} bowl-stage-${stage}">
        ${showSteam ? this.steam() : ""}
        <div class="bowl-art">
          <img class="bowl-base" src="assets/champonbowl.png" alt="champon bowl">
          ${this.noodles()}
          <div class="bowl-toppings">${toppings}</div>
          ${this.noodleDrape()}
        </div>
      </div>`;
  }
};
