import Playlist from "./Playlist.js"

// represents the table that holds playlists, rows, and dropdown menu
class Table {
    playlists; // list of playlist objects
    primitivePlaylists; // maps name -> array representation of rows
    index; // index of current playlist
    dropdownMenu;
    loader;
    table; // table element to add rows to
    title; // displays name of current playlist

    pauseButton; // showing pause symbol in controller
    playButton; // showing play symbol in controller

    offset; // offset used for adding branch body rows to table element

    // creates and initializes table
    constructor(initialPlaylistIndex) {
        this.playlists = [];
        this.index = initialPlaylistIndex;
        this.dropdownMenu = document.getElementsByClassName("dropdown-menu")[0];
        this.loader = document.getElementById("loader");
        this.table = document.getElementById("playlistTable");
        this.title = document.getElementById("playlistContent");
        this.playButton = document.getElementById("play");
        this.pauseButton = document.getElementById("pause");
        this.primitivePlaylists = {};
        this.getRowsJSON().then((jsonInfo) => {
            this.loader.style.display = "none";
            const playlists = jsonInfo.playlists;
            this.primitivePlaylists = jsonInfo.playlists;
            let count = 0;
            // iterate through each playlist abd generate them
            for (let name in playlists) {
                // initialize first playlist's name
                if (count == initialPlaylistIndex) {
                    this.title.innerHTML = name;
                }
                count++;
                // add button to dropdown menu
                this.addDropdownButton(name);
                const rows = playlists[name];
                const newPlaylist = new Playlist(name, rows, this);
                // map playlist name to 
                this.playlists.push(newPlaylist);
            }
            // load in branches for each playlist
            for (let i in this.playlists) {
                this.playlists[i].loadBranches();
            }
            // show the initial playlist initially
            this.playlists[initialPlaylistIndex].showRows();
        });
    }

    // add button to dropdown menu
    addDropdownButton(name) {
        const button = document.createElement("button");
        button.className = "dropdown-item";
        button.textContent = name;
        const index = this.playlists.length;
        button.addEventListener("click", () => {
            this.switchPlaylist(index);
        });
        this.dropdownMenu.appendChild(button);
    }

    // switch from current playlist to this playlist
    switchPlaylist(playlistNum) {
        this.pause();
        // hide old
        this.playlists[this.index].hideRows();
        // show new
        const nextPlaylist = this.playlists[playlistNum];
        nextPlaylist.showRows();
        this.title.innerHTML = nextPlaylist.name;
        this.index = playlistNum;
    }

    // plays the next track or switches playlist if necessary
    playNext() {
        if (this.playlists[this.index].playNext() == false) {
            this.pause();
            this.switchPlaylist((this.index + 1) % this.playlists.length);
            this.play();
        }
        this.showPauseButton();
    }

    // plays the previous track or switches playlist if necessary
    playPrev() {
        if (this.playlists[this.index].playPrev() == false) {
            this.pause();
            let newIndex = this.index - 1
            if (newIndex == -1) {
                newIndex = this.playlists.length - 1;
            }
            this.switchPlaylist(newIndex);
            // start at the last row
            this.playlists[newIndex].index = this.playlists[newIndex].rows.length - 1;
            this.play();
        }
        this.showPauseButton();
    }

    // plays the current track
    play() {
        this.playlists[this.index].play();
        this.showPauseButton();
    }

    // pauses the current track
    pause() {
        this.playlists[this.index].pause();
        this.showPlayButton();
    }

    // shows the pause icon
    showPauseButton() {
        this.playButton.style.display = "none";
        this.pauseButton.style.display = "inline-block";
    }

    // shows the play icon
    showPlayButton() {
        this.pauseButton.style.display = "none";
        this.playButton.style.display = "inline-block";
    }

    // returns all non-branch (primitive) rows of playlist
    realRows(name) {
        const playlist = this.primitivePlaylists[name];
        const returner = []; // stores the non-branch rows of playlist
        for (let i in playlist) {
            const nextRow = playlist[i];
            if (nextRow[5] != "Branch") {
                returner.push(nextRow);
            }
        }
        return returner;
    }

    // updates title and artist in audio player
    updateTitleAndArtist(title, artist) {
        document.getElementById('title').textContent = title;
	    document.getElementById('artist').textContent = artist;
    }
    
    // play a random track
    randomTrack() {
        const playlistIndex = Math.floor(Math.random() * this.playlists.length);
        this.switchPlaylist(playlistIndex);
        // play a non branch object
        while (true) {
            const rowIndex = Math.floor(Math.random() * this.playlists[this.index].rows.length);
            const randomRow = this.playlists[this.index].rows[rowIndex];
            if (randomRow.isBranchStart || randomRow.isBranchBody) {
                continue;
            }
            this.playlists[this.index].playRow(rowIndex);
            this.showPauseButton();
            break;
        }
    }

    // sets up the volume slider given audio element
    volumeSlider(audioElement) {
        const volumeSlider = document.getElementById('volume-slider');

        // Set initial volume level
        audioElement.volume = volumeSlider.value / 100;

        // Update volume level when slider is moved
        volumeSlider.addEventListener('input', function () {
            audioElement.volume = volumeSlider.value / 100;
        });
    }

    // sets up the audio slider given audioElement
    audioSlider(audioElement) {
        const seekbar = document.getElementById('slider');

        //set max value to duration of current audio
        seekbar.max = audioElement.duration;

        var s = Math.floor(audioElement.duration);
        var m = Math.floor(s / 60);

        s = s % 60;
        s = s < 10 ? '0' + s : s;
        m = m < 10 ? '0' + m : m;
        var fullTime = m + ":" + s;

        document.getElementById('full-time').innerHTML = fullTime;

        //update audio when slider moves
        seekbar.oninput = function () {
            audioElement.currentTime = seekbar.value;
        };

        //update slider position when playing
        audioElement.addEventListener('timeupdate', function () {
            seekbar.value = audioElement.currentTime;

            var sec = Math.floor(audioElement.currentTime);
            var min = Math.floor(sec / 60);
            sec = sec % 60;
            sec = sec < 10 ? '0' + sec : sec;
            min = min < 10 ? '0' + min : min;

            var timeText = min + ":" + sec;

            document.getElementById('slider').setAttribute('aria-valuetext', timeText);
            document.getElementById('current-time').innerHTML = timeText;
        });
    }

    // show the add buttons
    showAddButtons() {
        this.playlists[this.index].showAddButtons();
    }

    // show the delete buttons
    showDeleteButtons() {
        this.playlists[this.index].showDeleteButtons();
    }

    // show the edit buttons
    showEditButtons() {
        this.playlists[this.index].showEditButtons();
    }

    // reset buttons to show more buttons
    resetButtons() {
        this.playlists[this.index].resetButtons();
    }

    // returns JSON object from server that contains rows data
    async getRowsJSON() {
        try {
            const data = await fetch('/getRows');
            const dataJSON = await data.json();
            return dataJSON;
        } catch (err) {
            console.error("getRows error: " + err);
        }
    }
}

export default Table;
