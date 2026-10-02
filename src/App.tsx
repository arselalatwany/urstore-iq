import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory, OrderItem, OrderSubmission, AppTheme, Currency, ResellerAccount } from './types';
import { PRODUCTS, STORE_WHATSAPP_NUMBER } from './data/products';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { MerchantModal } from './components/MerchantModal';
import { ResellerModal } from './components/ResellerModal';
import { BuyerAssistantModal } from './components/BuyerAssistantModal';
import { Footer } from './components/Footer';
import { auth, signInWithGoogle, logOut, testFirestoreConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { subscribeToOrders, subscribeToProducts, saveFirestoreProduct, fetchResellerAccount } from './utils/firestoreService';
import { formatPrice } from './utils/formatters';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
  SearchX,
  MessageCircle,
  ArrowDown,
  ShoppingBag,
  Zap,
  Store,
  PlusCircle,
  Bot,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function App() {
  // Theme Controller: Dark Mode (Default) / Light Mode
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('ur_store_theme');
      return (saved as AppTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('ur_store_theme', nextTheme);
    } catch {
      // ignore
    }
  };

  // Currency Converter: IQD (Default) / USD
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('ur_store_currency');
      return (saved as Currency) || 'IQD';
    } catch {
      return 'IQD';
    }
  });

  const toggleCurrency = () => {
    const next = currency === 'IQD' ? 'USD' : 'IQD';
    setCurrency(next);
    try {
      localStorage.setItem('ur_store_currency', next);
    } catch {
      // ignore
    }
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userResellerAccount, setUserResellerAccount] = useState<ResellerAccount | null>(null);

  // Navigation & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMerchantOpen, setIsMerchantOpen] = useState(false);
  const [isResellerOpen, setIsResellerOpen] = useState(false);
  const [isBuyerAssistantOpen, setIsBuyerAssistantOpen] = useState(false);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSubmission | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Custom products synced from Firestore
  const [firestoreCustomProducts, setFirestoreCustomProducts] = useState<Product[]>([]);

  // Combined product catalog (merchant submissions on top)
  const allCatalogProducts = useMemo(() => {
    return [...firestoreCustomProducts, ...PRODUCTS];
  }, [firestoreCustomProducts]);

  // Cart & Order State
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('ur_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time Firestore orders
  const [liveOrders, setLiveOrders] = useState<OrderSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('ur_store_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Initial Firestore connection ping test
  useEffect(() => {
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore ping note:', err);
    });
  }, []);

  // 2. Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await fetchResellerAccount(user.uid);
          if (profile) {
            setUserResellerAccount(profile);
          }
        } catch (e) {
          console.warn('Fetch reseller profile note:', e);
        }
      } else {
        setUserResellerAccount(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time subscriptions to Firestore orders & products
  useEffect(() => {
    const unsubOrders = subscribeToOrders((orders) => {
      if (orders && orders.length > 0) {
        setLiveOrders(orders);
        try {
          localStorage.setItem('ur_store_orders', JSON.stringify(orders.slice(0, 30)));
        } catch {
          // ignore
        }
      }
    });

    const unsubProducts = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setFirestoreCustomProducts(prods);
      }
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubProducts) unsubProducts();
    };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ur_store_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Add new merchant product
  const handleProductAdded = (newProduct: Product) => {
    setFirestoreCustomProducts((prev) => [newProduct, ...prev]);
    saveFirestoreProduct(newProduct).catch((err) => {
      console.warn('Firestore product save fallback:', err);
    });
    showToast(`تم إدراج منتج "${newProduct.title}" لمتجر "${newProduct.vendor.name}" في السوق!`);
  };

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return allCatalogProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.titleEn.toLowerCase().includes(query) ||
        product.categoryNameAr.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.vendor && product.vendor.name.toLowerCase().includes(query)) ||
        (product.vendor && product.vendor.governorateNameAr.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [allCatalogProducts, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      all: allCatalogProducts.length,
      fashion: allCatalogProducts.filter((p) => p.category === 'fashion').length,
      beauty: allCatalogProducts.filter((p) => p.category === 'beauty').length,
      home: allCatalogProducts.filter((p) => p.category === 'home').length,
      electronics: allCatalogProducts.filter((p) => p.category === 'electronics').length,
    };
    return counts;
  }, [allCatalogProducts]);

  // Handlers for Cart
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedSize: size,
            selectedColor: color,
          },
        ];
      }
    });

    showToast(`تمت إضافة "${product.title}" إلى السلة`);
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    showToast('تم حذف المنتج من السلة');
  };

  // Immediate "اطلب الآن" handler: opens checkout modal directly
  const handleDirectOrderNow = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    setDirectCheckoutProduct(product);
    setIsCheckoutOpen(true);
    if (previewProduct) {
      setPreviewProduct(null);
    }
  };

  // Checkout from cart
  const handleCheckoutFromCart = () => {
    setDirectCheckoutProduct(null);
    setIsCheckoutOpen(true);
  };

  // On successful order submission
  const handleOrderSuccess = (order: OrderSubmission) => {
    if (!directCheckoutProduct) {
      setCartItems([]);
    }
    setIsCheckoutOpen(false);
    setDirectCheckoutProduct(null);
    setOrderSuccessData(order);
    setLiveOrders((prev) => [order, ...prev.filter((o) => o.orderId !== order.orderId)]);
  };

  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast(`أهلاً بك يا ${user.displayName || 'صديقنا'}! تم تسجيل الدخول بنجاح.`);
      }
    } catch (err: any) {
      showToast('تعذر إكمال تسجيل الدخول بحساب Google. يرجى المحاولة لاحقاً.');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast('تم تسجيل الخروج.');
    } catch {
      // ignore
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Total Reseller Balance Summary (Delivered orders)
  const earnedBalanceTotal = liveOrders
    .filter((o) => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.resellerCommission || Math.round(o.subtotal * 0.3)), 0);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 ${
        isDarkMode
          ? 'bg-[#121212] text-slate-100'
          : 'bg-[#F9F9FB] text-slate-900'
      }`}
    >
      {/* 1. Header with Theme & Currency Controllers, Google Auth, and Modals Triggers */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMerchantModal={() => setIsMerchantOpen(true)}
        onOpenResellerModal={() => setIsResellerOpen(true)}
        onOpenBuyerAssistant={() => setIsBuyerAssistantOpen(true)}
        savedOrdersCount={liveOrders.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* 2. Hero Section: Minimalist Matte Charcoal & Brushed Gold */}
      <section
        className={`relative overflow-hidden border-b transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#181818] via-[#141414] to-[#121212] border-amber-500/20'
            : 'bg-gradient-to-b from-white via-amber-50/20 to-[#F9F9FB] border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Text content */}
            <div className="lg:col-span-7 space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>سوق أور العراقي · دروب شيبينغ فاخر بدون مخزون</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.2]">
                تسوق من نخبة المتاجر والبيجات مع{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                  الدفع عند الاستلام
                </span>
              </h1>

              <p
                className={`text-sm sm:text-base max-w-xl leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                المنصة العراقية الأولى التي تجمع الزبائن، التجار، والمسوقين بالعمولة. اربح عمولات مجزية بدون رأس مال، أو اطلب هديتك المفضلة مع فحص الطرد قبل الدفع.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? 'bg-[#18191f] border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">18 محافظة</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">توصيل سريع لباب بيتك</div>
                </div>

                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? 'bg-[#18191f] border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">بدون رأس مال</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">عمولات فورية للمسوقين</div>
                </div>

                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? 'bg-[#18191f] border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-400">ذكاء المبيعات</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">مساعد ذكي لاختيار الهدايا</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsBuyerAssistantOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <Bot className="w-4 h-4 text-slate-950" />
                  <span>اسأل مساعد الهدايا الذكي</span>
                </button>

                <button
                  onClick={() => setIsResellerOpen(true)}
                  className={`inline-flex items-center gap-2 px-5 py-3 font-black rounded-xl text-sm transition-all active:scale-95 border ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] hover:bg-[#262626] text-amber-300 border-amber-500/40 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>بوابة أدوات المسوق (Mandoob)</span>
                </button>

                <a
                  href="#products-section"
                  className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>تصفح المنتجات</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Reseller & Live Performance Callout Card */}
            <div className="lg:col-span-5 relative">
              <div
                className={`relative mx-auto max-w-md rounded-3xl p-5 border transition-all ${
                  isDarkMode
                    ? 'bg-[#181920] border-amber-500/30 text-slate-100 shadow-2xl shadow-black/80'
                    : 'bg-white border-amber-200/80 text-slate-900 shadow-xl shadow-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    شبكة المسوقين والعمولات الحية
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Zero Inventory</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-amber-400">
                    اربح من بيع المنتجات بدون أن تمتلكها!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    استخدم صيغة صافي الربح: [سعر البيع - سعر التكلفة]، وشارك روابط المنتجات المخصصة بنقرة واحدة لتحصيل أرباحك فور تسليم الشحنة للزبون.
                  </p>
                </div>

                {/* Live Platform Stats */}
                <div
                  className={`grid grid-cols-2 gap-2.5 p-3 rounded-2xl border my-3.5 ${
                    isDarkMode ? 'bg-[#101114] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">إجمالي أرباح المسوقين المسلمة:</span>
                    <span className="text-sm font-black text-amber-400 tabular-nums font-mono">
                      {formatPrice(earnedBalanceTotal > 0 ? earnedBalanceTotal : 1485000, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">طلبات قيد المتابعة الحية:</span>
                    <span className="text-sm font-black text-emerald-400 tabular-nums font-mono">
                      {liveOrders.length > 0 ? liveOrders.length : 24} طلب نشط
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResellerOpen(true)}
                    className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <Wallet className="w-4 h-4 text-slate-950" />
                    <span>فتح حاسبة الأرباح وتتبع العمولات</span>
                  </button>

                  <button
                    onClick={() => setIsMerchantOpen(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      isDarkMode
                        ? 'bg-[#121316] text-slate-300 border-slate-700 hover:bg-slate-800'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                    title="إضافة منتج كتاجر"
                  >
                    <span>أنا تاجر</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Section */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Category Filter Bar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {activeCategory === 'all'
                  ? 'تشكيلة منتجات سوق أور'
                  : allCatalogProducts.find((p) => p.category === activeCategory)?.categoryNameAr || 'المنتجات'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفح واطلب بالعملة المفضلة ({currency}) مع إتاحة حاسبة أرباح المسوقين لكل منتج
              </p>
            </div>

            <div className="flex items-center gap-2">
              {searchQuery && (
                <div
                  className={`text-xs px-3 py-1.5 rounded-xl border ${
                    isDarkMode ? 'bg-[#181818] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  بحث: <span className="font-bold text-amber-400">"{searchQuery}"</span>
                </div>
              )}
              {firestoreCustomProducts.length > 0 && (
                <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl">
                  {firestoreCustomProducts.length} منتجات مضافة سحابياً
                </span>
              )}
            </div>
          </div>

          {/* Interactive Categories Bar */}
          <CategoryFilter
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            className={`text-center py-20 rounded-3xl border p-8 my-6 ${
              isDarkMode ? 'bg-[#181818] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <SearchX className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold">لم نتمكن من العثور على نتائج</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              جرب البحث بكلمات أخرى أو تصفح الأقسام المتوفرة كالأزياء والإلكترونيات والعناية.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isDarkMode={isDarkMode}
                resellerCode={userResellerAccount?.resellerCode}
                onOrderNow={(prod) => handleDirectOrderNow(prod)}
                onAddToCart={(prod) => handleAddToCart(prod)}
                onViewDetails={(prod) => setPreviewProduct(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        isDarkMode={isDarkMode}
        onOpenResellerModal={() => setIsResellerOpen(true)}
        onOpenBuyerAssistant={() => setIsBuyerAssistantOpen(true)}
      />

      {/* 5. Fast Checkout Modal (Firestore real-time sync + WhatsApp fallback) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutProduct(null);
        }}
        directProduct={directCheckoutProduct}
        cartItems={cartItems}
        resellerCode={userResellerAccount?.resellerCode}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 6. Merchant / Vendor Onboarding Modal */}
      <MerchantModal
        isOpen={isMerchantOpen}
        onClose={() => setIsMerchantOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* 7. Reseller & Affiliate Portal Modal with Order & Commission Tracker */}
      <ResellerModal
        isOpen={isResellerOpen}
        onClose={() => setIsResellerOpen(false)}
        orders={liveOrders}
        activeResellerCode={userResellerAccount?.resellerCode}
        currency={currency}
        isDarkMode={isDarkMode}
        onResellerRegistered={(res) => {
          showToast(`أهلاً بك يا ${res.details?.full_name}! تم اعتمادك كمسوق معتمد (#${res.reseller_id})`);
        }}
      />

      {/* 8. Buyer Assistant AI Modal (ذكاء المبيعات واختيار الهدايا) */}
      <BuyerAssistantModal
        isOpen={isBuyerAssistantOpen}
        onClose={() => setIsBuyerAssistantOpen(false)}
        productsCatalog={allCatalogProducts}
        currency={currency}
        isDarkMode={isDarkMode}
        onSelectProduct={(prod) => {
          setIsBuyerAssistantOpen(false);
          setPreviewProduct(prod);
        }}
      />

      {/* 9. Order Success Modal */}
      <OrderSuccessModal
        order={orderSuccessData}
        onClose={() => setOrderSuccessData(null)}
      />

      {/* 10. Product Detail Quick View Modal with Reseller Calculator */}
      <ProductDetailModal
        product={previewProduct}
        currency={currency}
        isDarkMode={isDarkMode}
        resellerCode={userResellerAccount?.resellerCode}
        onClose={() => setPreviewProduct(null)}
        onOrderNow={(prod, qty, sz, col) => handleDirectOrderNow(prod, qty, sz, col)}
        onAddToCart={(prod, qty, sz, col) => handleAddToCart(prod, qty, sz, col)}
      />

      {/* 11. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        isDarkMode={isDarkMode}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleCheckoutFromCart}
      />

      {/* 12. Order History Modal with Live Order Status Tracking */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={liveOrders}
        currency={currency}
        isDarkMode={isDarkMode}
      />

      {/* 13. Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] text-amber-300 text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 max-w-sm">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
