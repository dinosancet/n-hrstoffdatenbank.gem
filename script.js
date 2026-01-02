const API_BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const lang = navigator.language.split('-')[0] === 'de' ? 'de' : 'en';

const nutrientMap = {
    // MAKROS
    "energy-kcal": { de: "Brennwert (Kalorien)", rdi: 2000, unit: "kcal", cat: "macros" },
    "proteins": { de: "Eiweiß (Gesamtprotein)", rdi: 50, unit: "g", cat: "macros" },
    "carbohydrates": { de: "Kohlenhydrate", rdi: 260, unit: "g", cat: "macros" },
    "sugars": { de: "- davon Zucker", rdi: 90, unit: "g", cat: "macros" },
    "fat": { de: "Fett", rdi: 70, unit: "g", cat: "macros" },
    "saturated-fat": { de: "- gesättigte Fettsäuren", rdi: 20, unit: "g", cat: "macros" },
    "monounsaturated-fat": { de: "- einfach ungesättigt", rdi: 30, unit: "g", cat: "macros" },
    "polyunsaturated-fat": { de: "- mehrfach ungesättigt", rdi: 20, unit: "g", cat: "macros" },
    "fiber": { de: "Ballaststoffe", rdi: 30, unit: "g", cat: "macros" },
    "salt": { de: "Salz", rdi: 6, unit: "g", cat: "macros" },

    // VITAMINE (Keys nach Open Food Facts Standard)
    "vitamin-a": { de: "Vitamin A", rdi: 800, unit: "µg", cat: "vitamins" },
    "vitamin-d": { de: "Vitamin D", rdi: 5, unit: "µg", cat: "vitamins" },
    "vitamin-e": { de: "Vitamin E", rdi: 12, unit: "mg", cat: "vitamins" },
    "vitamin-k": { de: "Vitamin K", rdi: 75, unit: "µg", cat: "vitamins" },
    "vitamin-c": { de: "Vitamin C", rdi: 80, unit: "mg", cat: "vitamins" },
    "vitamin-b1": { de: "Vitamin B1 (Thiamin)", rdi: 1.1, unit: "mg", cat: "vitamins" },
    "vitamin-b2": { de: "Vitamin B2 (Riboflavin)", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "vitamin-pp": { de: "Vitamin B3 (Niacin)", rdi: 16, unit: "mg", cat: "vitamins" },
    "pantothenic-acid": { de: "Vitamin B5 (Pantothensäure)", rdi: 6, unit: "mg", cat: "vitamins" },
    "vitamin-b6": { de: "Vitamin B6 (Pyridoxin)", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "biotin": { de: "Vitamin B7 (Biotin)", rdi: 50, unit: "µg", cat: "vitamins" },
    "vitamin-b9": { de: "Vitamin B9 (Folsäure/Folat)", rdi: 200, unit: "µg", cat: "vitamins" },
    "vitamin-b12": { de: "Vitamin B12 (Cobalamin)", rdi: 2.5, unit: "µg", cat: "vitamins" },

    // MINERALSTOFFE
    "calcium": { de: "Calcium", rdi: 800, unit: "mg", cat: "minerals" },
    "magnesium": { de: "Magnesium", rdi: 375, unit: "mg", cat: "minerals" },
    "iron": { de: "Eisen", rdi: 14, unit: "mg", cat: "minerals" },
    "phosphorus": { de: "Phosphor", rdi: 700, unit: "mg", cat: "minerals" },
    "potassium": { de: "Kalium", rdi: 2000, unit: "mg", cat: "minerals" },
    "zinc": { de: "Zink", rdi: 10, unit: "mg", cat: "minerals" },
    "copper": { de: "Kupfer", rdi: 1, unit: "mg", cat: "minerals" },
    "manganese": { de: "Mangan", rdi: 2, unit: "mg", cat: "minerals" },
    "fluoride": { de: "Fluorid", rdi: 3.5, unit: "mg", cat: "minerals" },
    "selenium": { de: "Selen", rdi: 55, unit: "µg", cat: "minerals" },
    "chromium": { de: "Chrom", rdi: 40, unit: "µg", cat: "minerals" },
    "molybdenum": { de: "Molybdän", rdi: 50, unit: "µg", cat: "minerals" },
    "iodine": { de: "Jod", rdi: 150, unit: "µg", cat: "minerals" },

    // AMINOSÄUREN
    "tryptophan": { de: "Tryptophan", rdi: 0.28, unit: "g", cat: "proteins" },
    "lysine": { de: "Lysin", rdi: 2.1, unit: "g", cat: "proteins" },
    "leucine": { de: "Leucin", rdi: 2.7, unit: "g", cat: "proteins" },
    "isoleucine": { de: "Isoleucin", rdi: 1.4, unit: "g", cat: "proteins" },
    "valine": { de: "Valin", rdi: 1.8, unit: "g", cat: "proteins" },
    "threonine": { de: "Threonin", rdi: 1.1, unit: "g", cat: "proteins" },
    "phenylalanine": { de: "Phenylalanin", rdi: 1.7, unit: "g", cat: "proteins" },
    "methionine": { de: "Methionin", rdi: 1.0, unit: "g", cat: "proteins" },
    "histidine": { de: "Histidin", rdi: 0.7, unit: "g", cat: "proteins" },
    "arginine": { de: "Arginin", rdi: 4.0, unit: "g", cat: "proteins" },
    "alanine": { de: "Alanin", rdi: 3.0, unit: "g", cat: "proteins" },
    "aspartic-acid": { de: "Asparaginsäure", rdi: 3.0, unit: "g", cat: "proteins" },
    "glutamic-acid": { de: "Glutaminsäure", rdi: 5.0, unit: "g", cat: "proteins" },
    "glycine": { de: "Glycin", rdi: 3.0, unit: "g", cat: "proteins" },
    "proline": { de: "Prolin", rdi: 2.0, unit: "g", cat: "proteins" },
    "serine": { de: "Serin", rdi: 2.0, unit: "g", cat: "proteins" },
    "tyrosine": { de: "Tyrosin", rdi: 1.1, unit: "g", cat: "proteins" },
    "cysteine": { de: "Cystein", rdi: 0.5, unit: "g", cat: "proteins" }
};

async function searchFood() {
    const query = document.getElementById('food-input').value.trim();
    if (!query) return;
    toggleLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`);
        const data = await res.json();
        if (data.products && data.products.length > 0) displayResults(data.products[0]);
        else showError("Kein Produkt gefunden.");
    } catch (e) { showError("Fehler bei der Anfrage."); } finally { toggleLoading(false); }
}

function displayResults(product) {
    document.getElementById('result-title').textContent = product.product_name || "Produkt";
    document.getElementById('result-subtitle').textContent = "Analyse pro 100g";
    
    // Score Badges
    const sc = document.getElementById('score-container');
    sc.innerHTML = '';
    if (product.nutrition_grades) sc.innerHTML += `<div class="score-badge nutri-${product.nutrition_grades}">Nutri-Score ${product.nutrition_grades.toUpperCase()}</div>`;
    if (product.nova_group) sc.innerHTML += `<div class="score-badge nova-${product.nova_group}">Nova ${product.nova_group}</div>`;

    const bodies = { macros: 'body-macros', vitamins: 'body-vitamins', minerals: 'body-minerals', proteins: 'body-proteins' };
    Object.values(bodies).forEach(id => document.getElementById(id).innerHTML = '');

    for (const [key, info] of Object.entries(nutrientMap)) {
        // API Prüfung: Wir checken 'key_100g' ODER nur 'key'
        let val = product.nutriments[key + '_100g'] || product.nutriments[key] || 0;
        
        // Umrechnung falls API in Gramm statt mg liefert (oft bei Mineralstoffen)
        if (info.unit === "mg" && val < 0.1 && val > 0) val = val * 1000;
        if (info.unit === "µg" && val < 0.01 && val > 0) val = val * 1000000;

        const perc = Math.min(200, (val / info.rdi) * 100);
        
        const row = `
            <tr>
                <td class="name-col"><strong>${info.de}</strong></td>
                <td class="val-col">${val.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${info.unit}</td>
                <td class="bar-col">
                    <div class="bar-bg"><div class="bar-fill bar-${info.cat}" style="width:${Math.min(100, perc)}%"></div></div>
                    <span class="perc-label">${perc.toFixed(0)}%</span>
                </td>
            </tr>`;
        document.getElementById(bodies[info.cat]).innerHTML += row;
    }
    document.getElementById('results-container').classList.remove('hidden');
}

function toggleLoading(s) { document.getElementById('loading-spinner').classList.toggle('hidden', !s); }
function showError(m) { const e = document.getElementById('error-message'); e.textContent = m; e.classList.remove('hidden'); }

document.getElementById('search-button').onclick = searchFood;
document.getElementById('food-input').onkeydown = (e) => e.key === 'Enter' && searchFood();
