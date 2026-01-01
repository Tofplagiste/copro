/**
 * UserManagement - Page d'administration des utilisateurs
 * Accessible uniquement aux admins - Version Responsive
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users, CheckCircle, XCircle, Link2, ArrowLeft,
    RefreshCw, Shield, User, Home, Loader2, AlertCircle,
    Search, Crown
} from 'lucide-react';

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [linkingUser, setLinkingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            const { data: ownersData, error: ownersError } = await supabase
                .from('owners')
                .select('id, name, email, tantiemes, profile_id')
                .order('name');

            if (ownersError) throw ownersError;

            const usersWithOwners = profilesData.map(profile => {
                const linkedOwner = ownersData.find(o => o.profile_id === profile.id);
                return { ...profile, linkedOwner };
            });

            setUsers(usersWithOwners);
            setOwners(ownersData);
        } catch (err) {
            console.error('[Admin] Erreur chargement:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleApproval = async (userId, currentStatus) => {
        setActionLoading(userId);
        const newApproved = !currentStatus;
        const newStatus = newApproved ? 'approved' : 'suspended';

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    is_approved: newApproved,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;
            await loadData();
        } catch (err) {
            setError('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const toggleAdmin = async (userId, currentRole) => {
        if (userId === currentUser?.id) {
            setError('Vous ne pouvez pas modifier votre propre rôle');
            return;
        }

        setActionLoading(userId);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: newRole,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;
            await loadData();
        } catch (err) {
            setError('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const linkToOwner = async (userId, ownerId) => {
        setActionLoading(userId);
        try {
            await supabase
                .from('owners')
                .update({ profile_id: null })
                .eq('profile_id', userId);

            if (ownerId) {
                const { error: linkError } = await supabase
                    .from('owners')
                    .update({ profile_id: userId })
                    .eq('id', parseInt(ownerId));

                if (linkError) throw linkError;
            }

            await loadData();
            setLinkingUser(null);
        } catch (err) {
            setError('Erreur liaison: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableOwners = owners.filter(o => !o.profile_id);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // Composant Card pour mobile
    const UserCard = ({ user }) => (
        <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${actionLoading === user.id ? 'opacity-50' : ''}`}>
            {/* Header : Avatar + Nom */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg ${user.role === 'admin'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}>
                        {user.role === 'admin' ? <Crown className="w-6 h-6" /> : (user.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-medium flex items-center gap-2">
                            {user.full_name || 'Sans nom'}
                            {user.id === currentUser?.id && <span className="text-xs text-slate-400">(vous)</span>}
                        </p>
                        <p className="text-slate-400 text-sm truncate max-w-[180px]">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                    {user.role === 'admin' ? <><Crown className="w-3 h-3" /> Admin</> : <><User className="w-3 h-3" /> User</>}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                    {user.is_approved ? <><CheckCircle className="w-3 h-3" /> Validé</> : <><XCircle className="w-3 h-3" /> En attente</>}
                </span>
            </div>

            {/* Lot propriétaire */}
            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">Lot propriétaire</p>
                {linkingUser === user.id ? (
                    <div className="flex items-center gap-2">
                        <select
                            className="flex-1 bg-slate-700 text-white text-sm rounded px-2 py-1.5 border border-slate-600"
                            defaultValue={user.linkedOwner?.id || ''}
                            onChange={(e) => linkToOwner(user.id, e.target.value)}
                        >
                            <option value="">-- Aucun --</option>
                            {user.linkedOwner && <option value={user.linkedOwner.id}>{user.linkedOwner.name} (actuel)</option>}
                            {availableOwners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.tantiemes}t)</option>)}
                        </select>
                        <button onClick={() => setLinkingUser(null)} className="text-slate-400 hover:text-white p-1">✕</button>
                    </div>
                ) : user.linkedOwner ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Home className="w-4 h-4" />
                        <span>{user.linkedOwner.name}</span>
                        <span className="text-slate-500 text-xs">({user.linkedOwner.tantiemes}t)</span>
                    </div>
                ) : (
                    <span className="text-slate-500 italic text-sm">Non lié</span>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setLinkingUser(user.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                >
                    <Link2 className="w-4 h-4" /> Lier
                </button>

                {user.id !== currentUser?.id && (
                    <button
                        onClick={() => toggleAdmin(user.id, user.role)}
                        disabled={actionLoading === user.id}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${user.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                    >
                        <Crown className="w-4 h-4" /> {user.role === 'admin' ? 'Retirer' : 'Admin'}
                    </button>
                )}

                <button
                    onClick={() => toggleApproval(user.id, user.is_approved)}
                    disabled={actionLoading === user.id}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${user.is_approved
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}
                >
                    {actionLoading === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.is_approved ? (
                        <><XCircle className="w-4 h-4" /> Bloquer</>
                    ) : (
                        <><CheckCircle className="w-4 h-4" /> Valider</>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold text-white">Utilisateurs</h1>
                                    <p className="text-slate-400 text-sm hidden sm:block">{users.length} utilisateur(s)</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-lg transition" title="Rafraîchir">
                            <RefreshCw className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center justify-between gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
                    </div>
                )}

                {/* Search */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full sm:max-w-md pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Mobile: Cards | Desktop: Table */}
                <div className="lg:hidden space-y-4">
                    {filteredUsers.map(user => <UserCard key={user.id} user={user} />)}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Utilisateur</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Rôle</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Statut</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Lot</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className={`hover:bg-white/5 transition ${actionLoading === user.id ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                    }`}>
                                                    {user.role === 'admin' ? <Crown className="w-5 h-5" /> : (user.full_name || user.email || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.full_name || 'Sans nom'} {user.id === currentUser?.id && <span className="text-xs text-slate-400">(vous)</span>}</p>
                                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {user.role === 'admin' ? <><Crown className="w-3 h-3" /> Admin</> : <><User className="w-3 h-3" /> User</>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {user.is_approved ? <><CheckCircle className="w-3 h-3" /> Validé</> : <><XCircle className="w-3 h-3" /> En attente</>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {linkingUser === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600"
                                                        defaultValue={user.linkedOwner?.id || ''}
                                                        onChange={(e) => linkToOwner(user.id, e.target.value)}
                                                    >
                                                        <option value="">-- Aucun --</option>
                                                        {user.linkedOwner && <option value={user.linkedOwner.id}>{user.linkedOwner.name}</option>}
                                                        {availableOwners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.tantiemes}t)</option>)}
                                                    </select>
                                                    <button onClick={() => setLinkingUser(null)} className="text-slate-400 hover:text-white">✕</button>
                                                </div>
                                            ) : user.linkedOwner ? (
                                                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                                    <Home className="w-4 h-4" /> {user.linkedOwner.name}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic text-sm">Non lié</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setLinkingUser(user.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                                                    <Link2 className="w-3.5 h-3.5" /> Lier
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button onClick={() => toggleAdmin(user.id, user.role)} disabled={actionLoading === user.id} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        }`}>
                                                        <Crown className="w-3.5 h-3.5" /> {user.role === 'admin' ? 'Retirer' : 'Admin'}
                                                    </button>
                                                )}
                                                <button onClick={() => toggleApproval(user.id, user.is_approved)} disabled={actionLoading === user.id} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${user.is_approved ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {actionLoading === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : user.is_approved ? <><XCircle className="w-3.5 h-3.5" /> Bloquer</> : <><CheckCircle className="w-3.5 h-3.5" /> Valider</>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Aucun utilisateur trouvé</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                        <p className="text-xl sm:text-2xl font-bold text-white">{users.length}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">Total</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                        <p className="text-xl sm:text-2xl font-bold text-green-400">{users.filter(u => u.is_approved).length}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">Validés</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                        <p className="text-xl sm:text-2xl font-bold text-amber-400">{users.filter(u => u.role === 'admin').length}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">Admins</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                        <p className="text-xl sm:text-2xl font-bold text-emerald-400">{users.filter(u => u.linkedOwner).length}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">Liés</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
