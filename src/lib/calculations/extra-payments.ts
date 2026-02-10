// =============================================================
// extra-payments.ts — Extra payment modeling
// Extracted from index.html without modifying formulas
// =============================================================

import { calculateMonthlyPayment } from './mortgage';

// --- Interfaces ---

export interface ExtraPaymentsInput {
  /** Original loan amount (before lump sum) */
  loanAmount: number;
  /** Effective loan amount (after lump sum) */
  effectiveLoanAmount: number;
  /** Annual interest rate as %, e.g. 6.5 */
  interestRate: number;
  /** Loan term in years */
  loanTerm: number;
  /** Monthly extra principal payment */
  extraMonthly: number;
  /** One-time lump sum applied at origination */
  lumpSum: number;
}

export interface ExtraPaymentsResult {
  /** Total interest saved over life of loan */
  interestSaved: number;
  /** Number of months saved */
  monthsSaved: number;
  /** Original payoff duration in months (no extras) */
  originalMonths: number;
  /** New payoff duration in months (with extras) */
  newMonths: number;
  /** Whether any extra payments exist */
  hasExtraPayments: boolean;
}

// --- Functions ---

/**
 * Calculate the impact of extra payments (monthly + lump sum).
 * Compares baseline (no extras) vs with extras: interest saved, months saved.
 * Extracted from the "EXTRA PAYMENT SAVINGS" section of calculate() in index.html.
 */
export function calculateExtraPayments(
  input: ExtraPaymentsInput
): ExtraPaymentsResult {
  const effectiveLumpSum = Math.min(input.lumpSum, input.loanAmount);
  const effectiveLoanAmount = input.loanAmount - effectiveLumpSum;
  const hasExtraPayments = input.extraMonthly > 0 || effectiveLumpSum > 0;

  if (!hasExtraPayments) {
    const baselineMonthlyPI = calculateMonthlyPayment(
      input.loanAmount,
      input.interestRate,
      input.loanTerm
    );

    // Compute actual payoff months for the baseline
    let baseBalance = input.loanAmount;
    let baseTotalInterest = 0;
    let baseMonths = 0;
    const baseRate = input.interestRate / 100 / 12;
    while (baseBalance > 0.01 && baseMonths < input.loanTerm * 12) {
      baseMonths++;
      const interest = baseBalance * baseRate;
      const principal = baselineMonthlyPI - interest;
      baseTotalInterest += interest;
      baseBalance = Math.max(baseBalance - principal, 0);
    }

    return {
      interestSaved: 0,
      monthsSaved: 0,
      originalMonths: baseMonths,
      newMonths: baseMonths,
      hasExtraPayments: false,
    };
  }

  const baselineMonthlyPI = calculateMonthlyPayment(
    input.loanAmount,
    input.interestRate,
    input.loanTerm
  );
  const monthlyPI = calculateMonthlyPayment(
    effectiveLoanAmount,
    input.interestRate,
    input.loanTerm
  );

  const baseRate = input.interestRate / 100 / 12;

  // Baseline: original loan, no extra payments
  let baseBalance = input.loanAmount;
  let baseTotalInterest = 0;
  let baseMonths = 0;
  while (baseBalance > 0.01 && baseMonths < input.loanTerm * 12) {
    baseMonths++;
    const interest = baseBalance * baseRate;
    const principal = baselineMonthlyPI - interest;
    baseTotalInterest += interest;
    baseBalance = Math.max(baseBalance - principal, 0);
  }

  // With extra payments
  let extraBalance = effectiveLoanAmount;
  let extraTotalInterest = 0;
  let extraMonths = 0;
  while (extraBalance > 0.01 && extraMonths < input.loanTerm * 12) {
    extraMonths++;
    const interest = extraBalance * baseRate;
    const basePrinc = monthlyPI - interest;
    const extraPrinc = Math.min(
      input.extraMonthly,
      extraBalance - basePrinc
    );
    const totalPrinc = Math.min(
      basePrinc + Math.max(extraPrinc, 0),
      extraBalance
    );
    extraTotalInterest += interest;
    extraBalance = Math.max(extraBalance - totalPrinc, 0);
  }

  return {
    interestSaved: baseTotalInterest - extraTotalInterest,
    monthsSaved: baseMonths - extraMonths,
    originalMonths: baseMonths,
    newMonths: extraMonths,
    hasExtraPayments: true,
  };
}
