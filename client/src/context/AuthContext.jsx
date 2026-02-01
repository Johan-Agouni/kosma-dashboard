/**
 * Contexte d'authentification — gere l'etat user dans toute l'app.
 *
 * Pattern useReducer plutot que useState car l'etat auth a plusieurs
 * champs interdependants (user, isAuthenticated, isLoading).
 * Le reducer garantit des transitions d'etat coherentes.
 *
 * Les tokens JWT sont stockes dans localStorage (accessToken + refreshToken).
 * A l'initialisation, on tente un appel GET /auth/me pour restaurer
 * la session si un token existe encore.
 */
import { createContext, useReducer, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/auth.api';

export const AuthContext = createContext(null);

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // true au demarrage (on attend la verif du token)
};

// --- Reducer ---

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_SUCCESS':
            return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
        case 'AUTH_LOGOUT':
            return { ...state, user: null, isAuthenticated: false, isLoading: false };
        case 'AUTH_LOADING':
            return { ...state, isLoading: true };
        case 'AUTH_LOADED':
            return { ...state, isLoading: false };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
};

// --- Provider ---

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verification du token au montage du composant.
    // Si le token est valide, on recupere les infos user via /auth/me.
    // Sinon, on nettoie localStorage et on passe en mode deconnecte.
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                dispatch({ type: 'AUTH_LOADED' });
                return;
            }
            try {
                const { data } = await getMeApi();
                dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                dispatch({ type: 'AUTH_LOGOUT' });
            }
        };
        initAuth();
    }, []);

    // --- Actions exposees aux composants ---

    const login = async (email, password) => {
        const { data } = await loginApi({ email, password });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user });
        return data.data.user;
    };

    const register = async userData => {
        const { data } = await registerApi(userData);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user });
        return data.data.user;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await logoutApi(refreshToken);
        } catch {
            // On deconnecte cote client meme si l'API echoue
            // (ex: token deja expire, serveur down, etc.)
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'AUTH_LOGOUT' });
    };

    const updateUser = userData => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    /** Verifie si l'utilisateur a l'un des roles passes en argument. */
    const hasRole = (...roles) => {
        return state.user && roles.includes(state.user.role);
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
