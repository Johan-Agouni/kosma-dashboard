export const ORDER_STATUSES = {
    pending: { label: 'En attente', color: 'var(--color-pending)' },
    confirmed: { label: 'Confirmee', color: 'var(--color-confirmed)' },
    shipped: { label: 'Expediee', color: 'var(--color-shipped)' },
    delivered: { label: 'Livree', color: 'var(--color-delivered)' },
    cancelled: { label: 'Annulee', color: 'var(--color-cancelled)' },
};

export const PRODUCT_STATUSES = {
    active: { label: 'Actif', color: 'var(--color-success)' },
    draft: { label: 'Brouillon', color: 'var(--color-warning)' },
    archived: { label: 'Archive', color: 'var(--color-text-muted)' },
};

export const PAYMENT_METHODS = {
    card: 'Carte bancaire',
    paypal: 'PayPal',
    bank_transfer: 'Virement',
    cash: 'Especes',
};

export const ROLES = {
    admin: 'Administrateur',
    manager: 'Gestionnaire',
    viewer: 'Lecteur',
};
