// DOM Elements
const searchInput = document.getElementById('artist-search');
const searchButton = document.getElementById('search-button');
const artistContainer = document.getElementById('artist-container');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const artistModal = document.getElementById('artist-modal');
const modalDetails = document.getElementById('modal-details');
const closeButton = document.querySelector('.close-button');

// Base URL for iTunes Search API
const API_URL = 'https://itunes.apple.com/search?term=';

// Updated DOM Elements
const favoritesContainer = document.createElement('section');
favoritesContainer.id = 'favorites-container';
favoritesContainer.innerHTML = '<h2>Favorite Artists</h2><div id="favorites-list"></div>';
document.body.appendChild(favoritesContainer);

const favoritesList = document.getElementById('favorites-list');

// Load favorites from localStorage
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
renderFavorites();

// Ensure no duplicate search bars or overlays
// Removed unnecessary modal display logic on page load
artistModal.hidden = true; // Ensure modal is hidden by default

// Simplified search button logic to avoid duplicate event listeners
searchButton.addEventListener('click', () => {
    const artistName = searchInput.value.trim();
    if (artistName) {
        artistContainer.innerHTML = `<div class="artist-card"><h2>${artistName}</h2></div>`;
    } else {
        artistContainer.innerHTML = '';
    }
});

// Fetch artists from iTunes API
async function searchArtists(artistName) {
    // Clear previous results and messages
    artistContainer.innerHTML = '';
    errorMessage.hidden = true;
    loadingMessage.hidden = false;

    try {
        const response = await fetch(`${API_URL}${encodeURIComponent(artistName)}&entity=musicArtist&limit=10`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        loadingMessage.hidden = true;

        if (data.results.length === 0) {
            errorMessage.textContent = 'No artists found.';
            errorMessage.hidden = false;
            return;
        }

        displayArtists(data.results);
    } catch (error) {
        loadingMessage.hidden = true;
        errorMessage.textContent = 'An error occurred while fetching data.';
        errorMessage.hidden = false;
        console.error(error);
    }
}

// Display artist cards
function displayArtists(artists) {
    artists.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'artist-card';

        const img = document.createElement('img');
        img.src = artist.artworkUrl100 || 'https://via.placeholder.com/100';
        img.alt = `${artist.artistName} image`;

        const name = document.createElement('h2');
        name.textContent = artist.artistName;

        const heartIcon = document.createElement('span');
        heartIcon.className = 'heart-icon';
        heartIcon.textContent = favorites.some(fav => fav.artistId === artist.artistId) ? '❤️' : '🤍';
        heartIcon.addEventListener('click', () => toggleFavorite(artist, heartIcon));

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(heartIcon);

        card.addEventListener('click', (event) => {
            if (event.target !== heartIcon) {
                showArtistDetails(artist);
            }
        });

        artistContainer.appendChild(card);
    });
}

// Toggle favorite artist
function toggleFavorite(artist, heartIcon) {
    const index = favorites.findIndex(fav => fav.artistId === artist.artistId);
    if (index === -1) {
        favorites.push(artist);
        heartIcon.textContent = '❤️';
    } else {
        favorites.splice(index, 1);
        heartIcon.textContent = '🤍';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

// Render favorites section
function renderFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.textContent = 'No favorite artists yet.';
        return;
    }

    favorites.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'artist-card';

        const img = document.createElement('img');
        img.src = artist.artworkUrl100 || 'https://via.placeholder.com/100';
        img.alt = `${artist.artistName} image`;

        const name = document.createElement('h2');
        name.textContent = artist.artistName;

        card.appendChild(img);
        card.appendChild(name);

        favoritesList.appendChild(card);
    });
}

// Show artist details in modal
function showArtistDetails(artist) {
    modalDetails.innerHTML = `
        <h2>${artist.artistName}</h2>
        <p>Genre: ${artist.primaryGenreName || 'N/A'}</p>
        <p>Country: ${artist.country || 'N/A'}</p>
    `;
    artistModal.hidden = false;
}

// Close modal
closeButton.addEventListener('click', () => {
    artistModal.hidden = true;
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === artistModal) {
        artistModal.hidden = true;
    }
});