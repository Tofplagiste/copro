/**
 * ParamsTab - Onglet Paramètres (placeholder avec liste copropriétaires)
 */
import { Settings, Users } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';

export default function ParamsTab() {
    const { state } = useCopro();
    const owners = state.owners.filter(o => !o.isCommon);

    return (
        <div className="p-6 space-y-6">
            {/* Titre */}
            <div className="flex items-center gap-3">
                <Settings size={28} className="text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
            </div>

            {/* Liste des copropriétaires */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <Users size={18} className="text-slate-600" />
                    <h3 className="font-bold text-slate-700">Liste des Copropriétaires</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="text-left px-4 py-3">Nom</th>
                                <th className="text-left px-4 py-3">Appartement</th>
                                <th className="text-left px-4 py-3">Lots</th>
                                <th className="text-center px-4 py-3">Tantièmes</th>
                                <th className="text-center px-4 py-3">Exo. Syndic</th>
                                <th className="text-center px-4 py-3">Exo. Ménage</th>
                                <th className="text-left px-4 py-3">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{owner.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{owner.apt}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{owner.lot}</td>
                                    <td className="px-4 py-3 text-center font-mono">{owner.tantiemes}</td>
                                    <td className="px-4 py-3 text-center">
                                        {owner.exoGest ? (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">EXO</span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {owner.exoMen ? (
                                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded font-bold">EXO</span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{owner.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
