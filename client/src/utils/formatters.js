import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
    return format(new Date(date), pattern, { locale: fr });
};

export const formatDateTime = date => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
};

export const formatRelative = date => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
};

export const formatNumber = number => {
    return new Intl.NumberFormat('fr-FR').format(number);
};
