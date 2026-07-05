// Music Data
const musicData = {
    hollywood: {
        Pop: {
            "The Weeknd": [
                { title: "Blinding Lights", duration: "3:20" },
                { title: "Can't Feel My Face", duration: "3:34" },
                { title: "Starboy", duration: "3:50" },
                { title: "After Hours", duration: "3:58" }
            ],
            "Taylor Swift": [
                { title: "Anti-Hero", duration: "3:21" },
                { title: "Lover", duration: "3:43" },
                { title: "Willow", duration: "3:32" },
                { title: "Blank Space", duration: "3:52" }
            ],
            "Dua Lipa": [
                { title: "Levitating", duration: "3:23" },
                { title: "Don't Start Now", duration: "3:31" },
                { title: "Physical", duration: "3:34" },
                { title: "One Kiss", duration: "3:27" }
            ]
        },
        "Electronic & EDM": {
            "The Chainsmokers": [
                { title: "Closer", duration: "4:04" },
                { title: "Everybody Loves Me", duration: "3:27" },
                { title: "Don't Let Me Down", duration: "3:34" },
                { title: "Something Just Like This", duration: "3:59" }
            ],
            "Calvin Harris": [
                { title: "This Is What You Came For", duration: "3:30" },
                { title: "Sweet Nothing", duration: "3:08" },
                { title: "How Deep Is Your Love", duration: "3:28" },
                { title: "Feels", duration: "3:59" }
            ]
        },
        "Rock": {
            "Imagine Dragons": [
                { title: "Radioactive", duration: "3:06" },
                { title: "Believer", duration: "3:24" },
                { title: "Whatever It Takes", duration: "3:42" },
                { title: "Thunder", duration: "3:07" }
            ],
            "The Beatles": [
                { title: "Yesterday", duration: "2:05" },
                { title: "Let It Be", duration: "3:50" },
                { title: "Hey Jude", duration: "7:11" },
                { title: "Come Together", duration: "4:19" }
            ]
        },
        "Hip Hop & Rap": {
            "Drake": [
                { title: "One Dance", duration: "4:00" },
                { title: "Too Good at Goodbyes", duration: "3:33" },
                { title: "Hotline Bling", duration: "4:39" },
                { title: "In My Feelings", duration: "3:37" }
            ],
            "Eminem": [
                { title: "Lose Yourself", duration: "5:27" },
                { title: "Stan", duration: "6:04" },
                { title: "Not Afraid", duration: "4:36" },
                { title: "Without Me", duration: "4:58" }
            ]
        }
    },
    bollywood: {
        "Romantic": {
            "Arijit Singh": [
                { title: "Tum Hi Ho", duration: "4:10" },
                { title: "Chaleya", duration: "3:52" },
                { title: "Samjhawan", duration: "5:32" },
                { title: "Raat Ke Hawale", duration: "4:35" }
            ],
            "Shreya Ghoshal": [
                { title: "Barso Re Megha Megha", duration: "4:42" },
                { title: "Dheere Jalna", duration: "3:53" },
                { title: "Teri Meri", duration: "4:20" },
                { title: "Khuda Kay Liye", duration: "4:37" }
            ]
        },
        "Dance & Party": {
            "Neha Kakkar": [
                { title: "Dilbar Dilbar", duration: "3:21" },
                { title: "Kamariya", duration: "3:15" },
                { title: "Manali Trance", duration: "3:23" },
                { title: "Jalebi Baby", duration: "2:42" }
            ],
            "Badshah": [
                { title: "Genda Phool", duration: "3:35" },
                { title: "Paagal", duration: "3:36" },
                { title: "Wakhra Swag", duration: "3:28" },
                { title: "DJ Waley Babu", duration: "3:35" }
            ]
        },
        "Classical Fusion": {
            "AR Rahman": [
                { title: "Jai Ho", duration: "3:56" },
                { title: "Kun Faya Kun", duration: "6:22" },
                { title: "Dil Se Re", duration: "5:05" },
                { title: "Roja Jaaneman", duration: "5:52" }
            ],
            "Rahat Fateh Ali Khan": [
                { title: "Teri Deewani", duration: "4:17" },
                { title: "Tu Maula Maula", duration: "4:22" },
                { title: "Zaroori Tha", duration: "4:39" },
                { title: "Sajda", duration: "4:54" }
            ]
        },
        "Punjabi": {
            "Sidhu Moose Wala": [
                { title: "Lover", duration: "3:17" },
                { title: "Bambiha Bole", duration: "2:39" },
                { title: "G-Eazy", duration: "2:56" },
                { title: "Issa Jatt", duration: "3:07" }
            ],
            "Diljit Dosanjh": [
                { title: "Mundian To Bach Ke", duration: "3:34" },
                { title: "5 Tara Hotels", duration: "3:10" },
                { title: "Do You Know", duration: "3:42" },
                { title: "Tunak Tunak Tun", duration: "3:33" }
            ]
        }
    }
};

let currentCategory = null;
let currentGenre = null;
let currentArtist = null;
let currentStep = 1;

function selectCategory(category) {
    currentCategory = category;
    showStep(2);
    renderGenres();
}

function renderGenres() {
    const genres = Object.keys(musicData[currentCategory]);
    const genreGrid = document.getElementById('genreGrid');
    genreGrid.innerHTML = '';
    
    genres.forEach(genre => {
        const genreCard = document.createElement('div');
        genreCard.className = 'genre-card';
        genreCard.innerHTML = `
            <div class="genre-icon">🎵</div>
            <h3>${genre}</h3>
            <p>${Object.keys(musicData[currentCategory][genre]).length} Artists</p>
        `;
        genreCard.onclick = () => selectGenre(genre);
        genreGrid.appendChild(genreCard);
    });
}

function selectGenre(genre) {
    currentGenre = genre;
    showStep(3);
    renderArtists();
}

function renderArtists() {
    const artists = Object.keys(musicData[currentCategory][currentGenre]);
    const artistGrid = document.getElementById('artistGrid');
    artistGrid.innerHTML = '';
    
    artists.forEach(artist => {
        const artistCard = document.createElement('div');
        artistCard.className = 'artist-browse-card';
        artistCard.innerHTML = `
            <div class="artist-browse-icon">🎤</div>
            <h3>${artist}</h3>
            <p>${musicData[currentCategory][currentGenre][artist].length} Songs</p>
        `;
        artistCard.onclick = () => selectArtist(artist);
        artistGrid.appendChild(artistCard);
    });
}

function selectArtist(artist) {
    currentArtist = artist;
    showStep(4);
    renderSongs();
}

function renderSongs() {
    const songs = musicData[currentCategory][currentGenre][currentArtist];
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';
    
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.innerHTML = `
            <div class="song-info">
                <div class="song-number">${index + 1}</div>
                <div class="song-details">
                    <h4>${song.title}</h4>
                    <p>${currentArtist}</p>
                </div>
            </div>
            <div class="song-actions">
                <span class="song-duration">${song.duration}</span>
                <button class="btn-icon" onclick="playSong('${song.title}', '${currentArtist}')">▶</button>
                <button class="btn-icon" onclick="addToFavorites('${song.title}', '${currentArtist}')">❤</button>
            </div>
        `;
        songsList.appendChild(songItem);
    });
}

function showStep(stepNumber) {
    currentStep = stepNumber;
    document.getElementById('step1').style.display = stepNumber === 1 ? 'block' : 'none';
    document.getElementById('step2').style.display = stepNumber === 2 ? 'block' : 'none';
    document.getElementById('step3').style.display = stepNumber === 3 ? 'block' : 'none';
    document.getElementById('step4').style.display = stepNumber === 4 ? 'block' : 'none';
    
    window.scrollTo(0, 0);
}

function backToStep(stepNumber) {
    if (stepNumber === 1) {
        currentCategory = null;
        currentGenre = null;
        currentArtist = null;
    } else if (stepNumber === 2) {
        currentGenre = null;
        currentArtist = null;
    } else if (stepNumber === 3) {
        currentArtist = null;
    }
    showStep(stepNumber);
}

function playSong(title, artist) {
    alert(`🎵 Now Playing: "${title}" by ${artist}\n\n(This is a test environment - actual playback would be enabled in production)`);
}

function addToFavorites(title, artist) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const song = { title, artist, addedAt: new Date().toLocaleString() };
    
    // Check if already in favorites
    const exists = favorites.some(fav => fav.title === title && fav.artist === artist);
    if (!exists) {
        favorites.push(song);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`✓ "${title}" added to favorites!`);
    } else {
        alert(`"${title}" is already in your favorites!`);
    }
}

// Security check on page load
window.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
});
