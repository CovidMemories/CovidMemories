global.$ = require('jquery');
const { addRow } = require('../../public/index');

let table;
let playlistRowsAdd;

beforeEach(() => {
    document.body.innerHTML = `<table class="table"></table>`;
    table = document.querySelector('.table');
    playlistRowsAdd = [];
});

test('addRow adds a new row to the table', () => {
    const values = [
        ['https://example.com/audio1.mp3', 'Track 1', 'Speaker 1', 0, 'Theme 1', 'Description 1', 'Track Name 1', 'Date 1']
    ];

    addRow(table, values, 0, playlistRowsAdd, 0, 0, false, []);

    expect(table.rows.length).toBe(1); 
    const row = table.rows[0];
    expect(row.cells[1].innerHTML).toContain('Track 1');  // Check name
    expect(row.cells[2].innerHTML).toContain('Speaker 1');  // Check speaker
    expect(row.cells[5].innerHTML).toContain('Description');  
});
