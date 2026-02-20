 document.addEventListener('DOMContentLoaded', async () => {
    let db = [];
    const searchInput = document.getElementById('food-search');
    const suggestBox = document.getElementById('autocomplete-list');
    const resultArea = document.getElementById('result-area');
    const statusMsg = document.getElementById('status-msg');

    // 1. Absolut sicheres Laden der Daten
    async function loadDatabase() {
        try {
            // Wir erzwingen Kleinschreibung beim Dateinamen!
            const response = await fetch('./food_db.json'); 
            if (!response.ok) throw new Error(`Server antwortet mit Status ${response.status}`);
            db = await response.json();
            statusMsg.textContent = "Datenbank bereit. Suche starten!";
            statusMsg.style.color = "green";
        } catch (e) {
            statusMsg.textContent = "FEHLER: food_db.json nicht gefunden oder fehlerhaft!";
            statusMsg.style.color = "red";
            console.error(e);
        }
    }

    // 2. Suche
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
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
                    const row = table.insertRow();
                    row.insertCell(0).textContent = key;
                    row.insertCell(1).textContent = val;
                }
            } else {
                table.innerHTML = '<tr><td>Keine Daten</td></tr>';
            }
        }
        resultArea.classList.remove('hidden');
    }

    await loadDatabase();
});
