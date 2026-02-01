const authorize = require('../../src/middleware/rbac');

describe('RBAC Middleware', () => {
    const mockRes = {};
    let nextFn;

    beforeEach(() => {
        nextFn = jest.fn();
    });

    test('allows user with correct role', () => {
        const req = { user: { role: 'admin' } };
        authorize('admin', 'manager')(req, mockRes, nextFn);
        expect(nextFn).toHaveBeenCalledWith();
    });

    test('allows multiple roles', () => {
        const req = { user: { role: 'manager' } };
        authorize('admin', 'manager')(req, mockRes, nextFn);
        expect(nextFn).toHaveBeenCalledWith();
    });

    test('denies user without correct role', () => {
        const req = { user: { role: 'viewer' } };
        authorize('admin', 'manager')(req, mockRes, nextFn);
        expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    test('denies when no user', () => {
        const req = {};
        authorize('admin')(req, mockRes, nextFn);
        expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
});
