require('../setup');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const Category = require('../../src/models/Category');

describe('Order Routes', () => {
    let adminToken;
    let testOrder;

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

        const category = await Category.create({ name: 'Test' });
        const product = await Product.create({
            name: 'Test Product',
            price: 29.99,
            stock: 100,
            category: category._id,
        });

        testOrder = await Order.create({
            customer: {
                name: 'Client Test',
                email: 'client@test.com',
                phone: '0600000000',
                address: {
                    street: '1 rue Test',
                    city: 'Paris',
                    zipCode: '75001',
                    country: 'FR',
                },
            },
            items: [
                {
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: 2,
                    total: product.price * 2,
                },
            ],
            subtotal: product.price * 2,
            tax: product.price * 2 * 0.2,
            total: product.price * 2 * 1.2,
            paymentStatus: 'paid',
        });
    });

    describe('GET /api/v1/orders', () => {
        test('lists orders', async () => {
            const res = await request(app)
                .get('/api/v1/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.pagination).toBeDefined();
        });

        test('filters by status', async () => {
            const res = await request(app)
                .get('/api/v1/orders?status=pending')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data.every(o => o.status === 'pending')).toBe(true);
        });
    });

    describe('GET /api/v1/orders/:id', () => {
        test('returns order detail', async () => {
            const res = await request(app)
                .get(`/api/v1/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data.orderNumber).toBeDefined();
            expect(res.body.data.customer.name).toBe('Client Test');
        });

        test('returns 404 for unknown order', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await request(app)
                .get(`/api/v1/orders/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('PUT /api/v1/orders/:id/status', () => {
        test('updates order status with valid transition', async () => {
            const res = await request(app)
                .put(`/api/v1/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'confirmed', note: 'Commande validee' })
                .expect(200);

            expect(res.body.data.status).toBe('confirmed');
        });

        test('rejects invalid transition', async () => {
            await request(app)
                .put(`/api/v1/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'delivered' })
                .expect(400);
        });
    });

    describe('POST /api/v1/orders/:id/notes', () => {
        test('adds a note to order', async () => {
            const res = await request(app)
                .post(`/api/v1/orders/${testOrder._id}/notes`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ content: 'Note de test' })
                .expect(201);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].content).toBe('Note de test');
        });
    });
});
