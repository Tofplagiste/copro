/**
 * UsersTable - Tableau des utilisateurs pour affichage desktop
 * Extrait de UserManagement pour respecter la limite de 150 lignes
 */
import {
    CheckCircle, XCircle, Link2, Crown, User, Home, Users, Loader2
} from 'lucide-react';

/**
 * @param {Object} props
 * @param {Array} props.users
 * @param {string|null} props.currentUserId
 * @param {Array} props.availableOwners
 * @param {string|null} props.linkingUser
 * @param {string|null} props.actionLoading
 * @param {Function} props.onSetLinkingUser
 * @param {Function} props.onLinkToOwner
 * @param {Function} props.onToggleAdmin
 * @param {Function} props.onToggleApproval
 */
export default function UsersTable({
    users,
    currentUserId,
    availableOwners,
    linkingUser,
    actionLoading,
    onSetLinkingUser,
    onLinkToOwner,
    onToggleAdmin,
    onToggleApproval
}) {
    return (
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
                        {users.map(user => (
                            <tr key={user.id} className={`hover:bg-white/5 transition ${actionLoading === user.id ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                            {user.role === 'admin' ? <Crown className="w-5 h-5" /> : (user.full_name || user.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.full_name || 'Sans nom'} {user.id === currentUserId && <span className="text-xs text-slate-400">(vous)</span>}</p>
                                            <p className="text-slate-400 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        {user.role === 'admin' ? <><Crown className="w-3 h-3" /> Admin</> : <><User className="w-3 h-3" /> User</>}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {user.is_approved ? <><CheckCircle className="w-3 h-3" /> Validé</> : <><XCircle className="w-3 h-3" /> En attente</>}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {linkingUser === user.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600"
                                                defaultValue={user.linkedOwner?.id || ''}
                                                onChange={(e) => onLinkToOwner(user.id, e.target.value)}
                                            >
                                                <option value="">-- Aucun --</option>
                                                {user.linkedOwner && <option value={user.linkedOwner.id}>{user.linkedOwner.apt} - {user.linkedOwner.lot} ({user.linkedOwner.tantiemes}t)</option>}
                                                {availableOwners.map(o => <option key={o.id} value={o.id}>{o.apt} - {o.lot} ({o.tantiemes}t)</option>)}
                                            </select>
                                            <button onClick={() => onSetLinkingUser(null)} className="text-slate-400 hover:text-white">✕</button>
                                        </div>
                                    ) : user.linkedOwner ? (
                                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                            <Home className="w-4 h-4" /> {user.linkedOwner.apt} - {user.linkedOwner.lot} ({user.linkedOwner.tantiemes}t)
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic text-sm">Non lié</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onSetLinkingUser(user.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                                            <Link2 className="w-3.5 h-3.5" /> Lier
                                        </button>
                                        {user.id !== currentUserId && (
                                            <button onClick={() => onToggleAdmin(user.id, user.role)} disabled={actionLoading === user.id} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                <Crown className="w-3.5 h-3.5" /> {user.role === 'admin' ? 'Retirer' : 'Admin'}
                                            </button>
                                        )}
                                        <button onClick={() => onToggleApproval(user.id, user.is_approved)} disabled={actionLoading === user.id} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${user.is_approved ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                            {actionLoading === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : user.is_approved ? <><XCircle className="w-3.5 h-3.5" /> Bloquer</> : <><CheckCircle className="w-3.5 h-3.5" /> Valider</>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
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
    );
}
