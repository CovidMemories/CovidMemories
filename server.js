const { MongoClient } = require("mongodb");
const express = require('express');
const session = require('express-session');
const argon2 = require('argon2');
// this is our server or something idk
const app = express();
app.use(express.json());// for parsing json
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
      returner[i] = [];
      for await (const doc of rows){
        returner[i].push([doc["URL"], doc["FileName"], doc["Speaker"], doc["PlaylistOrder"], doc["Theme"], doc["Description"], doc["TrackName"], doc["Date"]]);
      }
      // sort based on playlistOrder ascending
      returner[i].sort((a,b) => a[3] - b[3]);
      // fill first 2 (to make it work with our current code)
      returner[i] = [playlistNames[i], []].concat(returner[i]);
    }
    res.json(returner);
    console.error("done!");
  }
  catch (err) {
    console.error("error with /getRows -", err);
  }
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/signup", async (req, res) => {
  try{

  const data = {
    name: req.body.username,
    password: req.body.password
  }
    const database = client.db('hyperAudioDB'); 
    const passwords = database.collection('users');
    const exisitingUser = await collection.findOne({ name: data.name });
    if(exisitingUser){
       return res.send("User already exists");
    }else{
      const hash = await argon2.hash(data.password, {type: argon2.argon2id});
      data.password = hash;
      const userdata = await collection.insertOne(data);
      res.send("User created");
    }
  }catch(err){
    console.error("error signing up", err);
    res.status(500).send("Internal server error");
  }
});
// user attempts to log in, set their "loggedIn" boolean to true if successful
// Note: req.session stores session info for person logging in
app.post('/login', async (req, res) => {
  // connect to the database
  try{
    const database = client.db('hyperAudioDB');
    const passwords = database.collection('users');
    const data = {
      name: req.body.username,
      password: req.body.password
    }
    const check = collection.findOne({ name: req.body.username });
    if(!check){
      res.send("User not found");
    }
    const isPasswordCorrect = await argon2.verify(check.password, req.body.password);
    if(!isPasswordCorrect){
      return res.send("Incorrect password");
    }
    
    res.send("home")
    req.session.loggedIn = true;
    req.session.username = req.body.username;
    res.send("logged in");
  }catch{
    res.send("wrong details")
  }

});

// user is attempting to delete a row, only works if they are logged in
app.post('/delete', (req, res) => {
  try{
    // only do the thing if user is logged in (check #2)
    if(req.session.loggedIn == false){
      res.json({ addResult: false });
      return;
    }
    // grab row pieces
    const PlaylistOrder = parseInt(req.query.PlaylistOrder);
    const Theme = req.query.Theme;
    // connect to the database
    const db = client.db('hyperAudioDB');
    const collection = db.collection(Theme);
    const query = { PlaylistOrder: PlaylistOrder };
    collection.deleteOne(query).then((a) =>{
      // return only after update is done so we dont reset before update
      res.json({ addResult: true });
    });
  }
  catch(err){
    console.error("error deleting " + err);
  }
});

// user is attempting to add a row, only works if they are logged in
app.post('/add', (req, res) => {
  try{
    // only do the thing if user is logged in (check #2)
    if(req.session.loggedIn == false){
      res.json({ addResult: false });
      return;
    }
    // grab row pieces
    const PlaylistOrder = parseInt(req.query.PlaylistOrder);
    const PlaylistName = req.query.PlaylistName;
    // connect to the database
    const db = client.db('hyperAudioDB');
    const collection = db.collection(PlaylistName);
    // get all documents that we need to increment ($gte == >=)
    const filter = { PlaylistOrder: { $gte: PlaylistOrder } };
    const update = { $inc: { PlaylistOrder: 1 } };
    // increment many documents
    // console.log("filter: " + filter);
    // console.log("update: " + update);
    // console.log("PlaylistOrder: " + PlaylistOrder, typeof PlaylistOrder);
    // console.log("Theme: " + Theme);
    // console.log("updating...\n")
    collection.updateMany(filter, update)
    .then((a) => {
      // create doc to insert
      const doc = {
        URL: req.query.URL,
        FileName: req.query.FileName,
        Speaker: req.query.Speaker,
        PlaylistOrder: PlaylistOrder,
        Theme: req.query.Theme,
        Description: req.query.Description,
        TrackName: req.query.TrackName,
        Date: req.query.Date
      }
      collection.insertOne(doc)
      .then((b) => {
        // return only after update is done so we dont reset before update
        res.json({ addResult: true });
      });
    });
  }
  catch(err){
    console.error("error adding " + err);
  }
});

// listen for incoming requests on port 8080
app.listen(8080, () =>{
  console.error("server started, port 8080");
});
