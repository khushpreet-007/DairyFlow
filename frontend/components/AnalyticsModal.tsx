import React from 'react';
import { MilkBatch, Vendor } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { X, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: MilkBatch[];
  vendors: Vendor[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  batches,
  vendors,
}) => {
  if (!isOpen) return null;

  // Batch data for chart
  const batchData = batches.map((b) => ({
    name: b.batchCode,
    quantity: b.quantityLitres,
    spoilDays: b.spoilageDaysRemaining,
    temp: b.currentTempCelsius,
  }));

  // Vendor comparison data
  const vendorData = vendors.map((v) => ({
    name: v.name.split(' ')[0],
    rating: v.rating,
    onTime: v.onTimeDeliveryRate,
    distance: v.distanceKm,
    price: v.offeredPricePerLitre,
  }));

  // Temperature vs Acidification Curve (Simulated microbiology curve)
  const bacterialGrowthCurve = [
    { hour: '0h', temp4C: 2, temp25C: 5, temp38C: 15 },
    { hour: '1h', temp4C: 3, temp25C: 12, temp38C: 45 },
    { hour: '2h', temp4C: 4, temp25C: 28, temp38C: 98 },
    { hour: '3h', temp4C: 5, temp25C: 55, temp38C: 180 },
    { hour: '4h', temp4C: 6, temp25C: 110, temp38C: 320 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">BMC Logistics & Dairy Spoilage Analytics</h3>
              <p className="text-xs text-slate-400">
                FEFO Inventory distribution, Vendor Reliability, and Thermal Acidification Curves
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Batch Volume by Shelf Life */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Silo Stock by Spoilage Horizon (Litres)
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                    {batchData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.spoilDays === 0 ? '#f43f5e' : entry.spoilDays === 1 ? '#f59e0b' : '#06b6d4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] text-slate-400 mt-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> 0 Days (Critical)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> 1 Day Remaining</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500"></span> 2 Days Remaining</span>
            </div>
          </div>

          {/* Chart 2: Vendor Performance Comparison */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              Vendor On-Time Fulfillment Index (%)
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="onTime" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Amul (Delhi) maintains highest on-time threshold under peak traffic.
            </p>
          </div>

          {/* Chart 3: Temperature Degradation Risk Curve */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 md:col-span-2">
            <h4 className="text-xs font-bold text-slate-200 mb-2">
              Ambient Heat Impact on Spoilage Velocity (Bacterial Count Index)
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Illustrates why Gemini enforces sub-45 min delivery windows when Noida weather exceeds 35°C without refrigerated transport.
            </p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bacterialGrowthCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="temp4C" name="Chilled Silo (4°C)" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="temp25C" name="Cool Ambient (25°C)" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="temp38C" name="Noida Summer (38°C)" stroke="#f43f5e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
