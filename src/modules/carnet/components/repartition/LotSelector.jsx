/**
 * LotSelector - Dropdown multi-select avec recherche
 * Affiche les lots sélectionnés comme des tags
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '../../../../components/Modal';

export default function LotSelector({ lots, owners, selectedLotIds = [], currentOwnerId, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState({ open: false, lot: null, currentOwner: null });
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Build lot -> owner map
    const lotOwnerMap = {};
    owners.forEach(owner => {
        (owner.lot_ids || []).forEach(lotId => {
            if (owner.id !== currentOwnerId) {
                lotOwnerMap[lotId] = owner;
            }
        });
    });

    // Filter lots by search
    const filteredLots = lots.filter(lot => {
        const searchLower = search.toLowerCase();
        return (
            lot.nom?.toLowerCase().includes(searchLower) ||
            String(lot.numero).includes(searchLower)
        );
    });

    const handleToggle = (lot) => {
        const isSelected = selectedLotIds.includes(lot.id);
        const currentOwner = lotOwnerMap[lot.id];

        if (!isSelected && currentOwner) {
            setIsOpen(false); // Close dropdown before opening confirm modal
            setConfirmModal({ open: true, lot, currentOwner });
        } else {
            const newSelection = isSelected
                ? selectedLotIds.filter(id => id !== lot.id)
                : [...selectedLotIds, lot.id];
            onChange(newSelection);
        }
    };

    const handleRemoveTag = (lotId) => {
        onChange(selectedLotIds.filter(id => id !== lotId));
    };

    const handleConfirmTransfer = () => {
        const { lot } = confirmModal;
        onChange([...selectedLotIds, lot.id]);
        setConfirmModal({ open: false, lot: null, currentOwner: null });
    };

    // Get selected lot objects
    const selectedLots = selectedLotIds.map(id => lots.find(l => l.id === id)).filter(Boolean);
    const totalTantiemes = selectedLots.reduce((sum, l) => sum + (l.tantiemes || 0), 0);

    return (
        <div className="relative" ref={dropdownRef}>
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, lot: null, currentOwner: null })}
                onConfirm={handleConfirmTransfer}
                title="Transférer le lot ?"
                message={confirmModal.lot && (
                    <p>Le <strong>Lot {confirmModal.lot.numero}</strong> est attribué à <strong>{confirmModal.currentOwner?.name}</strong>. Transférer ?</p>
                )}
                confirmText="Transférer"
                variant="warning"
            />

            {/* Main selector button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-between gap-2"
            >
                <div className="flex flex-wrap gap-1.5 flex-1">
                    {selectedLots.length === 0 ? (
                        <span className="text-slate-400">Sélectionner des lots...</span>
                    ) : (
                        selectedLots.map(lot => (
                            <span
                                key={lot.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                                Lot {lot.numero}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveTag(lot.id); }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-bold text-blue-600">{totalTantiemes}</span>
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-72 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options list - overscroll-behavior prevents scroll propagation */}
                    <div
                        className="overflow-y-auto max-h-52"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {filteredLots.length === 0 ? (
                            <div className="p-3 text-center text-slate-400 text-sm">Aucun lot trouvé</div>
                        ) : (
                            filteredLots.map(lot => {
                                const isSelected = selectedLotIds.includes(lot.id);
                                const takenBy = lotOwnerMap[lot.id];

                                return (
                                    <div
                                        key={lot.id}
                                        onClick={() => handleToggle(lot)}
                                        className={`
                                            px-3 py-2 cursor-pointer flex items-center justify-between
                                            hover:bg-slate-50 transition-colors
                                            ${isSelected ? 'bg-blue-50' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="font-medium">Lot {lot.numero}</span>
                                            <span className="text-slate-500 text-sm">{lot.nom}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {takenBy && !isSelected && (
                                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    {takenBy.name}
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-blue-600">
                                                {lot.tantiemes}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
