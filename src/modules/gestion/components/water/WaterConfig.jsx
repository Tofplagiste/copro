/**
 * WaterConfig - Configuration du trimestre et prix
 */
import { useCopro } from '../../../../context/CoproContext';

export default function WaterConfig({ onPriceChange }) {
    const { state, updateState } = useCopro();
    const water = state.water;

    const handleQuarterChange = (e) => {
        const newQuarter = e.target.value;
        const prevQ = newQuarter === 'T2' ? 'T1' : newQuarter === 'T3' ? 'T2' : newQuarter === 'T4' ? 'T3' : null;

        // Auto-fill old index from previous quarter's new index
        const updatedReadings = { ...water.readings };
        if (prevQ && updatedReadings[prevQ]) {
            if (!updatedReadings[newQuarter]) updatedReadings[newQuarter] = {};

            state.owners.forEach(o => {
                if (!o.isCommon && o.hasMeter) {
                    const prevNew = updatedReadings[prevQ][o.id]?.new || 0;
                    const currentOld = updatedReadings[newQuarter][o.id]?.old || 0;

                    if ((!currentOld || currentOld === 0) && prevNew > 0) {
                        if (!updatedReadings[newQuarter][o.id]) {
                            updatedReadings[newQuarter][o.id] = { old: 0, new: 0 };
                        }
                        updatedReadings[newQuarter][o.id].old = prevNew;
                    }
                }
            });
        }

        updateState({
            water: { ...water, activeQuarter: newQuarter, readings: updatedReadings }
        });
    };

    const handlePriceModeChange = (e) => {
        updateState({ water: { ...water, priceMode: e.target.value } });
        onPriceChange?.();
    };

    const handleFieldChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        let updates = { [field]: numValue };

        // Si mode annuel, recalculer l'abonnement trimestriel
        if (water.priceMode === 'annual' && field === 'annualSub') {
            updates.subAmount = numValue / 4;
        }

        updateState({ water: { ...water, ...updates } });
        onPriceChange?.();
    };

    // Calcul du prix au m³
    const computePrice = () => {
        if (water.priceMode === 'manual') return water.manualPrice || 0;
        if (water.priceMode === 'quarter') {
            // Calcul basé sur facture trimestre (non implémenté pour l'instant)
            return water.manualPrice || 4.5;
        }
        // Mode annual
        const conso = water.annualTotal - water.annualSub;
        return water.annualVol > 0 ? conso / water.annualVol : 0;
    };

    const pricePerM3 = computePrice();

    return (
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-500 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                <span className="font-bold text-gray-700">Configuration Trimestre</span>
            </div>
            <div className="p-4 space-y-4">
                {/* Trimestre Actif */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Trimestre Actif</label>
                    <select
                        value={water.activeQuarter}
                        onChange={handleQuarterChange}
                        className="w-full mt-1 px-3 py-2 font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="T1">Trimestre 1</option>
                        <option value="T2">Trimestre 2</option>
                        <option value="T3">Trimestre 3</option>
                        <option value="T4">Trimestre 4</option>
                    </select>
                </div>

                <hr className="border-gray-200" />

                {/* Mode de calcul du prix */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">1. Coût au m³</label>
                    <select
                        value={water.priceMode}
                        onChange={handlePriceModeChange}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
                    >
                        <option value="quarter">Facture Trimestre (Réel)</option>
                        <option value="annual">Facture Annuelle (Moyenne)</option>
                        <option value="manual">Prix Fixe (Manuel)</option>
                    </select>
                </div>

                {/* Panel Mode Annuel */}
                {water.priceMode === 'annual' && (
                    <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                        <div>
                            <label className="text-xs text-gray-500">Total Facture Annuelle (€)</label>
                            <input
                                type="number"
                                value={water.annualTotal}
                                onChange={(e) => handleFieldChange('annualTotal', e.target.value)}
                                className="w-full mt-1 px-3 py-2 font-bold border border-blue-500 rounded-lg"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Dont Abo. Annuel (€)</label>
                            <input
                                type="number"
                                value={water.annualSub}
                                onChange={(e) => handleFieldChange('annualSub', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Volume Annuel (m³)</label>
                            <input
                                type="number"
                                value={water.annualVol}
                                onChange={(e) => handleFieldChange('annualVol', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                step="0.001"
                            />
                        </div>
                    </div>
                )}

                {/* Panel Mode Manuel */}
                {water.priceMode === 'manual' && (
                    <div className="bg-gray-50 border rounded-lg p-3">
                        <label className="text-xs text-gray-500">Prix du m³ (€)</label>
                        <input
                            type="number"
                            value={water.manualPrice}
                            onChange={(e) => handleFieldChange('manualPrice', e.target.value)}
                            className="w-full mt-1 px-3 py-2 font-bold border rounded-lg"
                            step="0.0001"
                        />
                    </div>
                )}

                {/* Prix appliqué */}
                <div className="text-center p-3 bg-gray-50 border rounded-lg">
                    <span className="text-xs text-gray-500 block">Prix appliqué</span>
                    <span className="text-xl font-bold text-blue-600">{pricePerM3.toFixed(4)}</span>
                    <span className="text-sm ml-1">€/m³</span>
                </div>

                <hr className="border-gray-200" />

                {/* Abonnement */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">2. Abonnement (Trim.)</label>
                    <div className="flex items-center mt-1">
                        <input
                            type="number"
                            value={water.subAmount?.toFixed(2) || '0.00'}
                            onChange={(e) => handleFieldChange('subAmount', e.target.value)}
                            className="flex-1 px-3 py-2 font-bold border rounded-l-lg"
                            step="0.01"
                            disabled={water.priceMode === 'annual'}
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg">€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
