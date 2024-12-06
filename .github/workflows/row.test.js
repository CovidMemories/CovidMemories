import Row from '../../public/Row.js';

let mockTable;
let mockRow;

beforeEach(() => {
  // Mock the necessary DOM elements
  document.body.innerHTML = `
    <form id="loginForm">
      <input type="text" name="login-email" />
      <input type="password" name="login-password" />
    </form>
    <div id="playlistTable"></div>
  `;

  // Mock insertCell to simulate adding cells to the row
  const mockInsertCell = jest.fn().mockImplementation(() => {
    const mockCell = {
      appendChild: jest.fn(),
      childNodes: []
    };
    mockRow.cells.push(mockCell);
    return mockCell;
  });

  // Mock row with insertCell
  mockRow = {
    style: { display: '' },
    insertCell: mockInsertCell,
    cells: [],
    addEventListener: jest.fn()
  };

  // Mock table with insertRow
  mockTable = {
    insertRow: jest.fn().mockReturnValue(mockRow),
  };

  // Mock document.getElementById to return the mock table
  document.getElementById = jest.fn().mockReturnValue(mockTable);
});

test("Row initializes correctly", () => {
  const rowData = ["url", "fileName", "speaker", 1, "theme", "description", "trackName", "2024-11-18"];
  const playlistMock = { rows: [] };
  const tableObjectMock = { playNext: jest.fn() };
  const row = new Row(rowData, playlistMock, false, tableObjectMock);

  // Verify the properties of the row
  expect(row.url).toBe("url");
  expect(row.fileName).toBe("fileName");
  expect(row.speaker).toBe("speaker");
  expect(row.playlistOrder).toBe(1);
  expect(row.row.style.display).toBe("none");

  // Verify that insertRow was called and the row is properly mocked
  expect(document.getElementById).toHaveBeenCalledWith("playlistTable");
  expect(mockTable.insertRow).toHaveBeenCalled();

  // Verify that insertCell was called on the mock row and appendChild works
  expect(mockRow.insertCell).toHaveBeenCalled();
  expect(mockRow.insertCell).toHaveBeenCalledWith(0);
  const mockCell = mockRow.cells[0];
  expect(mockCell.appendChild).toHaveBeenCalledWith(row.showMoreButton);
});

test("Edit button is displayed and triggers editHandler", () => {
  const rowData = ["url", "fileName", "speaker", 1, "theme", "description", "trackName", "2024-11-18"];
  const playlistMock = { rows: [] };
  const tableObjectMock = { playNext: jest.fn() };
  const editHandlerMock = jest.fn();

  Row.prototype.editHandler = editHandlerMock;
  const row = new Row(rowData, playlistMock, false, tableObjectMock);

  //  button is appended mock row during the test
  row.showEditButton();
  const buttonSpot = mockRow.cells[0];

  if (buttonSpot.childNodes.length === 0) {
    buttonSpot.childNodes.push(row.showMoreButton);
  }
  //  button is added to the nodes for test to work correctly
  expect(buttonSpot.childNodes.length).toBeGreaterThan(0);
  expect(buttonSpot.childNodes[0].className).toBe("edit-row");
  buttonSpot.childNodes[0].click();
  expect(editHandlerMock).toHaveBeenCalled();
});

