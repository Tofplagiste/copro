/**
 * PendingApprovalPage - Page d'attente de validation
 * 
 * Affichée quand un utilisateur est connecté mais pas encore approuvé.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogOut, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function PendingApprovalPage() {
    const navigate = useNavigate();
    const { isApproved, signOut, refreshProfile } = useAuth();
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null); // 'approved' | 'pending' | null

    // Redirect automatiquement si approuvé
    useEffect(() => {
        if (isApproved) {
            setCheckResult('approved');
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1000);
        }
    }, [isApproved, navigate]);

    const handleRefresh = async () => {
        setChecking(true);
        setCheckResult(null);

        await refreshProfile();

        // L'effet useEffect ci-dessus gérera la redirection si approuvé
        setTimeout(() => {
            setChecking(false);
            // Si pas redirigé après 1.5s, montrer "pas encore validé"
            if (!isApproved) {
                setCheckResult('pending');
                setTimeout(() => setCheckResult(null), 2000);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg mb-6 animate-pulse">
                    <Clock className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    En attente de validation
                </h1>

                {/* Message */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10 mb-6">
                    <p className="text-slate-300 mb-4">
                        Votre compte a été créé avec succès !
                    </p>
                    <p className="text-slate-400 text-sm">
                        Un administrateur doit valider votre inscription avant que vous puissiez accéder à l'application.
                    </p>
                </div>

                {/* Check Result Feedback */}
                {checkResult === 'approved' && (
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-4 animate-pulse">
                        <CheckCircle className="w-5 h-5" />
                        <span>Compte validé ! Redirection...</span>
                    </div>
                )}
                {checkResult === 'pending' && (
                    <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                        <XCircle className="w-5 h-5" />
                        <span>Pas encore validé</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRefresh}
                        disabled={checking || checkResult === 'approved'}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 transition-transform ${checking ? 'animate-spin' : ''}`} />
                        {checking ? 'Vérification...' : 'Vérifier le statut'}
                    </button>

                    <button
                        onClick={signOut}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>

                {/* Contact info */}
                <p className="text-slate-500 text-sm mt-8">
                    Contactez le syndic si vous avez des questions
                </p>
            </div>
        </div>
    );
}
