const AUDIO_COL = 5;
// each index is a theme, each theme holds rows for that theme
var playlistRows = [];

// each index is a theme, theme[i] = :
// [rowIndex, plusButton, showMoreButton]
var buttonSwaps = []; // allows us to swap out buttons accordingly
var currPlaylist = 0;
var currTrack = 0;
// true = don't hide the pause button (workaround for pause button being weird)
var dontHidePause = false;
var table;
var dropdownMenu;
var addButtonPressed = false;

// put each of the names into an array
var names = [];
// maps theme name -> value calculated in rowCount(themeName)
var rowCountCache = {};

// branch object
// <Branchname>.start gives value of start
function Branch(start, end){
  this.start = start;
  this.end = end;
  this.isBranched = false;
}
// stores ith branch object
var branchArray = [];
// maps "i,j" -> index of branch (if i,j is the start or end of a branch)
var getBranch = {};
// each branch will have a unique ID
var branchNum = 0;

//  show loader when the page loads
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("loader").style.display = "block";
});

function volumeSlider(audioElement) {
  var volumeSlider = document.getElementById('volume-slider');

  // Set initial volume level
  audioElement.volume = volumeSlider.value / 100;

  // Update volume level when slider is moved
  volumeSlider.addEventListener('input', function() {
      audioElement.volume = volumeSlider.value / 100;
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const interBubble = document.querySelector('.interactive');
  let curX = 0;
  let curY = 0;
  let tgX = 0;
  let tgY = 0;

  const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      requestAnimationFrame(move);
  };

  window.addEventListener('mousemove', (event) => {
      tgX = event.clientX;
      tgY = event.clientY;
  });

  move();
});

function showPopup(url, name, track, date) {
  Swal.fire({
      title: track,
      html: `Date: ${date} <br> Filename: ${name} <br> URL: <a href="${url}" target="_blank">download</a>`,
      showCloseButton: true,
  });
}

// creates seek and volume slider for audio player 
function audioSlider(audioElement) {
    var seekbar = document.getElementById('slider');

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
    seekbar.oninput = function() {
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

function openAudioUrl() {
  // get URL from audio element
  var audioElement = audioAt(currPlaylist, currTrack);
  var audioUrl = audioElement.src;

  // open url on click
  window.open(audioUrl, '_blank');
}

// add title and speaker to audio player
function updateTitleAndArtist(title, artist) {
  document.getElementById('title').textContent = title;
  document.getElementById('artist').textContent = artist;
  const titleElement = document.getElementById('title');
  const artistElement = document.getElementById('artist');

  if (titleElement && artistElement) {
    titleElement.textContent = title;
    artistElement.textContent = artist;
  } else {
    console.error('Title or artist element not found');
  }
}

// checks autioplay box plays first thing in playlistNum
function playAll() {
    // check the checkbox
    const checkStatus = document.getElementById("autoplay");
    checkStatus.checked = true;
    // play first thing
    var audioElement = audioAt(currPlaylist, 0);
    audioElement.currentTime = 0;
    audioElement.play();
}

// called when GUI play button clicked
function playAudioNode() {
    var audioElement = audioAt(currPlaylist, currTrack);
    audioElement.play();
}

// called when GUI pause button clicked
function stopAudio() {
    var audioElement = audioAt(currPlaylist, currTrack);
    audioElement.pause();   
}

// goes to track above this track (doesnt go to previous playlists)
function rewind(){
  if(currTrack > 0){
    let potentialBranchString = stringIt(currPlaylist, currTrack-1);
    // if the row we want to play is the end of a branch
    if(potentialBranchString in getBranch && branchArray[getBranch[potentialBranchString]].end == potentialBranchString){
      let branchIndex = getBranch[potentialBranchString];
      let thisBranch = branchArray[branchIndex];
      // going from second branch to first branch, skip first branch
      if(branchIndex % 2 == 0){
        var audioElement = audioAt(currPlaylist, extractBranchRange(branchIndex)[0]-2);
        audioElement.currentTime = 0;
        audioElement.play();
        return;
      }
      // thisBranch2 is the first branch option
      let branch2Index = branchNeighbor(branchIndex);
      let thisBranch2 = branchArray[branch2Index];

      // this branch is active, play it
      if(thisBranch.isBranched){
        // first audio element of the first branch
        var audioElement = audioAt(currPlaylist, currTrack-1)
        audioElement.currentTime = 0;
        audioElement.play();
      }
      // first branch is active, play it
      else if(thisBranch2.isBranched){
        // this is the first audio element of the second branch
        var audioElement = audioAt(currPlaylist, extractBranchRange(branch2Index)[1]-1);
        audioElement.currentTime = 0;
        audioElement.play();
      }
      // neither branch is selected, skip to before the branches
      else{
        // this is the audio element right after the end of the second branch
        var audioElement = audioAt(currPlaylist, extractBranchRange(branch2Index)[0]-2);
        audioElement.currentTime = 0;
        audioElement.play();
      }
    }
    // beginning of first branch, move past
    else if(potentialBranchString in getBranch &&
    branchArray[getBranch[potentialBranchString]].end != potentialBranchString && 
    getBranch[potentialBranchString] % 2 == 0){
      var audioElement = audioAt(currPlaylist, currTrack - 2);
      audioElement.currentTime = 0;
      audioElement.play();
    }
    else{
      var audioElement = audioAt(currPlaylist, currTrack - 1);
      audioElement.currentTime = 0;
      audioElement.play();
    }
  }
}

// if override: plays next no matter what autoplay is 
function playNext(override) {
  const checkStatus = document.getElementById("autoplay");

  // autoplay yes
  if(checkStatus.checked || override){
    // just play next row
    if(currTrack < playlistRows[currPlaylist].length - 1){
      let potentialBranchString = stringIt(currPlaylist, currTrack+1);
      // if the row we want to play is the beginning of a branch
      if(potentialBranchString in getBranch && branchArray[getBranch[potentialBranchString]].end != potentialBranchString){
        let branchIndex = getBranch[potentialBranchString];
        let thisBranch = branchArray[branchIndex];
        // this means we are going from first branch to second branch,
        // which means we can just skip past second branch
        if(branchIndex % 2 == 1){
          var audioElement = audioAt(currPlaylist, extractBranchRange(branchIndex)[1]);
          audioElement.currentTime = 0;
          audioElement.play();
          return;
        }
        // thisBranch2 is the second branch option
        let branch2Index = branchNeighbor(branchIndex);
        let thisBranch2 = branchArray[branch2Index];
        
        // this branch is active, play it
        if(thisBranch.isBranched){
          // first audio element of the first branch
          var audioElement = audioAt(currPlaylist, currTrack+2)
          audioElement.currentTime = 0;
          audioElement.play();
        }
        // second branch is active, play it
        else if(thisBranch2.isBranched){
          // this is the first audio element of the second branch
          var audioElement = audioAt(currPlaylist, extractBranchRange(branch2Index)[0]);
          audioElement.currentTime = 0;
          audioElement.play();
        }
        // neither branch is selected, skip to after the branches
        else{
          // this is the audio element right after the end of the second branch
          var audioElement = audioAt(currPlaylist, extractBranchRange(branch2Index)[1]);
          audioElement.currentTime = 0;
          audioElement.play();
        }
      }
      // not the beginning of a branch, play like normal
      else{
        var audioElement = audioAt(currPlaylist, currTrack+1)
        audioElement.currentTime = 0;
        audioElement.play();
      }
    }
    // load in next playlist, play first
    else if(currPlaylist < playlistRows.length - 1){
      switchPlaylist(currPlaylist + 1); // calls pause on everything in this playlist
      var audioElement = audioAt(currPlaylist, 0);
      audioElement.currentTime = 0;
      audioElement.play();
    }
  }
}
module.exports = { playNext };

// switches playlist from currPlaylist (global) to playlistNum, doesnt play
function switchPlaylist(playlistNum){
  // set playlist content to display current playlist
  document.getElementById("playlistContent").innerHTML = names[playlistNum];

  // hide current playlist
  for(let i = 0; i < playlistRows[currPlaylist].length; i++){
    playlistRows[currPlaylist][i].style.display = 'none';
  }

  // show selected playlist
  for(let i = 0; i < playlistRows[playlistNum].length; i++){
    playlistRows[playlistNum][i].style.display = 'table-row';
  }

  var audioElement = audioAt(currPlaylist, currTrack);
  audioElement.pause();

  // reset addButton
  if(addButtonPressed){
    toggleAddButtons();
  }

  currPlaylist = playlistNum;
  currTrack = 0;

  // hides branchse of currently selected playlist
  hideBranches();
}

// populate playlist content table
function populatePlayListContentTable(){
  // autoplay on
  const checkStatus = document.getElementById("autoplay");
  checkStatus.checked = true;

  // hide elements while loading until sheets are successfully grabbed
  document.getElementById("playlistContent").style.display = "none";
  document.getElementById("playlistDropdown").style.display = "none";


  getRows().then((sheets) => {

    // after data is grabbed show content
    document.getElementById("loader").style.display = "none";
    document.getElementById("playlistContent").style.display = "block";
    document.getElementById("playlistDropdown").style.display = "block";

    table = document.getElementsByClassName("table")[0];

  // get dropdownMenu so we can add to it
  dropdownMenu = document.getElementsByClassName("dropdown-menu")[0];

  // iterate through each sheet
  for(let j = 0; j < Object.keys(sheets).length; j++){
    let values = sheets[j];
    let sheetName = values[0];

    names.push(sheetName);
    // set playlist content to name of first playlist
    if(j == 0){
      document.getElementById("playlistContent").innerHTML = sheetName;
    }
    // stores all the rows of the current playlist, will be added to playlistRows
    playlistRowsAdd = [];
    // same thing but with our buttonSwaps
    buttonSwapsAdd = [];
    
    // add button with correct playlist name to dropdown menu
    let button = document.createElement("button");
    button.setAttribute("class", "dropdown-item");
    button.setAttribute("type", button);
    button.textContent = sheetName;
    button.addEventListener("click", function() {
      // calls switchPlaylist to switch to j, which is this playlists index in playlistRows
      switchPlaylist(j);
    });
    dropdownMenu.appendChild(button);

    // points to next row we need to add
    let rowPointer = 0;
    for(let i = 2; i < values.length; i++){
      
      //check if normal audio block
       if (values[i][5] != "Branch") {
        // not a branch, add stuff for making '+' appear
        let tempRow = [];
        tempRow.push(rowPointer);
        var playlistOrder = values[i][3];
        let addButton = `<button class="add-row" onclick="addHandler('${sheetName}', ${playlistOrder})"></button>`
        tempRow.push(addButton);
        addRow(table, values, i, playlistRowsAdd, rowPointer, j, false, tempRow);
        rowPointer++;
        buttonSwapsAdd.push(tempRow);
      } 

      // this is a branch block
      else {
        // copy paste
        var url = values[i][0];
        var name = values[i][1];
        var speaker = values[i][2];
        var playlistOrder = values[i][3];
        var theme = values[i][4];
        var description = values[i][5];
        var track = values[i][6];

        // insert new row into the table
        var row = table.insertRow();
        // add a row
        playlistRowsAdd.push(row);
        // set initial playlist to main one
        if(j != 0){
          row.style.display = 'none';
        }
        var nameSpot = row.insertCell(0);
        var speakerSpot = row.insertCell(1);
        var playlistOrderSpot = row.insertCell(2);
        var themeSpot = row.insertCell(3);
        // this is the button that we will play audio from 
        var descriptionSpot = row.insertCell(4);
        var playButtonCell = row.insertCell(5);

        // have it say branching point: <theme1> or <theme2>
        speakerSpot.innerHTML = "BRANCHING POINT: " + url;

        //dropdown css
        var dropdownButton = document.createElement("button");
        dropdownButton.setAttribute("class", "btn btn-secondary dropdown-toggle");
        dropdownButton.setAttribute("type", "button");
        dropdownButton.setAttribute("data-toggle", "dropdown");
        dropdownButton.setAttribute("aria-haspopup", "true");
        dropdownButton.setAttribute("aria-expanded", "false");
        dropdownButton.textContent = "Choose playlist branch";
          
        //dropdown menu
        var dropdownB = document.createElement("div");
        dropdownB.setAttribute("class", "dropdown-menu");

        // dropdown menu item (first theme) (bootstrap)
        let dropdownItem1 = document.createElement("a");
        dropdownItem1.setAttribute("class", "dropdown-item");
        dropdownItem1.textContent = name;
        let numHolder = branchNum;
        dropdownItem1.addEventListener("click", function() {
            revealBranch(numHolder);
        });
        
        // dropdown menu item (second theme) (bootstrap)
        let dropdownItem2 = document.createElement("a");
        dropdownItem2.setAttribute("class", "dropdown-item");
        dropdownItem2.textContent = speaker;
        nameHolder = speaker;
        dropdownItem2.addEventListener("click", function() {
           revealBranch(numHolder+1);
        });

        dropdownB.appendChild(dropdownItem1);
        dropdownB.appendChild(dropdownItem2);

        // add to playButtonCell
        descriptionSpot.appendChild(dropdownButton);
        descriptionSpot.appendChild(dropdownB);
        table.appendChild(row);
        rowPointer++;





        
        let branch1Name = name;
        let branch2Name = speaker;
        let branch1Rows = letsGetThisSheet(branch1Name, sheets);
        // add actual rows beneath the branch
        let branch1Add = rowCount(branch1Name, sheets);
        
        // add branch1 to our branch array
        let branch1Start = String(j) + ',' + String(rowPointer - 1);
        let branch1End = String(j) + ',' + String(rowPointer + branch1Add - 1);
        branchArray.push(new Branch(branch1Start, branch1End));
        // cache both start and end of the branch
        getBranch[branch1Start] = branchNum;
        getBranch[branch1End] = branchNum;
        branchNum++;
        
        for(let ii = 2; ii < branch1Rows.length; ii++){
          // we dont want the branch to contain branches
          if(branch1Rows[ii][4] == "Branch" || branch1Rows[ii][5] == "Branch"){
            continue;
          }
          addRow(table, branch1Rows, ii, playlistRowsAdd, rowPointer, j, true, []);
          rowPointer++;
        }
        


        let branch2Rows = letsGetThisSheet(branch2Name, sheets);
        // add actual rows beneath the branch
        let branch2Add = rowCount(branch2Name, sheets);

        // do the same thing with second branch option
        // add branch1 to our branch array
        let branch2Start = String(j) + ',' + String(rowPointer);
        let branch2End = String(j) + ',' + String(rowPointer + branch2Add - 1);
        branchArray.push(new Branch(branch2Start, branch2End));
        // cache both start and end of the branch
        getBranch[branch2Start] = branchNum;
        getBranch[branch2End] = branchNum;
        branchNum++;

        for(let ii = 2; ii < branch2Rows.length; ii++){
          // we dont want the branch to contain branches
          if(branch2Rows[ii][4] == "Branch" || branch2Rows[ii][5] == "Branch"){
            continue;
          }
          addRow(table, branch2Rows, ii, playlistRowsAdd, rowPointer, j, true, []);
          rowPointer++;
        }
      }
    }
    // add next list of rows
    playlistRows.push(playlistRowsAdd);
    buttonSwaps.push(buttonSwapsAdd);
  }
});
}

  //used for displaying info on the webpage like navigation and forms
  $(document).ready(function($) {  
            s1 = $(document).find('.screen_home').html();
            var e0 = $(document).find('.screen_data'); 

            e0.html(s1);
            $(document).on('click', '.btn_menu', function(event) {
                event.preventDefault();
                var screen_name = $(this).attr('screen_name');

                $(document).find('.screen_name').html(screen_name);

                if (screen_name == "home") {
                    var s1 = $(document).find('.screen_home').html();
                    e0.html(s1);
                } else if (screen_name == "about") {
                    var s1 = $(document).find('.screen_about').html();
                    e0.html(s1);
                } 
            });

            $(document).on('click', '.btn_send_contact', function(event) {
              
              event.preventDefault();
              var e1 = $(this).closest('.screen_data');
              var a1={
                user_link:e1.find('.user_link').val(),
                file_name:e1.find('.file_name').val(),
                speaker_name:e1.find('.speaker_name').val(),
                user_playlist:e1.find('.user_playlist').val(),
                user_theme:e1.find('.user_theme').val(),
                file_description:e1.find('file_description').val(),
                track_name:e1.find('.track_name').val(),
              };

              google.script.run.withSuccessHandler(function(data)
              {      
                if(data.status == "success"){
                }    
              }).AddNewAudio(a1) 
            });

          $(document).on('click', '.btn_send_branch', function(event) {
              
              event.preventDefault();
              var e1 = $(this).closest('.screen_data');
              var a1={
                branch_name:e1.find('.branch_name').val(),
                branchA_name:e1.find('.branchA_name').val(),
                branchB_name:e1.find('.branchB_name').val(),
              };
              console.log(a1);

              google.script.run.withSuccessHandler(function(data)
              {    
                if(data.status == "success"){
                }  
              }).AddNewBranch(a1) 
            });

  });

// returns audio element of ith playlist, jth row
function audioAt(i, j){
  return playlistRows[i][j].cells[AUDIO_COL].querySelector("audio");
}

// returns button element of ith playlist, jth row
function buttonAt(i, j){
  return playlistRows[i][j].cells[0].querySelector("button");
}

// returns number of non branch rows (excludes theme) in themeName's playlist
function rowCount(themeName, sheets){
  // cache the rowCount if this is called multiple times, wont repeat work
  if(themeName in rowCountCache){
    return rowCountCache[themeName];
  }
  let rows = null;
  for(let i = 0; i < Object.keys(sheets).length; i++){
    if(sheets[i][0] === themeName){
      rows = sheets[i];
      break;
    }
  }
  let rowCount = 0;
  for(let i = 2; i < rows.length; i++){
    var description = rows[i][5];
    var theme = rows[i][4];
    if (description == "Branch" || theme == "Branch"){
      continue;
    }
    rowCount++;
  }
  rowCountCache[themeName] = rowCount;
  return rowCount;
}

// returns values array of sheet with themeName given sheets (array of rows arrays)
function letsGetThisSheet(themeName, sheets){
  for(let i = 0; i < Object.keys(sheets).length; i++){
    if(sheets[i][0] === themeName){
      return sheets[i];
    }
  }
}

// hides branchse of currently selected playlist
function hideBranches(){
  for(let i = 0; i < branchArray.length; i++){
    // if this branch belongs to this playlist, then hide it
    if(extractPlaylistNum(branchArray[i]) == currPlaylist){
      hideBranch(i);
    }
  }
}

// returns playlist number fo the given branch object
function extractPlaylistNum(branchObject){
  let arr = branchObject.start.split(',');
  return parseInt(arr[0]);
}

// returns [start row, end row]
function extractBranchRange(branchNumber){
  let branchObject = branchArray[branchNumber];
  // even branches have a start row that is 1 less than actual start
  let firstFudge = 0;
  if (branchNumber % 2 == 0){
    firstFudge = 1;
  }

  let arr1 = branchObject.start.split(',');
  let int1 = parseInt(arr1[1]);
  let arr2 = branchObject.end.split(',');
  let int2 = parseInt(arr2[1]);
  return [int1+firstFudge, int2+1];
}

// reveals a branch
function revealBranch(branchNumber) {
  let thisBranch = branchArray[branchNumber];
  thisBranch.isBranched = true;
  // if other branch is revealed, hide it
  if(branchArray[branchNeighbor(branchNumber)].isBranched){
    hideBranch(branchNeighbor(branchNumber));
  }

  // reveal this branch
  arr = extractBranchRange(branchNumber);
  for(let i = parseInt(arr[0]); i < parseInt(arr[1]); i++){
    playlistRows[currPlaylist][i].style.display = 'table-row';
  }
}

// returns the branch num of the other branch thats paired with this one
function branchNeighbor(branchNumber){
  // even, this is first branch
  if(branchNumber % 2 == 0){
    return branchNumber + 1;
  }
  return branchNumber - 1;
}

// hides the branch with branchnum and sets isBranched to false
function hideBranch(branchNumber){
  let thisBranch = branchArray[branchNumber]
  thisBranch.isBranched = false;
  arr = extractBranchRange(branchNumber);
  let left = parseInt(arr[0]);
  let right = parseInt(arr[1]);
  for(let i = left; i < right; i++){
    playlistRows[currPlaylist][i].style.display = 'none';
  }
}

// returns stringified key which is "playlistNum,trackNum" (used in getBranch)
function stringIt(playlistNum, trackNum){
  return String(playlistNum) + ',' + String(trackNum);
}

// adds 1 row to table 
// isBranch true = hide the row anyways (branches start hidden)
function addRow(table, values, i, playlistRowsAdd, rowPointer, j, isBranch, tempRow){
  // grab column values from values matrix
  var url = values[i][0];
  var name = values[i][1];
  var speaker = values[i][2];
  var theme = values[i][4];
  var description = values[i][5];
  var track = values[i][6];
  var date = values[i][7];

  // insert new row into the table
  var row = table.insertRow();
  // add a row
  playlistRowsAdd.push(row);
  // set initial playlist to main one
  if(j != 0 || isBranch){
    row.style.display = 'none';
  }
  var nameSpot = row.insertCell(0);
  var speakerSpot = row.insertCell(1);
  var playlistOrderSpot = row.insertCell(2);
  var themeSpot = row.insertCell(3);
  var descriptionSpot = row.insertCell(4);
  var playButtonCell = row.insertCell(5);
  let btnShowMore = `<button class="show-more" onclick="showPopup('${url}', '${name}', '${track}', '${date}')"></button>`
  // if this isnt a branch, add button so we can hide it later
  if(!isBranch){
    tempRow.push(btnShowMore)
  }
  // insert actual values into the row
  nameSpot.innerHTML = btnShowMore;
  speakerSpot.innerHTML = '<i>' + '"' + track + '"' + '</i>';
  playlistOrderSpot.innerHTML = speaker;
  themeSpot.innerHTML = theme;
  descriptionSpot.innerHTML = description;
  playButtonCell.innerHTML = '<audio  src="' + url + '" data-title="' + track + '" data-artist="' + speaker + '"></audio>';

  // playButtonCell.innerHTML = '<audio controls src="' + url + '" data-title="' + name + '" data-artist="' + speaker + '"></audio>';
  // add event listener so when playButtonCell ends, check if next row should autoplay
  playButtonCell.querySelector("audio").addEventListener("ended", () => {
    playNext(false);
  });
  let temp = rowPointer;
  // when node gets played, pause all the others
  playButtonCell.querySelector("audio").addEventListener("play", function() {
    // reset the background color of the previous row
    playlistRows[currPlaylist][currTrack].style.backgroundColor = "";
    playlistRows[currPlaylist][currTrack].style.color = "";
    playlistRows[currPlaylist][currTrack].style.border = "";

    if(currPlaylist != j || currTrack != temp){
      var lastAudio = audioAt(currPlaylist, currTrack);
      dontHidePause = true;
      // resets the boolean since .pause() wont call pause function if lastAudio is already paused
      if (!lastAudio.paused){
        lastAudio.pause();
      }
      else{
        dontHidePause = false;
      }
      // we need to make the play button be on play mode
      currPlaylist = j;
      currTrack = temp;
    }

    // highlight the currently playing row
    playlistRows[currPlaylist][currTrack].style.backgroundColor = "";
    playlistRows[currPlaylist][currTrack].style.color = "#248bd0b6";
    playlistRows[currPlaylist][currTrack].style.border = "#248bd0b6";

    var audioElement = audioAt(currPlaylist, currTrack);


    // update sliders
    audioSlider(audioElement);
    volumeSlider(audioElement);

    // update the title and artist display
    var title = this.dataset.title;;
    var artist = this.dataset.artist;
    updateTitleAndArtist(title, artist);


    document.querySelector('.pause').style.display = 'inline-block';
    document.querySelector('.play').style.display = 'none';
  });
  playButtonCell.querySelector("audio").addEventListener("pause", () => {
    if (dontHidePause == true){
      // console.error("dontHidePause on");
      dontHidePause = false;
      return;
    }
    document.querySelector('.pause').style.display = 'none';
    document.querySelector('.play').style.display = 'inline-block';
  });

  table.appendChild(row);
}
module.exports = { addRow };

// resets everything, repopulates table
function reset(){
  // reset addButton
  if(addButtonPressed){
    toggleAddButtons();
  }
  playlistRows = [];
  currPlaylist = 0;
  currTrack = 0;
  // true = don't hide the pause button (workaround for pause button being weird)
  dontHidePause = false;
  table = [];
  dropdownMenu = [];
  // stores ith branch object
  branchArray = [];
  // maps "i,j" -> index of branch (if i,j is the start or end of a branch)
  getBranch = {};
  // each branch will have a unique ID
  branchNum = 0;
  table = document.getElementsByClassName("table")[0];
  table.replaceChildren(); // reset
  dropdownMenu = document.getElementsByClassName("dropdown-menu")[0];
  dropdownMenu.replaceChildren(); // reset
  buttonSwaps = [];
  populatePlayListContentTable();
}

// toggles between showing or hiding "+" buttons
function toggleAddButtons(){
  var addButton = document.getElementById("addButton");
  let swaps = buttonSwaps[currPlaylist];
  // not pressed, show stuff
  if(!addButtonPressed){
    for(let i = 0; i < swaps.length; i++){
      let swap = swaps[i];
      let buttonSpot = buttonAt(currPlaylist, swap[0]);
      buttonSpot.outerHTML = swap[1];
    }
    addButton.style.backgroundColor = 'rgba(77, 77, 77, 0.7)';
  }
  // pressed, unshow stuff
  else{
    for(let i = 0; i < swaps.length; i++){
      let swap = swaps[i];
      let buttonSpot = buttonAt(currPlaylist, swap[0]);
      buttonSpot.outerHTML = swap[2];
    }
    addButton.style.backgroundColor = 'rgba(211, 211, 211, 0.70)';
  }
  // toggle
  addButtonPressed = !addButtonPressed;
}

// user clicks add/plus button on this row
async function addHandler(playlistName, playlistOrder){
  const loggedIn = await isLoggedIn();
  // first loggedIn checkpoint
  if(!loggedIn){
    Swal.fire({
      title: "You need to be logged in to add rows",
    });
    return;
  }
  // ask user if they want to add a row above or below this row
  const inputOptions = {
    "Above": "Above",
    "Below": "Below"
  };
  //
  const { value: aboveOrBelow } = await Swal.fire({
    title: "Add row above or below this one",
    input: "radio",
    inputOptions
  });
  // user exited the popup, they dont want to add a row
  if(!aboveOrBelow){
    return;
  }
  if(aboveOrBelow == "Below"){
    playlistOrder++;
  }

  // prompt user to enter row data
  // build html form to present to user
  htmlString = ``;
  entries = [
    "URL", "FileName", "Speaker", 
    "Description", "TrackName", "Date"
  ];
  for(let i = 0; i < entries.length; i++){
    const entry = entries[i];
    htmlString += `<input id="swal-input${i}" class="swal2-input">`;
    htmlString += `<p>${entry}</p>`;
  }
  const { value: rowValues } = await Swal.fire({
    title: "Fill in row values",
    html: htmlString,
    showCancelButton: true,
    preConfirm: () =>{
      var returner = [];
      for(let i = 0; i < entries.length; i++){
        returner.push(document.getElementById(`swal-input${i}`).value);
      }
      return returner;
    }
  });

  // user cancelled
  if(!rowValues) return;

  // build and send query to actually add a row to the database
  var query = `/add?`;
  for(let i = 0; i < entries.length; i++){
    const entry = entries[i];
    query += `${entry}=${rowValues[i]}&`;
  }
  query += `PlaylistOrder=${playlistOrder}&Theme=${playlistName}`;
  console.log("query: " + query);
  const data = await fetch(query,
    { method: "POST" }
  );
  const dataJSON = await data.json();
  const addResult = await dataJSON.addResult;
  if(!addResult){
    Swal.fire({
      title: "You need to be logged in to add rows",
    });
    return
  }
  Swal.fire({
    title: "Successful addition! Refreshing...",
  });
  // reset makes the added row appear (refreshes db)
  reset();
}

// User attempts to login
// TODO: use <input> so that user's password appears as
// * instead of actual thing
async function login(){
  try{
    const guess = prompt("Enter Secret Password");
    if(!guess){
      alert("Incorrect Password");
      return
    }
    const query = "/login?Password=" + guess;
    // returns true if user guessed correct password
    const data = await fetch(query,
      { method: "POST" }
    );
    const dataJSON = await data.json()
    const guessResult = dataJSON.guessResult;
    // guessed right
    if (guessResult == 0) {
      alert("Welcome User");
    }
    // guessed wrong
    else if (guessResult == 1){
      alert("Incorrect Password");
    }
    // user was already logged in
    else{
      alert("You are already logged in!");
    }
  }
  catch (err){
    console.error("login function error: " + err);
  }
}

async function getRows(){
    try{
        const data = await fetch('/getRows');
        const dataJSON = await data.json();
        return dataJSON;
    }
    catch (err) {
        console.error("getRows error: " + err);
    }
}

// returns whether or not user is logged in
async function isLoggedIn(){
  try{
    const query = "/login"
    const data = await fetch(query,
      { method: "POST" }
    );
    const dataJSON = await data.json()
    return dataJSON.isLoggedIn;
  }
  catch (err){
    console.error("isLoggedIn function error: " + err);
  }
}
