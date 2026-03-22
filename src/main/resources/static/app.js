const map = L.map('map').setView([40.2859, -74.3474], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);


let currentSpots = [];
let currentMarkers = [];

map.on('moveend', fetchSpotsInBounds);

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', renderMapAndFilters);
});

async function fetchSpotsInBounds() {
    const bounds = map.getBounds();

    const url = `/api/spots/bounds?minLat=${bounds.getSouth()}&maxLat=${bounds.getNorth()}&minLng=${bounds.getWest()}&maxLng=${bounds.getEast()}`;

    try {
        const response = await fetch(url);
        currentSpots = await response.json();
        renderMapAndFilters();
    } catch (error) {
        console.error("Error fetching spots:", error);
    }
}

function renderMapAndFilters() {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];

    const activeTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                             .map(cb => cb.value);

    let counts = { 'Rail': 0, 'Stair': 0, 'Ledge': 0, 'Park': 0, 'Other': 0 };

    currentSpots.forEach(spot => {

        let type = spot.spotType || 'Other';
        if(counts[type] !== undefined) counts[type]++;

        if (activeTypes.includes(type)) {
            const marker = L.marker([spot.latitude, spot.longitude])
                            .bindPopup(`<b>${spot.title}</b><br>${spot.description}`);

            marker.addTo(map);
            currentMarkers.push(marker);
        }
    });

    Object.keys(counts).forEach(type => {
        document.getElementById(`count-${type}`).innerText = `(${counts[type]})`;
    });
}

fetchSpotsInBounds();

// ADD A SPOT LOGIC

const addSpotBtn = document.getElementById('add-spot-btn');
const instructionText = document.getElementById('add-spot-instructions');
const modal = document.getElementById('add-spot-modal');
const cancelBtn = document.getElementById('cancel-btn');
const addSpotForm = document.getElementById('add-spot-form');
const mapDiv = document.getElementById('map');

let isAddingMode = false;

addSpotBtn.addEventListener('click', () => {
    isAddingMode = !isAddingMode;

    if (isAddingMode) {
        mapDiv.classList.add('crosshair-cursor');
        instructionText.classList.remove('hidden');
        addSpotBtn.innerText = "Cancel Adding";
        addSpotBtn.style.backgroundColor = "#ef4444";
    } else {
        mapDiv.classList.remove('crosshair-cursor');
        instructionText.classList.add('hidden');
        addSpotBtn.innerText = "Add New Spot";
        addSpotBtn.style.backgroundColor = "";
    }
});

map.on('click', function(e) {
    if (!isAddingMode) return;

    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);

    document.getElementById('spot-lat').value = lat;
    document.getElementById('spot-lng').value = lng;

    modal.classList.remove('hidden');

    isAddingMode = false;
    mapDiv.classList.remove('crosshair-cursor');
});

cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    addSpotForm.reset();
});

addSpotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newSpot = {
        title: document.getElementById('spot-title').value,
        description: document.getElementById('spot-desc').value,
        spotType: document.getElementById('spot-type').value,
        latitude: parseFloat(document.getElementById('spot-lat').value),
        longitude: parseFloat(document.getElementById('spot-lng').value)
    };

    try {
        const response = await fetch('/api/spots/user/1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSpot)
        });

        if (response.ok) {
            modal.classList.add('hidden');
            addSpotForm.reset();
            fetchSpotsInBounds();
        } else {
            alert("Error saving spot to database.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
});