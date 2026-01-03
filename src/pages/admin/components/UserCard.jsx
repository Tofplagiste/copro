/**
 * UserCard - Composant carte utilisateur pour affichage mobile
 * Extrait de UserManagement pour respecter la limite de 150 lignes
 */
import {
    CheckCircle, XCircle, Link2, Crown, User, Home, Loader2
} from 'lucide-react';

/**
 * @param {Object} props
 * @param {Object} props.user
 * @param {string|null} props.currentUserId
 * @param {Array} props.availableOwners
 * @param {string|null} props.linkingUser
 * @param {string|null} props.actionLoading
 * @param {Function} props.onSetLinkingUser
 * @param {Function} props.onLinkToOwner
 * @param {Function} props.onToggleAdmin
 * @param {Function} props.onToggleApproval
 */
export default function UserCard({
    user,
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
                            {user.id === currentUserId && <span className="text-xs text-slate-400">(vous)</span>}
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
                            onChange={(e) => onLinkToOwner(user.id, e.target.value)}
                        >
                            <option value="">-- Aucun --</option>
                            {user.linkedOwner && <option value={user.linkedOwner.id}>{user.linkedOwner.name} (actuel)</option>}
                            {availableOwners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.tantiemes}t)</option>)}
                        </select>
                        <button onClick={() => onSetLinkingUser(null)} className="text-slate-400 hover:text-white p-1">✕</button>
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
                    onClick={() => onSetLinkingUser(user.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                >
                    <Link2 className="w-4 h-4" /> Lier
                </button>

                {user.id !== currentUserId && (
                    <button
                        onClick={() => onToggleAdmin(user.id, user.role)}
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
                    onClick={() => onToggleApproval(user.id, user.is_approved)}
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
}
