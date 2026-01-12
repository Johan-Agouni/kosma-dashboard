require('../setup');
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('Auth Routes', () => {
    const validUser = {
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
    };

    describe('POST /api/v1/auth/register', () => {
        test('registers a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser)
                .expect(201);

            expect(res.body.data.user.email).toBe(validUser.email);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        test('fails with duplicate email', async () => {
            await User.create(validUser);
            await request(app)
                .post('/api/v1/auth/register')
                .send(validUser)
                .expect(409);
        });

        test('fails with invalid data', async () => {
            await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'bad' })
                .expect(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await User.create(validUser);
        });

        test('logs in with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: validUser.email, password: validUser.password })
                .expect(200);

            expect(res.body.data.user.email).toBe(validUser.email);
            expect(res.body.data.accessToken).toBeDefined();
        });

        test('fails with wrong password', async () => {
            await request(app)
                .post('/api/v1/auth/login')
                .send({ email: validUser.email, password: 'WrongPass1' })
                .expect(401);
        });

        test('fails with non-existent email', async () => {
            await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'ghost@test.com', password: 'Password1' })
                .expect(401);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        test('returns user profile with valid token', async () => {
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            const token = registerRes.body.data.accessToken;

            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.data.email).toBe(validUser.email);
        });

        test('fails without token', async () => {
            await request(app).get('/api/v1/auth/me').expect(401);
        });

        test('fails with invalid token', async () => {
            await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        test('refreshes tokens', async () => {
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            const refreshToken = registerRes.body.data.refreshToken;

            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        test('fails with invalid refresh token', async () => {
            await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: 'invalid' })
                .expect(401);
        });
    });
});
