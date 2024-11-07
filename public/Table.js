import Playlist from "./Playlist.js"

// represents the table that holds playlists, rows, and dropdown menu
class Table {
    playlists; // list of playlist objects
    currPlaylist;
    dropdownMenu;
    loader;
    table; // table element to add rows to
    
    // creates and initializes table
    constructor(){
        this.playlists = {};
        this.currPlaylist = 0;
        this.dropdownMenu = document.getElementById("dropdown-menu");
        this.loader = document.getElementById("loader");
        this.table = document.getElementById("playlistTable");

        this.getRowsJSON().then((jsonInfo) => {
            this.loader.style.display = "none";
            const playlists = jsonInfo.playlists;
            // iterate through each playlist
            for (let i in playlists) {
                const rows = playlists[i];
                const newPlaylist = new Playlist(rows);
                // map playlist name to 
                this.playlists.push(newPlaylist);
            }
        });

     }

    // returns JSON object from server that contains 
    async getRowsJSON(){
        try{
            const data = await fetch('/getRows');
            const dataJSON = await data.json();
            return dataJSON;
        } catch (err) {
            console.error("getRows error: " + err);
        }
    }

    
}

export default Table;
