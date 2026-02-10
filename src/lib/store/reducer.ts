// =============================================================
// reducer.ts — Calculator state reducer with full recalculation
// =============================================================

import type {
  CalculatorState,
  CalculatorAction,
  CalculatorInputs,
  CalculatorResults,
} from './types';
import { DEFAULT_INPUTS } from './types';
import type { FilingStatus } from '../data/income-tax-rates';
import {
  STATE_TAX_DATA,
  STATE_META,
  type StateTaxConfig,
  type StateTaxProgressive,
  type TaxBracket,
} from '../data/income-tax-rates';
import { getTaxData, getSaltCap } from '../data/constants';
import {
  calculatePITI,
  calculateUpfrontCosts,
  calculateYear1Interest,
  generateAmortizationSchedule,
} from '../calculations/mortgage';
import { calculateAffordability } from '../calculations/affordability';
import { calculateRentVsBuy } from '../calculations/rent-vs-buy';
import { calculateTaxBenefits } from '../calculations/tax-benefits';
import { calculateExtraPayments } from '../calculations/extra-payments';
import { calculatePMITimeline } from '../calculations/pmi';

// =============================================================
// Tax helper functions (extracted from v1 index.html)
// =============================================================

/**
 * Get the federal marginal bracket rate for given income.
 * Extracted from getFederalBracket() in index.html.
 */
function getFederalBracket(
  income: number,
  filingStatus: FilingStatus,
  year: number
): number {
  const data = getTaxData(year);
  const statusBrackets = data.federal[filingStatus] || data.federal.married_jointly;
  for (const bracket of statusBrackets) {
    if (income >= bracket.min && income < bracket.max) return bracket.rate;
  }
  return 37;
}

/**
 * Get state tax brackets for a progressive state, with year fallback.
 * Extracted from getStateBrackets() in index.html.
 */
function getStateBrackets(
  stateCode: string,
  year: number
): Record<FilingStatus, TaxBracket[]> | null {
  const config = STATE_TAX_DATA[stateCode];
  if (!config) return null;
  if (config.type === 'none' || config.type === 'flat' || config.type === 'effective') return null;
  const progressive = config as StateTaxProgressive;
  if (progressive.brackets) {
    if (progressive.brackets[year]) return progressive.brackets[year];
    const years = Object.keys(progressive.brackets).map(Number).sort();
    const nearest = years.reduce((prev, curr) =>
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    return progressive.brackets[nearest];
  }
  return null;
}

/**
 * Get state standard deduction for a given filing status and year.
 * Extracted from getStateStdDed() in index.html.
 */
function getStateStdDed(
  stateCode: string,
  filingStatus: FilingStatus,
  year: number
): number {
  const config = STATE_TAX_DATA[stateCode];
  if (!config || config.type === 'none') return 0;
  if (!('stdDed' in config) || !config.stdDed) return 0;

  const stdDed = config.stdDed;

  // Progressive states may have multi-year stdDed (like CA: { 2024: {...}, 2025: {...} })
  if (config.type === 'progressive') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progStdDed = stdDed as any;
    // Check if it's year-keyed (has numeric keys)
    const yearKey = progStdDed[year];
    if (yearKey && typeof yearKey === 'object') {
      return yearKey[filingStatus] || 0;
    }
    // Check for nearest year among numeric keys
    const years = Object.keys(progStdDed).map(Number).filter(y => !isNaN(y));
    if (years.length > 0) {
      const nearest = years.reduce((prev: number, curr: number) =>
        Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
      );
      const nearestVal = progStdDed[nearest];
      if (nearestVal && typeof nearestVal === 'object') {
        return nearestVal[filingStatus] || 0;
      }
    }
    // Single-level stdDed (StandardDeductionByStatus directly)
    return progStdDed[filingStatus] || 0;
  }

  // Flat or effective: stdDed is StandardDeductionByStatus
  if ('single' in stdDed) {
    return (stdDed as { single: number; married_jointly: number; head_of_household: number })[filingStatus] || 0;
  }
  return 0;
}

/**
 * Get state marginal tax bracket rate.
 * Extracted from getStateBracket() in index.html.
 */
function getStateBracket(
  income: number,
  filingStatus: FilingStatus,
  stateCode: string,
  year: number
): number {
  const config = STATE_TAX_DATA[stateCode];
  if (!config || config.type === 'none') return 0;
  if (config.type === 'flat') return config.rate;
  if (config.type === 'effective') return config.topRate;
  // Progressive
  const yearBrackets = getStateBrackets(stateCode, year);
  if (!yearBrackets) return (config as StateTaxProgressive).topRate || 0;
  const statusBrackets = yearBrackets[filingStatus] || yearBrackets.married_jointly;
  for (const bracket of statusBrackets) {
    if (income >= bracket.min && income < bracket.max) return bracket.rate;
  }
  return (config as StateTaxProgressive).topRate || 13.3;
}

/**
 * Estimate total state income tax.
 * Extracted from estimateStateTax() in index.html.
 */
function estimateStateTax(
  income: number,
  filingStatus: FilingStatus,
  stateCode: string,
  year: number
): number {
  const config = STATE_TAX_DATA[stateCode];
  if (!config || config.type === 'none') return 0;

  const stdDed = getStateStdDed(stateCode, filingStatus, year);
  const taxableIncome = Math.max(0, income - stdDed);

  if (config.type === 'flat') {
    let tax = taxableIncome * (config.rate / 100);
    if (config.surtax && income > config.surtax.threshold) {
      tax += (income - config.surtax.threshold) * (config.surtax.rate / 100);
    }
    return Math.round(tax);
  }

  if (config.type === 'effective') {
    const thresholds = [50000, 100000, 200000, 400000, 1000000];
    const rates = config.rates;
    if (taxableIncome <= 0) return 0;
    let effectiveRate = 0;
    if (taxableIncome <= thresholds[0]) {
      effectiveRate = rates[0] * (taxableIncome / thresholds[0]);
    } else if (taxableIncome >= thresholds[thresholds.length - 1]) {
      effectiveRate = rates[rates.length - 1];
    } else {
      for (let i = 0; i < thresholds.length - 1; i++) {
        if (taxableIncome >= thresholds[i] && taxableIncome < thresholds[i + 1]) {
          const pct = (taxableIncome - thresholds[i]) / (thresholds[i + 1] - thresholds[i]);
          effectiveRate = rates[i] + pct * (rates[i + 1] - rates[i]);
          break;
        }
      }
    }
    return Math.round(taxableIncome * (effectiveRate / 100));
  }

  // Progressive with full brackets
  const yearBrackets = getStateBrackets(stateCode, year);
  if (!yearBrackets) return 0;
  const statusBrackets = yearBrackets[filingStatus] || yearBrackets.married_jointly;
  let tax = 0;
  let remaining = taxableIncome;
  for (const bracket of statusBrackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.max - bracket.min);
    tax += taxable * (bracket.rate / 100);
    remaining -= taxable;
  }
  // Surtax (e.g. MA)
  const anyConfig = config as StateTaxConfig & { surtax?: { threshold: number; rate: number } };
  if ('surtax' in anyConfig && anyConfig.surtax && income > anyConfig.surtax.threshold) {
    tax += (income - anyConfig.surtax.threshold) * (anyConfig.surtax.rate / 100);
  }
  return Math.round(tax);
}

/**
 * Calculate homestead exemption property tax savings.
 * Extracted from getHomesteadSavings() in index.html.
 */
function getHomesteadSavings(
  stateCode: string,
  purchasePrice: number,
  propertyTaxRate: number
): number {
  const meta = STATE_META[stateCode];
  if (!meta || !meta.homesteadExemption || meta.homesteadType === 'none') return 0;
  if (meta.homesteadType === 'credit') return meta.homesteadExemption;
  if (meta.homesteadType === 'equity') return 0; // Protects equity, not tax savings
  // assessed_value or market_value: reduction in taxable value
  const exemption = Math.min(meta.homesteadExemption, purchasePrice);
  return exemption * (propertyTaxRate / 100);
}

// =============================================================
// Recalculation engine
// =============================================================

/**
 * Recalculate all derived results from the full set of inputs.
 * Called on every state change to keep results in sync.
 */
function recalculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    purchasePrice,
    downPaymentMode,
    downPaymentPercent,
    downPaymentAmount,
    interestRate,
    loanTerm,
    loanType,
    armAdjustment,
    armCap,
    propertyTaxRate,
    melloRoos,
    insurance,
    hoa,
    pmiRate,
    maintenance,
    utilities,
    extraMonthly,
    lumpSum,
    taxYear,
    filingStatus,
    annualIncome,
    selectedState,
    appreciation,
    rentAmount,
    rentIncrease,
    investReturn,
  } = inputs;

  // Resolve down payment
  const effectiveDownPaymentPercent =
    downPaymentMode === 'amount' && purchasePrice > 0
      ? (downPaymentAmount / purchasePrice) * 100
      : downPaymentPercent;

  const taxYearNum = parseInt(taxYear, 10) || 2025;

  // --- 1. PITI ---
  const piti = calculatePITI({
    purchasePrice,
    loanAmount: purchasePrice - purchasePrice * (effectiveDownPaymentPercent / 100),
    interestRate,
    loanTerm,
    propertyTaxRate,
    melloRoos,
    insurance,
    hoa,
    downPaymentPercent: effectiveDownPaymentPercent,
    pmiRate,
    maintenance,
    utilities,
    extraMonthly,
    lumpSum,
  });

  // --- 2. Upfront costs ---
  const upfrontCosts = calculateUpfrontCosts(
    purchasePrice,
    piti.loanAmount,
    piti.downPayment,
    piti.effectiveLumpSum,
    interestRate,
    insurance,
    piti.monthlyPropertyTax,
    piti.monthlyInsurance,
    hoa
  );

  // --- 3. Year 1 interest ---
  const year1Interest = calculateYear1Interest(
    piti.effectiveLoanAmount,
    interestRate,
    piti.monthlyPI,
    extraMonthly
  );

  // --- 4. Tax rates & state income tax ---
  const federalTaxRate = getFederalBracket(annualIncome, filingStatus, taxYearNum);
  const stateTaxRate = getStateBracket(annualIncome, filingStatus, selectedState, taxYearNum);
  const stateIncomeTax = estimateStateTax(annualIncome, filingStatus, selectedState, taxYearNum);
  const homesteadSavings = getHomesteadSavings(selectedState, purchasePrice, propertyTaxRate);

  // --- 5. Tax benefits ---
  const taxData = getTaxData(taxYearNum);
  const standardDeduction = taxData.standardDeduction[filingStatus] || taxData.standardDeduction.married_jointly;
  const saltCap = getSaltCap(taxYearNum, annualIncome);

  const taxBenefits = calculateTaxBenefits({
    totalInterestYear1: year1Interest,
    effectiveLoanAmount: piti.effectiveLoanAmount,
    purchasePrice,
    propertyTaxRate,
    stateIncomeTax,
    annualIncome,
    federalTaxRate,
    stateTaxRate,
    standardDeduction,
    saltCap,
    stateCode: selectedState,
    taxYear,
    homesteadSavings,
  });

  // --- 6. Amortization schedule (wealth building) ---
  const deductibleLoan = Math.min(piti.effectiveLoanAmount, 750000);
  const amortization = generateAmortizationSchedule({
    purchasePrice,
    effectiveLoanAmount: piti.effectiveLoanAmount,
    effectiveLumpSum: piti.effectiveLumpSum,
    downPayment: piti.downPayment,
    interestRate,
    loanTerm,
    appreciation,
    extraMonthly,
    monthlyPI: piti.monthlyPI,
    loanType,
    armAdjustment,
    armCap,
    deductibleLoan,
    deductibleSALT: taxBenefits.deductibleSALT,
    standardDeduction,
    itemizedWithoutHome: taxBenefits.itemizedWithoutHome,
    wouldItemizeWithoutHome: taxBenefits.wouldItemizeWithoutHome,
    federalRate: taxBenefits.federalRate,
    stateRate: taxBenefits.stateRate,
    homesteadSavings,
  });

  // --- 7. Affordability ---
  const affordability = calculateAffordability({
    annualIncome,
    interestRate,
    loanTerm,
    propertyTaxRate,
    insurance,
    hoa,
    pmiRate,
    maintenance,
    utilities,
    downPaymentPercent: effectiveDownPaymentPercent,
    downPaymentFixedAmount: downPaymentMode === 'amount' ? downPaymentAmount : undefined,
    downPaymentMode,
  });

  // --- 8. Rent vs Buy ---
  const wealthDataEquity = amortization.map(entry => entry.totalEquity);
  const rentVsBuy = calculateRentVsBuy({
    rentAmount,
    rentIncrease,
    investReturn,
    downPayment: piti.downPayment,
    trueMonthlyCost: piti.trueMonthlyCost,
    wealthDataEquity,
  });

  // --- 9. Extra payments ---
  const extraPayments = calculateExtraPayments({
    loanAmount: piti.loanAmount,
    effectiveLoanAmount: piti.effectiveLoanAmount,
    interestRate,
    loanTerm,
    extraMonthly,
    lumpSum,
  });

  // --- 10. PMI timeline ---
  const pmiTimeline = calculatePMITimeline({
    loanAmount: piti.loanAmount,
    purchasePrice,
    monthlyPI: piti.monthlyPI,
    interestRate,
    appreciationRate: appreciation,
    downPaymentPercent: effectiveDownPaymentPercent,
    extraMonthly,
    pmiRate,
  });

  return {
    piti,
    upfrontCosts,
    amortization,
    affordability,
    rentVsBuy,
    taxBenefits,
    extraPayments,
    pmiTimeline,
    year1Interest,
    federalTaxRate,
    stateTaxRate,
    stateIncomeTax,
  };
}

// =============================================================
// Initial state
// =============================================================

export const initialState: CalculatorState = {
  inputs: DEFAULT_INPUTS,
  results: recalculate(DEFAULT_INPUTS),
};

// =============================================================
// Reducer
// =============================================================

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  let newInputs: CalculatorInputs;

  switch (action.type) {
    case 'SET_INPUT':
      newInputs = { ...state.inputs, [action.field]: action.value };
      break;

    case 'SET_PERSON1':
      newInputs = {
        ...state.inputs,
        person1: { ...state.inputs.person1, [action.field]: action.value },
      };
      break;

    case 'SET_PERSON2':
      newInputs = {
        ...state.inputs,
        person2: { ...state.inputs.person2, [action.field]: action.value },
      };
      break;

    case 'SET_EXPENSE':
      newInputs = {
        ...state.inputs,
        expenses: { ...state.inputs.expenses, [action.field]: action.value },
      };
      break;

    case 'SET_STATE_COUNTY':
      newInputs = {
        ...state.inputs,
        selectedState: action.state,
        selectedCounty: action.county,
        propertyTaxRate: action.taxRate,
      };
      break;

    case 'LOAD_SCENARIO':
      newInputs = { ...action.inputs };
      break;

    case 'LOAD_FROM_URL':
      newInputs = { ...state.inputs, ...action.params };
      break;

    case 'RESET':
      newInputs = { ...DEFAULT_INPUTS };
      break;

    default:
      return state;
  }

  return { inputs: newInputs, results: recalculate(newInputs) };
}
