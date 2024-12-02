import Row from "./Row.js"

class Playlist {
    name;
    index; // index of current row 
    rows; // rows is list of Row objects in the playlist
    tableElement; // table element that this Playlist is in
    tableObject; // table object that this Playlist is in

    branches; // branches[i] = [startIndex, endIndex] of branch index range

    constructor(name, rows, tableObject){
        this.name = name;
        this.index = 0;
        this.rows = [];
        this.tableObject = tableObject;
        this.tableElement = document.getElementById("playlistTable");
        this.branches = [];
        // load in normal rows
        for (let i in rows) {
            const newRow = new Row(rows[i], this, false, tableObject);
            this.rows.push(newRow);
            // add branch rows
            if (newRow.isBranchStart) {
                this.loadBranches(newRow.branch1Name);
                this.loadBranches(newRow.branch2Name);
            }
        }
    }

    // reveals ith branch to user, hides other
    showBranch(i) {
        let neighborIndex = i - 1;
        // branches come in groups of 2, find neighbor
        if (i % 2 == 0) {
            neighborIndex = i + 1;
        }
        // hide neighbor
        this.hideBranch(neighborIndex);
        // show this branch
        const thisRange = this.branches[i];
        for (let j = thisRange[0]; j < thisRange[1]; j++) {
            this.rows[j].showRow();
        }
    }

    // hides ith branch
    hideBranch(i) {
        const range = this.branches[i];
        for (let i = range[0]; i < range[1]; i++) {
            this.rows[i].hideRow();
        }
    }

    // loads in the simplified branch object of playlist name
    loadBranches(name) {
        const realRows = this.tableObject.realRows(name);
        // the range of indices that this branch body spans
        this.branches.push([this.rows.length, this.rows.length + realRows.length]);
        for (let i in realRows) {
            const newRow = new Row(realRows[i], this, true, this.tableObject);
            this.rows.push(newRow);
        }
    }

    // shows all the rows in this playlist (except branches bodies)
    showRows() {
        for (let i in this.rows) {
            const row = this.rows[i];
            if (!row.isBranchBody) {
                this.rows[i].showRow();
            }
        }
    }

    // hides all the rows in this playlist
    hideRows() {
        this.reset();
        for (let i in this.rows) {
            this.rows[i].hideRow();
        }
    }

    // return true: plays next row
    // returns false: last row in playlist
    playNext() {
        let newIndex = this.index + 1;
        // find next valid row to play
        while (newIndex < this.rows.length && this.rows[newIndex].isActive == false) {
            newIndex++;
        }
        // cant play next
        if (newIndex == this.rows.length) {
            return false;
        }
        // can play next
        this.playRow(newIndex);
        return true;
    }

    // return true: plays previous row
    // returns false: first row in playlist
    playPrev() {
        let newIndex = this.index - 1;
        // find next valid row to play
        while (newIndex > -1 && this.rows[newIndex].isActive == false) {
            newIndex--;
        }
        // cant play previous
        if (newIndex == -1) {
            return false;
        }
        // can play previous
        this.playRow(newIndex);
        return true;
    }

    // plays rowIndex row (specific row) and hides previous one
    playRow(rowIndex) {
        this.rows[this.index].reset();
        this.index = rowIndex;
        this.rows[this.index].play();
    }

    // plays current row
    play() {
        this.rows[this.index].play();
    }

    // pauses current row
    pause() {
        this.rows[this.index].pause();
    }

    // reset the playlist
    reset() {
        for (let i in this.rows) {
            this.rows[i].reset();
        }
        this.index = 0;
    }

    // show the add buttons
    showAddButtons() {
        for (let i in this.rows) {
            this.rows[i].showAddButton();
        }
    }

    // show the delete buttons
    showDeleteButtons() {
        for (let i in this.rows) {
            this.rows[i].showDeleteButton();
        }
    }

    // show the edit buttons
    showEditButtons() {
        for (let i in this.rows) {
            this.rows[i].showEditButton();
        }
    }

    // reset buttons to show more buttons
    resetButtons() {
        for (let i in this.rows) {
            this.rows[i].resetButton();
        }
    }
}

export default Playlist;
