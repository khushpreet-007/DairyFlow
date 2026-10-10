import React from 'react';
import { MilkBatch, DisruptionAlert } from '../types';
import { Thermometer, Clock, ShieldAlert, CheckCircle2, TrendingDown, Layers } from 'lucide-react';

interface InventoryTanksProps {
  batches: MilkBatch[];
  disruption: DisruptionAlert;
}

export const InventoryTanks: React.FC<InventoryTanksProps> = ({ batches, disruption }) => {
  const totalVolume = batches.reduce((acc, b) => acc + b.quantityLitres, 0);

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Live Chilled Silos (FEFO Inventory)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Chilled Stock:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {totalVolume} Litres
          </span>
        </div>
      </div>

      {/* Disruption Shortfall Banner if Active */}
      {disruption.active && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-rose-100 flex items-center gap-1.5">
                <span>Farm Yield Drop Triggered (-{disruption.percentDrop}%)</span>
                <span className="bg-rose-500/30 px-1.5 py-0.2 rounded text-[10px] text-rose-300">CRITICAL</span>
              </div>
              <div className="text-slate-300 mt-0.5">
                Expected: <span className="font-semibold">{disruption.productionExpected}L</span> | Available:{' '}
                <span className="font-semibold">{disruption.productionAvailable}L</span> |{' '}
                <span className="text-rose-400 font-bold">SHORTFALL: {disruption.shortfallLitres}L</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-rose-300/80 hidden sm:inline">
            Action: Reallocate urgent allocations
          </span>
        </div>
      )}

      {/* Silo Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {batches.map((batch) => {
          const fillPercent = Math.min(100, Math.round((batch.quantityLitres / (batch.initialQuantity || 35)) * 100));
          const isCritical = batch.spoilageDaysRemaining === 0;
          const isUrgent = batch.spoilageDaysRemaining === 1;

          return (
            <div
              key={batch.id}
              className={`relative overflow-hidden rounded-xl p-4 border transition duration-200 flex flex-col justify-between ${
                isCritical
                  ? 'bg-gradient-to-b from-rose-950/30 to-slate-900 border-rose-500/40'
                  : isUrgent
                  ? 'bg-gradient-to-b from-amber-950/20 to-slate-900 border-amber-500/40'
                  : 'bg-gradient-to-b from-cyan-950/20 to-slate-900 border-slate-700'
              }`}
            >
              {/* Top details */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400">{batch.batchCode}</div>
                  <div className="text-2xl font-black text-white mt-0.5 flex items-baseline gap-1">
                    {batch.quantityLitres}
                    <span className="text-xs font-normal text-slate-400">Liters</span>
                  </div>
                </div>

                {/* Spoilage tag */}
                <div
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : isUrgent
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {batch.spoilageDaysRemaining === 0
                    ? '0 Days (Expires Today)'
                    : batch.spoilageDaysRemaining === 1
                    ? '1 Day Remaining'
                    : '2 Days Remaining'}
                </div>
              </div>

              {/* Graphical Milk Tank Gauge */}
              <div className="my-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Silo Fill Level</span>
                  <span className="font-mono">{fillPercent}%</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCritical
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : isUrgent
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                    }`}
                    style={{ width: `${Math.max(8, fillPercent)}%` }}
                  />
                </div>
              </div>

              {/* Milk Quality / Temp Footer */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <Thermometer className="w-3 h-3 text-cyan-400" />
                  <span>{batch.currentTempCelsius}°C</span>
                </div>
                <div className="text-slate-400 text-center">
                  Fat: <span className="text-slate-200 font-semibold">{batch.fatPercentage}%</span>
                </div>
                <div className="text-slate-400 text-right">
                  SNF: <span className="text-slate-200 font-semibold">{batch.snfPercentage}%</span>
                </div>
              </div>

              {/* Urgent Action Warning */}
              {isCritical && (
                <div className="mt-2 text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  FEFO Priority: Highest spoilage velocity
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
