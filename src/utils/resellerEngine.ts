import { ResellerRegistrationInput, ResellerValidationResult, ResellerStatus } from '../types';
import { IRAQI_GOVERNORATES } from '../data/governorates';

/**
 * Standardize Arabic digits to standard digits
 */
export function normalizeDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
}

/**
 * Validates Iraqi phone numbers:
 * Must be 11 digits starting with 077, 078, 075, or 079.
 * (Handles +9647... prefix by converting to 07...)
 */
export function validateIraqiResellerPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { isValid: false, normalized: '', error: 'رقم الهاتف مطلوب' };
  }

  let clean = normalizeDigits(phone.trim().replace(/[\s\-\(\)\+]/g, ''));

  // Handle +964 or 00964 prefix
  if (clean.startsWith('964')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('00964')) {
    clean = '0' + clean.slice(5);
  }

  // Check 11 digits starting with 07[5,7,8,9]
  const iraqiPhoneRegex = /^07[5789]\d{8}$/;
  if (!iraqiPhoneRegex.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      error: 'يجب أن يكون رقم الهاتف مكوناً من 11 رقماً ويبدأ بـ (077 أو 078 أو 075 أو 079)',
    };
  }

  return { isValid: true, normalized: clean };
}

/**
 * Validates if the governorate is recognized in Iraq
 */
export function validateIraqiProvince(province: string): { isValid: boolean; matchedNameAr: string; error?: string } {
  if (!province || !province.trim()) {
    return { isValid: false, matchedNameAr: '', error: 'يرجى اختيار أو تحديد المحافظة' };
  }

  const pRaw = province.trim();
  const pClean = pRaw
    .replace(/^(محافظة|مدينة|ولاية|province|governorate)\s+/i, '')
    .trim()
    .toLowerCase();

  // Common Iraqi governorate aliases map
  const PROVINCE_ALIASES: Record<string, string> = {
    'بغداد': 'بغداد (العاصمة)',
    'baghdad': 'بغداد (العاصمة)',
    'البصرة': 'البصرة',
    'بصرة': 'البصرة',
    'basra': 'البصرة',
    'أربيل': 'أربيل',
    'اربيل': 'أربيل',
    'erbil': 'أربيل',
    'نينوى': 'نينوى (الموصل)',
    'الموصل': 'نينوى (الموصل)',
    'موصل': 'نينوى (الموصل)',
    'nineveh': 'نينوى (الموصل)',
    'mosul': 'نينوى (الموصل)',
    'كركوك': 'كركوك',
    'kirkuk': 'كركوك',
    'النجف': 'النجف الأشرف',
    'نجف': 'النجف الأشرف',
    'النجف الاشرف': 'النجف الأشرف',
    'النجف الأشرف': 'النجف الأشرف',
    'najaf': 'النجف الأشرف',
    'كربلاء': 'كربلاء المقدسة',
    'كربلاء المقدسة': 'كربلاء المقدسة',
    'karbala': 'كربلاء المقدسة',
    'ذي قار': 'ذي قار (الناصرية)',
    'الناصرية': 'ذي قار (الناصرية)',
    'ناصرية': 'ذي قار (الناصرية)',
    'dhi qar': 'ذي قار (الناصرية)',
    'nasiriyah': 'ذي قار (الناصرية)',
    'بابل': 'بابل (الحلة)',
    'الحلة': 'بابل (الحلة)',
    'حلة': 'بابل (الحلة)',
    'babylon': 'بابل (الحلة)',
    'hillah': 'بابل (الحلة)',
    'الأنبار': 'الأنبار (الرمادي / الفلوجة)',
    'الانبار': 'الأنبار (الرمادي / الفلوجة)',
    'الرمادي': 'الأنبار (الرمادي / الفلوجة)',
    'الفلوجة': 'الأنبار (الرمادي / الفلوجة)',
    'anbar': 'الأنبار (الرمادي / الفلوجة)',
    'السليمانية': 'السليمانية',
    'سليمانية': 'السليمانية',
    'sulaymaniyah': 'السليمانية',
    'دهوك': 'دهوك',
    'duhok': 'دهوك',
    'ديالى': 'ديالى (بعقوبة)',
    'بعقوبة': 'ديالى (بعقوبة)',
    'diyala': 'ديالى (بعقوبة)',
    'صلاح الدين': 'صلاح الدين (تكريت / سامراء)',
    'تكريت': 'صلاح الدين (تكريت / سامراء)',
    'سامراء': 'صلاح الدين (تكريت / سامراء)',
    'saladin': 'صلاح الدين (تكريت / سامراء)',
    'واسط': 'واسط (الكوت)',
    'الكوت': 'واسط (الكوت)',
    'كوت': 'واسط (الكوت)',
    'wasit': 'واسط (الكوت)',
    'ميسان': 'ميسان (العمارة)',
    'العمارة': 'ميسان (العمارة)',
    'عمارة': 'ميسان (العمارة)',
    'maysan': 'ميسان (العمارة)',
    'القادسية': 'القادسية (الديوانية)',
    'قادسية': 'القادسية (الديوانية)',
    'الديوانية': 'القادسية (الديوانية)',
    'ديوانية': 'القادسية (الديوانية)',
    'diwaniyah': 'القادسية (الديوانية)',
    'المثنى': 'المثنى (السماوة)',
    'مثنى': 'المثنى (السماوة)',
    'السماوة': 'المثنى (السماوة)',
    'سماوة': 'المثنى (السماوة)',
    'muthanna': 'المثنى (السماوة)',
  };

  // Direct alias lookup
  if (PROVINCE_ALIASES[pClean]) {
    return { isValid: true, matchedNameAr: PROVINCE_ALIASES[pClean] };
  }
  if (PROVINCE_ALIASES[pRaw]) {
    return { isValid: true, matchedNameAr: PROVINCE_ALIASES[pRaw] };
  }

  // Fallback search across IRAQI_GOVERNORATES
  const matched = IRAQI_GOVERNORATES.find((g) => {
    return (
      g.id.toLowerCase() === pClean ||
      g.nameEn.toLowerCase() === pClean ||
      g.nameAr.includes(pClean) ||
      pClean.includes(g.nameAr.split(' ')[0])
    );
  });

  if (!matched) {
    return {
      isValid: false,
      matchedNameAr: '',
      error: 'المحافظة المدخلة غير معتمدة ضمن محافظات العراق الـ 18',
    };
  }

  return { isValid: true, matchedNameAr: matched.nameAr };
}

/**
 * Core AI Onboarding Engine for UR Store Resellers (المسوقين بالعمولة / المندوبين)
 */
export function processResellerRegistration(input: ResellerRegistrationInput): ResellerValidationResult {
  const errors: Partial<Record<keyof ResellerRegistrationInput, string>> = {};

  // 1. Validate full_name (Minimum 2 words)
  const nameTrimmed = (input.full_name || '').trim();
  const nameParts = nameTrimmed.split(/\s+/).filter((p) => p.length >= 2);
  if (!nameTrimmed) {
    errors.full_name = 'الاسم الكامل مطلوب';
  } else if (nameParts.length < 2) {
    errors.full_name = 'يجب إدخال الاسم الكامل (الاسم الثنائي أو الثلاثي على الأقل)';
  }

  // 2. Validate phone_number (11 digits, starts with 077, 078, 075, or 079)
  const phoneValidation = validateIraqiResellerPhone(input.phone_number);
  if (!phoneValidation.isValid) {
    errors.phone_number = phoneValidation.error;
  }

  // 3. Validate province (Must be a recognized Iraqi governorate)
  const provinceValidation = validateIraqiProvince(input.province);
  if (!provinceValidation.isValid) {
    errors.province = provinceValidation.error;
  }

  // 4. Validate sales_channel (Primary platform used for selling)
  const channelTrimmed = (input.sales_channel || '').trim();
  if (!channelTrimmed || channelTrimmed.length < 2) {
    errors.sales_channel = 'يرجى تحديد قناة البيع الأساسية (مثال: صفحة انستغرام، تيك توك، واتساب، بيع مباشر)';
  }

  // 5. Validate experience_level
  const allowedLevels = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
  if (!input.experience_level || !allowedLevels.includes(input.experience_level)) {
    errors.experience_level = 'يرجى تحديد مستوى الخبرة في التسويق بالعمولة (مبتدئ / متوسط / محترف)';
  }

  // 6. Validate agreed_terms (Must be true)
  if (input.agreed_terms !== true) {
    errors.agreed_terms = 'يجب الموافقة على شروط وأحكام شبكة المسوقين في سوق أور للاستمرار';
  }

  const isValid = Object.keys(errors).length === 0;
  const now = new Date().toISOString();

  if (!isValid) {
    return {
      isValid: false,
      status: 'REJECTED',
      errors,
      message_ar: 'تعذر قبول الطلب لاحتوائه على بيانات غير مكتملة أو غير مطابقة لشروط الانضمام لشبكة مسوقي سوق أور.',
      timestamp: now,
    };
  }

  // Generate unique Reseller Code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const resellerId = `UR-MND-${randomSuffix}`;

  const isInstant = input.agreed_terms === true && phoneValidation.isValid;
  const status: ResellerStatus = isInstant ? 'APPROVED_INSTANT' : 'PENDING_REVIEW';

  const wholesaleMarginMap = {
    BEGINNER: '20% - 35% هامش ربح للمنتج الواحد',
    INTERMEDIATE: '25% - 45% + أسعار جملة حصرية للكميات',
    EXPERT: '35% - 55% + مدير حساب وتوصيل VIP ذو أولوية',
  };

  return {
    isValid: true,
    status,
    reseller_id: resellerId,
    errors: {},
    message_ar: `أهلاً بك يا ${nameParts[0]}! تم قبولك فورياً كمسوق بالعمولة في سوق أور. يمكنك البدء في بيع المنتجات بدون أي رأس مال مع ضمان تحصيل أرباحك عند كل توصيل ناجح.`,
    details: {
      full_name: nameTrimmed,
      phone_number: phoneValidation.normalized,
      province: provinceValidation.matchedNameAr,
      sales_channel: channelTrimmed,
      experience_level: input.experience_level,
      wholesale_margin_estimate: wholesaleMarginMap[input.experience_level] || '25% - 40%',
      next_step_ar: 'تصفح كتالوج المنتجات، حمل صور المحتوى بدون علامة مائية، وشارك أسعار البيع المقترحة مع زبائنك.',
    },
    timestamp: now,
  };
}

/**
 * Helper to process raw JSON string input as expected by the AI Onboarding Engine
 */
export function processResellerJsonString(rawJson: string): string {
  try {
    const parsed = JSON.parse(rawJson);
    const result = processResellerRegistration(parsed);
    return JSON.stringify(result, null, 2);
  } catch (err: any) {
    return JSON.stringify(
      {
        isValid: false,
        status: 'REJECTED',
        error_type: 'INVALID_JSON_PAYLOAD',
        message_ar: 'البيانات المدخلة ليست بصيغة JSON صالحة.',
        details: err?.message || 'Syntax error in JSON string',
      },
      null,
      2
    );
  }
}
