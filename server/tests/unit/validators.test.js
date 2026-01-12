const { validationResult } = require('express-validator');
const { registerValidation, loginValidation } = require('../../src/validators/authValidators');

const runValidation = async (validations, body) => {
    const req = { body, query: {}, params: {} };
    for (const validation of validations) {
        await validation.run(req);
    }
    return validationResult(req);
};

describe('Auth Validators', () => {
    describe('registerValidation', () => {
        test('passes with valid data', async () => {
            const result = await runValidation(registerValidation, {
                email: 'test@example.com',
                password: 'Password1',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(result.isEmpty()).toBe(true);
        });

        test('fails with invalid email', async () => {
            const result = await runValidation(registerValidation, {
                email: 'not-an-email',
                password: 'Password1',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(result.isEmpty()).toBe(false);
        });

        test('fails with short password', async () => {
            const result = await runValidation(registerValidation, {
                email: 'test@example.com',
                password: 'short',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(result.isEmpty()).toBe(false);
        });

        test('fails with missing firstName', async () => {
            const result = await runValidation(registerValidation, {
                email: 'test@example.com',
                password: 'Password1',
                firstName: '',
                lastName: 'Doe',
            });
            expect(result.isEmpty()).toBe(false);
        });

        test('fails with password without uppercase', async () => {
            const result = await runValidation(registerValidation, {
                email: 'test@example.com',
                password: 'password1',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(result.isEmpty()).toBe(false);
        });
    });

    describe('loginValidation', () => {
        test('passes with valid data', async () => {
            const result = await runValidation(loginValidation, {
                email: 'test@example.com',
                password: 'anypassword',
            });
            expect(result.isEmpty()).toBe(true);
        });

        test('fails with empty password', async () => {
            const result = await runValidation(loginValidation, {
                email: 'test@example.com',
                password: '',
            });
            expect(result.isEmpty()).toBe(false);
        });
    });
});
