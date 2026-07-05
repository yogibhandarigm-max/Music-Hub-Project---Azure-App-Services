(function(){
    // YouTube Music trending fetcher with automatic interval refresh.
    // Requires a global `YOUTUBE_API_KEY` string (set in config.js) and optional
    // `YOUTUBE_SYNC_INTERVAL_MINUTES` (integer) for refresh frequency.
    const API_KEY = window.YOUTUBE_API_KEY || null;
    const TARGET = document.getElementById('trending-list');
    const MAX = 12;
    const INTERVAL_MIN = (window.YOUTUBE_SYNC_INTERVAL_MINUTES && Number(window.YOUTUBE_SYNC_INTERVAL_MINUTES)) || 10; // minutes

    function createCard(video){
        const id = video.id;
        const snip = video.snippet || {};
        const title = snip.title || 'Unknown';
        const channel = snip.channelTitle || '';
        const thumb = ((snip.thumbnails && (snip.thumbnails.high || snip.thumbnails.medium || snip.thumbnails.default)) || {}).url || '';
        const url = 'https://www.youtube.com/watch?v=' + id;

        return `
        <div class="song-card">
            <div class="song-image">
                <a href="${url}" target="_blank" rel="noopener noreferrer">
                    <img src="${thumb}" alt="${title}">
                </a>
                <a class="play-btn" href="${url}" target="_blank" rel="noopener noreferrer"><i class="fas fa-play"></i></a>
            </div>
            <h4>${title}</h4>
            <p>${channel}</p>
        </div>`;
    }

    function showMessage(msg){
        if(!TARGET) return;
        TARGET.innerHTML = `<div style="color:#b3b3b3;padding:12px">${msg}</div>`;
    }

    async function fetchTrending(){
        if(!TARGET) return;
        if(!API_KEY){
            showMessage('YouTube API key not found. See config.example.js to configure.');
            return;
        }

        const params = new URLSearchParams({
            part: 'snippet',
            chart: 'mostPopular',
            regionCode: 'US',
            videoCategoryId: '10', // Music
            maxResults: String(MAX),
            key: API_KEY
        });

        try{
            const res = await fetch('https://www.googleapis.com/youtube/v3/videos?' + params.toString());
            if(!res.ok) throw new Error('YouTube API error ' + res.status);
            const data = await res.json();
            const items = data.items || [];
            if(items.length === 0){
                showMessage('No trending music found.');
                return;
            }

            const cards = items.map(createCard).join('\n');
            TARGET.innerHTML = cards;
        }catch(err){
            console.error(err);
            showMessage('Failed to fetch YouTube trending: ' + err.message);
        }
    }

    // Expose fetch function for manual trigger if needed
    window.fetchYouTubeTrending = fetchTrending;

    // Run on load and schedule interval refresh
    function start(){
        fetchTrending();
        if(INTERVAL_MIN > 0){
            try{
                setInterval(fetchTrending, INTERVAL_MIN * 60 * 1000);
            }catch(e){
                console.warn('Failed to start trending refresh interval', e);
            }
        }
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', start);
    }else{
        start();
    }
})();
