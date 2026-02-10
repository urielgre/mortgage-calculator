import type { CalculatorInputs } from '../store/types';
import { DEFAULT_INPUTS } from '../store/types';

const STORAGE_KEY = 'houseCalcData';
const SCENARIO_STORAGE_KEY = 'houseCalcScenarios';
const MAX_SCENARIOS = 3;

// v1 field mapping: v1 DOM ID → v2 CalculatorInputs path
// This mapping enables loading v1 saved data in v2
const V1_FIELD_MAP: Record<string, string> = {
  stateSelect: 'selectedState',
  purchasePrice: 'purchasePrice',
  downPaymentMode: 'downPaymentMode',
  downPaymentPercent: 'downPaymentPercent',
  downPaymentAmount: 'downPaymentAmount',
  interestRate: 'interestRate',
  loanTerm: 'loanTerm',
  loanType: 'loanType',
  armAdjustment: 'armAdjustment',
  armCap: 'armCap',
  countySelect: 'selectedCounty',
  propertyTaxRate: 'propertyTaxRate',
  melloRoos: 'melloRoos',
  insurance: 'insurance',
  hoa: 'hoa',
  pmiRate: 'pmiRate',
  maintenance: 'maintenance',
  utilities: 'utilities',
  taxYear: 'taxYear',
  filingStatus: 'filingStatus',
  annualIncome: 'annualIncome',
  appreciation: 'appreciation',
  extraMonthly: 'extraMonthly',
  lumpSum: 'lumpSum',
  // Person 1
  baseSalary1: 'person1.baseSalary',
  annualBonus1: 'person1.annualBonus',
  bonusFreq1: 'person1.bonusFreq',
  annualRSU1: 'person1.annualRSU',
  rsuFreq1: 'person1.rsuFreq',
  retirement401k1: 'person1.retirement401k',
  preTaxDeductions1: 'person1.preTaxDeductions',
  // Person 2
  baseSalary2: 'person2.baseSalary',
  annualBonus2: 'person2.annualBonus',
  bonusFreq2: 'person2.bonusFreq',
  annualRSU2: 'person2.annualRSU',
  rsuFreq2: 'person2.rsuFreq',
  retirement401k2: 'person2.retirement401k',
  preTaxDeductions2: 'person2.preTaxDeductions',
  // Income
  monthlyTakeHome: 'monthlyTakeHome',
  otherIncome: 'otherIncome',
  // Expenses (with exp prefix in v1)
  expCar: 'expenses.car',
  expGas: 'expenses.gas',
  expCarInsurance: 'expenses.carInsurance',
  expHealth: 'expenses.health',
  expFood: 'expenses.food',
  expDining: 'expenses.dining',
  expPhone: 'expenses.phone',
  expSubscriptions: 'expenses.subscriptions',
  expChildcare: 'expenses.childcare',
  expStudentLoans: 'expenses.studentLoans',
  expCreditCards: 'expenses.creditCards',
  expOtherDebt: 'expenses.otherDebt',
  expShopping: 'expenses.shopping',
  expEntertainment: 'expenses.entertainment',
  expMedical: 'expenses.medical',
  expPets: 'expenses.pets',
  expSavings: 'expenses.savings',
  expOther: 'expenses.other',
  // Rent vs Buy
  rentAmount: 'rentAmount',
  rentIncrease: 'rentIncrease',
  investReturn: 'investReturn',
};

// String fields that shouldn't be parsed as numbers
const STRING_FIELDS = new Set([
  'selectedState',
  'selectedCounty',
  'downPaymentMode',
  'loanType',
  'taxYear',
  'filingStatus',
  'person1.bonusFreq',
  'person1.rsuFreq',
  'person2.bonusFreq',
  'person2.rsuFreq',
]);

/**
 * Save calculator inputs to localStorage (auto-save).
 * Saves in v1-compatible flat format using the DOM field IDs as keys.
 */
export function saveData(inputs: CalculatorInputs): void {
  try {
    const data: Record<string, string> = {};
    // Reverse map: v2 path → v1 key
    for (const [v1Key, v2Path] of Object.entries(V1_FIELD_MAP)) {
      const value = getNestedValue(inputs, v2Path);
      if (value !== undefined) {
        data[v1Key] = String(value);
      }
    }
    data.overrideTakeHome = String(inputs.overrideTakeHome);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (SSR, private browsing, quota exceeded)
  }
}

/**
 * Load calculator inputs from localStorage (auto-save).
 * Reads v1-format flat data and maps to v2 CalculatorInputs.
 */
export function loadData(): Partial<CalculatorInputs> | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return mapV1DataToInputs(data);
  } catch {
    return null;
  }
}

// Scenario types
export interface ScenarioSnapshot {
  name: string;
  timestamp: number;
  inputs: CalculatorInputs;
  // Summary values for display (optional)
  price?: string;
  down?: string;
  rate?: string;
  term?: string;
}

/**
 * Get all saved scenarios.
 */
export function getScenarios(): ScenarioSnapshot[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new scenario. Max 3 scenarios.
 */
export function saveScenario(name: string, inputs: CalculatorInputs): boolean {
  const scenarios = getScenarios();
  if (scenarios.length >= MAX_SCENARIOS) return false;

  // Save in v2 format (full inputs) + v1-compatible summary fields
  const snapshot: ScenarioSnapshot = {
    name,
    timestamp: Date.now(),
    inputs,
    price: String(inputs.purchasePrice),
    down: String(inputs.downPaymentPercent),
    rate: String(inputs.interestRate),
    term: String(inputs.loanTerm),
  };

  // Also save flat inputs for v1 backward compatibility
  const flatInputs: Record<string, string> = {};
  for (const [v1Key, v2Path] of Object.entries(V1_FIELD_MAP)) {
    const value = getNestedValue(inputs, v2Path);
    if (value !== undefined) flatInputs[v1Key] = String(value);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- v1 compat extra fields
  (snapshot as any).inputs_flat = flatInputs;
  (snapshot as any).overrideTakeHome = inputs.overrideTakeHome;

  scenarios.push(snapshot);
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load a scenario by index.
 */
export function loadScenario(index: number): CalculatorInputs | null {
  const scenarios = getScenarios();
  const s = scenarios[index];
  if (!s) return null;

  // v2 format: full inputs object
  if (s.inputs && typeof s.inputs === 'object' && 'purchasePrice' in s.inputs) {
    return { ...DEFAULT_INPUTS, ...s.inputs };
  }

  // v1 format: flat key-value in inputs_flat
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- v1 compat extra fields
  const record = s as any;
  const data = (record.inputs_flat || s.inputs) as Record<string, string> | undefined;
  if (data && typeof data === 'object') {
    const partial = mapV1DataToInputs(data);
    return partial ? { ...DEFAULT_INPUTS, ...partial } : null;
  }

  // Legacy format (only 4 core fields)
  return {
    ...DEFAULT_INPUTS,
    purchasePrice: Number(s.price) || DEFAULT_INPUTS.purchasePrice,
    downPaymentPercent: Number(s.down) || DEFAULT_INPUTS.downPaymentPercent,
    interestRate: Number(s.rate) || DEFAULT_INPUTS.interestRate,
    loanTerm: Number(s.term) || DEFAULT_INPUTS.loanTerm,
  };
}

/**
 * Delete a scenario by index.
 */
export function deleteScenario(index: number): void {
  const scenarios = getScenarios();
  scenarios.splice(index, 1);
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // ignore
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- needed for dynamic dot-path access
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((o: any, k: string) => o?.[k], obj);
}

// Helper: set nested value on object using dot path
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) current[keys[i]] = {};
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

// Helper: map v1 flat data to v2 CalculatorInputs
function mapV1DataToInputs(data: Record<string, string>): Partial<CalculatorInputs> | null {
  if (!data || typeof data !== 'object') return null;

  const result: Record<string, unknown> = {};
  // Start with nested defaults for person1/person2/expenses
  result.person1 = { ...DEFAULT_INPUTS.person1 };
  result.person2 = { ...DEFAULT_INPUTS.person2 };
  result.expenses = { ...DEFAULT_INPUTS.expenses };

  for (const [v1Key, v2Path] of Object.entries(V1_FIELD_MAP)) {
    if (data[v1Key] !== undefined) {
      const raw = data[v1Key];
      if (STRING_FIELDS.has(v2Path)) {
        setNestedValue(result, v2Path, raw);
      } else {
        const num = parseFloat(raw);
        if (!isNaN(num)) setNestedValue(result, v2Path, num);
      }
    }
  }

  if (data.overrideTakeHome !== undefined) {
    result.overrideTakeHome = data.overrideTakeHome === 'true';
  }

  return result as Partial<CalculatorInputs>;
}
