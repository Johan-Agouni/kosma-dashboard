const ApiError = require('../../src/utils/ApiError');

describe('ApiError', () => {
    test('creates error with statusCode and message', () => {
        const error = new ApiError(400, 'Bad Request');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Bad Request');
        expect(error.isOperational).toBe(true);
        expect(error).toBeInstanceOf(Error);
    });

    test('creates error with validation errors', () => {
        const errors = [{ field: 'email', message: 'Email invalide' }];
        const error = new ApiError(400, 'Validation failed', errors);
        expect(error.errors).toEqual(errors);
    });

    test('badRequest creates 400 error', () => {
        const error = ApiError.badRequest('Invalid data');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid data');
    });

    test('unauthorized creates 401 error', () => {
        const error = ApiError.unauthorized();
        expect(error.statusCode).toBe(401);
    });

    test('forbidden creates 403 error', () => {
        const error = ApiError.forbidden();
        expect(error.statusCode).toBe(403);
    });

    test('notFound creates 404 error', () => {
        const error = ApiError.notFound('Not found');
        expect(error.statusCode).toBe(404);
    });

    test('conflict creates 409 error', () => {
        const error = ApiError.conflict('Conflict');
        expect(error.statusCode).toBe(409);
    });

    test('tooMany creates 429 error', () => {
        const error = ApiError.tooMany();
        expect(error.statusCode).toBe(429);
    });

    test('internal creates 500 error', () => {
        const error = ApiError.internal();
        expect(error.statusCode).toBe(500);
    });
});
