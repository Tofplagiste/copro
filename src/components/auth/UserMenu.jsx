/**
 * UserMenu - Menu utilisateur en haut à droite
 * Affiche le nom et permet de se déconnecter
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';

export default function UserMenu() {
    const { profile, isAdmin, isSyndic, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Fermer le menu si clic extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = profile?.full_name || profile?.email || 'Utilisateur';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div ref={menuRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {initials}
                </div>

                {/* Name (hidden on mobile) */}
                <span className="hidden sm:block text-sm text-white font-medium max-w-[120px] truncate">
                    {displayName}
                </span>

                {/* Role badge */}
                {(isAdmin || isSyndic) && (
                    <Shield className="w-4 h-4 text-amber-400" />
                )}

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-white font-medium truncate">{displayName}</p>
                        <p className="text-slate-400 text-sm truncate">{profile?.email}</p>
                        {(isAdmin || isSyndic) && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                                <Shield className="w-3 h-3" />
                                {isAdmin ? 'Admin' : 'Syndic'}
                            </span>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Future: navigate to profile page
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        >
                            <User className="w-4 h-4" />
                            Mon profil
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
