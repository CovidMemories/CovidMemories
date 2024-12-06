import { populatePlayListContentTable, play, pause } from '../../public/index.js';
import Table from '../../public/Table.js';

// Mock Table module first
jest.mock('../../public/Table.js');

// Before importing index.js, we mock the DOM elements
beforeAll(() => {
  // Mock the DOM structure
  document.body.innerHTML = `
    <form id="loginForm">
      <input type="text" name="login-email" />
      <input type="password" name="login-password" />
    </form>
    <div id="playlistTable"></div>
    <div class="dropdown-menu"></div>
    <div id="playlistContent"></div>
    <button id="wallpaper-w1"></button>
  `;

  // Mock the addEventListener on loginForm to prevent it from throwing an error
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener = jest.fn();

  // Mocking Table behavior as needed
  const mockTableInstance = {
    play: jest.fn(),
    pause: jest.fn(),
    playNext: jest.fn(),
    playPrev: jest.fn(),
    randomTrack: jest.fn(),
  };

  Table.mockImplementation(() => mockTableInstance);
});

describe('index.js functionality', () => {
  let mockTableInstance;

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  test('populatePlayListContentTable initializes Table and sets button handlers', () => {
    populatePlayListContentTable(0);

    // Verify Table was called
    expect(Table).toHaveBeenCalledWith(0);

    // Simulate button clicks
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
