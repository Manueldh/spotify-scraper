 ⸻

🎧 Spotify Scraper with MongoDB Integration

This Node.js project allows you to fetch tracks from the Spotify API based on a specific genre, enrich the data with random instruments and difficulty levels, and store it into a MongoDB database. It also attempts to find preview audio links using the spotify-preview-finder package.

⸻

🚀 Features
- 	Retrieves up to 50 unique tracks for a given genre from Spotify.
- 	Avoids saving duplicate tracks (based on Spotify ID).
-	Randomly assigns:
-	4 musical instruments from a predefined list.
-	A difficulty level between 1 and 5.
-	Tries to fetch a 30-second audio preview using spotify-preview-finder.
-	Saves the collected track data to a MongoDB database.

⸻

📦 Requirements
-	Node.js (v14 or later)
-	A Spotify Developer account (for API credentials)
-	A MongoDB database (MongoDB Atlas or local)

⸻

🔧 Installation
	1.	Clone the repository

git clone https://github.com/yourusername/spotify-scraper.git
cd spotify-scraper


	2.	Install dependencies

npm install


	3.	Create a .env file
Add your credentials in a .env file at the root of the project:

SPOTIFY_CLIENT_ID=your_spotify_client_id\
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret\
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

DB_USERNAME=your_db_username\
DB_PASSWORD=your_db_password\
DB_HOST=your_db_host\
DB_NAME=your_db_name\
DB_COLLECTION=your_target_collection



⸻

🧠 How It Works
1.	Authenticates with Spotify using the Client Credentials Flow.
2.	Periodically refreshes the access token before expiration.
3.	Scrapes the Spotify Web API for tracks in a specific genre.
4.	For each new track:
    - 	Checks if the track already exists in the database.
	-	Assigns random metadata (instruments + difficulty).
	-	Attempts to get an audio preview URL.
	-	Stores all relevant info in the MongoDB database.

⸻

🧪 Usage

Run the scraper directly:

node index.js

By default, it scrapes the genre "Rock" — you can change this by modifying the call to scrapeSpotify() inside the getAccessToken() function.

⸻

📁 Example Document in MongoDB

{\
  "spotifyId": "123abc456def",\
  "trackName": "Sunset Vibes",\
  "artist": "DJ Flow",\
  "genre": "House",\
  "difficulty": 3,\
  "instruments": ["drums", "bass guitar", "piano", "violin"],\
  "popularity": 65,\
  "album": "Night Life",\
  "releaseDate": "2021-08-13",\
  "duration": 195000,\
  "albumCover": "https://i.scdn.co/image/...",\
  "previewUrls": "https://p.scdn.co/mp3-preview/..."\
}



⸻

🛠 Dependencies
-	spotify-web-api-node
-	spotify-preview-finder
-	mongodb
-	dotenv

⸻

📌 Notes
-	The spotify-preview-finder module is used for preview URLs because Spotify’s Web API often doesn’t provide them reliably.
-	This scraper currently focuses on a single genre but could be extended to handle multiple genres, user input, or even artist-based queries.

⸻