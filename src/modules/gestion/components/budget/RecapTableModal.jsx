/**
 * RecapTableModal - Tableau Récapitulatif Détaillé des Charges
 * Affiche tous les postes budgétaires individuels par propriétaire
 */
import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useToast } from '../../../../components/ToastProvider';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RecapTableModal({
    isOpen,
    onClose,
    owners,
    budget,
    waterPrevi,
    quarter,
    year,
    budgetMode,
    divisors
}) {
    const toast = useToast();

    // Block body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Get all budget items organized by category
    const generalItems = budget.general || [];
    const specialItems = budget.special || [];
    const menageItems = budget.menage || [];
    const travauxItems = budget.travaux || [];

    // Calculate individual budget item cost per owner
    const getItemCost = (item, owner, category) => {
        const amount = item[budgetMode] || 0;
        let divisor = divisors.divGen;

        if (category === 'special') {
            if (owner.exoGest) return 0;
            divisor = divisors.divSpe;
        } else if (category === 'menage') {
            if (owner.exoMen) return 0;
            divisor = divisors.divMen;
        } else if (category === 'travaux') {
            divisor = divisors.divTra;
        }

        if (divisor === 0) return 0;
        return (amount / divisor) * owner.tantiemes;
    };

    // Calculate water cost for an owner
    const getWaterCost = (owner) => {
        const wSubs = parseFloat(waterPrevi.subs?.[owner.id]) || 0;
        const wCharges = parseFloat(waterPrevi.charges?.[owner.id]) || 0;
        const wReguls = parseFloat(waterPrevi.reguls?.[owner.id]) || 0;
        return wSubs + wCharges + wReguls;
    };

    // Calculate totals for each column
    const calculateColumnTotals = () => {
        const totals = {
            general: generalItems.map(() => 0),
            special: specialItems.map(() => 0),
            menage: menageItems.map(() => 0),
            travaux: travauxItems.map(() => 0),
            eau: 0,
            total: 0
        };

        owners.forEach(owner => {
            generalItems.forEach((item, idx) => {
                totals.general[idx] += getItemCost(item, owner, 'general');
            });
            specialItems.forEach((item, idx) => {
                totals.special[idx] += getItemCost(item, owner, 'special');
            });
            menageItems.forEach((item, idx) => {
                totals.menage[idx] += getItemCost(item, owner, 'menage');
            });
            travauxItems.forEach((item, idx) => {
                totals.travaux[idx] += getItemCost(item, owner, 'travaux');
            });
            totals.eau += getWaterCost(owner);
        });

        owners.forEach(owner => {
            let rowTotal = 0;
            generalItems.forEach(item => rowTotal += getItemCost(item, owner, 'general'));
            specialItems.forEach(item => rowTotal += getItemCost(item, owner, 'special'));
            menageItems.forEach(item => rowTotal += getItemCost(item, owner, 'menage'));
            travauxItems.forEach(item => rowTotal += getItemCost(item, owner, 'travaux'));
            rowTotal += getWaterCost(owner);
            totals.total += rowTotal;
        });

        return totals;
    };

    const columnTotals = calculateColumnTotals();

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Export to PDF
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF('landscape', 'mm', 'a4');

            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Tableau Récapitulatif Charges', 14, 15);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Période: ${quarter} ${year}`, 14, 22);

            // Build headers
            const headers = ['Propriétaire', 'Tant.'];
            generalItems.forEach(item => headers.push(item.name.substring(0, 12)));
            specialItems.forEach(item => headers.push(item.name.substring(0, 12)));
            menageItems.forEach(item => headers.push(item.name.substring(0, 12)));
            travauxItems.forEach(item => headers.push(item.name.substring(0, 12)));
            headers.push('EAU');
            headers.push('TOTAL');

            // Build body rows
            const body = owners.map(owner => {
                const row = [owner.name, owner.tantiemes.toString()];
                let rowTotal = 0;

                generalItems.forEach(item => {
                    const cost = getItemCost(item, owner, 'general');
                    row.push(cost.toFixed(2));
                    rowTotal += cost;
                });
                specialItems.forEach(item => {
                    const cost = getItemCost(item, owner, 'special');
                    row.push(owner.exoGest ? '-' : cost.toFixed(2));
                    rowTotal += cost;
                });
                menageItems.forEach(item => {
                    const cost = getItemCost(item, owner, 'menage');
                    row.push(owner.exoMen ? '-' : cost.toFixed(2));
                    rowTotal += cost;
                });
                travauxItems.forEach(item => {
                    const cost = getItemCost(item, owner, 'travaux');
                    row.push(cost.toFixed(2));
                    rowTotal += cost;
                });

                const waterCost = getWaterCost(owner);
                rowTotal += waterCost;
                row.push(waterCost.toFixed(2));
                row.push(rowTotal.toFixed(2));

                return row;
            });

            // Totals row
            const totalsRow = ['TOTAUX', '-'];
            columnTotals.general.forEach(t => totalsRow.push(t.toFixed(2)));
            columnTotals.special.forEach(t => totalsRow.push(t.toFixed(2)));
            columnTotals.menage.forEach(t => totalsRow.push(t.toFixed(2)));
            columnTotals.travaux.forEach(t => totalsRow.push(t.toFixed(2)));
            totalsRow.push(columnTotals.eau.toFixed(2));
            totalsRow.push(columnTotals.total.toFixed(2));
            body.push(totalsRow);

            // Calculate column count for dynamic styling
            const totalCols = headers.length;

            autoTable(doc, {
                head: [headers],
                body: body,
                startY: 28,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    overflow: 'linebreak',
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [55, 65, 81],
                    textColor: [255, 255, 255],
                    fontSize: 6,
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold', cellWidth: 25 },
                    1: { cellWidth: 12 },
                    [totalCols - 1]: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
                    [totalCols - 2]: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                },
                didParseCell: function (data) {
                    // Style last row (totals)
                    if (data.row.index === body.length - 1) {
                        data.cell.styles.fillColor = [243, 244, 246];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            doc.save(`Tableau_Recapitulatif_${quarter}_${year}.pdf`);
            toast.success('PDF exporté avec succès !');
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error('Erreur lors de l\'export PDF: ' + error.message);
        }
    };

    return (
        <div
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50 flex items-center justify-center"
            onClick={handleBackdropClick}
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-[98vw] sm:w-[95vw] max-w-[1400px] flex flex-col animate-[slideUp_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 sm:px-6 py-3 sm:py-4 text-white flex justify-between items-center shrink-0 rounded-t-xl sm:rounded-t-2xl">
                    <div>
                        <h3 className="font-bold text-sm sm:text-xl flex items-center gap-2">
                            📊 Tableau Récapitulatif Détaillé
                        </h3>
                        <p className="text-slate-300 text-xs sm:text-sm hidden sm:block">{quarter} {year} - Budget {budgetMode === 'previ' ? 'Prévisionnel' : budgetMode === 'reel' ? 'Réalisé' : 'N+1'}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-xs sm:text-sm"
                        >
                            <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Exporter</span> PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Table Container with padding */}
                <div className="p-2 sm:p-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse min-w-[800px]">
                                <thead>
                                    {/* Header row - horizontal readable labels */}
                                    <tr className="bg-slate-800 text-white">
                                        <th className="px-3 py-3 text-left font-bold border border-slate-600 sticky left-0 bg-slate-800 z-10" style={{ minWidth: 140 }}>
                                            Propriétaire
                                        </th>
                                        <th className="px-2 py-3 text-center font-bold border border-slate-600" style={{ width: 50 }}>
                                            Tant.
                                        </th>

                                        {/* General items - blue themed */}
                                        {generalItems.map((item, idx) => (
                                            <th key={`g-${idx}`} className="px-2 py-3 text-center border border-slate-600 bg-slate-700 text-[11px] font-semibold" style={{ minWidth: 70 }}>
                                                {item.name}
                                            </th>
                                        ))}

                                        {/* Special items - amber themed */}
                                        {specialItems.map((item, idx) => (
                                            <th key={`s-${idx}`} className="px-2 py-3 text-center border border-slate-600 bg-amber-600 text-[11px] font-semibold" style={{ minWidth: 70 }}>
                                                {item.name}
                                            </th>
                                        ))}

                                        {/* Menage items - cyan themed */}
                                        {menageItems.map((item, idx) => (
                                            <th key={`m-${idx}`} className="px-2 py-3 text-center border border-slate-600 bg-cyan-600 text-[11px] font-semibold" style={{ minWidth: 70 }}>
                                                {item.name}
                                            </th>
                                        ))}

                                        {/* Travaux items - red themed */}
                                        {travauxItems.map((item, idx) => (
                                            <th key={`t-${idx}`} className="px-2 py-3 text-center border border-slate-600 bg-red-600 text-[11px] font-semibold" style={{ minWidth: 70 }}>
                                                {item.name}
                                            </th>
                                        ))}

                                        {/* Eau */}
                                        <th className="px-3 py-3 text-center border border-slate-600 bg-blue-500 text-[11px] font-bold" style={{ minWidth: 90 }}>
                                            EAU (Annuel)
                                        </th>

                                        {/* Total */}
                                        <th className="px-3 py-3 text-center font-bold border border-slate-600 bg-gradient-to-r from-emerald-500 to-green-600" style={{ minWidth: 100 }}>
                                            TOTAL ANNUEL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {owners.map((owner, rowIdx) => {
                                        let rowTotal = 0;
                                        const isEven = rowIdx % 2 === 0;

                                        return (
                                            <tr key={owner.id} className={`hover:bg-blue-50/50 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                                                {/* Propriétaire */}
                                                <td className={`px-3 py-2.5 font-bold text-slate-800 border border-gray-200 sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center gap-1">
                                                        {owner.name}
                                                        {owner.exoGest && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">Exo.S</span>}
                                                        {owner.exoMen && <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold">Exo.M</span>}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 italic">{owner.lot}</div>
                                                </td>

                                                {/* Tantièmes */}
                                                <td className="px-2 py-2.5 text-center font-mono text-gray-600 border border-gray-200 font-bold">
                                                    {owner.tantiemes}
                                                </td>

                                                {/* General items */}
                                                {generalItems.map((item, idx) => {
                                                    const cost = getItemCost(item, owner, 'general');
                                                    rowTotal += cost;
                                                    return (
                                                        <td key={`g-${idx}`} className="px-2 py-2.5 text-right font-mono border border-gray-200 text-gray-700">
                                                            {cost.toFixed(2)}
                                                        </td>
                                                    );
                                                })}

                                                {/* Special items */}
                                                {specialItems.map((item, idx) => {
                                                    const cost = getItemCost(item, owner, 'special');
                                                    rowTotal += cost;
                                                    return (
                                                        <td key={`s-${idx}`} className={`px-2 py-2.5 text-right font-mono border border-gray-200 ${owner.exoGest ? 'text-gray-300 bg-gray-50' : 'text-amber-700'}`}>
                                                            {owner.exoGest ? '-' : cost.toFixed(2)}
                                                        </td>
                                                    );
                                                })}

                                                {/* Menage items */}
                                                {menageItems.map((item, idx) => {
                                                    const cost = getItemCost(item, owner, 'menage');
                                                    rowTotal += cost;
                                                    return (
                                                        <td key={`m-${idx}`} className={`px-2 py-2.5 text-right font-mono border border-gray-200 ${owner.exoMen ? 'text-gray-300 bg-gray-50' : 'text-cyan-700'}`}>
                                                            {owner.exoMen ? '-' : cost.toFixed(2)}
                                                        </td>
                                                    );
                                                })}

                                                {/* Travaux items */}
                                                {travauxItems.map((item, idx) => {
                                                    const cost = getItemCost(item, owner, 'travaux');
                                                    rowTotal += cost;
                                                    return (
                                                        <td key={`t-${idx}`} className="px-2 py-2.5 text-right font-mono border border-gray-200 text-red-600">
                                                            {cost.toFixed(2)}
                                                        </td>
                                                    );
                                                })}

                                                {/* Eau */}
                                                {(() => {
                                                    const waterCost = getWaterCost(owner);
                                                    rowTotal += waterCost;
                                                    return (
                                                        <td className="px-2 py-2.5 text-right font-mono font-bold text-blue-600 bg-blue-50 border border-gray-200">
                                                            {waterCost.toFixed(2)}
                                                        </td>
                                                    );
                                                })()}

                                                {/* Total */}
                                                <td className="px-2 py-2.5 text-right font-mono font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 border border-gray-200">
                                                    {rowTotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-200 font-bold">
                                        <td colSpan={2} className="px-3 py-3 text-right uppercase border border-gray-300 sticky left-0 bg-slate-200 z-10 text-slate-700">
                                            TOTAUX
                                        </td>
                                        {columnTotals.general.map((t, idx) => (
                                            <td key={`tg-${idx}`} className="px-2 py-3 text-right font-mono border border-gray-300 text-slate-800">
                                                {t.toFixed(2)}
                                            </td>
                                        ))}
                                        {columnTotals.special.map((t, idx) => (
                                            <td key={`ts-${idx}`} className="px-2 py-3 text-right font-mono text-amber-700 border border-gray-300">
                                                {t.toFixed(2)}
                                            </td>
                                        ))}
                                        {columnTotals.menage.map((t, idx) => (
                                            <td key={`tm-${idx}`} className="px-2 py-3 text-right font-mono text-cyan-700 border border-gray-300">
                                                {t.toFixed(2)}
                                            </td>
                                        ))}
                                        {columnTotals.travaux.map((t, idx) => (
                                            <td key={`tt-${idx}`} className="px-2 py-3 text-right font-mono text-red-600 border border-gray-300">
                                                {t.toFixed(2)}
                                            </td>
                                        ))}
                                        <td className="px-2 py-3 text-right font-mono font-bold text-blue-700 bg-blue-100 border border-gray-300">
                                            {columnTotals.eau.toFixed(2)}
                                        </td>
                                        <td className="px-2 py-3 text-right font-mono font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 border border-gray-300 text-sm">
                                            {columnTotals.total.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

