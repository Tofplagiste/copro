
/**
 * BudgetDetailTab - Tableau de bord mensuel (Dépenses & Trésorerie) V6
 * Design fidèle à la version legacy avec modaux
 * Données persistées via Supabase (monthly_expenses, monthly_income)
 */
import { useState } from 'react';
import { Check, Eraser, Zap, ListOrdered, Plus, Settings } from 'lucide-react';
import { useGestionData } from '../context/GestionSupabaseContext';
import { fmtMoney } from '../../../utils/formatters';
import { ConfirmModal, PromptModal } from '../../../components/Modal';
import GererPostesModal from '../components/budget/GererPostesModal';
import AddQuickLineModal from '../components/budget/AddQuickLineModal';

const MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/**
 * Input qui sauvegarde uniquement au blur (perte de focus)
 * Permet de taper un nombre complet sans blocage
 */
function BlurInput({ value, onSave, className, ...props }) {
    // Utilise la valeur initiale, les changements sont locaux jusqu'au blur
    const [localValue, setLocalValue] = useState(value || '');
    // Track si l'input a le focus pour ne pas écraser pendant la saisie
    const [hasFocus, setHasFocus] = useState(false);

    // Sync avec la valeur DB uniquement si on n'est pas en train d'éditer
    const displayValue = hasFocus ? localValue : (value || '');

    const handleFocus = () => {
        setHasFocus(true);
        setLocalValue(value || '');
    };

    const handleBlur = () => {
        setHasFocus(false);
        const numValue = parseFloat(localValue) || 0;
        // Ne sauvegarder que si la valeur a changé
        if (numValue !== (parseFloat(value) || 0)) {
            onSave(numValue);
        }
    };

    return (
        <input
            type="number"
            value={displayValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={className}
            {...props}
        />
    );
}


export default function BudgetDetailTab() {
    const {
        budgetItems,
        accounts,
        monthlyExpenses,
        monthlyIncome,
        selectedYear,
        setSelectedYear,
        saveMonthlyExpense,
        saveMonthlyIncome,
        clearMonthlyExpenseLine,
        fillMonthlyExpenseLine,
        addBudgetItem,
        deleteBudgetItem
    } = useGestionData();

    // Fix: budgetItems is an object { general: [], ... }, not an array
    const budget = {
        general: budgetItems?.general || [],
        special: budgetItems?.special || [],
        menage: budgetItems?.menage || [],
        travaux: budgetItems?.travaux || []
    };
    // Create a flat list for the table
    const allBudgetItems = [
        ...budget.general,
        ...budget.special,
        ...budget.menage,
        ...budget.travaux
    ];

    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '512-CIC');
    const [validationDay, setValidationDay] = useState(28);

    // Modals state
    const [confirmModal, setConfirmModal] = useState({ open: false, itemId: null, itemName: '' });
    const [promptModal, setPromptModal] = useState({ open: false, itemId: null, itemName: '', mode: '' });

    // New Modals
    const [isManageLinesOpen, setIsManageLinesOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Couleurs LEGACY par catégorie
    const getCategoryClass = (cat) => {
        switch (cat) {
            case 'special': return 'text-amber-600';  // Jaune/Orange
            case 'menage': return 'text-purple-600';  // Violet
            case 'travaux': return 'text-red-600';    // Rouge
            default: return 'text-gray-700';           // Noir/Gris
        }
    };

    // Mise à jour d'une dépense mensuelle → Supabase (reçoit le montant directement du BlurInput)
    const handleExpenseUpdate = (itemId, monthIndex, amount) => {
        saveMonthlyExpense(itemId, monthIndex + 1, amount);
    };

    // Effacer une ligne (via modal) → Supabase
    const handleClearLine = (itemId) => {
        clearMonthlyExpenseLine(itemId);
    };

    // Remplir une ligne (via modal) → Supabase
    const handleFillLine = (itemId, mode, value) => {
        const val = parseFloat(value) || 0;
        fillMonthlyExpenseLine(itemId, mode, val);
    };

    // Mise à jour d'une recette mensuelle → Supabase (reçoit le montant directement du BlurInput)
    const handleIncomeUpdate = (monthIndex, field, amount) => {
        const currentData = monthlyIncome[monthIndex] || { calls: 0, reguls: 0, other: 0 };
        const newData = { ...currentData, [field]: amount };
        saveMonthlyIncome(monthIndex + 1, newData);
    };

    // Gestion des Postes
    const handleAddBudgetLine = (data) => {
        addBudgetItem(data);
    };

    const handleDeleteBudgetLine = (id) => {
        deleteBudgetItem(id);
    };

    // Calcul des totaux (utilise les données Supabase)
    const getMonthlyTotals = () => {
        const totals = new Array(12).fill(0);
        allBudgetItems.forEach(item => {
            const data = monthlyExpenses[item.id] || [];
            data.forEach((val, idx) => { totals[idx] += val || 0; });
        });
        return totals;
    };

    const getItemTotal = (itemId) => {
        const data = monthlyExpenses[itemId] || [];
        return data.reduce((sum, val) => sum + (val || 0), 0);
    };

    const monthlyTotals = getMonthlyTotals();


    return (
        <div className="p-4 space-y-4">
            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, itemId: null, itemName: '' })}
                onConfirm={() => handleClearLine(confirmModal.itemId)}
                title="Effacer la ligne"
                message={`Voulez-vous effacer toutes les valeurs de "${confirmModal.itemName}" ?`}
                confirmText="Effacer"
                variant="danger"
            />

            <PromptModal
                isOpen={promptModal.open}
                onClose={() => setPromptModal({ open: false, itemId: null, itemName: '', mode: '' })}
                onSubmit={(val) => handleFillLine(promptModal.itemId, promptModal.mode, val)}
                title={promptModal.mode === 'all' ? 'Remplir tous les mois' : 'Remplir par trimestre'}
                message="Entrez le montant à appliquer :"
                placeholder="0.00"
            />

            <GererPostesModal
                isOpen={isManageLinesOpen}
                onClose={() => setIsManageLinesOpen(false)}
                budget={budget}
                onAdd={handleAddBudgetLine}
                onDelete={handleDeleteBudgetLine}
            />

            <AddQuickLineModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                onAdd={handleAddBudgetLine}
            />

            {/* Toolbar - Header cleaned up */}
            <div className="bg-blue-600 text-white rounded-lg px-4 py-3 flex flex-wrap items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <span className="font-bold">Tableau de Bord Mensuel :</span>
                    <span className="text-blue-200 text-sm hidden md:inline">Génération d'écritures comptables.</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2 md:mt-0">
                    {/* Compte Select */}
                    <div className="flex items-center bg-white rounded-md overflow-hidden h-8">
                        <span className="px-2 text-gray-500 flex items-center h-full bg-gray-50 border-r border-gray-100">🏦</span>
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="text-gray-700 text-sm pl-2 pr-8 border-none bg-white focus:ring-0 cursor-pointer h-full"
                        >
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>

                    {/* Jour */}
                    <div className="flex items-center bg-white rounded-md px-2 h-8">
                        <span className="text-gray-500 text-sm mr-1">Jour</span>
                        <input
                            type="number"
                            value={validationDay}
                            onChange={(e) => setValidationDay(parseInt(e.target.value) || 1)}
                            className="w-10 text-gray-700 font-bold text-center bg-transparent border-none focus:ring-0 p-0"
                        />
                    </div>

                    {/* Générer Dépenses Dropdown - Updated */}
                    <select className="bg-white text-gray-700 text-sm px-3 rounded-md cursor-pointer h-8 border-none focus:ring-0 outline-none">
                        <option value="month">Générer Dépenses pour le Mois</option>
                        <option value="year">Extrapolation vers Budget (x12)</option>
                    </select>

                    {/* Mois */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-white text-gray-700 font-medium text-sm px-3 rounded-md cursor-pointer h-8 border-none focus:ring-0"
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>

                    {/* Année */}
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-16 bg-white text-gray-700 font-bold text-sm px-2 rounded-md text-center h-8 border-none focus:ring-0"
                    />

                    {/* Valider / Effacer Buttons */}
                    <div className="flex items-center gap-2 ml-2 border-l border-blue-400 pl-2">
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-md flex items-center justify-center transition-colors shadow-sm"
                            title="Valider / Sauvegarder"
                            onClick={() => alert('Données sauvegardées')}
                        >
                            <Check size={18} />
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md flex items-center justify-center transition-colors shadow-sm"
                            title="Effacer tout le mois"
                            onClick={() => { if (confirm('Effacer toutes les saisies du mois ?')) console.log('Clear'); }}
                        >
                            <Eraser size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Expenses Table */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                {/* Sub-header */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <span className="text-red-600 font-bold">DÉPENSES PRÉVISIONNELLES (Mensualisées)</span>
                        <button
                            onClick={() => setIsManageLinesOpen(true)}
                            className="text-gray-600 text-xs border border-gray-300 rounded-md px-2 py-1 flex items-center gap-1 hover:bg-gray-100 transition-colors"
                        >
                            <Settings size={12} /> Gérer les Lignes
                        </button>
                    </div>
                    <button
                        onClick={() => setIsQuickAddOpen(true)}
                        className="text-red-500 text-xs border border-red-300 rounded-md px-2 py-1 flex items-center gap-1 hover:bg-red-50 transition-colors"
                    >
                        <Plus size={12} /> Ajouter une ligne rapide
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="sticky left-0 bg-white z-20 px-3 py-2 text-left font-bold text-gray-600 border-r" style={{ width: 60 }}>
                                    Mois
                                </th>
                                {allBudgetItems.map((item, i) => (
                                    <th key={i} className="px-1 text-center relative" style={{ minWidth: 60, height: 100 }}>
                                        {/* Texte en diagonal */}
                                        <div
                                            className={`absolute left-1/2 bottom-7 whitespace-nowrap font-semibold text-xs ${getCategoryClass(item.category)}`}
                                            style={{
                                                transform: 'translateX(-50%) rotate(-45deg)',
                                                transformOrigin: 'center bottom'
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        {/* Actions */}
                                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                                            <button
                                                onClick={() => setPromptModal({ open: true, itemId: item.id, itemName: item.name, mode: 'all' })}
                                                className="text-amber-400 hover:text-amber-600 transition-colors"
                                                title="Remplir tous les mois"
                                            >
                                                <Zap size={12} />
                                            </button>
                                            <button
                                                onClick={() => setPromptModal({ open: true, itemId: item.id, itemName: item.name, mode: 'quarter' })}
                                                className="text-blue-400 hover:text-blue-600 transition-colors"
                                                title="Trimestriel (Jan, Avr, Juil, Oct)"
                                            >
                                                <ListOrdered size={12} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmModal({ open: true, itemId: item.id, itemName: item.name })}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                title="Effacer"
                                            >
                                                <Eraser size={12} />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-2 py-2 bg-gray-100 font-bold text-green-700 text-center border-l sticky right-0 z-10" style={{ minWidth: 55 }}>
                                    TOTAL
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {MONTHS.map((month, mIdx) => (
                                <tr key={mIdx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                    <td className="sticky left-0 bg-white z-10 px-3 py-1.5 border-r font-bold">
                                        <span className="text-blue-600 underline decoration-blue-300 cursor-pointer hover:text-blue-800">{month}</span>
                                    </td>
                                    {allBudgetItems.map((item, i) => {
                                        const val = monthlyExpenses[item.id]?.[mIdx] || 0;
                                        return (
                                            <td key={i} className="px-0.5 py-0.5 text-center">
                                                <BlurInput
                                                    value={val}
                                                    onSave={(amount) => handleExpenseUpdate(item.id, mIdx, amount)}
                                                    className={`w-full max-w-[55px] px-1 py-1 text-center text-xs border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white transition-all ${val ? getCategoryClass(item.category) + ' font-semibold' : 'text-gray-400'}`}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="px-2 py-1.5 text-center font-bold text-green-600 bg-gray-50 border-l sticky right-0 z-10">
                                        {monthlyTotals[mIdx] > 0 ? monthlyTotals[mIdx].toFixed(0) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                <td className="sticky left-0 bg-gray-100 z-10 px-3 py-2 text-gray-700 border-r">TOTAL</td>
                                {allBudgetItems.map((item, i) => {
                                    const total = getItemTotal(item.id);
                                    return (
                                        <td key={i} className="px-1 py-2 text-center text-xs text-gray-600">
                                            {total > 0 ? total.toFixed(0) : '-'}
                                        </td>
                                    );
                                })}
                                <td className="px-2 py-2 text-center font-bold text-green-700 bg-gray-100 border-l sticky right-0 z-10">
                                    {fmtMoney(monthlyTotals.reduce((s, v) => s + v, 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Income / Treasury Section */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <div className="px-4 py-2 border-b bg-gray-50">
                    <span className="text-green-600 font-bold">RECETTES / TRÉSORERIE (Réel & Prévisionnel)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-gray-600 font-semibold" style={{ width: 60 }}>Mois</th>
                                <th className="px-2 py-2 text-center text-blue-600 font-semibold">Appels de Fonds</th>
                                <th className="px-2 py-2 text-center text-purple-600 font-semibold">Régul. Charges</th>
                                <th className="px-2 py-2 text-center text-gray-500 font-semibold">Autres Produits</th>
                                <th className="px-2 py-2 text-center bg-green-50 text-green-700 font-bold">TOTAL RECETTES</th>
                                <th className="px-2 py-2 text-center bg-red-50 text-red-700 font-bold border-x border-gray-200">TOTAL DÉPENSES</th>
                                <th className="px-2 py-2 text-center text-blue-700 font-bold">SOLDE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MONTHS.map((month, mIdx) => {
                                const incomeData = monthlyIncome[mIdx] || { calls: 0, reguls: 0, other: 0 };
                                const totalIncome = (incomeData.calls || 0) + (incomeData.reguls || 0) + (incomeData.other || 0);
                                const totalExpense = monthlyTotals[mIdx];
                                const balance = totalIncome - totalExpense;

                                return (
                                    <tr key={mIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-1.5">
                                            <span className="text-blue-600 font-bold underline decoration-blue-300 cursor-pointer">{month}</span>
                                        </td>
                                        <td className="px-1 py-1">
                                            <BlurInput
                                                value={incomeData.calls}
                                                onSave={(amount) => handleIncomeUpdate(mIdx, 'calls', amount)}
                                                className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="px-1 py-1">
                                            <BlurInput
                                                value={incomeData.reguls}
                                                onSave={(amount) => handleIncomeUpdate(mIdx, 'reguls', amount)}
                                                className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="px-1 py-1">
                                            <BlurInput
                                                value={incomeData.other}
                                                onSave={(amount) => handleIncomeUpdate(mIdx, 'other', amount)}
                                                className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="px-2 py-1.5 text-center font-bold text-green-600 bg-green-50">{totalIncome > 0 ? fmtMoney(totalIncome) : '-'}</td>
                                        <td className="px-2 py-1.5 text-center font-bold text-red-600 bg-red-50 border-x border-gray-200">{totalExpense > 0 ? fmtMoney(totalExpense) : '-'}</td>
                                        <td className={`px-2 py-1.5 text-center font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmtMoney(balance)}</td>
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
