/**
 * CreditSummary - Résumé financier global
 * Affiche les StatCards avec les totaux
 */
import { Euro, PiggyBank, TrendingUp, CreditCard, Percent } from 'lucide-react';
import CreditStatCard from './CreditStatCard';
import { formatMoney } from '../utils/creditCalculations';

/**
 * @param {Object} props
 * @param {Object} props.totaux - Totaux calculés
 */
export default function CreditSummary({ totaux }) {
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <CreditStatCard icon={Euro} label="Montant Total Travaux" value={formatMoney(totaux.montantTotal)} color="blue" />
                <CreditStatCard icon={PiggyBank} label="Fonds Travaux Loi Alur" value={formatMoney(totaux.fondsTravaux)} color="cyan" />
                <CreditStatCard icon={TrendingUp} label="Apports Personnels" value={formatMoney(totaux.totalApports)} color="green" />
                <CreditStatCard icon={CreditCard} label="Montant Financé" value={formatMoney(totaux.montantFinance)} color="purple" />
                <CreditStatCard icon={Percent} label="Coût Total Crédit" value={formatMoney(totaux.coutTotal)} color="orange" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CreditStatCard icon={TrendingUp} label="Intérêts TEG" value={formatMoney(totaux.interetsTEG)} color="red" />
                <CreditStatCard icon={Percent} label="Coût Assurance" value={formatMoney(totaux.coutAssurance)} color="purple" />
                <CreditStatCard icon={Euro} label="Surprix Total" value={formatMoney(totaux.surprix)} color="pink" />
            </div>
        </>
    );
}
