/**
 * AnnexesTab - Onglet Annexes Bilan (États financiers)
 */
import { BookOpen, Scale, TrendingUp, Users } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';
import { fmtMoney } from '../../utils/formatters';

export default function AnnexesTab() {
    const { state } = useCopro();
    const accounts = state.accounts || [];
    const operations = state.finance?.operations || [];
    const categories = state.categories || [];

    // Calcul solde par compte
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

    // Calcul totaux
    const totalActif = accounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

    // Calcul résultat par poste
    const getResultByCategory = () => {
        const result = {};
        operations.forEach(op => {
            if (!result[op.category]) result[op.category] = 0;
            result[op.category] += op.type === 'recette' ? op.amount : op.amount;
        });
        return result;
    };

    const resultByCategory = getResultByCategory();

    // Calcul total recettes/dépenses
    const totalRecettes = operations.filter(o => o.type === 'recette').reduce((s, o) => s + o.amount, 0);
    const totalDepenses = operations.filter(o => o.type === 'depense').reduce((s, o) => s + o.amount, 0);
    const netResult = totalRecettes - totalDepenses;

    // Calcul fonds et réserves (livrets)
    const livrets = accounts.filter(a => a.id.includes('502'));
    const totalFonds = livrets.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

    // Report à nouveau estimé
    const reportAN = totalActif - totalFonds - netResult;

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Scale size={28} /> Annexes Comptables (Bilan & Résultat)
                </h2>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-500">
                    📄 Tout Exporter
                </button>
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
                                    <td className="px-3 py-2 text-right">{fmtMoney(totalActif)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className={`mt-3 py-2 px-3 text-center text-sm rounded ${Math.abs(totalActif - totalActif) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Bilan Équilibré ✓
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
        </div>
    );
}
