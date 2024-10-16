global.$ = require('jquery');

let audioElement;

beforeEach(() => {
    document.body.innerHTML = '<input type="range" id="volume-slider" value="50">';
    audioElement = {
        volume: 1
    };
});

function volumeSlider(audioElement) {
    const volumeSlider = document.getElementById('volume-slider');
    audioElement.volume = volumeSlider.value / 100;

    volumeSlider.addEventListener('input', function() {
        audioElement.volume = volumeSlider.value / 100;
    });
}

test('sets initial volume based on slider value', () => {
    volumeSlider(audioElement);
    expect(audioElement.volume).toBe(0.5);
});

test('updates volume when slider is moved', () => {
    volumeSlider(audioElement);
    const slider = document.getElementById('volume-slider');
    slider.value = 80;
    slider.dispatchEvent(new Event('input'));
    expect(audioElement.volume).toBe(0.8);
});
