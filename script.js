const USER_AGENT = "GlobalNutritionApp/1.0 (Contact: info@yourdomain.com)";
const API_BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";

const translations = {
    en: { searchBtn: "Search", placeholder: "Search food...", headMacros: "Macronutrients", headVitamins: "Vitamins", headAminos: "Minerals & Amino Acids", thN: "Nutrient", thA: "Amount", thC: "Coverage", thR: "RDI", loading: "Searching...", error: "No results found.", sub: "Per 100g serving" },
    de: { searchBtn: "Suchen", placeholder: "Lebensmittel suchen...", headMacros: "Makronährstoffe", headVitamins: "Vitamine", headAminos: "Mineralien & Aminosäuren", thN: "Nährstoff", thA: "Menge", thC: "Abdeckung", thR: "Bedarf", loading: "Suche läuft...", error: "Nichts gefunden.", sub: "Pro 100g Portion" }
};

const browserLang = navigator.language.split('-')[0];
const t = translations[browserLang] || translations['en'];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').textContent = t.searchBtn;
    document.getElementById('food-input').placeholder = t.placeholder;
    document.getElementById('head-macros').textContent = t.headMacros;
    document.getElementById('head-vitamins').textContent = t.headVitamins;
    document.getElementById('head-aminos').textContent = t.headAminos;
});

const RDI = {
    'energy-kcal_100g': { val: 2000, unit: 'kcal', label: 'Calories' },
    'proteins_100g': { val: 50, unit: 'g', label: 'Protein' },
    'fat_100g': { val: 70, unit: 'g', label: 'Fat' },
    'carbohydrates_100g': { val: 275, unit: 'g', label: 'Carbs' },
    'sugars_100g': { val: 50, unit: 'g', label: 'Sugar' },
    'fiber_100g': { val: 30, unit: 'g', label: 'Fiber' },
    'salt_100g': { val: 6, unit: 'g', label: 'Salt' },
    'vitamin-a_100g': { val: 800, unit: 'µg', label: 'Vitamin A' },
    'vitamin-c_100g': { val: 80, unit: 'mg', label: 'Vitamin C' },
    'vitamin-d_100g': { val: 5, unit: 'µg', label: 'Vitamin D' },
    'vitamin-e_100g': { val: 12, unit: 'mg', label: 'Vitamin E' },
    'vitamin-k_100g': { val: 75, unit: 'µg', label: 'Vitamin K' },
    'calcium_100g': { val: 800, unit: 'mg', label: 'Calcium' },
    'iron_100g': { val: 14, unit: 'mg', label: 'Iron' },
    'magnesium_100g': { val: 375, unit: 'mg', label: 'Magnesium' },
    'potassium_100g': { val: 2000, unit: 'mg', label: 'Potassium' },
    'zinc_100g': { val: 10, unit: 'mg', label: 'Zinc' },
    'tryptophan_100g': { val: 0.28, unit: 'g', label: 'Tryptophan' },
    'lysine_100g': { val: 2.1, unit: 'g', label: 'Lysine' },
    'leucine_100g': { val: 2.7, unit: 'g', label: 'Leucine' }
};

const inputElement = document.getElementById('food-input');
const searchButton = document.getElementById('search-button');

searchButton.onclick = searchFood;
inputElement.onkeypress = (e) => { if(e.key === 'Enter') searchFood(); };

async function searchFood() {
    const query = inputElement.value.trim();
    if (!query) return;

    document.getElementById('loading-spinner').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    try {
        const url = `${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        
        if (data.products && data.products.length > 0) {
            displayResults(data.products[0]);
        } else {
            showError(t.error);
        }
    } catch (e) {
        showError("Connection Error");
    } finally {
        document.getElementById('loading-spinner').classList.add('hidden');
    }
}

function displayResults(product) {
    const name = product.product_name || "Food Item";
    document.getElementById('result-title').textContent = name;
    document.getElementById('result-subtitle').textContent = t.sub;
    document.title = `${name} | Nutrition`;

    const nut = product.nutriments;

    renderTable('macro-body', nut, ['energy-kcal_100g', 'proteins_100g', 'fat_100g', 'carbohydrates_100g', 'sugars_100g', 'fiber_100g', 'salt_100g'], null, 'bar-macro');
    renderTable('vitamin-body', nut, ['vitamin-a_100g', 'vitamin-c_100g', 'vitamin-d_100g', 'vitamin-e_100g', 'vitamin-k_100g'], 'vitamin-section', 'bar-vitamin');
    renderTable('amino-body', nut, ['calcium_100g', 'iron_100g', 'magnesium_100g', 'potassium_100g', 'zinc_100g', 'tryptophan_100g', 'lysine_100g', 'leucine_100g'], 'amino-section', 'bar-amino');

    document.getElementById('results-container').classList.remove('hidden');
}

function renderTable(targetId, nutriments, keys, sectionId, barClass) {
    const tbody = document.getElementById(targetId);
    tbody.innerHTML = '';
    let foundCount = 0;

    keys.forEach(k => {
        const val = nutriments[k];
        if (val !== undefined && val !== null) {
            foundCount++;
            const rdiObj = RDI[k] || { val: 100, unit: '?', label: k };
            const perc = Math.min(100, (val / rdiObj.val) * 100);
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${rdiObj.label}</strong></td>
                    <td>${parseFloat(val).toFixed(2)} ${rdiObj.unit}</td>
                    <td>
                        <div class="coverage-bar-container"><div class="coverage-bar ${barClass}" style="width:${perc}%"></div></div>
                        <span class="coverage-value">${perc.toFixed(0)}%</span>
                    </td>
                    <td class="norm-cell">${rdiObj.val}${rdiObj.unit}</td>
                </tr>`;
        }
    });

    if (sectionId) {
        document.getElementById(sectionId).classList.toggle('hidden', foundCount === 0);
    }
}

function showError(msg) {
    const err = document.getElementById('error-message');
    err.textContent = msg;
    err.classList.remove('hidden');
}
