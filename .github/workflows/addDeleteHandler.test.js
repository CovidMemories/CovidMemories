require('jest-fetch-mock').enableMocks();
const $ = require('jquery');
global.$ = global.jQuery = $;

const Swal = require('sweetalert2');
jest.mock('sweetalert2');
global.Swal = Swal;  

const { addHandler, deleteHandler } = require('../../public/index'); 

beforeEach(() => {
    fetch.resetMocks();
    Swal.fire.mockReset();
    document.body.innerHTML = `
        <div id="playlistContent"></div>
        <button id="addButton"></button>
        <button id="deleteButton"></button>
    `;
});

test('addHandler adds a row when confirmed', async () => {
    fetch.mockResponseOnce(JSON.stringify({ addResult: true }));

    Swal.fire
        .mockResolvedValueOnce({ value: 'Below' }) 
        .mockResolvedValueOnce({ value: ['https://example.com', 'FileName', 'Speaker', 'Description', 'TrackName', '2021-01-01', 'Theme'] }); 

    await addHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/add?'),
        expect.objectContaining({ method: 'POST' })
    );
    expect(Swal.fire).toHaveBeenCalledWith({ title: "Successful addition! Refreshing..." });
});

test('deleteHandler deletes a row when confirmed', async () => {
    fetch.mockResponseOnce(JSON.stringify({ addResult: true }));

    Swal.fire.mockResolvedValueOnce({ value: true }); 

    await deleteHandler('Playlist 1', 1);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delete?'),
        expect.objectContaining({ method: 'POST' })
    );
    expect(Swal.fire).toHaveBeenCalledWith({ title: "Successful deletion! Refreshing..." });
});


