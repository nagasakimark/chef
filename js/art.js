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

  pizzaBase(cooked) {
    // Both raw and cooked pizzas use the baked base photo. Sauce (painted
    // by the user) and melted-cheese images layer on top in pizza(), with
    // the cheese kept smaller so crust + sauce rims stay visible.
    void cooked;
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

  // Freshly grated (unbaked) cheese, drawn once per cheese type onto a
  // canvas: hundreds of little shaded shreds scattered over the sauce, so it
  // reads as real grated cheese instead of flat sticks/dots. Deterministic,
  // so the same cheese looks the same after a reload.
  rawCheese(type) {
    this._rawCheese = this._rawCheese || {};
    const canon = type === "mozarella" ? "mozzarella" : type === "mix" ? "both" : type;
    if (this._rawCheese[canon]) return this._rawCheese[canon];
    const SIZE = 640;
    const c = document.createElement("canvas");
    c.width = c.height = SIZE;
    const g = c.getContext("2d");
    let seed = canon === "cheddar" ? 11 : canon === "mozzarella" ? 23 : 37;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const kinds = {
      cheddar: { base: ["#f7a531", "#f39a1c", "#fbb443", "#f5aa38"], hi: "#ffd98a", sh: "rgba(110, 40, 0, .45)", w: 7.5 },
      mozzarella: { base: ["#fffaf0", "#fff3dc", "#fbecd0", "#fffdf6"], hi: "#ffffff", sh: "rgba(90, 30, 0, .5)", w: 8.5 }
    };
    const mix = canon === "both" ? ["mozzarella", "cheddar"] : [canon === "cheddar" ? "cheddar" : "mozzarella"];
    const R = SIZE * 0.325;
    const N = 470;
    const C = SIZE / 2;
    for (let i = 0; i < N; i += 1) {
      const k = kinds[mix[i % mix.length]];
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * R;
      const x = C + Math.cos(a) * r;
      const y = C + Math.sin(a) * r;
      const len = 16 + rnd() * 20;
      const w = k.w * (0.75 + rnd() * 0.5);
      const bend = (rnd() - 0.5) * 12;
      g.save();
      g.translate(x, y);
      g.rotate(rnd() * Math.PI);
      g.lineCap = "round";
      g.shadowColor = k.sh;
      g.shadowBlur = 4;
      g.shadowOffsetY = 2.5;
      g.strokeStyle = k.base[Math.floor(rnd() * k.base.length)];
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(-len / 2, 0);
      g.quadraticCurveTo(0, bend, len / 2, 0);
      g.stroke();
      g.shadowColor = "transparent";
      g.strokeStyle = k.hi;
      g.globalAlpha = 0.75;
      g.lineWidth = w * 0.32;
      g.beginPath();
      g.moveTo(-len / 2 + 3, -w * 0.18);
      g.quadraticCurveTo(0, bend - w * 0.18, len / 2 - 3, -w * 0.18);
      g.stroke();
      g.restore();
    }
    this._rawCheese[canon] = c.toDataURL("image/png");
    return this._rawCheese[canon];
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
    const cheeseType = cheese ? (cheese.type || cheese.id) : null;
    // Cooked: photo overlays (cheddar first, mozzarella on top). Raw keeps
    // the scatter pieces below and never uses the photos.
    const meltImgs = cooked && cheeseType ? this.cookedCheese(cheeseType) : "";
    return `
      <div class="pizza pizza-${size}${cooked ? " is-cooked" : ""}">
        ${this.pizzaBase(cooked)}
        ${sauceUrl ? `<img class="pizza-sauce-img${cooked ? " is-baked" : ""}" src="${sauceUrl}" alt="">` : ""}
        ${meltImgs}
        ${cheese && !cooked && (cheese.type || cheese.id) ? `<div class="pizza-cheese"><img class="pizza-cheese-img" src="${this.rawCheese(cheese.type || cheese.id)}" alt=""></div>` : ""}
        <div class="pizza-toppings">${tops}</div>
        ${cooked ? `<div class="pizza-char" aria-hidden="true"></div>` : ""}
        ${options.sliced ? this.pizzaSlices() : ""}
      </div>`;
  },

  // 8 slice cuts from the centre, drawn one after another when .is-slicing.
  pizzaSlices() {
    const cuts = [0, 45, 90, 135].map((deg, i) => {
      const r = (deg * Math.PI) / 180;
      const x = 41 * Math.cos(r), y = 41 * Math.sin(r);
      const d = `M${(50 - x).toFixed(1)} ${(50 - y).toFixed(1)} L${(50 + x).toFixed(1)} ${(50 + y).toFixed(1)}`;
      return `<path class="cut-shadow" d="${d}" pathLength="100" style="--i:${i}"/><path class="cut" d="${d}" pathLength="100" style="--i:${i}"/>`;
    }).join("");
    return `<svg class="pizza-slices" viewBox="0 0 100 100" aria-hidden="true">${cuts}</svg>`;
  },

  // Front-view wood-fired oven drawn in a 500x400 box. The pizza travels in a
  // separate layer between .pz-oven-back and .pz-oven-front, tilted flat with
  // CSS 3D so it lies on the peel and slides into the (wide) oven mouth.
  pizzaCookStage(rawHtml, bakedHtml) {
    const tiles = `<pattern id="pz-tiles" width="30" height="18" patternUnits="userSpaceOnUse">
        <path d="M0 18 Q7.5 4 15 18 Q22.5 4 30 18" fill="none" stroke="rgba(90,25,5,.38)" stroke-width="2.2"/></pattern>`;
    const dome = "M40 306 C40 112 148 24 250 24 C352 24 460 112 460 306 Z";
    const logs = [[178, 352], [214, 352], [250, 352], [286, 352], [322, 352], [196, 322], [232, 322], [268, 322], [304, 322]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="#c98b4f" stroke="#5a2e0e" stroke-width="4"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#8a5424" stroke-width="2.5"/>`).join("");
    return `
      <div class="pz-stage">
        <div class="pz-oven">
          <svg class="pz-oven-back" viewBox="0 0 500 400" aria-hidden="true">
            <defs>
              <linearGradient id="pz-dome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ef8a4f"/><stop offset="1" stop-color="#b9482a"/>
              </linearGradient>
              <radialGradient id="pz-mouth" cx=".5" cy=".85" r=".8">
                <stop offset="0" stop-color="#7a2e0c"/><stop offset=".55" stop-color="#2a0d03"/><stop offset="1" stop-color="#120401"/>
              </radialGradient>
              <radialGradient id="pz-heat" cx=".3" cy=".9" r=".7">
                <stop offset="0" stop-color="#ffb300" stop-opacity=".95"/><stop offset=".5" stop-color="#ff5722" stop-opacity=".45"/><stop offset="1" stop-color="#ff5722" stop-opacity="0"/>
              </radialGradient>
              ${tiles}
            </defs>
            <ellipse cx="250" cy="392" rx="215" ry="12" fill="rgba(0,0,0,.28)"/>
            <rect x="322" y="6" width="42" height="92" fill="#8a3f22" stroke="#1a0a04" stroke-width="6"/>
            <rect x="312" y="0" width="62" height="16" rx="4" fill="#5d2a14" stroke="#1a0a04" stroke-width="5"/>
            <rect x="72" y="298" width="356" height="94" rx="10" fill="#a8482a" stroke="#1a0a04" stroke-width="6"/>
            <path d="M72 330 H428 M72 362 H428 M130 298 V330 M250 298 V330 M370 298 V330 M190 330 V362 M310 330 V362 M130 362 V392 M250 362 V392 M370 362 V392" stroke="rgba(60,15,0,.45)" stroke-width="3"/>
            <rect x="150" y="304" width="200" height="82" rx="10" fill="#2b1206" stroke="#1a0a04" stroke-width="5"/>
            ${logs}
            <path d="${dome}" fill="url(#pz-dome)" stroke="#1a0a04" stroke-width="7"/>
            <path d="${dome}" fill="url(#pz-tiles)"/>
            <ellipse cx="185" cy="92" rx="70" ry="30" fill="#fff" opacity=".18" transform="rotate(-24 185 92)"/>
            <rect x="180" y="40" width="140" height="42" rx="14" fill="#3e2723" stroke="#1a0a04" stroke-width="5"/>
            <text x="250" y="71" text-anchor="middle" class="pz-sign">PIZZA</text>
            <path d="M130 274 V206 A120 84 0 0 1 370 206 V274 Z" fill="url(#pz-mouth)"/>
            <path class="pz-heat" d="M130 274 V206 A120 84 0 0 1 370 206 V274 Z" fill="url(#pz-heat)"/>
            <path d="M136 274 L364 274 L344 238 L156 238 Z" fill="#4a1f0b"/>
            <g class="pz-fire">
              <path class="fl fl1" d="M152 262 C140 232 160 214 166 190 C176 214 190 230 178 262 Z" fill="#ff7043"/>
              <path class="fl fl2" d="M166 262 C156 236 176 222 184 200 C192 222 204 238 194 262 Z" fill="#ffb300"/>
              <path class="fl fl3" d="M186 262 C180 244 192 232 198 218 C204 232 212 246 206 262 Z" fill="#ffee58"/>
              <ellipse cx="178" cy="262" rx="34" ry="8" fill="#ff8a00" opacity=".9"/>
            </g>
            <rect x="112" y="272" width="276" height="20" rx="5" fill="#9e9e9e" stroke="#1a0a04" stroke-width="5"/>
          </svg>
          <div class="pz-smoke"><span></span><span></span><span></span></div>
        </div>
        <div class="pz-mover">
          <div class="pz-tilt">
            <div class="pz-peel"><div class="pz-peel-handle"></div><div class="pz-peel-blade"></div></div>
            <div class="pz-raw pz-build">${rawHtml}</div>
            <div class="pz-baked">${bakedHtml}</div>
          </div>
          <div class="steam pz-steam" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <svg class="pz-oven-front" viewBox="0 0 500 400" aria-hidden="true">
          <path d="M120 274 V206 A130 94 0 0 1 380 206 V274" fill="none" stroke="#1a0a04" stroke-width="30"/>
          <path d="M120 274 V206 A130 94 0 0 1 380 206 V274" fill="none" stroke="#c0643a" stroke-width="22" stroke-dasharray="16 3"/>
          <path d="M234 94 H266 L261 128 H239 Z" fill="#8d3a1c" stroke="#1a0a04" stroke-width="4"/>
        </svg>
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

  // ---------- burger: real PNG layers stacked by their visible edges ----------
  // Every layer image is a 400x400 PNG whose opaque area is listed in
  // BURGER_BOXES. Each layer "sits" on the one below: its visible bottom is
  // placed a fixed fraction up the previous layer's visible height, so thick
  // heaps (fries, spaghetti) take more room than thin cheese. The whole stack
  // is then scaled to fit a fixed-ratio box, so it can NEVER grow off-screen.
  // Two layouts are baked into CSS vars: compact (--b/--l/--w) and exploded
  // (--bx/--lx/--wx) for the "tap to look inside" view with English labels.
  burgerLayers(patty, cheese, toppings, cooked) {
    const key = (src) => src.split("/").pop().replace(/\.png$/, "");
    const layers = [{ src: BURGER_BUNS.bottom, kind: "bun-bottom", label: "Bun" }];
    if (patty) layers.push({ src: patty.image, kind: "patty", label: `${patty.name} Patty` });
    if (cheese) layers.push({ src: cooked ? cheese.meltImage : cheese.image, raw: cheese.image, melt: cheese.meltImage, kind: "cheese", label: /cheese/i.test(cheese.name) ? cheese.name : `${cheese.name} Cheese` });
    (toppings || []).forEach((t) => {
      const ing = t.ingredient || t.ing || t;
      if (ing && ing.image) layers.push({ src: ing.image, kind: "topping", label: ing.name, id: ing.id });
    });
    layers.push({ src: BURGER_BUNS.top, kind: "bun-top", label: "Bun" });
    layers.forEach((l) => { l.box = BURGER_BOXES[key(l.src)] || [20, 100, 380, 300]; });
    return layers;
  },

  burgerLayout(layers, opts) {
    const o = opts || {};
    const HC = o.ratio || 1.12;          // box height / box width
    const gap = o.gap || 0;              // extra px (400-space) between layers
    const maxW = o.maxW || 0.92;         // widest the layer images may be
    const stepK = { "bun-bottom": 0.5, patty: 0.44, cheese: 0.2, topping: 0.44, "bun-top": 0 };
    let y = 0;
    const ys = layers.map((l, i) => {
      const h = l.box[3] - l.box[1];
      const at = y;
      let k = stepK[l.kind];
      // tall heaps settle a little more; flat slices a little less
      if (l.kind === "topping") k = h > 205 ? 0.4 : h < 185 ? 0.48 : 0.44;
      y += h * k + (i < layers.length - 1 ? gap : 0);
      return at;
    });
    const last = layers[layers.length - 1];
    const total = ys[ys.length - 1] + (last.box[3] - last.box[1]);
    const wImg = Math.min(maxW, (HC * 0.94 * 400) / total);
    const u = wImg / 400;
    // sit on the "plate" line rather than floating in the middle
    const bottomPad = Math.min(HC * 0.05, (HC - total * u) / 2);
    return layers.map((l, i) => {
      const contentBottom = bottomPad + ys[i] * u;
      const imgBottom = contentBottom - (400 - l.box[3]) * u;
      return {
        b: (imgBottom / HC) * 100,
        w: wImg * 100,
        mid: ((contentBottom + ((l.box[3] - l.box[1]) * u) / 2) / HC) * 100,
        right: wImg * (l.box[2] / 400)
      };
    });
  },

  burger(patty, cheese, toppings, opts) {
    const options = opts || {};
    const cooked = !!options.cooked;
    const layers = this.burgerLayers(patty, cheese, toppings, cooked);
    const compact = this.burgerLayout(layers, { maxW: 0.92 });
    const exploded = this.burgerLayout(layers, { maxW: 0.6, gap: 70 });
    const lxBase = 9;
    const imgs = layers.map((l, i) => {
      const c = compact[i];
      const x = exploded[i];
      const lx = lxBase;
      const cls = `burger-layer burger-${l.kind}${options.pending ? " is-pending" : ""}`;
      const meltSwap = l.kind === "cheese" && options.meltSwap
        ? `<img class="burger-melt-swap" src="${l.melt}" alt="">`
        : "";
      return `<div class="${cls}" data-i="${i}" style="z-index:${i + 1};--b:${c.b.toFixed(2)}%;--w:${c.w.toFixed(2)}%;--l:${((100 - c.w) / 2).toFixed(2)}%;` +
        `--bx:${x.b.toFixed(2)}%;--wx:${x.w.toFixed(2)}%;--lx:${lx}%">` +
        `<img src="${l.src}" alt="${l.label}" draggable="false">${meltSwap}</div>`;
    }).join("");
    const labels = options.labels
      ? layers.map((l, i) => {
        const x = exploded[i];
        const left = lxBase + x.right * 100 + 1.5;
        return `<span class="burger-label burger-label-${l.kind}" style="--mid:${x.mid.toFixed(2)}%;left:${left.toFixed(1)}%;--d:${(0.05 * (layers.length - i)).toFixed(2)}s">${l.label}</span>`;
      }).join("")
      : "";
    const extra = options.className ? ` ${options.className}` : "";
    return `
      <div class="burger${cooked ? " is-cooked" : ""}${extra}" role="img" aria-label="burger">
        <div class="burger-shadow"></div>
        ${imgs}
        ${labels}
      </div>`;
  },

  // Preview for patty/cheese/topping docks — same builder, raw cheese.
  burgerPreview(patty, cheese, picks) {
    const toppings = (picks || []).map((p) => ({ ingredient: p.ingredient || p }));
    return this.burger(patty, cheese, toppings, { cooked: false });
  },

  stack(layers, kind) {
    // Burger now uses Art.burger(); stack() is for sandwich only (and legacy fallback)
    if (kind === "burger") {
      // Fallback if something still calls stack with burger — route to burger with no patty/cheese distinction
      const tops = (layers || []).map((l) => ({ ingredient: l.ingredient || l.ing || l, country: l.country }));
      return this.burger(null, null, tops, { cooked: false });
    }
    const capTop = this.breadTop();
    const capBottom = this.breadBottom();
    const items = (layers || []).slice().reverse().map((layer) => {
      const ing = layer.ingredient || layer.ing || layer;
      const st = layerStyle(ing.id);
      return `<div class="stack-layer" style="--c:${st.color};--e:${st.edge}" title="${ing.name}">` +
        `<img src="${ing.image}" alt="${ing.name}"><span>${st.label}</span></div>`;
    }).join("");
    return `
      <div class="stack stack-sandwich">
        <div class="stack-capwrap">${capTop}</div>
        <div class="stack-layers">${items || `<div class="stack-empty">Tap yummy things →</div>`}</div>
        <div class="stack-capwrap">${capBottom}</div>
      </div>`;
  },

  // ---------- champon: a real bowl of noodles, veggies and toppings ----------
  // Everything is drawn in the champonbowl.png pixel space (1349 x 1166) so it
  // lines up with the broth. The broth ellipse: centre (668,620), radii 476/312.
  champonNoodles() {
    if (this._noodles) return this._noodles;
    let seed = 7;
    const rand = () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const CX = 668, CY = 606, RX = 425, RY = 250, DOME = 95;
    const toPath = (pts) => {
      let d = `M${pts[0][0].toFixed(0)} ${pts[0][1].toFixed(0)}`;
      for (let k = 0; k < pts.length - 1; k += 1) {
        const p0 = pts[k - 1] || pts[k];
        const p1 = pts[k];
        const p2 = pts[k + 1];
        const p3 = pts[k + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${p2[0].toFixed(0)} ${p2[1].toFixed(0)}`;
      }
      return d;
    };
    // Wavy (chijire) strands that flow across a domed nest.
    const strands = [];
    for (let s = 0; s < 44; s += 1) {
      const ang = (rand() - 0.5) * 1.3 + (s % 3 === 0 ? Math.PI / 2.4 : 0);
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const off = (rand() - 0.5) * 1.5;           // sideways offset of this strand
      const len = 1.1 + rand() * 0.8;
      const amp = 0.035 + rand() * 0.03;
      const wl = 0.16 + rand() * 0.08;
      const ph = rand() * 6.28;
      const pts = [];
      for (let t = -len / 2; t <= len / 2; t += 0.045) {
        const w = Math.sin(t / wl * 6.28 + ph) * amp;
        const x = ux * t - uy * (off * 0.55 + w);
        const y = uy * t + ux * (off * 0.55 + w);
        const d2 = x * x + y * y;
        if (d2 > 0.92) { if (pts.length) break; else continue; }
        const lift = DOME * Math.max(0, 1 - d2) * (0.85 + 0.3 * rand());
        pts.push([CX + x * RX, CY + y * RY - lift]);
      }
      if (pts.length < 4) continue;
      const avgY = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
      strands.push({ d: toPath(pts), avgY: avgY + (rand() - 0.5) * 60 });
    }
    strands.sort((a, b) => a.avgY - b.avgY);
    const strand = (d, i) =>
      `<path class="nd-sh" d="${d}"/><path class="nd-body" d="${d}" style="--i:${i}"/><path class="nd-hi" d="${d}"/>`;
    const body = `<ellipse class="nd-bed" cx="${CX}" cy="${CY - 30}" rx="${RX * 0.9}" ry="${RY * 0.86}"/>` +
      strands.map((s, i) => strand(s.d, i)).join("");
    // bean sprouts + cabbage ribbons tossed on top of the noodle nest
    const sprouts = Array.from({ length: 16 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.62;
      const x = CX + Math.cos(a) * r * RX;
      const y = CY + Math.sin(a) * r * RY - DOME * (1 - r * r) - 10;
      const len = 60 + rand() * 50;
      const ang = rand() * Math.PI;
      const dx = Math.cos(ang) * len, dy = Math.sin(ang) * len * 0.5;
      const bend = (rand() - 0.5) * 50;
      return `<path d="M${(x - dx / 2).toFixed(0)} ${(y - dy / 2).toFixed(0)} q${(dx / 2 + bend).toFixed(0)} ${(dy / 2 - Math.abs(bend)).toFixed(0)} ${dx.toFixed(0)} ${dy.toFixed(0)}"/>`;
    }).join("");
    const onions = Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 0.15 + Math.sqrt(rand()) * 0.75;
      const x = CX + Math.cos(a) * r * 430;
      const y = CY + 10 + Math.sin(a) * r * 262 - DOME * 0.6 * Math.max(0, 1 - r * r);
      const s = 0.8 + rand() * 0.5;
      return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(13 * s).toFixed(1)}" ry="${(9 * s).toFixed(1)}" transform="rotate(${(rand() * 60 - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }).join("");
    const sesame = Array.from({ length: 26 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.8;
      const x = CX + Math.cos(a) * r * 420;
      const y = CY + Math.sin(a) * r * 250 - DOME * 0.7 * Math.max(0, 1 - r * r);
      return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="6" ry="3.5" transform="rotate(${(rand() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }).join("");
    const oil = Array.from({ length: 14 }, () => {
      const a = rand() * Math.PI * 2;
      const x = 668 + Math.cos(a) * (400 + rand() * 50);
      const y = 620 + Math.sin(a) * (262 + rand() * 30);
      const r = 8 + rand() * 16;
      return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * 0.62).toFixed(0)}"/>`;
    }).join("");
    // a few short strands that drape over the lower edge of each topping pile
    const drape = (x, y) => [
      `M${x - 150} ${y + 38} c20 -26 44 -26 62 -2 s42 26 62 2 s44 -26 62 -2 s42 24 62 2 s30 -20 44 -8`
    ];
    this._noodles = { body, sprouts, onions, sesame, oil, drape, strand };
    return this._noodles;
  },

  bowl(ingredients, opts) {
    const options = opts || {};
    const size = options.size || "lg";
    const stage = options.stage || "done";
    const ings = (ingredients || []).filter(Boolean).slice(0, 3);
    const N = this.champonNoodles();
    const order = ["empty", "noodles", "top1", "top2", "top3", "done"];
    const at = Math.max(0, order.indexOf(stage));
    const show = [];
    if (at >= 1) show.push("show-noodles");
    if (at >= 2 || stage === "done") show.push("show-t0");
    if (at >= 3 || stage === "done") show.push("show-t1");
    if (at >= 4 || stage === "done") show.push("show-t2");
    if (stage === "done") show.push("show-garnish");
    const slots = [
      { x: 455, y: 505, s: 1 },
      { x: 885, y: 497, s: 1 },
      { x: 672, y: 726, s: 1.06 }
    ];
    const fan = [[-112, 22, -28, 0.9], [112, 26, 24, 0.9], [0, -8, 6, 1]];
    const toppings = ings.map((ing, i) => {
      const slot = slots[i];
      const copies = fan.map(([dx, dy, rot, sc], k) => {
        const S = 255 * sc * slot.s;
        return `<g class="tp-copy" style="--k:${k}" transform="translate(${slot.x + dx} ${slot.y + dy}) rotate(${rot}) scale(1 .84)">` +
          `<image href="${ing.image}" x="${(-S / 2).toFixed(0)}" y="${(-S / 2).toFixed(0)}" width="${S.toFixed(0)}" height="${S.toFixed(0)}" filter="url(#tc-food)"/></g>`;
      }).join("");
      const drapes = N.drape(slot.x, slot.y + 40).map((d) => N.strand(d, 0)).join("");
      return `<g class="bw-slot bw-t${i}"><g class="bw-drop">` +
        `<ellipse class="tp-soak" cx="${slot.x}" cy="${slot.y + 92}" rx="200" ry="46"/>` +
        `<g class="bw-bob" style="--d:${(i * 0.45).toFixed(2)}s">${copies}</g>` +
        `<g class="nd">${drapes}</g></g>` +
        `<g class="bw-splash"><ellipse cx="${slot.x}" cy="${slot.y + 80}" rx="190" ry="60"/><ellipse cx="${slot.x}" cy="${slot.y + 80}" rx="120" ry="38"/></g></g>`;
    }).join("");

    return `
      <div class="bowl bowl-${size} bowl-stage-${stage} ${show.join(" ")}${options.cooking ? " is-cooking" : ""}${options.still ? " is-still" : ""}">
        <div class="steam" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="bowl-art">
          <img class="bowl-base" src="assets/champonbowl.png" alt="champon bowl">
          <svg class="bowl-food" viewBox="0 0 1349 1166" aria-hidden="true">
            <g class="bw-broth">
              <ellipse class="broth-body" cx="668" cy="620" rx="476" ry="312"/>
              <ellipse class="broth-sheen" cx="560" cy="470" rx="230" ry="70"/>
              <g class="broth-oil">${N.oil}</g>
            </g>
            <g class="bw-stream"><rect x="628" y="-40" width="80" height="660" rx="40"/></g>
            <g class="bw-ripple"><ellipse cx="668" cy="620" rx="200" ry="130"/><ellipse cx="668" cy="620" rx="330" ry="210"/></g>
            <g class="bw-noodles" mask="url(#tc-broth-mask)"><g class="bw-drop">
              <g class="nd">${N.body}</g>
              <g class="sprouts">${N.sprouts}</g>
            </g></g>
            <g class="bw-splash bw-splash-noodles"><ellipse cx="668" cy="640" rx="420" ry="250"/><ellipse cx="668" cy="640" rx="300" ry="180"/></g>
            <g clip-path="url(#tc-front-clip)">${toppings}</g>
            <g class="bw-garnish" clip-path="url(#tc-front-clip)">
              <g class="onions">${N.onions}</g>
              <g class="sesame">${N.sesame}</g>
            </g>
          </svg>
        </div>
      </div>`;
  }

};
