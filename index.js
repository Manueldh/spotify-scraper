require('dotenv').config() 
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyPreviewFinder = require('spotify-preview-finder');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
})

async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body['access_token'];

    spotifyApi.setAccessToken(accessToken);
    console.log('✅ Access token verkregen:', accessToken);

    setTimeout(getAccessToken, (data.body['expires_in'] - 60) * 1000);

    scrapeSpotify('rock')
  } catch (err) {
    console.error('❌ Fout bij verkrijgen access token:', err);
  }
}

getAccessToken();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
})

client.connect()
  .then(() => {
    console.log('Database connection established')
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)
  })

function getRandomItems(arr, num) {
  let result = {};
  let usedIndexes = new Set();
  
  while (Object.keys(result).length < num) {
      let randomIndex = Math.floor(Math.random() * arr.length);
      if (!usedIndexes.has(randomIndex)) {
          usedIndexes.add(randomIndex);
          result[arr[randomIndex]] = Math.floor(Math.random() * 5) + 1;
      }
  }
  return result;
}

async function scrapeSpotify(genre) {
  try {
    const instrumentsList = ['acoustic guitar', 'bass guitar', 'electric guitar', 'drums', 'piano', 'violin', 'ukelele', 'saxophone', 'cello', 'trumpet', 'flute', 'accordion'];
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.DB_COLLECTION);

    let uniqueTracks = [];
    let offset = 0;

    while (uniqueTracks.length < 50) {
      const data = await spotifyApi.searchTracks(`genre:${genre}`, { limit: 50, offset: offset });
      const tracks = data.body.tracks.items;
      console.log(`✅ ${genre} tracks:`, tracks);

      for (const track of tracks) {
        const existingTrack = await collection.findOne({ spotifyId: track.id });
        if (!existingTrack) {
          const randomInstruments = getRandomItems(instrumentsList, 4);
          console.log(randomInstruments);

          let previewUrls = null;
          try {
            const previewResult = await spotifyPreviewFinder(track.name, 1); // Limit to 1 preview URL
            if (previewResult.success && previewResult.results.length > 0) {
              previewUrls = previewResult.results[0].previewUrls[0] || null;
            }
          } catch (err) {
            console.error(`❌ Error fetching preview URLs for track ${track.name}:`, err.message);
          }

          const savedData = {
            spotifyId: track.id,
            trackName: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            genre: genre,
            difficulty: randomInstruments,
            popularity: track.popularity,
            album: track.album.name,
            releaseDate: track.album.release_date,
            duration: track.duration_ms,
            albumCover: track.album.images[0]?.url,
            previewUrls: previewUrls
          };

          uniqueTracks.push(savedData);

          if (uniqueTracks.length >= 50) {
            break;
          }
        } else {
          console.log(`ℹ️ Track already exists in database: ${track.name}`);
        }
      }

      offset += 50;
    }

    if (uniqueTracks.length > 0) {
      await saveToDatabase(uniqueTracks);
    }
  } catch (err) {
    console.error(`❌ Fout bij het ophalen van ${genre} tracks:`, err);
  }
}

async function saveToDatabase(savedData) {
  try {
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.DB_COLLECTION);

    const result = await collection.insertMany(savedData);
    console.log(`✅ ${result.insertedCount} tracks saved to database`);
  } catch (err) {
    console.error('❌ Fout bij opslaan van tracks in database:', err);
  }
}