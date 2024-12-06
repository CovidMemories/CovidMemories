import Playlist from '../../public/Playlist.js';
import Swal from 'sweetalert2';

// mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true, value: 'Mock Value' }),
}));

describe('Playlist class', () => {
  let mockTable;
  let mockRow;
  let mockTableObject;

  beforeEach(() => {
    // mock the DOM used in Table and Playlist
    document.body.innerHTML = `
      <div class="dropdown-menu"></div>
      <div id="loader"></div>
      <table id="playlistTable"></table>
      <div id="playlistContent"></div>
      <button id="play"></button>
      <button id="pause"></button>
    `;

    // Mock login form
    document.body.innerHTML += `
      <form id="loginForm">
        <input type="text" name="login-email" />
        <input type="password" name="login-password" />
      </form>
    `;

    mockRow = {
      style: { display: '' },
      insertCell: jest.fn().mockReturnValue({
        appendChild: jest.fn(),
        childNodes: [],
      }),
      addEventListener: jest.fn()
    };

    mockTable = {
      insertRow: jest.fn().mockReturnValue(mockRow),
    };

    mockTableObject = {
      realRows: jest.fn().mockReturnValue([]),
      updateTitleAndArtist: jest.fn(),
      volumeSlider: jest.fn(),
      audioSlider: jest.fn(),
    };

    // Mock document.getElementById
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'playlistTable') return mockTable;
      if (id === 'loader') return { style: { display: '' } };
      if (id === 'playlistContent') return { innerHTML: '' };
      return null;
    });

    // mock play and pause methods
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Playlist initializes correctly', () => {
    const rows = [
      ["url1", "fileName1", "speaker1", 1, "theme1", "description1", "trackName1", "2024-11-18"],
      ["url2", "fileName2", "speaker2", 2, "theme2", "description2", "trackName2", "2024-11-19"],
    ];
    const playlist = new Playlist('Test Playlist', rows, mockTableObject);
    expect(playlist.name).toBe('Test Playlist');
    expect(playlist.rows.length).toBe(rows.length);
    expect(mockTable.insertRow).toHaveBeenCalledTimes(rows.length);
  });

  test('Playlist plays and pauses tracks correctly', () => {
    const rows = [
      ["url1", "fileName1", "speaker1", 1, "theme1", "description1", "trackName1", "2024-11-18"],
      ["url2", "fileName2", "speaker2", 2, "theme2", "description2", "trackName2", "2024-11-19"],
    ];
    const playlist = new Playlist('Test Playlist', rows, mockTableObject);
    playlist.playRow(0);
    expect(playlist.index).toBe(0);
    playlist.pause();
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
