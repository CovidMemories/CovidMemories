import { populatePlayListContentTable, play, pause } from '../../public/index.js';
import Table from '../../public/Table.js';

jest.mock('../../public/Table.js');

describe('index.js functionality', () => {
  let mockTableInstance;

  beforeEach(() => {
    // mock DOM structure
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
      </div>
    `;

    // mock Table
    mockTableInstance = {
      play: jest.fn(),
      pause: jest.fn(),
      playNext: jest.fn(),
      playPrev: jest.fn(),
      randomTrack: jest.fn(),
    };

    Table.mockImplementation(() => mockTableInstance);
    jest.clearAllMocks();
  });

  test('populatePlayListContentTable initializes Table and sets button handlers', () => {
    populatePlayListContentTable(0);

    // verify Table
    expect(Table).toHaveBeenCalledWith(0);

    // sim buttons and verify methods
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
