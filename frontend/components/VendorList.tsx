import React from 'react';
import { Vendor } from '../types';
import { Store, Star, MapPin, Truck, Check, Send, AlertCircle } from 'lucide-react';

interface VendorListProps {
  vendors: Vendor[];
  selectedVendorId: string | null;
  onSelectVendor: (vendor: Vendor) => void;
  onQuickDispatch: (vendor: Vendor) => void;
}

export const VendorList: React.FC<VendorListProps> = ({
  vendors,
  selectedVendorId,
  onSelectVendor,
  onQuickDispatch,
}) => {
  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Registered Vendor Network (Delhi-NCR)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {vendors.filter((v) => v.status === 'assigned').length}/{vendors.length} Dispatched
        </span>
      </div>

      <div className="space-y-3">
        {vendors.map((vendor) => {
          const isSelected = selectedVendorId === vendor.id;
          const isAssigned = vendor.status === 'assigned';
          const isDeclined = vendor.status === 'declined';

          return (
            <div
              key={vendor.id}
              onClick={() => onSelectVendor(vendor)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Left details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center text-amber-400 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none mr-0.5" />
                    {vendor.rating}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {vendor.onTimeDeliveryRate}% On-Time
                  </span>
                  {vendor.refrigeratedVehicle && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Cold Fleet
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {vendor.location} ({vendor.distanceKm} km)
                  </span>
                  <span>•</span>
                  <span>
                    Demand: <strong className="text-slate-200">{vendor.requiredLitres} L</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Rate: <strong className="text-emerald-400">₹{vendor.offeredPricePerLitre}/L</strong>
                  </span>
                  <span>•</span>
                  <span className="text-[11px]">
                    Pay: <span className={vendor.paymentReliability === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{vendor.paymentReliability}</span>
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {isAssigned ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Check className="w-3.5 h-3.5" />
                    Assigned
                  </span>
                ) : isDeclined ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Declined
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickDispatch(vendor);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm hover:shadow-indigo-500/20"
                  >
                    <Send className="w-3 h-3" />
                    Notify & Dispatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
