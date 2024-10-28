require('jest-fetch-mock').enableMocks();
const $ = require('jquery');
global.$ = global.jQuery = $;

const { addHandler, deleteHandler } = require('../../public/index'); 

beforeEach(() => {
    fetch.resetMocks();
    document.body.innerHTML = `
        <div id="playlistContent"></div>
        <button id="addButton"></button>
        <button id="deleteButton"></button>
    `;
});

test('addHandler prompts user to log in if not logged in', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: false }));
    await addHandler('Playlist 1', 1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/login'));
});

test('addHandler adds a row when logged in', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: true }));
    fetch.mockResponseOnce(JSON.stringify({ addResult: true }));
    window.prompt = jest.fn().mockReturnValue('Some Value');

    await addHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/add?'),
        expect.objectContaining({ method: 'POST' })
    );
});

test('deleteHandler prompts user to log in if not logged in', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: false }));
    await deleteHandler('Playlist 1', 1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/login'));
});

test('deleteHandler deletes a row when logged in and confirmed', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: true }));
    fetch.mockResponseOnce(JSON.stringify({ addResult: true }));
    window.confirm = jest.fn().mockReturnValue(true);

    await deleteHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delete?'),
        expect.objectContaining({ method: 'POST' })
    );
});


