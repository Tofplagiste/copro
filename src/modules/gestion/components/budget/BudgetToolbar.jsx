/**
 * BudgetToolbar - Barre d'outils du tableau de bord mensuel
 * Extrait de BudgetDetailTab pour respecter la limite de 150 lignes
 */
import { Check, Eraser } from 'lucide-react';

const MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/**
 * @param {Object} props
 * @param {Array} props.accounts - Liste des comptes bancaires
 * @param {string} props.selectedAccount - ID du compte sélectionné
 * @param {Function} props.setSelectedAccount
 * @param {number} props.validationDay
 * @param {Function} props.setValidationDay
 * @param {number} props.selectedMonth
 * @param {Function} props.setSelectedMonth
 * @param {number} props.selectedYear
 * @param {Function} props.setSelectedYear
 */
export default function BudgetToolbar({
    accounts,
    selectedAccount,
    setSelectedAccount,
    validationDay,
    setValidationDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear
}) {
    return (
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

                {/* Générer Dépenses Dropdown */}
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
    );
}
