import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { ResellerProfitCard } from './ResellerProfitCard';
import {
  ShoppingBag,
  Zap,
  Star,
  Eye,
  Store,
  ChevronRight,
  ChevronLeft,
  Images,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isDarkMode: boolean;
  resellerCode?: string;
  onOrderNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isDarkMode,
  resellerCode,
  onOrderNow,
  onAddToCart,
  onViewDetails,
}) => {
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  const currentImage = imagesList[activeImageIndex] || product.image;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article
      className={`group rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? 'bg-[#181818] border-slate-800 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/60 text-slate-100'
          : 'bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-xl hover:shadow-slate-200/60 text-slate-900'
      }`}
    >
      {/* Product Image Area with Gallery */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative w-full aspect-[4/3] bg-black/10 overflow-hidden cursor-pointer select-none"
      >
        <img
          src={hasError ? product.fallbackImage : currentImage}
          alt={`${product.title} - صورة ${activeImageIndex + 1}`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Carousel controls if > 1 image */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-sm"
              title="الصورة السابقة"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-sm"
              title="الصورة التالية"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-amber-500/20">
              <Images className="w-3 h-3 text-amber-400" />
              <span>
                {activeImageIndex + 1} / {imagesList.length}
              </span>
            </div>

            <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 px-4">
              {imagesList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex
                      ? 'w-5 bg-amber-400 shadow-xs'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`الانتقال إلى صورة ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 items-end">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-md">
              {product.badge}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
              خصم {discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Product Content & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Vendor Tag */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="text-[11px] font-bold text-amber-500">
              {product.categoryNameAr}
            </span>
            {product.vendor && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Store className="w-3 h-3 text-amber-400" />
                <span>{product.vendor.name}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer group-hover:text-amber-500 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Pricing with Currency Converter support */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-amber-500 tabular-nums">
              {formatPrice(product.price, currency)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatPrice(product.originalPrice, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Actions bar: Order Now, Add to Cart, Profit Calculator Toggle */}
        <div className="pt-2 border-t border-slate-700/30 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOrderNow(product)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>اطلب الآن</span>
            </button>

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="إضافة إلى السلة"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowProfitCalculator(!showProfitCalculator)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                showProfitCalculator
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : isDarkMode
                  ? 'bg-[#121212] hover:bg-slate-800 text-amber-400 border-amber-500/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="عرض حاسبة أرباح المسوق لهذا المنتج"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Toggleable Live Reseller Profit Card */}
          {showProfitCalculator && (
            <div className="pt-2 animate-in fade-in duration-200">
              <ResellerProfitCard
                product={product}
                currency={currency}
                resellerCode={resellerCode}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
