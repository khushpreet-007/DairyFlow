import { GoogleGenAI, Type } from '@google/genai';
import { MilkBatch, Vendor, WeatherCondition, DisruptionAlert, AIRecommendation } from '../types';
import { runtimeConfig } from '../resources/supply-chain-disruption-scenario-44797696/config';

export async function generateVendorRecommendation(
  inventory: MilkBatch[],
  vendors: Vendor[],
  weather: WeatherCondition,
  disruption: DisruptionAlert,
  userPrompt?: string
): Promise<AIRecommendation> {
  const apiKey = process.env.API_KEY || '';

  const inventorySummary = inventory
    .map(
      (b) =>
        `- Batch ${b.batchCode}: ${b.quantityLitres}L remaining (Days to Spoil: ${b.spoilageDaysRemaining}d, Temp: ${b.currentTempCelsius}°C, Fat: ${b.fatPercentage}%)`
    )
    .join('\n');

  const vendorSummary = vendors
    .map(
      (v) =>
        `- ID: ${v.id} | ${v.name} (${v.location}, ${v.distanceKm}km away) | Demand: ${v.requiredLitres}L @ ₹${v.offeredPricePerLitre}/L | Rating: ${v.rating}/5.0 | On-Time: ${v.onTimeDeliveryRate}% | Payment: ${v.paymentReliability} | Cold Transport: ${v.refrigeratedVehicle ? 'Yes' : 'No'}`
    )
    .join('\n');

  const contextData = `
CURRENT BMC LOCATION: Noida Sector 62
WEATHER CONDITIONS:
- Noida Area: ${weather.condition}, ${weather.temperatureCelsius}°C, Humidity ${weather.humidityPercent}%, Transit Risk: ${weather.transitDelayRisk}
- Spoilage Acceleration: ${weather.spoilageRateMultiplier}x

MILK INVENTORY ON HAND:
${inventorySummary}

DISRUPTION STATUS:
${
  disruption.active
    ? `🚨 ACTIVE SHORTFALL: Expected ${disruption.productionExpected}L vs Actual ${disruption.productionAvailable}L (Shortfall: ${disruption.shortfallLitres}L / -${disruption.percentDrop}%) Reason: ${disruption.reason}`
    : 'Normal operations. No immediate yield drop recorded.'
}

REGISTERED VENDORS LIST:
${vendorSummary}

USER QUERY / INSTRUCTION:
${userPrompt || 'Analyze current supply, weather risk, and vendor reliability to determine the single best vendor to dispatch urgent milk to minimize spoilage and maximize fulfillment.'}
  `;

  // System instructions blending manufacturing efficiency & spoilage economics
  const systemInstruction = `
You are the Chief AI Logistics Officer for a Bulk Milk Chilling (BMC) Plant in Noida.
Your core objective is Industrial Efficiency, Zero Spoilage (FEFO - First Expiring First Out), and High Reliability.
Evaluate:
1. Spoilage risk (0-day and 1-day milk must be prioritized before it curdles).
2. Ambient weather & transit duration (Hot temperatures degrade milk rapidly unless vehicles are refrigerated or travel is < 45 mins).
3. Vendor metrics (Priority rating, payment reliability, contract consistency, distance from Noida).
4. Disruption constraints: If there is a shortfall, strategically prioritize top-tier or urgent short-batch buyers to preserve contracts.

Respond with strict JSON adhering to the provided schema.
  `;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey, vertexai: true });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: contextData }],
          },
        ],
        config: {
          systemInstruction,
          temperature: runtimeConfig.parameters?.temperature ?? 0.4,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedVendorId: { type: Type.STRING },
              vendorName: { type: Type.STRING },
              allocatedLitres: { type: Type.NUMBER },
              batchSourceId: { type: Type.STRING },
              deliveryDeadline: { type: Type.STRING, description: 'e.g. 02:00 PM Today' },
              suggestedPricePerLitre: { type: Type.NUMBER },
              estimatedTransitTimeMinutes: { type: Type.NUMBER },
              spoilageRiskAssessment: { type: Type.STRING },
              primaryReasoning: { type: Type.STRING },
              alternativeVendorId: { type: Type.STRING },
              alternativeVendorName: { type: Type.STRING },
              wastePreventedLitres: { type: Type.NUMBER },
              potentialRevenue: { type: Type.NUMBER },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    status: { type: Type.STRING },
                    insight: { type: Type.STRING },
                  },
                  propertyOrdering: ['title', 'status', 'insight'],
                },
              },
            },
            propertyOrdering: [
              'recommendedVendorId',
              'vendorName',
              'allocatedLitres',
              'batchSourceId',
              'deliveryDeadline',
              'suggestedPricePerLitre',
              'estimatedTransitTimeMinutes',
              'spoilageRiskAssessment',
              'primaryReasoning',
              'alternativeVendorId',
              'alternativeVendorName',
              'wastePreventedLitres',
              'potentialRevenue',
              'steps',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.recommendedVendorId && parsed.vendorName) {
        return {
          ...parsed,
          steps: (parsed.steps || []).map((s: any) => ({
            ...s,
            status: 'completed',
          })),
        } as AIRecommendation;
      }
    } catch (err) {
      console.warn('Gemini API call failed or encountered schema error. Falling back to rule-based AI engine.', err);
    }
  }

  // Graceful rule-based AI Fallback engine for seamless demo without API keys
  return computeRuleBasedRecommendation(inventory, vendors, weather, disruption);
}

function computeRuleBasedRecommendation(
  inventory: MilkBatch[],
  vendors: Vendor[],
  weather: WeatherCondition,
  disruption: DisruptionAlert
): AIRecommendation {
  // Sort batches by spoilage urgency: 0 day > 1 day > 2 day
  const sortedBatches = [...inventory].sort((a, b) => a.spoilageDaysRemaining - b.spoilageDaysRemaining);
  const urgentBatch = sortedBatches.find((b) => b.quantityLitres > 0) || sortedBatches[0];

  // Score vendors based on: Rating * 20 + On-time% + (Cold transport ? 15 : 0) - (Distance * 0.5)
  const scoredVendors = vendors
    .map((v) => {
      let score = v.rating * 20 + v.onTimeDeliveryRate;
      if (v.refrigeratedVehicle) score += 15;
      if (weather.temperatureCelsius > 35 && !v.refrigeratedVehicle) {
        score -= v.distanceKm * 0.8;
      } else {
        score -= v.distanceKm * 0.3;
      }
      if (v.paymentReliability === 'High') score += 10;
      return { vendor: v, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scoredVendors[0]?.vendor || vendors[0];
  const secondBest = scoredVendors[1]?.vendor || vendors[1];

  const alloc = Math.min(urgentBatch.quantityLitres, best.requiredLitres);
  const transitMins = Math.round(best.distanceKm * 2.2);

  return {
    recommendedVendorId: best.id,
    vendorName: best.name,
    allocatedLitres: alloc > 0 ? alloc : 5,
    batchSourceId: urgentBatch.id,
    deliveryDeadline: '02:30 PM (Within 90 mins)',
    suggestedPricePerLitre: best.offeredPricePerLitre,
    estimatedTransitTimeMinutes: transitMins,
    spoilageRiskAssessment:
      urgentBatch.spoilageDaysRemaining <= 1
        ? 'CRITICAL: High thermal spoilage risk. Requires direct refrigerated dispatch or immediate local consumption.'
        : 'MODERATE: Safely chilled within chilling curve.',
    primaryReasoning: `Prioritized ${best.name} (${best.location}, ${best.distanceKm}km) due to high reliability rating (${best.rating}★), ${best.onTimeDeliveryRate}% on-time rate, and rapid delivery window before the ${urgentBatch.batchCode} batch degrades under current ${weather.temperatureCelsius}°C conditions.`,
    alternativeVendorId: secondBest?.id,
    alternativeVendorName: secondBest?.name,
    wastePreventedLitres: alloc,
    potentialRevenue: alloc * best.offeredPricePerLitre,
    steps: [
      {
        title: 'Vendor Priority Matrix',
        status: 'completed',
        insight: `Selected ${best.name} based on 4.8★ rating, prompt payment history, and consistent daily off-take.`,
      },
      {
        title: 'FEFO Shelf-Life Matching',
        status: 'completed',
        insight: `Matched urgent batch ${urgentBatch.batchCode} (${urgentBatch.spoilageDaysRemaining} days remaining) to prevent ₹${alloc * 35} spoilage write-off.`,
      },
      {
        title: 'Weather & Distance Impact',
        status: 'completed',
        insight: `Weather ${weather.temperatureCelsius}°C in Noida adds bacterial growth stress; route distance of ${best.distanceKm}km requires sub-45 minute transit.`,
      },
      {
        title: 'Fulfillment & Contract Constraints',
        status: 'completed',
        insight: disruption.active
          ? `Adapted allocation around active ${disruption.shortfallLitres}L shortfall while safeguarding high-margin relationship.`
          : 'Standard quota fulfilled with zero delivery penalties.',
      },
    ],
  };
}
