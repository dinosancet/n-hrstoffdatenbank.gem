document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'DEMO_KEY';
    const input = document.getElementById('food-input');
    const btn = document.getElementById('search-btn');

    async function performSearch() {
        const query = input.value.trim();
        if (!query) return;

        // UI vorbereiten
        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');

        try {
            // 1. Suche nach dem Lebensmittel
            const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation`);
            const data = await res.json();

            if (data.foods && data.foods.length > 0) {
                // 2. Details abrufen
                const detailRes = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${data.foods[0].fdcId}?api_key=${API_KEY}`);
                const food = await detailRes.json();
                renderData(food);
            } else {
                alert("Keine Referenzdaten gefunden. Versuche es mit 'Egg' oder 'Beef'.");
            }
        } catch (e) {
            alert("Verbindung zur Datenbank fehlgeschlagen.");
        } finally {
            document.getElementById('loader').classList.add('hidden');
        }
    }

    function renderData(food) {
        document.getElementById('food-title').textContent = food.description;
        const containers = { macros: 'box-macros', vitamins: 'box-vitamins', minerals: 'box-minerals', aminos: 'box-aminos' };
        
        // Alle Boxen leeren
        Object.values(containers).forEach(id => document.getElementById(id).innerHTML = '');

        food.foodNutrients.forEach(n => {
            const name = n.nutrient.name;
            const val = n.amount || 0;
            const unit = n.nutrient.unitName;
            let category = "";

            // Kategorisierung nach Text-Erkennung
            if (name.includes("Vitamin")) category = "vitamins";
            else if (["Calcium", "Iron", "Magnesium", "Zinc", "Potassium", "Sodium", "Copper", "Manganese", "Selenium"].some(m => name.includes(m))) category = "minerals";
            else if (["Tryptophan", "Leucine", "Lysine", "Isoleucine", "Threonine", "Valine", "Arginine", "Histidine"].some(a => name.includes(a))) category = "aminos";
            else if (["Protein", "Total lipid", "Carbohydrate", "Energy", "Fiber"].some(m => name.includes(m))) category = "macros";

            if (category) {
                const row = `
                    <div class="row">
                        <div class="row-info"><span>${name}</span><b>${val.toFixed(2)} ${unit}</b></div>
                        <div class="bar-bg"><div class="bar-fill fill-${category}" style="width: ${Math.min(val * 2, 100)}%"></div></div>
                    </div>`;
                document.getElementById(containers[category]).innerHTML += row;
            }
        });
        document.getElementById('results').classList.remove('hidden');
    }

    // Such-Trigger
    btn.onclick = performSearch;
    input.onkeydown = (e) => { if (e.key === 'Enter') performSearch(); };
});  
