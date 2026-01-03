/**
 * ParamsTab - Onglet Paramètres
 * Inclut sauvegarde/chargement JSON
 */
import { useMemo } from 'react';
import { Settings, Users } from 'lucide-react';
import { useGestionData } from '../context/GestionSupabaseContext';
import BankAccountsPanel from '../components/params/BankAccountsPanel';
import ClosingPanel from '../components/params/ClosingPanel';
import PostesComptablesPanel from '../components/params/PostesComptablesPanel';

export default function ParamsTab() {
    const { owners: rawOwners, lots } = useGestionData();

    // Map owners with lot display from lot_ids
    const owners = useMemo(() => {
        if (!rawOwners) return [];
        return rawOwners
            .filter(o => !o.isCommon && o.name !== 'COMMUN (Général)')
            .map(o => {
                const ownerLots = (o.lot_ids || [])
                    .map(lid => (lots || []).find(l => l.id === lid))
                    .filter(Boolean);
                const totalTantiemes = ownerLots.reduce((sum, l) => sum + (l.tantiemes || 0), 0);
                const lotDisplay = ownerLots.map(l => `Lot ${l.numero}`).join(', ') || '-';
                return {
                    ...o,
                    lot: lotDisplay,
                    tantiemes: totalTantiemes,
                    exoGest: o.exo_gest,
                    exoMen: o.exo_men,
                    email: o.email,
                    phone: o.phone
                };
            });
    }, [rawOwners, lots]);


    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
            {/* Header - Centré */}
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Paramètres</h2>
                        <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Gestion de la copropriété et configuration</p>
                    </div>
                </div>
            </div>



            {/* Section: Copropriétaires */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4 flex items-center gap-3">
                    <Users size={20} className="text-white" />
                    <h3 className="font-bold text-white">Liste des Copropriétaires</h3>
                    <span className="ml-auto bg-white/20 px-2.5 py-0.5 rounded-full text-xs text-white font-medium">
                        {owners.length} copropriétaires
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="text-left px-5 py-3.5">Nom</th>
                                <th className="text-left px-4 py-3.5">Lots</th>
                                <th className="text-center px-4 py-3.5">Tantièmes</th>
                                <th className="text-center px-4 py-3.5">Exonérations</th>
                                <th className="text-left px-4 py-3.5">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="font-semibold text-slate-800">{owner.name}</div>
                                        <div className="text-xs text-slate-400">{owner.apt}</div>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate" title={owner.lot}>
                                        {owner.lot}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                                            {owner.tantiemes}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            {owner.exoGest && (
                                                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm" title="Exo Syndic">
                                                    Syndic
                                                </span>
                                            )}
                                            {owner.exoMen && (
                                                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm" title="Exo Ménage">
                                                    Ménage
                                                </span>
                                            )}
                                            {!owner.exoGest && !owner.exoMen && (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-500 text-xs truncate max-w-[180px]" title={owner.email}>
                                        <a href={`mailto:${owner.email}`} className="hover:text-blue-600 transition-colors">
                                            {owner.email}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grid: Configuration panels - 3 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <ClosingPanel />
                <BankAccountsPanel />
                <PostesComptablesPanel />
            </div>
        </div>
    );
}
