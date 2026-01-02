// Konfiguration
const API_URL = "https://world.openfoodfacts.org/cgi/search.pl";

const nutrientMap = {
    "energy-kcal": { de: "Energie", rdi: 2000, unit: "kcal", cat: "macros" },
    "proteins": { de: "Eiweiß", rdi: 50, unit: "g", cat: "macros" },
    "carbohydrates": { de: "Kohlenhydrate", rdi: 260, unit: "g", cat: "macros" },
    "sugars": { de: "- davon Zucker", rdi: 90, unit: "g", cat: "macros" },
    "fat": { de: "Fett", rdi: 70, unit: "g", cat: "macros" },
    "saturated-fat": { de: "- gesättigt", rdi: 20, unit: "g", cat: "macros" },
    "fiber": { de: "Ballaststoffe", rdi: 30, unit: "g", cat: "macros" },
    "salt": { de: "Salz", rdi: 6, unit: "g", cat: "macros" },
    "vitamin-a": { de: "Vitamin A", rdi: 800, unit: "µg", cat: "vitamins" },
    "vitamin-d": { de: "Vitamin D", rdi: 5, unit: "µg", cat: "vitamins" },
    "vitamin-e": { de: "Vitamin E", rdi: 12, unit: "mg", cat: "vitamins" },
    "vitamin-k": { de: "Vitamin K", rdi: 75, unit: "µg", cat: "vitamins" },
    "vitamin-c": { de: "Vitamin C", rdi: 80, unit: "mg", cat: "vitamins" },
    "vitamin-b1": { de: "Vitamin B1", rdi: 1.1, unit: "mg", cat: "vitamins" },
    "vitamin-b2": { de: "Vitamin B2", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "vitamin-pp": { de: "Vitamin B3", rdi: 16, unit: "mg", cat: "vitamins" },
    "pantothenic-acid": { de: "Vitamin B5", rdi: 6, unit: "mg", cat: "vitamins" },
    "vitamin-b6": { de: "Vitamin B6", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "biotin": { de: "Biotin", rdi: 50, unit: "µg", cat: "vitamins" },
    "vitamin-b9": { de: "Folsäure", rdi: 200, unit: "µg", cat: "vitamins" },
    "vitamin-b12": { de: "Vitamin B12", rdi: 2.5, unit: "µg", cat: "vitamins" },
    "calcium": { de: "Calcium", rdi: 800, unit: "mg", cat: "minerals" },
    "magnesium": { de: "Magnesium", rdi: 375, unit: "mg", cat: "minerals" },
    "iron": { de: "Eisen", rdi: 14, unit: "mg", cat: "minerals" },
    "phosphorus": { de: "Phosphor", rdi: 700, unit: "mg", cat: "minerals" },
    "potassium": { de: "Kalium", rdi: 2000, unit: "mg", cat: "minerals" },
    "zinc": { de: "Zink", rdi: 10, unit: "mg", cat: "minerals" },
    "selenium": { de: "Selen", rdi: 55, unit: "µg", cat: "minerals" },
    "iodine": { de: "Jod", rdi: 150, unit: "µg", cat: "minerals" },
    "tryptophan": { de: "Tryptophan", rdi: 0.28, unit: "g", cat: "proteins" },
    "lysine": { de: "Lysin", rdi: 2.1, unit: "g", cat: "proteins" },
    "leucine": { de: "Leucin", rdi: 2.7, unit: "g", cat: "proteins" },
    "isoleucine": { de: "Isoleucin", rdi: 1.4, unit: "g", cat: "proteins" },
    "valine": { de: "Valin", rdi: 1.8, unit: "g", cat: "proteins" },
    "threonine": { de: "Threonin", rdi: 1.1, unit: "g", cat: "proteins" },
    "phenylalanine": { de: "Phenylalanin", rdi: 1.7, unit: "g", cat: "proteins" },
    "methionine": { de: "Methionin", rdi: 1.0, unit: "g", cat: "proteins" },
    "histidine": { de: "Histidin", rdi: 0.7, unit: "g", cat: "proteins" },
    "arginine": { de: "Arginin", rdi: 4.0, unit: "g", cat: "proteins" }
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').addEventListener('click', startSearch);
    document.getElementById('food-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startSearch();
    });
});

async function startSearch() {
    const query = document.getElementById('food-input').value.trim();
    if (query.length < 2) return;

    toggleLoading(true);
    
    try {
        // Optimierte API-Abfrage: Wir fragen nur die Felder ab, die wir wirklich brauchen (spart Zeit)
        const fields = "product_name,nutriments,nutrition_grades,nova_group,image_url";
        const url = `${API_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=${fields}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            // Wir suchen das beste Ergebnis (oft ist das erste bei "ei" eben "eis", daher filtern wir nach Relevanz)
            const bestMatch = findBestMatch(data.products, query);
            displayResults(bestMatch);
        } else {
            showError("Nichts gefunden.");
        }
    } catch (err) {
        showError("Fehler beim Laden.");
    } finally {
        toggleLoading(false);
    }
}

function findBestMatch(products, query) {
    // Einfache Logik: Wenn ein Produkt exakt so heißt wie die Suche, nimm das.
    const exact = products.find(p => p.product_name.toLowerCase() === query.toLowerCase());
    return exact || products[0];
}

function displayResults(product) {
    document.getElementById('result-title').textContent = product.product_name;
    
    // Score Badges
    const sc = document.getElementById('score-container');
    sc.innerHTML = '';
    if (product.nutrition_grades) sc.innerHTML += `<div class="score-badge nutri-${product.nutrition_grades}">Nutri-Score ${product.nutrition_grades.toUpperCase()}</div>`;
    if (product.nova_group) sc.innerHTML += `<div class="score-badge nova-${product.nova_group}">Nova ${product.nova_group}</div>`;

    const bodies = { macros: 'body-macros', vitamins: 'body-vitamins', minerals: 'body-minerals', proteins: 'body-proteins' };
    Object.values(bodies).forEach(id => document.getElementById(id).innerHTML = '');

    const nutris = product.nutriments;

    for (const [key, info] of Object.entries(nutrientMap)) {
        // API-Keys sind manchmal unterschiedlich (z.B. vitamin-c_100g)
        let val = nutris[`${key}_100g`] || nutris[key] || 0;
        
        // Umrechnungskorrektur (API liefert oft g statt mg bei Kleinstmengen)
        if (info.unit === "mg" && val > 0 && val < 0.5) val *= 1000;
        if (info.unit === "µg" && val > 0 && val < 0.1) val *= 1000000;

        const perc = Math.min(200, (val / info.rdi) * 100);
        
        const row = `
            <tr>
                <td class="name-col"><strong>${info.de}</strong></td>
                <td class="val-col">${val.toLocaleString('de-DE', {maximumFractionDigits: 3})} ${info.unit}</td>
                <td class="bar-col">
                    <div class="bar-bg"><div class="bar-fill bar-${info.cat}" style="width:${Math.min(100, perc)}%"></div></div>
                    <span class="perc-label">${perc.toFixed(0)}%</span>
                </td>
            </tr>`;
        document.getElementById(bodies[info.cat]).innerHTML += row;
    }
    document.getElementById('results-container').classList.remove('hidden');
}

function toggleLoading(s) { 
    document.getElementById('loading-spinner').classList.toggle('hidden', !s);
    if(s) {
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
    }
}

function showError(m) {
    const e = document.getElementById('error-message');
    e.textContent = m;
    e.classList.remove('hidden');
}
