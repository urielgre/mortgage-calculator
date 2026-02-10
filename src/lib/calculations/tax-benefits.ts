// =============================================================
// tax-benefits.ts — Federal + state tax deduction analysis
// Extracted from index.html without modifying formulas
// =============================================================

// --- Interfaces ---

export interface TaxBenefitsInput {
  /** Total interest paid in year 1 (from calculateYear1Interest) */
  totalInterestYear1: number;
  /** Effective loan amount (after lump sum) */
  effectiveLoanAmount: number;
  /** Purchase price */
  purchasePrice: number;
  /** Annual property tax rate as %, e.g. 1.1 */
  propertyTaxRate: number;
  /** State income tax paid (annual $) */
  stateIncomeTax: number;
  /** Annual gross income */
  annualIncome: number;
  /** Federal marginal tax rate as %, e.g. 24 */
  federalTaxRate: number;
  /** State marginal tax rate as %, e.g. 9.3 */
  stateTaxRate: number;
  /** Standard deduction for filing status (from tax data), $ */
  standardDeduction: number;
  /** SALT cap for the tax year, $ */
  saltCap: number;
  /** State code, e.g. 'CA' */
  stateCode: string;
  /** Tax year, e.g. '2025' */
  taxYear: string;
  /** Homestead exemption savings (annual $, from getHomesteadSavings) */
  homesteadSavings: number;
}

export interface TaxBenefitsResult {
  /** Year 1 total interest paid */
  totalInterestYear1: number;
  /** Interest deductible after $750k loan cap */
  deductibleInterest: number;
  /** Annual property tax paid */
  annualPropertyTax: number;
  /** Property tax portion that is deductible under SALT cap */
  deductiblePropertyTax: number;
  /** State income tax deductible under SALT cap */
  deductibleStateIncome: number;
  /** Total SALT (state income + property tax) before cap */
  totalSALT: number;
  /** SALT deductible (capped) */
  deductibleSALT: number;
  /** SALT cap used */
  saltCap: number;
  /** Total itemized deductions WITH home */
  itemizedWithHome: number;
  /** Total itemized deductions WITHOUT home (renter baseline) */
  itemizedWithoutHome: number;
  /** Standard deduction amount */
  standardDeduction: number;
  /** Whether homeowner should itemize */
  shouldItemize: boolean;
  /** Whether renter would itemize (state tax alone > std deduction) */
  wouldItemizeWithoutHome: boolean;
  /** Federal tax savings vs renting (annual $) */
  federalTaxSavings: number;
  /** State tax savings from mortgage interest (annual $) */
  stateTaxSavings: number;
  /** Combined income tax savings (annual $) */
  annualTaxSavings: number;
  /** Homestead exemption savings (annual $) */
  homesteadSavings: number;
  /** Total annual tax benefit including homestead (annual $) */
  totalAnnualTaxBenefit: number;
  /** Monthly equivalent of total tax benefit */
  monthlyTaxSavings: number;
  /** Federal rate as decimal */
  federalRate: number;
  /** State rate as decimal */
  stateRate: number;
}

// --- Functions ---

/**
 * Calculate full tax benefit analysis: standard vs itemized comparison,
 * SALT cap, mortgage interest deduction.
 * Extracted from the tax section of calculate() in index.html.
 */
export function calculateTaxBenefits(
  input: TaxBenefitsInput
): TaxBenefitsResult {
  const deductibleLoan = Math.min(input.effectiveLoanAmount, 750000);
  const deductibleInterest =
    input.effectiveLoanAmount > 0
      ? input.totalInterestYear1 *
        (deductibleLoan / input.effectiveLoanAmount)
      : 0;

  const annualPropertyTax =
    (input.purchasePrice * input.propertyTaxRate) / 100;

  // SALT Cap
  const totalSALT = input.stateIncomeTax + annualPropertyTax;
  const deductibleSALT = Math.min(totalSALT, input.saltCap);

  // How much of the SALT cap goes to property tax?
  const deductiblePropertyTax = Math.min(
    annualPropertyTax,
    Math.max(0, input.saltCap - input.stateIncomeTax)
  );
  const deductibleStateIncome = deductibleSALT - deductiblePropertyTax;

  // FEDERAL TAX CALCULATION
  // Itemized deductions with home: mortgage interest + SALT (capped)
  const itemizedWithHome = deductibleInterest + deductibleSALT;

  // Itemized deductions WITHOUT home (what you'd deduct as a renter)
  // As a renter, you'd only have state income tax (capped at SALT limit)
  const itemizedWithoutHome = Math.min(
    input.stateIncomeTax,
    input.saltCap
  );

  // Should you itemize WITH the home?
  const shouldItemize = itemizedWithHome > input.standardDeduction;

  // Would you itemize WITHOUT the home?
  const wouldItemizeWithoutHome =
    itemizedWithoutHome > input.standardDeduction;

  // ACTUAL TAX BENEFIT CALCULATION
  // Compare: what you'd pay in taxes WITH home vs WITHOUT home
  let federalTaxSavings = 0;
  const federalRate = input.federalTaxRate / 100;

  if (shouldItemize) {
    // With home: use itemized deductions
    const deductionWithHome = itemizedWithHome;
    // Without home: use whichever is higher (standard or state tax only)
    const deductionWithoutHome = wouldItemizeWithoutHome
      ? itemizedWithoutHome
      : input.standardDeduction;
    // Savings = extra deduction * tax rate
    federalTaxSavings =
      Math.max(0, deductionWithHome - deductionWithoutHome) * federalRate;
  }
  // else: Not itemizing with home -- no federal mortgage benefit

  // STATE TAX BENEFIT
  // Most states allow mortgage interest deduction if you itemize on federal
  // Simplified: state benefit only if itemizing federally
  const stateRate = input.stateTaxRate / 100;
  let stateTaxSavings = 0;
  if (shouldItemize) {
    stateTaxSavings = deductibleInterest * stateRate;
  }

  const annualTaxSavings = federalTaxSavings + stateTaxSavings;

  const totalAnnualTaxBenefit =
    annualTaxSavings + input.homesteadSavings;
  const monthlyTaxSavings = totalAnnualTaxBenefit / 12;

  return {
    totalInterestYear1: input.totalInterestYear1,
    deductibleInterest,
    annualPropertyTax,
    deductiblePropertyTax,
    deductibleStateIncome,
    totalSALT,
    deductibleSALT,
    saltCap: input.saltCap,
    itemizedWithHome,
    itemizedWithoutHome,
    standardDeduction: input.standardDeduction,
    shouldItemize,
    wouldItemizeWithoutHome,
    federalTaxSavings,
    stateTaxSavings,
    annualTaxSavings,
    homesteadSavings: input.homesteadSavings,
    totalAnnualTaxBenefit,
    monthlyTaxSavings,
    federalRate,
    stateRate,
  };
}
