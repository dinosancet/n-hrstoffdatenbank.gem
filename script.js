// --- CONFIGURATION ---
const USER_AGENT = "GlobalNutritionApp/1.0 (Contact: info@yourdomain.com)";
const API_BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";

const translations = {
    en: { searchBtn: "Search", placeholder: "Search food...", headMacros: "Macronutrients", headVitamins: "Vitamins", headAminos: "Minerals & Aminos", thN: "Nutrient", thA: "Amount", thC: "Coverage", thR: "RDI", loading: "Searching...", error: "No results found.", sub: "Per 100g serving" },
    de: { searchBtn: "Suchen", placeholder: "Lebensmittel suchen...", headMacros: "Makronährstoffe", headVitamins: "Vitamine", headAminos: "Mineralien & Aminos", thN: "Nährstoff", thA: "Menge", thC: "Abdeckung", thR: "Bedarf", loading: "Suche läuft...", error: "Nichts gefunden.", sub: "Pro 100g Portion" },
    es: { searchBtn: "Buscar", placeholder: "Buscar comida...", headMacros: "Macronutrientes", headVitamins: "Vitaminas", headAminos: "Minerales", thN: "Nutriente", thA: "Cantidad", thC: "Cobertura", thR: "RDI", loading: "Buscando...", error: "Sin resultados.", sub: "Por 100g" },
    fr: { searchBtn: "Chercher", placeholder: "Chercher...", headMacros: "Macronutriments", headVitamins: "Vitamines", headAminos: "Minéraux", thN: "Nutriment", thA: "Quantité", thC: "Couverture", thR: "AJR", loading: "Recherche...", error: "Aucun résultat.", sub: "Par 100g" },
    it: { searchBtn: "Cerca", placeholder: "Cerca...", headMacros: "Macronutrienti", headVitamins: "Vitamine", headAminos: "Minerali", thN: "Nutriente", thA: "Quantità", thC: "Copertura", thR: "RDA", loading: "Ricerca...", error: "Nessun risultato.", sub: "Per 100g" },
    pt: { searchBtn: "Buscar", placeholder: "Buscar...", headMacros: "Macronutrientes", headVitamins: "Vitaminas", headAminos: "Minerais", thN: "Nutriente", thA: "Quantidade", thC: "Cobertura", thR: "IDR", loading: "Buscando...", error: "Sem resultados.", sub: "Por 100g" },
    nl: { searchBtn: "Zoeken", placeholder: "Zoeken...", headMacros: "Macronutriënten", headVitamins: "Vitaminen", headAminos: "Mineralen", thN: "Voedingsstof", thA: "Hoeveelheid", thC: "Dekking", thR: "ADH", loading: "Zoeken...", error: "Geen resultaten.", sub: "Per 100g" },
    pl: { searchBtn: "Szukaj", placeholder: "Szukaj...", headMacros: "Makroskładniki", headVitamins: "Witaminy", headAminos: "Minerały", thN: "Składnik", thA: "Ilość", thC: "Pokrycie", thR: "GDA", loading: "Szukanie...", error: "Brak wyników.", sub: "Na 100g" },
    ru: { searchBtn: "Поиск", placeholder: "Поиск...", headMacros: "Макронутриенты", headVitamins: "Витамины", headAminos: "Минералы", thN: "Вещество", thA: "Кол-во", thC: "Норма", thR: "РДН", loading: "Поиск...", error: "Ничего не найдено.", sub: "На 100г" },
    zh: { searchBtn: "搜索", placeholder: "搜索食物...", headMacros: "宏量营养素", headVitamins: "维生素", headAminos: "矿物质", thN: "营养素", thA: "含量", thC: "摄入量", thR: "标准", loading: "搜索中...", error: "未找到结果。", sub: "每100克" }
};

// Language Setup
const browserLang = navigator.language.split('-')[0];
const t = translations[browserLang] || translations['en'];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').textContent = t.searchBtn;
    document.getElementById('food-input').placeholder = t.placeholder;
    document.getElementById('head-macros').textContent = t.headMacros;
    document.getElementById('head-vitamins').textContent = t.headVitamins;
    document.getElementById('head-aminos').textContent = t.headAminos;
    document.querySelectorAll('.th-n').forEach(el => el.textContent = t.thN);
    document.querySelectorAll('.th-a').forEach(el => el.textContent = t.thA);
    document.querySelectorAll('.th-c').forEach(el => el.textContent = t.thC);
    document.querySelectorAll('.th-r').forEach(el => el.textContent = t.thR);
});

// Nutrient RDI Database
const RDI = {
    'energy-kcal_100g': { val: 2000, unit: 'kcal' },
    'proteins_100g': { val: 50, unit: 'g' },
    'fat_100g': { val: 70, unit: 'g' },
    'carbohydrates_100g': { val: 275, unit: 'g' },
    'sugars_100g': { val: 50, unit: 'g' },
    'fiber_100g': { val: 30, unit: 'g' },
    'salt_100g': { val: 6, unit: 'g' },
    'vitamin-c_100g': { val: 80, unit: 'mg' },
    'vitamin-a_100g': { val: 800, unit: 'µg' },
    'vitamin-d_100g': { val: 5, unit: 'µg' },
    'calcium_100g': { val: 800, unit: 'mg' },
    'iron_100g': { val: 14, unit: 'mg' },
    'magnesium_100g': { val: 375, unit: 'mg' },
    'zinc_100g': { val: 10, unit: 'mg' }
};

const inputElement = document.getElementById('food-input');
const searchButton = document.getElementById('search-button');

searchButton.addEventListener('click', searchFood);
inputElement.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchFood(); });

async function searchFood() {
    const query = inputElement.value.trim();
    if (!query) return;

    document.getElementById('loading-spinner').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    try {
        const url = `${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const data = await res.json();
        
        if (data.products && data.products.length > 0) {
            displayResults(data.products[0]);
        } else {
            showError(t.error);
        }
    } catch (e) {
        showError("Connection error.");
    } finally {
        document.getElementById('loading-spinner').classList.add('hidden');
    }
}

function displayResults(product) {
    const name = product.product_name || "Food Item";
    document.getElementById('result-title').textContent = name;
    document.getElementById('result-subtitle').textContent = t.sub;
    document.title = `${name} | Nutrition Facts`;

    renderTable('macro-body', product.nutriments, ['energy-kcal_100g', 'proteins_100g', 'fat_100g', 'carbohydrates_100g', 'sugars_100g', 'fiber_100g', 'salt_100g']);
    renderTable('vitamin-body', product.nutriments, ['vitamin-c_100g', 'vitamin-a_100g', 'vitamin-d_100g'], 'vitamin-section');
    renderTable('amino-body', product.nutriments, ['calcium_100g', 'iron_100g', 'magnesium_100g', 'zinc_100g'], 'amino-section');

    document.getElementById('results-container').classList.remove('hidden');
}

function renderTable(targetId, nutriments, keys, sectionId = null) {
    const tbody = document.getElementById(targetId);
    tbody.innerHTML = '';
    let found = false;

    keys.forEach(k => {
        const val = nutriments[k];
        if (val !== undefined) {
            found = true;
            const rdiObj = RDI[k] || { val: 100, unit: '' };
            const perc = Math.min(100, (val / rdiObj.val) * 100);
            const label = k.replace('_100g', '').replace('-', ' ').toUpperCase();
            
            tbody.innerHTML += `
                <tr>
                    <td>${label}</td>
                    <td>${val.toFixed(1)} ${rdiObj.unit}</td>
                    <td class="coverage-cell">
                        <div class="coverage-bar-container"><div class="coverage-bar" style="width:${perc}%"></div></div>
                        <span class="coverage-value">${perc.toFixed(0)}%</span>
                    </td>
                    <td class="norm-cell">${rdiObj.val} ${rdiObj.unit}</td>
                </tr>`;
        }
    });

    if (sectionId) {
        document.getElementById(sectionId).classList.toggle('hidden', !found);
    }
}

function showError(msg) {
    const err = document.getElementById('error-message');
    err.textContent = msg;
    err.classList.remove('hidden');
}
