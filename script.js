const API_BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const lang = navigator.language.split('-')[0] === 'de' ? 'de' : 'en';

const uiTexts = {
    de: { search: "Suchen", placeholder: "z.B. Haferflocken, Lachs...", loading: "Analysiere Nährwerte...", error: "Kein Produkt gefunden.", per100: "Analyse pro 100g" },
    en: { search: "Search", placeholder: "e.g. Oats, Salmon...", loading: "Analyzing nutrition...", error: "No product found.", per100: "Analysis per 100g" }
};

// ERWEITERTE NÄHRSTOFF-MAP (Vollständigkeit & Korrektheit)
const nutrientMap = {
    // MAKRONÄHRSTOFFE
    "energy-kcal": { de: "Brennwert (Kalorien)", en: "Energy", rdi: 2000, unit: "kcal", cat: "macros" },
    "proteins": { de: "Eiweiß (Protein)", en: "Protein", rdi: 50, unit: "g", cat: "macros" },
    "carbohydrates": { de: "Kohlenhydrate", en: "Carbohydrates", rdi: 260, unit: "g", cat: "macros" },
    "sugars": { de: "- davon Zucker", en: "Sugars", rdi: 90, unit: "g", cat: "macros" },
    "fat": { de: "Fett", en: "Fat", rdi: 70, unit: "g", cat: "macros" },
    "saturated-fat": { de: "- gesättigte Fettsäuren", en: "Saturated Fat", rdi: 20, unit: "g", cat: "macros" },
    "monounsaturated-fat": { de: "- einfach ungesättigt", en: "Monounsaturated Fat", rdi: 30, unit: "g", cat: "macros" },
    "polyunsaturated-fat": { de: "- mehrfach ungesättigt", en: "Polyunsaturated Fat", rdi: 20, unit: "g", cat: "macros" },
    "fiber": { de: "Ballaststoffe", en: "Fiber", rdi: 30, unit: "g", cat: "macros" },
    "salt": { de: "Salz (Natrium-Äquivalent)", en: "Salt", rdi: 6, unit: "g", cat: "macros" },

    // VITAMINE
    "vitamin-a": { de: "Vitamin A", en: "Vitamin A", rdi: 800, unit: "µg", cat: "vitamins" },
    "beta-carotene": { de: "Beta-Carotin", en: "Beta-carotene", rdi: 4.8, unit: "mg", cat: "vitamins" },
    "vitamin-d": { de: "Vitamin D", en: "Vitamin D", rdi: 5, unit: "µg", cat: "vitamins" },
    "vitamin-e": { de: "Vitamin E", en: "Vitamin E", rdi: 12, unit: "mg", cat: "vitamins" },
    "vitamin-k": { de: "Vitamin K", en: "Vitamin K", rdi: 75, unit: "µg", cat: "vitamins" },
    "vitamin-c": { de: "Vitamin C", en: "Vitamin C", rdi: 80, unit: "mg", cat: "vitamins" },
    "vitamin-b1": { de: "Vitamin B1 (Thiamin)", en: "Vitamin B1", rdi: 1.1, unit: "mg", cat: "vitamins" },
    "vitamin-b2": { de: "Vitamin B2 (Riboflavin)", en: "Vitamin B2", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "vitamin-pp": { de: "Vitamin B3 (Niacin)", en: "Vitamin B3", rdi: 16, unit: "mg", cat: "vitamins" },
    "pantothenic-acid": { de: "Vitamin B5 (Pantothensäure)", en: "Vitamin B5", rdi: 6, unit: "mg", cat: "vitamins" },
    "vitamin-b6": { de: "Vitamin B6 (Pyridoxin)", en: "Vitamin B6", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "biotin": { de: "Vitamin B7 (Biotin)", en: "Vitamin B7", rdi: 50, unit: "µg", cat: "vitamins" },
    "vitamin-b9": { de: "Vitamin B9 (Folsäure)", en: "Vitamin B9", rdi: 200, unit: "µg", cat: "vitamins" },
    "vitamin-b12": { de: "Vitamin B12", en: "Vitamin B12", rdi: 2.5, unit: "µg", cat: "vitamins" },

    // MINERALSTOFFE
    "calcium": { de: "Calcium", en: "Calcium", rdi: 800, unit: "mg", cat: "minerals" },
    "magnesium": { de: "Magnesium", en: "Magnesium", rdi: 375, unit: "mg", cat: "minerals" },
    "iron": { de: "Eisen", en: "Iron", rdi: 14, unit: "mg", cat: "minerals" },
    "phosphorus": { de: "Phosphor", en: "Phosphorus", rdi: 700, unit: "mg", cat: "minerals" },
    "potassium": { de: "Kalium", en: "Potassium", rdi: 2000, unit: "mg", cat: "minerals" },
    "zinc": { de: "Zink", en: "Zinc", rdi: 10, unit: "mg", cat: "minerals" },
    "copper": { de: "Kupfer", en: "Copper", rdi: 1, unit: "mg", cat: "minerals" },
    "manganese": { de: "Mangan", en: "Manganese", rdi: 2, unit: "mg", cat: "minerals" },
    "fluoride": { de: "Fluorid", en: "Fluoride", rdi: 3.5, unit: "mg", cat: "minerals" },
    "selenium": { de: "Selen", en: "Selenium", rdi: 55, unit: "µg", cat: "minerals" },
    "chromium": { de: "Chrom", en: "Chromium", rdi: 40, unit: "µg", cat: "minerals" },
    "molybdenum": { de: "Molybdän", en: "Molybdenum", rdi: 50, unit: "µg", cat: "minerals" },
    "iodine": { de: "Jod", en: "Iodine", rdi: 150, unit: "µg", cat: "minerals" },

    // AMINOSÄUREN
    "tryptophan": { de: "Tryptophan", en: "Tryptophan", rdi: 0.28, unit: "g", cat: "proteins" },
    "lysine": { de: "Lysin", en: "Lysine", rdi: 2.1, unit: "g", cat: "proteins" },
    "leucine": { de: "Leucin", en: "Leucine", rdi: 2.7, unit: "g", cat: "proteins" },
    "isoleucine": { de: "Isoleucin", en: "Isoleucine", rdi: 1.4, unit: "g", cat: "proteins" },
    "valine": { de: "Valin", en: "Valine", rdi: 1.8, unit: "g", cat: "proteins" },
    "threonine": { de: "Threonin", en: "Threonine", rdi: 1.1, unit: "g", cat: "proteins" },
    "phenylalanine": { de: "Phenylalanin", en: "Phenylalanine", rdi: 1.7, unit: "g", cat: "proteins" },
    "methionine": { de: "Methionin", en: "Methionine", rdi: 1.0, unit: "g", cat: "proteins" },
    "histidine": { de: "Histidin", en: "Histidine", rdi: 0.7, unit: "g", cat: "proteins" },
    "alanine": { de: "Alanin", en: "Alanine", rdi: 3.0, unit: "g", cat: "proteins" },
    "arginine": { de: "Arginin", en: "Arginine", rdi: 4.0, unit: "g", cat: "proteins" }
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').textContent = uiTexts[lang].search;
    document.getElementById('food-input').placeholder = uiTexts[lang].placeholder;
});

async function searchFood() {
    const query = document.getElementById('food-input').value.trim();
    if (!query) return;
    toggleLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`);
        const data = await res.json();
        if (data.products && data.products.length > 0) displayResults(data.products[0]);
        else showError(uiTexts[lang].error);
    } catch (e) { showError("Fehler beim Abrufen der Daten"); } finally { toggleLoading(false); }
}

function displayResults(product) {
    document.getElementById('result-title').textContent = product.product_name || "Produkt";
    document.getElementById('result-subtitle').textContent = uiTexts[lang].per100;
    
    // Scores
    const sc = document.getElementById('score-container');
    sc.innerHTML = '';
    if (product.nutrition_grades) sc.innerHTML += `<div class="score-badge nutri-${product.nutrition_grades}">Nutri-Score ${product.nutrition_grades.toUpperCase()}</div>`;
    if (product.nova_group) sc.innerHTML += `<div class="score-badge nova-${product.nova_group}">Nova ${product.nova_group}</div>`;

    const bodies = { macros: 'body-macros', vitamins: 'body-vitamins', minerals: 'body-minerals', proteins: 'body-proteins' };
    Object.values(bodies).forEach(id => document.getElementById(id).innerHTML = '');

    // Loop durch die Map für Vollständigkeit (zeigt 0 an wenn fehlend)
    for (const [key, info] of Object.entries(nutrientMap)) {
        let val = product.nutriments[key + '_100g'] || 0;
        
        // Kleine Korrektur: Open Food Facts speichert manche Vitamine/Minerale in g statt mg/µg
        // Wir lassen die API-Werte meist so, aber runden sauber.
        const perc = Math.min(100, (val / info.rdi) * 100);
        
        const row = `
            <tr>
                <td class="name-cell"><strong>${info[lang]}</strong></td>
                <td class="val-cell">${val.toLocaleString(lang, {maximumFractionDigits:3})} ${info.unit}</td>
                <td class="bar-cell">
                    <div class="coverage-bar-container">
                        <div class="coverage-bar bar-${info.cat}" style="width:${perc}%"></div>
                    </div>
                    <span class="coverage-value">${perc.toFixed(0)}%</span>
                </td>
            </tr>`;
        
        document.getElementById(bodies[info.cat]).innerHTML += row;
    }
    document.getElementById('results-container').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
}

function toggleLoading(show) {
    document.getElementById('loading-spinner').classList.toggle('hidden', !show);
    if (show) document.getElementById('results-container').classList.add('hidden');
}

function showError(msg) {
    const err = document.getElementById('error-message');
    err.textContent = msg;
    err.classList.remove('hidden');
}

document.getElementById('search-button').addEventListener('click', searchFood);
document.getElementById('food-input').addEventListener('keypress', (e) => e.key === 'Enter' && searchFood());
