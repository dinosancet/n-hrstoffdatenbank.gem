document.addEventListener('DOMContentLoaded', () => {
    
    const db = [
        {
            "name": "Hühnerei (Ganz, frisch)",
            "macros": {"Energie": "143 kcal", "Protein": "12.6g", "Fett": "9.5g", "KH": "0.7g"},
            "vitamins": {"Vit A": "140µg", "Vit D": "2.0µg", "Vit B12": "0.9µg"},
            "minerals": {"Calcium": "56mg", "Eisen": "1.8mg", "Zink": "1.3mg"},
            "aminos": {"Leucin": "1.08g", "Lysin": "0.90g", "Valin": "0.76g"}
        },
        {
            "name": "Lachs (Atlantik, roh)",
            "macros": {"Energie": "208 kcal", "Protein": "20.4g", "Fett": "13.4g", "KH": "0g"},
            "vitamins": {"Vit D": "11µg", "Vit B12": "3.2µg"},
            "minerals": {"Magnesium": "27mg", "Kalium": "363mg"},
            "aminos": {"Leucin": "1.66g", "Lysin": "1.87g"}
        }
    ];

    const searchInput = document.getElementById('food-search');
    const suggestBox = document.getElementById('autocomplete-list');
    const resultArea = document.getElementById('result-area');

    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        suggestBox.innerHTML = '';
        
        if (val.length < 2) return;

        const matches = db.filter(f => f.name.toLowerCase().includes(val));
        
        matches.forEach(m => {
            const div = document.createElement('div');
            div.textContent = m.name;
            div.style.padding = "10px";
            div.style.cursor = "pointer";
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
            for (const [key, val] of Object.entries(data)) {
                const row = table.insertRow();
                row.insertCell(0).textContent = key;
                row.insertCell(1).textContent = val;
            }
        }
        resultArea.classList.remove('hidden');
    }
});
