const { MongoClient } = require("mongodb");
const express = require('express');

// this is our server or something idk
const app = express();

// Replace the uri string with your connection string.
const uri = "mongodb+srv://hyperaudiogroup:sYEV0X8FhOm52cj2@hypercluster.u41mzta.mongodb.net/?retryWrites=true&w=majority&appName=hyperCluster";

const client = new MongoClient(uri);

// connect to mongo first
client.connect(err => {
  if (err) {
    console.log("mongo connection fail", err);
    return;
  }
  console.log("connected to mongo -");
});

// add our index.js and index.html static files
app.use(express.static('public'));

// app.use(express.static(path.join(__dirname, 'public')));

// this can get called by another js file 
app.get('/getRows', async (req, res) => {
  try {
    console.error("getting....");
    const database = client.db('hyperAudioDB');
    // this holds each playlist name (hardcoded)
    const playlistNames = ['Main Playlist', 'Coping', 'Feelings', 'Early Days','Routines','Technology','Alisa','Thea','Tyler','Tobin', ];

    let returner = {};
    for(let i = 0; i < playlistNames.length; i++){
      let nextPlayList = database.collection(playlistNames[i]);
      // grab all documents (rows) from next playlist
      let rows = nextPlayList.find();
      // fill first 2 (to make it work with our current code)
      returner[i] = [playlistNames[i], []];
      for await (const doc of rows){
        returner[i].push([doc["URL"], doc["FileName"], doc["Speaker"], doc["PlaylistOrder"], doc["Theme"], doc["Description"], doc["TrackName"], doc["Date"]]);
      } 
    }
    res.json(returner);
    console.error("done!");
  }
  catch (err) {
    console.error("error with /getRows -", err);
  }
});

// listen for incoming requests on port 3000
app.listen(8080, () =>{
  console.error("server started, port 8080");
});
