/**
 * CreditApp - Simulateur de Crédit Copropriété
 * Migré depuis credit gemini.html
 */
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, FileText, Users, Settings, CreditCard, Percent, PiggyBank, Euro, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Données copropriétaires
const COPROPRIETAIRES = [
    { id: 1, nom: 'SALAHUN Yves', commune: 'ST EMILION', lot: 'Apt 16', tantiemes: 37, aCellier: false, aBalcon: true, grandBalcon: true, tantCellier: 0 },
    { id: 2, nom: 'PALMARO', commune: 'MARGAUX', lot: 'Apt 15', tantiemes: 38, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 6, tantCellier: 3 },
    { id: 3, nom: 'DESSALES / GABRIEL Thomas', commune: 'ST CROIX DU MONT', lot: 'Apt 14', tantiemes: 59, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 5, tantCellier: 3 },
    { id: 4, nom: 'TROPAMER Véronique', commune: 'ENTRE 2 MERS', lot: 'LC Apt 2', tantiemes: 66, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 },
    { id: 5, nom: 'PIRAS Eric', commune: 'PAUILLAC', lot: 'Apt 20', tantiemes: 66, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 4, tantCellier: 3 },
    { id: 6, nom: 'SCI du Clot', commune: 'LISTRAC', lot: 'Apt 17', tantiemes: 84, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 7, tantCellier: 2 },
    { id: 7, nom: 'LE MERLE Christophe', commune: 'MOULIS', lot: 'Apt 18', tantiemes: 93, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 3, tantCellier: 3 },
    { id: 8, nom: 'BELLIARD Véronique', commune: 'ST ESTEPHE', lot: 'Apt 12/13', tantiemes: 102, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 },
    { id: 9, nom: 'CARSOULE', commune: 'SAUTERNE', lot: 'Apt 1 & 21', tantiemes: 113, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 9, tantCellier: 4 },
    { id: 10, nom: 'IDEALAMBARD SAS', commune: 'POMEROL', lot: 'Apt 19', tantiemes: 121, aCellier: true, aBalcon: true, grandBalcon: false, cellier: 8, tantCellier: 4 },
    { id: 11, nom: 'CAUPENE Corinne', commune: 'LIBRAIRIE', lot: 'LC 10/11', tantiemes: 199, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 }
];

const TOTAL_TANTIEMES = 1000;
const TOTAL_TANTIEMES_CELLIERS = 22;

// Card component
function StatCard({ icon: Icon, label, value, color = 'blue' }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600',
        cyan: 'from-cyan-500 to-cyan-600',
        pink: 'from-pink-500 to-pink-600'
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <Icon size={16} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

function formatMoney(num) {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

export default function CreditApp() {
    // Paramètres crédit
    const [duree, setDuree] = useState(120);
    const [tauxNominal, setTauxNominal] = useState(3.5);
    const [tauxAssurance, setTauxAssurance] = useState(0.36);
    const [fondsTravaux, setFondsTravaux] = useState(0);

    // Montants travaux
    const [partiesCommunes, setPartiesCommunes] = useState(0);
    const [grandBalcon, setGrandBalcon] = useState(0);
    const [petitsBalcons, setPetitsBalcons] = useState(0);
    const [celliers, setCelliers] = useState(0);

    // Copropriétaires avec apports
    const [copros, setCopros] = useState(
        COPROPRIETAIRES.map(c => ({ ...c, apportPersonnel: 0, paiementComptant: false }))
    );

    const montantTotal = partiesCommunes + grandBalcon + petitsBalcons + celliers;

    // Calcul mensualité
    const calculerMensualite = (capital, dur, tauxNom, tauxAss) => {
        if (capital <= 0) return 0;
        const tauxMensuel = tauxNom / 100 / 12;
        const tauxAssuranceMensuel = tauxAss / 100 / 12;

        if (tauxMensuel === 0) {
            return capital / dur + capital * tauxAssuranceMensuel;
        }

        const mensualiteHorsAssurance = capital * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dur)));
        const assurance = capital * tauxAssuranceMensuel;

        return mensualiteHorsAssurance + assurance;
    };

    // Répartition calculée
    const repartition = useMemo(() => {
        const coprosAvecGrandBalcon = copros.filter(c => c.grandBalcon);
        const totalTantiemesGrandBalcon = coprosAvecGrandBalcon.reduce((sum, c) => sum + c.tantiemes, 0);
        const coprosAvecPetitBalcon = copros.filter(c => c.aBalcon && !c.grandBalcon);
        const nbPetitsBalcons = coprosAvecPetitBalcon.length;

        return copros.map(copro => {
            const totalTantiemesLot = copro.tantiemes + copro.tantCellier;
            const quotiteCommunes = totalTantiemesLot / TOTAL_TANTIEMES;
            const partCommunes = partiesCommunes * quotiteCommunes;

            let partBalcon = 0;
            if (copro.grandBalcon) {
                const quotiteGrandBalcon = copro.tantiemes / totalTantiemesGrandBalcon;
                partBalcon = grandBalcon * quotiteGrandBalcon;
            } else if (copro.aBalcon && !copro.grandBalcon) {
                partBalcon = nbPetitsBalcons > 0 ? petitsBalcons / nbPetitsBalcons : 0;
            }

            const quotiteCellier = copro.aCellier ? copro.tantCellier / TOTAL_TANTIEMES_CELLIERS : 0;
            const partCellier = copro.aCellier ? celliers * quotiteCellier : 0;

            const totalPart = partCommunes + partBalcon + partCellier;
            const partFondsTravaux = montantTotal > 0 ? (totalPart / montantTotal) * fondsTravaux : 0;
            const montantApresFonds = totalPart - partFondsTravaux;
            const apportUtilise = Math.min(copro.apportPersonnel, montantApresFonds);
            const montantAFinancer = Math.max(0, montantApresFonds - apportUtilise);
            const mensualite = copro.paiementComptant ? 0 : calculerMensualite(montantAFinancer, duree, tauxNominal, tauxAssurance);

            return {
                ...copro,
                partCommunes,
                partBalcon,
                partCellier,
                totalPart,
                partFondsTravaux,
                apportUtilise,
                montantAFinancer,
                mensualite
            };
        });
    }, [copros, partiesCommunes, grandBalcon, petitsBalcons, celliers, fondsTravaux, duree, tauxNominal, tauxAssurance, montantTotal]);

    // Calculs globaux
    const totaux = useMemo(() => {
        const totalApports = repartition.reduce((s, c) => s + c.apportUtilise, 0);
        const montantFinance = repartition.filter(c => !c.paiementComptant).reduce((s, c) => s + c.montantAFinancer, 0);

        const tauxMensuel = tauxNominal / 100 / 12;
        const tauxAssuranceMensuel = tauxAssurance / 100 / 12;

        let interetsTEG = 0;
        if (montantFinance > 0 && tauxMensuel > 0) {
            const mensualiteHorsAssurance = montantFinance * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -duree)));
            const totalRembourse = mensualiteHorsAssurance * duree;
            interetsTEG = totalRembourse - montantFinance;
        }

        const coutAssurance = montantFinance * tauxAssuranceMensuel * duree;
        const coutTotal = montantFinance + interetsTEG + coutAssurance;
        const surprix = interetsTEG + coutAssurance;

        return {
            montantTotal,
            fondsTravaux,
            totalApports,
            montantFinance,
            coutTotal,
            interetsTEG,
            coutAssurance,
            surprix
        };
    }, [repartition, tauxNominal, tauxAssurance, duree, montantTotal, fondsTravaux]);

    const updateCopro = (id, field, value) => {
        setCopros(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    // Export PDF simulation crédit
    const exportPDF = () => {
        const doc = new jsPDF('landscape');

        // En-tête
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('SIMULATION CRÉDIT COPROPRIÉTÉ', 148, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('9 Rue André Leroux - 33780 SOULAC-SUR-MER', 148, 22, { align: 'center' });

        // Paramètres
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Paramètres du Crédit', 14, 35);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Durée: ${duree} mois (${(duree / 12).toFixed(1)} ans) | TEG: ${tauxNominal}% | Assurance: ${tauxAssurance}%`, 14, 42);
        doc.text(`Montant Total Travaux: ${formatMoney(montantTotal)} | Fonds Travaux Loi Alur: ${formatMoney(fondsTravaux)}`, 14, 48);

        // Tableau répartition
        const tableHeaders = ['Copropriétaire', 'Lot', 'Tant.', 'P. Communes', 'Balcons', 'Celliers', 'Total', 'Fonds Alur', 'Apport', 'À Financer', 'Mensualité'];
        const tableRows = repartition.map(c => [
            c.nom,
            c.lot,
            c.tantiemes + c.tantCellier,
            formatMoney(c.partCommunes),
            c.partBalcon > 0 ? formatMoney(c.partBalcon) : '-',
            c.partCellier > 0 ? formatMoney(c.partCellier) : '-',
            formatMoney(c.totalPart),
            '-' + formatMoney(c.partFondsTravaux),
            c.apportUtilise > 0 ? '-' + formatMoney(c.apportUtilise) : '-',
            c.paiementComptant ? 'Comptant' : formatMoney(c.montantAFinancer),
            c.paiementComptant ? '-' : c.mensualite.toFixed(2) + ' €'
        ]);

        doc.autoTable({
            startY: 55,
            head: [tableHeaders],
            body: tableRows,
            headStyles: { fillColor: [67, 56, 202], fontSize: 7 },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 35 },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
                8: { halign: 'right' },
                9: { halign: 'right' },
                10: { halign: 'right' }
            }
        });

        // Résumé financier
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Résumé Financier', 14, finalY);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Montant Financé: ${formatMoney(totaux.montantFinance)} | Intérêts TEG: ${formatMoney(totaux.interetsTEG)} | Coût Assurance: ${formatMoney(totaux.coutAssurance)}`, 14, finalY + 7);
        doc.text(`Coût Total Crédit: ${formatMoney(totaux.coutTotal)} | Surprix Total: ${formatMoney(totaux.surprix)}`, 14, finalY + 14);

        doc.save('Simulation_Credit_Copro.pdf');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm text-slate-600"
                        >
                            <ArrowLeft size={16} />
                            Hub
                        </Link>
                        <div className="flex items-center gap-2">
                            <Calculator size={24} className="text-indigo-600" />
                            <div>
                                <h1 className="font-bold text-lg text-slate-800">Simulateur de Crédit Copropriété</h1>
                                <p className="text-xs text-slate-500">9 Rue André Leroux - Soulac-sur-Mer (33780)</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                            <Download size={16} />
                            Sauvegarder
                        </button>
                        <button onClick={exportPDF} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                            <FileText size={16} />
                            PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Paramètres Crédit */}
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard size={20} />
                        Paramètres du Crédit
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Durée (mois)</label>
                            <input
                                type="number" value={duree} onChange={e => setDuree(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">TEG (%)</label>
                            <input
                                type="number" step="0.01" value={tauxNominal} onChange={e => setTauxNominal(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Taux Assurance (%)</label>
                            <input
                                type="number" step="0.01" value={tauxAssurance} onChange={e => setTauxAssurance(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Fonds Travaux Loi Alur (€)</label>
                            <input
                                type="number" value={fondsTravaux} onChange={e => setFondsTravaux(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-sm text-slate-600">Montant total</span>
                            <span className="text-2xl font-bold text-indigo-600">{formatMoney(montantTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Montants par poste */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Settings size={20} />
                        Montants Globaux
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Parties Communes (€)</label>
                            <input
                                type="number" value={partiesCommunes} onChange={e => setPartiesCommunes(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Répartition sur 1000 tantièmes</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Grand Balcon (€)</label>
                            <input
                                type="number" value={grandBalcon} onChange={e => setGrandBalcon(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Répartition aux tantièmes</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Petits Balcons (€)</label>
                            <input
                                type="number" value={petitsBalcons} onChange={e => setPetitsBalcons(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Parts égales</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Celliers (€)</label>
                            <input
                                type="number" value={celliers} onChange={e => setCelliers(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">22 tantièmes celliers</p>
                        </div>
                    </div>
                </div>

                {/* Copropriétaires */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Copropriétaires - Total: 1000 tantièmes
                    </h2>
                    <div className="space-y-3">
                        {copros.map(copro => (
                            <div key={copro.id} className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-sm">
                                    <div className="md:col-span-2">
                                        <div className="font-semibold text-slate-800">{copro.nom}</div>
                                        <div className="text-xs text-slate-500">{copro.commune} - {copro.lot}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">Tantièmes</div>
                                        <div className="font-bold text-indigo-600">
                                            {copro.tantiemes + copro.tantCellier}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">Quote-part</div>
                                        <div className="font-semibold">{((copro.tantiemes + copro.tantCellier) / TOTAL_TANTIEMES * 100).toFixed(2)}%</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Apport perso (€)</label>
                                        <input
                                            type="number"
                                            value={copro.apportPersonnel}
                                            onChange={e => updateCopro(copro.id, 'apportPersonnel', parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={copro.paiementComptant}
                                            onChange={e => updateCopro(copro.id, 'paiementComptant', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Comptant</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tableau répartition */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <h2 className="text-xl font-bold text-slate-800 p-6 bg-slate-50 border-b">
                        Répartition Détaillée par Copropriétaire
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-3 py-3 text-left font-semibold">Copropriétaire</th>
                                    <th className="px-3 py-3 text-center font-semibold">Lot</th>
                                    <th className="px-3 py-3 text-right font-semibold">Tant.</th>
                                    <th className="px-3 py-3 text-right font-semibold">P. Communes</th>
                                    <th className="px-3 py-3 text-right font-semibold">Balcons</th>
                                    <th className="px-3 py-3 text-right font-semibold">Celliers</th>
                                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                                    <th className="px-3 py-3 text-right font-semibold">Fonds Alur</th>
                                    <th className="px-3 py-3 text-right font-semibold">Apport</th>
                                    <th className="px-3 py-3 text-right font-semibold">À Financer</th>
                                    <th className="px-3 py-3 text-right font-semibold">Mensualité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repartition.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-slate-50">
                                        <td className="px-3 py-2 font-medium">{c.nom}</td>
                                        <td className="px-3 py-2 text-center text-slate-600">{c.lot}</td>
                                        <td className="px-3 py-2 text-right">{c.tantiemes + c.tantCellier}</td>
                                        <td className="px-3 py-2 text-right">{formatMoney(c.partCommunes)}</td>
                                        <td className="px-3 py-2 text-right">{c.partBalcon > 0 ? formatMoney(c.partBalcon) : '-'}</td>
                                        <td className="px-3 py-2 text-right">{c.partCellier > 0 ? formatMoney(c.partCellier) : '-'}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{formatMoney(c.totalPart)}</td>
                                        <td className="px-3 py-2 text-right text-blue-600">-{formatMoney(c.partFondsTravaux)}</td>
                                        <td className="px-3 py-2 text-right text-green-600">{c.apportUtilise > 0 ? `-${formatMoney(c.apportUtilise)}` : '-'}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-indigo-600">
                                            {c.paiementComptant ? <span className="text-green-600">Comptant</span> : formatMoney(c.montantAFinancer)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-indigo-700">
                                            {c.paiementComptant ? '-' : c.mensualite.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' €'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Résumé Financier */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard icon={Euro} label="Montant Total Travaux" value={formatMoney(totaux.montantTotal)} color="blue" />
                    <StatCard icon={PiggyBank} label="Fonds Travaux Loi Alur" value={formatMoney(totaux.fondsTravaux)} color="cyan" />
                    <StatCard icon={TrendingUp} label="Apports Personnels" value={formatMoney(totaux.totalApports)} color="green" />
                    <StatCard icon={CreditCard} label="Montant Financé" value={formatMoney(totaux.montantFinance)} color="purple" />
                    <StatCard icon={Percent} label="Coût Total Crédit" value={formatMoney(totaux.coutTotal)} color="orange" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={TrendingUp} label="Intérêts TEG" value={formatMoney(totaux.interetsTEG)} color="red" />
                    <StatCard icon={Percent} label="Coût Assurance" value={formatMoney(totaux.coutAssurance)} color="purple" />
                    <StatCard icon={Euro} label="Surprix Total" value={formatMoney(totaux.surprix)} color="pink" />
                </div>
            </div>
        </div>
    );
}
