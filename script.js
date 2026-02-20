document.addEventListener('DOMContentLoaded', async () => {
    let db = [];
    const searchInput = document.getElementById('food-search');
    const suggestBox = document.getElementById('autocomplete-list');
    const resultArea = document.getElementById('result-area');

    // 1. Daten laden
    try {
        const response = await fetch('food_db.json');
        db = await response.json();
        console.log("DB geladen");
    } catch (e) {
        console.error("Fehler beim Laden der food_db.json");
    }

    // 2. Such-Logik
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase();
        suggestBox.innerHTML = '';
        if (val.length < 2) return;

        const matches = db.filter(f => f.name.toLowerCase().includes(val)).slice(0, 8);
        matches.forEach(m => {
            const div = document.createElement('div');
            div.textContent = m.name;
            div.onclick = () => {
                searchInput.value = m.name;
                suggestBox.innerHTML = '';
                renderFood(m);
            };
            suggestBox.appendChild(div);
        });
    });

    function renderFood(food) {
        document.getElementById('display-name').textContent = food.name;
        
        const sections = {
            'table-macros': food.macros,
            'table-vitamins': food.vitamins,
            'table-minerals': food.minerals,
            'table-aminos': food.aminos
        };

        for (const [tableId, data] of Object.entries(sections)) {
            const table = document.getElementById(tableId);
            table.innerHTML = '';
            if (data && Object.keys(data).length > 0) {
                for (const [key, val] of Object.entries(data)) {
                    table.innerHTML += `<tr><td>${key}</td><td>${val}</td></tr>`;
                }
            } else {
                table.innerHTML = '<tr><td>Keine Daten vorhanden</td></tr>';
            }
        }
        resultArea.classList.remove('hidden');
    }
});
