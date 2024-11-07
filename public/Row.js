class Row{
    url;
    fileName;
    speaker;
    playlistOrder;
    theme;
    description;
    trackName;
    date;

    row; // js element representing row
    audioElement;

    // create a row and add it to table
    constructor(row, table){
        this.url = row[0];
        this.fileName = row[1];
        this.speaker = row[2];
        this.playlistOrder = row[3];
        this.theme = row[4];
        this.description = row[5];
        this.trackName = row[6];
        this.date = row[7];
        
        // add row to table
        this.row = table.insertRow();
        const nameSpot = row.insertCell(0);

        var speakerSpot = row.insertCell(1);
        var playlistOrderSpot = row.insertCell(2);
        var themeSpot = row.insertCell(3);
        var descriptionSpot = row.insertCell(4);
        var playButtonCell = row.insertCell(5);
    }
}

export default Row;
