import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { formatIQD, formatUSD, formatPrice } from '../utils/formatters';
import {
  Share2,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Percent,
} from 'lucide-react';

interface ResellerProfitCardProps {
  product: Product;
  currency: Currency;
  resellerCode?: string;
  isDarkMode: boolean;
}

export const ResellerProfitCard: React.FC<ResellerProfitCardProps> = ({
  product,
  currency,
  resellerCode = 'UR-MND-VIP',
  isDarkMode,
}) => {
  const retailPrice = product.price; // سعر البيع للزبون
  const wholesaleCost = product.resellerCost || Math.round(product.price * 0.65); // سعر التكلفة للمسوق
  const netProfitIQD = retailPrice - wholesaleCost; // صافي الربح = سعر البيع - سعر التكلفة
  const profitMarginPercent = Math.round((netProfitIQD / retailPrice) * 100);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCardText, setCopiedCardText] = useState(false);

  // Direct purchase referral link
  const referralUrl = `${window.location.origin}/?ref=${resellerCode}&product=${product.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyFormattedCardText = () => {
    const formattedPost = `🔥 ${product.title}
💰 السعر: ${formatIQD(retailPrice)} فقط!
🚚 توصيل سريع لجميع محافظات العراق الـ 18
💵 الدفع نقداً عند الاستلام بعد فحص الطرد!
🔗 رابط الشراء والطلب الفوري:
${referralUrl}
كود الخصم والإحالة: ${resellerCode}`;

    navigator.clipboard.writeText(formattedPost);
    setCopiedCardText(true);
    setTimeout(() => setCopiedCardText(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isDarkMode
          ? 'bg-[#18191f] border-amber-500/25 text-slate-100 shadow-lg shadow-black/40'
          : 'bg-gradient-to-br from-amber-50/70 to-white border-amber-300/80 text-slate-900 shadow-sm'
      }`}
    >
      {/* Live Profit Calculator Banner */}
      <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-amber-500">حاسبة أرباح المسوق الحية</h4>
            <span className="text-[10px] text-slate-400">
              [ صافي الربح = سعر البيع - سعر التكلفة ]
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-black tabular-nums">
          +{profitMarginPercent}% هامش ربح
        </div>
      </div>

      {/* Formula breakdown columns */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
        <div className="p-2 rounded-xl bg-black/20 border border-slate-700/40">
          <div className="text-[10px] text-slate-400 mb-0.5">سعر البيع (Retail)</div>
          <div className="font-black tabular-nums text-slate-200">
            {formatPrice(retailPrice, currency)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-black/20 border border-slate-700/40">
          <div className="text-[10px] text-slate-400 mb-0.5">سعر التكلفة (Cost)</div>
          <div className="font-bold tabular-nums text-slate-400 line-through">
            {formatPrice(wholesaleCost, currency)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40">
          <div className="text-[10px] font-bold text-amber-400 mb-0.5">ربحك الصافي</div>
          <div className="font-black tabular-nums text-amber-400 text-sm">
            +{formatPrice(netProfitIQD, currency)}
          </div>
        </div>
      </div>

      {/* One-Click Share Generator */}
      <div className="mt-3 pt-3 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400">
          كود المسوق الخاص بك: <span className="font-mono text-amber-400 font-bold">{resellerCode}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyShareLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            title="نسخ رابط الإحالة المباشر للمنتج"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedLink ? 'تم النسخ!' : 'نسخ رابط الإحالة'}</span>
          </button>

          <button
            type="button"
            onClick={copyFormattedCardText}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="توليد بطاقة منتج مهيأة للمشاركة بنقرة واحدة (انستغرام / تيك توك)"
          >
            {copiedCardText ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedCardText ? 'تم تجهيز المنشور!' : 'مولد بطاقة النشر'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
