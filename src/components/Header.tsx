import React from 'react';
import {
  ShoppingBag,
  Search,
  PhoneCall,
  Truck,
  Clock,
  Store,
  Sparkles,
  Bot,
  Sun,
  Moon,
  DollarSign,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { STORE_WHATSAPP_NUMBER } from '../data/products';
import { Currency, AppTheme } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenHistory: () => void;
  onOpenMerchantModal: () => void;
  onOpenResellerModal?: () => void;
  onOpenBuyerAssistant: () => void;
  savedOrdersCount: number;
  theme: AppTheme;
  onToggleTheme: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenHistory,
  onOpenMerchantModal,
  onOpenResellerModal,
  onOpenBuyerAssistant,
  savedOrdersCount,
  theme,
  onToggleTheme,
  currency,
  onToggleCurrency,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const isDarkMode = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDarkMode
          ? 'bg-[#121212]/95 border-amber-500/20 text-slate-100'
          : 'bg-[#F9F9FB]/95 border-slate-200 text-slate-900'
      }`}
    >
      {/* Iraqi Trust & Shipping Notice Bar */}
      <div
        className={`text-xs py-1.5 px-4 font-medium border-b transition-colors ${
          isDarkMode
            ? 'bg-[#0a0a0a] text-slate-300 border-amber-500/15'
            : 'bg-slate-900 text-slate-200 border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>توصيل سريع لكافة محافظات العراق الـ 18 | الدفع نقداً عند الاستلام (COD)</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 shrink-0">
            {/* Currency Switcher: IQD / USD */}
            <button
              type="button"
              onClick={onToggleCurrency}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-500/30'
              }`}
              title="التبديل بين الدينار العراقي (IQD) والدولار الأمريكي (USD)"
            >
              <span>{currency === 'IQD' ? 'د.ع (IQD)' : '$ USD'}</span>
            </button>

            {/* Theme Controller: Dark / Light */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-[11px] font-semibold transition-all"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
              <span className="hidden sm:inline">{isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
            </button>

            {/* User Auth (Google Sign-In) */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[11px] text-amber-400 font-bold truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-400 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors font-bold"
                title="تسجيل الدخول بحساب Google"
              >
                <LogIn className="w-3 h-3 text-amber-400" />
                <span>دخول</span>
              </button>
            )}

            <span className="hidden md:inline text-slate-600">|</span>
            <a
              href={`https://wa.me/${STORE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              خدمة الزبائن
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Brand title (Brushed Gold & Matte Charcoal) */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-['Plus_Jakarta_Sans'] border border-amber-300/40">
              UR
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                UR Store <span className="text-amber-500 text-sm">يور ستور</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
                منصة التسويق والدروب شيبينغ العراقية
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Search input for quick product lookup */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج، متجر، أو تصنيف..."
              className={`w-full text-xs sm:text-sm rounded-xl py-2 pr-9 pl-4 border transition-all outline-none ${
                isDarkMode
                  ? 'bg-[#1a1a1a] text-white placeholder:text-slate-500 border-slate-700/60 focus:border-amber-500'
                  : 'bg-slate-100 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-amber-500 focus:bg-white'
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-amber-400"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Actions (Buyer Assistant, Merchant, Reseller Portal, Cart) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Buyer Assistant AI Button */}
          <button
            onClick={onOpenBuyerAssistant}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs active:scale-95 hover:bg-amber-500/30"
            title="ذكاء المبيعات واختيار الهدايا"
          >
            <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">مساعد الهدايا الذكي</span>
            <span className="md:hidden">مساعد الذكاء</span>
          </button>

          {/* Reseller Button with Matte Charcoal & Gold Aesthetic */}
          {onOpenResellerModal && (
            <button
              onClick={onOpenResellerModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs active:scale-95 border ${
                isDarkMode
                  ? 'bg-[#1e1e1e] hover:bg-[#252525] text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
              }`}
              title="أدوات المسوق (حاسبة الأرباح وتتبع العمولات)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>أدوات المسوق</span>
            </button>
          )}

          {/* Merchant button */}
          <button
            onClick={onOpenMerchantModal}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 border ${
              isDarkMode
                ? 'bg-[#181818] hover:bg-[#222] text-slate-200 border-slate-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300/80'
            }`}
            title="سجّل كتاجر وأضف منتجاتك للسوق"
          >
            <Store className="w-4 h-4 text-amber-500 shrink-0" />
            <span>إضافة منتج</span>
          </button>

          {savedOrdersCount > 0 && (
            <button
              onClick={onOpenHistory}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors border ${
                isDarkMode
                  ? 'bg-[#1a1a1a] hover:bg-[#242424] text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="طلباتي وتتبع الشحنات"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>طلباتي ({savedOrdersCount})</span>
            </button>
          )}

          {/* Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            aria-label="سلة التسوق"
          >
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline font-extrabold">السلة</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-xs font-black flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
