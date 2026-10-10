import React from 'react';
import { Milk, CloudSun, AlertTriangle, MapPin, Zap, RefreshCw, BarChart2 } from 'lucide-react';
import { WeatherCondition, DisruptionAlert } from '../types';

interface HeaderProps {
  weather: WeatherCondition;
  disruption: DisruptionAlert;
  onToggleWeather: () => void;
  onOpenDisruptionModal: () => void;
  onOpenAnalytics: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  disruption,
  onToggleWeather,
  onOpenDisruptionModal,
  onOpenAnalytics,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Location */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                LactiFlow AI
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                BMC Ops Hub
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Noida Central Chilling Plant (Sec 62)
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                IoT Chiller Online (3.8°C)
              </span>
            </div>
          </div>
        </div>

        {/* Action badges & Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Weather Widget (clickable to switch) */}
          <button
            onClick={onToggleWeather}
            title="Click to toggle weather scenario (Hot vs Rainy)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs transition group"
          >
            <CloudSun className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <div className="text-left">
              <div className="font-medium text-slate-200">
                {weather.condition} • {weather.temperatureCelsius}°C
              </div>
              <div className="text-[10px] text-slate-400">
                Transit Spoilage Factor: <span className="text-amber-400 font-bold">{weather.spoilageRateMultiplier}x</span>
              </div>
            </div>
          </button>

          {/* Disruption Alert Trigger */}
          <button
            onClick={onOpenDisruptionModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              disruption.active
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {disruption.active ? '🚨 Disruption Active' : 'Simulate Disruption'}
          </button>

          {/* Analytics / Charts Modal */}
          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetData}
            title="Reset to factory baseline demo state"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
