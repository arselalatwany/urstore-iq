import React, { useState } from 'react';
import { OrderSubmission, OrderStatus, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { updateOrderStatus } from '../utils/firestoreService';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Wallet,
  DollarSign,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface OrderCommissionTrackerProps {
  orders: OrderSubmission[];
  resellerCode?: string;
  currency: Currency;
  isDarkMode: boolean;
  onRefresh?: () => void;
}

export const OrderCommissionTracker: React.FC<OrderCommissionTrackerProps> = ({
  orders,
  resellerCode,
  currency,
  isDarkMode,
  onRefresh,
}) => {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filter orders by reseller if code provided, or show all customer orders
  const displayOrders = resellerCode
    ? orders.filter((o) => o.resellerCode === resellerCode)
    : orders;

  // Calculate Earned Balance (Delivered orders) & Pending Payout (Pending + Shipped)
  const earnedBalance = displayOrders
    .filter((o) => o.status === 'Delivered')
    .reduce((sum, o) => {
      const comm = o.resellerCommission || Math.round(o.subtotal * 0.3);
      return sum + comm;
    }, 0);

  const pendingPayout = displayOrders
    .filter((o) => o.status === 'Pending' || o.status === 'Shipped')
    .reduce((sum, o) => {
      const comm = o.resellerCommission || Math.round(o.subtotal * 0.3);
      return sum + comm;
    }, 0);

  const deliveredCount = displayOrders.filter((o) => o.status === 'Delivered').length;
  const inTransitCount = displayOrders.filter((o) => o.status === 'Shipped').length;
  const pendingCount = displayOrders.filter((o) => o.status === 'Pending').length;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم التوصيل بنجاح (مستحقة)
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Truck className="w-3.5 h-3.5" />
            قيد الشحن والتسليم
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            ملغي / راجع
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            قيد المعالجة والتجهيز
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Commission Balances Grid (Matte Charcoal & Gold) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Earned Balance Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#18191f] border-amber-500/30 text-white shadow-xl shadow-black/40'
              : 'bg-white border-amber-300 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">الرصيد المكتمل المستحق (Earned Balance)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
            {formatPrice(earnedBalance, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>محصلة عن {deliveredCount} طلب تم تسليمه للزبائن</span>
          </div>
        </div>

        {/* Pending Payout Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#18191f] border-slate-700/60 text-white shadow-xl shadow-black/40'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">أرباح معلقة قيد التوصيل (Pending Payout)</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400 tabular-nums">
            {formatPrice(pendingPayout, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>{inTransitCount} طلب قيد الشحن و {pendingCount} بانتظار التجهيز</span>
          </div>
        </div>
      </div>

      {/* Orders List & Tracking */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDarkMode ? 'bg-[#16171c] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-[#1a1b22] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs sm:text-sm font-black">
              سجل الطلبات وتتبع الحالات ({displayOrders.length})
            </h4>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث حي</span>
            </button>
          )}
        </div>

        {displayOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            لا توجد طلبات مسجلة حالياً بهذا الحساب. ستظهر الطلبات هنا فور إنشائها مع تحديث الأرباح الحية.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[400px] overflow-y-auto">
            {displayOrders.map((order) => {
              const estimatedComm = order.resellerCommission || Math.round(order.subtotal * 0.3);
              const isUpdating = updatingOrderId === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    isDarkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {order.orderId}
                      </span>
                      <span className="text-xs font-semibold">{order.customerName}</span>
                      <span className="text-[11px] text-slate-400">({order.governorateNameAr})</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      إجمالي الطلب: <span className="font-bold text-slate-200">{formatPrice(order.total, currency)}</span>
                      {' · '}
                      عمولة المسوق: <span className="font-bold text-emerald-400">+{formatPrice(estimatedComm, currency)}</span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {getStatusBadge(order.status)}

                    {/* Status Toggle Workflow: Pending -> Shipped -> Delivered -> Cancelled */}
                    <div className="flex items-center gap-1">
                      <select
                        value={order.status || 'Pending'}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border outline-none transition-colors ${
                          isDarkMode
                            ? 'bg-[#1c1d24] border-slate-700 text-slate-200 focus:border-amber-500'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
                        }`}
                      >
                        <option value="Pending">Pending (قيد التجهيز)</option>
                        <option value="Shipped">Shipped (قيد الشحن)</option>
                        <option value="Delivered">Delivered (تم التسليم)</option>
                        <option value="Cancelled">Cancelled (ملغي)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
