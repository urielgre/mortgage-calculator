/**
 * State income tax data for all 50 US states + DC.
 * Source: Tax Foundation 2025, state tax authorities
 *
 * Tax types:
 * - none: No state income tax (9 states)
 * - flat: Single rate applied to taxable income (14 states)
 * - progressive: Bracketed marginal rates with full brackets (top 10 states)
 * - effective: Simplified effective rate table for less-used progressive states
 */

export type FilingStatus = 'single' | 'married_jointly' | 'head_of_household';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface StandardDeductionByStatus {
  single: number;
  married_jointly: number;
  head_of_household: number;
}

export interface Surtax {
  threshold: number;
  rate: number;
}

export interface StateTaxNone {
  type: 'none';
}

export interface StateTaxFlat {
  type: 'flat';
  rate: number;
  stdDed: StandardDeductionByStatus;
  supplementalRate: number;
  note?: string;
  surtax?: Surtax;
}

export interface StateTaxProgressive {
  type: 'progressive';
  supplementalRate: number;
  brackets: Record<number, Record<FilingStatus, TaxBracket[]>>;
  stdDed: Record<number, StandardDeductionByStatus> | StandardDeductionByStatus;
  topRate: number;
  note?: string;
}

export interface StateTaxEffective {
  type: 'effective';
  rates: number[];
  topRate: number;
  supplementalRate: number;
  stdDed: StandardDeductionByStatus;
  note?: string;
}

export type StateTaxConfig = StateTaxNone | StateTaxFlat | StateTaxProgressive | StateTaxEffective;

export const STATE_TAX_DATA: Record<string, StateTaxConfig> = {
  // === NO INCOME TAX (9 states) ===
  AK: { type: 'none' },
  FL: { type: 'none' },
  NV: { type: 'none' },
  NH: { type: 'none' }, // Interest/dividends tax repealed 2025
  SD: { type: 'none' },
  TN: { type: 'none' }, // Hall tax repealed 2021
  TX: { type: 'none' },
  WA: { type: 'none' }, // Has capital gains tax but no income tax
  WY: { type: 'none' },

  // === FLAT RATE STATES (14 states) === // Source: Tax Foundation 2025
  AZ: { type: 'flat', rate: 2.5, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 }, supplementalRate: 0.025 },
  CO: { type: 'flat', rate: 4.4, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 }, supplementalRate: 0.044 },
  GA: { type: 'flat', rate: 5.39, stdDed: { single: 12000, married_jointly: 24000, head_of_household: 18000 }, supplementalRate: 0.0539 },
  ID: { type: 'flat', rate: 5.695, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 }, supplementalRate: 0.05695 },
  IL: { type: 'flat', rate: 4.95, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 }, supplementalRate: 0.0495, note: 'No standard deduction; uses personal exemption $2,775' },
  IN: { type: 'flat', rate: 3.05, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 }, supplementalRate: 0.0305 },
  KS: { type: 'flat', rate: 5.7, stdDed: { single: 3500, married_jointly: 8000, head_of_household: 6000 }, supplementalRate: 0.057 },
  KY: { type: 'flat', rate: 4.0, stdDed: { single: 3160, married_jointly: 6320, head_of_household: 3160 }, supplementalRate: 0.04 },
  MI: { type: 'flat', rate: 4.25, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 }, supplementalRate: 0.0425, note: 'Uses personal exemption $5,600' },
  MS: { type: 'flat', rate: 4.4, stdDed: { single: 2300, married_jointly: 4600, head_of_household: 3400 }, supplementalRate: 0.044 },
  NC: { type: 'flat', rate: 4.5, stdDed: { single: 12750, married_jointly: 25500, head_of_household: 19125 }, supplementalRate: 0.045 },
  ND: { type: 'flat', rate: 1.95, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 }, supplementalRate: 0.0195 },
  PA: { type: 'flat', rate: 3.07, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 }, supplementalRate: 0.0307, note: 'No standard deduction' },
  UT: { type: 'flat', rate: 4.65, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 }, supplementalRate: 0.0465 },

  // === PROGRESSIVE STATES -- FULL BRACKETS (top 10) ===
  // Source: State tax authorities, Tax Foundation 2025
  CA: {
    type: 'progressive',
    supplementalRate: 0.1023,
    brackets: {
      2024: {
        single: [
          { min: 0, max: 10756, rate: 1 }, { min: 10756, max: 25499, rate: 2 },
          { min: 25499, max: 40245, rate: 4 }, { min: 40245, max: 55866, rate: 6 },
          { min: 55866, max: 70606, rate: 8 }, { min: 70606, max: 360659, rate: 9.3 },
          { min: 360659, max: 432787, rate: 10.3 }, { min: 432787, max: 721314, rate: 11.3 },
          { min: 721314, max: 1000000, rate: 12.3 }, { min: 1000000, max: Infinity, rate: 13.3 },
        ],
        married_jointly: [
          { min: 0, max: 21512, rate: 1 }, { min: 21512, max: 50998, rate: 2 },
          { min: 50998, max: 80490, rate: 4 }, { min: 80490, max: 111732, rate: 6 },
          { min: 111732, max: 141212, rate: 8 }, { min: 141212, max: 721318, rate: 9.3 },
          { min: 721318, max: 865574, rate: 10.3 }, { min: 865574, max: 1442628, rate: 11.3 },
          { min: 1442628, max: 2000000, rate: 12.3 }, { min: 2000000, max: Infinity, rate: 13.3 },
        ],
        head_of_household: [
          { min: 0, max: 21527, rate: 1 }, { min: 21527, max: 51000, rate: 2 },
          { min: 51000, max: 65744, rate: 4 }, { min: 65744, max: 81364, rate: 6 },
          { min: 81364, max: 96107, rate: 8 }, { min: 96107, max: 490493, rate: 9.3 },
          { min: 490493, max: 588593, rate: 10.3 }, { min: 588593, max: 980987, rate: 11.3 },
          { min: 980987, max: 1000000, rate: 12.3 }, { min: 1000000, max: Infinity, rate: 13.3 },
        ],
      },
      2025: {
        single: [
          { min: 0, max: 10756, rate: 1 }, { min: 10756, max: 25499, rate: 2 },
          { min: 25499, max: 40245, rate: 4 }, { min: 40245, max: 55866, rate: 6 },
          { min: 55866, max: 70606, rate: 8 }, { min: 70606, max: 360659, rate: 9.3 },
          { min: 360659, max: 432787, rate: 10.3 }, { min: 432787, max: 721314, rate: 11.3 },
          { min: 721314, max: 1000000, rate: 12.3 }, { min: 1000000, max: Infinity, rate: 13.3 },
        ],
        married_jointly: [
          { min: 0, max: 21512, rate: 1 }, { min: 21512, max: 50998, rate: 2 },
          { min: 50998, max: 80490, rate: 4 }, { min: 80490, max: 111732, rate: 6 },
          { min: 111732, max: 141212, rate: 8 }, { min: 141212, max: 721318, rate: 9.3 },
          { min: 721318, max: 865574, rate: 10.3 }, { min: 865574, max: 1442628, rate: 11.3 },
          { min: 1442628, max: 2000000, rate: 12.3 }, { min: 2000000, max: Infinity, rate: 13.3 },
        ],
        head_of_household: [
          { min: 0, max: 21527, rate: 1 }, { min: 21527, max: 51000, rate: 2 },
          { min: 51000, max: 65744, rate: 4 }, { min: 65744, max: 81364, rate: 6 },
          { min: 81364, max: 96107, rate: 8 }, { min: 96107, max: 490493, rate: 9.3 },
          { min: 490493, max: 588593, rate: 10.3 }, { min: 588593, max: 980987, rate: 11.3 },
          { min: 980987, max: 1000000, rate: 12.3 }, { min: 1000000, max: Infinity, rate: 13.3 },
        ],
      },
      2026: {
        single: [
          { min: 0, max: 11079, rate: 1 }, { min: 11079, max: 26264, rate: 2 },
          { min: 26264, max: 41452, rate: 4 }, { min: 41452, max: 57542, rate: 6 },
          { min: 57542, max: 72724, rate: 8 }, { min: 72724, max: 371479, rate: 9.3 },
          { min: 371479, max: 445771, rate: 10.3 }, { min: 445771, max: 742953, rate: 11.3 },
          { min: 742953, max: 1000000, rate: 12.3 }, { min: 1000000, max: Infinity, rate: 13.3 },
        ],
        married_jointly: [
          { min: 0, max: 22158, rate: 1 }, { min: 22158, max: 52528, rate: 2 },
          { min: 52528, max: 82905, rate: 4 }, { min: 82905, max: 115084, rate: 6 },
          { min: 115084, max: 145448, rate: 8 }, { min: 145448, max: 742958, rate: 9.3 },
          { min: 742958, max: 891541, rate: 10.3 }, { min: 891541, max: 1485907, rate: 11.3 },
          { min: 1485907, max: 2000000, rate: 12.3 }, { min: 2000000, max: Infinity, rate: 13.3 },
        ],
        head_of_household: [
          { min: 0, max: 22173, rate: 1 }, { min: 22173, max: 52530, rate: 2 },
          { min: 52530, max: 67716, rate: 4 }, { min: 67716, max: 83805, rate: 6 },
          { min: 83805, max: 98990, rate: 8 }, { min: 98990, max: 505208, rate: 9.3 },
          { min: 505208, max: 606251, rate: 10.3 }, { min: 606251, max: 1000000, rate: 11.3 },
          { min: 1000000, max: 1010417, rate: 12.3 }, { min: 1010417, max: Infinity, rate: 13.3 },
        ],
      },
    },
    stdDed: {
      2024: { single: 5540, married_jointly: 11080, head_of_household: 11080 },
      2025: { single: 5540, married_jointly: 11080, head_of_household: 11080 },
      2026: { single: 5706, married_jointly: 11412, head_of_household: 11412 },
    },
    topRate: 13.3,
  },
  NY: {
    type: 'progressive', supplementalRate: 0.1197,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 8500, rate: 4 }, { min: 8500, max: 11700, rate: 4.5 },
          { min: 11700, max: 13900, rate: 5.25 }, { min: 13900, max: 80650, rate: 5.5 },
          { min: 80650, max: 215400, rate: 6 }, { min: 215400, max: 1077550, rate: 6.85 },
          { min: 1077550, max: 5000000, rate: 9.65 }, { min: 5000000, max: 25000000, rate: 10.3 },
          { min: 25000000, max: Infinity, rate: 10.9 },
        ],
        married_jointly: [
          { min: 0, max: 17150, rate: 4 }, { min: 17150, max: 23600, rate: 4.5 },
          { min: 23600, max: 27900, rate: 5.25 }, { min: 27900, max: 161550, rate: 5.5 },
          { min: 161550, max: 323200, rate: 6 }, { min: 323200, max: 2155350, rate: 6.85 },
          { min: 2155350, max: 5000000, rate: 9.65 }, { min: 5000000, max: 25000000, rate: 10.3 },
          { min: 25000000, max: Infinity, rate: 10.9 },
        ],
        head_of_household: [
          { min: 0, max: 12800, rate: 4 }, { min: 12800, max: 17650, rate: 4.5 },
          { min: 17650, max: 20900, rate: 5.25 }, { min: 20900, max: 107650, rate: 5.5 },
          { min: 107650, max: 269300, rate: 6 }, { min: 269300, max: 1616450, rate: 6.85 },
          { min: 1616450, max: 5000000, rate: 9.65 }, { min: 5000000, max: 25000000, rate: 10.3 },
          { min: 25000000, max: Infinity, rate: 10.9 },
        ],
      },
    },
    stdDed: { 2025: { single: 8000, married_jointly: 16050, head_of_household: 11200 } },
    topRate: 10.9,
  },
  NJ: {
    type: 'progressive', supplementalRate: 0.1075,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 20000, rate: 1.4 }, { min: 20000, max: 35000, rate: 1.75 },
          { min: 35000, max: 40000, rate: 3.5 }, { min: 40000, max: 75000, rate: 5.525 },
          { min: 75000, max: 500000, rate: 6.37 }, { min: 500000, max: 1000000, rate: 8.97 },
          { min: 1000000, max: Infinity, rate: 10.75 },
        ],
        married_jointly: [
          { min: 0, max: 20000, rate: 1.4 }, { min: 20000, max: 50000, rate: 1.75 },
          { min: 50000, max: 70000, rate: 2.45 }, { min: 70000, max: 80000, rate: 3.5 },
          { min: 80000, max: 150000, rate: 5.525 }, { min: 150000, max: 500000, rate: 6.37 },
          { min: 500000, max: 1000000, rate: 8.97 }, { min: 1000000, max: Infinity, rate: 10.75 },
        ],
        head_of_household: [
          { min: 0, max: 20000, rate: 1.4 }, { min: 20000, max: 50000, rate: 1.75 },
          { min: 50000, max: 70000, rate: 2.45 }, { min: 70000, max: 80000, rate: 3.5 },
          { min: 80000, max: 150000, rate: 5.525 }, { min: 150000, max: 500000, rate: 6.37 },
          { min: 500000, max: 1000000, rate: 8.97 }, { min: 1000000, max: Infinity, rate: 10.75 },
        ],
      },
    },
    stdDed: { 2025: { single: 0, married_jointly: 0, head_of_household: 0 } },
    topRate: 10.75, note: 'No standard deduction; uses personal exemption $1,000',
  },
  CT: {
    type: 'progressive', supplementalRate: 0.0699,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 10000, rate: 2 }, { min: 10000, max: 50000, rate: 4.5 },
          { min: 50000, max: 100000, rate: 5.5 }, { min: 100000, max: 200000, rate: 6 },
          { min: 200000, max: 250000, rate: 6.5 }, { min: 250000, max: 500000, rate: 6.9 },
          { min: 500000, max: Infinity, rate: 6.99 },
        ],
        married_jointly: [
          { min: 0, max: 20000, rate: 2 }, { min: 20000, max: 100000, rate: 4.5 },
          { min: 100000, max: 200000, rate: 5.5 }, { min: 200000, max: 400000, rate: 6 },
          { min: 400000, max: 500000, rate: 6.5 }, { min: 500000, max: 1000000, rate: 6.9 },
          { min: 1000000, max: Infinity, rate: 6.99 },
        ],
        head_of_household: [
          { min: 0, max: 16000, rate: 2 }, { min: 16000, max: 80000, rate: 4.5 },
          { min: 80000, max: 160000, rate: 5.5 }, { min: 160000, max: 320000, rate: 6 },
          { min: 320000, max: 400000, rate: 6.5 }, { min: 400000, max: 800000, rate: 6.9 },
          { min: 800000, max: Infinity, rate: 6.99 },
        ],
      },
    },
    stdDed: { 2025: { single: 0, married_jointly: 0, head_of_household: 0 } },
    topRate: 6.99, note: 'No standard deduction; uses personal exemption credit',
  },
  MA: {
    type: 'flat', rate: 5.0, supplementalRate: 0.05,
    stdDed: { single: 0, married_jointly: 0, head_of_household: 0 },
    note: 'Flat rate + 4% surtax on income over $1M (effective 9% above $1M)',
    surtax: { threshold: 1000000, rate: 4.0 },
  },
  OR: {
    type: 'progressive', supplementalRate: 0.08,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 4050, rate: 4.75 }, { min: 4050, max: 10200, rate: 6.75 },
          { min: 10200, max: 125000, rate: 8.75 }, { min: 125000, max: Infinity, rate: 9.9 },
        ],
        married_jointly: [
          { min: 0, max: 8100, rate: 4.75 }, { min: 8100, max: 20400, rate: 6.75 },
          { min: 20400, max: 250000, rate: 8.75 }, { min: 250000, max: Infinity, rate: 9.9 },
        ],
        head_of_household: [
          { min: 0, max: 4050, rate: 4.75 }, { min: 4050, max: 10200, rate: 6.75 },
          { min: 10200, max: 125000, rate: 8.75 }, { min: 125000, max: Infinity, rate: 9.9 },
        ],
      },
    },
    stdDed: { 2025: { single: 2745, married_jointly: 5495, head_of_household: 4420 } },
    topRate: 9.9,
  },
  MN: {
    type: 'progressive', supplementalRate: 0.0985,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 31690, rate: 5.35 }, { min: 31690, max: 104090, rate: 6.8 },
          { min: 104090, max: 193240, rate: 7.85 }, { min: 193240, max: Infinity, rate: 9.85 },
        ],
        married_jointly: [
          { min: 0, max: 46330, rate: 5.35 }, { min: 46330, max: 184040, rate: 6.8 },
          { min: 184040, max: 321450, rate: 7.85 }, { min: 321450, max: Infinity, rate: 9.85 },
        ],
        head_of_household: [
          { min: 0, max: 39810, rate: 5.35 }, { min: 39810, max: 159450, rate: 6.8 },
          { min: 159450, max: 257310, rate: 7.85 }, { min: 257310, max: Infinity, rate: 9.85 },
        ],
      },
    },
    stdDed: { 2025: { single: 14575, married_jointly: 29150, head_of_household: 21850 } },
    topRate: 9.85,
  },
  HI: {
    type: 'progressive', supplementalRate: 0.11,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 2400, rate: 1.4 }, { min: 2400, max: 4800, rate: 3.2 },
          { min: 4800, max: 9600, rate: 5.5 }, { min: 9600, max: 14400, rate: 6.4 },
          { min: 14400, max: 19200, rate: 6.8 }, { min: 19200, max: 24000, rate: 7.2 },
          { min: 24000, max: 36000, rate: 7.6 }, { min: 36000, max: 48000, rate: 7.9 },
          { min: 48000, max: 150000, rate: 8.25 }, { min: 150000, max: 175000, rate: 9 },
          { min: 175000, max: 200000, rate: 10 }, { min: 200000, max: Infinity, rate: 11 },
        ],
        married_jointly: [
          { min: 0, max: 4800, rate: 1.4 }, { min: 4800, max: 9600, rate: 3.2 },
          { min: 9600, max: 19200, rate: 5.5 }, { min: 19200, max: 28800, rate: 6.4 },
          { min: 28800, max: 38400, rate: 6.8 }, { min: 38400, max: 48000, rate: 7.2 },
          { min: 48000, max: 72000, rate: 7.6 }, { min: 72000, max: 96000, rate: 7.9 },
          { min: 96000, max: 300000, rate: 8.25 }, { min: 300000, max: 350000, rate: 9 },
          { min: 350000, max: 400000, rate: 10 }, { min: 400000, max: Infinity, rate: 11 },
        ],
        head_of_household: [
          { min: 0, max: 3600, rate: 1.4 }, { min: 3600, max: 7200, rate: 3.2 },
          { min: 7200, max: 14400, rate: 5.5 }, { min: 14400, max: 21600, rate: 6.4 },
          { min: 21600, max: 28800, rate: 6.8 }, { min: 28800, max: 36000, rate: 7.2 },
          { min: 36000, max: 54000, rate: 7.6 }, { min: 54000, max: 72000, rate: 7.9 },
          { min: 72000, max: 225000, rate: 8.25 }, { min: 225000, max: 262500, rate: 9 },
          { min: 262500, max: 300000, rate: 10 }, { min: 300000, max: Infinity, rate: 11 },
        ],
      },
    },
    stdDed: { 2025: { single: 2200, married_jointly: 4400, head_of_household: 3212 } },
    topRate: 11,
  },
  WI: {
    type: 'progressive', supplementalRate: 0.0765,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 14320, rate: 3.5 }, { min: 14320, max: 28640, rate: 4.4 },
          { min: 28640, max: 315310, rate: 5.3 }, { min: 315310, max: Infinity, rate: 7.65 },
        ],
        married_jointly: [
          { min: 0, max: 19090, rate: 3.5 }, { min: 19090, max: 38190, rate: 4.4 },
          { min: 38190, max: 420420, rate: 5.3 }, { min: 420420, max: Infinity, rate: 7.65 },
        ],
        head_of_household: [
          { min: 0, max: 14320, rate: 3.5 }, { min: 14320, max: 28640, rate: 4.4 },
          { min: 28640, max: 315310, rate: 5.3 }, { min: 315310, max: Infinity, rate: 7.65 },
        ],
      },
    },
    stdDed: { 2025: { single: 13230, married_jointly: 24450, head_of_household: 16190 } },
    topRate: 7.65,
  },
  VT: {
    type: 'progressive', supplementalRate: 0.0875,
    brackets: {
      2025: {
        single: [
          { min: 0, max: 45400, rate: 3.35 }, { min: 45400, max: 110050, rate: 6.6 },
          { min: 110050, max: 229950, rate: 7.6 }, { min: 229950, max: Infinity, rate: 8.75 },
        ],
        married_jointly: [
          { min: 0, max: 75850, rate: 3.35 }, { min: 75850, max: 183700, rate: 6.6 },
          { min: 183700, max: 279650, rate: 7.6 }, { min: 279650, max: Infinity, rate: 8.75 },
        ],
        head_of_household: [
          { min: 0, max: 60850, rate: 3.35 }, { min: 60850, max: 156850, rate: 6.6 },
          { min: 156850, max: 254700, rate: 7.6 }, { min: 254700, max: Infinity, rate: 8.75 },
        ],
      },
    },
    stdDed: { 2025: { single: 7000, married_jointly: 14000, head_of_household: 10500 } },
    topRate: 8.75,
  },
  IA: { type: 'flat', rate: 3.8, stdDed: { single: 2210, married_jointly: 5450, head_of_household: 5450 }, supplementalRate: 0.038 },

  // === PROGRESSIVE STATES -- SIMPLIFIED (effective rate tables) ===
  // Format: rates = [rate at $50k, $100k, $200k, $400k, $1M]
  // Rates are approximate effective rates for married_jointly filing
  AL: { type: 'effective', rates: [3.5, 4.2, 4.6, 4.8, 4.9], topRate: 5.0, supplementalRate: 0.05, stdDed: { single: 2500, married_jointly: 7500, head_of_household: 4700 } },
  AR: { type: 'effective', rates: [3.2, 3.8, 4.1, 4.3, 4.4], topRate: 4.4, supplementalRate: 0.044, stdDed: { single: 2340, married_jointly: 4680, head_of_household: 2340 } },
  DC: { type: 'effective', rates: [4.5, 6.0, 7.5, 8.5, 9.5], topRate: 10.75, supplementalRate: 0.1075, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 } },
  DE: { type: 'effective', rates: [3.8, 5.0, 5.8, 6.2, 6.5], topRate: 6.6, supplementalRate: 0.066, stdDed: { single: 3250, married_jointly: 6500, head_of_household: 3250 } },
  LA: { type: 'effective', rates: [1.5, 2.5, 3.3, 3.8, 4.1], topRate: 4.25, supplementalRate: 0.0425, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 } },
  MD: { type: 'effective', rates: [3.5, 4.2, 4.8, 5.3, 5.6], topRate: 5.75, supplementalRate: 0.0575, stdDed: { single: 2550, married_jointly: 5100, head_of_household: 3825 } },
  ME: { type: 'effective', rates: [4.5, 5.5, 6.5, 7.0, 7.1], topRate: 7.15, supplementalRate: 0.0715, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 } },
  MO: { type: 'effective', rates: [3.0, 4.0, 4.6, 4.8, 4.9], topRate: 4.95, supplementalRate: 0.0495, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 } },
  MT: { type: 'effective', rates: [3.5, 4.8, 5.5, 5.8, 5.9], topRate: 5.9, supplementalRate: 0.059, stdDed: { single: 5540, married_jointly: 11080, head_of_household: 8310 } },
  NE: { type: 'effective', rates: [3.5, 4.5, 5.3, 5.7, 5.8], topRate: 5.84, supplementalRate: 0.0584, stdDed: { single: 7900, married_jointly: 15800, head_of_household: 11250 } },
  NM: { type: 'effective', rates: [2.5, 3.5, 4.5, 5.2, 5.7], topRate: 5.9, supplementalRate: 0.059, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 } },
  OH: { type: 'effective', rates: [0, 1.5, 2.8, 3.3, 3.5], topRate: 3.5, supplementalRate: 0.035, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 }, note: 'No tax on first $26,050' },
  OK: { type: 'effective', rates: [2.5, 3.5, 4.2, 4.5, 4.7], topRate: 4.75, supplementalRate: 0.0475, stdDed: { single: 6350, married_jointly: 12700, head_of_household: 9350 } },
  RI: { type: 'effective', rates: [3.0, 3.8, 4.5, 5.0, 5.6], topRate: 5.99, supplementalRate: 0.0599, stdDed: { single: 10550, married_jointly: 21100, head_of_household: 15825 } },
  SC: { type: 'effective', rates: [2.5, 4.0, 5.5, 6.0, 6.3], topRate: 6.4, supplementalRate: 0.064, stdDed: { single: 14600, married_jointly: 29200, head_of_household: 21900 } },
  VA: { type: 'effective', rates: [3.5, 4.8, 5.3, 5.5, 5.7], topRate: 5.75, supplementalRate: 0.0575, stdDed: { single: 4500, married_jointly: 9000, head_of_household: 4500 } },
  WV: { type: 'effective', rates: [3.0, 4.0, 4.8, 5.2, 5.5], topRate: 5.12, supplementalRate: 0.0512, stdDed: { single: 0, married_jointly: 0, head_of_household: 0 } },
};

/**
 * State metadata: non-tax properties per state.
 * Source: Tax Foundation, Census Bureau, state assessor offices
 */
export type HomesteadType = 'none' | 'assessed_value' | 'market_value' | 'credit' | 'equity';

export interface StateMeta {
  name: string;
  avgPropertyTax: number;
  homesteadExemption: number;
  homesteadType: HomesteadType;
  sdiRate: number;
  sdiCap?: number | null;
  note?: string;
}

export const STATE_META: Record<string, StateMeta> = {
  AL: { name: 'Alabama', avgPropertyTax: 0.40, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  AK: { name: 'Alaska', avgPropertyTax: 1.04, homesteadExemption: 150000, homesteadType: 'assessed_value', sdiRate: 0 },
  AZ: { name: 'Arizona', avgPropertyTax: 0.62, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  AR: { name: 'Arkansas', avgPropertyTax: 0.63, homesteadExemption: 350, homesteadType: 'credit', sdiRate: 0 },
  CA: { name: 'California', avgPropertyTax: 1.10, homesteadExemption: 7000, homesteadType: 'assessed_value', sdiRate: 0.012, sdiCap: null },
  CO: { name: 'Colorado', avgPropertyTax: 0.51, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.009, sdiCap: null, note: 'FAMLI program' },
  CT: { name: 'Connecticut', avgPropertyTax: 2.15, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.005, sdiCap: null },
  DE: { name: 'Delaware', avgPropertyTax: 0.57, homesteadExemption: 50000, homesteadType: 'assessed_value', sdiRate: 0 },
  DC: { name: 'District of Columbia', avgPropertyTax: 0.56, homesteadExemption: 82150, homesteadType: 'assessed_value', sdiRate: 0 },
  FL: { name: 'Florida', avgPropertyTax: 0.80, homesteadExemption: 50000, homesteadType: 'assessed_value', sdiRate: 0 },
  GA: { name: 'Georgia', avgPropertyTax: 0.87, homesteadExemption: 2000, homesteadType: 'assessed_value', sdiRate: 0 },
  HI: { name: 'Hawaii', avgPropertyTax: 0.27, homesteadExemption: 100000, homesteadType: 'assessed_value', sdiRate: 0.005, sdiCap: 71998 },
  ID: { name: 'Idaho', avgPropertyTax: 0.63, homesteadExemption: 125000, homesteadType: 'market_value', sdiRate: 0 },
  IL: { name: 'Illinois', avgPropertyTax: 2.07, homesteadExemption: 10000, homesteadType: 'assessed_value', sdiRate: 0 },
  IN: { name: 'Indiana', avgPropertyTax: 0.81, homesteadExemption: 48000, homesteadType: 'assessed_value', sdiRate: 0 },
  IA: { name: 'Iowa', avgPropertyTax: 1.52, homesteadExemption: 4850, homesteadType: 'credit', sdiRate: 0 },
  KS: { name: 'Kansas', avgPropertyTax: 1.33, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  KY: { name: 'Kentucky', avgPropertyTax: 0.83, homesteadExemption: 46350, homesteadType: 'assessed_value', sdiRate: 0 },
  LA: { name: 'Louisiana', avgPropertyTax: 0.55, homesteadExemption: 75000, homesteadType: 'market_value', sdiRate: 0 },
  ME: { name: 'Maine', avgPropertyTax: 1.24, homesteadExemption: 25000, homesteadType: 'assessed_value', sdiRate: 0 },
  MD: { name: 'Maryland', avgPropertyTax: 1.05, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  MA: { name: 'Massachusetts', avgPropertyTax: 1.15, homesteadExemption: 125000, homesteadType: 'assessed_value', sdiRate: 0.0088, sdiCap: null, note: 'PFML program' },
  MI: { name: 'Michigan', avgPropertyTax: 1.38, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  MN: { name: 'Minnesota', avgPropertyTax: 1.05, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  MS: { name: 'Mississippi', avgPropertyTax: 0.65, homesteadExemption: 7500, homesteadType: 'assessed_value', sdiRate: 0 },
  MO: { name: 'Missouri', avgPropertyTax: 0.91, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  MT: { name: 'Montana', avgPropertyTax: 0.74, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  NE: { name: 'Nebraska', avgPropertyTax: 1.65, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  NV: { name: 'Nevada', avgPropertyTax: 0.53, homesteadExemption: 605000, homesteadType: 'equity', sdiRate: 0 },
  NH: { name: 'New Hampshire', avgPropertyTax: 1.86, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  NJ: { name: 'New Jersey', avgPropertyTax: 2.23, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.006, sdiCap: 43300 },
  NM: { name: 'New Mexico', avgPropertyTax: 0.67, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  NY: { name: 'New York', avgPropertyTax: 1.62, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.005, sdiCap: 31200 },
  NC: { name: 'North Carolina', avgPropertyTax: 0.77, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  ND: { name: 'North Dakota', avgPropertyTax: 0.98, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  OH: { name: 'Ohio', avgPropertyTax: 1.53, homesteadExemption: 26200, homesteadType: 'assessed_value', sdiRate: 0 },
  OK: { name: 'Oklahoma', avgPropertyTax: 0.87, homesteadExemption: 1000, homesteadType: 'assessed_value', sdiRate: 0 },
  OR: { name: 'Oregon', avgPropertyTax: 0.87, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.006, sdiCap: null, note: 'Paid Leave Oregon' },
  PA: { name: 'Pennsylvania', avgPropertyTax: 1.53, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  RI: { name: 'Rhode Island', avgPropertyTax: 1.40, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.011, sdiCap: 87000 },
  SC: { name: 'South Carolina', avgPropertyTax: 0.57, homesteadExemption: 50000, homesteadType: 'assessed_value', sdiRate: 0 },
  SD: { name: 'South Dakota', avgPropertyTax: 1.22, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  TN: { name: 'Tennessee', avgPropertyTax: 0.56, homesteadExemption: 5000, homesteadType: 'assessed_value', sdiRate: 0 },
  TX: { name: 'Texas', avgPropertyTax: 1.60, homesteadExemption: 100000, homesteadType: 'assessed_value', sdiRate: 0 },
  UT: { name: 'Utah', avgPropertyTax: 0.58, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  VT: { name: 'Vermont', avgPropertyTax: 1.83, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  VA: { name: 'Virginia', avgPropertyTax: 0.80, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  WA: { name: 'Washington', avgPropertyTax: 0.87, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0.0058, sdiCap: null, note: 'WA Cares + PFML' },
  WV: { name: 'West Virginia', avgPropertyTax: 0.57, homesteadExemption: 20000, homesteadType: 'assessed_value', sdiRate: 0 },
  WI: { name: 'Wisconsin', avgPropertyTax: 1.61, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
  WY: { name: 'Wyoming', avgPropertyTax: 0.55, homesteadExemption: 0, homesteadType: 'none', sdiRate: 0 },
};
