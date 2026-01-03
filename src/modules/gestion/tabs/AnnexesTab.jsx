/**
 * AnnexesTab - Onglet Annexes Bilan (États financiers) V6
 * Refactorisé pour respecter la limite de 150 lignes
 */
import { useState } from 'react';
import { Scale, Plus } from 'lucide-react';
import { useFinanceSupabaseAdapter } from '../hooks/useFinanceSupabaseAdapter';
import { useGestionData } from '../context/GestionSupabaseContext';
import { useToast } from '../../../components/ToastProvider';
import { fmtMoney } from '../../../utils/formatters';
import Modal from '../../../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BilanTable from '../components/annexes/BilanTable';
import CompteGestionTable from '../components/annexes/CompteGestionTable';
import SoldesCoproTable from '../components/annexes/SoldesCoproTable';

export default function AnnexesTab() {
    const { accounts, operations } = useFinanceSupabaseAdapter();
    const { owners } = useGestionData();
    const toast = useToast();

    const [manualEntries, setManualEntries] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ type: 'actif', label: '', amount: '' });

    // Calculs
    const getAccountBalance = (accId) => {
        const acc = accounts.find(a => a.id === accId);
        let bal = acc?.initial_balance || 0;
        operations.forEach(op => {
            if (op.account === accId) bal += op.type === 'recette' ? op.amount : -op.amount;
        });
        return bal;
    };

    const getResultByCategory = () => {
        const result = {};
        operations.forEach(op => {
            if (!result[op.category]) result[op.category] = 0;
            result[op.category] += op.amount;
        });
        return result;
    };

    const livrets = accounts.filter(a => a.id.includes('502'));
    const totalFonds = livrets.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
    const manualActif = manualEntries.filter(e => e.type === 'actif').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const manualPassif = manualEntries.filter(e => e.type === 'passif').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const totalActif = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0) + manualActif;
    const totalRecettes = operations.filter(o => o.type === 'recette').reduce((s, o) => s + o.amount, 0);
    const totalDepenses = operations.filter(o => o.type === 'depense').reduce((s, o) => s + o.amount, 0);
    const netResult = totalRecettes - totalDepenses;
    const reportAN = totalActif - (totalFonds + manualPassif + netResult);
    const totalPassif = totalFonds + manualPassif + netResult + reportAN;

    // Handlers
    const handleAddManualEntry = () => {
        if (!newEntry.label || !newEntry.amount) return;
        setManualEntries([...manualEntries, { id: Date.now().toString(), ...newEntry, amount: parseFloat(newEntry.amount) }]);
        setNewEntry({ type: 'actif', label: '', amount: '' });
        setIsAddModalOpen(false);
        toast.success('Entrée ajoutée');
    };

    const handleRemoveManualEntry = (id) => {
        setManualEntries(manualEntries.filter(e => e.id !== id));
        toast.success('Entrée supprimée');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Dossier Comptable", 14, 20);
        let finalY = 30;

        const actifRows = [
            ...accounts.map(acc => [`Banque: ${acc.name}`, fmtMoney(getAccountBalance(acc.id))]),
            ...manualEntries.filter(e => e.type === 'actif').map(e => [e.label, fmtMoney(e.amount)]),
            ['TOTAL ACTIF', fmtMoney(totalActif)]
        ];
        autoTable(doc, { startY: finalY, head: [['Comptes Bancaires & Créances', 'Montant']], body: actifRows, theme: 'striped', headStyles: { fillColor: [41, 128, 185] } });
        finalY = doc.lastAutoTable.finalY + 15;

        const passifRows = [
            ...livrets.map(acc => [`Fonds & Réserves (${acc.name})`, fmtMoney(getAccountBalance(acc.id))]),
            ...manualEntries.filter(e => e.type === 'passif').map(e => [e.label, fmtMoney(e.amount)]),
            ['Excédent Exercice', fmtMoney(netResult)],
            ['Report à Nouveau', fmtMoney(reportAN)],
            ['TOTAL PASSIF', fmtMoney(totalPassif)]
        ];
        autoTable(doc, { startY: finalY, head: [['Fonds, Réserves & Dettes', 'Montant']], body: passifRows, theme: 'striped', headStyles: { fillColor: [41, 128, 185] } });
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
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-500">
                        <Plus size={18} /> Ajout Manuel
                    </button>
                    <button onClick={handleExportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-500">
                        📄 Tout Exporter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BilanTable accounts={accounts} livrets={livrets} manualEntries={manualEntries} getAccountBalance={getAccountBalance} onRemoveEntry={handleRemoveManualEntry} totalActif={totalActif} totalPassif={totalPassif} netResult={netResult} reportAN={reportAN} />
                <div className="space-y-6">
                    <CompteGestionTable resultByCategory={getResultByCategory()} netResult={netResult} />
                    <SoldesCoproTable owners={owners} operations={operations} />
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ajouter une ligne au Bilan" size="sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select value={newEntry.type} onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                            <option value="actif">ACTIF (ex: Créances)</option>
                            <option value="passif">PASSIF (ex: Dettes)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Libellé</label>
                        <input type="text" value={newEntry.label} onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Facture EDF" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Montant (€)</label>
                        <input type="number" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={handleAddManualEntry} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">Ajouter</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
