import Table from '../../public/Table.js';
import Playlist from '../../public/Playlist.js';

jest.mock('../../public/Playlist.js'); 

describe('Table class', () => {
  let table;

  beforeEach(() => {
    // mock the DOM elements u
    document.body.innerHTML = `
      <div class="dropdown-menu"></div>
      <div id="loader"></div>
      <table id="playlistTable"></table>
      <div id="playlistContent"></div>
      <button id="play"></button>
      <button id="pause"></button>
    `;

    // mock Playlist for Table functionality
    Playlist.mockImplementation((name, rows, tableObject) => ({
      name,
      rows: rows || [
        { isBranchStart: false, isBranchBody: false, playRow: jest.fn() },
        { isBranchStart: true, isBranchBody: false, playRow: jest.fn() },
        { isBranchStart: false, isBranchBody: true, playRow: jest.fn() },
      ],
      showRows: jest.fn(),
      hideRows: jest.fn(),
      playNext: jest.fn(() => false),
      playPrev: jest.fn(() => false),
      play: jest.fn(),
      pause: jest.fn(),
      loadBranches: jest.fn(),
      playRow: jest.fn(),
    }));
  });


  test('Table initializes correctly with playlists', async () => {
    // Mock fetch response for playlist data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ playlists: { Playlist1: [], Playlist2: [] } }),
      })
    );

    table = new Table(0);
    await new Promise(process.nextTick);

    // verify DOM changes
    expect(document.querySelector('.dropdown-menu').childNodes.length).toBe(2);
    expect(document.getElementById('playlistContent').innerHTML).toBe('Playlist1');
    expect(Playlist).toHaveBeenCalledTimes(2);
    expect(Playlist).toHaveBeenCalledWith('Playlist1', [], table);
    expect(Playlist.mock.results[0].value.loadBranches).toHaveBeenCalled();
  });

  test('Table switches playlists correctly', async () => {
    // mock fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ playlists: { Playlist1: [], Playlist2: [] } }),
      })
    );

    table = new Table(0);
    // wait
    await new Promise(process.nextTick);
    const firstPlaylist = table.playlists[0];
    const secondPlaylist = table.playlists[1];
    firstPlaylist.hideRows.mockClear();
    secondPlaylist.showRows.mockClear();

    table.switchPlaylist(1);

    expect(firstPlaylist.hideRows).toHaveBeenCalled();
    expect(secondPlaylist.showRows).toHaveBeenCalled();
    expect(document.getElementById('playlistContent').innerHTML).toBe('Playlist2');
  });

  test('Table plays next track correctly and switches playlist if necessary', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ playlists: { Playlist1: [], Playlist2: [] } }),
      })
    );

    table = new Table(0);
    await new Promise(process.nextTick);

    const firstPlaylist = table.playlists[0];
    const secondPlaylist = table.playlists[1];

    firstPlaylist.playNext.mockReturnValue(false);
    table.playNext();

    expect(firstPlaylist.pause).toHaveBeenCalled();
    expect(secondPlaylist.showRows).toHaveBeenCalled();
    expect(secondPlaylist.play).toHaveBeenCalled();
    expect(document.getElementById('playlistContent').innerHTML).toBe('Playlist2');
  });

  test('Table plays previous track correctly and switches playlist if necessary', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ playlists: { Playlist1: [], Playlist2: [] } }),
      })
    );

    table = new Table(1);
    await new Promise(process.nextTick);

    const firstPlaylist = table.playlists[0];
    const secondPlaylist = table.playlists[1];

    secondPlaylist.playPrev.mockReturnValue(false);
    table.playPrev();

    expect(secondPlaylist.pause).toHaveBeenCalled();
    expect(firstPlaylist.showRows).toHaveBeenCalled();
    expect(firstPlaylist.play).toHaveBeenCalled();
    expect(document.getElementById('playlistContent').innerHTML).toBe('Playlist1');
  });



});
