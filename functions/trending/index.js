module.exports = async function (context, req) {
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
