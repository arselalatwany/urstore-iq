import React from 'react';
import { STORE_WHATSAPP_NUMBER } from '../data/products';
import { ShieldCheck, Truck, RotateCcw, Headphones, PhoneCall, Sparkles } from 'lucide-react';

interface FooterProps {
  isDarkMode?: boolean;
  onOpenResellerModal?: () => void;
  onOpenBuyerAssistant?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isDarkMode = true,
  onOpenResellerModal,
  onOpenBuyerAssistant,
}) => {
  return (
    <footer
      className={`pt-12 pb-8 mt-16 border-t transition-colors ${
        isDarkMode
          ? 'bg-[#101010] text-slate-300 border-amber-500/20'
          : 'bg-slate-900 text-slate-300 border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">توصيل لـ 18 محافظة</h4>
              <p className="text-xs text-slate-400">بغداد خلال 24 ساعة، وكافة المحافظات 24-48 ساعة</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">الدفع عند الاستلام (COD)</h4>
              <p className="text-xs text-slate-400">افحص طردك وتأكد من جودته قبل تسليم المبلغ للكابتن</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <RotateCcw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">نموذج دروب شيبينغ عراقي</h4>
              <p className="text-xs text-slate-400">ابدأ عملك التجاري بدون مخزون وبدون رأس مال مسبق</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Headphones className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">خدمة عملاء مباشرة</h4>
              <p className="text-xs text-slate-400">فريقنا متواجد يومياً للرد على استفساراتكم عبر الواتساب</p>
            </div>
          </div>
        </div>

        {/* Brand & Editorial Column */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center font-['Plus_Jakarta_Sans'] shadow-md shadow-amber-500/20">
              UR
            </div>
            <div>
              <span className="text-lg font-bold text-white block">
                UR Store · يور ستور العراق
              </span>
              <span className="text-xs text-slate-400">منصة التجارة الإلكترونية الفاخرة للزبائن والمسوقين</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {onOpenBuyerAssistant && (
              <button
                type="button"
                onClick={onOpenBuyerAssistant}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                مساعد الهدايا الذكي
              </button>
            )}
            <span className="text-slate-700">·</span>
            {onOpenResellerModal && (
              <button
                type="button"
                onClick={onOpenResellerModal}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                أدوات المسوق (حاسبة الأرباح)
              </button>
            )}
            <span className="text-slate-700">·</span>
            <a
              href={`https://wa.me/${STORE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>واتساب خدمة العملاء</span>
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800/80">
          جميع الحقوق محفوظة © {new Date().getFullYear()} UR Store (سوق أور). الهوية البصرية: Matte Charcoal & Gold.
        </div>
      </div>
    </footer>
  );
};
