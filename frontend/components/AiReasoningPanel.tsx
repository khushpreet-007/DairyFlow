import React, { useState } from 'react';
import { AIRecommendation, Vendor, MilkBatch, WeatherCondition, DisruptionAlert } from '../types';
import { Sparkles, Brain, CheckCircle2, ArrowRight, Bell, Loader2, MessageSquare, Flame } from 'lucide-react';

interface AiReasoningPanelProps {
  recommendation: AIRecommendation | null;
  loading: boolean;
  onRunAiAnalysis: (prompt?: string) => void;
  onSendNotification: (recommendation: AIRecommendation) => void;
  inventory: MilkBatch[];
  vendors: Vendor[];
  weather: WeatherCondition;
  disruption: DisruptionAlert;
}

export const AiReasoningPanel: React.FC<AiReasoningPanelProps> = ({
  recommendation,
  loading,
  onRunAiAnalysis,
  onSendNotification,
  inventory,
  vendors,
  weather,
  disruption,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const quickPrompts = [
    'Which vendor for 5L urgent milk under today\'s weather?',
    'Yield dropped by 7L. Re-prioritize contracts immediately.',
    'Heavy rain expected in Delhi: Which route minimizes transit delay?',
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onRunAiAnalysis(customPrompt);
    setCustomPrompt('');
  };

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Gemini Disruption & Allocation Engine
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates FEFO shelf-life, Noida weather risk, transit vectors & vendor ratings
            </p>
          </div>
        </div>

        <button
          onClick={() => onRunAiAnalysis()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Vectors...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze & Recommend</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Scenario Quick Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
          <Flame className="w-3 h-3 text-amber-400" /> Quick Ask:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onRunAiAnalysis(q)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Custom Prompt Input */}
      <form onSubmit={handlePromptSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI: e.g. 'Amul vs Mother Dairy under high heat index?'"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !customPrompt.trim()}
          className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-medium text-white rounded-lg transition"
        >
          Ask AI
        </button>
      </form>

      {/* Recommendation Card */}
      {recommendation ? (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 rounded-xl border border-indigo-500/40 p-4 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Optimal AI Pick
              </span>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                {recommendation.vendorName}
                <span className="text-xs font-normal text-slate-400">
                  (Dispatch: <strong className="text-cyan-300">{recommendation.allocatedLitres} Litres</strong> @ ₹{recommendation.suggestedPricePerLitre}/L)
                </span>
              </h3>
            </div>

            <button
              onClick={() => onSendNotification(recommendation)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify Vendor App
            </button>
          </div>

          {/* Reasoning Narrative */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
            <strong className="text-cyan-300 block mb-1">AI Reasoning Assessment:</strong>
            {recommendation.primaryReasoning}
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Deadline Window</span>
              <span className="font-semibold text-amber-300">{recommendation.deliveryDeadline}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Transit Route ETA</span>
              <span className="font-semibold text-slate-200">{recommendation.estimatedTransitTimeMinutes} mins</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Spoilage Saved</span>
              <span className="font-semibold text-emerald-400">+{recommendation.wastePreventedLitres} L (100%)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Protected Revenue</span>
              <span className="font-semibold text-emerald-400">₹{recommendation.potentialRevenue}</span>
            </div>
          </div>

          {/* Step-by-Step Chain of Thought */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Multi-Factor Analysis Pipeline:</h4>
            <div className="space-y-2">
              {recommendation.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">{step.title}: </span>
                    <span className="text-slate-300">{step.insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-slate-400 text-xs">
          Click <strong className="text-cyan-300">"Analyze & Recommend"</strong> to initiate the Gemini supply chain optimization sequence.
        </div>
      )}
    </div>
  );
};
