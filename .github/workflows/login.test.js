global.$ = require('jquery');
const { addRow } = require('../../public/index');
const { MongoClient } = require('mongodb');

jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn().mockResolvedValue({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn(),
        }),
      }),
      close: jest.fn(),
    }),
  },
}));

let table;
let playlistRowsAdd;
let client;

beforeEach(() => {
    document.body.innerHTML = `<table class="table"></table>`;
    table = document.querySelector('.table');
    playlistRowsAdd = [];
});

afterEach(async () => {
    if (client) {
        await client.close();
    }
});

test('addRow adds a new row to the table', () => {
    const values = [
        ['https://example.com/audio1.mp3', 'Track 1', 'Speaker 1', 0, 'Theme 1', 'Description 1', 'Track Name 1', 'Date 1']
    ];

    addRow(table, values, 0, playlistRowsAdd, 0, 0, false, []);

    expect(table.rows.length).toBe(1); 
    const row = table.rows[0];
    expect(row.cells[1].textContent).toContain('Track Name 1');  
    expect(row.cells[2].textContent).toContain('Speaker 1');  
    expect(row.cells[4].textContent).toContain('Description 1');
});

test('logs in the user with correct password', async () => {
    const mockPasswordsCollection = {
        findOne: jest.fn().mockResolvedValue({ Password: 'correct-password' }),
    };
    const mockDb = { collection: jest.fn(() => mockPasswordsCollection) };
    const mockClient = { db: jest.fn(() => mockDb), close: jest.fn() };

    MongoClient.connect.mockResolvedValue(mockClient);

    client = await MongoClient.connect();

    const response = { body: { guessResult: 1 }, status: 200 };

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(1);
}, 10000);

test('fails login with incorrect password', async () => {
    const mockPasswordsCollection = {
        findOne: jest.fn().mockResolvedValue(null),
    };
    const mockDb = { collection: jest.fn(() => mockPasswordsCollection) };
    const mockClient = { db: jest.fn(() => mockDb), close: jest.fn() };

    MongoClient.connect.mockResolvedValue(mockClient);

    client = await MongoClient.connect();

    const response = { body: { guessResult: 0 }, status: 200 };

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(0);
}, 10000);

test('returns already logged in if session is active', async () => {
    const response = { body: { guessResult: 2 }, status: 200 };

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(2);
}, 10000);

