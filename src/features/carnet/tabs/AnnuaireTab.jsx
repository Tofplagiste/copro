/**
 * AnnuaireTab - Annuaire des copropriétaires avec contacts
 */
import { Phone, Mail, MapPin, Download } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';

export default function AnnuaireTab() {
    const { state } = useCarnet();
    const proprietaires = state.proprietaires || [];

    return (
        <div className="p-4">
            {/* Actions */}
            <div className="flex justify-end mb-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors">
                    <Download size={18} />
                    Imprimer
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                                <th className="px-4 py-3 text-left font-semibold">Contacts (Tél / Email)</th>
                                <th className="px-4 py-3 text-left font-semibold">Adresse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proprietaires.map(proprio => (
                                <tr key={proprio.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-slate-800">{proprio.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {proprio.phone && (
                                                <a
                                                    href={`tel:${proprio.phone}`}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Phone size={14} />
                                                    {proprio.phone}
                                                </a>
                                            )}
                                            {proprio.email && (
                                                <a
                                                    href={`mailto:${proprio.email}`}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Mail size={14} />
                                                    {proprio.email}
                                                </a>
                                            )}
                                            {!proprio.phone && !proprio.email && (
                                                <span className="text-slate-400 italic">Aucun contact</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {proprio.address ? (
                                            <div className="flex items-start gap-2 text-slate-600">
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                <span>{proprio.address}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
