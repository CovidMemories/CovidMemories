const { MongoClient } = require("mongodb");
const express = require('express');
const session = require('express-session');

// this is our server or something idk
const app = express();

// make it so each user has their own session (and their own "loggedIn" boolean)
app.use(session({
  // protect session ID cookie
  // TODO: use an environment variable to make it actually secure
  secret: "superSecretPassword",
  // only modify session if something changed
  resave: false,
  // do not save new sessions that have not been modified
  saveUninitialized: true,
}));

// Replace the uri string with your connection string.
const uri = "mongodb+srv://hyperaudiogroup:sYEV0X8FhOm52cj2@hypercluster.u41mzta.mongodb.net/?retryWrites=true&w=majority&appName=hyperCluster";

const client = new MongoClient(uri);

// connect to mongo first
client.connect(err => {
  if (err) {
    console.error("mongo connection fail", err);
    return;
  }
  console.error("connected to mongo -");
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

// user attempts to log in, set their "loggedIn" boolean to true if successful
// Note: req.session stores session info for person logging in
app.post('/login', async (req, res) => {
  const guess = req.query.Password;
  console.error("guess " + guess);
  // connect to the database
  const database = client.db('hyperAudioDB');
  const passwords = database.collection("ValidPasswords");

  const query = { Password: guess };
  // check if the guess is in the database
  const guessedRight = await passwords.findOne(query);
  // 0 == success
  // 1 == incorrect password
  // 2 == user already logged in
  var guessResult = -1
  // user already logged in
  if(req.session.loggedIn == true){
    guessResult = 2
  }
  else if(guessedRight){
    // save user
    req.session.loggedIn = true;
    guessResult = 0;
  }
  else{
    guessResult = 1;
  }
  // return true if user correctly guess
  res.json({ guessResult: guessResult })
});

// user is attempting to delete a row, only works if they are logged in
app.post('/delete', (req, res) => {
  // only do the thing if user is logged in
  if(req.session.loggedIn == true){
    // ...
  }
});

// user is attempting to add a row, only works if they are logged in
app.post('/add', (req, res) => {
  // only do the thing if user is logged in
  if(req.session.loggedIn == true){
    // ...
  }
});

// listen for incoming requests on port 8080
app.listen(8080, () =>{
  console.error("server started, port 8080");
});
