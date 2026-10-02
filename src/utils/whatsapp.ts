import { OrderSubmission } from '../types';
import { formatIQD } from './formatters';
import { STORE_WHATSAPP_NUMBER } from '../data/products';

export function buildWhatsAppMessage(order: OrderSubmission): string {
  const itemsText = order.items
    .map((item, idx) => {
      const options = [
        item.selectedSize ? `المقاس: ${item.selectedSize}` : null,
        item.selectedColor ? `اللون: ${item.selectedColor}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const optionStr = options ? ` (${options})` : '';
      const vendorStr = item.product.vendor
        ? `\n   🏪 *التاجر/البيج:* ${item.product.vendor.name} (${item.product.vendor.governorateNameAr}) | هاتف: ${item.product.vendor.phone}`
        : '';

      return `${idx + 1}. *${item.product.title}*
   الكمية: ${item.quantity} | السعر: ${formatIQD(item.product.price * item.quantity)}${optionStr}${vendorStr}`;
    })
    .join('\n\n');

  return `*طلب جديد من سوق أور (UR Multi-Vendor Marketplace)* 🛍️✨
--------------------------------
*رقم الطلب:* #${order.orderId}
*التاريخ:* ${new Date().toLocaleDateString('ar-IQ')}

👤 *بيانات الزبون المستلم:*
• *الاسم الكامل:* ${order.customerName}
• *رقم الهاتف:* ${order.customerPhone}
• *المحافظة:* ${order.governorateNameAr}
• *العنوان:* ${order.detailedAddress}
• *أقرب نقطة دالة:* ${order.nearestLandmark}
${order.notes ? `• *ملاحظات خاصة:* ${order.notes}\n` : ''}
📦 *تفاصيل المنتجات والتجار:*
${itemsText}

--------------------------------
💰 *المجموع الفرعي:* ${formatIQD(order.subtotal)}
🚚 *أجور التوصيل:* ${formatIQD(order.deliveryFee)}
💵 *المبلغ الإجمالي عند الاستلام:* ${formatIQD(order.total)}
📌 *طريقة الدفع:* نقداً عند الاستلام (COD)
--------------------------------
يرجى التواصل مع التاجر وتوجيه مندوب التوصيل للاستلام والتسليم. شكراً لكم!`;
}


export function getWhatsAppUrl(order: OrderSubmission, customNumber?: string): string {
  const phone = (customNumber || STORE_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const message = buildWhatsAppMessage(order);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedText}`;
}

export function openWhatsAppOrder(order: OrderSubmission, customNumber?: string): void {
  const url = getWhatsAppUrl(order, customNumber);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    // If pop-ups or dynamic navigation are blocked by iframe sandbox
    window.location.href = url;
  }
}
