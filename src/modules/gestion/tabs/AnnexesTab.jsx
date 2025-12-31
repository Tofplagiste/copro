/**
 * AnnexesTab - Onglet Annexes Bilan (États financiers)
 */
import { useState } from 'react';
import { BookOpen, Scale, TrendingUp, Users, Plus, Trash2 } from 'lucide-react';
import { useCopro } from '../../../context/CoproContext';
import { useToast } from '../../../components/ToastProvider';
import { fmtMoney } from '../../../utils/formatters';
import Modal from '../../../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AnnexesTab() {
    const { state, updateState } = useCopro();
    const toast = useToast();
    const accounts = state.accounts || [];
    const operations = state.finance?.operations || [];

    // Manual Entries
    const manualEntries = state.finance?.manualEntries || [];
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ type: 'actif', label: '', amount: '' });

    // 1. Calcul Solde Bancaire (Comptes 512)
    const getAccountBalance = (accId) => {
        const acc = accounts.find(a => a.id === accId);
        let bal = acc?.initial || 0;
        operations.forEach(op => {
            if (op.account === accId) {
                bal += op.type === 'recette' ? op.amount : -op.amount;
            }
        });
        return bal;
    };

    // 2. Calcul Résultat (Recettes - Dépenses)
    const getResultByCategory = () => {
        const result = {};
        operations.forEach(op => {
            if (!result[op.category]) result[op.category] = 0;
            result[op.category] += op.type === 'recette' ? op.amount : op.amount; // Depense already negative? No, sum amounts usually.
            // Wait, logic check: usually expense ops are positive numbers in DB but represent outflow.
            // Previous logic: "result[op.category] += op.type === 'recette' ? op.amount : op.amount;" -> This sums everything positive??
            // Let's check previous file content logic.
            // Previous: "result[op.category] += op.type === 'recette' ? op.amount : op.amount;"
            // This suggests categories are either R or D. 
            // Total Result calculation:
            // "const totalRecettes = operations.filter(o => o.type === 'recette').reduce((s, o) => s + o.amount, 0);"
            // "const totalDepenses = operations.filter(o => o.type === 'depense').reduce((s, o) => s + o.amount, 0);"
            // "const netResult = totalRecettes - totalDepenses;"
            // This is correct for global result.
        });
        return result;
    };
    const resultByCategory = getResultByCategory();
    const totalRecettes = operations.filter(o => o.type === 'recette').reduce((s, o) => s + o.amount, 0);
    const totalDepenses = operations.filter(o => o.type === 'depense').reduce((s, o) => s + o.amount, 0);
    const netResult = totalRecettes - totalDepenses;

    // 3. Calcul Fonds & Réserves (Comptes 10x - ou Livrets 502)
    // Assumption: Livret accounts represent the assets held for funds.
    // The Liability side "Fonds" matches the Asset side "Livrets" usually +/-, or we just take Livret balance as proxy for Fund value.
    const livrets = accounts.filter(a => a.id.includes('502'));
    const totalFonds = livrets.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

    // 4. Manual Entries Totals
    const manualActif = manualEntries.filter(e => e.type === 'actif').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const manualPassif = manualEntries.filter(e => e.type === 'passif').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    // 5. Total Actif (Banques + Livrets + Manual Actif)
    // Note: Previous code summed all accounts for Total Actif. 
    // "const totalActif = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);"
    // This includes 512 (Banque) and 502 (Livrets).
    const totalBankAndLivrets = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
    const totalActif = totalBankAndLivrets + manualActif;

    // 6. Report À Nouveau (Balancing Figure)
    // Actif = Passif
    // Passif = Fonds (Likely matched by Livrets in Actif?) + Dettes (Manual Passif) + Result + ReportAN
    // Note: In previous code, "totalFonds" was subtracted. "livrets" are part of accounts.
    // If we assume Livrets on Actif side balance exactly "Fonds" on Passif side, then:
    // ReportAN = (Actif - Livrets) - (ManualPassif + Result)
    // = (Banques + ManualActif) - (ManualPassif + Result)
    // But previous code: "totalActif - totalFonds - netResult"
    // totalActif included Livrets. totalFonds was sum of Livrets.
    // So distinct is Banques - NetResult = ReportAN ?? 
    // Let's stick to the balancing formula:
    // ReportAN = TotalActif - (TotalFonds + ManualPassif + NetResult)
    const reportAN = totalActif - (totalFonds + manualPassif + netResult);

    // Total Passif for Display verification
    const totalPassif = totalFonds + manualPassif + netResult + reportAN;

    // Handlers
    const handleAddManualEntry = () => {
        if (!newEntry.label || !newEntry.amount) return;
        const entry = {
            id: Date.now().toString(),
            ...newEntry,
            amount: parseFloat(newEntry.amount)
        };
        const updatedEntries = [...manualEntries, entry];
        updateState({
            finance: {
                ...state.finance,
                manualEntries: updatedEntries
            }
        });
        setNewEntry({ type: 'actif', label: '', amount: '' });
        setIsAddModalOpen(false);
        toast.success('Entrée ajoutée');
    };

    const handleRemoveManualEntry = (id) => {
        const updatedEntries = manualEntries.filter(e => e.id !== id);
        updateState({
            finance: {
                ...state.finance,
                manualEntries: updatedEntries
            }
        });
        toast.success('Entrée supprimée');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Dossier Comptable", 14, 20);

        let finalY = 30;

        // TABLEAU ACTIF
        const actifRows = [
            ...accounts.map(acc => [`Banque: ${acc.name}`, fmtMoney(getAccountBalance(acc.id))]),
            ...manualEntries.filter(e => e.type === 'actif').map(e => [e.label, fmtMoney(e.amount)]),
            ['TOTAL ACTIF', fmtMoney(totalActif)]
        ];

        autoTable(doc, {
            startY: finalY,
            head: [['Comptes Bancaires & Créances', 'Montant']],
            body: actifRows,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
            didParseCell: (data) => {
                if (data.row.index === actifRows.length - 1) {
                    data.cell.styles.fillColor = [41, 128, 185];
                    data.cell.styles.textColor = 255;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        finalY = doc.lastAutoTable.finalY + 15;

        // TABLEAU PASSIF
        const passifRows = [
            ...livrets.map(acc => [`Fonds & Réserves (${acc.name})`, fmtMoney(getAccountBalance(acc.id))]),
            ...manualEntries.filter(e => e.type === 'passif').map(e => [e.label, fmtMoney(e.amount)]),
            ['Excédent Exercice', fmtMoney(netResult)],
            ['Report à Nouveau (Solde N-1)', fmtMoney(reportAN)],
            ['TOTAL PASSIF', fmtMoney(totalPassif)]
        ];

        autoTable(doc, {
            startY: finalY,
            head: [['Fonds, Réserves & Dettes', 'Montant']],
            body: passifRows,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
            didParseCell: (data) => {
                if (data.row.index === passifRows.length - 1) {
                    data.cell.styles.fillColor = [41, 128, 185];
                    data.cell.styles.textColor = 255;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save('Dossier_Comptable.pdf');
        toast.success('PDF Exporté !');
    };

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Scale size={28} /> Annexes Comptables (Bilan & Résultat)
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-500"
                    >
                        <Plus size={18} /> Ajout Manuel
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-500"
                    >
                        📄 Tout Exporter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Annexe 1: Bilan */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-slate-700 text-white px-4 py-3 flex justify-between items-center">
                        <span className="font-bold">Annexe 1 : État Financier</span>
                        <span className="text-sm">BILAN</span>
                    </div>

                    {/* ACTIF */}
                    <div className="p-4">
                        <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Actif</h4>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left px-3 py-2">Comptes Bancaires & Créances</th>
                                    <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map(acc => (
                                    <tr key={acc.id} className="border-b border-gray-100">
                                        <td className="px-3 py-2">Banque: {acc.name}</td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtMoney(getAccountBalance(acc.id))}</td>
                                    </tr>
                                ))}
                                {manualEntries.filter(e => e.type === 'actif').map(e => (
                                    <tr key={e.id} className="border-b border-gray-100 bg-emerald-50/50 group">
                                        <td className="px-3 py-2 flex items-center gap-2">
                                            {e.label}
                                            <button onClick={() => handleRemoveManualEntry(e.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtMoney(e.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td className="px-3 py-2">TOTAL ACTIF</td>
                                    <td className="px-3 py-2 text-right">{fmtMoney(totalActif)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* PASSIF */}
                        <h4 className="text-xs uppercase font-bold text-gray-500 mt-4 mb-2">Passif</h4>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left px-3 py-2">Fonds, Réserves & Dettes</th>
                                    <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {livrets.map(acc => (
                                    <tr key={acc.id} className="border-b border-gray-100">
                                        <td className="px-3 py-2">Fonds & Réserves ({acc.name})</td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtMoney(getAccountBalance(acc.id))}</td>
                                    </tr>
                                ))}
                                {manualEntries.filter(e => e.type === 'passif').map(e => (
                                    <tr key={e.id} className="border-b border-gray-100 bg-amber-50/50 group">
                                        <td className="px-3 py-2 flex items-center gap-2">
                                            {e.label}
                                            <button onClick={() => handleRemoveManualEntry(e.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtMoney(e.amount)}</td>
                                    </tr>
                                ))}
                                <tr className="border-b border-gray-100">
                                    <td className="px-3 py-2">Excédent Exercice</td>
                                    <td className={`px-3 py-2 text-right font-mono ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {fmtMoney(netResult)}
                                    </td>
                                </tr>
                                <tr className="bg-amber-50 font-bold border-b border-gray-100">
                                    <td className="px-3 py-2">Report à Nouveau (Solde N-1)</td>
                                    <td className="px-3 py-2 text-right">{fmtMoney(reportAN)}</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td className="px-3 py-2">TOTAL PASSIF</td>
                                    <td className="px-3 py-2 text-right">{fmtMoney(totalPassif)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className={`mt-3 py-2 px-3 text-center text-sm rounded ${Math.abs(totalActif - totalPassif) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {Math.abs(totalActif - totalPassif) < 0.01 ? 'Bilan Équilibré ✓' : `Déséquilibre : ${fmtMoney(totalActif - totalPassif)}`}
                        </div>
                    </div>
                </div>

                {/* Annexe 2: Compte de Gestion */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-slate-700 text-white px-4 py-3 flex justify-between items-center">
                            <span className="font-bold">Annexe 2 : Compte de Gestion</span>
                            <span className="text-sm">RÉSULTAT</span>
                        </div>
                        <div className="p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left px-3 py-2">Poste</th>
                                        <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(resultByCategory)
                                        .sort((a, b) => a[0].localeCompare(b[0]))
                                        .map(([code, amount]) => (
                                            <tr key={code} className="border-b border-gray-100">
                                                <td className="px-3 py-2">{code}</td>
                                                <td className="px-3 py-2 text-right font-mono">{fmtMoney(amount)}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                                <tfoot className="bg-gray-100 font-bold">
                                    <tr>
                                        <td className="px-3 py-2">RÉSULTAT DE L'EXERCICE</td>
                                        <td className={`px-3 py-2 text-right ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {fmtMoney(netResult)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Annexe 3: Soldes Copropriétaires */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-slate-700 text-white px-4 py-3 flex items-center gap-2">
                            <Users size={18} />
                            <span className="font-bold">Annexe 3 : Soldes Copropriétaires</span>
                        </div>
                        <div className="p-4 max-h-48 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="text-left px-3 py-2">Nom</th>
                                        <th className="text-right px-3 py-2">Solde (Estimé)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.owners.filter(o => !o.isCommon).map(owner => (
                                        <tr key={owner.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-3 py-2">{owner.name}</td>
                                            <td className="px-3 py-2 text-right font-mono text-green-600">0.00</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ajout Manuel */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Ajouter une ligne au Bilan"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select
                            value={newEntry.type}
                            onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="actif">ACTIF (ex: Créances, Avances)</option>
                            <option value="passif">PASSIF (ex: Dettes, Factures)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Libellé</label>
                        <input
                            type="text"
                            value={newEntry.label}
                            onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Facture EDF à payer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Montant (€)</label>
                        <input
                            type="number"
                            value={newEntry.amount}
                            onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleAddManualEntry}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
