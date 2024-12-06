import { populatePlayListContentTable, play, pause } from '../../public/index.js';
import Table from '../../public/Table.js';

jest.mock('../../public/Table.js');

describe('index.js functionality', () => {
  let mockTableInstance;

  beforeEach(() => {
    // Mock DOM structure
    document.body.innerHTML = `
      <div>
        <button id="rew"></button>
        <button id="play"></button>
        <button id="pause"></button>
        <button id="fwd"></button>
        <button id="randomButton"></button>
        <button id="loginButton"></button>
        <button id="modifyButton"></button>
        <div id="playlistTable"></div>
        <div class="dropdown-menu"></div>
        <div id="playlistContent"></div>
        <button id="wallpaper-w1"></button> <!-- Add wallpaper-w1 -->
        <button id="wallpaper-w2"></button> <!-- Add wallpaper-w2 -->
        <button id="wallpaper-w3"></button> <!-- Add wallpaper-w3 -->
        <button id="wallpaper-w4"></button> <!-- Add wallpaper-w4 -->
        <button id="wallpaper-w5"></button> <!-- Add wallpaper-w5 -->
      </div>
    `;

    // Mock Table
    mockTableInstance = {
      play: jest.fn(),
      pause: jest.fn(),
      playNext: jest.fn(),
      playPrev: jest.fn(),
      randomTrack: jest.fn(),
    };

    Table.mockImplementation(() => mockTableInstance);

    // Mock loginForm and addEventListener for it
    const loginForm = document.createElement('form');
    loginForm.id = 'loginForm';
    document.body.appendChild(loginForm);

    // Mock the addEventListener method
    loginForm.addEventListener = jest.fn();  // Mock addEventListener to avoid errors
  });

  test('populatePlayListContentTable initializes Table and sets button handlers', () => {
    populatePlayListContentTable(0);

    // Verify Table
    expect(Table).toHaveBeenCalledWith(0);

    // Simulate button clicks and verify methods
    document.getElementById('rew').click();
    expect(mockTableInstance.playPrev).toHaveBeenCalled();
    document.getElementById('play').click();
    expect(mockTableInstance.play).toHaveBeenCalled();
    document.getElementById('pause').click();
    expect(mockTableInstance.pause).toHaveBeenCalled();
    document.getElementById('fwd').click();
    expect(mockTableInstance.playNext).toHaveBeenCalled();
    document.getElementById('randomButton').click();
    expect(mockTableInstance.randomTrack).toHaveBeenCalled();
  });

  test('play and pause functions call corresponding Table methods', () => {
    populatePlayListContentTable(0);
    play();
    expect(mockTableInstance.play).toHaveBeenCalled();
    pause();
    expect(mockTableInstance.pause).toHaveBeenCalled();
  });
});

