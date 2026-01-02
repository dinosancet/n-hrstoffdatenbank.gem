const nutrientMap = {
    "energy-kcal": { de: "Kalorien", rdi: 2000, unit: "kcal", cat: "macros" },
    "proteins": { de: "Eiweiß", rdi: 50, unit: "g", cat: "macros" },
    "carbohydrates": { de: "Kohlenhydrate", rdi: 260, unit: "g", cat: "macros" },
    "fat": { de: "Fett", rdi: 70, unit: "g", cat: "macros" },
    "fiber": { de: "Ballaststoffe", rdi: 30, unit: "g", cat: "macros" },
    "vitamin-a": { de: "Vitamin A", rdi: 800, unit: "µg", cat: "vitamins" },
    "vitamin-d": { de: "Vitamin D", rdi: 5, unit: "µg", cat: "vitamins" },
    "vitamin-e": { de: "Vitamin E", rdi: 12, unit: "mg", cat: "vitamins" },
    "vitamin-c": { de: "Vitamin C", rdi: 80, unit: "mg", cat: "vitamins" },
    "vitamin-b1": { de: "Vitamin B1", rdi: 1.1, unit: "mg", cat: "vitamins" },
    "vitamin-b2": { de: "Vitamin B2", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "vitamin-b6": { de: "Vitamin B6", rdi: 1.4, unit: "mg", cat: "vitamins" },
    "vitamin-b12": { de: "Vitamin B12", rdi: 2.5, unit: "µg", cat: "vitamins" },
    "calcium": { de: "Calcium", rdi: 800, unit: "mg", cat: "minerals" },
    "magnesium": { de: "Magnesium", rdi: 375, unit: "mg", cat: "minerals" },
    "iron": { de: "Eisen", rdi: 14, unit: "mg", cat: "minerals" },
    "zinc": { de: "Zink", rdi: 10, unit: "mg", cat: "minerals" },
    "potassium": { de: "Kalium", rdi: 2000, unit: "mg", cat: "minerals" },
    "tryptophan": { de: "Tryptophan", rdi: 0.28, unit: "g", cat: "proteins" },
    "lysine": { de: "Lysin", rdi: 2.1, unit: "g", cat: "proteins" },
    "leucine": { de: "Leucin", rdi: 2.7, unit: "g", cat: "proteins" },
    "valine": { de: "Valin", rdi: 1.8, unit: "g", cat: "proteins" }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('search-button');
    const input = document.getElementById('food-input');

    btn.addEventListener('click', startSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startSearch();
    });
});

async function startSearch() {
    let query = document.getElementById('food-input').value.trim();
    if (!query) return;

    toggleLoading(true);

    try {
        // Wir suchen nach 24 Produkten, um den datenreichsten Satz zu finden
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.products && data.products.length > 0) {
            // Sortierung nach Anzahl der Nährwerte (verhindert 0-Anzeigen)
            const best = data.products.sort((a, b) => {
                const count = p => Object.keys(p.nutriments || {}).length;
                return count(b) - count(a);
            })[0];
            renderResults(best);
        } else {
            alert("Nichts gefunden.");
        }
    } catch (e) {
        alert("Fehler bei der Abfrage.");
    } finally {
        toggleLoading(false);
    }
}

function renderResults(product) {
    document.getElementById('result-title').textContent = product.product_name || "Unbekannt";
    const ids = { macros: 'body-macros', vitamins: 'body-vitamins', minerals: 'body-minerals', proteins: 'body-proteins' };
    
    Object.values(ids).forEach(id => document.getElementById(id).innerHTML = '');

    const n = product.nutriments;

    for (const [key, info] of Object.entries(nutrientMap)) {
        let val = n[`${key}_100g`] || n[key] || n[key.replace('-', '_') + '_100g'] || 0;
        
        // Laborwerte Umrechnung (g -> mg/µg)
        if (info.unit === "mg" && val > 0 && val < 0.5) val *= 1000;
        if (info.unit === "µg" && val > 0 && val < 0.1) val *= 1000000;

        const perc = Math.min(100, (val / info.rdi) * 100);
        
        const html = `
            <div class="row">
                <div class="row-text">
                    <span class="label">${info.de}</span>
                    <span class="val">${val.toLocaleString('de-DE', {maximumFractionDigits: 2})} ${info.unit}</span>
                </div>
                <div class="bar-outer">
                    <div class="bar-inner bar-${info.cat}" style="width:${perc}%"></div>
                </div>
            </div>`;
        document.getElementById(ids[info.cat]).innerHTML += html;
    }
    document.getElementById('results-container').classList.remove('hidden');
}

function toggleLoading(s) {
    document.getElementById('loading-spinner').classList.toggle('hidden', !s);
    if(s) document.getElementById('results-container').classList.add('hidden');
}
