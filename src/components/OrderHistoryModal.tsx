import React from 'react';
import { OrderSubmission, Currency, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';
import { openWhatsAppOrder } from '../utils/whatsapp';
import { updateOrderStatus } from '../utils/firestoreService';
import {
  X,
  Clock,
  MessageCircle,
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderSubmission[];
  currency: Currency;
  isDarkMode: boolean;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            تم التسليم بنجاح
          </span>
        );
      case 'Shipped':
        return (
          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" />
            قيد الشحن مع الكابتن
          </span>
        );
      case 'Cancelled':
        return (
          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            ملغي
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            قيد التجهيز والتأكيد
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden my-auto max-h-[85vh] flex flex-col ${
          isDarkMode
            ? 'bg-[#151518] border-amber-500/25 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-[#1a1b20] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">سجل وتتبع طلباتي</h2>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-500 stroke-1" />
              <p className="text-sm font-semibold">لا توجد طلبات سابقة مسجلة</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className={`rounded-2xl p-4 border space-y-2.5 transition-colors ${
                  isDarkMode
                    ? 'bg-[#1b1c22] border-slate-800 text-slate-200'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-black/20 px-2 py-0.5 rounded border border-amber-500/20">
                    #{order.orderId}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {order.governorateNameAr} - {order.detailedAddress}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    المنتجات:{' '}
                    {order.items.map((i) => `${i.product.title} (×${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الإجمالي (COD):</span>
                    <span className="font-mono text-sm font-black text-amber-400 tabular-nums">
                      {formatPrice(order.total, currency)}
                    </span>
                  </div>

                  <button
                    onClick={() => openWhatsAppOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>تتبع عبر الواتساب</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
