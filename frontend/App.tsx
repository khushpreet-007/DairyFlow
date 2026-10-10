import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InventoryTanks } from './components/InventoryTanks';
import { VendorList } from './components/VendorList';
import { AiReasoningPanel } from './components/AiReasoningPanel';
import { VendorNotificationModal } from './components/VendorNotificationModal';
import { DisruptionSimulatorModal } from './components/DisruptionSimulatorModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { MilkBatch, Vendor, WeatherCondition, DisruptionAlert, AIRecommendation, DispatchNotification } from './types';
import { generateVendorRecommendation } from './services/geminiService';

// Default initial state as described in user hackathon scenario:
// 30L (0 day spoilage), 10L (1 day spoilage), 5L (2 day spoilage)
const INITIAL_BATCHES: MilkBatch[] = [
  {
    id: 'batch-001',
    batchCode: 'BATCH-A0',
    quantityLitres: 30,
    initialQuantity: 30,
    spoilageDaysRemaining: 0, // 0 days spoilage date
    fatPercentage: 4.5,
    snfPercentage: 8.7,
    currentTempCelsius: 3.8,
    harvestTime: '06:00 AM Today',
    status: 'critical',
  },
  {
    id: 'batch-002',
    batchCode: 'BATCH-B1',
    quantityLitres: 10,
    initialQuantity: 10,
    spoilageDaysRemaining: 1, // 1 day spoilage date
    fatPercentage: 4.2,
    snfPercentage: 8.5,
    currentTempCelsius: 4.0,
    harvestTime: 'Yesterday 04:00 PM',
    status: 'critical',
  },
  {
    id: 'batch-003',
    batchCode: 'BATCH-C2',
    quantityLitres: 5,
    initialQuantity: 5,
    spoilageDaysRemaining: 2, // 2 days spoilage date
    fatPercentage: 4.8,
    snfPercentage: 9.0,
    currentTempCelsius: 3.9,
    harvestTime: '2 Days Ago',
    status: 'optimal',
  },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v-amul',
    name: 'Amul Retailer Dairy',
    location: 'Delhi (East Anand Vihar)',
    distanceKm: 18,
    requiredLitres: 5,
    offeredPricePerLitre: 32,
    rating: 4.8,
    onTimeDeliveryRate: 96,
    paymentReliability: 'High',
    refrigeratedVehicle: true,
    contactPhone: '+91 98112 34091',
    status: 'available',
  },
  {
    id: 'v-motherdairy',
    name: 'Mother Dairy Distribution',
    location: 'Gurgaon (CyberHub Depot)',
    distanceKm: 34,
    requiredLitres: 15,
    offeredPricePerLitre: 30,
    rating: 4.3,
    onTimeDeliveryRate: 85,
    paymentReliability: 'High',
    refrigeratedVehicle: true,
    contactPhone: '+91 98711 88204',
    status: 'available',
  },
  {
    id: 'v-namaste',
    name: 'Namaste India Outlet',
    location: 'Ghaziabad (Vasundhara)',
    distanceKm: 9,
    requiredLitres: 8,
    offeredPricePerLitre: 31,
    rating: 4.5,
    onTimeDeliveryRate: 92,
    paymentReliability: 'Medium',
    refrigeratedVehicle: false,
    contactPhone: '+91 99100 44211',
    status: 'available',
  },
  {
    id: 'v-paras',
    name: 'Paras Local Dairy Cooperative',
    location: 'Noida (Sector 18 Market)',
    distanceKm: 4,
    requiredLitres: 6,
    offeredPricePerLitre: 29,
    rating: 4.1,
    onTimeDeliveryRate: 88,
    paymentReliability: 'High',
    refrigeratedVehicle: false,
    contactPhone: '+91 97188 55032',
    status: 'available',
  },
];

const INITIAL_WEATHER: WeatherCondition = {
  location: 'Noida Central',
  condition: 'Sunny & Hot',
  temperatureCelsius: 38,
  humidityPercent: 54,
  transitDelayRisk: 'Medium',
  spoilageRateMultiplier: 1.8,
};

const INITIAL_DISRUPTION: DisruptionAlert = {
  active: false,
  title: 'Sudden Morning Yield Drop',
  reason: 'Farm production dropped due to chilling failure at primary collection center',
  productionExpected: 25,
  productionAvailable: 18,
  shortfallLitres: 7,
  percentDrop: 28,
  timestamp: new Date().toLocaleTimeString(),
};

export default function App() {
  const [batches, setBatches] = useState<MilkBatch[]>(INITIAL_BATCHES);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [weather, setWeather] = useState<WeatherCondition>(INITIAL_WEATHER);
  const [disruption, setDisruption] = useState<DisruptionAlert>(INITIAL_DISRUPTION);

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Modals
  const [activeNotification, setActiveNotification] = useState<DispatchNotification | null>(null);
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState<boolean>(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);

  // Trigger AI analysis with optional prompt
  const runAiAnalysis = useCallback(
    async (promptText?: string) => {
      setAiLoading(true);
      try {
        const result = await generateVendorRecommendation(
          batches,
          vendors,
          weather,
          disruption,
          promptText
        );
        setRecommendation(result);
        if (result.recommendedVendorId) {
          setSelectedVendorId(result.recommendedVendorId);
        }
      } catch (err) {
        console.error('Failed to generate recommendation', err);
      } finally {
        setAiLoading(false);
      }
    },
    [batches, vendors, weather, disruption]
  );

  // Auto-run AI on initial mount
  useEffect(() => {
    runAiAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Weather toggle handler
  const handleToggleWeather = () => {
    setWeather((prev) => {
      if (prev.condition === 'Sunny & Hot') {
        return {
          location: 'Noida Central',
          condition: 'Rain & Stormy',
          temperatureCelsius: 27,
          humidityPercent: 88,
          transitDelayRisk: 'High',
          spoilageRateMultiplier: 1.3,
        };
      }
      return INITIAL_WEATHER;
    });
  };

  // Disruption Handlers
  const handleTriggerDisruption = (dropPercent: number, reason: string) => {
    const expected = 25;
    const actual = Math.round(expected * (1 - dropPercent / 100));
    const shortfall = expected - actual;

    setDisruption({
      active: true,
      title: `Simulated Yield Drop (-${dropPercent}%)`,
      reason,
      productionExpected: expected,
      productionAvailable: actual,
      shortfallLitres: shortfall,
      percentDrop: dropPercent,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Reduce volume in the 0-day batch to simulate the physical drop
    setBatches((prev) =>
      prev.map((b) =>
        b.spoilageDaysRemaining === 0
          ? { ...b, quantityLitres: Math.max(actual, b.quantityLitres - shortfall) }
          : b
      )
    );

    // Re-run AI immediately with disruption context
    setTimeout(() => {
      runAiAnalysis(`🚨 Disruption alert: Production dropped ${dropPercent}%. Shortfall is ${shortfall}L. Recalculate priority.`);
    }, 400);
  };

  const handleResolveDisruption = () => {
    setDisruption((prev) => ({ ...prev, active: false }));
    setBatches(INITIAL_BATCHES);
    runAiAnalysis('Disruption resolved. Return to standard nominal dispatch priority.');
  };

  // Dispatch & Vendor App flow
  const handleSendNotification = (rec: AIRecommendation) => {
    const notification: DispatchNotification = {
      id: `dispatch-${Date.now()}`,
      vendorId: rec.recommendedVendorId,
      vendorName: rec.vendorName,
      quantityLitres: rec.allocatedLitres,
      unitPrice: rec.suggestedPricePerLitre,
      totalAmount: rec.allocatedLitres * rec.suggestedPricePerLitre,
      deliveryTime: rec.deliveryDeadline,
      spoilageWarning: rec.spoilageRiskAssessment,
      assignedBatch: rec.batchSourceId,
      status: 'sent',
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveNotification(notification);
  };

  const handleQuickDispatch = (vendor: Vendor) => {
    // Quick notification builder
    const urgentBatch = batches.find((b) => b.quantityLitres > 0) || batches[0];
    const qty = Math.min(urgentBatch.quantityLitres, vendor.requiredLitres);

    const notification: DispatchNotification = {
      id: `dispatch-${Date.now()}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      quantityLitres: qty > 0 ? qty : 5,
      unitPrice: vendor.offeredPricePerLitre,
      totalAmount: (qty > 0 ? qty : 5) * vendor.offeredPricePerLitre,
      deliveryTime: 'Within 60 Minutes',
      spoilageWarning: `Batch ${urgentBatch.batchCode} has ${urgentBatch.spoilageDaysRemaining} days remaining shelf-life.`,
      assignedBatch: urgentBatch.batchCode,
      status: 'sent',
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveNotification(notification);
  };

  // Vendor App response handlers
  const handleAcceptNotification = (notif: DispatchNotification) => {
    // Update vendor status
    setVendors((prev) =>
      prev.map((v) => (v.id === notif.vendorId ? { ...v, status: 'assigned' } : v))
    );

    // Deduct stock from the earliest expiring batch
    setBatches((prev) => {
      let remainingToDeduct = notif.quantityLitres;
      return prev.map((batch) => {
        if (remainingToDeduct <= 0) return batch;
        if (batch.quantityLitres >= remainingToDeduct) {
          const updated = batch.quantityLitres - remainingToDeduct;
          remainingToDeduct = 0;
          return { ...batch, quantityLitres: updated };
        } else {
          remainingToDeduct -= batch.quantityLitres;
          return { ...batch, quantityLitres: 0 };
        }
      });
    });

    setActiveNotification((prev) => (prev ? { ...prev, status: 'accepted' } : null));

    setTimeout(() => {
      setActiveNotification(null);
    }, 1800);
  };

  const handleDeclineNotification = (notif: DispatchNotification) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === notif.vendorId ? { ...v, status: 'declined' } : v))
    );

    setActiveNotification((prev) => (prev ? { ...prev, status: 'declined' } : null));

    // Automated failover trigger
    setTimeout(() => {
      setActiveNotification(null);
      runAiAnalysis(`Vendor ${notif.vendorName} DECLINED. Find next closest backup vendor immediately.`);
    }, 1500);
  };

  const handleResetData = () => {
    setBatches(INITIAL_BATCHES);
    setVendors(INITIAL_VENDORS);
    setWeather(INITIAL_WEATHER);
    setDisruption(INITIAL_DISRUPTION);
    setSelectedVendorId(null);
    runAiAnalysis();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        weather={weather}
        disruption={disruption}
        onToggleWeather={handleToggleWeather}
        onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Row 1: Milk Tanks Inventory */}
        <InventoryTanks batches={batches} disruption={disruption} />

        {/* Row 2: Two Columns (AI Engine & Vendor Network) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Recommendation Engine (7 cols) */}
          <div className="lg:col-span-7">
            <AiReasoningPanel
              recommendation={recommendation}
              loading={aiLoading}
              onRunAiAnalysis={runAiAnalysis}
              onSendNotification={handleSendNotification}
              inventory={batches}
              vendors={vendors}
              weather={weather}
              disruption={disruption}
            />
          </div>

          {/* Right Column: Vendor Roster & Dispatch Actions (5 cols) */}
          <div className="lg:col-span-5">
            <VendorList
              vendors={vendors}
              selectedVendorId={selectedVendorId}
              onSelectVendor={(v) => setSelectedVendorId(v.id)}
              onQuickDispatch={handleQuickDispatch}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
        <p>
          LactiFlow AI • Intelligent Dairy Supply Chain Operations & BMC Disruption Engine • Noida Central Chilling Hub
        </p>
      </footer>

      {/* Modals */}
      <VendorNotificationModal
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
        onAccept={handleAcceptNotification}
        onDecline={handleDeclineNotification}
      />

      <DisruptionSimulatorModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
        disruption={disruption}
        onTriggerDisruption={handleTriggerDisruption}
        onResolveDisruption={handleResolveDisruption}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        batches={batches}
        vendors={vendors}
      />
    </div>
  );
}
