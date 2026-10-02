import React, { useState } from 'react';
import { OrderSubmission } from '../types';
import { formatIQD } from '../utils/formatters';
import { openWhatsAppOrder, buildWhatsAppMessage, getWhatsAppUrl } from '../utils/whatsapp';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Truck,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: OrderSubmission | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopy = () => {
    const text = buildWhatsAppMessage(order);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = getWhatsAppUrl(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1">تم استلام طلبك بنجاح!</h2>
        <p className="text-sm text-slate-600 mb-5">
          شكراً لتسوقك من <span className="font-bold text-amber-600">متجر أور (UR Store)</span>
        </p>

        {/* Order Reference Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-right mb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <span className="text-xs text-slate-500 font-semibold">رقم الطلب:</span>
            <span className="font-mono text-base font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
              #{order.orderId}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {order.governorateNameAr} - {order.detailedAddress}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>النقطة الدالة: {order.nearestLandmark}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span dir="ltr" className="font-mono font-bold text-slate-800">
                {order.customerPhone}
              </span>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">المبلغ المطلوب عند الاستلام:</span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                شامل أجور التوصيل
              </span>
            </div>
            <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
              {formatIQD(order.total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>إرسال تفاصيل الطلب عبر الواتساب الآن</span>
          </a>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">تم نسخ تفاصيل الطلب للحافظة</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>نسخ تفاصيل الفاتورة</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors pt-2"
          >
            العودة ومتابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
};
