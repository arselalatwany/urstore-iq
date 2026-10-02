import React, { useState } from 'react';
import {
  ResellerRegistrationInput,
  ResellerValidationResult,
  ResellerExperienceLevel,
  OrderSubmission,
  Currency,
} from '../types';
import { processResellerRegistration, processResellerJsonString } from '../utils/resellerEngine';
import { saveResellerProfile } from '../utils/firestoreService';
import { IRAQI_GOVERNORATES } from '../data/governorates';
import { formatIQD } from '../utils/formatters';
import { OrderCommissionTracker } from './OrderCommissionTracker';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Share2,
  Terminal,
  Copy,
  Check,
  Building2,
  Phone,
  User,
  MapPin,
  Flame,
  ArrowRight,
  ExternalLink,
  PackageCheck,
  Wallet,
} from 'lucide-react';

interface ResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResellerRegistered?: (resellerData: ResellerValidationResult) => void;
  orders: OrderSubmission[];
  activeResellerCode?: string;
  currency: Currency;
  isDarkMode: boolean;
}

export const ResellerModal: React.FC<ResellerModalProps> = ({
  isOpen,
  onClose,
  onResellerRegistered,
  orders,
  activeResellerCode,
  currency,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'tracker' | 'calculator' | 'engine'>('form');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('بغداد');
  const [salesChannel, setSalesChannel] = useState('Instagram Page');
  const [experienceLevel, setExperienceLevel] = useState<ResellerExperienceLevel>('BEGINNER');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Engine Result State
  const [result, setResult] = useState<ResellerValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Profit Calculator State
  const [calcMonthlyOrders, setCalcMonthlyOrders] = useState(30);
  const [calcAvgProfitPerOrder, setCalcAvgProfitPerOrder] = useState(9000);

  // AI JSON Engine Terminal State
  const [rawJsonInput, setRawJsonInput] = useState(
    JSON.stringify(
      {
        full_name: 'علي حسن السعدي',
        phone_number: '07701234567',
        province: 'بغداد',
        sales_channel: 'Instagram Page (@ali_boutique)',
        experience_level: 'INTERMEDIATE',
        agreed_terms: true,
      },
      null,
      2
    )
  );
  const [rawJsonOutput, setRawJsonOutput] = useState<string>('');
  const [copiedOutput, setCopiedOutput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: ResellerRegistrationInput = {
      full_name: fullName,
      phone_number: phoneNumber,
      province,
      sales_channel: salesChannel,
      experience_level: experienceLevel,
      agreed_terms: agreedTerms,
    };

    const evalResult = processResellerRegistration(payload);
    setResult(evalResult);
    setIsSubmitting(false);

    if (evalResult.isValid) {
      // Save profile into Firestore
      saveResellerProfile(evalResult).catch((err) => {
        console.warn('Firestore reseller profile save fallback:', err);
      });

      if (onResellerRegistered) {
        onResellerRegistered(evalResult);
      }
    }
  };

  const handleTestJson = () => {
    const output = processResellerJsonString(rawJsonInput);
    setRawJsonOutput(output);
  };

  const loadSamplePayload = (type: 'valid' | 'invalid_phone' | 'missing_terms') => {
    if (type === 'valid') {
      const sample = {
        full_name: 'كرار حيدر الجبوري',
        phone_number: '07801987654',
        province: 'البصرة',
        sales_channel: 'TikTok Shop & Live',
        experience_level: 'EXPERT',
        agreed_terms: true,
      };
      setRawJsonInput(JSON.stringify(sample, null, 2));
      setRawJsonOutput(processResellerJsonString(JSON.stringify(sample)));
    } else if (type === 'invalid_phone') {
      const sample = {
        full_name: 'أحمد سامي',
        phone_number: '0123456789',
        province: 'أربيل',
        sales_channel: 'WhatsApp Groups',
        experience_level: 'BEGINNER',
        agreed_terms: true,
      };
      setRawJsonInput(JSON.stringify(sample, null, 2));
      setRawJsonOutput(processResellerJsonString(JSON.stringify(sample)));
    } else if (type === 'missing_terms') {
      const sample = {
        full_name: 'مريم الصالحي',
        phone_number: '07712345678',
        province: 'النجف الأشرف',
        sales_channel: 'Facebook Marketplace',
        experience_level: 'INTERMEDIATE',
        agreed_terms: false,
      };
      setRawJsonInput(JSON.stringify(sample, null, 2));
      setRawJsonOutput(processResellerJsonString(JSON.stringify(sample)));
    }
  };

  const copyResellerId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const monthlyNetProfit = calcMonthlyOrders * calcAvgProfitPerOrder;
  const currentCode = result?.reseller_id || activeResellerCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border ${
          isDarkMode
            ? 'bg-[#141519] border-amber-500/30 text-slate-100 shadow-amber-500/10'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Matte Charcoal & Gold Top Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkMode
              ? 'border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-[#18191f] to-amber-950/20'
              : 'border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-500 tracking-tight">
                  بوابة أدوات المسوق | UR Reseller & Profit System
                </h3>
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  B2B2C Affiliate
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع العمولات، إدارة الطلبات، وحساب الأرباح الصافية بدون رأس مال
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Minimalist Matte & Gold) */}
        <div
          className={`flex border-b px-6 text-xs sm:text-sm font-bold shrink-0 overflow-x-auto no-scrollbar ${
            isDarkMode ? 'border-slate-800 bg-[#101115]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={() => setActiveTab('form')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'form'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>طلب الانضمام كمسوق</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'tracker'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>تتبع الطلبات والعمولات</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'calculator'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>حاسبة الأرباح الحية</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'engine'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>محرك الـ JSON (Onboarding AI)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-right">
          {/* TAB 1: REGISTRATION FORM */}
          {activeTab === 'form' && (
            <>
              {result && result.isValid ? (
                /* Instant Approval Success Screen */
                <div className="bg-[#181920] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2">
                      <Flame className="w-3.5 h-3.5" />
                      الحالة: {result.status} (قبول فوري)
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-amber-400">
                      مبارك! تم اعتمادك كمسوق معتمد في سوق أور
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                      {result.message_ar}
                    </p>
                  </div>

                  {/* Reseller ID Box */}
                  <div className="bg-[#101116] border border-amber-500/30 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">كود المسوق الخاص بك (Reseller ID):</span>
                      <span className="text-lg font-mono font-black text-amber-400 tracking-wider">
                        {result.reseller_id}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyResellerId(result.reseller_id || '')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>

                  {/* Approved Reseller Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right max-w-xl mx-auto pt-2">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-amber-400 block mb-1">هامش الربح المتوقع:</span>
                      <span className="text-xs text-slate-300 font-semibold">
                        {result.details?.wholesale_margin_estimate}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-amber-400 block mb-1">طريقة استلام الأرباح:</span>
                      <span className="text-xs text-slate-300 font-semibold">تحويل فوري (زين كاش أو حوالة)</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-amber-400 block mb-1">التوصيل والتحصيل:</span>
                      <span className="text-xs text-slate-300 font-semibold">تتكفل بها شبكة توصيل سوق أور</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setActiveTab('tracker')}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
                    >
                      فتح لوحة تتبع العمولات والطلبات 📊
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                    >
                      تقديم طلب لمسوق آخر
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-500/10 via-[#181a20] to-amber-500/5 p-4 rounded-2xl border border-amber-500/25 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-amber-400 block">
                        ضمانات نموذج المسوق المستقل (Zero Inventory / No-Risk)
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        لا تشترِ بضاعة ولا تدفع تأمينات. اختر المنتجات وشارك روابطها وصورها مع زبائنك بهامش ربحك الذي تحدده. شبكة سوق أور تتولى التوصيل وتحصيل المبلغ وإيداع صافي أرباحك فوراً.
                      </p>
                    </div>
                  </div>

                  {result && !result.isValid && (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-1">تعذر اعتماد الطلب:</span>
                        <span>{result.message_ar}</span>
                      </div>
                    </div>
                  )}

                  {/* Field 1: Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الاسم الكامل (الثنائي أو الثلاثي) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: علي حسن السعدي"
                        className="w-full bg-[#101115] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 pr-10"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {result?.errors?.full_name && (
                      <p className="text-[11px] text-red-400 mt-1">{result.errors.full_name}</p>
                    )}
                  </div>

                  {/* Field 2: Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم هاتف عراقي فعال (لتحويل الأرباح والتواصل) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="07701234567 أو 0780xxxxxxx أو 0750xxxxxxx"
                        className="w-full bg-[#101115] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 pr-10 font-mono"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      يجب أن يبدأ بـ (077 أو 078 أو 075 أو 079) ومكون من 11 رقماً
                    </span>
                    {result?.errors?.phone_number && (
                      <p className="text-[11px] text-red-400 mt-1">{result.errors.phone_number}</p>
                    )}
                  </div>

                  {/* Field 3: Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        المحافظة العراقية *
                      </label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full bg-[#101115] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {IRAQI_GOVERNORATES.map((g) => (
                          <option key={g.id} value={g.nameAr}>
                            {g.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        قناة البيع الأساسية التي تستخدمها *
                      </label>
                      <input
                        type="text"
                        required
                        value={salesChannel}
                        onChange={(e) => setSalesChannel(e.target.value)}
                        placeholder="مثال: بيج انستغرام، تيك توك شوب، مجاميع واتساب"
                        className="w-full bg-[#101115] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Field 4: Experience Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      مستوى الخبرة في التسويق والتجارة الإلكترونية:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'BEGINNER', title: 'مبتدئ جديد', desc: 'أول تجربة لي' },
                        { id: 'INTERMEDIATE', title: 'متوسط', desc: 'لدي بيج أو زبائن' },
                        { id: 'EXPERT', title: 'محترف', desc: 'مبيعات يومية عالية' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setExperienceLevel(lvl.id as ResellerExperienceLevel)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            experienceLevel === lvl.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                              : 'bg-[#101115] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-black">{lvl.title}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{lvl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="p-3.5 bg-[#0e0f12] rounded-xl border border-slate-800 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed font-semibold">
                        أوافق على شروط وأحكام شبكة المسوقين في سوق أور (UR Store Reseller Policy):
                      </span>
                    </label>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc pr-6">
                      <li>عدم تجاوز المنصة لمحاولة التواصل المباشر مع التجار الموردين.</li>
                      <li>تزويد المنصة بأرقام وعناوين زبائن حقيقية وصحيحة لتجنب رجوع الطرود.</li>
                      <li>تحسب الأرباح تلقائياً وفق معادلة [سعر البيع - سعر الجملة] وتودع فور نجاح التوصيل.</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري التحقق في محرك الذكاء الاصطناعي...' : 'إرسال طلب الانضمام والاعتماد الفوري ✨'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* TAB 2: ORDER & COMMISSION TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-amber-400">
                    نظام تتبع الطلبات والعمولات (Live Order Tracker)
                  </h4>
                  <p className="text-xs text-slate-400">
                    تتبع حالة كل طلب مع حساب فوري للأرباح الصافية المحصلة والمعلقة
                  </p>
                </div>
                {currentCode && (
                  <div className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-mono font-bold">
                    الكود النشط: {currentCode}
                  </div>
                )}
              </div>

              <OrderCommissionTracker
                orders={orders}
                resellerCode={currentCode}
                currency={currency}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* TAB 3: PROFIT CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-amber-400">
                  محاكي الأرباح التفاعلي للمسوقين (Profit Calculator)
                </h4>
                <p className="text-xs text-slate-400">
                  حرك السلايدر لتقدير أرباحك الشهرية وفق معادلة: [صافي الربح = سعر البيع - سعر التكلفة]
                </p>
              </div>

              {/* Formula Card */}
              <div className="p-4 rounded-2xl bg-[#1b1d24] border border-amber-500/20 text-center">
                <span className="text-xs text-slate-400 block mb-1">المعادلة الرسمية للأرباح:</span>
                <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                  صافي ربحك = (سعر البيع للزبون - سعر الجملة الخاص بك)
                </div>
              </div>

              {/* Slider 1: Monthly Orders */}
              <div className="bg-[#101115] p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">عدد الطلبات الناجحة شهرياً:</span>
                  <span className="text-base font-black text-amber-400 font-mono">{calcMonthlyOrders} طلب</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={calcMonthlyOrders}
                  onChange={(e) => setCalcMonthlyOrders(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 طلبات (بداية تجربة)</span>
                  <span>50 طلب (مستوى جيد)</span>
                  <span>150 طلب (نشاط محترف)</span>
                </div>
              </div>

              {/* Slider 2: Average Profit Margin */}
              <div className="bg-[#101115] p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">متوسط ربحك الصافي في القطعة الواحدة:</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {formatIQD(calcAvgProfitPerOrder)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="25000"
                  step="1000"
                  value={calcAvgProfitPerOrder}
                  onChange={(e) => setCalcAvgProfitPerOrder(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>4,000 د.ع (إكسسوارات)</span>
                  <span>10,000 د.ع (أزياء وعطور)</span>
                  <span>25,000 د.ع (إلكترونيات فاخرة)</span>
                </div>
              </div>

              {/* Calculated Results Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#181a22] to-amber-950/30 border border-amber-500/40 text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  تقدير صافي أرباحك الشهرية
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {formatIQD(monthlyNetProfit)}
                </div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto pt-1">
                  تحول كامل المبالغ لحسابك البنكي أو محفظتك الإلكترونية (زين كاش) فور تسليم الشحنات للزبائن بدون أي خصومات خفية.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
                >
                  انضم الآن وابدأ التحصيل 🚀
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AI ONBOARDING ENGINE JSON TERMINAL */}
          {activeTab === 'engine' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    محرك التحقق والاعتماد الآلي (Core AI Validation Engine)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    يمكنك اختبار ومعالجة بيانات طلبات المسوقين بصيغة JSON المعتمدة
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                  v2.0 Iraqi Market Rules
                </span>
              </div>

              {/* Sample Preset Loaders */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-slate-400 self-center">نماذج تجربة سريعة:</span>
                <button
                  type="button"
                  onClick={() => loadSamplePayload('valid')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60"
                >
                  ✓ طلب مكتمل (Approved Instant)
                </button>
                <button
                  type="button"
                  onClick={() => loadSamplePayload('invalid_phone')}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-900/60"
                >
                  ✕ رقم هاتف غير صالح
                </button>
                <button
                  type="button"
                  onClick={() => loadSamplePayload('missing_terms')}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-900/60"
                >
                  ✕ الشروط غير مقبولة
                </button>
              </div>

              {/* Input JSON Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  1. حمولة البيانات المدخلة (Input JSON Payload):
                </label>
                <textarea
                  dir="ltr"
                  rows={8}
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  className="w-full text-xs font-mono bg-[#0b0c0e] text-amber-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestJson}
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-4 h-4" />
                  <span>معالجة الطلب في محرك الذكاء الاصطناعي (Execute Engine)</span>
                </button>
              </div>

              {/* Output JSON Response */}
              {rawJsonOutput && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1">
                    <span>2. استجابة المحرك (Engine Response Output):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(rawJsonOutput);
                        setCopiedOutput(true);
                        setTimeout(() => setCopiedOutput(false), 2000);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedOutput ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOutput ? 'تم النسخ' : 'نسخ الاستجابة'}</span>
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="p-3.5 bg-[#0b0c0e] text-emerald-400 text-xs font-mono rounded-xl border border-slate-800 overflow-x-auto max-h-64"
                  >
                    {rawJsonOutput}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
