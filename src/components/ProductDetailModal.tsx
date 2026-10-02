import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { ResellerProfitCard } from './ResellerProfitCard';
import {
  X,
  Star,
  CheckCircle,
  Truck,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Plus,
  Minus,
  Store,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Images,
  Sparkles,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  currency: Currency;
  isDarkMode: boolean;
  resellerCode?: string;
  onClose: () => void;
  onOrderNow: (product: Product, quantity: number, size?: string, color?: string) => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isDarkMode,
  resellerCode,
  onClose,
  onOrderNow,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.name || '');
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setHasError(false);
  }, [product.id]);

  const currentImage = imagesList[activeImageIdx] || product.image;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row ${
          isDarkMode
            ? 'bg-[#161616] border-amber-500/30 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isDarkMode
              ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
              : 'bg-white/90 text-slate-700 hover:bg-white'
          }`}
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Area with Gallery */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-between shrink-0 relative p-3 sm:p-4 ${
            isDarkMode ? 'bg-[#111111]' : 'bg-slate-100'
          }`}
        >
          {/* Main Large Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/20 shadow-inner group">
            <img
              src={hasError ? product.fallbackImage : currentImage}
              alt={`${product.title} - صورة ${activeImageIdx + 1}`}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Previous / Next Controls if > 1 image */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 shadow-md"
                  aria-label="الصورة السابقة"
                  title="الصورة السابقة"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 shadow-md"
                  aria-label="الصورة التالية"
                  title="الصورة التالية"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-500/20">
                  <Images className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    صورة {activeImageIdx + 1} من {imagesList.length}
                  </span>
                </div>
              </>
            )}

            {product.badge && (
              <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Interactive Thumbnails Bar */}
          {imagesList.length > 1 && (
            <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIdx(idx);
                    setHasError(false);
                  }}
                  className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-sm'
                      : 'border-slate-700/60 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`عرض الصورة ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`مصغرة ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-500">{product.categoryNameAr}</span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="tabular-nums">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} تقييم)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black leading-snug">
              {product.title}
            </h2>

            {/* Price Box with Currency Conversion */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-500 tabular-nums">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
              {discountPercent && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold px-2 py-0.5 rounded-md">
                  وفر {discountPercent}%
                </span>
              )}
            </div>

            {/* Reseller Profit & Share Toggle Button */}
            <button
              type="button"
              onClick={() => setShowProfitCalculator(!showProfitCalculator)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                showProfitCalculator
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : isDarkMode
                  ? 'bg-[#1b1c22] hover:bg-[#22242c] text-amber-300 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>أدوات المسوق (حاسبة الأرباح ورابط المشاركة بنقرة واحدة)</span>
              </div>
              <span className="text-[11px] underline">
                {showProfitCalculator ? 'إخفاء' : 'عرض'}
              </span>
            </button>

            {/* Live Profit & Share Card */}
            {showProfitCalculator && (
              <ResellerProfitCard
                product={product}
                currency={currency}
                resellerCode={resellerCode}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Vendor Box */}
            {product.vendor && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDarkMode
                    ? 'bg-[#141519] border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{product.vendor.name}</span>
                      {product.vendor.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      متجر مسجل · {product.vendor.governorateNameAr}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 bg-black/20 px-2 py-1 rounded border border-slate-700/40">
                  شحن من {product.vendor.governorateNameAr.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Features Bullet List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">المميزات الرئيسية:</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes */}
            {product.sizes && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المقاس / السعة
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        selectedSize === sz
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : isDarkMode
                          ? 'bg-[#18191f] text-slate-300 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اللون المختار: <span className="text-amber-400 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColor === c.name
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                          : isDarkMode
                          ? 'border-slate-700 bg-[#18191f] text-slate-300'
                          : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">الكمية المطلوبة:</span>
              <div className="flex items-center gap-2 border border-slate-700 rounded-xl p-1 bg-black/20">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-sm tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onOrderNow(product, quantity, selectedSize, selectedColor);
                  onClose();
                }}
                className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>اطلب الآن فوراً</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, quantity, selectedSize, selectedColor);
                  onClose();
                }}
                className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>إضافة للسلة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
