// --- Konfiguration ---
// WICHTIG: Ersetze diese E-Mail durch deine eigene!
const USER_AGENT = "Nährwert-Finder-Projekt/1.0 (Kontakt: dein.kontakt@email.de)"; 
const API_BASE_URL = "https://world.openfoodfacts.org/api/v2/search";

// --- Normwerte (Referenzwerte für den Tagesbedarf pro Nährstoff) ---
// Dies sind Durchschnittswerte, basierend auf Standardempfehlungen.
// Die Werte müssen im Code hart kodiert sein, da sie nicht von der API kommen.
// Alle Werte sind in der Einheit, die im Label steht (z.B. mg, µg).
const RDI = { // Recommended Daily Intake (Empfohlener Tagesbedarf)
    // Makronährstoffe (oft nicht als RDI angegeben, hier Schätzungen für die Darstellung)
    'energy-kcal_100g': { value: 2000, unit: 'kcal' }, // Basis für Kalorienverbrauch
    'proteins_100g': { value: 50, unit: 'g' },
    'fat_100g': { value: 70, unit: 'g' },
    'carbohydrates_100g': { value: 275, unit: 'g' },
    'fiber_100g': { value: 30, unit: 'g' },
    'salt_100g': { value: 5, unit: 'g' },

    // Vitamine
    'vitamin-c_100g': { value: 80, unit: 'mg' },
    'vitamin-a_100g': { value: 800, unit: 'µg' },
    'vitamin-d_100g': { value: 20, unit: 'µg' },
    'vitamin-e_100g': { value: 12, unit: 'mg' },
    'vitamin-b1_100g': { value: 1.1, unit: 'mg' },
    'vitamin-b2_100g': { value: 1.4, unit: 'mg' },
    'vitamin-b3_100g': { value: 16, unit: 'mg' },
    'vitamin-b6_100g': { value: 1.4, unit: 'mg' },
    'vitamin-b9_100g': { value: 200, unit: 'µg' }, // Folsäure
    'vitamin-b12_100g': { value: 2.5, unit: 'µg' },

    // Mineralien und Spurenelemente
    'calcium_100g': { value: 800, unit: 'mg' },
    'iron_100g': { value: 14, unit: 'mg' },
    'magnesium_100g': { value: 375, unit: 'mg' },
    'potassium_100g': { value: 2000, unit: 'mg' },
    'zinc_100g': { value: 10, unit: 'mg' },
    'selenium_100g': { value: 55, unit: 'µg' },

    // Aminosäuren (RDI ist komplexer, hier sehr vereinfachte Werte für eine Basisdarstellung)
    // Die meisten Aminosäuren werden in OFF nicht einzeln pro 100g angegeben.
    // Wir verwenden sie primär als Platzhalter/Beispiel.
    'tryptophan_100g': { value: 0.25, unit: 'g' },
    'lysine_100g': { value: 0.8, unit: 'g' },
    // Weitere können hinzugefügt werden, sofern sie in der OFF-Datenbank auftauchen.
};


// --- Definition der anzuzeigenden Nährstoffe ---
// Diese Schlüssel müssen mit denen in der Open Food Facts API übereinstimmen
const MACRO_NUTRIENTS = [
    { key: 'energy-kcal_100g', label: 'Kalorien (Energie)', unit: 'kcal' },
    { key: 'proteins_100g', label: 'Protein', unit: 'g' },
    { key: 'fat_100g', label: 'Fett gesamt', unit: 'g' },
    { key: 'carbohydrates_100g', label: 'Kohlenhydrate gesamt', unit: 'g' },
    { key: 'sugars_100g', label: 'davon Zucker', unit: 'g' },
    { key: 'fiber_100g', label: 'Ballaststoffe', unit: 'g' },
    { key: 'salt_100g', label: 'Salz', unit: 'g' }
];

const VITAMINS = [
    { key: 'vitamin-a_100g', label: 'Vitamin A', unit: 'µg' },
    { key: 'vitamin-c_100g', label: 'Vitamin C', unit: 'mg' },
    { key: 'vitamin-d_100g', label: 'Vitamin D', unit: 'µg' },
    { key: 'vitamin-b1_100g', label: 'Vitamin B1 (Thiamin)', unit: 'mg' },
    { key: 'vitamin-b12_100g', label: 'Vitamin B12', unit: 'µg' },
    { key: 'vitamin-b9_100g', label: 'Vitamin B9 (Folsäure)', unit: 'µg' },
];

const MINERALS_AMINO = [
    { key: 'calcium_100g', label: 'Calcium', unit: 'mg' },
    { key: 'iron_100g', label: 'Eisen', unit: 'mg' },
    { key: 'magnesium_100g', label: 'Magnesium', unit: 'mg' },
    { key: 'potassium_100g', label: 'Kalium', unit: 'mg' },
    { key: 'zinc_100g', label: 'Zink', unit: 'mg' },
    // Da OFF Aminosäuren oft fehlt, verwenden wir Mineralien.
    // Falls das gewünschte Lebensmittel Aminosäuren enthält (selten), könnten wir sie hier suchen:
    // { key: 'tryptophan_100g', label: 'Tryptophan', unit: 'g' }, 
];


// --- HTML-Elemente abrufen ---
const inputElement = document.getElementById('food-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const resultTitle = document.getElementById('result-title');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

// Body-Elemente der Tabellen
const macroBody = document.getElementById('macro-body');
const vitaminBody = document.getElementById('vitamin-body');
const aminoBody = document.getElementById('amino-body');

// Sektionen (um sie auszublenden, wenn keine Daten vorhanden sind)
const macroSection = document.getElementById('macro-section');
const vitaminSection = document.getElementById('vitamin-section');
const aminoSection = document.getElementById('amino-section');

// --- Event Listener ---
searchButton.addEventListener('click', searchFood);
inputElement.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchFood();
    }
});

// --- Hauptsuchfunktion ---
async function searchFood() {
    const query = inputElement.value.trim();
    if (query === "") {
        displayError("Bitte gib einen Suchbegriff ein (z.B. '100g Käse').");
        return;
    }

    // UI zurücksetzen und laden anzeigen
    resultsContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    
    // Clear previous results
    [macroBody, vitaminBody, aminoBody].forEach(body => body.innerHTML = '');
    [macroSection, vitaminSection, aminoSection].forEach(section => section.classList.add('hidden'));


    try {
        // Suche nach dem Produktnamen (sortiert nach Relevanz, nur das erste Ergebnis)
        const response = await fetch(`${API_BASE_URL}?search_terms=${encodeURIComponent(query)}&fields=product_name,nutriments&sort_by=product_name&page_size=1`, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`API-Fehler: Status ${response.status}`);
        }

        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            displayResults(data.products[0], query);
        } else {
            displayError(`Keine genauen Ergebnisse für "${query}" gefunden. Versuche es mit einem allgemeineren Begriff.`);
        }

    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        displayError("Beim Abrufen der Daten ist ein technischer Fehler aufgetreten.");
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}


// --- Funktion zur Darstellung der Ergebnisse ---
function displayResults(product, originalQuery) {
    const productName = product.product_name || originalQuery;
    resultTitle.textContent = `Ergebnisse für ${productName} (je 100g)`;
    
    const nutriments = product.nutriments || {};
    let hasData = false;

    // 1. Makronährstoffe
    const macroRows = createTableRows(MACRO_NUTRIENTS, nutriments);
    if (macroRows.length > 0) {
        macroBody.innerHTML = macroRows.join('');
        macroSection.classList.remove('hidden');
        hasData = true;
    }

    // 2. Vitamine
    const vitaminRows = createTableRows(VITAMINS, nutriments);
    if (vitaminRows.length > 0) {
        vitaminBody.innerHTML = vitaminRows.join('');
        vitaminSection.classList.remove('hidden');
        hasData = true;
    }

    // 3. Mineralien & Aminosäuren
    const aminoRows = createTableRows(MINERALS_AMINO, nutriments);
    if (aminoRows.length > 0) {
        aminoBody.innerHTML = aminoRows.join('');
        aminoSection.classList.remove('hidden');
        hasData = true;
    }
    
    // Alles anzeigen, wenn zumindest Makros gefunden wurden
    if (hasData) {
        resultsContainer.classList.remove('hidden');
    } else {
        displayError(`Das Lebensmittel "${productName}" enthält keine detaillierten Nährwertdaten in der Datenbank.`);
    }
}


// --- Hilfsfunktion zur Erstellung der Tabellenzeilen (Rows) ---
function createTableRows(nutrientsArray, data) {
    const rows = [];

    nutrientsArray.forEach(nutrient => {
        const key = nutrient.key;
        const nutrientValue = data[key];
        const rdiInfo = RDI[key];
        
        // Zeile nur erstellen, wenn ein Nährwert vorhanden ist.
        if (nutrientValue !== undefined) {
            
            let amount = nutrientValue;
            let coveragePercentage = 0;
            let normValue = 'N/A';
            let normUnit = nutrient.unit;

            if (rdiInfo) {
                // RDI und aktuellen Wert auf die gleiche Einheit normalisieren
                // Hier wird angenommen, dass die Einheiten übereinstimmen (g/mg/µg)
                coveragePercentage = Math.min(100, (amount / rdiInfo.value) * 100);
                normValue = `${rdiInfo.value.toFixed(0)}`;
                normUnit = rdiInfo.unit;
            }

            // Sicherstellen, dass die Menge auf 2 Dezimalstellen begrenzt ist
            amount = amount.toFixed(2);
            
            // HTML-Struktur der Zeile (TR)
            const rowHTML = `
                <tr>
                    <td>${nutrient.label}</td>
                    <td>${amount} ${nutrient.unit}</td>
                    <td class="coverage-cell">
                        <div class="coverage-bar-container">
                            <div class="coverage-bar" style="width: ${coveragePercentage.toFixed(0)}%;"></div>
                        </div>
                        <span class="coverage-value">${coveragePercentage.toFixed(0)}%</span>
                    </td>
                    <td class="norm-cell">${normValue} ${normUnit}</td>
                </tr>
            `;
            rows.push(rowHTML);
        }
    });

    return rows;
}


// --- Funktion zur Anzeige von Fehlermeldungen ---
function displayError(message) {
    errorMessage.innerHTML = `<p><strong>Fehler:</strong> ${message}</p>`;
    errorMessage.classList.remove('hidden');
}
