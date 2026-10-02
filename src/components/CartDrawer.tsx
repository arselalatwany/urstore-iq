import React from 'react';
import { OrderItem, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Zap } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  currency: Currency;
  isDarkMode: boolean;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  isDarkMode,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 pr-6 sm:pr-10">
        <div
          className={`w-screen max-w-md shadow-2xl flex flex-col border-r transition-colors ${
            isDarkMode
              ? 'bg-[#141518] text-slate-100 border-amber-500/20'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          {/* Drawer Header */}
          <div
            className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-[#18191f] border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold">سلة المشتريات</h2>
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full tabular-nums">
                {items.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              aria-label="إغلاق السلة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <ShoppingBag className="w-14 h-14 stroke-1 mb-3 text-slate-500" />
                <p className="text-sm font-bold">سلة التسوق فارغة حالياً</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  تصفح المنتجات وأضف ما يعجبك لإتمام الشراء بالدفع عند الاستلام
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className={`p-3 rounded-2xl border flex gap-3 transition-colors ${
                    isDarkMode
                      ? 'bg-[#1a1b22] border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.product.fallbackImage;
                    }}
                    className="w-16 h-16 rounded-xl object-cover bg-black/20 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold truncate">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {item.selectedSize && <span>المقاس: {item.selectedSize}</span>}
                        {item.selectedColor && <span>اللون: {item.selectedColor}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-sm font-black text-amber-500 tabular-nums">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-black/20 border border-slate-700/60 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div
              className={`p-4 sm:p-5 border-t space-y-3 shrink-0 ${
                isDarkMode ? 'bg-[#18191f] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">المجموع الفرعي للمنتجات:</span>
                <span className="font-mono text-base font-black text-amber-500 tabular-nums">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>🚚 يتم احتساب أجور الشحن عند اختيار المحافظة في الخطوة القادمة</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <span>متابعة إتمام الطلب (COD)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
