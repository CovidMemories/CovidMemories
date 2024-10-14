global.$ = require('jquery');

let currTrack, currPlaylist, playlistRows, getBranch, branchArray;

beforeEach(() => {
  currTrack = 0;
  currPlaylist = 0;
  playlistRows = [['track1', 'track2', 'track3'], ['track4', 'track5']];
  
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






