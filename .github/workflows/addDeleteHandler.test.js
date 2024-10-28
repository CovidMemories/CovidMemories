require('jest-fetch-mock').enableMocks();
const Swal = require('sweetalert2');
jest.mock('sweetalert2');
const { addHandler, deleteHandler } = require('../../public/index'); y

beforeEach(() => {
    fetch.resetMocks();
    document.body.innerHTML = `
        <div id="playlistContent"></div>
        <button id="addButton"></button>
        <button id="deleteButton"></button>
    `;
});

test('addHandler tells user to log in if not logged in', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: false }));

    await addHandler('Playlist 1', 1);

    expect(Swal.fire).toHaveBeenCalledWith({ title: "You need to be logged in to add rows" });
});

test('addHandler adds a row when logged in and confirmed', async () => {
    fetch
        .mockResponseOnce(JSON.stringify({ isLoggedIn: true }))
        .mockResponseOnce(JSON.stringify({ addResult: true }));

    Swal.fire.mockResolvedValueOnce({ value: 'Below' });
    Swal.fire.mockResolvedValueOnce({
        value: ['https://example.com', 'FileName', 'Speaker', 'Description', 'TrackName', '2021-01-01', 'Theme'],
    });

    await addHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/add?'),
        expect.objectContaining({ method: 'POST' })
    );
    expect(Swal.fire).toHaveBeenCalledWith({ title: "Successful addition! Refreshing..." });
});

test('deleteHandler prompts user to log in if not logged in', async () => {
    fetch.mockResponseOnce(JSON.stringify({ isLoggedIn: false }));

    await deleteHandler('Playlist 1', 1);

    expect(Swal.fire).toHaveBeenCalledWith({ title: "You need to be logged in to delete rows" });
});

test('deleteHandler deletes a row when logged in and confirmed', async () => {
    fetch
        .mockResponseOnce(JSON.stringify({ isLoggedIn: true }))
        .mockResponseOnce(JSON.stringify({ addResult: true }));

    Swal.fire.mockResolvedValueOnce({ value: true });

    await deleteHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delete?'),
        expect.objectContaining({ method: 'POST' })
    );
    expect(Swal.fire).toHaveBeenCalledWith({ title: "Successful deletion! Refreshing..." });
});
