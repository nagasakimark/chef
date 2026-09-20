const COUNTRY_LIST = [
  { id: "japan", name: "Japan", nameJa: "日本", code: "jp" },
  { id: "america", name: "America", nameJa: "アメリカ", code: "us" },
  { id: "australia", name: "Australia", nameJa: "オーストラリア", code: "au" },
  { id: "brazil", name: "Brazil", nameJa: "ブラジル", code: "br" },
  { id: "canada", name: "Canada", nameJa: "カナダ", code: "ca" },
  { id: "china", name: "China", nameJa: "中国", code: "cn" },
  { id: "france", name: "France", nameJa: "フランス", code: "fr" },
  { id: "germany", name: "Germany", nameJa: "ドイツ", code: "de" },
  { id: "india", name: "India", nameJa: "インド", code: "in" },
  { id: "italy", name: "Italy", nameJa: "イタリア", code: "it" },
  { id: "korea", name: "Korea", nameJa: "韓国", code: "kr" },
  { id: "mexico", name: "Mexico", nameJa: "メキシコ", code: "mx" },
  { id: "spain", name: "Spain", nameJa: "スペイン", code: "es" },
  { id: "thailand", name: "Thailand", nameJa: "タイ", code: "th" },
  { id: "uk", name: "The UK", nameJa: "イギリス", code: "gb" },
  { id: "vietnam", name: "Vietnam", nameJa: "ベトナム", code: "vn" },
  { id: "egypt", name: "Egypt", nameJa: "エジプト", code: "eg" },
  { id: "ethiopia", name: "Ethiopia", nameJa: "エチオピア", code: "et" },
  { id: "ghana", name: "Ghana", nameJa: "ガーナ", code: "gh" },
  { id: "kenya", name: "Kenya", nameJa: "ケニア", code: "ke" },
  { id: "morocco", name: "Morocco", nameJa: "モロッコ", code: "ma" },
  { id: "nigeria", name: "Nigeria", nameJa: "ナイジェリア", code: "ng" },
  { id: "southafrica", name: "South Africa", nameJa: "南アフリカ", code: "za" },
  { id: "tunisia", name: "Tunisia", nameJa: "チュニジア", code: "tn" },
  { id: "afghanistan", name: "Afghanistan", nameJa: "アフガニスタン", code: "af" },
  { id: "bangladesh", name: "Bangladesh", nameJa: "バングラデシュ", code: "bd" },
  { id: "indonesia", name: "Indonesia", nameJa: "インドネシア", code: "id" },
  { id: "iran", name: "Iran", nameJa: "イラン", code: "ir" },
  { id: "iraq", name: "Iraq", nameJa: "イラク", code: "iq" },
  { id: "israel", name: "Israel", nameJa: "イスラエル", code: "il" },
  { id: "jordan", name: "Jordan", nameJa: "ヨルダン", code: "jo" },
  { id: "kazakhstan", name: "Kazakhstan", nameJa: "カザフスタン", code: "kz" },
  { id: "lebanon", name: "Lebanon", nameJa: "レバノン", code: "lb" },
  { id: "malaysia", name: "Malaysia", nameJa: "マレーシア", code: "my" },
  { id: "mongolia", name: "Mongolia", nameJa: "モンゴル", code: "mn" },
  { id: "myanmar", name: "Myanmar", nameJa: "ミャンマー", code: "mm" },
  { id: "nepal", name: "Nepal", nameJa: "ネパール", code: "np" },
  { id: "pakistan", name: "Pakistan", nameJa: "パキスタン", code: "pk" },
  { id: "philippines", name: "Philippines", nameJa: "フィリピン", code: "ph" },
  { id: "saudiarabia", name: "Saudi Arabia", nameJa: "サウジアラビア", code: "sa" },
  { id: "singapore", name: "Singapore", nameJa: "シンガポール", code: "sg" },
  { id: "srilanka", name: "Sri Lanka", nameJa: "スリランカ", code: "lk" },
  { id: "syria", name: "Syria", nameJa: "シリア", code: "sy" },
  { id: "taiwan", name: "Taiwan", nameJa: "台湾", code: "tw" },
  { id: "turkey", name: "Turkey", nameJa: "トルコ", code: "tr" },
  { id: "uae", name: "The UAE", nameJa: "UAE", code: "ae" },
  { id: "uzbekistan", name: "Uzbekistan", nameJa: "ウズベキスタン", code: "uz" },
  { id: "austria", name: "Austria", nameJa: "オーストリア", code: "at" },
  { id: "belgium", name: "Belgium", nameJa: "ベルギー", code: "be" },
  { id: "bulgaria", name: "Bulgaria", nameJa: "ブルガリア", code: "bg" },
  { id: "croatia", name: "Croatia", nameJa: "クロアチア", code: "hr" },
  { id: "czech", name: "Czech Republic", nameJa: "チェコ", code: "cz" },
  { id: "denmark", name: "Denmark", nameJa: "デンマーク", code: "dk" },
  { id: "finland", name: "Finland", nameJa: "フィンランド", code: "fi" },
  { id: "greece", name: "Greece", nameJa: "ギリシャ", code: "gr" },
  { id: "hungary", name: "Hungary", nameJa: "ハンガリー", code: "hu" },
  { id: "iceland", name: "Iceland", nameJa: "アイスランド", code: "is" },
  { id: "ireland", name: "Ireland", nameJa: "アイルランド", code: "ie" },
  { id: "netherlands", name: "Netherlands", nameJa: "オランダ", code: "nl" },
  { id: "norway", name: "Norway", nameJa: "ノルウェー", code: "no" },
  { id: "poland", name: "Poland", nameJa: "ポーランド", code: "pl" },
  { id: "portugal", name: "Portugal", nameJa: "ポルトガル", code: "pt" },
  { id: "romania", name: "Romania", nameJa: "ルーマニア", code: "ro" },
  { id: "russia", name: "Russia", nameJa: "ロシア", code: "ru" },
  { id: "sweden", name: "Sweden", nameJa: "スウェーデン", code: "se" },
  { id: "switzerland", name: "Switzerland", nameJa: "スイス", code: "ch" },
  { id: "ukraine", name: "Ukraine", nameJa: "ウクライナ", code: "ua" },
  { id: "costarica", name: "Costa Rica", nameJa: "コスタリカ", code: "cr" },
  { id: "cuba", name: "Cuba", nameJa: "キューバ", code: "cu" },
  { id: "guatemala", name: "Guatemala", nameJa: "グアテマラ", code: "gt" },
  { id: "jamaica", name: "Jamaica", nameJa: "ジャマイカ", code: "jm" },
  { id: "panama", name: "Panama", nameJa: "パナマ", code: "pa" },
  { id: "fiji", name: "Fiji", nameJa: "フィジー", code: "fj" },
  { id: "newzealand", name: "New Zealand", nameJa: "ニュージーランド", code: "nz" },
  { id: "argentina", name: "Argentina", nameJa: "アルゼンチン", code: "ar" },
  { id: "bolivia", name: "Bolivia", nameJa: "ボリビア", code: "bo" },
  { id: "chile", name: "Chile", nameJa: "チリ", code: "cl" },
  { id: "colombia", name: "Colombia", nameJa: "コロンビア", code: "co" },
  { id: "ecuador", name: "Ecuador", nameJa: "エクアドル", code: "ec" },
  { id: "peru", name: "Peru", nameJa: "ペルー", code: "pe" },
  { id: "uruguay", name: "Uruguay", nameJa: "ウルグアイ", code: "uy" },
  { id: "venezuela", name: "Venezuela", nameJa: "ベネズエラ", code: "ve" }
];

const COUNTRIES = Object.fromEntries(COUNTRY_LIST.map((country) => [country.id, country]));

function food(id, name, nameJa, file) {
  return {
    id,
    name,
    nameJa,
    initial: name.charAt(0).toUpperCase(),
    image: `assets/food/${file}.svg`
  };
}

const INGREDIENTS = [
  food("apple", "Apple", "りんご", "apple"),
  food("anchovy", "Anchovy", "アンチョビ", "fish"),
  food("artichoke", "Artichoke", "アーティチョーク", "broccoli"),
  food("avocado", "Avocado", "アボカド", "avocado"),
  food("bacon", "Bacon", "ベーコン", "bacon"),
  food("banana", "Banana", "バナナ", "banana"),
  food("beef", "Beef", "牛肉", "pork"),
  food("blueberry", "Blueberry", "ブルーベリー", "blueberry"),
  food("broccoli", "Broccoli", "ブロッコリー", "broccoli"),
  food("cabbage", "Cabbage", "キャベツ", "cabbage"),
  food("carrot", "Carrot", "にんじん", "carrot"),
  food("cheese", "Cheese", "チーズ", "cheese"),
  food("cherry", "Cherry", "さくらんぼ", "cherry"),
  food("chicken", "Chicken", "鶏肉", "chicken"),
  food("corn", "Corn", "とうもろこし", "corn"),
  food("cucumber", "Cucumber", "きゅうり", "cucumber"),
  food("dango", "Dango", "団子", "dumpling"),
  food("donut", "Donut", "ドーナツ", "peach"),
  food("duck", "Duck", "鴨肉", "chicken"),
  food("dumpling", "Dumpling", "餃子", "dumpling"),
  food("edamame", "Edamame", "枝豆", "edamame"),
  food("egg", "Egg", "卵", "egg"),
  food("eggplant", "Eggplant", "ナス", "eggplant"),
  food("fig", "Fig", "いちじく", "grapes"),
  food("fish", "Fish", "魚", "fish"),
  food("fishcake", "Fish Cake", "ナルト", "fishcake"),
  food("flan", "Flan", "フラン", "egg"),
  food("fries", "Fries", "フライドポテト", "potato"),
  food("furikake", "Furikake", "ふりかけ", "rice"),
  food("garlic", "Garlic", "にんにく", "garlic"),
  food("ginger", "Ginger", "生姜", "ginger"),
  food("grapes", "Grapes", "ぶどう", "grapes"),
  food("gyoza", "Gyoza", "焼き餃子", "dumpling"),
  food("ham", "Ham", "ハム", "bacon"),
  food("hamburger", "Hamburger", "ハンバーガー", "taco"),
  food("hayashi", "Hayashi Rice", "ハヤシライス", "rice"),
  food("honey", "Honey", "蜂蜜", "honey"),
  food("hotdog", "Hot Dog", "ホットドッグ", "sausage"),
  food("icecream", "Ice Cream", "アイスクリーム", "honey"),
  food("jackfruit", "Jack Fruit", "ジャックフルーツ", "watermelon"),
  food("jalapeno", "Jalapeno", "ハラペーニョ", "peppers"),
  food("jam", "Jam", "ジャム", "strawberry"),
  food("jelly", "Jelly", "ゼリー", "grapes"),
  food("kale", "Kale", "ケール", "broccoli"),
  food("kimchi", "Kimchi", "キムチ", "cabbage"),
  food("kiwi", "Kiwi", "キウイ", "kiwi"),
  food("lemon", "Lemon", "レモン", "lemon"),
  food("lettuce", "Lettuce", "レタス", "cabbage"),
  food("lobster", "Lobster", "ロブスター", "lobster"),
  food("lollipop", "Lollipop", "ロリポップ", "cherry"),
  food("mango", "Mango", "マンゴー", "mango"),
  food("matcha", "Matcha", "抹茶", "edamame"),
  food("meatball", "Meatball", "ミートボール", "sausage"),
  food("mushroom", "Mushroom", "きのこ", "mushroom"),
  food("natto", "Natto", "納豆", "peanuts"),
  food("noodles", "Noodles", "麺", "noodles"),
  food("nori", "Nori", "海苔", "fish"),
  food("nuts", "Nuts", "ナッツ", "peanuts"),
  food("octopus", "Octopus", "たこ", "octopus"),
  food("omelette", "Omelette", "オムレツ", "egg"),
  food("onion", "Onion", "玉ねぎ", "onion"),
  food("orange", "Orange", "オレンジ", "orange"),
  food("peach", "Peach", "桃", "peach"),
  food("peanuts", "Peanuts", "ピーナッツ", "peanuts"),
  food("pear", "Pear", "梨", "pear"),
  food("peppers", "Peppers", "ピーマン", "peppers"),
  food("pineapple", "Pineapple", "パイナップル", "pineapple"),
  food("pizza", "Pizza", "ピザ", "cheese"),
  food("pork", "Pork", "豚肉", "pork"),
  food("potato", "Potato", "じゃがいも", "potato"),
  food("quesadilla", "Quesadilla", "ケサディーヤ", "taco"),
  food("quiche", "Quiche", "キッシュ", "egg"),
  food("radish", "Radish", "大根", "carrot"),
  food("ramen", "Ramen", "ラーメン", "noodles"),
  food("raspberry", "Raspberry", "ラズベリー", "strawberry"),
  food("rice", "Rice", "ご飯", "rice"),
  food("salmon", "Salmon", "鮭", "fish"),
  food("sausage", "Sausage", "ソーセージ", "sausage"),
  food("shrimp", "Shrimp", "海老", "shrimp"),
  food("springonion", "Spring Onion", "青ネギ", "onion"),
  food("squid", "Squid", "イカ", "squid"),
  food("strawberry", "Strawberry", "いちご", "strawberry"),
  food("sushi", "Sushi", "寿司", "sushi"),
  food("taco", "Taco", "タコス", "taco"),
  food("tempura", "Tempura", "天ぷら", "fried-shrimp"),
  food("tofu", "Tofu", "豆腐", "cheese"),
  food("tomato", "Tomato", "トマト", "tomato"),
  food("ume", "Ume", "梅", "cherry"),
  food("vegetable", "Vegetable", "野菜", "broccoli"),
  food("venison", "Venison", "鹿肉", "pork"),
  food("waffle", "Waffle", "ワッフル", "cheese"),
  food("wagyu", "Wagyu", "和牛", "pork"),
  food("wakame", "Wakame", "わかめ", "edamame"),
  food("watermelon", "Watermelon", "スイカ", "watermelon"),
  food("xigua", "Xigua", "西瓜", "watermelon"),
  food("yakitori", "Yakitori", "焼き鳥", "chicken"),
  food("yam", "Yam", "山芋", "potato"),
  food("yuzu", "Yuzu", "柚子", "lemon"),
  food("zucchini", "Zucchini", "ズッキーニ", "cucumber")
];

function getIngredient(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

function getCountry(id) {
  return COUNTRIES[id];
}

const PIZZA_SAUCES = {
  tomato: { id: "tomato", name: "Tomato", color: "#d93a2b", dark: "#a82318" },
  bbq: { id: "bbq", name: "BBQ", color: "#7a3f1d", dark: "#552809" }
};

// Cheese choices for the pizza maker. colors[] are the raw scatter colors
// shown before cooking; meltImg is the baked overlay image shown on the
// cooked pizza (on top of the base + sauce).
const CHEESES = {
  cheddar: {
    id: "cheddar", name: "Cheddar", nameJa: "チェダー",
    colors: ["#f6a93b", "#f28c1e", "#fbbf5a"],
    melt: { base: "#f7b04a", wash: "#e08a24", spot: "#96500f" },
    meltImg: "assets/meltedcheddar.png"
  },
  mozzarella: {
    id: "mozzarella", name: "Mozzarella", nameJa: "モッツァレラ",
    colors: ["#fff6e3", "#fdf0d0", "#fffbf0"],
    melt: { base: "#fff3d2", wash: "#f0c878", spot: "#aa6e28" },
    meltImg: "assets/meltedmozarella.png"
  },
  both: {
    id: "both", name: "Mozzarella & Cheddar", nameJa: "モッツァレラ＆チェダー",
    colors: ["#fff6e3", "#f6a93b", "#fdf0d0", "#f28c1e", "#fffbf0", "#fbbf5a"],
    melt: { base: "#ffe2a0", wash: "#eda94e", spot: "#a5681f" },
    meltImgs: ["assets/meltedcheddar.png", "assets/meltedmozarella.png"]
  }
};

// "mozarella" (single z, as in the asset filename) and the legacy "mix"
// id both resolve to the canonical entries.
function getCheese(type) {
  if (!type) return null;
  if (CHEESES[type]) return CHEESES[type];
  if (type === "mozarella" || type === "mozzarella") return CHEESES.mozzarella;
  if (type === "mix") return CHEESES.both;
  return null;
}

// Toppings that read well top-down on a pizza (reuse Twemoji placeholders).
const PIZZA_TOPPING_IDS = [
  "cheese", "tomato", "bacon", "sausage", "mushroom", "onion",
  "peppers", "corn", "pineapple", "egg", "ham", "chicken"
];

// Fillings that stack well side-view for burger / sandwich.
const BURGER_FILLING_IDS = [
  "beef", "cheese", "bacon", "lettuce", "tomato", "onion",
  "egg", "cucumber", "corn", "mushroom", "avocado", "sausage"
];

const SANDWICH_FILLING_IDS = [
  "ham", "chicken", "cheese", "egg", "lettuce", "tomato",
  "cucumber", "onion", "avocado", "bacon", "corn", "tuna"
];

// "tuna" has no dedicated svg yet — fall back to fish.
const INGREDIENT_ALIASES = { tuna: "fish", beef: "pork", lettuce: "cabbage", ham: "bacon" };

function resolveFoodImage(id) {
  const direct = getIngredient(id);
  if (direct) return direct;
  const alias = INGREDIENT_ALIASES[id];
  if (alias) return getIngredient(alias);
  return null;
}

// Side-view layer colors so burger/sandwich fillings look right from the
// side even though icons are top-down Twemoji placeholders.
const LAYER_STYLES = {
  beef: { color: "#6d4c41", edge: "#4e342e", label: "Patty" },
  pork: { color: "#8d6e63", edge: "#5d4037", label: "Patty" },
  cheese: { color: "#ffca28", edge: "#f9a825", label: "Cheese" },
  bacon: { color: "#d84315", edge: "#bf360c", label: "Bacon" },
  ham: { color: "#ef9a9a", edge: "#c62828", label: "Ham" },
  chicken: { color: "#d7a86e", edge: "#a06a2c", label: "Chicken" },
  lettuce: { color: "#66bb6a", edge: "#2e7d32", label: "Lettuce" },
  cabbage: { color: "#66bb6a", edge: "#2e7d32", label: "Lettuce" },
  tomato: { color: "#e53935", edge: "#b71c1c", label: "Tomato" },
  onion: { color: "#f3e5f5", edge: "#ce93d8", label: "Onion" },
  egg: { color: "#fff59d", edge: "#f9a825", label: "Egg" },
  cucumber: { color: "#43a047", edge: "#1b5e20", label: "Pickles" },
  corn: { color: "#ffee58", edge: "#f9a825", label: "Corn" },
  mushroom: { color: "#bcaaa4", edge: "#6d4c41", label: "Mushroom" },
  avocado: { color: "#9ccc65", edge: "#558b2f", label: "Avocado" },
  sausage: { color: "#a1887f", edge: "#5d4037", label: "Sausage" },
  tuna: { color: "#90caf9", edge: "#1565c0", label: "Tuna" },
  fish: { color: "#90caf9", edge: "#1565c0", label: "Tuna" }
};

function layerStyle(id) {
  return LAYER_STYLES[id] || { color: "#ffcc80", edge: "#ef6c00", label: (getIngredient(id) || {}).name || id };
}

const VIRTUAL_INGREDIENTS = {
  tuna: { id: "tuna", name: "Tuna", nameJa: "ツナ", initial: "T", image: "assets/food/fish.svg" },
  beef: { id: "beef", name: "Beef Patty", nameJa: "パティ", initial: "B", image: "assets/food/pork.svg" },
  lettuce: { id: "lettuce", name: "Lettuce", nameJa: "レタス", initial: "L", image: "assets/food/cabbage.svg" },
  ham: { id: "ham", name: "Ham", nameJa: "ハム", initial: "H", image: "assets/food/bacon.svg" }
};

function toppingList(ids) {
  return ids.map((id) => {
    if (VIRTUAL_INGREDIENTS[id]) return VIRTUAL_INGREDIENTS[id];
    return resolveFoodImage(id) || getIngredient("tomato");
  }).filter(Boolean);
}
