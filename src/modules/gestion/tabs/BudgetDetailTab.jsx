/**
 * BudgetDetailTab - Tableau de bord mensuel (Dépenses & Trésorerie) V6
 * Refactorisé pour respecter la limite de 150 lignes
 * Données persistées via Supabase (monthly_expenses, monthly_income)
 */
import { useState } from 'react';
import { useGestionData } from '../context/GestionSupabaseContext';
import { ConfirmModal, PromptModal } from '../../../components/Modal';
import GererPostesModal from '../components/budget/GererPostesModal';
import AddQuickLineModal from '../components/budget/AddQuickLineModal';
import BudgetToolbar from '../components/budget/BudgetToolbar';
import ExpensesTable from '../components/budget/ExpensesTable';
import IncomeTable from '../components/budget/IncomeTable';

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

    // Flatten budget items
    const allBudgetItems = [
        ...(budgetItems?.general || []),
        ...(budgetItems?.special || []),
        ...(budgetItems?.menage || []),
        ...(budgetItems?.travaux || [])
    ];

    // Local state
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '512-CIC');
    const [validationDay, setValidationDay] = useState(28);

    // Modals state
    const [confirmModal, setConfirmModal] = useState({ open: false, itemId: null, itemName: '' });
    const [promptModal, setPromptModal] = useState({ open: false, itemId: null, itemName: '', mode: '' });
    const [isManageLinesOpen, setIsManageLinesOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Category colors
    const getCategoryClass = (cat) => {
        switch (cat) {
            case 'special': return 'text-amber-600';
            case 'menage': return 'text-purple-600';
            case 'travaux': return 'text-red-600';
            default: return 'text-gray-700';
        }
    };

    // Handlers
    const handleExpenseUpdate = (itemId, monthIndex, amount) => {
        saveMonthlyExpense(itemId, monthIndex + 1, amount);
    };

    const handleClearLine = (itemId) => clearMonthlyExpenseLine(itemId);

    const handleFillLine = (itemId, mode, value) => {
        fillMonthlyExpenseLine(itemId, mode, parseFloat(value) || 0);
    };

    const handleIncomeUpdate = (monthIndex, field, amount) => {
        const currentData = monthlyIncome[monthIndex] || { calls: 0, reguls: 0, other: 0 };
        saveMonthlyIncome(monthIndex + 1, { ...currentData, [field]: amount });
    };

    // Totals calculation
    const monthlyTotals = (() => {
        const totals = new Array(12).fill(0);
        allBudgetItems.forEach(item => {
            (monthlyExpenses[item.id] || []).forEach((val, idx) => { totals[idx] += val || 0; });
        });
        return totals;
    })();

    const getItemTotal = (itemId) => (monthlyExpenses[itemId] || []).reduce((s, v) => s + (v || 0), 0);

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
                budget={budgetItems}
                onAdd={addBudgetItem}
                onDelete={deleteBudgetItem}
            />
            <AddQuickLineModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                onAdd={addBudgetItem}
            />

            {/* Toolbar */}
            <BudgetToolbar
                accounts={accounts}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                validationDay={validationDay}
                setValidationDay={setValidationDay}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
            />

            {/* Expenses Table */}
            <ExpensesTable
                budgetItems={allBudgetItems}
                monthlyExpenses={monthlyExpenses}
                monthlyTotals={monthlyTotals}
                getCategoryClass={getCategoryClass}
                getItemTotal={getItemTotal}
                onExpenseUpdate={handleExpenseUpdate}
                onOpenPrompt={(data) => setPromptModal({ open: true, ...data })}
                onOpenConfirm={(data) => setConfirmModal({ open: true, ...data })}
                onOpenManageLines={() => setIsManageLinesOpen(true)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />

            {/* Income Table */}
            <IncomeTable
                monthlyIncome={monthlyIncome}
                monthlyTotals={monthlyTotals}
                onIncomeUpdate={handleIncomeUpdate}
            />
        </div>
    );
}
