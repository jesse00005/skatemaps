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

            let popupContent = `<b>${spot.title}</b><br>${spot.description}`;

            if (spot.images && spot.images.length >0) {
                const imagePath = spot.images[0].filePath;
                popupContent += `<br><img src="/${imagePath}" style="width: 100%; border-radius: 6px; margin-top: 10px;" alt="Spot photo">`;
            }

            if (userRole === 'MODERATOR' || userRole === 'ADMIN') {
                popupContent += `<br><button onclick="deleteSpot(${spot.id})" style="background: red; color: white; border: none; padding: 5px; margin-top: 10px; cursor: pointer; width: 100%;">Delete Spot</button>`;
            }

            popupContent += `
                <div class="comments-section">
                    <h4>Comments</h4>
                    <div id="comments-list-${spot.id}" class="comments-list">
                        Loading comments...
                    </div>
                    <div class="comment-form">
                        <input type="text" id="new-comment-${spot.id}" placeholder="Add a comment...">
                        <button onclick="submitComment(${spot.id})">Post</button>
                    </div>
                </div>
            `;

            const marker = L.marker([spot.latitude, spot.longitude])
                .bindPopup(popupContent);

            marker.on('popupopen', () => loadComments(spot.id));

            marker.addTo(map);
            currentMarkers.push(marker);

        }

    })

    Object.keys(counts).forEach(type => {
        document.getElementById(`count-${type}`).innerText = `(${counts[type]})`;
    });
}

fetchSpotsInBounds();


let loggedInUserId = localStorage.getItem("userId");
let loggedInUsername = localStorage.getItem("username");
let userRole = localStorage.getItem("role");

if (loggedInUsername) {
    let adminLink = userRole === 'ADMIN' ? `<a href="#" id="nav-admin">Admin Panel</a> | ` : '';

    document.querySelector('.auth-links').innerHTML = `<span>Welcome, <b>${loggedInUsername}</b>!</span> ${adminLink} <a href="#" onclick="logout()">Logout</a>`;
}

document.querySelector('.auth-links')?.addEventListener('click', (e) => {

    if (e.target.tagName === 'A') e.preventDefault();

    if (e.target.innerText === 'Login') {
        document.getElementById('login-modal').classList.remove('hidden');
    } else if (e.target.innerText === 'Sign Up') {
        document.getElementById('register-modal').classList.remove('hidden');
    } else if (e.target.innerText === 'Admin Panel') {
        document.getElementById('admin-modal').classList.remove('hidden');
        loadAdminUsers();
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const regData = {
        username: document.getElementById('reg-username').value,
        passwordHash: document.getElementById('reg-password').value
    };

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regData)
        });

        if (response.ok) {
            const newUser = await response.json();

            localStorage.setItem("userId", newUser.id);
            localStorage.setItem("username", newUser.username);
            localStorage.setItem("role", newUser.role);

            window.location.reload();
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Registration failed:", error);
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginData = {
        username: document.getElementById('login-username').value,
        passwordHash: document.getElementById('login-password').value // MVP plaintext
    };

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const user = await response.json();

            localStorage.setItem("userId", user.id);
            localStorage.setItem("username", user.username);
            localStorage.setItem("role", user.role);

            window.location.reload();
        } else {
            alert("Invalid credentials. Try again.");
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
});

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.reload();
}

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

    const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerText = "Saving...";
        submitBtn.disabled = true;

    const newSpot = {
        title: document.getElementById('spot-title').value,
        description: document.getElementById('spot-desc').value,
        spotType: document.getElementById('spot-type').value,
        latitude: parseFloat(document.getElementById('spot-lat').value),
        longitude: parseFloat(document.getElementById('spot-lng').value)
    };

    try {
        const spotResponse = await fetch('/api/spots/user/' + loggedInUserId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSpot)
        });

        if(!spotResponse.ok) throw new Error("Failed to save spot details.");

        const createdSpot = await spotResponse.json();
        const newSpotId = createdSpot.id;

        const imageInput = document.getElementById('spot-image');

        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];

            if (file.size > 10485760) {
                alert("Please choose a file under 10MB.");
                submitBtn.innerText = "Save Spot";
                submitBtn.disabled = false;
                return;
                }


            const formData = new FormData();
            formData.append("file", file);




            const imageResponse = await fetch('/api/images/upload/' + newSpotId, {
                method: 'POST',
                body: formData
            });

            if (!imageResponse.ok) {
                console.error("Spot saved, but image failed to upload.");
            }

        }

        modal.classList.add('hidden');
        addSpotForm.reset();
        fetchSpotsInBounds();

    } catch (error) {
        console.error("Error during submission:", error);
        alert("An error occurred while saving the spot.");
    } finally {
        submitBtn.innerText = "Save Spot";
        submitBtn.disabled = false;
    }
});

// Comments logic

async function loadComments(spotId) {
    const commentsListDiv = document.getElementById(`comments-list-${spotId}`);

    try {
        const response = await fetch(`/api/comments/spot/${spotId}`);
        const comments = await response.json();

        commentsListDiv.innerHTML = "";

        if (comments.length === 0) {
            commentsListDiv.innerHTML = "<div style='color: #64748b;'>No comments yet.</div>";
            return;
        }

        comments.forEach(comment => {
            const authorName = comment.author ? comment.author.username : "User";

            let deleteBtn = "";

            if (userRole === 'MODERATOR' || userRole === 'ADMIN') {
                deleteBtn = `<button onclick="deleteComment(${comment.id}, ${spotId})" style="background: red; color: white; border: none; cursor: pointer; margin-left: 10px;">X</button>`;
            }

            commentsListDiv.innerHTML += `
                <div class="comment-item">
                    <span class="comment-author">${authorName}:</span>
                    <span>${comment.content}</span>
                    ${deleteBtn}
                </div>
            `;
        });

        commentsListDiv.scrollTop = commentsListDiv.scrollHeight;

    } catch (error) {
        console.error("Error loading comments:", error);
        commentsListDiv.innerHTML = "<div style='color: #ef4444;'>Failed to load comments.</div>";
    }
}

// Submit new comment
async function submitComment(spotId) {
    if (!loggedInUserId) {
        alert("You must be logged in to post a comment!");
        return;
    }

    const commentInput = document.getElementById(`new-comment-${spotId}`);
    const content = commentInput.value.trim();

    if (!content) return;

    const newComment = {
        content: content
    };

    try {
        const response = await fetch('/api/comments/spot/' + spotId + '/user/' + loggedInUserId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComment)
        });

        if (response.ok) {
            commentInput.value = "";
            loadComments(spotId);
        } else {
            alert("Error posting comment.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function deleteSpot(spotId) {
    if (!confirm("Are you sure you want to delete this spot?")) return;

    await fetch(`/api/spots/${spotId}`, { method: 'DELETE' });

    map.closePopup();
    fetchSpotsInBounds();
}

async function deleteComment(commentId, spotId) {
    if (!confirm("Delete this comment?")) return;

    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });

    loadComments(spotId);
}

async function loadAdminUsers() {
    const userListDiv = document.getElementById('admin-user-list');

    try {
        const response = await fetch('/api/users/all');
        const users = await response.json();

        userListDiv.innerHTML = "";

        users.forEach(user => {
            let actionHtml = user.role === 'USER'
                ? `<button onclick="promoteToModerator(${user.id})" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Make Mod</button>`
                : `<span style="color: #94a3b8; font-size: 12px; padding-top: 4px;">${user.role}</span>`;

            userListDiv.innerHTML += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding: 8px 0;">
                    <span><b>${user.username}</b></span>
                    ${actionHtml}
                </div>
            `;
        });
    } catch (error) {
        console.error("Failed to load users:", error);
        userListDiv.innerHTML = "<span style='color: red;'>Failed to load users.</span>";
    }
}

async function promoteToModerator(userId) {
    if (!confirm("Are you sure you want to promote this user to Moderator?")) return;

    try {
        const response = await fetch(`/api/users/${userId}/promote`, { method: 'PUT' });

        if (response.ok) {
            loadAdminUsers();
        } else {
            alert("Error promoting user.");
        }
    } catch (error) {
        console.error("Promote error:", error);
    }
}

// --- DEBOUNCED SEARCH AUTOCOMPLETE LOGIC ---
const searchInput = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');
let debounceTimer;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (!query) {
        searchDropdown.classList.add('hidden');
        searchDropdown.innerHTML = '';
        return;
    }

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const results = await response.json();

            searchDropdown.innerHTML = '';

            if (results.length > 0) {
                results.forEach(place => {
                    const li = document.createElement('li');
                    li.innerText = place.display_name;

                    li.addEventListener('click', () => {
                        map.flyTo([place.lat, place.lon], 13);

                        searchInput.value = place.display_name.split(',')[0];
                        searchDropdown.classList.add('hidden');
                    });

                    searchDropdown.appendChild(li);
                });

                searchDropdown.classList.remove('hidden');
            } else {
                searchDropdown.classList.add('hidden');
            }
        } catch (error) {
            console.error("Autocomplete error:", error);
        }
    }, 500);
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.add('hidden');
    }
});