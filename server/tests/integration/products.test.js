require('../setup');
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Category = require('../../src/models/Category');
const Product = require('../../src/models/Product');

describe('Product Routes', () => {
    let adminToken;
    let viewerToken;
    let categoryId;

    beforeEach(async () => {
        // Create admin user
        const admin = await User.create({
            email: 'admin@test.com',
            password: 'Password1',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
        });
        const adminLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@test.com', password: 'Password1' });
        adminToken = adminLogin.body.data.accessToken;

        // Create viewer user
        await User.create({
            email: 'viewer@test.com',
            password: 'Password1',
            firstName: 'Viewer',
            lastName: 'User',
            role: 'viewer',
        });
        const viewerLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'viewer@test.com', password: 'Password1' });
        viewerToken = viewerLogin.body.data.accessToken;

        // Create category
        const category = await Category.create({ name: 'Electronics' });
        categoryId = category._id.toString();
    });

    describe('GET /api/v1/products', () => {
        test('lists products with pagination', async () => {
            await Product.create({
                name: 'Test Product',
                price: 29.99,
                stock: 100,
                category: categoryId,
                status: 'active',
            });

            const res = await request(app)
                .get('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.total).toBe(1);
        });

        test('filters by status', async () => {
            await Product.create([
                { name: 'Active', price: 10, stock: 5, category: categoryId, status: 'active' },
                { name: 'Draft', price: 20, stock: 5, category: categoryId, status: 'draft' },
            ]);

            const res = await request(app)
                .get('/api/v1/products?status=active')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].name).toBe('Active');
        });

        test('requires authentication', async () => {
            await request(app).get('/api/v1/products').expect(401);
        });
    });

    describe('POST /api/v1/products', () => {
        const productData = {
            name: 'New Product',
            price: 49.99,
            stock: 50,
            description: 'A test product',
        };

        test('creates product as admin', async () => {
            const res = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...productData, category: categoryId })
                .expect(201);

            expect(res.body.data.name).toBe('New Product');
            expect(res.body.data.slug).toBe('new-product');
        });

        test('denies product creation for viewer', async () => {
            await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ ...productData, category: categoryId })
                .expect(403);
        });

        test('validates required fields', async () => {
            await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test' })
                .expect(400);
        });
    });

    describe('PUT /api/v1/products/:id', () => {
        test('updates product', async () => {
            const product = await Product.create({
                name: 'Old Name',
                price: 10,
                stock: 5,
                category: categoryId,
            });

            const res = await request(app)
                .put(`/api/v1/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Name', price: 25.99 })
                .expect(200);

            expect(res.body.data.name).toBe('New Name');
            expect(res.body.data.price).toBe(25.99);
        });
    });

    describe('DELETE /api/v1/products/:id', () => {
        test('soft deletes product', async () => {
            const product = await Product.create({
                name: 'To Delete',
                price: 10,
                stock: 5,
                category: categoryId,
            });

            await request(app)
                .delete(`/api/v1/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const deleted = await Product.findOne({ _id: product._id, includeDeleted: true });
            expect(deleted).toBeNull(); // filtered out by pre-find hook
        });
    });
});
