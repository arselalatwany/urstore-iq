import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  OrderSubmission,
  OrderStatus,
  ResellerAccount,
  ResellerValidationResult,
  Product,
} from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

const ORDERS_COLLECTION = 'orders';
const RESELLERS_COLLECTION = 'resellers';
const PRODUCTS_COLLECTION = 'products';

/**
 * Save new customer order to Firestore
 */
export async function createFirestoreOrder(order: OrderSubmission): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.orderId}`;
  try {
    const payload = {
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      governorateId: order.governorateId,
      governorateNameAr: order.governorateNameAr,
      detailedAddress: order.detailedAddress,
      nearestLandmark: order.nearestLandmark || '',
      notes: order.notes || '',
      items: order.items.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        resellerCost: i.product.resellerCost || Math.round(i.product.price * 0.7),
        quantity: i.quantity,
        selectedSize: i.selectedSize || '',
        selectedColor: i.selectedColor || '',
      })),
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      status: (order.status || 'Pending') as OrderStatus,
      createdAt: order.createdAt || new Date().toISOString(),
      resellerId: order.resellerId || '',
      resellerCode: order.resellerCode || '',
      resellerCommission: Number(order.resellerCommission || 0),
    };

    await setDoc(doc(db, ORDERS_COLLECTION, order.orderId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update order status (Pending -> Shipped -> Delivered -> Cancelled)
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Listen to orders in real-time
 */
export function subscribeToOrders(
  onUpdate: (orders: OrderSubmission[]) => void,
  resellerCode?: string
) {
  const path = ORDERS_COLLECTION;
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const q = resellerCode
      ? query(colRef, where('resellerCode', '==', resellerCode))
      : query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: OrderSubmission[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            orderId: data.orderId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            governorateId: data.governorateId,
            governorateNameAr: data.governorateNameAr,
            detailedAddress: data.detailedAddress,
            nearestLandmark: data.nearestLandmark,
            notes: data.notes,
            items: (data.items || []).map((it: any) => ({
              product: {
                id: it.id,
                title: it.title,
                price: it.price,
                resellerCost: it.resellerCost,
              } as Product,
              quantity: it.quantity,
              selectedSize: it.selectedSize,
              selectedColor: it.selectedColor,
            })),
            subtotal: data.subtotal,
            deliveryFee: data.deliveryFee,
            total: data.total,
            createdAt: data.createdAt,
            status: data.status,
            resellerId: data.resellerId,
            resellerCode: data.resellerCode,
            resellerCommission: data.resellerCommission,
          });
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Register or update Reseller profile in Firestore
 */
export async function saveResellerProfile(
  resellerResult: ResellerValidationResult,
  customUserId?: string
): Promise<ResellerAccount> {
  const userId = customUserId || auth.currentUser?.uid || `anon-${Date.now()}`;
  const path = `${RESELLERS_COLLECTION}/${userId}`;

  const profile: ResellerAccount = {
    userId,
    resellerCode: resellerResult.reseller_id || `UR-MND-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: resellerResult.details?.full_name || 'مسوق معتمد',
    phoneNumber: resellerResult.details?.phone_number || '07700000000',
    province: resellerResult.details?.province || 'بغداد',
    salesChannel: resellerResult.details?.sales_channel || 'Instagram Page',
    experienceLevel: resellerResult.details?.experience_level || 'BEGINNER',
    agreedTerms: true,
    status: resellerResult.status || 'APPROVED_INSTANT',
    earnedBalance: 0,
    pendingPayout: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, RESELLERS_COLLECTION, userId), profile, { merge: true });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch Reseller account by User ID
 */
export async function fetchResellerAccount(userId: string): Promise<ResellerAccount | null> {
  const path = `${RESELLERS_COLLECTION}/${userId}`;
  try {
    const snap = await getDoc(doc(db, RESELLERS_COLLECTION, userId));
    if (snap.exists()) {
      return snap.data() as ResellerAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save custom merchant product to Firestore
 */
export async function saveFirestoreProduct(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    const payload = {
      id: product.id,
      title: product.title,
      titleEn: product.titleEn,
      category: product.category,
      categoryNameAr: product.categoryNameAr,
      price: product.price,
      resellerCost: product.resellerCost || Math.round(product.price * 0.7),
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      images: product.images || [product.image],
      fallbackImage: product.fallbackImage || product.image,
      badge: product.badge || '',
      vendor: product.vendor,
      description: product.description,
      features: product.features,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      inStock: product.inStock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to custom products from Firestore
 */
export function subscribeToProducts(onProducts: (products: Product[]) => void) {
  const path = PRODUCTS_COLLECTION;
  try {
    return onSnapshot(
      collection(db, PRODUCTS_COLLECTION),
      (snap) => {
        const prods: Product[] = [];
        snap.forEach((d) => {
          prods.push(d.data() as Product);
        });
        onProducts(prods);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
