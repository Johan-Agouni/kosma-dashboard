require('../setup');
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const Category = require('../../src/models/Category');

describe('Customer Routes', () => {
    let adminToken;

    beforeEach(async () => {
        await User.create({
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
            name: 'Product',
            price: 10,
            stock: 50,
            category: category._id,
        });

        // Create orders for two customers
        for (let i = 0; i < 3; i++) {
            await Order.create({
                customer: {
                    name: 'Alice Dupont',
                    email: 'alice@test.com',
                    address: { city: 'Paris', country: 'FR' },
                },
                items: [
                    {
                        product: product._id,
                        name: 'Product',
                        price: 10,
                        quantity: 1,
                        total: 10,
                    },
                ],
                subtotal: 10,
                total: 12,
            });
        }

        await Order.create({
            customer: {
                name: 'Bob Martin',
                email: 'bob@test.com',
                address: { city: 'Lyon', country: 'FR' },
            },
            items: [
                {
                    product: product._id,
                    name: 'Product',
                    price: 10,
                    quantity: 2,
                    total: 20,
                },
            ],
            subtotal: 20,
            total: 24,
        });
    });

    describe('GET /api/v1/customers', () => {
        test('aggregates customers from orders', async () => {
            const res = await request(app)
                .get('/api/v1/customers')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(2);
            const alice = res.body.data.find(c => c.email === 'alice@test.com');
            expect(alice.totalOrders).toBe(3);
        });

        test('searches customers by name', async () => {
            const res = await request(app)
                .get('/api/v1/customers?search=Alice')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].name).toBe('Alice Dupont');
        });
    });

    describe('GET /api/v1/customers/:id', () => {
        test('returns customer details', async () => {
            const res = await request(app)
                .get('/api/v1/customers/alice@test.com')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data.totalOrders).toBe(3);
            expect(res.body.data.totalSpent).toBe(36);
        });
    });

    describe('GET /api/v1/customers/:id/orders', () => {
        test('returns customer orders', async () => {
            const res = await request(app)
                .get('/api/v1/customers/alice@test.com/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.data).toHaveLength(3);
        });
    });
});
