/**
 * Modele User — gestion des comptes et authentification.
 *
 * Trois roles possibles : admin (tout), manager (CRUD produits/commandes),
 * viewer (lecture seule). Le mot de passe est hash via bcrypt avant chaque
 * sauvegarde, donc jamais stocke en clair dans Mongo.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Schema ---

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "L'email est requis"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
        },
        password: {
            type: String,
            required: [true, 'Le mot de passe est requis'],
            minlength: [8, 'Le mot de passe doit contenir au moins 8 caracteres'],
            select: false, // jamais renvoyé par défaut dans les queries
        },
        firstName: {
            type: String,
            required: [true, 'Le prenom est requis'],
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: [true, 'Le nom est requis'],
            trim: true,
            maxlength: 50,
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'viewer'],
            default: 'viewer',
        },
        avatar: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// --- Virtuals ---

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// --- Hooks ---

// Hash automatique du mot de passe avant sauvegarde.
// Le salt factor 12 est un bon compromis perf/securite en 2024.
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// --- Methodes d'instance ---

/**
 * Compare un mot de passe candidat avec le hash stocke.
 * Utilise par le controller auth lors du login.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
