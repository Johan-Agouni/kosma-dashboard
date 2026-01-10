const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kosma API',
            version: '1.0.0',
            description:
                'API REST pour le dashboard e-commerce Kosma. Authentification JWT, gestion produits, commandes, clients et categories.',
            contact: {
                name: 'Johan Agouni',
                url: 'https://github.com/Johan-Agouni',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Serveur de developpement',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth', description: 'Authentification et gestion de compte' },
            { name: 'Dashboard', description: 'Statistiques et vue d\'ensemble' },
            { name: 'Products', description: 'Gestion des produits' },
            { name: 'Orders', description: 'Gestion des commandes' },
            { name: 'Customers', description: 'Gestion des clients' },
            { name: 'Categories', description: 'Gestion des categories' },
            { name: 'Settings', description: 'Parametres et audit' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
