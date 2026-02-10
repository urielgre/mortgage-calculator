// =============================================================
// types.ts — All type definitions for calculator state management
// =============================================================

import type { FilingStatus } from '../data/income-tax-rates';
import type { PITIResult, UpfrontCostsResult, AmortizationEntry } from '../calculations/mortgage';
import type { AffordabilityResult } from '../calculations/affordability';
import type { RentVsBuyResult } from '../calculations/rent-vs-buy';
import type { TaxBenefitsResult } from '../calculations/tax-benefits';
import type { ExtraPaymentsResult } from '../calculations/extra-payments';
import type { PMITimelineResult } from '../calculations/pmi';

export type { FilingStatus };

// --- Input sub-types ---

export type DownPaymentMode = 'percent' | 'amount';

export type LoanType = 'fixed' | '3' | '5' | '7' | '10';

export type CompFrequency = 'annual' | 'quarterly' | 'monthly';

export interface PersonCompensation {
  baseSalary: number;
  annualBonus: number;
  bonusFreq: CompFrequency;
  annualRSU: number;
  rsuFreq: CompFrequency;
  retirement401k: number; // percent
  preTaxDeductions: number; // monthly $
}

export interface MonthlyExpenses {
  car: number;
  gas: number;
  carInsurance: number;
  health: number;
  food: number;
  dining: number;
  phone: number;
  subscriptions: number;
  childcare: number;
  studentLoans: number;
  creditCards: number;
  otherDebt: number;
  shopping: number;
  entertainment: number;
  medical: number;
  pets: number;
  savings: number;
  other: number;
}

// --- Main inputs ---

export interface CalculatorInputs {
  // Location
  selectedState: string;
  selectedCounty: string; // rate value as string, e.g. "1.10"

  // Core mortgage
  purchasePrice: number;
  downPaymentMode: DownPaymentMode;
  downPaymentPercent: number;
  downPaymentAmount: number;
  interestRate: number;
  loanTerm: number;
  loanType: LoanType;
  armAdjustment: number;
  armCap: number;

  // Property costs
  propertyTaxRate: number;
  melloRoos: number;
  insurance: number;
  hoa: number;
  pmiRate: number;
  maintenance: number;
  utilities: number;

  // Tax
  taxYear: string; // e.g. "2025"
  filingStatus: FilingStatus;
  annualIncome: number;

  // Financial
  appreciation: number;
  extraMonthly: number;
  lumpSum: number;

  // Compensation
  person1: PersonCompensation;
  person2: PersonCompensation;

  // Income
  monthlyTakeHome: number;
  otherIncome: number;
  overrideTakeHome: boolean;

  // Expenses
  expenses: MonthlyExpenses;

  // Rent vs Buy
  rentAmount: number;
  rentIncrease: number;
  investReturn: number;
}

// --- Results ---

export interface CalculatorResults {
  piti: PITIResult;
  upfrontCosts: UpfrontCostsResult;
  amortization: AmortizationEntry[];
  affordability: AffordabilityResult;
  rentVsBuy: RentVsBuyResult;
  taxBenefits: TaxBenefitsResult;
  extraPayments: ExtraPaymentsResult;
  pmiTimeline: PMITimelineResult;
  // Derived convenience values
  year1Interest: number;
  federalTaxRate: number;
  stateTaxRate: number;
  stateIncomeTax: number;
}

// --- Actions ---

export type CalculatorAction =
  | { type: 'SET_INPUT'; field: keyof CalculatorInputs; value: CalculatorInputs[keyof CalculatorInputs] }
  | { type: 'SET_PERSON1'; field: keyof PersonCompensation; value: number | CompFrequency }
  | { type: 'SET_PERSON2'; field: keyof PersonCompensation; value: number | CompFrequency }
  | { type: 'SET_EXPENSE'; field: keyof MonthlyExpenses; value: number }
  | { type: 'SET_STATE_COUNTY'; state: string; county: string; taxRate: number }
  | { type: 'LOAD_SCENARIO'; inputs: CalculatorInputs }
  | { type: 'LOAD_FROM_URL'; params: Partial<CalculatorInputs> }
  | { type: 'RESET' };

// --- State ---

export interface CalculatorState {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}

// --- Defaults ---

export const DEFAULT_INPUTS: CalculatorInputs = {
  selectedState: 'CA',
  selectedCounty: '1.10',
  purchasePrice: 800000,
  downPaymentMode: 'percent',
  downPaymentPercent: 20,
  downPaymentAmount: 160000,
  interestRate: 6.5,
  loanTerm: 30,
  loanType: 'fixed',
  armAdjustment: 0.25,
  armCap: 11,
  propertyTaxRate: 1.1,
  melloRoos: 0,
  insurance: 2400,
  hoa: 0,
  pmiRate: 0.5,
  maintenance: 1,
  utilities: 300,
  taxYear: '2025',
  filingStatus: 'married_jointly',
  annualIncome: 480000,
  appreciation: 3,
  extraMonthly: 0,
  lumpSum: 0,
  person1: {
    baseSalary: 200000,
    annualBonus: 30000,
    bonusFreq: 'annual',
    annualRSU: 50000,
    rsuFreq: 'quarterly',
    retirement401k: 6,
    preTaxDeductions: 500,
  },
  person2: {
    baseSalary: 150000,
    annualBonus: 20000,
    bonusFreq: 'annual',
    annualRSU: 30000,
    rsuFreq: 'quarterly',
    retirement401k: 6,
    preTaxDeductions: 300,
  },
  monthlyTakeHome: 20000,
  otherIncome: 0,
  overrideTakeHome: false,
  expenses: {
    car: 500,
    gas: 300,
    carInsurance: 200,
    health: 400,
    food: 800,
    dining: 400,
    phone: 150,
    subscriptions: 100,
    childcare: 0,
    studentLoans: 0,
    creditCards: 0,
    otherDebt: 0,
    shopping: 300,
    entertainment: 200,
    medical: 100,
    pets: 0,
    savings: 1000,
    other: 200,
  },
  rentAmount: 3000,
  rentIncrease: 3,
  investReturn: 7,
};
