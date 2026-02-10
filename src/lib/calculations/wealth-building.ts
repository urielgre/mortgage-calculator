// =============================================================
// wealth-building.ts — 10-year wealth projections
// Extracted from index.html without modifying formulas
// =============================================================

import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  type AmortizationInput,
  type AmortizationEntry,
} from './mortgage';

// --- Interfaces ---

export interface WealthBuildingInput {
  purchasePrice: number;
  downPayment: number;
  effectiveLoanAmount: number;
  effectiveLumpSum: number;
  interestRate: number; // annual %, e.g. 6.5
  loanTerm: number; // years
  appreciation: number; // annual %, e.g. 3
  extraMonthly: number; // monthly extra principal $
  monthlyPI: number;
  // ARM settings
  loanType: string; // 'fixed' | '3' | '5' | '7' | '10'
  armAdjustment: number;
  armCap: number;
  // Tax benefit inputs
  deductibleLoan: number;
  deductibleSALT: number;
  standardDeduction: number;
  itemizedWithoutHome: number;
  wouldItemizeWithoutHome: boolean;
  federalRate: number; // decimal, e.g. 0.24
  stateRate: number; // decimal, e.g. 0.093
  homesteadSavings: number;
}

export interface WealthBuildingResult {
  /** 10-year amortization schedule entries */
  schedule: AmortizationEntry[];
  /** Year 10 home value */
  homeValue10: number;
  /** Year 10 total equity */
  equity10: number;
  /** Year 10 total wealth impact (equity + cumulative tax savings) */
  wealthImpact10: number;
}

// --- Functions ---

/**
 * Calculate 10-year wealth building projections.
 * This is a thin wrapper around generateAmortizationSchedule in mortgage.ts,
 * plus summary extraction for the year-10 values.
 */
export function calculateWealthBuilding(
  input: WealthBuildingInput
): WealthBuildingResult {
  const amortInput: AmortizationInput = {
    purchasePrice: input.purchasePrice,
    effectiveLoanAmount: input.effectiveLoanAmount,
    effectiveLumpSum: input.effectiveLumpSum,
    downPayment: input.downPayment,
    interestRate: input.interestRate,
    loanTerm: input.loanTerm,
    appreciation: input.appreciation,
    extraMonthly: input.extraMonthly,
    monthlyPI: input.monthlyPI,
    loanType: input.loanType,
    armAdjustment: input.armAdjustment,
    armCap: input.armCap,
    deductibleLoan: input.deductibleLoan,
    deductibleSALT: input.deductibleSALT,
    standardDeduction: input.standardDeduction,
    itemizedWithoutHome: input.itemizedWithoutHome,
    wouldItemizeWithoutHome: input.wouldItemizeWithoutHome,
    federalRate: input.federalRate,
    stateRate: input.stateRate,
    homesteadSavings: input.homesteadSavings,
  };

  const schedule = generateAmortizationSchedule(amortInput);

  const year10 = schedule[9];

  return {
    schedule,
    homeValue10: year10.homeValue,
    equity10: year10.totalEquity,
    wealthImpact10: year10.totalWealthImpact,
  };
}
