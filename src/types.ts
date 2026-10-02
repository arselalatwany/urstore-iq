export type ProductCategory = 'all' | 'fashion' | 'beauty' | 'home' | 'electronics';

export interface Vendor {
  id: string;
  name: string; // e.g. "Style_IQ", "Baghdad_Beauty"
  phone: string; // e.g. "07701234567"
  governorateId: string;
  governorateNameAr: string;
  isVerified?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  titleEn: string;
  category: 'fashion' | 'beauty' | 'home' | 'electronics';
  categoryNameAr: string;
  price: number; // Retail price IQD
  resellerCost?: number; // Wholesale cost for reseller IQD
  originalPrice?: number; // IQD
  image: string;
  images?: string[]; // Up to 5 product images
  fallbackImage: string;
  badge?: string;
  vendor: Vendor; // Vendor/Merchant info
  description: string;
  features: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  sizes?: string[];
  colors?: ProductColor[];
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  deliveryFee: number; // IQD
  deliveryTime: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderSubmission {
  orderId: string;
  customerName: string;
  customerPhone: string;
  governorateId: string;
  governorateNameAr: string;
  detailedAddress: string;
  nearestLandmark: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  status?: OrderStatus;
  resellerId?: string;
  resellerCode?: string;
  resellerCommission?: number;
}

export type ResellerExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export interface ResellerRegistrationInput {
  full_name: string;
  phone_number: string;
  province: string;
  sales_channel: string;
  experience_level: ResellerExperienceLevel;
  agreed_terms: boolean;
}

export type ResellerStatus = 'APPROVED_INSTANT' | 'PENDING_REVIEW' | 'REJECTED' | 'SUSPENDED';

export interface ResellerValidationResult {
  isValid: boolean;
  status: ResellerStatus;
  reseller_id?: string;
  errors: Partial<Record<keyof ResellerRegistrationInput, string>>;
  message_ar: string;
  details?: {
    full_name: string;
    phone_number: string;
    province: string;
    sales_channel: string;
    experience_level: ResellerExperienceLevel;
    wholesale_margin_estimate: string;
    next_step_ar: string;
  };
  timestamp: string;
}

export interface ResellerAccount {
  userId: string;
  resellerCode: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  salesChannel: string;
  experienceLevel: ResellerExperienceLevel;
  agreedTerms: boolean;
  status: ResellerStatus;
  earnedBalance: number;
  pendingPayout: number;
  createdAt: string;
  updatedAt?: string;
}

export type Currency = 'IQD' | 'USD';
export type AppTheme = 'dark' | 'light';
