import React from 'react';
import { DispatchNotification } from '../types';
import { Smartphone, Check, X, Bell, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

interface VendorNotificationModalProps {
  notification: DispatchNotification | null;
  onClose: () => void;
  onAccept: (notification: DispatchNotification) => void;
  onDecline: (notification: DispatchNotification) => void;
}

export const VendorNotificationModal: React.FC<VendorNotificationModalProps> = ({
  notification,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Mobile Device Frame Mockup */}
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Phone Notch & Status bar */}
        <div className="bg-slate-950 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vendor Partner App</span>
          </div>
          <span className="font-mono">02:14 PM</span>
        </div>

        {/* App Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Incoming Dispatch Offer
              </span>
              <h3 className="text-lg font-bold text-white">{notification.vendorName}</h3>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Offer Details Box */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex justify-between items-baseline border-b border-slate-700/60 pb-2">
              <span className="text-xs text-slate-400">Allocated Quantity</span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {notification.quantityLitres} Litres
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Agreed Unit Rate</span>
                <span className="font-semibold text-white">₹{notification.unitPrice} / Litre</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Order Value</span>
                <span className="font-bold text-emerald-400">₹{notification.totalAmount}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-slate-400 block text-[10px]">Delivery Window</span>
              <span className="font-medium text-amber-300 text-xs">
                {notification.deliveryTime} (Strict FIFO)
              </span>
            </div>

            <div className="text-[11px] p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{notification.spoilageWarning}</span>
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Noida BMC Certified Chilled Batch: {notification.assignedBatch}</span>
          </div>

          {/* Action Buttons: Accept / Decline */}
          {notification.status === 'sent' ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onDecline(notification)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-rose-300 text-xs font-semibold transition"
              >
                <X className="w-4 h-4" />
                Decline Order
              </button>
              <button
                onClick={() => onAccept(notification)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
              >
                <Check className="w-4 h-4" />
                Accept & Route
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  notification.status === 'accepted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {notification.status === 'accepted'
                  ? '✓ Order Accepted by Vendor App'
                  : '✕ Order Declined - AI Triggering Secondary Failover'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Close Device Preview
          </button>
        </div>
      </div>
    </div>
  );
};
