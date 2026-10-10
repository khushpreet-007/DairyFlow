import React, { useState } from 'react';
import { DisruptionAlert } from '../types';
import { AlertTriangle, TrendingDown, ThermometerSun, Truck, X } from 'lucide-react';

interface DisruptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  disruption: DisruptionAlert;
  onTriggerDisruption: (dropPercent: number, reason: string) => void;
  onResolveDisruption: () => void;
}

export const DisruptionSimulatorModal: React.FC<DisruptionSimulatorModalProps> = ({
  isOpen,
  onClose,
  disruption,
  onTriggerDisruption,
  onResolveDisruption,
}) => {
  if (!isOpen) return null;

  const [selectedScenario, setSelectedScenario] = useState<number>(28);
  const [reason, setReason] = useState<string>('Dairy farm morning collection drop (-28%)');

  const scenarios = [
    {
      percent: 28,
      label: 'Sudden Morning Yield Drop (-28%)',
      reason: 'Dairy cooperative farm collection yield drop (-28% shortfall)',
      desc: 'Simulate the hackathon scenario: Expected 25L, Available 18L, Shortfall 7L.',
    },
    {
      percent: 40,
      label: 'Severe Heatwave Spoilage Hazard (-40%)',
      reason: 'Ambient temperature reached 42°C in Greater Noida corridor, forcing batch quarantine',
      desc: 'High ambient temperature risks curdling during transit; strict cold-chain only.',
    },
    {
      percent: 15,
      label: 'Noida Expressway Transit Delay (-15%)',
      reason: 'Major traffic jam on Kalindi Kunj route into South Delhi',
      desc: 'Delivery window narrowed to 30 mins; requires closest vendor re-routing.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supply Chain Disruption Simulator</h3>
              <p className="text-xs text-slate-400">Trigger real-time shocks to test AI resilience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Selection */}
        <div className="space-y-2.5">
          {scenarios.map((sc, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedScenario(sc.percent);
                setReason(sc.reason);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                selectedScenario === sc.percent
                  ? 'bg-rose-950/30 border-rose-500 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span>{sc.label}</span>
                <span className="font-mono text-rose-400">-{sc.percent}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{sc.desc}</p>
            </div>
          ))}
        </div>

        {/* Current State Indicator */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
          <span className="text-slate-400">Disruption Status:</span>
          <span className={disruption.active ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
            {disruption.active ? `ACTIVE (-${disruption.percentDrop}% Shortfall)` : 'Normal Nominal Flow'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {disruption.active ? (
            <button
              onClick={() => {
                onResolveDisruption();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
            >
              Resolve Disruption & Restore Nominal Yield
            </button>
          ) : (
            <button
              onClick={() => {
                onTriggerDisruption(selectedScenario, reason);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <TrendingDown className="w-4 h-4" />
              Simulate Sudden Shortfall (-{selectedScenario}%)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
