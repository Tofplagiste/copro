

/**
 * ParamsTab - Onglet Paramètres (Complet)
 */
import { Settings, Users, Mail, Download } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BankAccountsPanel from './BankAccountsPanel';
import ClosingPanel from './ClosingPanel';

export default function ParamsTab() {
    const { state } = useCopro();
    const owners = state.owners.filter(o => !o.isCommon);

    // Fonction de génération PDF pour un copropriétaire
    const handleDownload = (owner) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Fiche Copropriétaire : ${owner.name}`, 14, 20);

        doc.setFontSize(12);
        doc.text(`Appartement : ${owner.apt}`, 14, 30);
        doc.text(`Email : ${owner.email}`, 14, 38);
        doc.text(`Lots : ${owner.lot}`, 14, 46);
        doc.text(`Tantièmes : ${owner.tantiemes} / 1000`, 14, 54);

        doc.autoTable({
            startY: 65,
            head: [['Propriété', 'Valeur']],
            body: [
                ['Exonération Syndic', owner.exoGest ? 'OUI' : 'NON'],
                ['Exonération Ménage', owner.exoMen ? 'OUI' : 'NON'],
                ['Compteur individuel', owner.hasMeter ? 'OUI' : 'NON'],
            ],
        });

        doc.save(`Fiche_${owner.name.replace(/\s+/g, '_')}.pdf`);
    };

    // Fonction d'envoi de mail
    const handleMailing = (owner) => {
        const subject = encodeURIComponent("Information Copropriété Les Pyrénées");
        const body = encodeURIComponent(`Bonjour ${owner.name},\n\nVoici les informations concernant votre lot...\n\nCordialement,\nLe Syndic Bénévole`);
        window.open(`mailto:${owner.email}?subject=${subject}&body=${body}`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Titre */}
            <div className="flex items-center gap-3">
                <Settings size={28} className="text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLONNE GAUCHE : Liste des copropriétaires (prend 2/3 largeur sur grand écran) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                    <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                        <Users size={18} className="text-slate-600" />
                        <h3 className="font-bold text-slate-700">Liste des Copropriétaires</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="text-left px-4 py-3">Nom</th>
                                    <th className="text-left px-4 py-3">Lots</th>
                                    <th className="text-center px-4 py-3">Tantièmes</th>
                                    <th className="text-center px-4 py-3">Exo.</th>
                                    <th className="text-left px-4 py-3">Email</th>
                                    <th className="text-center px-4 py-3 w-24">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {owners.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800">{owner.name}</div>
                                            <div className="text-xs text-slate-500">{owner.apt}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate" title={owner.lot}>
                                            {owner.lot}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono">{owner.tantiemes}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                {owner.exoGest && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded" title="Exo Syndic">SYN</span>}
                                                {owner.exoMen && <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded" title="Exo Ménage">MEN</span>}
                                                {!owner.exoGest && !owner.exoMen && <span className="text-gray-300">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]" title={owner.email}>
                                            {owner.email}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleMailing(owner)}
                                                    className="p-1.5 text-amber-500 bg-white border border-amber-500 rounded hover:bg-amber-50 transition-colors"
                                                    title="Envoyer un mail">
                                                    <Mail size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(owner)}
                                                    className="p-1.5 text-red-500 bg-white border border-red-500 rounded hover:bg-red-50 transition-colors"
                                                    title="Télécharger fiche PDF">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* COLONNE DROITE : Outils et Paramètres */}
                <div className="space-y-6">
                    {/* Panel Clôture */}
                    <ClosingPanel />

                    {/* Panel Comptes Bancaires */}
                    <BankAccountsPanel />
                </div>

            </div>
        </div>
    );
}
