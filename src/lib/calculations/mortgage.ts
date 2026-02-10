// =============================================================
// mortgage.ts — Core mortgage calculations
// Extracted from index.html without modifying formulas
// =============================================================

// --- Interfaces ---

export interface MonthlyPaymentInput {
  principal: number;
  annualRate: number; // e.g. 6.5 for 6.5%
  years: number;
}

export interface PITIInput {
  purchasePrice: number;
  loanAmount: number;
  interestRate: number; // annual, e.g. 6.5
  loanTerm: number; // years
  propertyTaxRate: number; // annual %, e.g. 1.1
  melloRoos: number; // annual $
  insurance: number; // annual $
  hoa: number; // monthly $
  downPaymentPercent: number;
  pmiRate: number; // annual %, e.g. 0.5
  maintenance: number; // annual % of purchase price
  utilities: number; // monthly $
  extraMonthly: number; // monthly extra principal $
  lumpSum: number; // one-time extra principal $
}

export interface PITIResult {
  monthlyPI: number;
  baselineMonthlyPI: number;
  monthlyPropertyTax: number;
  monthlyMelloRoos: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  monthlyMaintenance: number;
  monthlyUtilities: number;
  monthlyPITI: number;
  trueMonthlyCost: number;
  loanAmount: number;
  effectiveLoanAmount: number;
  effectiveLumpSum: number;
  downPayment: number;
  downPaymentPercent: number;
}

export interface ClosingCosts {
  [key: string]: number;
}

export interface UpfrontCostsResult {
  closingCosts: ClosingCosts;
  totalClosingCosts: number;
  escrowReserve: number;
  totalCashNeeded: number;
}

export interface AmortizationEntry {
  year: number;
  homeValue: number;
  remainingMortgage: number;
  equityFromPayments: number;
  appreciationGain: number;
  totalEquity: number;
  cumulativeTaxSavings: number;
  totalWealthImpact: number;
  yearInterest: number;
  yearPrincipal: number;
  rate: number;
  monthlyPayment: number;
}

export interface AmortizationInput {
  purchasePrice: number;
  effectiveLoanAmount: number;
  effectiveLumpSum: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  appreciation: number;
  extraMonthly: number;
  monthlyPI: number;
  // ARM settings
  loanType: string; // 'fixed' | '3' | '5' | '7' | '10'
  armAdjustment: number;
  armCap: number;
  // Tax benefit inputs (for cumulative tax savings)
  deductibleLoan: number;
  deductibleSALT: number;
  standardDeduction: number;
  itemizedWithoutHome: number;
  wouldItemizeWithoutHome: boolean;
  federalRate: number; // decimal, e.g. 0.24
  stateRate: number; // decimal, e.g. 0.093
  homesteadSavings: number;
}

// --- Functions ---

/**
 * Calculate monthly Principal & Interest payment.
 * Direct copy of calculateMonthlyPayment from index.html.
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return (
    principal *
    ((monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1))
  );
}

/**
 * Calculate full PITI and true monthly cost breakdown.
 * Extracted from the calculate() function in index.html.
 */
export function calculatePITI(input: PITIInput): PITIResult {
  const downPayment = input.purchasePrice * (input.downPaymentPercent / 100);
  const loanAmount = input.purchasePrice - downPayment;

  // Extra payments -- lump sum reduces effective starting balance
  const effectiveLumpSum = Math.min(input.lumpSum, loanAmount);
  const effectiveLoanAmount = loanAmount - effectiveLumpSum;

  // Monthly P&I (based on effective loan after lump sum)
  const monthlyPI = calculateMonthlyPayment(
    effectiveLoanAmount,
    input.interestRate,
    input.loanTerm
  );

  // Baseline P&I without extra payments (for savings comparison)
  const baselineMonthlyPI =
    effectiveLumpSum > 0 || input.extraMonthly > 0
      ? calculateMonthlyPayment(loanAmount, input.interestRate, input.loanTerm)
      : monthlyPI;

  // Monthly costs
  const monthlyPropertyTax =
    (input.purchasePrice * input.propertyTaxRate) / 100 / 12;
  const monthlyMelloRoos = input.melloRoos / 12;
  const monthlyInsurance = input.insurance / 12;
  const monthlyHOA = input.hoa;

  // PMI (if down < 20%)
  let monthlyPMI = 0;
  if (input.downPaymentPercent < 20) {
    monthlyPMI = ((loanAmount * input.pmiRate) / 100) / 12;
  }

  const monthlyMaintenance =
    (input.purchasePrice * input.maintenance) / 100 / 12;
  const monthlyUtilities = input.utilities;

  // Totals
  const monthlyPITI =
    monthlyPI +
    monthlyPropertyTax +
    monthlyMelloRoos +
    monthlyInsurance +
    monthlyPMI +
    monthlyHOA;

  const trueMonthlyCost =
    monthlyPITI +
    monthlyMaintenance +
    monthlyUtilities +
    input.extraMonthly;

  return {
    monthlyPI,
    baselineMonthlyPI,
    monthlyPropertyTax,
    monthlyMelloRoos,
    monthlyInsurance,
    monthlyHOA,
    monthlyPMI,
    monthlyMaintenance,
    monthlyUtilities,
    monthlyPITI,
    trueMonthlyCost,
    loanAmount,
    effectiveLoanAmount,
    effectiveLumpSum,
    downPayment,
    downPaymentPercent: input.downPaymentPercent,
  };
}

/**
 * Calculate upfront / closing costs.
 * Extracted from the calculate() function in index.html.
 */
export function calculateUpfrontCosts(
  purchasePrice: number,
  loanAmount: number,
  downPayment: number,
  effectiveLumpSum: number,
  interestRate: number,
  insurance: number,
  monthlyPropertyTax: number,
  monthlyInsurance: number,
  hoa: number
): UpfrontCostsResult {
  const closingCosts: ClosingCosts = {
    'Loan Origination (0.75%)': loanAmount * 0.0075,
    'Appraisal Fee': 600,
    'Credit Report': 50,
    'Title Insurance': purchasePrice * 0.003,
    'Escrow Fee': purchasePrice * 0.002,
    'Recording Fees': 200,
    'Notary Fees': 200,
    'Home Inspection': 500,
    'Pest Inspection': 150,
    'Prepaid Interest (15 days)':
      ((loanAmount * interestRate) / 100 / 365) * 15,
    'Prepaid Property Tax (2 mo)': monthlyPropertyTax * 2,
    'Prepaid Insurance (12 mo)': insurance,
  };
  if (hoa > 0) closingCosts['HOA Transfer Fee'] = 500;

  const totalClosingCosts = Object.values(closingCosts).reduce(
    (a, b) => a + b,
    0
  );
  const escrowReserve = monthlyPropertyTax * 2 + monthlyInsurance * 2;
  const totalCashNeeded =
    downPayment + totalClosingCosts + escrowReserve + effectiveLumpSum;

  return {
    closingCosts,
    totalClosingCosts,
    escrowReserve,
    totalCashNeeded,
  };
}

/**
 * Generate 10-year amortization schedule with ARM support.
 * Extracted from the wealth-building loop in calculate().
 */
export function generateAmortizationSchedule(
  input: AmortizationInput
): AmortizationEntry[] {
  const wealthData: AmortizationEntry[] = [];
  let cumulativeTaxSavings = 0;
  let balance = input.effectiveLoanAmount;

  const isARM = input.loanType !== 'fixed';
  const armFixedYears = isARM
    ? parseInt(input.loanType)
    : input.loanTerm;
  let currentRate = input.interestRate;
  let currentMonthlyPI = input.monthlyPI;

  for (let year = 1; year <= 10; year++) {
    // ARM: adjust rate after fixed period
    if (isARM && year > armFixedYears) {
      currentRate = Math.min(
        currentRate + input.armAdjustment,
        input.armCap
      );
      const remainingYears = input.loanTerm - year + 1;
      currentMonthlyPI = calculateMonthlyPayment(
        Math.max(balance, 0),
        currentRate,
        remainingYears
      );
    }

    const yearMonthlyRate = currentRate / 100 / 12;
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;
      const interestPayment = balance * yearMonthlyRate;
      const basePrincipal = currentMonthlyPI - interestPayment;
      const extraPrincipal = Math.min(
        input.extraMonthly,
        balance - basePrincipal
      );
      const principalPayment = Math.min(
        basePrincipal + Math.max(extraPrincipal, 0),
        balance
      );
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      balance = Math.max(balance - principalPayment, 0);
    }

    const homeValue =
      input.purchasePrice *
      Math.pow(1 + input.appreciation / 100, year);
    const appreciationGain = homeValue - input.purchasePrice;
    const equityFromPayments =
      input.effectiveLoanAmount - balance + input.effectiveLumpSum;
    const totalEquity =
      input.downPayment + equityFromPayments + appreciationGain;

    // Tax benefit calculation per year (using corrected logic)
    const loanRef =
      input.effectiveLoanAmount > 0 ? input.effectiveLoanAmount : 1;
    const yearDeductibleInterest =
      input.effectiveLoanAmount > 0
        ? yearInterest *
          (Math.min(input.deductibleLoan, input.effectiveLoanAmount) /
            loanRef)
        : 0;
    const yearItemizedWithHome =
      yearDeductibleInterest + input.deductibleSALT;
    const yearShouldItemize =
      yearItemizedWithHome > input.standardDeduction;

    let yearFederalSavings = 0;
    let yearStateSavings = 0;
    if (yearShouldItemize) {
      const yearDeductionWithoutHome = input.wouldItemizeWithoutHome
        ? input.itemizedWithoutHome
        : input.standardDeduction;
      yearFederalSavings =
        Math.max(0, yearItemizedWithHome - yearDeductionWithoutHome) *
        input.federalRate;
      yearStateSavings = yearDeductibleInterest * input.stateRate;
    }
    const yearTaxSavings =
      yearFederalSavings + yearStateSavings + input.homesteadSavings;
    cumulativeTaxSavings += yearTaxSavings;

    wealthData.push({
      year,
      homeValue,
      remainingMortgage: balance,
      equityFromPayments,
      appreciationGain,
      totalEquity,
      cumulativeTaxSavings,
      totalWealthImpact: totalEquity + cumulativeTaxSavings,
      yearInterest,
      yearPrincipal,
      rate: currentRate,
      monthlyPayment: currentMonthlyPI + input.extraMonthly,
    });
  }

  return wealthData;
}

/**
 * Calculate Year-1 interest with extra payments factored in.
 * Extracted from the calculate() function in index.html.
 */
export function calculateYear1Interest(
  effectiveLoanAmount: number,
  interestRate: number,
  monthlyPI: number,
  extraMonthly: number
): number {
  let balance = effectiveLoanAmount;
  let totalInterestYear1 = 0;
  const monthlyRate = interestRate / 100 / 12;

  for (let month = 1; month <= 12; month++) {
    if (balance <= 0) break;
    const interestPayment = balance * monthlyRate;
    const basePrincipal = monthlyPI - interestPayment;
    const extraPrinc = Math.min(extraMonthly, balance - basePrincipal);
    const principalPayment = Math.min(
      basePrincipal + Math.max(extraPrinc, 0),
      balance
    );
    totalInterestYear1 += interestPayment;
    balance = Math.max(balance - principalPayment, 0);
  }

  return totalInterestYear1;
}
