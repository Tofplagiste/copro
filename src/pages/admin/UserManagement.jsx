/**
 * UserManagement - Page d'administration des utilisateurs
 * Refactorisé pour respecter la limite de 150 lignes
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Users, ArrowLeft, RefreshCw, Shield, Loader2, AlertCircle, Search } from 'lucide-react';
import UserCard from './components/UserCard';
import UsersTable from './components/UsersTable';

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
                .from('profiles').select('*').order('created_at', { ascending: false });
            if (profilesError) throw profilesError;

            const { data: ownersData, error: ownersError } = await supabase
                .from('owners').select('id, name, email, tantiemes, profile_id, apt, lot').order('name');
            if (ownersError) throw ownersError;

            const usersWithOwners = profilesData.map(profile => ({
                ...profile,
                linkedOwner: ownersData.find(o => o.profile_id === profile.id)
            }));
            setUsers(usersWithOwners);
            setOwners(ownersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const toggleApproval = async (userId, currentStatus) => {
        setActionLoading(userId);
        try {
            await supabase.from('profiles').update({
                is_approved: !currentStatus,
                status: !currentStatus ? 'approved' : 'suspended',
                updated_at: new Date().toISOString(),
                approved_at: !currentStatus ? new Date().toISOString() : null,
                approved_by: !currentStatus ? currentUser?.id : null,
            }).eq('id', userId);
            await loadData();
        } catch (err) {
            setError('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const toggleAdmin = async (userId, currentRole) => {
        if (userId === currentUser?.id) { setError('Vous ne pouvez pas modifier votre propre rôle'); return; }
        setActionLoading(userId);
        try {
            await supabase.from('profiles').update({
                role: currentRole === 'admin' ? 'user' : 'admin',
                updated_at: new Date().toISOString()
            }).eq('id', userId);
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
            await supabase.from('owners').update({ profile_id: null }).eq('profile_id', userId);
            if (ownerId) {
                await supabase.from('owners').update({ profile_id: userId }).eq('id', parseInt(ownerId));
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

    const sharedProps = {
        currentUserId: currentUser?.id,
        availableOwners,
        linkingUser,
        actionLoading,
        onSetLinkingUser: setLinkingUser,
        onLinkToOwner: linkToOwner,
        onToggleAdmin: toggleAdmin,
        onToggleApproval: toggleApproval
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition"><ArrowLeft className="w-5 h-5 text-slate-400" /></Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold text-white">Utilisateurs</h1>
                                    <p className="text-slate-400 text-sm hidden sm:block">{users.length} utilisateur(s)</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-lg transition" title="Rafraîchir"><RefreshCw className="w-5 h-5 text-slate-400" /></button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {error && (
                    <div className="mb-4 flex items-center justify-between gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>
                        <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
                    </div>
                )}

                {/* Search */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher..." className="w-full sm:max-w-md pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                {/* Mobile: Cards */}
                <div className="lg:hidden space-y-4">
                    {filteredUsers.map(user => <UserCard key={user.id} user={user} {...sharedProps} />)}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-400"><Users className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Aucun utilisateur trouvé</p></div>
                    )}
                </div>

                {/* Desktop: Table */}
                <UsersTable users={filteredUsers} {...sharedProps} />

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"><p className="text-xl sm:text-2xl font-bold text-white">{users.length}</p><p className="text-slate-400 text-xs sm:text-sm">Total</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"><p className="text-xl sm:text-2xl font-bold text-green-400">{users.filter(u => u.is_approved).length}</p><p className="text-slate-400 text-xs sm:text-sm">Validés</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"><p className="text-xl sm:text-2xl font-bold text-amber-400">{users.filter(u => u.role === 'admin').length}</p><p className="text-slate-400 text-xs sm:text-sm">Admins</p></div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"><p className="text-xl sm:text-2xl font-bold text-emerald-400">{users.filter(u => u.linkedOwner).length}</p><p className="text-slate-400 text-xs sm:text-sm">Liés</p></div>
                </div>
            </div>
        </div>
    );
}
