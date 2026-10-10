export interface MilkBatch {
  id: string;
  batchCode: string;
  quantityLitres: number;
  initialQuantity: number;
  spoilageDaysRemaining: number; // 0 = expires today / high risk, 1 = 1 day left, 2 = 2 days left
  fatPercentage: number;
  snfPercentage: number; // Solids-not-fat
  currentTempCelsius: number;
  harvestTime: string;
  status: 'optimal' | 'critical' | 'expiring_soon';
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  requiredLitres: number;
  offeredPricePerLitre: number;
  rating: number; // 1-5 scale
  onTimeDeliveryRate: number; // percentage (e.g. 96)
  paymentReliability: 'High' | 'Medium' | 'Low';
  refrigeratedVehicle: boolean;
  contactPhone: string;
  status: 'available' | 'assigned' | 'declined';
  lastAcceptedBatch?: string;
}

export interface WeatherCondition {
  location: string;
  condition: 'Sunny & Hot' | 'Rain & Stormy' | 'Moderate Cool' | 'Humid & Overcast';
  temperatureCelsius: number;
  humidityPercent: number;
  transitDelayRisk: 'Low' | 'Medium' | 'High';
  spoilageRateMultiplier: number;
}

export interface DisruptionAlert {
  active: boolean;
  title: string;
  reason: string;
  productionExpected: number;
  productionAvailable: number;
  shortfallLitres: number;
  percentDrop: number;
  timestamp: string;
}

export interface RecommendationStep {
  title: string;
  status: 'pending' | 'analyzing' | 'completed';
  insight: string;
}

export interface AIRecommendation {
  recommendedVendorId: string;
  vendorName: string;
  allocatedLitres: number;
  batchSourceId: string;
  deliveryDeadline: string;
  suggestedPricePerLitre: number;
  estimatedTransitTimeMinutes: number;
  spoilageRiskAssessment: string;
  primaryReasoning: string;
  alternativeVendorId?: string;
  alternativeVendorName?: string;
  steps: RecommendationStep[];
  wastePreventedLitres: number;
  potentialRevenue: number;
}

export interface DispatchNotification {
  id: string;
  vendorId: string;
  vendorName: string;
  quantityLitres: number;
  unitPrice: number;
  totalAmount: number;
  deliveryTime: string;
  spoilageWarning: string;
  assignedBatch: string;
  status: 'sent' | 'accepted' | 'declined';
  sentAt: string;
}
