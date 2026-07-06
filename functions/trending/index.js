const { getSecret } = require('../keyvault');

async function getYoutubeApiKey() {
  if (process.env.YOUTUBE_API_KEY) {
    return process.env.YOUTUBE_API_KEY;
  }
  const secretName = process.env.YOUTUBE_API_KEY_SECRET_NAME || 'YouTubeApiKey';
  return getSecret(secretName);
}

module.exports = async function (context, req) {
  let apiKey;
  try {
    apiKey = await getYoutubeApiKey();
  } catch (err) {
    context.log('YouTube API key not available from env or Key Vault, returning mock playlist.');
  }

  if (apiKey) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&videoCategoryId=10&maxResults=10&key=${apiKey}`
      );
      const data = await response.json();
      const songs = (data.items || []).map((item) => ({
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`
      }));

      context.res = {
        status: 200,
        body: {
          message: 'Trending songs loaded successfully',
          songs
        }
      };
      return;
    } catch (err) {
      context.log('YouTube API call failed:', err.message);
    }
  }

  const trendingSongs = [
    { title: 'Summer Vibes', artist: 'Swarity Beats', videoUrl: 'https://www.youtube.com/watch?v=example1' },
    { title: 'Rainy Raga', artist: 'Bollywood Pulse', videoUrl: 'https://www.youtube.com/watch?v=example2' },
    { title: 'Midnight Melody', artist: 'Classic Chill', videoUrl: 'https://www.youtube.com/watch?v=example3' }
  ];

  context.res = {
    status: 200,
    body: {
      message: 'Trending songs loaded successfully',
      songs: trendingSongs
    }
  };
};
