const { updateTitleAndArtist } = require('../../public/index');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="title"></div>
        <div id="artist"></div>
    `;
});

test('updates the title and artist in the DOM', () => {
    updateTitleAndArtist('Track Title', 'Speaker Name');

    expect(document.getElementById('title').textContent).toBe('Track Title');
    expect(document.getElementById('artist').textContent).toBe('Speaker Name');
});
