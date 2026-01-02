// Struktur angelehnt an wissenschaftliche Standards (wie Naehrwertrechner)
const nutrientMap = {
    "energy-kcal": { name: "Kalorien", rdi: 2000, unit: "kcal", cat: "cat-macros" },
    "proteins": { name: "Eiweiß", rdi: 50, unit: "g", cat: "cat-macros" },
    "carbohydrates": { name: "Kohlenhydrate", rdi: 260, unit: "g", cat: "cat-macros" },
    "fat": { name: "Fett", rdi: 70, unit: "g", cat: "cat-macros" },
    "fiber": { name: "Ballaststoffe", rdi: 30, unit: "g", cat: "cat-macros" },

    "vitamin-a": { name: "Vitamin A", rdi: 800, unit: "µg", cat: "cat-vitamins" },
    "vitamin-c": { name: "Vitamin C", rdi: 80, unit: "mg", cat: "cat-vitamins" },
    "vitamin-d": { name: "Vitamin D", rdi: 5, unit: "µg", cat: "cat-vitamins" },
    "vitamin-e": { name: "Vitamin E", rdi: 12, unit: "mg", cat: "cat-vitamins" },
    "vitamin-b1": { name: "Vitamin B1", rdi: 1.1, unit: "mg", cat: "cat-vitamins" },
    "vitamin-b2": { name: "Vitamin B2", rdi: 1.4, unit: "mg", cat: "cat-vitamins" },
    "vitamin-b12": { name: "Vitamin B12", rdi: 2.5, unit: "µg", cat: "cat-vitamins" },

    "calcium": { name: "Calcium", rdi: 800, unit: "mg", cat: "cat-minerals" },
    "magnesium": { name: "Magnesium", rdi: 375, unit: "mg", cat: "cat-minerals" },
    "iron": { name: "Eisen", rdi: 14, unit: "mg", cat: "cat-minerals" },
    "zinc": { name: "Zink", rdi: 10, unit: "mg", cat: "cat-minerals" },
    "potassium": { name: "Kalium", rdi: 2000, unit: "mg", cat: "cat-minerals" },

    "tryptophan": { name: "Tryptophan", rdi: 0.28, unit: "g", cat: "cat-proteins" },
    "lysine": { name: "Lysin", rdi: 2.1, unit: "g", cat: "cat-proteins" },
    "leucine": { name: "Leucin", rdi: 2.7, unit: "g", cat: "cat-proteins" },
    "valine": { name: "Valin", rdi: 1.8, unit: "g", cat: "cat-proteins" }
};

document.getElementById('search-button').onclick = fetchData;
document.getElementById('food-input').onkeydown = (e) => e.key === 'Enter' && fetchData();

async function fetchData() {
    const query = document.getElementById('food-input').value.trim();
    if (!query) return;

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    try {
        // RADIKALER ANSATZ: Wir suchen nach dem Begriff und filtern nach "Generic" Produkten (CIQUAL)
        // Das sind die wissenschaftlichen Einträge ohne Marken-Müll.
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=50`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            // Wir suchen den Eintrag mit der HÖCHSTEN Anzahl an Nährwerten
            // Marken haben oft < 10, Laborwerte haben oft > 30
            const bestResult = data.products.reduce((prev, curr) => {
                const getCount = p => Object.keys(p.nutriments || {}).length;
                return getCount(curr) > getCount(prev) ? curr : prev;
            });

            render(bestResult);
        } else {
            alert("Nichts gefunden.");
        }
    } catch (e) {
        alert("Fehler bei der Suche.");
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

function render(p) {
    document.getElementById('food-title').textContent = p.product_name || "Unbekannt";
    const cats = ["cat-macros", "cat-vitamins", "cat-minerals", "cat-proteins"];
    cats.forEach(id => document.getElementById(id).innerHTML = '');

    const n = p.nutriments;

    for (const [key, info] of Object.entries(nutrientMap)) {
        let val = n[`${key}_100g`] || n[key] || n[key.replace('-', '_') + '_100g'] || 0;
        
        // Umrechnung von g in mg/µg für Labor-Genauigkeit
        if (info.unit === "mg" && val > 0 && val < 0.5) val *= 1000;
        if (info.unit === "µg" && val > 0 && val < 0.1) val *= 1000000;

        const perc = Math.min(100, (val / info.rdi) * 100);
        const html = `
            <div class="row">
                <div class="label-box"><span>${info.name}</span><b>${val.toLocaleString('de-DE', {maximumFractionDigits: 2})} ${info.unit}</b></div>
                <div class="bar-bg"><div class="bar-fill ${info.cat}" style="width:${perc}%"></div></div>
            </div>`;
        document.getElementById(info.cat).innerHTML += html;
    }
    document.getElementById('results').classList.remove('hidden');
}
