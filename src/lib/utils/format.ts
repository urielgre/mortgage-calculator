/**
 * Formatting utility functions for currency, percentages, and numbers.
 * Pure TypeScript — no DOM references.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyDetailedFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats a number as whole-dollar currency: "$1,234"
 */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/**
 * Formats a number as currency with cents: "$1,234.56"
 */
export function formatCurrencyDetailed(amount: number): string {
  return currencyDetailedFormatter.format(amount);
}

/**
 * Formats a number as a percentage string: "6.50%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return value.toFixed(decimals) + '%';
}

/**
 * Formats a number with thousands separators: "1,234"
 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * Escapes HTML special characters in a string.
 * Safe replacement for the DOM-based version in the original code.
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Calculates monthly mortgage payment using standard amortization formula.
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}
