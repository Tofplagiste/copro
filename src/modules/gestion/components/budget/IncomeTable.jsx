/**
 * IncomeTable - Tableau des recettes / trésorerie
 * Extrait de BudgetDetailTab pour respecter la limite de 150 lignes
 */
import { fmtMoney } from '../../../../utils/formatters';
import BlurInput from '../../../../components/BlurInput';

const MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/**
 * @param {Object} props
 * @param {Object} props.monthlyIncome - Données des recettes par mois
 * @param {Array} props.monthlyTotals - Totaux dépenses par mois
 * @param {Function} props.onIncomeUpdate - (monthIdx, field, amount) => void
 */
export default function IncomeTable({ monthlyIncome, monthlyTotals, onIncomeUpdate }) {
    return (
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
                                            onSave={(amount) => onIncomeUpdate(mIdx, 'calls', amount)}
                                            className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-1 py-1">
                                        <BlurInput
                                            value={incomeData.reguls}
                                            onSave={(amount) => onIncomeUpdate(mIdx, 'reguls', amount)}
                                            className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-1 py-1">
                                        <BlurInput
                                            value={incomeData.other}
                                            onSave={(amount) => onIncomeUpdate(mIdx, 'other', amount)}
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
    );
}
