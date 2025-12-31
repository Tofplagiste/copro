/**
 * ParamsTab - Onglet Paramètres
 * Inclut sauvegarde/chargement JSON et génération PDF centralisée
 */
import { useRef } from 'react';
import { Settings, Users, Mail, Download, Upload, Save, FileJson } from 'lucide-react';
import { useCopro } from '../../../context/CoproContext';
import { useToast } from '../../../components/ToastProvider';
import { generateOwnerSheetPDF, savePDF } from '../../../utils/pdfExport';
import BankAccountsPanel from '../components/params/BankAccountsPanel';
import ClosingPanel from '../components/params/ClosingPanel';
import PostesComptablesPanel from '../components/params/PostesComptablesPanel';

export default function ParamsTab() {
    const { state, updateState } = useCopro();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const owners = state.owners.filter(o => !o.isCommon);

    // =====================================================
    // SAUVEGARDE / CHARGEMENT JSON
    // =====================================================

    /**
     * Télécharge le state complet en JSON
     */
    const handleSaveData = () => {
        try {
            const dataStr = JSON.stringify(state, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `copro_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Données sauvegardées avec succès !');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    /**
     * Charge un fichier JSON et remplace le state
     */
    const handleLoadData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);
                // Validation basique
                if (!loadedData.owners || !loadedData.budget) {
                    throw new Error('Format de fichier invalide');
                }
                updateState(loadedData);
                toast.success('Données chargées avec succès !');
            } catch (error) {
                console.error('Erreur chargement:', error);
                toast.error('Erreur: fichier invalide ou corrompu');
            }
        };
        reader.readAsText(file);
        // Reset input pour permettre de recharger le même fichier
        event.target.value = '';
    };

    // =====================================================
    // GÉNÉRATION PDF (centralisée)
    // =====================================================

    const handleDownload = (owner) => {
        const doc = generateOwnerSheetPDF(owner);
        savePDF(doc, `Fiche_${owner.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleMailing = (owner) => {
        const subject = encodeURIComponent("Information Copropriété Les Pyrénées");
        const body = encodeURIComponent(`Bonjour ${owner.name},\n\nVoici les informations concernant votre lot...\n\nCordialement,\nLe Syndic Bénévole`);
        window.open(`mailto:${owner.email}?subject=${subject}&body=${body}`);
    };

    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
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

            {/* Section: Sauvegarde / Chargement - NOUVEAU */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-4 flex items-center gap-3">
                    <FileJson size={20} className="text-white" />
                    <h3 className="font-bold text-white">Sauvegarde des Données</h3>
                </div>
                <div className="p-5 flex flex-wrap gap-4 items-center">
                    <button
                        onClick={handleSaveData}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Save size={18} />
                        Sauvegarder mes données
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleLoadData}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Upload size={18} />
                        Charger une sauvegarde
                    </button>

                    <p className="text-sm text-gray-500 flex-1">
                        💡 La sauvegarde inclut tous vos propriétaires, budgets, relevés d'eau et paramètres.
                    </p>
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
                                <th className="text-center px-4 py-3.5 w-28">Actions</th>
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
                                    <td className="px-4 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleMailing(owner)}
                                                className="w-8 h-8 flex items-center justify-center text-amber-500 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-all"
                                                title="Envoyer un mail"
                                            >
                                                <Mail size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(owner)}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all"
                                                title="Télécharger fiche PDF"
                                            >
                                                <Download size={15} />
                                            </button>
                                        </div>
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
