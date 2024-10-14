global.$ = require('jquery');

let currTrack, currPlaylist, playlistRows, getBranch, branchArray;

beforeEach(() => {
  currTrack = 0;
  currPlaylist = 1;
  const playlistRows = [
  [
    ["url1", "FileName1", "Speaker1", 0, "Theme1", "Description1", "TrackName1", "Date1"],
    ["url2", "FileName2", "Speaker2", 1, "Theme1", "Description2", "TrackName2", "Date2"]
  ],
  [
    ["url3", "FileName3", "Speaker3", 0, "Theme2", "Description3", "TrackName3", "Date3"]
  ]
];
  
  document.body.innerHTML = `
    <input type="checkbox" id="autoplay" checked />
    <div class="screen_home"></div>
    <div class="screen_data"></div>
  `;

  getBranch = {};
  branchArray = [];

  global.audioAt = jest.fn((playlistIndex, trackIndex) => ({
    currentTime: 0,
    play: jest.fn(),
  }));

  global.switchPlaylist = jest.fn();
});

const { playNext } = require('../../public/index');

test('plays next track when autoplay is enabled', () => {
  playNext(false);
  expect(audioAt).toHaveBeenCalledWith(currPlaylist, 1);
  expect(audioAt(currPlaylist, 1).play).toHaveBeenCalled(); 
});

test('plays next track regardless of autoplay when override is true', () => {
  playNext(true); 
  expect(audioAt).toHaveBeenCalledWith(currPlaylist, 1); 
  expect(audioAt(currPlaylist, 1).play).toHaveBeenCalled(); 
});

test('switches to next playlist and plays first track', () => {
  currTrack = 2; 
  currPlaylist = 0; 
  playNext(false); 
  expect(switchPlaylist).toHaveBeenCalledWith(1); 
  expect(audioAt).toHaveBeenCalledWith(1, 0); 
  expect(audioAt(1, 0).play).toHaveBeenCalled(); 
});

test('does not fail when at the end of the playlist', () => {
  currTrack = 2; // Last track in the first playlist
  currPlaylist = 0; // First playlist
  playNext(false); // Should switch to next playlist
  expect(switchPlaylist).toHaveBeenCalledWith(1);
  expect(audioAt).toHaveBeenCalledWith(1, 0);
});






