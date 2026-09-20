from pathlib import Path
import urllib.request

base = Path("assets")
(base / "food").mkdir(parents=True, exist_ok=True)
(base / "flags").mkdir(exist_ok=True)

foods = {
    "apple": "1f34e",
    "avocado": "1f951",
    "bacon": "1f953",
    "banana": "1f34c",
    "broccoli": "1f966",
    "cabbage": "1f96c",
    "carrot": "1f955",
    "cheese": "1f9c0",
    "cherry": "1f352",
    "chicken": "1f357",
    "corn": "1f33d",
    "cucumber": "1f952",
    "dumpling": "1f95f",
    "egg": "1f95a",
    "eggplant": "1f346",
    "fish": "1f41f",
    "fishcake": "1f365",
    "garlic": "1f9c4",
    "grapes": "1f347",
    "honey": "1f36f",
    "kiwi": "1f95d",
    "lemon": "1f34b",
    "lobster": "1f99e",
    "mango": "1f96d",
    "mushroom": "1f344",
    "noodles": "1f35d",
    "octopus": "1f419",
    "onion": "1f9c5",
    "orange": "1f34a",
    "peanuts": "1f95c",
    "pear": "1f350",
    "peppers": "1fad1",
    "pineapple": "1f34d",
    "pork": "1f969",
    "potato": "1f954",
    "rice": "1f35a",
    "sausage": "1f32d",
    "shrimp": "1f990",
    "squid": "1f991",
    "strawberry": "1f353",
    "sushi": "1f363",
    "taco": "1f32e",
    "tomato": "1f345",
    "watermelon": "1f349",
    "blueberry": "1fad0",
    "ginger": "1fada",
    "edamame": "1fadb",
    "peach": "1f351",
}

flags = """
jp us it es br mx cn kr fr in vn th de ph gb au ca
eg et gh ke ma ng za tn
af bd id ir iq il jo kz lb my mn mm np pk sa sg lk sy tw tr ae uz
at be bg hr cz dk fi gr hu is ie nl no pl pt ro ru se ch ua
cr cu gt jm pa
fj nz
ar bo cl co ec pe uy ve
""".split()

iconify = {
    "peppers": "bell-pepper",
    "corn": "ear-of-corn",
    "cabbage": "leafy-green",
    "pork": "cut-of-meat",
    "fishcake": "fish-cake-with-swirl",
    "chicken": "poultry-leg",
    "sausage": "hot-dog",
    "orange": "tangerine",
    "peanuts": "peanuts",
    "noodles": "spaghetti",
    "blueberry": "blueberries",
    "edamame": "pea-pod",
    "ginger": "ginger",
}


def grab(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "champon-maker/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
    dest.write_bytes(data)
    print("OK", dest.name, len(data))


failed = []
for name, codepoint in foods.items():
    dest = base / "food" / f"{name}.svg"
    url = f"https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/{codepoint}.svg"
    try:
        grab(url, dest)
        continue
    except Exception as err:
        print("FAIL twemoji", name, err)
    slug = iconify.get(name, name)
    try:
        grab(f"https://api.iconify.design/twemoji/{slug}.svg", dest)
    except Exception as err:
        print("FAIL iconify", name, err)
        failed.append(name)

for code in flags:
    dest = base / "flags" / f"{code}.svg"
    url = f"https://cdn.jsdelivr.net/npm/flag-icons@7.3.2/flags/4x3/{code}.svg"
    try:
        grab(url, dest)
    except Exception as err:
        print("FAIL flag", code, err)
        failed.append(code)

print("failed", failed)
