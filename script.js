// Wir kapseln alles in ein Event, damit es erst startet, wenn die Seite da ist
document.addEventListener('DOMContentLoaded', () => {
    
    const API_KEY = 'DEMO_KEY';
    const input = document.getElementById('food-input');
    const btn = document.getElementById('search-btn');

    // Nährstoff-IDs
    const MAP = {
        1008: { n: "Kalorien", u: "kcal", r: 2000, c: "macros" },
        1003: { n: "Eiweiß", u: "g", r: 50, c: "macros" },
        1004: { n: "Fett", u: "g", r: 70, c: "macros" },
        1005: { n: "Kohlenhydrate", u: "g", r: 260, c: "macros" },
        1106: { n: "Vitamin A", u: "µg", r: 800, c: "vitamins" },
        1162: { n: "Vitamin C", u: "mg", r: 80, c: "vitamins" },
        1114: { n: "Vitamin D", u: "µg", r: 5, c: "vitamins" },
        1178: { n: "Vitamin B12", u: "µg", r: 2.5, c: "vitamins" },
        1087: { n: "Calcium", u: "mg", r: 800, c: "minerals" },
        1090: { n: "Magnesium", u: "mg", r: 375, c: "minerals" },
        1089: { n: "Eisen", u: "mg", r: 14, c: "minerals" },
        1210: { n: "Tryptophan", u: "g", r: 0.28, c: "aminos" },
        1213: { n: "Leucin", u: "g", r: 2.7, c: "aminos" },
        1214: { n: "Lysin", u: "g", r: 2.1, c: "aminos" }
    };

    // Die Suchfunktion
    async function performSearch() {
        const q = input.value.trim();
        if (!q) return;

        console.log("Suche gestartet für:", q);
        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');

        try {
            const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(q)}&dataType=Foundation`);
            const data = await res.json();

            if (data.foods && data.foods.length > 0) {
                const id = data.foods[0].fdcId;
                const detail = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${id}?api_key=${API_KEY}`);
                const food = await detail.json();
                
                showData(food);
            } else {
                alert("Keine Ergebnisse. Bitte nutzen Sie englische Begriffe (z.B. 'Egg').");
            }
        } catch (e) {
            console.error("Fehler beim Abrufen:", e);
            alert("Fehler bei der Verbindung zur Datenbank.");
        } finally {
            document.getElementById('loader').classList.add('hidden');
        }
    }

    function showData(food) {
        document.getElementById('food-title').textContent = food.description;
        const boxes = { macros: 'box-macros', vitamins: 'box-vitamins', minerals: 'box-minerals', aminos: 'box-aminos' };
        
        // Alle Boxen leeren
        Object.values(boxes).forEach(b => document.getElementById(b).innerHTML = '');

        food.foodNutrients.forEach(n => {
            const config = MAP[n.nutrient.id];
            if (config) {
                const val = n.amount || 0;
                const perc = Math.min(100, (val / config.r) * 100);
                const html = `
                    <div class="row">
                        <div class="row-info"><span>${config.n}</span><b>${val.toFixed(2)} ${config.u}</b></div>
                        <div class="bar-bg"><div class="bar-fill fill-${config.c}" style="width:${perc}%"></div></div>
                    </div>`;
                document.getElementById(boxes[config.c]).innerHTML += html;
            }
        });
        document.getElementById('results').classList.remove('hidden');
    }

    // Event-Listener zuweisen
    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    console.log("App bereit. Event-Listener wurden gebunden.");
});
