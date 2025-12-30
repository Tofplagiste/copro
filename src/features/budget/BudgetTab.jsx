/**
 * BudgetTab - Onglet Budget & Appels de Fonds
 */
import { useState } from 'react';
import { FileText, Mail, Download, Table2, Settings } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';
import { useToast } from '../../components/ToastProvider';
import { fmtMoney } from '../../utils/formatters';
import MailingModal from './MailingModal';
import GererPostesModal from './GererPostesModal';
import RecapTableModal from './RecapTableModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BUDGET_MODES = [
    { id: 'previ', label: '1. Budget Prévisionnel (Année N)' },
    { id: 'previ_n1', label: '2. Projet Budget (Année N+1)' },
    { id: 'reel', label: '3. Réalisé (Année N-1)' }
];

const CATEGORY_COLORS = {
    general: { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-600' },
    special: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-600' },
    menage: { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-600' },
    travaux: { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-600' }
};

const CATEGORY_LABELS = {
    general: 'Générales',
    special: 'Syndic/Entretien (Exo)',
    menage: 'Ménage (Exo)',
    travaux: 'Travaux/Autre'
};

const EXO_HINTS = {
    special: 'Exo: LE MERLE, LE CLOT',
    menage: 'Exo: CAUPENNE, BELLIARD'
};

export default function BudgetTab() {
    const { state, updateState } = useCopro();
    const toast = useToast();
    const [budgetMode, setBudgetMode] = useState(state.budgetMode || 'previ');
    const [selectedQuarter, setSelectedQuarter] = useState('T1');

    const budget = state.budget;
    const waterPrevi = state.waterPrevi || { subs: {}, charges: {}, reguls: {} };

    // Calcul des totaux par catégorie
    const getTotalByCategory = (cat) => {
        return (budget[cat] || []).reduce((acc, item) => acc + (item[budgetMode] || 0), 0);
    };

    // Calcul des diviseurs de tantièmes
    const getDivisors = () => {
        let divGen = 0, divSpe = 0, divMen = 0, divTra = 0;
        state.owners.forEach(o => {
            if (!o.isCommon) {
                divGen += o.tantiemes;
                divTra += o.tantiemes;
                if (!o.exoGest) divSpe += o.tantiemes;
                if (!o.exoMen) divMen += o.tantiemes;
            }
        });
        return { divGen, divSpe, divMen, divTra };
    };

    const divisors = getDivisors();

    // Mise à jour d'un poste budgétaire
    const handleBudgetUpdate = (category, index, field, value) => {
        const newBudget = { ...budget };
        newBudget[category] = [...budget[category]];
        newBudget[category][index] = {
            ...newBudget[category][index],
            [field]: parseFloat(value) || 0
        };
        updateState({ budget: newBudget, budgetMode });
    };

    // Changement de mode budget
    const handleModeChange = (mode) => {
        setBudgetMode(mode);
        updateState({ budgetMode: mode });
    };

    // Rendu des cards de saisie
    const renderBudgetCard = (category) => {
        const colors = CATEGORY_COLORS[category];
        const items = budget[category] || [];
        const total = getTotalByCategory(category);

        return (
            <div key={category} className={`bg-white rounded-xl shadow-sm border-t-4 ${colors.border} overflow-hidden`}>
                <div className={`${colors.bg} text-white px-4 py-2 flex justify-between items-center text-sm font-bold`}>
                    <span>{CATEGORY_LABELS[category]}</span>
                    <span>{fmtMoney(total)} €</span>
                </div>

                {/* Headers */}
                <div className="grid grid-cols-4 gap-1 px-2 py-1 border-b bg-gray-50 text-xs text-center font-bold text-gray-500">
                    <div></div>
                    <div>N-1</div>
                    <div className="text-blue-600">N</div>
                    <div>N+1</div>
                </div>

                <div className="p-2 space-y-1">
                    {EXO_HINTS[category] && (
                        <div className={`text-xs font-bold mb-1 ${category === 'special' ? 'text-red-500' : 'text-cyan-500'}`}>
                            {EXO_HINTS[category]}
                        </div>
                    )}

                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <span className="text-xs text-gray-600 truncate flex-shrink-0" style={{ maxWidth: 100 }} title={item.name}>
                                {item.name}
                            </span>
                            <div className="flex-1 grid grid-cols-3 gap-1">
                                {['reel', 'previ', 'previ_n1'].map(field => (
                                    <input
                                        key={field}
                                        type="number"
                                        value={item[field] || 0}
                                        onChange={(e) => handleBudgetUpdate(category, i, field, e.target.value)}
                                        className={`
                      w-full px-1 py-0.5 text-right text-xs font-mono border rounded
                      ${field === budgetMode
                                                ? 'border-blue-500 bg-white font-bold shadow-sm'
                                                : 'border-gray-200 bg-gray-50 text-gray-400'
                                            }
                    `}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Calcul appel par propriétaire
    const computeOwnerCall = (owner) => {
        const sums = {
            general: getTotalByCategory('general'),
            special: getTotalByCategory('special'),
            menage: getTotalByCategory('menage'),
            travaux: getTotalByCategory('travaux')
        };

        const partGen = (sums.general / divisors.divGen) * owner.tantiemes * 0.25;
        const partTra = (sums.travaux / divisors.divTra) * owner.tantiemes * 0.25;
        const partSpe = (!owner.exoGest && divisors.divSpe > 0) ? (sums.special / divisors.divSpe) * owner.tantiemes * 0.25 : 0;
        const partMen = (!owner.exoMen && divisors.divMen > 0) ? (sums.menage / divisors.divMen) * owner.tantiemes * 0.25 : 0;

        const subTotal = partGen + partTra + partSpe + partMen;

        // Eau depuis Prévisions
        const wSubs = parseFloat(waterPrevi.subs?.[owner.id]) || 0;
        const wCharges = parseFloat(waterPrevi.charges?.[owner.id]) || 0;
        const wReguls = parseFloat(waterPrevi.reguls?.[owner.id]) || 0;
        const wCost = wSubs + wCharges + wReguls;

        const total = subTotal + wCost;

        return { partGen, partSpe, partMen, partTra, subTotal, wCost, total };
    };

    const [isMailingModalOpen, setIsMailingModalOpen] = useState(false);
    const [mailingOwnerId, setMailingOwnerId] = useState(null);

    // Ouvrir le modal mailing
    const openMailing = (ownerId = null) => {
        setMailingOwnerId(ownerId);
        setIsMailingModalOpen(true);
    };

    // Gestion Postes
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    // Recap Table
    const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);

    const handleAddPoste = (category, name) => {
        const newBudget = { ...budget };
        if (!newBudget[category]) newBudget[category] = [];
        newBudget[category].push({ name, reel: 0, previ: 0, previ_n1: 0 });
        updateState({ budget: newBudget });
    };

    const handleDeletePoste = (category, index) => {
        const newBudget = { ...budget };
        newBudget[category].splice(index, 1);
        updateState({ budget: newBudget });
    };

    // Dates
    const [dateCompta, setDateCompta] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);


    // Génération PDF Appel de Fonds - Format détaillé
    const handleGeneratePDF = (ownerId) => {
        try {
            const owner = state.owners.find(o => o.id === ownerId);
            if (!owner) {
                toast.error('Propriétaire non trouvé');
                return;
            }

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // ===== HEADER =====
            doc.setFontSize(10);
            doc.setTextColor(0, 51, 102); // Bleu foncé
            doc.setFont('helvetica', 'bold');
            doc.text("Copropriété LES PYRÉNÉES", 15, 20);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text("7-9 rue André Leroux", 15, 25);
            doc.text("33780 SOULAC-SUR-MER", 15, 30);
            doc.setTextColor(0, 100, 0);
            doc.text("Email: coprolsp@gmail.com", 15, 35);

            // Info copropriétaire (droite)
            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.text(`Copropriétaire: ${owner.name} (${owner.apt})`, pageWidth - 15, 20, { align: 'right' });
            doc.setFontSize(9);
            doc.text(`Lot(s): ${owner.lot}`, pageWidth - 15, 25, { align: 'right' });

            // ===== TITRE =====
            doc.setFontSize(16);
            doc.setTextColor(0, 51, 102);
            doc.setFont('helvetica', 'bold');
            doc.text("APPEL DE FONDS", pageWidth / 2, 50, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`${selectedQuarter} 2026`, pageWidth / 2, 58, { align: 'center' });

            // ===== DONNÉES =====
            const tantiemes = owner.tantiemes;
            const divisorGen = divisors.divGen || 1000;
            const divisorSpe = divisors.divSpe || 818;
            const divisorMen = divisors.divMen || 801;
            const quarterRatio = 0.25;

            // Charges générales
            const generalItems = budget.general || [];
            const generalRows = generalItems.map(item => {
                const base = item[budgetMode] || 0;
                const montant = (base / divisorGen) * tantiemes * quarterRatio;
                return [`- ${item.name}`, `${fmtMoney(base)} €`, `${fmtMoney(montant)} €`];
            });
            const totalGenBase = generalItems.reduce((s, i) => s + (i[budgetMode] || 0), 0);
            const totalGenPeriod = (totalGenBase / divisorGen) * tantiemes * quarterRatio;

            // Charges Syndic & Entretien (special)
            const specialItems = budget.special || [];
            const specialRows = specialItems.map(item => {
                const base = item[budgetMode] || 0;
                const montant = owner.exoGest ? 0 : (base / divisorSpe) * tantiemes * quarterRatio;
                return [`- ${item.name}`, `${fmtMoney(base)} €`, `${fmtMoney(montant)} €`];
            });
            const totalSpeBase = specialItems.reduce((s, i) => s + (i[budgetMode] || 0), 0);
            const totalSpePeriod = owner.exoGest ? 0 : (totalSpeBase / divisorSpe) * tantiemes * quarterRatio;

            // Charges Ménage
            const menageItems = budget.menage || [];
            const menageRows = menageItems.map(item => {
                const base = item[budgetMode] || 0;
                const montant = owner.exoMen ? 0 : (base / divisorMen) * tantiemes * quarterRatio;
                return [`- ${item.name}`, `${fmtMoney(base)} €`, `${fmtMoney(montant)} €`];
            });
            const totalMenBase = menageItems.reduce((s, i) => s + (i[budgetMode] || 0), 0);
            const totalMenPeriod = owner.exoMen ? 0 : (totalMenBase / divisorMen) * tantiemes * quarterRatio;

            // Charges Travaux
            const travauxItems = budget.travaux || [];
            const travauxRows = travauxItems.map(item => {
                const base = item[budgetMode] || 0;
                const montant = (base / divisorGen) * tantiemes * quarterRatio;
                return [`- ${item.name}`, `${fmtMoney(base)} €`, `${fmtMoney(montant)} €`];
            });
            const totalTraBase = travauxItems.reduce((s, i) => s + (i[budgetMode] || 0), 0);
            const totalTraPeriod = (totalTraBase / divisorGen) * tantiemes * quarterRatio;

            // Eau
            const wSubs = parseFloat(waterPrevi.subs?.[owner.id]) || 0;
            const wCharges = parseFloat(waterPrevi.charges?.[owner.id]) || 0;
            const wReguls = parseFloat(waterPrevi.reguls?.[owner.id]) || 0;
            const annualWater = state.water?.annualTotal || 316.20;
            const waterPeriod = wSubs + wCharges + wReguls;

            // ===== TABLEAU =====
            const tableData = [];

            // Section Charges Générales
            tableData.push([{ content: 'Charges Générales', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
            generalRows.forEach(row => tableData.push(row));
            tableData.push([{ content: `Quote-part (${tantiemes}/${divisorGen} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } }, { content: `${fmtMoney(totalGenPeriod)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }]);

            // Section Charges Syndic & Entretien
            if (specialItems.length > 0) {
                tableData.push([{ content: 'Charges Syndic & Entretien', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
                specialRows.forEach(row => tableData.push(row));
                if (owner.exoGest) {
                    tableData.push([{ content: 'Exonéré de ces charges', colSpan: 2, styles: { fontStyle: 'italic', textColor: [150, 150, 150] } }, { content: '0.00 €', styles: { halign: 'right' } }]);
                } else {
                    tableData.push([{ content: `Quote-part (${tantiemes}/${divisorSpe} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } }, { content: `${fmtMoney(totalSpePeriod)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }]);
                }
            }

            // Section Charges Ménage
            if (menageItems.length > 0) {
                tableData.push([{ content: 'Charges Ménage', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
                menageRows.forEach(row => tableData.push(row));
                if (owner.exoMen) {
                    tableData.push([{ content: 'Exonéré de ces charges', colSpan: 2, styles: { fontStyle: 'italic', textColor: [150, 150, 150] } }, { content: '0.00 €', styles: { halign: 'right' } }]);
                } else {
                    tableData.push([{ content: `Quote-part (${tantiemes}/${divisorMen} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } }, { content: `${fmtMoney(totalMenPeriod)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }]);
                }
            }

            // Section Charges Travaux
            tableData.push([{ content: 'Charges Travaux', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
            if (travauxItems.length > 0) {
                travauxRows.forEach(row => tableData.push(row));
            }
            tableData.push([{ content: `Quote-part (${tantiemes}/1000 t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } }, { content: `${fmtMoney(totalTraPeriod)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }]);

            // Section Eau
            tableData.push([{ content: 'Eau & Compteurs', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
            tableData.push(['Provision Eau', `${fmtMoney(annualWater)} €`, `${fmtMoney(waterPeriod)} €`]);

            // TOTAL
            const grandTotal = totalGenPeriod + totalSpePeriod + totalMenPeriod + totalTraPeriod + waterPeriod;
            tableData.push([{ content: '', colSpan: 1 }, { content: 'TOTAL À PAYER', styles: { halign: 'right', fontStyle: 'bold', textColor: [180, 0, 0] } }, { content: `${fmtMoney(grandTotal)} €`, styles: { halign: 'right', fontStyle: 'bold', textColor: [180, 0, 0] } }]);

            autoTable(doc, {
                startY: 70,
                head: [['Poste', 'Base Annuelle', 'Montant Période']],
                body: tableData,
                theme: 'plain',
                headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 9, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 90 },
                    1: { halign: 'right', cellWidth: 45 },
                    2: { halign: 'right', cellWidth: 45 }
                },
                didParseCell: function (data) {
                    // Style pour les lignes de poste
                    if (data.row.index > 0 && data.column.index === 0 && data.cell.text[0]?.startsWith('-')) {
                        data.cell.styles.textColor = [80, 80, 80];
                    }
                }
            });

            // ===== FOOTER =====
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`À régler avant le 15 du premier mois du trimestre.`, 15, finalY);

            // Sauvegarder
            const filename = `Appel_${owner.name.replace(/[^a-zA-Z0-9]/g, '_')}_${owner.apt.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            doc.save(filename);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Erreur lors de la génération du PDF: ' + error.message);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <MailingModal
                isOpen={isMailingModalOpen}
                onClose={() => setIsMailingModalOpen(false)}
                owners={state.owners.filter(o => !o.isCommon)}
                initialOwnerId={mailingOwnerId}
                currentQuarter={selectedQuarter}
                year={2026}
                dueDate={dueDate}
                computeOwnerCall={computeOwnerCall}
                onGeneratePDF={handleGeneratePDF}
            />

            <GererPostesModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                budget={budget}
                onAdd={handleAddPoste}
                onDelete={handleDeletePoste}
            />

            <RecapTableModal
                isOpen={isRecapModalOpen}
                onClose={() => setIsRecapModalOpen(false)}
                owners={state.owners.filter(o => !o.isCommon)}
                budget={budget}
                budgetMode={budgetMode}
                divisors={divisors}
                selectedQuarter={selectedQuarter}
                waterPrevi={waterPrevi}
            />

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mode Budget */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Mode d'Appel :</span>
                        <select
                            value={budgetMode}
                            onChange={(e) => handleModeChange(e.target.value)}
                            className="px-3 py-2 border border-blue-500 rounded-lg font-bold text-blue-600"
                        >
                            {BUDGET_MODES.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Trimestre */}
                    <div className="flex items-center gap-2 border-l pl-4">
                        <span className="text-xs font-bold text-gray-600">Trimestre :</span>
                        <select
                            value={selectedQuarter}
                            onChange={(e) => setSelectedQuarter(e.target.value)}
                            className="px-2 py-2 border rounded font-bold"
                        >
                            {['T1', 'T2', 'T3', 'T4'].map(q => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            defaultValue={2026}
                            className="w-20 px-2 py-2 border rounded font-bold"
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 border-l pl-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Date Compta :</span>
                            <input
                                type="date"
                                value={dateCompta}
                                onChange={(e) => setDateCompta(e.target.value)}
                                className="px-2 py-2 border rounded text-sm font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Échéance :</span>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="px-2 py-2 border-2 border-orange-400 rounded text-sm font-bold text-orange-600 bg-orange-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsManageModalOpen(true)}
                        className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <Settings size={16} /> Gérer Postes
                    </button>
                    <button
                        onClick={() => setIsRecapModalOpen(true)}
                        className="px-3 py-2 bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-400"
                    >
                        <Table2 size={16} /> Tableau Détails
                    </button>
                    <button
                        onClick={() => openMailing(null)}
                        className="px-3 py-2 bg-amber-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400"
                    >
                        <Mail size={16} /> Mailing
                    </button>
                </div>
            </div>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['general', 'special', 'menage', 'travaux'].map(cat => renderBudgetCard(cat))}
            </div>

            {/* Owners Table - Premium Design */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                                <th className="text-left px-4 py-4 text-white font-bold text-xs uppercase tracking-wide" style={{ minWidth: 180 }}>
                                    Propriétaire
                                </th>
                                <th className="px-3 py-4 text-white font-bold text-xs uppercase tracking-wide text-center" style={{ width: 70 }}>
                                    Tant.
                                </th>
                                <th className="px-3 py-4 text-white font-bold text-xs uppercase tracking-wide text-center bg-blue-600/30">
                                    Général
                                </th>
                                <th className="px-3 py-4 text-amber-300 font-bold text-xs uppercase tracking-wide text-center">
                                    Syndic
                                </th>
                                <th className="px-3 py-4 text-cyan-300 font-bold text-xs uppercase tracking-wide text-center">
                                    Ménage
                                </th>
                                <th className="px-3 py-4 text-red-300 font-bold text-xs uppercase tracking-wide text-center">
                                    Travaux
                                </th>
                                <th className="px-3 py-4 text-white font-bold text-xs uppercase tracking-wide text-center bg-slate-600" style={{ width: 100 }}>
                                    Sous-Total
                                </th>
                                <th className="px-3 py-4 font-bold text-xs uppercase tracking-wide text-center bg-blue-500 text-white" style={{ width: 100 }}>
                                    💧 Eau
                                </th>
                                <th className="px-3 py-4 font-bold text-xs uppercase tracking-wide text-center bg-gradient-to-r from-emerald-500 to-green-600 text-white" style={{ width: 110 }}>
                                    TOTAL
                                </th>
                                <th className="px-3 py-4 text-white font-bold text-xs uppercase tracking-wide text-center" style={{ width: 90 }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {state.owners.filter(o => !o.isCommon).map((owner, idx) => {
                                const call = computeOwnerCall(owner);
                                const isEven = idx % 2 === 0;
                                return (
                                    <tr key={owner.id} className={`hover:bg-blue-50/50 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        {/* Propriétaire */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-slate-800">
                                                    {owner.name}
                                                </div>
                                                <div className="flex gap-1">
                                                    {owner.exoGest && (
                                                        <span className="text-[10px] bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                                            Exo.S
                                                        </span>
                                                    )}
                                                    {owner.exoMen && (
                                                        <span className="text-[10px] bg-gradient-to-r from-purple-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                                            Exo.M
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 italic">{owner.lot}</span>
                                        </td>

                                        {/* Tantièmes */}
                                        <td className="px-3 py-3 text-center">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                                                {owner.tantiemes}
                                            </span>
                                        </td>

                                        {/* Général */}
                                        <td className="px-3 py-3 text-center bg-blue-50/50">
                                            <span className="font-mono text-sm text-slate-700">{fmtMoney(call.partGen)}</span>
                                        </td>

                                        {/* Syndic */}
                                        <td className={`px-3 py-3 text-center ${owner.exoGest ? 'opacity-30' : ''}`}>
                                            <span className={`font-mono text-sm font-semibold text-amber-600 ${owner.exoGest ? 'line-through' : ''}`}>
                                                {fmtMoney(call.partSpe)}
                                            </span>
                                        </td>

                                        {/* Ménage */}
                                        <td className={`px-3 py-3 text-center ${owner.exoMen ? 'opacity-30' : ''}`}>
                                            <span className={`font-mono text-sm font-semibold text-cyan-600 ${owner.exoMen ? 'line-through' : ''}`}>
                                                {fmtMoney(call.partMen)}
                                            </span>
                                        </td>

                                        {/* Travaux */}
                                        <td className="px-3 py-3 text-center">
                                            <span className="font-mono text-sm text-red-500">{fmtMoney(call.partTra)}</span>
                                        </td>

                                        {/* Sous-Total */}
                                        <td className="px-3 py-3 text-center bg-slate-100 border-x border-slate-200">
                                            <span className="font-mono text-sm font-bold text-slate-700">{fmtMoney(call.subTotal)}</span>
                                        </td>

                                        {/* Eau - Colonne distincte */}
                                        <td className="px-3 py-3 text-center bg-blue-50 border-x border-blue-100">
                                            <span className="font-mono text-sm font-bold text-blue-600">{fmtMoney(call.wCost)}</span>
                                        </td>

                                        {/* TOTAL - Colonne mise en valeur */}
                                        <td className="px-3 py-3 text-center bg-gradient-to-r from-emerald-500 to-green-600">
                                            <span className="font-mono text-sm font-bold text-white drop-shadow-sm">{fmtMoney(call.total)} €</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => openMailing(owner.id)}
                                                    className="w-8 h-8 flex items-center justify-center bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-all"
                                                    title="Envoyer email"
                                                >
                                                    <Mail size={14} className="text-amber-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleGeneratePDF(owner.id)}
                                                    className="w-8 h-8 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all"
                                                    title="Télécharger PDF"
                                                >
                                                    <Download size={14} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
