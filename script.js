const API_KEY = 'DEMO_KEY';

const NUTRIENTS = {
    1008: { name: "Kalorien", unit: "kcal", rdi: 2000, cat: "macros" },
    1003: { name: "Eiweiß", unit: "g", rdi: 50, cat: "macros" },
    1004: { name: "Fett", unit: "g", rdi: 70, cat: "macros" },
    1005: { name: "Kohlenhydrate", unit: "g", rdi: 260, cat: "macros" },
    1079: { name: "Ballaststoffe", unit: "g", rdi: 30, cat: "macros" },
    1106: { name: "Vitamin A", unit: "µg", rdi: 800, cat: "vitamins" },
    1162: { name: "Vitamin C", unit: "mg", rdi: 80, cat: "vitamins" },
    1114: { name: "Vitamin D", unit: "µg", rdi: 5, cat: "vitamins" },
    1109: { name: "Vitamin E", unit: "mg", rdi: 12, cat: "vitamins" },
    1178: { name: "Vitamin B12", unit: "µg", rdi: 2.5, cat: "vitamins" },
    1087: { name: "Calcium", unit: "mg", rdi: 800, cat: "minerals" },
    1090: { name: "Magnesium", unit: "mg", rdi: 375, cat: "minerals" },
    1089: { name: "Eisen", unit: "mg", rdi: 14, cat: "minerals" },
    1092: { name: "Zink", unit: "mg", rdi: 10, cat: "minerals" },
    1210: { name: "Tryptophan", unit: "g", rdi: 0.28, cat: "aminos" },
    1211: { name: "Threonin", unit: "g", rdi: 1.0, cat: "aminos" },
    1212: { name: "Isoleucin", unit: "g", rdi: 1.4, cat: "aminos" },
    1213: { name: "Leucin", unit: "g", rdi: 2.7, cat: "aminos" },
    1214: { name: "Lysin", unit: "g", rdi: 2.1, cat: "aminos" }
};

const input = document.getElementById('food-input');
const btn = document.getElementById('search-btn');

btn.onclick = processSearch;
input.onkeydown = (e) => e.key === 'Enter' && processSearch();

async function processSearch() {
    const rawQuery = input.value.trim();
    if (!rawQuery) return;

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    try {
        const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawQuery)}&langpair=de|en`);
        const transData = await transRes.json();
        const englishQuery = transData.responseData.translatedText;

        const searchRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(englishQuery)}&dataType=Foundation`);
        const searchData = await searchRes.json();

        if (searchData.foods && searchData.foods.length > 0) {
            const detailRes = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${searchData.foods[0].fdcId}?api_key=${API_KEY}`);
            const food = await detailRes.json();
            render(food, rawQuery);
        } else {
            alert("Keine Labordaten gefunden.");
        }
    } catch (err) {
        alert("Fehler bei der Abfrage.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
}

function render(food, originalName) {
    document.getElementById('food-title').textContent = originalName.charAt(0).toUpperCase() + originalName.slice(1);
    const containers = { macros: 'box-macros', vitamins: 'box-vitamins', minerals: 'box-minerals', aminos: 'box-aminos' };
    Object.values(containers).forEach(id => document.getElementById(id).innerHTML = '');

    food.foodNutrients.forEach(n => {
        const info = NUTRIENTS[n.nutrient.id];
        if (info) {
            const val = n.amount || 0;
            const perc = Math.min(100, (val / info.rdi) * 100);
            const row = `
                <div class="row">
                    <div class="row-info"><span>${info.name}</span><b>${val.toFixed(2)} ${info.unit}</b></div>
                    <div class="bar-bg"><div class="bar-fill fill-${info.cat}" style="width:${perc}%"></div></div>
                </div>`;
            document.getElementById(containers[info.cat]).innerHTML += row;
        }
    });
    document.getElementById('results').classList.remove('hidden');
}
