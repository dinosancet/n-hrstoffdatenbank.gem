const NUTRIENTS = {
    // Makros
    "energy-kcal": { label: "Kalorien", rdi: 2000, unit: "kcal", group: "macros" },
    "proteins": { label: "Eiweiß", rdi: 50, unit: "g", group: "macros" },
    "carbohydrates": { label: "Kohlenhydrate", rdi: 260, unit: "g", group: "macros" },
    "fat": { label: "Fett", rdi: 70, unit: "g", group: "macros" },
    "fiber": { label: "Ballaststoffe", rdi: 30, unit: "g", group: "macros" },
    // Vitamine
    "vitamin-a": { label: "Vitamin A", rdi: 800, unit: "µg", group: "vitamins" },
    "vitamin-c": { label: "Vitamin C", rdi: 80, unit: "mg", group: "vitamins" },
    "vitamin-d": { label: "Vitamin D", rdi: 5, unit: "µg", group: "vitamins" },
    "vitamin-e": { label: "Vitamin E", rdi: 12, unit: "mg", group: "vitamins" },
    "vitamin-b1": { label: "Vitamin B1", rdi: 1.1, unit: "mg", group: "vitamins" },
    "vitamin-b2": { label: "Vitamin B2", rdi: 1.4, unit: "mg", group: "vitamins" },
    "vitamin-b6": { label: "Vitamin B6", rdi: 1.4, unit: "mg", group: "vitamins" },
    "vitamin-b12": { label: "Vitamin B12", rdi: 2.5, unit: "µg", group: "vitamins" },
    // Mineralien
    "calcium": { label: "Calcium", rdi: 800, unit: "mg", group: "minerals" },
    "magnesium": { label: "Magnesium", rdi: 375, unit: "mg", group: "minerals" },
    "iron": { label: "Eisen", rdi: 14, unit: "mg", group: "minerals" },
    "zinc": { label: "Zink", rdi: 10, unit: "mg", group: "minerals" },
    "potassium": { label: "Kalium", rdi: 2000, unit: "mg", group: "minerals" },
    "selenium": { label: "Selen", rdi: 55, unit: "µg", group: "minerals" },
    // Aminosäuren
    "tryptophan": { label: "Tryptophan", rdi: 0.28, unit: "g", group: "proteins" },
    "lysine": { label: "Lysin", rdi: 2.1, unit: "g", group: "proteins" },
    "leucine": { label: "Leucin", rdi: 2.7, unit: "g", group: "proteins" },
    "isoleucine": { label: "Isoleucin", rdi: 1.4, unit: "g", group: "proteins" },
    "valine": { label: "Valin", rdi: 1.8, unit: "g", group: "proteins" },
    "arginine": { label: "Arginin", rdi: 4, unit: "g", group: "proteins" }
};

const inputField = document.getElementById('food-input');
const searchBtn = document.getElementById('search-btn');

searchBtn.addEventListener('click', startSearch);
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startSearch();
});

async function startSearch() {
    const query = inputField.value.trim();
    if (!query) return;

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('output').classList.add('hidden');

    try {
        // Suche nach 50 Produkten, um Labor-Datensätze (Ciqual/Referenz) zu priorisieren
        const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=50`);
        const data = await res.json();

        if (data.products && data.products.length > 0) {
            // Picke das Produkt mit den MEISTEN Nährwert-Einträgen aus der Liste
            const bestResult = data.products.sort((a, b) => 
                Object.keys(b.nutriments || {}).length - Object.keys(a.nutriments || {}).length
            )[0];
            
            renderDisplay(bestResult);
        } else {
            alert("Nichts gefunden. Probieren Sie Begriffe wie 'Lachs', 'Ei' oder 'Hafer'.");
        }
    } catch (err) {
        alert("Fehler bei der Datenabfrage.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
}

function renderDisplay(p) {
    document.getElementById('food-name').textContent = p.product_name || "Unbekannt";
    const boxes = { macros: 'box-macros', vitamins: 'box-vitamins', minerals: 'box-minerals', proteins: 'box-proteins' };
    Object.values(boxes).forEach(id => document.getElementById(id).innerHTML = '');

    const n = p.nutriments;

    for (const [id, info] of Object.entries(NUTRIENTS)) {
        let val = n[`${id}_100g`] || n[id] || n[id.replace('-', '_') + '_100g'] || 0;
        
        // Umrechnung winziger Mengen in lesbare mg/µg
        if (info.unit === "mg" && val > 0 && val < 0.5) val *= 1000;
        if (info.unit === "µg" && val > 0 && val < 0.1) val *= 1000000;

        const perc = Math.min(100, (val / info.rdi) * 100);
        const row = `
            <div class="n-row">
                <div class="n-info"><span>${info.label}</span><b>${val.toLocaleString('de-DE', {maximumFractionDigits: 2})} ${info.unit}</b></div>
                <div class="n-track"><div class="n-bar fill-${info.group}" style="width:${perc}%"></div></div>
            </div>`;
        document.getElementById(boxes[info.group]).innerHTML += row;
    }
    document.getElementById('output').classList.remove('hidden');
}
