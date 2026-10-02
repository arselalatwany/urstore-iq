import React, { useState, useEffect } from 'react';
import { Product, OrderItem, OrderSubmission } from '../types';
import { IRAQI_GOVERNORATES } from '../data/governorates';
import { formatIQD, generateOrderId, validateIraqiPhone } from '../utils/formatters';
import { openWhatsAppOrder } from '../utils/whatsapp';
import { createFirestoreOrder } from '../utils/firestoreService';
import {
  X,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  MapPin,
  User,
  Phone,
  MessageCircle,
  AlertCircle,
  Package,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If ordering a single product directly
  directProduct?: Product | null;
  // If ordering items from cart
  cartItems?: OrderItem[];
  onOrderSuccess: (order: OrderSubmission) => void;
  resellerCode?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directProduct,
  cartItems = [],
  onOrderSuccess,
  resellerCode,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState('baghdad');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Single direct item options
  const [singleQty, setSingleQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize variant defaults when product opens
  useEffect(() => {
    if (directProduct) {
      setSingleQty(1);
      setSelectedSize(directProduct.sizes?.[0] || '');
      setSelectedColor(directProduct.colors?.[0]?.name || '');
      setErrors({});
    }
  }, [directProduct]);

  if (!isOpen) return null;

  // Selected Governorate object
  const currentGov =
    IRAQI_GOVERNORATES.find((g) => g.id === selectedGovernorateId) || IRAQI_GOVERNORATES[0];

  // Resolve items being checked out
  const checkoutItems: OrderItem[] = directProduct
    ? [
        {
          product: directProduct,
          quantity: singleQty,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
        },
      ]
    : cartItems;

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Free shipping threshold in Iraq (e.g. 75,000 IQD)
  const isFreeDelivery = subtotal >= 75000;
  const deliveryFee = isFreeDelivery ? 0 : currentGov.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'يرجى كتابة الاسم الكامل (الاسم الثنائي أو الثلاثي على الأقل)';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'يرجى إدخال رقم هاتف فعال للتواصل مع المندوب';
    } else if (!validateIraqiPhone(phoneNumber)) {
      newErrors.phoneNumber = 'يرجى إدخال رقم عراقي صحيح (مثال: 07701234567 أو 0780xxxxxxx)';
    }

    if (!detailedAddress.trim() || detailedAddress.trim().length < 5) {
      newErrors.detailedAddress = 'يرجى كتابة عنوان التوصيل (المنطقة، الشارع، أو المحلة)';
    }

    if (!nearestLandmark.trim()) {
      newErrors.nearestLandmark = 'أقرب نقطة دالة مهمة جداً لسرعة وصول مندوب التوصيل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = (openWhatsApp: boolean = true) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Calculate estimated reseller profit margin
    const resellerProfit = checkoutItems.reduce((sum, it) => {
      const cost = it.product.resellerCost || Math.round(it.product.price * 0.7);
      return sum + (it.product.price - cost) * it.quantity;
    }, 0);

    const submission: OrderSubmission = {
      orderId: generateOrderId(),
      customerName: fullName.trim(),
      customerPhone: phoneNumber.trim(),
      governorateId: currentGov.id,
      governorateNameAr: currentGov.nameAr,
      detailedAddress: detailedAddress.trim(),
      nearestLandmark: nearestLandmark.trim(),
      notes: notes.trim() || undefined,
      items: checkoutItems,
      subtotal,
      deliveryFee,
      total: grandTotal,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      resellerCode: resellerCode || undefined,
      resellerCommission: resellerProfit,
    };

    if (openWhatsApp) {
      openWhatsAppOrder(submission);
    }

    // Persist order to Firestore in real-time
    createFirestoreOrder(submission).catch((err) => {
      console.warn('Firestore order sync fallback:', err);
    });

    // Persist order to local storage
    try {
      const stored = localStorage.getItem('ur_store_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(submission);
      localStorage.setItem('ur_store_orders', JSON.stringify(orders.slice(0, 20)));
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(submission);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                إتمام الطلب السريع (Cash on Delivery)
              </h2>
              <p className="text-xs text-slate-500">
                التوصيل متوفر لجميع المحافظات الـ 18 · الدفع نقداً عند استلام الشحنة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Selected Product Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">
              ملخص المنتجات المطلوبة
            </h3>

            <div className="space-y-3">
              {checkoutItems.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/60"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.product.fallbackImage;
                    }}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    {item.product.vendor && (
                      <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                        <span>البائع:</span>
                        <span className="font-bold text-slate-900">{item.product.vendor.name}</span>
                        <span className="text-slate-400">({item.product.vendor.governorateNameAr.split(' ')[0]})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-mono tabular-nums text-slate-800 font-semibold">
                        {formatIQD(item.product.price)}
                      </span>
                      {directProduct && (
                        <>
                          <span>×</span>
                          <span className="font-semibold text-slate-900">{singleQty}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper for direct single product */}
                  {directProduct ? (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
                      <button
                        onClick={() => setSingleQty(Math.max(1, singleQty - 1))}
                        className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-colors"
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-sm tabular-nums">
                        {singleQty}
                      </span>
                      <button
                        onClick={() => setSingleQty(singleQty + 1)}
                        className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-colors"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      الكمية: {item.quantity}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Optional single item size/color selection */}
            {directProduct && (directProduct.sizes || directProduct.colors) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
                {directProduct.sizes && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      المقاس / الحجم
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {directProduct.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            selectedSize === s
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {directProduct.colors && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اللون المفضل
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {directProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            selectedColor === c.name
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Customer & Delivery Form (Iraqi Market Specifics) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>معلومات التوصيل والزبون</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) {
                        setErrors((prev) => ({ ...prev, fullName: '' }));
                      }
                    }}
                    placeholder="مثال: علي حسن كاظم"
                    className={`w-full text-sm rounded-xl py-2.5 pr-10 pl-3 border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                      errors.fullName
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Field 2: Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف (واتساب) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) {
                        setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                      }
                    }}
                    placeholder="0770 123 4567"
                    className={`w-full text-sm rounded-xl py-2.5 px-3 border bg-slate-50 focus:bg-white focus:outline-none transition-all font-mono ${
                      errors.phoneNumber
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.phoneNumber ? (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phoneNumber}
                  </p>
                ) : (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    يتصل بك المندوب على هذا الرقم قبل الوصول
                  </span>
                )}
              </div>
            </div>

            {/* Field 3: 18 Iraqi Governorates Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المحافظة (كافة محافظات العراق الـ 18) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedGovernorateId}
                  onChange={(e) => setSelectedGovernorateId(e.target.value)}
                  className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-semibold appearance-none cursor-pointer"
                >
                  {IRAQI_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {gov.nameAr} - أجور التوصيل: {formatIQD(gov.deliveryFee)} ({gov.deliveryTime})
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-500 font-bold">
                  ▼
                </div>
              </div>
            </div>

            {/* Field 4: Detailed Address & Nearest Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المنطقة والشارع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => {
                    setDetailedAddress(e.target.value);
                    if (errors.detailedAddress) {
                      setErrors((prev) => ({ ...prev, detailedAddress: '' }));
                    }
                  }}
                  placeholder="مثال: المنصور، شارع 14 رمضان، محلة 602"
                  className={`w-full text-sm rounded-xl py-2.5 px-3 border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.detailedAddress
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.detailedAddress && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.detailedAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  أقرب نقطة دالة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nearestLandmark}
                  onChange={(e) => {
                    setNearestLandmark(e.target.value);
                    if (errors.nearestLandmark) {
                      setErrors((prev) => ({ ...prev, nearestLandmark: '' }));
                    }
                  }}
                  placeholder="مثال: قرب صيدلية النرجس أو مقابل جامع الهدى"
                  className={`w-full text-sm rounded-xl py-2.5 px-3 border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.nearestLandmark
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.nearestLandmark && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nearestLandmark}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ملاحظات إضافية للمندوب (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: الاتصال قبل نصف ساعة من الوصول، أو التوصيل بعد الساعة 4 عصراً"
                className="w-full text-sm rounded-xl py-2 px-3 border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. Cost & Delivery Breakdown */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>قيمة المنتجات:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {formatIQD(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span>أجور التوصيل ({currentGov.nameAr}):</span>
                {isFreeDelivery && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    مجاني
                  </span>
                )}
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {isFreeDelivery ? '0 د.ع' : formatIQD(deliveryFee)}
              </span>
            </div>

            <div className="pt-2 border-t border-amber-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-slate-900">المبلغ الإجمالي للدفع:</span>
                <span className="text-[11px] text-slate-500 block">
                  نقداً عند الاستلام بعد فحص الشحنة
                </span>
              </div>
              <span className="text-xl font-extrabold text-slate-950 font-mono tabular-nums">
                {formatIQD(grandTotal)}
              </span>
            </div>
          </div>

          {/* Delivery & Inspection Trust */}
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              يحق لك فتح الطرد ومعاينة المنتج والتأكد من المقاس قبل تسليم المبلغ للمندوب.
            </span>
          </div>
        </div>

        {/* Modal Footer with Primary WhatsApp CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row gap-3">
          {/* Primary Submit Button: Confirm via WhatsApp */}
          <button
            onClick={() => handleConfirmOrder(true)}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2.5 py-3 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa51] text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>تأكيد الطلب عبر الواتساب</span>
          </button>

          {/* Secondary In-Store Confirm */}
          <button
            onClick={() => handleConfirmOrder(false)}
            disabled={isSubmitting}
            className="sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all"
          >
            تأكيد مباشر
          </button>
        </div>
      </div>
    </div>
  );
};
