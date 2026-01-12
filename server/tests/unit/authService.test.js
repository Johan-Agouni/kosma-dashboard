const jwt = require('jsonwebtoken');
const { generateAccessToken, verifyAccessToken } = require('../../src/services/authService');
const config = require('../../src/config/env');

describe('Auth Service', () => {
    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@test.com',
        role: 'admin',
    };

    describe('generateAccessToken', () => {
        test('generates a valid JWT token', () => {
            const token = generateAccessToken(mockUser);
            expect(typeof token).toBe('string');

            const decoded = jwt.verify(token, config.jwt.secret);
            expect(decoded.id).toBe(mockUser._id);
            expect(decoded.email).toBe(mockUser.email);
            expect(decoded.role).toBe(mockUser.role);
        });
    });

    describe('verifyAccessToken', () => {
        test('verifies a valid token', () => {
            const token = generateAccessToken(mockUser);
            const decoded = verifyAccessToken(token);
            expect(decoded.id).toBe(mockUser._id);
        });

        test('throws on invalid token', () => {
            expect(() => verifyAccessToken('invalid-token')).toThrow();
        });

        test('throws on expired token', () => {
            const token = jwt.sign({ id: 'test' }, config.jwt.secret, { expiresIn: '0s' });
            expect(() => verifyAccessToken(token)).toThrow();
        });
    });
});
