require('../setup');
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Category = require('../../src/models/Category');

describe('Category Routes', () => {
    let adminToken;

    beforeEach(async () => {
        const admin = await User.create({
            email: 'admin@test.com',
            password: 'Password1',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
        });
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@test.com', password: 'Password1' });
        adminToken = loginRes.body.data.accessToken;
    });

    describe('GET /api/v1/categories', () => {
        test('lists all categories', async () => {
            await Category.create([
                { name: 'Electronics' },
                { name: 'Clothing' },
            ]);

            const res = await request(app)
                .get('/api/v1/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('POST /api/v1/categories', () => {
        test('creates a category', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Books', description: 'All books' })
                .expect(201);

            expect(res.body.data.name).toBe('Books');
            expect(res.body.data.slug).toBe('books');
        });

        test('creates child category', async () => {
            const parent = await Category.create({ name: 'Electronics' });

            const res = await request(app)
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Smartphones', parent: parent._id })
                .expect(201);

            expect(res.body.data.parent).toBe(parent._id.toString());
        });
    });

    describe('DELETE /api/v1/categories/:id', () => {
        test('deletes empty category', async () => {
            const category = await Category.create({ name: 'Empty' });

            await request(app)
                .delete(`/api/v1/categories/${category._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });

        test('refuses to delete category with children', async () => {
            const parent = await Category.create({ name: 'Parent' });
            await Category.create({ name: 'Child', parent: parent._id });

            await request(app)
                .delete(`/api/v1/categories/${parent._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });
    });
});
