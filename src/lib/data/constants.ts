/**
 * Tax and mortgage calculation constants.
 * Sources: IRS.gov, FTB.ca.gov, EDD.ca.gov, SSA.gov
 * Last verified: February 2026
 */

import type { FilingStatus } from './income-tax-rates';

// ========================================
// FICA & PAYROLL CONSTANTS
// ========================================

/** Federal flat withholding rate for bonuses < $1M */
export const BONUS_WITHHOLDING_RATE = 0.22;

/** Conservative RSU withholding estimate (fed + state + FICA) */
export const RSU_WITHHOLDING_RATE = 0.37;

// ========================================
// FEDERAL TAX BRACKETS (by year)
// ========================================

export interface FederalTaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface StandardDeductionByStatus {
  single: number;
  married_jointly: number;
  head_of_household: number;
}

export interface SaltPhaseout {
  threshold: number;
  rate: number;
  floor: number;
}

export interface TaxYearData {
  federal: Record<FilingStatus, FederalTaxBracket[]>;
  standardDeduction: StandardDeductionByStatus;
  saltCap: number;
  saltPhaseout: SaltPhaseout | null;
  ssWageBase: number;
  max401k: number;
}

export const TAX_DATA: Record<number, TaxYearData> = {
  2024: {
    federal: {
      single: [
        { min: 0, max: 11600, rate: 10 }, { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 }, { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 }, { min: 243725, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
      ],
      married_jointly: [
        { min: 0, max: 23200, rate: 10 }, { min: 23200, max: 94300, rate: 12 },
        { min: 94300, max: 201050, rate: 22 }, { min: 201050, max: 383900, rate: 24 },
        { min: 383900, max: 487450, rate: 32 }, { min: 487450, max: 731200, rate: 35 },
        { min: 731200, max: Infinity, rate: 37 },
      ],
      head_of_household: [
        { min: 0, max: 16550, rate: 10 }, { min: 16550, max: 63100, rate: 12 },
        { min: 63100, max: 100500, rate: 22 }, { min: 100500, max: 191950, rate: 24 },
        { min: 191950, max: 243700, rate: 32 }, { min: 243700, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
      ],
    },
    standardDeduction: { single: 14600, married_jointly: 29200, head_of_household: 21900 },
    saltCap: 10000,
    saltPhaseout: null,
    ssWageBase: 168600,
    max401k: 23000,
  },
  2025: {
    federal: {
      single: [
        { min: 0, max: 11925, rate: 10 }, { min: 11925, max: 48475, rate: 12 },
        { min: 48475, max: 103350, rate: 22 }, { min: 103350, max: 197300, rate: 24 },
        { min: 197300, max: 250525, rate: 32 }, { min: 250525, max: 626350, rate: 35 },
        { min: 626350, max: Infinity, rate: 37 },
      ],
      married_jointly: [
        { min: 0, max: 23850, rate: 10 }, { min: 23850, max: 96950, rate: 12 },
        { min: 96950, max: 206700, rate: 22 }, { min: 206700, max: 394600, rate: 24 },
        { min: 394600, max: 501050, rate: 32 }, { min: 501050, max: 751600, rate: 35 },
        { min: 751600, max: Infinity, rate: 37 },
      ],
      head_of_household: [
        { min: 0, max: 17000, rate: 10 }, { min: 17000, max: 64850, rate: 12 },
        { min: 64850, max: 103350, rate: 22 }, { min: 103350, max: 197300, rate: 24 },
        { min: 197300, max: 250500, rate: 32 }, { min: 250500, max: 626350, rate: 35 },
        { min: 626350, max: Infinity, rate: 37 },
      ],
    },
    standardDeduction: { single: 15750, married_jointly: 31500, head_of_household: 23625 },
    saltCap: 40000,
    saltPhaseout: { threshold: 500000, rate: 0.30, floor: 10000 }, // OBBBA: 30% reduction above $500k MAGI
    ssWageBase: 176100,
    max401k: 23500,
  },
  2026: {
    federal: {
      single: [
        { min: 0, max: 12400, rate: 10 }, { min: 12400, max: 50400, rate: 12 },
        { min: 50400, max: 105700, rate: 22 }, { min: 105700, max: 201775, rate: 24 },
        { min: 201775, max: 256225, rate: 32 }, { min: 256225, max: 640600, rate: 35 },
        { min: 640600, max: Infinity, rate: 37 },
      ],
      married_jointly: [
        { min: 0, max: 24800, rate: 10 }, { min: 24800, max: 100800, rate: 12 },
        { min: 100800, max: 211400, rate: 22 }, { min: 211400, max: 403550, rate: 24 },
        { min: 403550, max: 512450, rate: 32 }, { min: 512450, max: 768700, rate: 35 },
        { min: 768700, max: Infinity, rate: 37 },
      ],
      head_of_household: [
        { min: 0, max: 17700, rate: 10 }, { min: 17700, max: 67450, rate: 12 },
        { min: 67450, max: 105700, rate: 22 }, { min: 105700, max: 201775, rate: 24 },
        { min: 201775, max: 256200, rate: 32 }, { min: 256200, max: 640600, rate: 35 },
        { min: 640600, max: Infinity, rate: 37 },
      ],
    },
    standardDeduction: { single: 16100, married_jointly: 32200, head_of_household: 24150 },
    saltCap: 40400,
    saltPhaseout: { threshold: 505000, rate: 0.30, floor: 10000 }, // 1% annual increase from 2025
    ssWageBase: 184500,
    max401k: 24500,
  },
};

// ========================================
// DERIVED CONSTANTS
// ========================================

export const AVAILABLE_TAX_YEARS: number[] = Object.keys(TAX_DATA).map(Number).sort();
export const LATEST_TAX_DATA_YEAR: number = Math.max(...AVAILABLE_TAX_YEARS);

// ========================================
// MORTGAGE DEFAULTS
// ========================================

/** Default PMI rate (annual, as percentage of loan amount) */
export const DEFAULT_PMI_RATE = 0.5;

/** Default annual homeowners insurance ($) */
export const DEFAULT_INSURANCE = 2400;

/** Default property tax rate (%) */
export const DEFAULT_PROPERTY_TAX_RATE = 1.1;

/** Default annual home appreciation rate (%) */
export const DEFAULT_APPRECIATION_RATE = 3;

/** Default maintenance rate (% of home value per year) */
export const DEFAULT_MAINTENANCE_RATE = 1;

/** Default monthly utilities ($) */
export const DEFAULT_UTILITIES = 300;

/** Default interest rate (%) */
export const DEFAULT_INTEREST_RATE = 6.5;

/** Default loan term (years) */
export const DEFAULT_LOAN_TERM = 30;

/** Default down payment percentage */
export const DEFAULT_DOWN_PAYMENT_PERCENT = 20;

// ========================================
// CLOSING COST RATES
// ========================================

/** Loan origination fee rate */
export const LOAN_ORIGINATION_RATE = 0.0075;

/** Appraisal fee ($) */
export const APPRAISAL_FEE = 600;

/** Credit report fee ($) */
export const CREDIT_REPORT_FEE = 50;

/** Title insurance rate (of purchase price) */
export const TITLE_INSURANCE_RATE = 0.003;

/** Escrow fee rate (of purchase price) */
export const ESCROW_FEE_RATE = 0.002;

/** Recording fees ($) */
export const RECORDING_FEES = 200;

/** Notary fees ($) */
export const NOTARY_FEES = 200;

/** Home inspection fee ($) */
export const HOME_INSPECTION_FEE = 500;

/** Pest inspection fee ($) */
export const PEST_INSPECTION_FEE = 150;

/** HOA transfer fee ($) — applied only when HOA > 0 */
export const HOA_TRANSFER_FEE = 500;

/** Number of days of prepaid interest */
export const PREPAID_INTEREST_DAYS = 15;

/** Number of months of prepaid property tax */
export const PREPAID_PROPERTY_TAX_MONTHS = 2;

// ========================================
// PMI THRESHOLDS
// ========================================

/** Down payment percentage threshold below which PMI is required */
export const PMI_REQUIRED_THRESHOLD = 20;

// ========================================
// DTI / AFFORDABILITY
// ========================================

/** Front-end DTI ratio used for affordability calculation */
export const FRONT_END_DTI_RATIO = 0.28;

// ========================================
// HELPER: Get tax data for a given year
// ========================================

export function getTaxData(year: number): TaxYearData {
  return TAX_DATA[year] || TAX_DATA[LATEST_TAX_DATA_YEAR];
}

export function getSaltCap(year: number, magi: number): number {
  const data = getTaxData(year);
  let cap = data.saltCap;
  if (data.saltPhaseout && magi > data.saltPhaseout.threshold) {
    const reduction = (magi - data.saltPhaseout.threshold) * data.saltPhaseout.rate;
    cap = Math.max(data.saltPhaseout.floor, cap - reduction);
  }
  return cap;
}
