/**
 * ExpensesTable - Tableau des dépenses prévisionnelles mensuelles
 * Extrait de BudgetDetailTab pour respecter la limite de 150 lignes
 */
import { Zap, ListOrdered, Eraser, Plus, Settings } from 'lucide-react';
import { fmtMoney } from '../../../../utils/formatters';
import BlurInput from '../../../../components/BlurInput';

const MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/**
 * @param {Object} props
 * @param {Array} props.budgetItems - Liste des postes budgétaires
 * @param {Object} props.monthlyExpenses - Données des dépenses par item/mois
 * @param {Array} props.monthlyTotals - Totaux par mois
 * @param {Function} props.getCategoryClass - (cat) => className
 * @param {Function} props.getItemTotal - (itemId) => number
 * @param {Function} props.onExpenseUpdate - (itemId, monthIdx, amount) => void
 * @param {Function} props.onOpenPrompt - ({ itemId, itemName, mode }) => void
 * @param {Function} props.onOpenConfirm - ({ itemId, itemName }) => void
 * @param {Function} props.onOpenManageLines - () => void
 * @param {Function} props.onOpenQuickAdd - () => void
 */
export default function ExpensesTable({
    budgetItems,
    monthlyExpenses,
    monthlyTotals,
    getCategoryClass,
    getItemTotal,
    onExpenseUpdate,
    onOpenPrompt,
    onOpenConfirm,
    onOpenManageLines,
    onOpenQuickAdd
}) {
    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <span className="text-red-600 font-bold">DÉPENSES PRÉVISIONNELLES (Mensualisées)</span>
                    <button
                        onClick={onOpenManageLines}
                        className="text-gray-600 text-xs border border-gray-300 rounded-md px-2 py-1 flex items-center gap-1 hover:bg-gray-100 transition-colors"
                    >
                        <Settings size={12} /> Gérer les Lignes
                    </button>
                </div>
                <button
                    onClick={onOpenQuickAdd}
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
                            {budgetItems.map((item, i) => (
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
                                            onClick={() => onOpenPrompt({ itemId: item.id, itemName: item.name, mode: 'all' })}
                                            className="text-amber-400 hover:text-amber-600 transition-colors"
                                            title="Remplir tous les mois"
                                        >
                                            <Zap size={12} />
                                        </button>
                                        <button
                                            onClick={() => onOpenPrompt({ itemId: item.id, itemName: item.name, mode: 'quarter' })}
                                            className="text-blue-400 hover:text-blue-600 transition-colors"
                                            title="Trimestriel (Jan, Avr, Juil, Oct)"
                                        >
                                            <ListOrdered size={12} />
                                        </button>
                                        <button
                                            onClick={() => onOpenConfirm({ itemId: item.id, itemName: item.name })}
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
                                {budgetItems.map((item, i) => {
                                    const val = monthlyExpenses[item.id]?.[mIdx] || 0;
                                    return (
                                        <td key={i} className="px-0.5 py-0.5 text-center">
                                            <BlurInput
                                                value={val}
                                                onSave={(amount) => onExpenseUpdate(item.id, mIdx, amount)}
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
                            {budgetItems.map((item, i) => {
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
    );
}
