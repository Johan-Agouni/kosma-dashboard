/**
 * Hook generique pour les appels API avec gestion d'etat.
 *
 * Encapsule le pattern data/loading/error qu'on retrouve
 * dans chaque page. Par defaut, l'appel est lance au montage
 * (immediate = true). On peut aussi l'appeler manuellement
 * via execute().
 *
 * Usage :
 *   const { data, loading, error, execute } = useFetch(getProductsApi);
 */
import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, deps = [], immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFn(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            // On extrait le message du backend s'il existe,
            // sinon on fallback sur le message natif de l'erreur.
            const message = err.response?.data?.message || err.message;
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, loading, error, execute, setData };
};
