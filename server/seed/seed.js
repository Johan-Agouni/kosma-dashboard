/**
 * Script de seed — remplit la base avec des donnees de demo.
 *
 * Usage : npm run seed (depuis /server)
 *
 * Ordre d'insertion :
 *   1. Users (admin, manager, viewer)
 *   2. Categories (6 categories)
 *   3. Products (rattaches aux categories via le prefixe SKU)
 *   4. Orders (items aleatoires pioches dans les produits)
 *
 * Le script vide toutes les collections avant de re-seeder.
 * Ne pas utiliser en production, evidemment.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const usersData = require('./data/users.json');
const categoriesData = require('./data/categories.json');
const productsData = require('./data/products.json');
const ordersData = require('./data/orders.json');

// Mapping prefixe SKU -> nom de categorie.
// Permet d'assigner automatiquement chaque produit a sa categorie
// sans avoir a dupliquer les ObjectId dans le JSON.
const CATEGORY_BY_SKU_PREFIX = {
    ELEC: 'Electronique',
    VET: 'Vetements',
    MAI: 'Maison & Jardin',
    SPO: 'Sports & Loisirs',
    LIV: 'Livres',
    ALI: 'Alimentation',
};

const seed = async () => {
    try {
        console.log('Connexion a MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('Connecte.');

        // --- Nettoyage ---
        console.log('Nettoyage des collections...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
        ]);

        // --- Utilisateurs ---
        console.log('Creation des utilisateurs...');
        const users = await User.create(usersData);
        console.log(`  ${users.length} utilisateurs crees`);

        // --- Categories ---
        console.log('Creation des categories...');
        const categories = await Category.create(categoriesData);
        console.log(`  ${categories.length} categories creees`);

        // Index nom -> ObjectId pour rattacher les produits
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // --- Produits ---
        console.log('Creation des produits...');
        const productDocs = productsData.map(p => {
            const prefix = p.sku.split('-')[0];
            const catName = CATEGORY_BY_SKU_PREFIX[prefix] || 'Electronique';
            return {
                ...p,
                category: categoryMap[catName],
                createdBy: users[0]._id, // l'admin est le createur par defaut
            };
        });
        const products = await Product.create(productDocs);
        console.log(`  ${products.length} produits crees`);

        // --- Commandes ---
        // On genere des items aleatoires pour chaque commande
        // (1 a 3 produits, quantite 1 a 3). La TVA est a 20% (France),
        // livraison gratuite au-dessus de 50€.
        console.log('Creation des commandes...');
        const orderDocs = ordersData.map(orderData => {
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;

            for (let i = 0; i < numItems; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const total = product.price * quantity;
                items.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity,
                    total,
                });
                subtotal += total;
            }

            const tax = Math.round(subtotal * 0.2 * 100) / 100;
            const shippingCost = subtotal > 50 ? 0 : 5.99;

            return {
                ...orderData,
                items,
                subtotal,
                tax,
                shippingCost,
                total: Math.round((subtotal + tax + shippingCost) * 100) / 100,
            };
        });

        // Creation sequentielle pour que les numeros de commande
        // (KSM-2024xxxx) soient attribues dans l'ordre.
        const orders = [];
        for (const doc of orderDocs) {
            const order = await Order.create(doc);
            orders.push(order);
        }
        console.log(`  ${orders.length} commandes creees`);

        // --- Resume ---
        console.log('\nSeed termine avec succes !');
        console.log('\nComptes de demo :');
        console.log('  Admin:   admin@kosma.dev   / Admin123!');
        console.log('  Manager: manager@kosma.dev / Manager123!');
        console.log('  Viewer:  viewer@kosma.dev  / Viewer123!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Erreur seed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();
