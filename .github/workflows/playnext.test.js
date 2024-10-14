global.$ = require('jquery');
const { playNext } = require('../../public/index'); 
// mock global variables
let currTrack, currPlaylist, playlistRows, getBranch, branchArray;

beforeEach(() => {
  // set initial conditions
  currTrack = 0;
  currPlaylist = 0;
  playlistRows = [
    ['track1', 'track2', 'track3'], 
    ['track4', 'track5'] 
  ];
  
    document.body.innerHTML = `
    <input type="checkbox" id="autoplay" checked />
    <div class="screen_home"></div>
    <div class="screen_data"></div>
  `;

  // mocking functions and arrays
  getBranch = {};
  branchArray = [];

  // mock audioat function
  global.audioAt = jest.fn((playlistIndex, trackIndex) => {
    return {
      currentTime: 0,
      play: jest.fn(),
    };
  });

  global.switchPlaylist = jest.fn();
});


test('plays next track when autoplay is enabled', () => {
  playNext(false);
  
  expect(audioAt).toHaveBeenCalledWith(currPlaylist, 1); k
  expect(audioAt(currPlaylist, 1).play).toHaveBeenCalled(); 
});

// override behavior
test('plays next track regardless of autoplay when override is true', () => {
  playNext(true); 
  
  expect(audioAt).toHaveBeenCalledWith(currPlaylist, 1); 
  expect(audioAt(currPlaylist, 1).play).toHaveBeenCalled(); 
});

// edge case when at the end of a playlist
test('switches to next playlist and plays first track', () => {
  currTrack = 2; 
  currPlaylist = 0; 
  
  playNext(false); 
  
  expect(switchPlaylist).toHaveBeenCalledWith(1); 
  expect(audioAt).toHaveBeenCalledWith(1, 0); 
  expect(audioAt(1, 0).play).toHaveBeenCalled(); 
});





