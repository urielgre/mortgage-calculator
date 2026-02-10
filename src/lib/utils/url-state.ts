import type { CalculatorInputs } from '../store/types';

// Map from URL param key → CalculatorInputs field name
const URL_PARAM_MAP: Record<string, keyof CalculatorInputs> = {
  state: 'selectedState',
  price: 'purchasePrice',
  down: 'downPaymentPercent',
  rate: 'interestRate',
  term: 'loanTerm',
  type: 'loanType',
  tax: 'propertyTaxRate',
  county: 'selectedCounty',
  hoa: 'hoa',
  ins: 'insurance',
  income: 'monthlyTakeHome',
  appr: 'appreciation',
  extra: 'extraMonthly',
  lump: 'lumpSum',
  rent: 'rentAmount',
  rinc: 'rentIncrease',
  inv: 'investReturn',
};

// String fields (don't parse as number)
const STRING_FIELDS = new Set<string>(['selectedState', 'selectedCounty', 'loanType']);

/**
 * Encode calculator inputs to URL search params string.
 * Produces the same format as v1 for backward compatibility.
 */
export function encodeStateToURL(inputs: CalculatorInputs): string {
  const params = new URLSearchParams();
  for (const [param, field] of Object.entries(URL_PARAM_MAP)) {
    const value = inputs[field];
    if (value !== undefined && value !== null) {
      params.set(param, String(value));
    }
  }
  return params.toString();
}

/**
 * Decode URL search params to partial calculator inputs.
 * Returns only the fields present in the URL.
 */
export function decodeStateFromURL(
  searchParams: string | URLSearchParams,
): Partial<CalculatorInputs> {
  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
  if (params.toString() === '') return {};

  const partial: Record<string, unknown> = {};
  for (const [param, field] of Object.entries(URL_PARAM_MAP)) {
    if (params.has(param)) {
      const raw = params.get(param)!;
      if (STRING_FIELDS.has(field)) {
        partial[field] = raw;
      } else {
        const num = parseFloat(raw);
        if (!isNaN(num)) partial[field] = num;
      }
    }
  }
  return partial as Partial<CalculatorInputs>;
}

/**
 * Check if current URL has calculator state params.
 */
export function hasURLState(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.toString() !== '';
}
