import React, { useState, useRef } from 'react';
import { Product, ProductCategory, Governorate, Vendor } from '../types';
import { IRAQI_GOVERNORATES } from '../data/governorates';
import { validateIraqiPhone } from '../utils/formatters';
import {
  X,
  Store,
  PackagePlus,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  UploadCloud,
  Trash2,
  ShieldAlert,
  HelpCircle,
  Plus,
  Star,
  Layers,
} from 'lucide-react';

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: Product) => void;
}

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
}

const SAMPLE_IMAGE_PRESETS = [
  {
    label: 'أزياء وستريت وير',
    category: 'fashion',
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'عناية ومستحضرات',
    category: 'beauty',
    url: 'https://images.unsplash.com/photo-1608248597359-00f205b38fba?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'أجهزة وإلكترونيات',
    category: 'electronics',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'المنزل والديكور',
    category: 'home',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  },
];

export const MerchantModal: React.FC<MerchantModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  // Merchant details
  const [merchantName, setMerchantName] = useState('');
  const [merchantPhone, setMerchantPhone] = useState('');
  const [merchantGovId, setMerchantGovId] = useState('baghdad');

  // Product details
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState<'fashion' | 'beauty' | 'home' | 'electronics'>('fashion');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [imageUploadMode, setImageUploadMode] = useState<'file' | 'url'>('file');
  const [productDescription, setProductDescription] = useState('');
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentGov = IRAQI_GOVERNORATES.find((g) => g.id === merchantGovId) || IRAQI_GOVERNORATES[0];

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadWarning(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      setUploadWarning('لقد وصلت بالفعل للحد الأقصى وهو 5 صور لكل منتج.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesArray = Array.from(files);
    let selectedFiles = filesArray;

    if (filesArray.length > remainingSlots) {
      selectedFiles = filesArray.slice(0, remainingSlots);
      setUploadWarning(`تم تحديد أول ${remainingSlots} صور فقط للالتزام بالحد الأقصى (5 صور لكل منتج).`);
    }

    let processedCount = 0;
    const newPhotos: UploadedPhoto[] = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setUploadWarning('تم تخطي بعض الملفات لأنها ليست بصيغة صورة صالحة.');
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setUploadWarning('حجم إحدى الصور تجاوز 8 ميجابايت وتم استثناؤها.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: result,
          name: file.name,
        });

        processedCount++;
        if (processedCount === selectedFiles.length) {
          setUploadedPhotos((prev) => {
            const combined = [...prev, ...newPhotos].slice(0, 5);
            return combined;
          });
          setErrors((prev) => {
            const rest = { ...prev };
            delete rest.productImage;
            return rest;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
    setUploadWarning(null);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setUploadedPhotos((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleClearAllPhotos = () => {
    setUploadedPhotos([]);
    setUploadWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    if (uploadedPhotos.length >= 5) {
      setUploadWarning('الحد الأقصى هو 5 صور لكل منتج.');
      return;
    }
    setUploadedPhotos((prev) => [
      ...prev,
      {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url,
        name: 'صورة نموذجية',
      },
    ]);
  };

  const validate = () => {
    const err: Record<string, string> = {};

    if (!merchantName.trim() || merchantName.trim().length < 2) {
      err.merchantName = 'يرجى إدخال اسم المتجر أو البيج';
    }

    if (!merchantPhone.trim()) {
      err.merchantPhone = 'يرجى إدخال رقم واتساب التاجر للتواصل وتنسيق الاستلام';
    } else if (!validateIraqiPhone(merchantPhone)) {
      err.merchantPhone = 'يرجى إدخال رقم عراقي صحيح (مثل 07701234567 أو 0780xxxxxxx)';
    }

    if (!productTitle.trim() || productTitle.trim().length < 3) {
      err.productTitle = 'يرجى كتابة عنوان واضح للمنتج';
    }

    const priceNum = parseInt(productPrice.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceNum) || priceNum < 1000) {
      err.productPrice = 'يرجى تحديد سعر مناسب بالدينار العراقي (أكبر من 1,000 د.ع)';
    }

    if (imageUploadMode === 'file' && uploadedPhotos.length === 0) {
      err.productImage = 'يرجى رفع صورة واحدة على الأقل للمنتج (حتى 5 صور)';
    } else if (imageUploadMode === 'url' && !productImage.trim() && uploadedPhotos.length === 0) {
      err.productImage = 'يرجى وضع رابط صورة المنتج أو اختيار نموذج جاهز';
    }

    if (!productDescription.trim() || productDescription.trim().length < 10) {
      err.productDescription = 'يرجى كتابة وصف ومواصفات المنتج (المقاسات، الألوان، الخامة)';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const priceNum = parseInt(productPrice.replace(/[^0-9]/g, ''), 10);

    const categoryNames: Record<string, string> = {
      fashion: 'أزياء وملابس',
      beauty: 'جمال وعناية بالبشرة',
      home: 'المنزل والمطبخ',
      electronics: 'إلكترونيات',
    };

    let finalImages: string[] = [];
    if (uploadedPhotos.length > 0) {
      finalImages = uploadedPhotos.map((p) => p.url);
    } else if (productImage.trim()) {
      finalImages = [productImage.trim()];
    } else {
      const preset = SAMPLE_IMAGE_PRESETS.find((p) => p.category === productCategory)?.url;
      finalImages = [preset || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'];
    }

    const finalImage = finalImages[0];

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: merchantName.trim(),
      phone: merchantPhone.trim(),
      governorateId: currentGov.id,
      governorateNameAr: currentGov.nameAr,
      isVerified: true,
    };

    const newProduct: Product = {
      id: `ur-user-${Date.now()}`,
      title: productTitle.trim(),
      titleEn: productTitle.trim(),
      category: productCategory,
      categoryNameAr: categoryNames[productCategory] || 'عام',
      price: priceNum,
      image: finalImage,
      images: finalImages,
      fallbackImage: finalImage,
      badge: 'إدراج حديث ⚡',
      vendor: newVendor,
      description: productDescription.trim(),
      features: [
        `البائع: ${merchantName.trim()} (${currentGov.nameAr})`,
        'متاح للتوصيل السريع والدفع عند الاستلام',
        'معاينة وفحص كافة الصور والمنتج قبل الدفع',
      ],
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
    };

    onProductAdded(newProduct);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-white to-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                انضم كتاجر / أضف منتجك إلى سوق أور
              </h3>
              <p className="text-xs text-slate-500">
                فرصة لأصحاب المتاجر الإلكترونية وصفحات الإنستغرام والفيسبوك لبيع منتجاتهم في كل العراق
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">تم إدراج منتجك بنجاح!</h4>
            <p className="text-sm text-slate-600 max-w-md">
              أصبح منتجك معروضاً الآن في الواجهة الرئيسية مع شارة البائع الخاصة بمتجرك "{merchantName}".
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
            {/* 1. Merchant Profile Section */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <Store className="w-4 h-4 text-amber-600" />
                <span>1. معلومات المتجر أو البيج (Merchant Info)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المتجر / البيج <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="مثال: Style_IQ أو Baghdad_Store"
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none"
                  />
                  {errors.merchantName && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.merchantName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الواتساب للتواصل <span className="text-red-500">*</span>
                  </label>
                  <input
                    dir="ltr"
                    type="tel"
                    value={merchantPhone}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    placeholder="0770 123 4567"
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {errors.merchantPhone && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.merchantPhone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المحافظة / المدينة المتواجد بها مخزنك <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={merchantGovId}
                    onChange={(e) => setMerchantGovId(e.target.value)}
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    {IRAQI_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Product Details Section */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-2">
                <PackagePlus className="w-4 h-4 text-amber-600" />
                <span>2. تفاصيل المنتج المعروض (Product Info)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان المنتج <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="مثال: قميص لينين صيفي فاخر بقصة مريحة"
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none"
                  />
                  {errors.productTitle && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.productTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التصنيف <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) =>
                      setProductCategory(e.target.value as any)
                    }
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="fashion">أزياء وملابس</option>
                    <option value="beauty">جمال وعناية بالبشرة</option>
                    <option value="home">المنزل والمطبخ</option>
                    <option value="electronics">إلكترونيات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر بالدينار العراقي (IQD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="مثال: 30000"
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {errors.productPrice && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.productPrice}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      صورة المنتج <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('file')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          imageUploadMode === 'file'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        رفع من الجهاز / الهاتف
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          imageUploadMode === 'url'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        رابط أو نماذج جاهزة
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === 'file' ? (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleFiles}
                        className="hidden"
                        id="merchant-image-file"
                      />

                      {/* Upload Warning */}
                      {uploadWarning && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{uploadWarning}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadWarning(null)}
                            className="text-amber-800 hover:text-amber-950 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Header counter / Status */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            صور المنتج المعروضة
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              uploadedPhotos.length === 5
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {uploadedPhotos.length} / 5 صور
                          </span>
                        </div>
                        {uploadedPhotos.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllPhotos}
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف كافة الصور
                          </button>
                        )}
                      </div>

                      {/* Multi-Image Thumbnail Gallery */}
                      {uploadedPhotos.length > 0 ? (
                        <div className="border border-slate-200 bg-slate-50/60 rounded-2xl p-3 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                            {uploadedPhotos.map((photo, idx) => (
                              <div
                                key={photo.id}
                                className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-square shadow-2xs transition-all ${
                                  idx === 0
                                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <img
                                  src={photo.url}
                                  alt={`صورة ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge on Photo #1 */}
                                {idx === 0 ? (
                                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-slate-950" />
                                    الرئيسية
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimary(idx)}
                                    className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="اجعلها الصورة الرئيسية للمنتج"
                                  >
                                    اجعلها رئيسية
                                  </button>
                                )}

                                {/* Delete button on photo */}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.id)}
                                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  title="حذف هذه الصورة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Photo Index */}
                                <span className="absolute bottom-1 right-1.5 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                                  {idx + 1}
                                </span>
                              </div>
                            ))}

                            {/* Add More Slots (if < 5) */}
                            {uploadedPhotos.length < 5 && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-xl aspect-square flex flex-col items-center justify-center text-center p-2 transition-colors group cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-amber-900 leading-tight">
                                  + إضافة صورة
                                </span>
                                <span className="text-[10px] text-amber-700/80 mt-0.5">
                                  متبقي {5 - uploadedPhotos.length}
                                </span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <span>💡 نصيحة: الصورة الأولى (الرئيسية) هي التي ستظهر في قائمة المعروضات.</span>
                            {uploadedPhotos.length < 5 && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-amber-700 font-bold hover:underline"
                              >
                                تصفح المزيد من الصور...
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="merchant-image-file"
                          className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            انقر لاختيار حتى 5 صور من ألبوم الهاتف أو الكمبيوتر
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            يمكنك اختيار أكثر من صورة معاً (Multiple Selection) بصيغ PNG, JPG, WebP
                          </span>
                          <span className="mt-2 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                            يدعم حتى 5 صور لكل منتج 📸
                          </span>
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={productImage}
                          onChange={(e) => setProductImage(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="flex-1 text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none font-mono text-left"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!productImage.trim()) return;
                            handleAddPresetPhoto(productImage.trim());
                            setProductImage('');
                          }}
                          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
                        >
                          + إضافة
                        </button>
                      </div>

                      {/* Quick Image Presets */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[11px] text-slate-500">نماذج سريعة للتجربة:</span>
                        {SAMPLE_IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              handleAddPresetPhoto(preset.url);
                              setProductCategory(preset.category as any);
                            }}
                            className="text-[11px] bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* If any photos added via URL or preset */}
                      {uploadedPhotos.length > 0 && (
                        <div className="pt-2">
                          <span className="text-xs font-bold text-slate-700 block mb-1.5">
                            الصور المضافة ({uploadedPhotos.length} / 5):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {uploadedPhotos.map((photo, idx) => (
                              <div
                                key={photo.id}
                                className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-300"
                              >
                                <img
                                  src={photo.url}
                                  alt={`صورة ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {idx === 0 && (
                                  <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[8px] text-center font-bold">
                                    رئيسية
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.id)}
                                  className="absolute top-0.5 left-0.5 bg-red-600 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Safety & Content Policy Disclaimer Note */}
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-300/80 text-amber-950 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5 text-amber-900">
                        تنبيه وسياسة المحتوى والصور (Safety & Content Policy):
                      </span>
                      <p className="text-[11px] leading-relaxed text-amber-900/90">
                        يجب أن تكون كافة الصور المرفوعة لائقة، ذات دقة وجودة عالية، ومخصصة حصراً للمنتج المعروض. يُمنع منعاً باتاً رفع أي صور خادشة للحياء، غير محتشمة، أو مضللة للمشترين حفاظاً على معايير السوق العراقي والآداب العامة وسياسة الجودة لمتجر UR Store.
                      </p>
                    </div>
                  </div>

                  {errors.productImage && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.productImage}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وصف المنتج ومواصفاته (المقاسات، الألوان، الخامة) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="اكتب مواصفات المنتج، المقاسات المتوفرة، طريقة الاستخدام وأي تفاصيل مهمة للزبون..."
                    className="w-full text-sm rounded-xl py-2.5 px-3 border border-slate-200 bg-white focus:border-amber-500 focus:outline-none"
                  />
                  {errors.productDescription && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.productDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms notice */}
            <div className="text-[11px] text-slate-500 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>
                عند طلب الزبون لمنتجك، يتم إشعارك فوراً عبر الواتساب لتجهيز الطرد واستلامه بواسطة كابتن التوصيل مع تحصيل المبلغ وتسليمه لمتجرك نقداً.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                <span>إدراج المنتج في السوق (Submit Product for Listing) ⚡</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
