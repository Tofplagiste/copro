
import { useState, useEffect } from 'react';
import { useCopro } from '../../context/CoproContext';
import { getTodayISO } from '../../utils/formatters';

export default function VentilationModal({ isOpen, onClose, onSave, accounts }) {
    const { state } = useCopro();
    const categories = state.categories || [];

    const [date, setDate] = useState(getTodayISO());
    const [account, setAccount] = useState(accounts[0]?.id || '');
    const [label, setLabel] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    // Split parts
    const [partMenage, setPartMenage] = useState('');
    const [partPoubelles, setPartPoubelles] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setDate(getTodayISO());
            setLabel('');
            setTotalAmount('');
            setPartMenage('');
            setPartPoubelles('');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation basic
        const total = parseFloat(totalAmount) || 0;
        const men = parseFloat(partMenage) || 0;
        const pou = parseFloat(partPoubelles) || 0;

        if (Math.abs(total - (men + pou)) > 0.02) {
            if (!confirm(`Le total (${total}) ne correspond pas à la somme des parties (${(men + pou).toFixed(2)}). Continuer quand même ?`)) {
                return;
            }
        }

        onSave({
            date,
            account,
            label,
            total,
            parts: [
                { category: '615-MEN', amount: men, label: `${label} (Part Ménage)` },
                { category: '615-POU', amount: pou, label: `${label} (Part Poubelles)` } // Assuming 615-POU exists or is standard
            ]
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        🔢 Ventilation (Ménage / Poubelles)
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white text-xl">&times;</button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Ligne 1: Date, Compte, Libellé, Total */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Compte</label>
                            <select
                                value={account}
                                onChange={e => setAccount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Libellé Prestataire</label>
                            <input
                                type="text"
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="ex: Facture GSF..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">TOTAL FACTURE (€)</label>
                            <input
                                type="number"
                                value={totalAmount}
                                onChange={e => setTotalAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-right"
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Ligne 2: Part Ménage, Part Poubelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-cyan-600 mb-1">Part Ménage (615-MEN)</label>
                            <input
                                type="number"
                                value={partMenage}
                                onChange={e => setPartMenage(e.target.value)}
                                className="w-full px-3 py-2 border border-cyan-200 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-medium"
                                placeholder="Montant..."
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-amber-600 mb-1">Part Poubelles (615-POU)</label>
                            <input
                                type="number"
                                value={partPoubelles}
                                onChange={e => setPartPoubelles(e.target.value)}
                                className="w-full px-3 py-2 border border-amber-200 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                                placeholder="Montant..."
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Valider
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
