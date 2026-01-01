/**
 * CreditApp - Simulateur de Crédit Copropriété
 * Chef d'orchestre qui connecte le Hook aux Composants UI
 * Refactorisé depuis le fichier monolithique (474 → ~40 lignes)
 */
import { useCredit } from './hooks/useCredit';
import { exportCreditPdf } from './utils/pdfCredit';
import CreditHeader from './components/CreditHeader';
import CreditParametersForm from './components/CreditParametersForm';
import CreditAmountsForm from './components/CreditAmountsForm';
import CreditOwnersList from './components/CreditOwnersList';
import CreditRepartitionTable from './components/CreditRepartitionTable';
import CreditSummary from './components/CreditSummary';

export default function CreditApp() {
    const credit = useCredit();

    const handleExportPdf = () => {
        exportCreditPdf({
            duree: credit.duree,
            tauxNominal: credit.tauxNominal,
            tauxAssurance: credit.tauxAssurance,
            montantTotal: credit.montantTotal,
            fondsTravaux: credit.fondsTravaux,
            repartition: credit.repartition,
            totaux: credit.totaux
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <CreditHeader onExportPdf={handleExportPdf} />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <CreditParametersForm
                    duree={credit.duree} setDuree={credit.setDuree}
                    tauxNominal={credit.tauxNominal} setTauxNominal={credit.setTauxNominal}
                    tauxAssurance={credit.tauxAssurance} setTauxAssurance={credit.setTauxAssurance}
                    fondsTravaux={credit.fondsTravaux} setFondsTravaux={credit.setFondsTravaux}
                    montantTotal={credit.montantTotal}
                />

                <CreditAmountsForm
                    partiesCommunes={credit.partiesCommunes} setPartiesCommunes={credit.setPartiesCommunes}
                    grandBalcon={credit.grandBalcon} setGrandBalcon={credit.setGrandBalcon}
                    petitsBalcons={credit.petitsBalcons} setPetitsBalcons={credit.setPetitsBalcons}
                    celliers={credit.celliers} setCelliers={credit.setCelliers}
                />

                <CreditOwnersList
                    copros={credit.copros}
                    updateCopro={credit.updateCopro}
                />

                <CreditRepartitionTable repartition={credit.repartition} />

                <CreditSummary totaux={credit.totaux} />
            </div>
        </div>
    );
}
