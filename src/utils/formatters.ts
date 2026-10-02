import { Currency } from '../types';

// Approximate exchange rate: 1 USD = 1,320 IQD (standard Iraqi market market peg)
export const USD_TO_IQD_RATE = 1320;

export function formatIQD(amount: number): string {
  return `${new Intl.NumberFormat('en-US').format(Math.round(amount))} د.ع`;
}

export function formatUSD(amountInIQD: number): string {
  const usd = amountInIQD / USD_TO_IQD_RATE;
  return `$${usd.toFixed(2)}`;
}

export function formatPrice(amountInIQD: number, currency: Currency = 'IQD'): string {
  if (currency === 'USD') {
    return formatUSD(amountInIQD);
  }
  return formatIQD(amountInIQD);
}

export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `UR-${randomNum}`;
}

export function validateIraqiPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-]/g, '');
  const regex = /^(07\d{9}|(\+?964|00964)7\d{9})$/;
  return regex.test(clean);
}
