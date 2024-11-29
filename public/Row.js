import { addHandler, deleteHandler, editHandler } from "./index.js"

class Row {
    url;
    fileName;
    speaker;
    playlistOrder;
    theme;
    description;
    trackName;
    date;

    playlist; // playlist object that this row is in
    table; // table element that this Row is in
    tableObject; // table object that this Playlist is in

    row; // js element representing row
    rowIndex; // index in the row
    audioElement;
    buttonElement;
    // buttons that can be in column 1
    showMoreButton;
    addFunction;
    deleteFunction;
    editFunction;
    showMoreFunction;

    isActive; // true if this row is visible to the user

    isBranchStart; // true if this is a branch start row (has dropdown)
    branch1Name;
    branch2Name;
    isBranchBody; // true if this is the body of a branch

    // create a row and add it to table
    constructor(row, playlist, isBranchBody, tableObject) {
        this.tableObject = tableObject;
        this.isBranchBody = isBranchBody;
        this.playlist = playlist;
        this.rowIndex = this.playlist.rows.length;
        this.table = document.getElementById("playlistTable");
        // row stuff
        this.url = row[0];
        this.fileName = row[1];
        this.speaker = row[2];
        this.playlistOrder = row[3];
        this.theme = row[4];
        this.description = row[5];
        this.trackName = row[6];
        this.date = row[7];
        // add row to table
        this.row = this.table.insertRow();
        // initially hide row
        this.row.style.display = "none";
        this.isActive = false;
        this.isBranchStart = false;
        // initialize column 1 button
        this.showMoreButton = document.createElement("button");
        // branch start, run special branch init function
        if (this.description == "Branch") {
            this.isBranchStart = true;
            this.isActive = false;
            this.initBranchStart();
            return;
        }
        // double click to play this row
        const currLen = this.playlist.rows.length;
        this.row.addEventListener("dblclick", () => {
            this.playlist.playRow(currLen);
            this.tableObject.showPauseButton();
        });
        // audio element stuff
        this.audioElement = document.createElement("audio");
        this.audioElement.src = this.url
        this.audioElement.addEventListener("ended", () => {
            // want to play next and switch playlist if necessary
            this.tableObject.playNext();
        });
        // column 1, show more / add / delete / edit button
        const buttonSpot = this.row.insertCell(0);
        // initialize to show more
        this.showMoreButton.className = "show-more";
        this.showMoreButton.onclick = () => {
            this.showMore();
        }
        buttonSpot.appendChild(this.showMoreButton);
        // column 2, name of the track
        const nameSpot = this.row.insertCell(1);
        nameSpot.innerHTML = `<i>"${this.trackName}"</i>`;
        // column 3, speaker
        const speakerSpot = this.row.insertCell(2);
        speakerSpot.innerHTML = this.speaker;
        // column 4,  theme
        const themeSpot = this.row.insertCell(3);
        themeSpot.innerHTML = this.theme;
        // column 5, description
        const descriptionSpot = this.row.insertCell(4);
        descriptionSpot.innerHTML = this.description;
    }

    // constructor for if this is a branch start row
    initBranchStart() {
        this.branch1Name = this.speaker;
        this.branch2Name = this.fileName;
        this.row.insertCell(0).appendChild(this.showMoreButton);
        // add title of branch
        const titleSpot = this.row.insertCell(1);
        titleSpot.innerHTML = `BRANCHING POINT: ${this.branch1Name} or ${this.branch2Name}`;
        // insert empty stuff
        this.row.insertCell(2);
        this.row.insertCell(3);
        // add dropdown button
        const dropdownSpot = this.row.insertCell(4);
        const dropdownButton = document.createElement("button");
        dropdownButton.className = "btn btn-secondary dropdown-toggle";
        dropdownButton.setAttribute("data-toggle", "dropdown");
		dropdownButton.setAttribute("aria-haspopup", "true");
		dropdownButton.setAttribute("aria-expanded", "false");
        dropdownButton.textContent = "Choose playlist branch";
        // dropdown menu
        const dropdownDiv = document.createElement("div");
		dropdownDiv.className = "dropdown-menu";
        // first branch option
        const button1 = document.createElement("a");
        const numBranches = this.playlist.branches.length;
        button1.addEventListener("click", () => {
            this.playlist.showBranch(numBranches);
        });
        button1.className = "dropdown-item";
        button1.textContent = this.branch1Name;
        // second branch option
        const button2 = document.createElement("a");
        button2.addEventListener("click", () => {
            this.playlist.showBranch(numBranches + 1);
        });
        button2.className = "dropdown-item";
        button2.textContent = this.branch2Name;
        // reset branch button, hides other branches
        const button3 = document.createElement("a");
        button3.addEventListener("click", () => {
            this.playlist.hideBranch(numBranches);
            this.playlist.hideBranch(numBranches + 1);
        });
        button3.className = "dropdown-item";
        button3.textContent = "None";
        // add buttons to dropdown menu
        dropdownDiv.appendChild(button1);
        dropdownDiv.appendChild(button2);
        dropdownDiv.appendChild(button3);
        // add dropdownMenu to table
        dropdownSpot.appendChild(dropdownButton);
        dropdownSpot.appendChild(dropdownDiv);
    }

    // hides the row
    hideRow() {
        this.row.style.display = "none";
        this.isActive = false;
    }

    // shows the row
    showRow() {
        this.row.style.display = "table-row";
        // dont want to try and play the branch start row cuz it has no audio
        if (!this.isBranchStart) {
            this.isActive = true;
        }
    }

    // show the add button
    showAddButton(){
        if (!this.isBranchBody) {
            this.showMoreButton.className = "add-row";
            this.showMoreButton.onclick = () => {
                this.addHandler();
            };
        }
    }

    // show the delete button
    showDeleteButton(){
        if (!this.isBranchBody) {
            this.showMoreButton.className = "delete-row";
            this.showMoreButton.onclick = () => {
                this.deleteHandler();
            };
        }
    }

    // show the edit button
    showEditButton(){
        if (!this.isBranchBody) {
            this.showMoreButton.className = "edit-row";
            this.showMoreButton.onclick = () => {
                this.editHandler();
            };
        }
    }

    // reset button to show more buttons
    resetButton(){
        this.showMoreButton.className = "show-more";
        this.showMoreButton.onclick = () => {
            this.showMore();
        }
    }

    // shows more information about this row
    showMore() {
        Swal.fire({
            title: this.trackName,
            html: `Date: ${this.date} <br> Filename: ${this.fileName} <br> URL: <a href="${this.url}" target="_blank">download</a>`,
            showCloseButton: true,
        });
    }

    // user clicks add button on this row
    addHandler() {
        addHandler(this.playlist.name, this.playlistOrder);
        console.log("clicked add button on " + this.trackName);
    }

    // user clicks delete button on this row
    deleteHandler() {
        deleteHandler(this.playlist.name, this.playlistOrder);
        console.log("clicked delete button on " + this.trackName);
    }

    // user clicks edit button on this row
    editHandler() {
        editHandler(this.trackName, this.speaker, this.theme, this.description, this.rowIndex);
        console.log("clicked edit button on " + this.trackName);
    }

    // play this row
    play() {
        this.row.style.color = "#248bd0b6";
        this.row.style.border = "#248bd0b6";
        this.audioElement.play();
        this.tableObject.updateTitleAndArtist(this.trackName, this.speaker);
        this.tableObject.volumeSlider(this.audioElement);
        this.tableObject.audioSlider(this.audioElement);
    }

    // pause this row
    pause() {
        if (!this.isBranchStart) {
            this.audioElement.pause();
        }
    }

    // resets this row since were going to a different row
    reset() {
        if (this.isBranchStart) {
            return;
        }
        this.row.style.color = "";
        this.row.style.border = "";
        this.pause();
        this.audioElement.currentTime = 0;
    }
}

export default Row;
