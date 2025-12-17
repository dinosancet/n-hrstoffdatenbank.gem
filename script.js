const USER_AGENT = "GlobalNutritionProject/1.0 (Contact: info@yourdomain.com)";
const API_BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";

// --- Erweitertes Wörterbuch (10 Hauptsprachen) ---
const translations = {
    en: { searchBtn: "Search", placeholder: "E.g. Apple...", headMacros: "Macronutrients", headVitamins: "Vitamins", headAminos: "Minerals", thNutrient: "Nutrient", thAmount: "Amount (100g)", thCoverage: "Coverage*", thNorm: "Daily Value", loading: "Searching...", error: "No results found." },
    de: { searchBtn: "Suchen", placeholder: "Z.B. Apfel...", headMacros: "Makronährstoffe", headVitamins: "Vitamine", headAminos: "Mineralien", thNutrient: "Nährstoff", thAmount: "Menge (100g)", thCoverage: "Abdeckung*", thNorm: "Tagesbedarf", loading: "Suche...", error: "Nichts gefunden." },
    es: { searchBtn: "Buscar", placeholder: "Ej. Manzana...", headMacros: "Macronutrientes", headVitamins: "Vitaminas", headAminos: "Minerales", thNutrient: "Nutriente", thAmount: "Cantidad", thCoverage: "Cobertura*", thNorm: "Valor diario", loading: "Buscando...", error: "No se encontraron resultados." },
    fr: { searchBtn: "Chercher", placeholder: "Ex. Pomme...", headMacros: "Macronutriments", headVitamins: "Vitamines", headAminos: "Minéraux", thNutrient: "Nutriment", thAmount: "Quantité", thCoverage: "Couverture*", thNorm: "Valeur quotidienne", loading: "Recherche...", error: "Aucun résultat." },
    it: { searchBtn: "Cerca", placeholder: "Es. Mela...", headMacros: "Macronutrienti", headVitamins: "Vitamine", headAminos: "Minerali", thNutrient: "Nutriente", thAmount: "Quantità", thCoverage: "Copertura*", thNorm: "Valore giornaliero", loading: "Ricerca...", error: "Nessun risultato." },
    pt: { searchBtn: "Buscar", placeholder: "Ex. Maçã...", headMacros: "Macronutrientes", headVitamins: "Vitaminas", headAminos: "Minerais", thNutrient: "Nutriente", thAmount: "Quantidade", thCoverage: "Cobertura*", thNorm: "Valor diário", loading: "Buscando...", error: "Sem resultados." },
    nl: { searchBtn: "Zoeken", placeholder: "Bijv. Appel...", headMacros: "Macronutriënten", headVitamins: "Vitaminen", headAminos: "Mineralen", thNutrient: "Voedingsstof", thAmount: "Hoeveelheid", thCoverage: "Dekking*", thNorm: "Dagelijkse waarde", loading: "Zoeken...", error: "Geen resultaten." },
    pl: { searchBtn: "Szukaj", placeholder: "Np. Jabłko...", headMacros: "Makroskładniki", headVitamins: "Witaminy", headAminos: "Minerały", thNutrient: "Składnik", thAmount: "Ilość", thCoverage: "Pokrycie*", thNorm: "Dzienne zapotrzebowanie", loading: "Szukanie...", error: "Brak wyników." },
    ru: { searchBtn: "Поиск", placeholder: "Напр. Яблоко...", headMacros: "Макронутриенты", headVitamins: "Витамины", headAminos: "Минералы", thNutrient: "Вещество", thAmount: "Кол-во", thCoverage: "Покрытие*", thNorm: "Норма", loading: "Поиск...", error: "Ничего не найдено." },
    zh: { searchBtn: "搜索", placeholder: "例如：苹果...", headMacros: "宏量营养素", headVitamins: "维生素", headAminos: "矿物质", thNutrient: "营养素", thAmount: "含量", thCoverage: "摄入量*", thNorm: "每日标准", loading: "搜索中...", error: "未找到结果。" }
};

// Automatische Spracherkennung
const browserLang = navigator.language.split('-')[0];
const t = translations[browserLang] || translations['en']; // Englisch als Rückfalloption

document.addEventListener('DOMContentLoaded', () => {
    // UI Elemente übersetzen
    document.getElementById('search-button').textContent = t.searchBtn;
    document.getElementById('food-input').placeholder = t.placeholder;
    document.getElementById('head-macros').textContent = t.headMacros;
    document.getElementById('head-vitamins').textContent = t.headVitamins;
    document.getElementById('head-aminos').textContent = t.headAminos;
    document.getElementById('th-nutrient').textContent = t.thNutrient;
    document.getElementById('th-amount').textContent = t.thAmount;
    document.getElementById('th-coverage').textContent = t.thCoverage;
    document.getElementById('th-norm').textContent = t.thNorm;
});

// --- Tagesbedarf (RDI) ---
const RDI = {
    'energy-kcal_100g': 2000,
    'proteins_100g': 50,
    'fat_100g': 70,
    'carbohydrates_100g': 275,
    'vitamin-c_100g': 80,
    'calcium_100g': 800,
    'magnesium_100g': 375
};

async function searchFood() {
    const query = document.getElementById('food-input').value.trim();
    if (!query) return;

    const loader = document.getElementById('loading-spinner');
    loader.textContent = t.loading;
    loader.classList.remove('hidden');

    try {
        // Der Parameter 'search_simple=1' sucht global in allen verfügbaren Sprachen
        const url = `${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`;
        const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            displayResults(data.products[0]);
        } else {
            alert(t.error);
        }
    } catch (e) {
        console.error(e);
    } finally {
        loader.classList.add('hidden');
    }
}

function displayResults(product) {
    const container = document.getElementById('results-container');
    const macroBody = document.getElementById('macro-body');
    macroBody.innerHTML = '';
    
    // Nährstoff-Schlüssel (Beispiel)
    const keys = [
        { key: 'energy-kcal_100g', label: t.headMacros, unit: 'kcal' },
        { key: 'proteins_100g', label: 'Protein', unit: 'g' },
        { key: 'fat_100g', label: 'Fat', unit: 'g' }
    ];

    keys.forEach(n => {
        const val = product.nutriments[n.key];
        if (val !== undefined) {
            const perc = Math.min(100, (val / RDI[n.key]) * 100);
            macroBody.innerHTML += `
                <tr>
                    <td>${n.label}</td>
                    <td>${val.toFixed(1)} ${n.unit}</td>
                    <td class="coverage-cell">
                        <div class="coverage-bar-container"><div class="coverage-bar" style="width:${perc}%"></div></div>
                        <span class="coverage-value">${perc.toFixed(0)}%</span>
                    </td>
                    <td class="norm-cell">${RDI[n.key]} ${n.unit}</td>
                </tr>`;
        }
    });

    document.getElementById('result-title').textContent = product.product_name || "Info";
    container.classList.remove('hidden');
    document.getElementById('macro-section').classList.remove('hidden');
}
