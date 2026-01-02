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
    "selenium": { de: "Selen", rdi: 55, unit: "µg", cat: "minerals" },

    "tryptophan": { de: "Tryptophan", rdi: 0.28, unit: "g", cat: "proteins" },
    "lysine": { de: "Lysin", rdi: 2.1, unit: "g", cat: "proteins" },
    "leucine": { de: "Leucin", rdi: 2.7, unit: "g", cat: "proteins" },
    "isoleucine": { de: "Isoleucin", rdi: 1.4, unit: "g", cat: "proteins" },
    "valine": { de: "Valin", rdi: 1.8, unit: "g", cat: "proteins" }
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').onclick = performAnalysis;
    document.getElementById('food-input').onkeydown = (e) => e.key === 'Enter' && performAnalysis();
});

async function performAnalysis() {
    let query = document.getElementById('food-input').value.trim();
    if (!query) return;

    toggleLoading(true);
    
    try {
        // Trick: Wir hängen "Ciqual" an die Suche, um wissenschaftliche Daten zu erzwingen
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.products && data.products.length > 0) {
            // Wir suchen das Produkt mit den MEISTEN ausgefüllten Nährstoffen
            const bestResult = data.products.reduce((prev, curr) => {
                const countFields = (p) => Object.keys(p.nutriments || {}).length;
                return countFields(curr) > countFields(prev) ? curr : prev;
            });

            renderData(bestResult);
        } else {
            alert("Nichts gefunden.");
        }
    } catch (e) {
        alert("Fehler bei der Anfrage.");
    } finally {
        toggleLoading(false);
    }
}

function renderData(product) {
    document.getElementById('result-title').textContent = product.product_name || "Unbekannt";
    const tables = { macros: 'table-macros', vitamins: 'table-vitamins', minerals: 'table-minerals', proteins: 'table-proteins' };
    Object.values(tables).forEach(id => document.getElementById(id).innerHTML = '');

    const n = product.nutriments;

    for (const [key, info] of Object.entries(nutrientMap)) {
        // API-Keys harmonisieren
        let val = n[`${key}_100g`] || n[key] || n[key.replace('-', '_') + '_100g'] || 0;
        
        // Korrektur: Die API speichert Mikronährstoffe oft in Gramm (0.001g statt 1mg)
        if (info.unit === "mg" && val > 0 && val < 0.5) val *= 1000;
        if (info.unit === "µg" && val > 0 && val < 0.1) val *= 1000000;

        const perc = (val / info.rdi) * 100;
        const row = `
            <tr>
                <td>${info.de}</td>
                <td class="num">${val.toLocaleString('de-DE', {maximumFractionDigits: 2})} ${info.unit}</td>
                <td><div class="bar-wrap"><div class="bar bar-${info.cat}" style="width:${Math.min(100, perc)}%"></div></div></td>
            </tr>`;
        document.getElementById(tables[info.cat]).innerHTML += row;
    }
    document.getElementById('results-container').classList.remove('hidden');
}

function toggleLoading(s) { document.getElementById('loading-spinner').classList.toggle('hidden', !s); }
