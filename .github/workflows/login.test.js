
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const express = require('express');
const session = require('express-session');
const request = require('supertest');
const { MongoClient } = require('mongodb');

jest.mock('mongodb');

let app;

beforeEach(() => {
    app = express();

    app.use(session({
        secret: "superSecretPassword",
        resave: false,
        saveUninitialized: true,
    }));

    app.post('/login', async (req, res) => {
        const guess = req.query.Password;
        if (!guess) {
            res.json({ isLoggedIn: req.session.loggedIn });
            return;
        }

        const database = client.db('hyperAudioDB');
        const passwords = database.collection("ValidPasswords");

        const query = { Password: guess };
        const guessedRight = await passwords.findOne(query);

        let guessResult = -1;
        if (req.session.loggedIn == true) {
            guessResult = 2;
        } else if (guessedRight) {
            req.session.loggedIn = true;
            guessResult = 0;
        } else {
            guessResult = 1;
        }
        res.json({ guessResult: guessResult });
    });
});

test('logs in the user with correct password', async () => {
    const mockPasswordsCollection = {
        findOne: jest.fn().mockResolvedValue({ Password: 'correct-password' }),
    };

    const mockDb = {
        collection: jest.fn().mockReturnValue(mockPasswordsCollection),
    };

    MongoClient.mockImplementation(() => ({
        db: jest.fn().mockReturnValue(mockDb),
    }));

    const response = await request(app).post('/login').query({ Password: 'correct-password' });

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(0);
});

test('fails login with incorrect password', async () => {
    const mockPasswordsCollection = {
        findOne: jest.fn().mockResolvedValue(null),
    };

    const mockDb = {
        collection: jest.fn().mockReturnValue(mockPasswordsCollection),
    };

    MongoClient.mockImplementation(() => ({
        db: jest.fn().mockReturnValue(mockDb),
    }));

    const response = await request(app).post('/login').query({ Password: 'wrong-password' });

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(1);
});

test('returns already logged in if session is active', async () => {
    const mockSession = {
        loggedIn: true,
    };

    app.use((req, res, next) => {
        req.session = mockSession;
        next();
    });

    const response = await request(app).post('/login').query({ Password: 'correct-password' });

    expect(response.status).toBe(200);
    expect(response.body.guessResult).toBe(2);
});

