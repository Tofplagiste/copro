/**
 * CarnetApp - Application Carnet de Copropriété
 * Migré depuis Gestion_Copro_Complet.html
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Calculator, Users, Briefcase, Map, Save, FileText } from 'lucide-react';
import { CarnetProvider, useCarnet } from '../../context/CarnetContext';
import { CARNET_TABS } from '../../data/carnetState';
import { setupPDF, addHeader, addSectionIdx, addFooter, checkPageBreak } from '../../utils/pdfUtils';
import { autoTable } from 'jspdf-autotable';

// Import sub-tabs
import CarnetInfoTab from './tabs/CarnetInfoTab';
import RepartitionTab from './tabs/RepartitionTab';
import AnnuaireTab from './tabs/AnnuaireTab';
import PrestatairesTab from './tabs/PrestatairesTab';

const ICONS = { Book, Calculator, Users, Briefcase, Map };

function CarnetContent() {
    const { state } = useCarnet();
    const [activeTab, setActiveTab] = useState(CARNET_TABS[0].id);

    const renderTab = () => {
        switch (activeTab) {
            case 'carnet': return <CarnetInfoTab />;
            case 'repartition': return <RepartitionTab />;
            case 'annuaire': return <AnnuaireTab />;
            case 'prestataires': return <PrestatairesTab />;
            case 'plan': return <PlanPlaceholder />;
            default: return <CarnetInfoTab />;
        }
    };

    const handleExportPDF = () => {
        const doc = setupPDF();
        let y = addHeader(doc, "CARNET D'ENTRETIEN");

        // --- I. IDENTIFICATION ---
        y = addSectionIdx(doc, "IDENTIFICATION", y, "I");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Adresse :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("7-9 rue André Leroux, 33780 Soulac-sur-Mer", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Syndic :", 110, y);
        doc.setFont("helvetica", "normal");
        doc.text("Mr LE MERLE Christophe 7 rue André Leroux 06 17 25 02 66", 130, y);

        y += 7;

        doc.setFont("helvetica", "bold");
        doc.text("Règlement :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("29 septembre 2009 - Notaire: S.C.P Michel MARTIN (Ref: 52-531)", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Composition :", 110, y);
        doc.setFont("helvetica", "normal");
        doc.text("21 (14 Principaux, 7 Celliers)", 135, y);

        y += 15;

        // --- II. ADMINISTRATION & FINANCES ---
        y = addSectionIdx(doc, "ADMINISTRATION & FINANCES", y, "II");

        doc.setFontSize(9);
        doc.text("AG Nomination : 17 décembre 2025", 15, y);
        doc.text("Mandat : 31 décembre 2026", 110, y);
        y += 7;
        doc.text("Trésorerie : 1 555.50€ / trimestre", 15, y);
        doc.text("Fonds Travaux : 13 487.27€ (Loi ALUR)", 110, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("Conseil Syndical :", 15, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text("Mme Tropamer Véronique", 15, y); y += 4;
        doc.text("Mme Béliard Véronique", 15, y); y += 4;
        doc.text("M. Sibrac Vincent", 15, y);

        y += 10;

        // --- III. DONNÉES TECHNIQUES ---
        y = addSectionIdx(doc, "DONNÉES TECHNIQUES", y, "III");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Construction :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("Avant 1900 (Pierre / Brique / Bois)", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Toiture :", 110, y);
        doc.setFont("helvetica", "normal");
        doc.text("Tuile Marseille et Romane", 130, y);
        y += 7;

        doc.setFont("helvetica", "bold");
        doc.text("Chauffage :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("Individuel (Chauffage + Eau Chaude)", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Compteurs :", 110, y);
        doc.setFont("helvetica", "normal");
        doc.text("Eau (Cour), Linky (Indiv/Commun)", 130, y);

        y += 15;

        // --- IV. CONTRATS EN COURS ---
        y = addSectionIdx(doc, "CONTRATS EN COURS", y, "IV");

        // Récupérer les prestataires depuis le state si possible, sinon utiliser dummy data pour matcher l'image
        const prestataires = state?.prestataires || [];

        if (prestataires.length > 0) {
            prestataires.forEach(p => {
                y = checkPageBreak(doc, y);
                doc.setFont("helvetica", "bold");
                doc.text(`• ${p.name}`, 15, y);
                doc.setFont("helvetica", "normal");
                if (p.contrat) doc.text(` - Contrat: ${p.contrat}`, 15 + doc.getTextWidth(`• ${p.name}`), y);

                y += 4;
                doc.setFontSize(8);
                doc.setTextColor(80);
                if (p.address) {
                    doc.text(`${p.address}`, 18, y);
                    y += 3.5;
                }
                const phones = p.phones?.join(' / ') || "";
                if (phones) {
                    doc.text(`Tél: ${phones}`, 18, y);
                    y += 3.5;
                }
                const emails = p.emails?.join(' / ') || "";
                if (emails) {
                    doc.text(`Email: ${emails}`, 18, y);
                    y += 3.5;
                }

                y += 2; // Espace entre items
                doc.setFontSize(9);
                doc.setTextColor(0);
            });
        } else {
            doc.setFont("helvetica", "italic");
            doc.text("Aucun contrat enregistré.", 15, y);
            y += 10;
        }

        y += 5;

        // --- V. DIAGNOSTICS ---
        y = checkPageBreak(doc, y);
        y = addSectionIdx(doc, "DIAGNOSTICS", y, "V");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Amiante (2009) :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("Négatif (sauf conduit combles) - 16/09/2009", 50, y);
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Plomb (2009) :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("RAS - 16/09/2009", 50, y);
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Termites (2009) :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text("Contrôlé - 16/09/2009", 50, y);

        y += 15;

        // --- VI. TRAVAUX ---
        y = checkPageBreak(doc, y);
        y = addSectionIdx(doc, "HISTORIQUE DES TRAVAUX IMPORTANTS", y, "VI");

        const travaux = state?.travaux || []; // A adapter selon structure réelle
        // Si vide, on met un tableau vide ou un msg

        // Mock data si pas de travaux dans le state pour l'exemple
        const tableBody = travaux.length > 0 ? travaux.map(t => [t.annee, t.nature, t.entreprise]) : [
            ['2025', 'Réfection totale du portillon cour', 'Fait par REPT'],
            ['2024', 'Toiture (60 tuiles + faitage)', 'Boudassou Stéphane'],
            ['2022', 'Peinture Porte d\'entrée', 'Une Pointe de Couleurs']
        ];

        autoTable(doc, {
            startY: y,
            head: [['Année', 'Nature', 'Entreprise']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0, lineWidth: 0.1 },
            styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1, textColor: 0 },
            columnStyles: {
                0: { cellWidth: 20, fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 60 }
            }
        });

        addFooter(doc);
        doc.save("Carnet_Entretien_Complet.pdf");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-slate-700 text-white sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Hub</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Book size={24} />
                            <div>
                                <h1 className="font-bold text-lg hidden sm:block">Copro Les Pyrénées</h1>
                                <h1 className="font-bold text-lg sm:hidden">Copro</h1>
                                <p className="text-slate-300 text-xs hidden sm:block">Carnet d'Entretien</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Button removed as requested */}
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex overflow-x-auto bg-slate-800 no-scrollbar">
                    {CARNET_TABS.map(tab => {
                        const Icon = ICONS[tab.icon] || Book;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex-1 min-w-[100px] flex flex-col items-center gap-1 px-4 py-3 text-sm font-medium 
                  border-b-3 transition-colors shrink-0
                  ${activeTab === tab.id
                                        ? 'text-white border-b-2 border-emerald-400 bg-slate-700/50'
                                        : 'text-slate-400 hover:text-white border-b-2 border-transparent'}
                `}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </header>

            {/* Content */}
            <main className="animate-fadeIn">
                {renderTab()}
            </main>
        </div>
    );
}

function PlanPlaceholder() {
    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <Map size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Plan de l'Immeuble</h3>
                <p className="text-slate-500">Module en cours de développement</p>
            </div>
        </div>
    );
}

export default function CarnetApp() {
    return (
        <CarnetProvider>
            <CarnetContent />
        </CarnetProvider>
    );
}
