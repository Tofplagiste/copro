/**
 * SignupPage - Page d'inscription
 * Refactorisé pour respecter la limite de 150 lignes
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Home, AlertCircle, Loader2 } from 'lucide-react';
import AuthFormField from '../../components/auth/AuthFormField';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signUp, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', fullName: '', lotNumber: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password || !formData.fullName) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        const result = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            lot_number: formData.lotNumber
        });

        if (result.success) {
            navigate('/auth/pending', { replace: true });
        } else {
            setError(result.error || 'Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
                    <p className="text-slate-400 mt-2">Rejoignez votre copropriété</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                            </div>
                        )}

                        <AuthFormField label="Nom complet" required Icon={User} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Jean Dupont" />
                        <AuthFormField label="Adresse email" required Icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="vous@exemple.com" autoComplete="email" />
                        <AuthFormField label="Numéro de lot (optionnel)" Icon={Home} name="lotNumber" value={formData.lotNumber} onChange={handleChange} placeholder="Ex: Lot 15, MARGAUX" helpText="Aide l'administrateur à vous identifier" />
                        <AuthFormField label="Mot de passe" required Icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />
                        <AuthFormField label="Confirmer le mot de passe" required Icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Création...</> : <><UserPlus className="w-5 h-5" />Créer mon compte</>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400">
                            Déjà un compte ?{' '}<Link to="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition">Se connecter</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-sm mt-8">Votre compte devra être validé par un administrateur</p>
            </div>
        </div>
    );
}
