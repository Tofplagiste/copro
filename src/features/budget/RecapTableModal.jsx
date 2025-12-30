import { X, Printer, Download } from 'lucide-react';
import { fmtMoney } from '../../utils/formatters';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function RecapTableModal({ isOpen, onClose, owners, budget, waterPrevi, quarter, year, budgetMode, divisors, getCategoryTotal }) {
    if (!isOpen) return null;

    // Calcul appel par propriétaire (Needs to be duplicated or passed as prop logic if complex, 
    // but here we can re-implement simpler version since we have all data)
    // Actually, it's safer to pass the compute logic or just re-implement it identical to BudgetTab.
    // To avoid duplication drift, ideally we'd have a hook. 
    // For now, I'll copy the logic as it is critical to be exact.

    const computeOwnerCall = (owner) => {
        const sums = {
            general: getCategoryTotal('general'),
            special: getCategoryTotal('special'),
            menage: getCategoryTotal('menage'),
            travaux: getCategoryTotal('travaux')
        };

        const partGen = (sums.general / divisors.divGen) * owner.tantiemes * 0.25;
        const partTra = (sums.travaux / divisors.divTra) * owner.tantiemes * 0.25;
        const partSpe = (!owner.exoGest && divisors.divSpe > 0) ? (sums.special / divisors.divSpe) * owner.tantiemes * 0.25 : 0;
        const partMen = (!owner.exoMen && divisors.divMen > 0) ? (sums.menage / divisors.divMen) * owner.tantiemes * 0.25 : 0;

        const subTotal = partGen + partTra + partSpe + partMen;

        const wSubs = parseFloat(waterPrevi.subs?.[owner.id]) || 0;
        const wCharges = parseFloat(waterPrevi.charges?.[owner.id]) || 0;
        const wReguls = parseFloat(waterPrevi.reguls?.[owner.id]) || 0;
        const wCost = wSubs + wCharges + wReguls;

        const total = subTotal + wCost;

        return { partGen, partSpe, partMen, partTra, subTotal, wCost, total };
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text(`Tableau Récapitulatif - ${quarter} ${year}`, 14, 15);

        const rows = owners.map(owner => {
            const call = computeOwnerCall(owner);
            return [
                owner.name,
                owner.tantiemes,
                fmtMoney(call.partGen),
                owner.exoGest ? "Exo" : fmtMoney(call.partSpe),
                owner.exoMen ? "Exo" : fmtMoney(call.partMen),
                fmtMoney(call.partTra),
                fmtMoney(call.wCost),
                fmtMoney(call.total)
            ];
        });

        // Totals row
        let tGen = 0, tSpe = 0, tMen = 0, tTra = 0, tEau = 0, tTot = 0;
        owners.forEach(o => {
            const c = computeOwnerCall(o);
            tGen += c.partGen; tSpe += c.partSpe; tMen += c.partMen; tTra += c.partTra;
            tEau += c.wCost; tTot += c.total;
        });

        rows.push(['TOTAL', '', fmtMoney(tGen), fmtMoney(tSpe), fmtMoney(tMen), fmtMoney(tTra), fmtMoney(tEau), fmtMoney(tTot)]);

        doc.autoTable({
            head: [['Propriétaire', 'Tant.', 'Général', 'Spécial', 'Ménage', 'Travaux', 'Eau', 'TOTAL']],
            body: rows,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: { 0: { fontStyle: 'bold' }, 7: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
        });

        doc.save(`Recap_${quarter}_${year}.pdf`);
    };

    // Calculate totals for footer
    let totalGen = 0, totalSpe = 0, totalMen = 0, totalTra = 0, totalEau = 0, totalGlobal = 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:absolute print:bg-white print:z-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-cyan-600 px-6 py-4 text-white flex justify-between items-center shrink-0 print:hidden">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        📊 Tableau Détails des Appels - {quarter} {year}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="hover:bg-cyan-700 rounded p-2 transition-colors flex items-center gap-2 text-sm font-bold border border-cyan-400">
                            <Download size={18} /> PDF
                        </button>
                        <button onClick={onClose} className="hover:bg-cyan-700 rounded p-1 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                            <tr>
                                <th className="border p-2 text-left">Propriétaire</th>
                                <th className="border p-2 w-16 text-center">Tant.</th>
                                <th className="border p-2 text-center text-blue-600">Général</th>
                                <th className="border p-2 text-center text-amber-600">Spécial</th>
                                <th className="border p-2 text-center text-cyan-600">Ménage</th>
                                <th className="border p-2 text-center text-red-600">Travaux</th>
                                <th className="border p-2 text-center text-blue-500">Eau</th>
                                <th className="border p-2 text-center bg-gray-100 text-black">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {owners.map(owner => {
                                const call = computeOwnerCall(owner);
                                totalGen += call.partGen;
                                totalSpe += call.partSpe;
                                totalMen += call.partMen;
                                totalTra += call.partTra;
                                totalEau += call.wCost;
                                totalGlobal += call.total;

                                return (
                                    <tr key={owner.id} className="hover:bg-gray-50">
                                        <td className="border p-2 font-medium">{owner.name}</td>
                                        <td className="border p-2 text-center text-xs text-gray-500">{owner.tantiemes}</td>
                                        <td className="border p-2 text-right font-mono">{fmtMoney(call.partGen)}</td>
                                        <td className="border p-2 text-right font-mono text-amber-700">
                                            {owner.exoGest ? <span className="text-gray-300 line-through text-xs">Exo</span> : fmtMoney(call.partSpe)}
                                        </td>
                                        <td className="border p-2 text-right font-mono text-cyan-700">
                                            {owner.exoMen ? <span className="text-gray-300 line-through text-xs">Exo</span> : fmtMoney(call.partMen)}
                                        </td>
                                        <td className="border p-2 text-right font-mono text-red-700">{fmtMoney(call.partTra)}</td>
                                        <td className="border p-2 text-right font-mono text-blue-600 bg-blue-50/50">{fmtMoney(call.wCost)}</td>
                                        <td className="border p-2 text-right font-bold bg-gray-100">{fmtMoney(call.total)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                            <tr>
                                <td colSpan={2} className="border p-2 text-right uppercase">Totaux :</td>
                                <td className="border p-2 text-right">{fmtMoney(totalGen)}</td>
                                <td className="border p-2 text-right">{fmtMoney(totalSpe)}</td>
                                <td className="border p-2 text-right">{fmtMoney(totalMen)}</td>
                                <td className="border p-2 text-right">{fmtMoney(totalTra)}</td>
                                <td className="border p-2 text-right text-blue-600">{fmtMoney(totalEau)}</td>
                                <td className="border p-2 text-right text-lg border-2 border-green-500 bg-green-50">{fmtMoney(totalGlobal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
