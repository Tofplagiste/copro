/**
 * BudgetTab - Onglet Budget & Appels de Fonds
 */
import { useState } from 'react';
import { FileText, Mail, Download, Table2 } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';
import { fmtMoney } from '../../utils/formatters';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

    // Génération PDF appel de fonds
    const generateOwnerPDF = (owner) => {
        const call = computeOwnerCall(owner);
        const doc = new jsPDF();
        const year = new Date().getFullYear();
        const quarter = selectedQuarter;

        // En-tête
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('APPEL DE FONDS', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${quarter} ${year}`, 105, 28, { align: 'center' });
        doc.text('Copropriété 9 Rue André Leroux - 33780 SOULAC-SUR-MER', 105, 35, { align: 'center' });

        // Destinataire
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(owner.name, 14, 50);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Lot(s): ${owner.lot}`, 14, 56);
        doc.text(`Tantièmes: ${owner.tantiemes} / 1000`, 14, 62);

        // Tableau de répartition
        const tableData = [];
        tableData.push(['Charges Générales (1/4)', fmtMoney(call.partGen) + ' €']);
        if (!owner.exoGest) {
            tableData.push(['Charges Syndic/Entretien (1/4)', fmtMoney(call.partSpe) + ' €']);
        } else {
            tableData.push(['Charges Syndic/Entretien (Exonéré)', '0.00 €']);
        }
        if (!owner.exoMen) {
            tableData.push(['Charges Ménage (1/4)', fmtMoney(call.partMen) + ' €']);
        } else {
            tableData.push(['Charges Ménage (Exonéré)', '0.00 €']);
        }
        tableData.push(['Travaux / Autre (1/4)', fmtMoney(call.partTra) + ' €']);
        tableData.push(['Sous-Total Charges', fmtMoney(call.subTotal) + ' €']);
        tableData.push(['Eau (Prévision)', fmtMoney(call.wCost) + ' €']);

        doc.autoTable({
            startY: 75,
            head: [['Poste', 'Montant']],
            body: tableData,
            headStyles: { fillColor: [51, 65, 85] },
            styles: { fontSize: 10 },
            columnStyles: { 1: { halign: 'right' } }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFillColor(34, 197, 94);
        doc.rect(14, finalY - 2, 182, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL À RÉGLER: ${fmtMoney(call.total)} €`, 105, finalY + 6, { align: 'center' });

        // Pied de page
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('À régler avant le 15 du premier mois du trimestre.', 14, finalY + 25);

        doc.save(`Appel_${owner.name}_${quarter}_${year}.pdf`);
    };

    return (
        <div className="p-6 space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mode Budget */}
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 mb-1">Mode d'Appel :</span>
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
                            className="px-2 py-1 border rounded font-bold"
                        >
                            {['T1', 'T2', 'T3', 'T4'].map(q => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            defaultValue={2026}
                            className="w-16 px-2 py-1 border rounded font-bold"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-400">
                        <Table2 size={16} /> Tableau Détails
                    </button>
                    <button className="px-3 py-2 bg-amber-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400">
                        <Mail size={16} /> Mailing
                    </button>
                </div>
            </div>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['general', 'special', 'menage', 'travaux'].map(cat => renderBudgetCard(cat))}
            </div>

            {/* Owners Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-white text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Propriétaire (Lots)</th>
                                <th className="px-2 py-3" style={{ width: 50 }}>Tant.</th>
                                <th className="px-2 py-3">Général (1/4)</th>
                                <th className="px-2 py-3 text-amber-400">Syndic/Ent. (1/4)</th>
                                <th className="px-2 py-3 text-cyan-400">Ménage (1/4)</th>
                                <th className="px-2 py-3 text-red-400">Travaux (1/4)</th>
                                <th className="px-2 py-3 bg-gray-600">S.Total (HE)</th>
                                <th className="px-2 py-3 bg-white text-blue-600">Eau (Prévi)</th>
                                <th className="px-2 py-3 bg-green-600">TOTAL</th>
                                <th className="px-2 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {state.owners.filter(o => !o.isCommon).map(owner => {
                                const call = computeOwnerCall(owner);
                                return (
                                    <tr key={owner.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-800 flex items-center gap-1">
                                                {owner.name}
                                                {owner.exoGest && (
                                                    <span className="text-xs bg-red-500 text-white px-1 rounded font-bold">Exo.S</span>
                                                )}
                                                {owner.exoMen && (
                                                    <span className="text-xs bg-purple-500 text-white px-1 rounded font-bold">Exo.M</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-green-600 italic">{owner.lot}</span>
                                        </td>
                                        <td className="px-2 py-3 text-center text-gray-500 text-xs">{owner.tantiemes}</td>
                                        <td className="px-2 py-3 text-center">{fmtMoney(call.partGen)}</td>
                                        <td className={`px-2 py-3 text-center font-bold text-amber-600 ${owner.exoGest ? 'line-through opacity-25' : ''}`}>
                                            {fmtMoney(call.partSpe)}
                                        </td>
                                        <td className={`px-2 py-3 text-center font-bold text-cyan-600 ${owner.exoMen ? 'line-through opacity-25' : ''}`}>
                                            {fmtMoney(call.partMen)}
                                        </td>
                                        <td className="px-2 py-3 text-center text-red-600">{fmtMoney(call.partTra)}</td>
                                        <td className="px-2 py-3 text-center font-bold bg-gray-100 border-x">{fmtMoney(call.subTotal)}</td>
                                        <td className="px-2 py-3 text-center font-bold text-blue-600">{fmtMoney(call.wCost)}</td>
                                        <td className="px-2 py-3 text-center font-bold bg-green-600 text-white">{fmtMoney(call.total)}</td>
                                        <td className="px-2 py-3">
                                            <div className="flex gap-1 justify-center">
                                                <button className="p-1.5 border rounded hover:bg-gray-100" title="Email">
                                                    <Mail size={14} className="text-amber-500" />
                                                </button>
                                                <button onClick={() => generateOwnerPDF(owner)} className="p-1.5 border rounded hover:bg-gray-100" title="PDF">
                                                    <Download size={14} className="text-red-500" />
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
