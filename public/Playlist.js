import Row from "./Row.js"

class Playlist {
    name;
    currentRow;
    rows; // rows is list of Row objects in the playlist

    constructor(name, rows){
        this.name = name;
        this.rows = [];
        for (let i in rows) {
            const newRow = Row(i);
            rows.push(newRow);
        }
    }
}

export default Playlist;