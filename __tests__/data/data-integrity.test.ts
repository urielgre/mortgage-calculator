import { describe, it, expect } from 'vitest';
import { COUNTY_TAX_DATA } from '@/lib/data/state-tax-data';
import { STATE_TAX_DATA, STATE_META } from '@/lib/data/income-tax-rates';
import { TAX_DATA } from '@/lib/data/constants';

// All 50 states + DC
const ALL_STATE_KEYS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
  'WY',
];

// =============================================================
// COUNTY_TAX_DATA
// =============================================================

describe('COUNTY_TAX_DATA', () => {
  it('has all 51 state keys (50 states + DC)', () => {
    expect(Object.keys(COUNTY_TAX_DATA).sort()).toEqual(ALL_STATE_KEYS.sort());
  });

  it('has exactly 51 entries', () => {
    expect(Object.keys(COUNTY_TAX_DATA)).toHaveLength(51);
  });

  ALL_STATE_KEYS.forEach((stateKey) => {
    describe(`state: ${stateKey}`, () => {
      it('has at least 1 county', () => {
        expect(COUNTY_TAX_DATA[stateKey].length).toBeGreaterThanOrEqual(1);
      });

      it('every county has a name (string) and rate (number > 0)', () => {
        for (const county of COUNTY_TAX_DATA[stateKey]) {
          expect(typeof county.name).toBe('string');
          expect(county.name.length).toBeGreaterThan(0);
          expect(typeof county.rate).toBe('number');
          expect(county.rate).toBeGreaterThan(0);
        }
      });
    });
  });
});

// =============================================================
// STATE_TAX_DATA
// =============================================================

describe('STATE_TAX_DATA', () => {
  it('has all 51 entries (50 states + DC)', () => {
    expect(Object.keys(STATE_TAX_DATA).sort()).toEqual(ALL_STATE_KEYS.sort());
  });

  it('has exactly 51 entries', () => {
    expect(Object.keys(STATE_TAX_DATA)).toHaveLength(51);
  });

  it('every entry has a valid type', () => {
    const validTypes = ['none', 'flat', 'progressive', 'effective'];
    for (const [key, config] of Object.entries(STATE_TAX_DATA)) {
      expect(validTypes).toContain(config.type);
    }
  });

  it('flat-rate states have a rate property', () => {
    for (const [key, config] of Object.entries(STATE_TAX_DATA)) {
      if (config.type === 'flat') {
        expect(typeof config.rate).toBe('number');
        expect(config.rate).toBeGreaterThan(0);
      }
    }
  });

  it('progressive states have brackets property', () => {
    for (const [key, config] of Object.entries(STATE_TAX_DATA)) {
      if (config.type === 'progressive') {
        expect(config.brackets).toBeDefined();
        expect(typeof config.brackets).toBe('object');
      }
    }
  });

  it('effective states have rates array', () => {
    for (const [key, config] of Object.entries(STATE_TAX_DATA)) {
      if (config.type === 'effective') {
        expect(Array.isArray(config.rates)).toBe(true);
        expect(config.rates.length).toBeGreaterThan(0);
      }
    }
  });
});

// =============================================================
// STATE_META
// =============================================================

describe('STATE_META', () => {
  it('has all 51 entries (50 states + DC)', () => {
    expect(Object.keys(STATE_META).sort()).toEqual(ALL_STATE_KEYS.sort());
  });

  it('has exactly 51 entries', () => {
    expect(Object.keys(STATE_META)).toHaveLength(51);
  });

  ALL_STATE_KEYS.forEach((stateKey) => {
    describe(`state: ${stateKey}`, () => {
      it('has a name (non-empty string)', () => {
        expect(typeof STATE_META[stateKey].name).toBe('string');
        expect(STATE_META[stateKey].name.length).toBeGreaterThan(0);
      });

      it('has avgPropertyTax (number > 0)', () => {
        expect(typeof STATE_META[stateKey].avgPropertyTax).toBe('number');
        expect(STATE_META[stateKey].avgPropertyTax).toBeGreaterThan(0);
      });
    });
  });
});

// =============================================================
// TAX_DATA (federal brackets)
// =============================================================

describe('TAX_DATA', () => {
  it('has 2024, 2025, and 2026 entries', () => {
    expect(TAX_DATA[2024]).toBeDefined();
    expect(TAX_DATA[2025]).toBeDefined();
    expect(TAX_DATA[2026]).toBeDefined();
  });

  const filingStatuses = ['single', 'married_jointly', 'head_of_household'] as const;

  [2024, 2025, 2026].forEach((year) => {
    describe(`year: ${year}`, () => {
      filingStatuses.forEach((status) => {
        it(`has federal brackets for ${status}`, () => {
          expect(TAX_DATA[year].federal[status]).toBeDefined();
          expect(Array.isArray(TAX_DATA[year].federal[status])).toBe(true);
          expect(TAX_DATA[year].federal[status].length).toBeGreaterThan(0);
        });

        it(`${status} brackets start at 0 and end at Infinity`, () => {
          const brackets = TAX_DATA[year].federal[status];
          expect(brackets[0].min).toBe(0);
          expect(brackets[brackets.length - 1].max).toBe(Infinity);
        });

        it(`${status} brackets have contiguous min/max`, () => {
          const brackets = TAX_DATA[year].federal[status];
          for (let i = 1; i < brackets.length; i++) {
            expect(brackets[i].min).toBe(brackets[i - 1].max);
          }
        });

        it(`${status} brackets have rate > 0`, () => {
          const brackets = TAX_DATA[year].federal[status];
          for (const bracket of brackets) {
            expect(bracket.rate).toBeGreaterThan(0);
          }
        });
      });

      it('has a standardDeduction object', () => {
        expect(TAX_DATA[year].standardDeduction).toBeDefined();
        expect(TAX_DATA[year].standardDeduction.single).toBeGreaterThan(0);
        expect(TAX_DATA[year].standardDeduction.married_jointly).toBeGreaterThan(0);
        expect(TAX_DATA[year].standardDeduction.head_of_household).toBeGreaterThan(0);
      });

      it('has saltCap > 0', () => {
        expect(TAX_DATA[year].saltCap).toBeGreaterThan(0);
      });
    });
  });

  // SALT cap specific values
  describe('SALT caps match expected values', () => {
    it('2024 SALT cap = 10000', () => {
      expect(TAX_DATA[2024].saltCap).toBe(10000);
    });

    it('2025 SALT cap = 40000', () => {
      expect(TAX_DATA[2025].saltCap).toBe(40000);
    });

    it('2026 SALT cap = 40400', () => {
      expect(TAX_DATA[2026].saltCap).toBe(40400);
    });
  });
});
