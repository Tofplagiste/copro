/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext - Contexte d'authentification Supabase
 * 
 * Gère la session utilisateur et le profil associé.
 * Vérifie is_approved pour le workflow de validation admin.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

/**
 * Provider d'authentification
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initRef = useRef(false);

    /**
     * Récupère le profil utilisateur depuis la table profiles
     * @param {string} userId - UUID de l'utilisateur
     */
    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                // Si RLS bloque ou profil inexistant, on met un profil vide
                console.warn('[Auth] Profil non accessible (RLS ou inexistant):', profileError.message);
                // Créer un profil minimal depuis le user pour permettre la navigation
                setProfile({ id: userId, is_approved: false, role: 'user' });
                return null;
            }

            setProfile(data);
            return data;
        } catch (err) {
            console.error('[Auth] Exception profil:', err);
            setProfile({ id: userId, is_approved: false, role: 'user' });
            return null;
        }
    }, []);

    /**
     * Initialise la session au chargement
     */
    useEffect(() => {
        // Éviter double initialisation
        if (initRef.current) return;
        initRef.current = true;

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('[Auth] Erreur init:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Écouter les changements d'auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] Event:', event);

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    /**
     * Connexion avec email/mot de passe
     */
    const signIn = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            // Set user and fetch profile explicitly
            setUser(data.user);
            await fetchProfile(data.user.id);
            setLoading(false);

            return { success: true, user: data.user };
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return { success: false, error: err.message };
        }
    };

    /**
     * Inscription avec email/mot de passe
     */
    const signUp = async (email, password, metadata = {}) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata.full_name,
                        lot_number: metadata.lot_number
                    }
                }
            });

            if (signUpError) throw signUpError;

            return { success: true, user: data.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Déconnexion
     */
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            // Force page reload pour nettoyer tout l'état
            window.location.href = '/auth/login';
        } catch (err) {
            console.error('[Auth] Erreur signOut:', err);
            // Force quand même la redirection
            window.location.href = '/auth/login';
        }
    };

    /**
     * Rafraîchir le profil (après modification)
     */
    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    };

    // Computed values
    const isAuthenticated = !!user;
    const isApproved = profile?.is_approved === true;
    const isAdmin = profile?.role === 'admin';
    const isSyndic = profile?.role === 'syndic' || isAdmin;

    const value = {
        user,
        profile,
        loading,
        error,
        isAuthenticated,
        isApproved,
        isAdmin,
        isSyndic,
        signIn,
        signUp,
        signOut,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook pour accéder au contexte d'authentification
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
