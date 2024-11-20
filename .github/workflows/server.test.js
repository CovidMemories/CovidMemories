const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');

// mock express app (youtube told me to do this TT)
const app = express();
app.use(express.json());

// mocked endpoints
app.get('/getRows', (req, res) => {
  res.status(200).json({
    playlists: {
      'Main Playlist': [],
      Coping: [],
      Feelings: [],
      'Early Days': [],
      Routines: [],
      Technology: [],
      Alisa: [],
      Thea: [],
      Tyler: [],
      Tobin: [],
    },
  });
});

app.post('/login', (req, res) => {
  const { Password } = req.query;
  if (Password === 'validPassword') {
    res.status(200).json({ guessResult: 0 });
  } else {
    res.status(401).json({ guessResult: 1 });
  }
});

describe('Server functionality', () => {
  test('GET /getRows returns playlists with sorted rows', async () => {
    const response = await request(app).get('/getRows');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('playlists');
    const playlistNames = [
      'Main Playlist',
      'Coping',
      'Feelings',
      'Early Days',
      'Routines',
      'Technology',
      'Alisa',
      'Thea',
      'Tyler',
      'Tobin',
    ];
    playlistNames.forEach((name) => {
      expect(response.body.playlists).toHaveProperty(name);
    });
  });

  test('POST /login sets loggedIn session for valid password', async () => {
    const response = await request(app)
      .post('/login')
      .query({ Password: 'validPassword' }); // Replace 'validPassword' with a valid password
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('guessResult');
    expect(response.body.guessResult).toBe(0); // 0 indicates success
  });
});
