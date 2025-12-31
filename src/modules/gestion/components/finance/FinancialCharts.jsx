
import { useMemo, useState, useRef } from 'react';
import { fmtMoney } from '../../../../utils/formatters';

const COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
];

const SimplePieChart = ({ data, title, type = 'pie' }) => {
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate cumulative percentages for SVG paths
    let cumulativePercent = 0;

    // Helper to get coordinates for a slice
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const slices = data.map((item, index) => {
        if (item.value === 0) return null;

        const startPercent = cumulativePercent;
        const slicePercent = item.value / total;
        cumulativePercent += slicePercent;
        const endPercent = cumulativePercent;

        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(endPercent);

        // Update colors cyclic
        const color = item.color || COLORS[index % COLORS.length];

        // Large arc flag
        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

        // Path data
        const pathData = [
            `M 0 0`,
            `L ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
        ].join(' ');

        return {
            pathData,
            color,
            label: item.label,
            value: item.value,
            percent: slicePercent,
            index
        };
    }).filter(Boolean);

    // If type is doughnut, we mask the center
    const isDoughnut = type === 'doughnut';

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
                <div className="text-gray-400 text-sm">Aucune donnée</div>
            </div>
        );
    }

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center h-full relative" ref={containerRef}>
            <h3 className="text-sm font-bold text-gray-700 mb-6 w-full text-center border-b pb-2">{title}</h3>

            <div
                className="relative w-48 h-48"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredSlice(null)}
            >
                <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                    {slices.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.pathData}
                            fill={slice.color}
                            stroke="white"
                            strokeWidth="0.02"
                            className="transition-all duration-200 hover:opacity-90 cursor-pointer hover:stroke-[0.05]"
                            onMouseEnter={() => setHoveredSlice(slice)}
                        />
                    ))}
                </svg>
                {isDoughnut && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 bg-white rounded-full shadow-inner flex flex-col items-center justify-center">
                            {hoveredSlice ? (
                                <>
                                    <div className="text-xs font-bold text-gray-500 truncate max-w-[80px]">{hoveredSlice.label}</div>
                                    <div className="text-sm font-bold">{Math.round(hoveredSlice.percent * 100)}%</div>
                                </>
                            ) : (
                                <div className="text-gray-400 text-xs text-center">Survoler<br />pour<br />détails</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Total Indicator */}
            <div className="mt-4 text-center">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</div>
                <div className="text-xl font-bold text-gray-800">{fmtMoney(total)}</div>
            </div>

            {/* Floating Tooltip (Generic for both Pie & Doughnut) */}
            {hoveredSlice && (
                <div
                    className="absolute z-20 pointer-events-none bg-gray-900/90 backdrop-blur text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y - 10
                    }}
                >
                    <div className="font-bold mb-1 text-sm border-b border-gray-700 pb-1">{hoveredSlice.label}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: hoveredSlice.color }}></span>
                        <span className="font-mono">{fmtMoney(hoveredSlice.value)}</span>
                        <span className="text-gray-400">({Math.round(hoveredSlice.percent * 100)}%)</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function FinancialCharts({ operations }) {
    // 1. Recettes vs Dépenses
    const summaryData = useMemo(() => {
        let recettes = 0;
        let depenses = 0;
        operations.forEach(op => {
            if (op.type === 'recette') recettes += op.amount;
            else depenses += op.amount;
        });

        return [
            { label: 'Recettes', value: recettes, color: '#10B981' }, // Green
            { label: 'Dépenses', value: depenses, color: '#DC2626' }  // Red
        ];
    }, [operations]);

    // 2. Répartition Dépenses par Catégorie
    const expensesByCategory = useMemo(() => {
        const catMap = {};
        operations.forEach(op => {
            if (op.type === 'depense') {
                const cat = op.category || 'Autre';
                catMap[cat] = (catMap[cat] || 0) + op.amount;
            }
        });

        // Convert to array and sort by value desc
        return Object.entries(catMap)
            .map(([label, value], index) => ({
                label,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, [operations]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn p-2">
            <SimplePieChart
                data={expensesByCategory}
                title="Répartition Dépenses"
                type="doughnut"
            />
            <SimplePieChart
                data={summaryData}
                title="Recettes vs Dépenses"
                type="pie"
            />
        </div>
    );
}
