// =============================================================
// affordability.ts — 28% DTI affordability calculator
// Extracted from index.html without modifying formulas
// =============================================================

import { calculateMonthlyPayment } from './mortgage';

// --- Interfaces ---

export interface AffordabilityInput {
  annualIncome: number;
  interestRate: number; // annual %, e.g. 6.5
  loanTerm: number; // years
  propertyTaxRate: number; // annual %, e.g. 1.1
  insurance: number; // annual $
  hoa: number; // monthly $
  pmiRate: number; // annual %, e.g. 0.5
  maintenance: number; // annual % of purchase price
  utilities: number; // monthly $
  downPaymentPercent: number; // %, e.g. 20
  downPaymentFixedAmount?: number; // if using fixed $ amount mode
  downPaymentMode: 'percent' | 'amount';
}

export interface AffordabilityResult {
  maxPurchasePrice: number;
  targetPITI: number;
  grossMonthlyIncome: number;
  usedFallbackIncome: boolean;
}

// --- Functions ---

/**
 * Binary search for max home price where total housing cost <= 28% of gross monthly income.
 * Extracted from calculateAffordability() in index.html.
 */
export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const usingFallback = input.annualIncome <= 0;
  const grossMonthly = usingFallback
    ? 150000 / 12
    : input.annualIncome / 12;
  const targetPITI = grossMonthly * 0.28;

  let lo = 50000;
  let hi = 10000000;

  for (let i = 0; i < 30; i++) {
    const mid = Math.round((lo + hi) / 2);

    const dp =
      input.downPaymentMode === 'amount'
        ? input.downPaymentFixedAmount ?? 0
        : mid * (input.downPaymentPercent / 100);

    const loan = mid - dp;
    const pi = calculateMonthlyPayment(loan, input.interestRate, input.loanTerm);
    const tax = ((mid * input.propertyTaxRate) / 100) / 12;
    const ins = input.insurance / 12;
    const dpPercent = mid > 0 ? (dp / mid) * 100 : 0;
    const pmi = dpPercent < 20 ? ((loan * (input.pmiRate / 100)) / 12) : 0;
    const hoa = input.hoa || 0;
    const maint = ((mid * (input.maintenance || 0)) / 100) / 12;
    const utils = input.utilities || 0;
    const piti = pi + tax + ins + pmi + hoa + maint + utils;

    if (piti <= targetPITI) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  // Clamp and round to nearest $1000
  const maxPrice = Math.min(
    Math.max(Math.round(lo / 1000) * 1000, 50000),
    10000000
  );

  return {
    maxPurchasePrice: maxPrice,
    targetPITI,
    grossMonthlyIncome: grossMonthly,
    usedFallbackIncome: usingFallback,
  };
}
