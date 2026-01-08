/**
 * Modele Product — le coeur du catalogue Kosma.
 *
 * Chaque produit appartient a une categorie, possede un slug auto-genere
 * a partir du nom, et supporte le soft-delete (isDeleted) pour ne jamais
 * perdre de donnees en prod. Le seuil de stock bas est configurable par
 * produit via lowStockThreshold.
 */
const mongoose = require('mongoose');

// --- Schema ---

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom du produit est requis'],
            trim: true,
            maxlength: 200,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            maxlength: 2000,
        },
        price: {
            type: Number,
            required: [true, 'Le prix est requis'],
            min: [0, 'Le prix ne peut pas etre negatif'],
        },
        compareAtPrice: {
            type: Number,
            min: 0,
            default: null, // prix barre (ancien prix) pour afficher une promo
        },
        sku: {
            type: String,
            unique: true,
            sparse: true, // permet les null sans conflit d'unicite
            uppercase: true,
            trim: true,
        },
        stock: {
            type: Number,
            required: [true, 'Le stock est requis'],
            min: [0, 'Le stock ne peut pas etre negatif'],
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'La categorie est requise'],
        },
        images: [
            {
                url: { type: String, required: true },
                alt: { type: String, default: '' },
                isPrimary: { type: Boolean, default: false },
            },
        ],
        status: {
            type: String,
            enum: ['active', 'draft', 'archived'],
            default: 'draft',
        },
        tags: [{ type: String, trim: true }],
        weight: { type: Number, min: 0 },
        dimensions: {
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            height: { type: Number, min: 0 },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// --- Virtuals ---

// Permet d'afficher un badge "stock bas" dans le dashboard
// sans recalculer cote client.
productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.lowStockThreshold;
});

// --- Hooks ---

// Generation automatique du slug a partir du nom.
// On slugifie maison plutot que d'ajouter une dep (slugify, etc).
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Soft-delete : les produits "supprimes" sont masques par defaut.
// Pour les inclure, passer { includeDeleted: true } dans la query.
productSchema.pre(/^find/, function () {
    if (!this.getQuery().includeDeleted) {
        this.where({ isDeleted: false });
    }
});

// --- Index ---

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', description: 'text' }); // recherche full-text
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
