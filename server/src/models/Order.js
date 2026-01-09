/**
 * Modele Order — suivi des commandes Kosma.
 *
 * Chaque commande recoit un numero unique (KSM-20240001) genere
 * automatiquement. L'historique des changements de statut est conserve
 * dans statusHistory pour tracer qui a fait quoi et quand.
 *
 * Transitions autorisees (voir orderController.js) :
 *   pending -> confirmed | cancelled
 *   confirmed -> shipped | cancelled
 *   shipped -> delivered
 */
const mongoose = require('mongoose');

// --- Schema ---

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },

        // Infos client embarquees (pas de ref User volontairement,
        // car un client peut commander sans creer de compte).
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
            address: {
                street: String,
                city: String,
                state: String,
                zipCode: String,
                country: { type: String, default: 'FR' },
            },
        },

        // Snapshot des produits au moment de la commande
        // (le prix peut changer apres, on garde la valeur d'origine).
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                total: { type: Number, required: true },
            },
        ],

        // Montants
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },          // TVA 20% en France
        shippingCost: { type: Number, default: 0 },  // gratuit au-dessus de 50€
        total: { type: Number, required: true },

        // Workflow
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        statusHistory: [
            {
                status: String,
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                note: String,
            },
        ],

        // Notes internes (visibles uniquement par l'equipe)
        notes: [
            {
                content: { type: String, required: true },
                createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // Paiement
        paymentMethod: {
            type: String,
            enum: ['card', 'paypal', 'bank_transfer', 'cash'],
            default: 'card',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// --- Hooks ---

// Attribution du numero de commande a la creation.
// Format : KSM-{annee}{numero sequentiel sur 4 chiffres}
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `KSM-${year}${String(count + 1).padStart(4, '0')}`;

        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            note: 'Commande creee',
        });
    }
    next();
});

// --- Methodes statiques (aggregations MongoDB) ---

/**
 * Calcule le chiffre d'affaires par mois sur une periode donnee.
 * Exclut les commandes annulees et non payees.
 */
orderSchema.statics.getRevenueByPeriod = async function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' },
                paymentStatus: 'paid',
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue: { $sum: '$total' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
};

/** Repartition des commandes par statut (pour le PieChart du dashboard). */
orderSchema.statics.getOrdersByStatus = async function () {
    return this.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
};

// --- Index ---

orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 }); // tri par date decroissante par defaut

module.exports = mongoose.model('Order', orderSchema);
