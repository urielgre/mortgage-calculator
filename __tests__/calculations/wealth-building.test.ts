import { describe, it, expect } from 'vitest';
import {
  calculateWealthBuilding,
  type WealthBuildingInput,
} from '@/lib/calculations/wealth-building';
import { calculateMonthlyPayment } from '@/lib/calculations/mortgage';

// --- Compute monthlyPI from mortgage.ts ---
const monthlyPI = calculateMonthlyPayment(640000, 6.5, 30);

// --- Shared fixed-rate base input ---
const fixedInput: WealthBuildingInput = {
  purchasePrice: 800000,
  downPayment: 160000,
  effectiveLoanAmount: 640000,
  effectiveLumpSum: 0,
  interestRate: 6.5,
  loanTerm: 30,
  appreciation: 3,
  extraMonthly: 0,
  monthlyPI,
  loanType: 'fixed',
  armAdjustment: 0.25,
  armCap: 11,
  deductibleLoan: 640000,
  deductibleSALT: 38800,
  standardDeduction: 31500,
  itemizedWithoutHome: 30000,
  wouldItemizeWithoutHome: false,
  federalRate: 0.24,
  stateRate: 0.093,
  homesteadSavings: 77,
};

describe('calculateWealthBuilding', () => {
  describe('default fixed-rate scenario', () => {
    const result = calculateWealthBuilding(fixedInput);

    it('schedule has 10 entries', () => {
      expect(result.schedule).toHaveLength(10);
    });

    it('year 1 homeValue = 800000 * 1.03 = 824000', () => {
      expect(result.schedule[0].homeValue).toBeCloseTo(824000, 0);
    });

    it('year 10 homeValue = 800000 * 1.03^10 ~= 1075133', () => {
      expect(result.schedule[9].homeValue).toBeCloseTo(1075133, 0);
    });

    it('year 1 has positive yearInterest (~41389)', () => {
      expect(result.schedule[0].yearInterest).toBeGreaterThan(0);
      expect(result.schedule[0].yearInterest).toBeCloseTo(41389, 0);
    });

    it('year 1 totalEquity ~= 191153', () => {
      expect(result.schedule[0].totalEquity).toBeCloseTo(191153, 0);
    });

    it('totalEquity increases each year', () => {
      for (let i = 1; i < result.schedule.length; i++) {
        expect(result.schedule[i].totalEquity).toBeGreaterThan(
          result.schedule[i - 1].totalEquity,
        );
      }
    });

    it('cumulativeTaxSavings increases each year', () => {
      for (let i = 1; i < result.schedule.length; i++) {
        expect(result.schedule[i].cumulativeTaxSavings).toBeGreaterThan(
          result.schedule[i - 1].cumulativeTaxSavings,
        );
      }
    });

    it('homeValue10 matches schedule[9].homeValue', () => {
      expect(result.homeValue10).toBe(result.schedule[9].homeValue);
    });

    it('equity10 matches schedule[9].totalEquity', () => {
      expect(result.equity10).toBe(result.schedule[9].totalEquity);
    });

    it('wealthImpact10 matches schedule[9].totalWealthImpact', () => {
      expect(result.wealthImpact10).toBe(result.schedule[9].totalWealthImpact);
    });

    it('year 10 totalEquity ~= 532566', () => {
      expect(result.schedule[9].totalEquity).toBeCloseTo(532566, 0);
    });

    it('year 10 totalWealthImpact ~= 680058', () => {
      expect(result.schedule[9].totalWealthImpact).toBeCloseTo(680058, 0);
    });

    it('all years use rate = 6.5 (fixed loan)', () => {
      for (const entry of result.schedule) {
        expect(entry.rate).toBe(6.5);
      }
    });

    it('year 1 cumulativeTaxSavings ~= 15612', () => {
      expect(result.schedule[0].cumulativeTaxSavings).toBeCloseTo(15612, 0);
    });
  });

  describe('ARM scenario (5/1 ARM)', () => {
    const armInput: WealthBuildingInput = {
      ...fixedInput,
      loanType: '5',
      armAdjustment: 0.25,
      armCap: 11,
    };
    const result = calculateWealthBuilding(armInput);

    it('schedule has 10 entries', () => {
      expect(result.schedule).toHaveLength(10);
    });

    it('years 1-5 rate stays at 6.5', () => {
      for (let i = 0; i < 5; i++) {
        expect(result.schedule[i].rate).toBe(6.5);
      }
    });

    it('year 6 rate increases to 6.75', () => {
      expect(result.schedule[5].rate).toBe(6.75);
    });

    it('year 7 rate increases to 7.0', () => {
      expect(result.schedule[6].rate).toBe(7.0);
    });

    it('year 8 rate increases to 7.25', () => {
      expect(result.schedule[7].rate).toBe(7.25);
    });

    it('year 9 rate increases to 7.5', () => {
      expect(result.schedule[8].rate).toBe(7.5);
    });

    it('year 10 rate increases to 7.75', () => {
      expect(result.schedule[9].rate).toBe(7.75);
    });

    it('rate never exceeds armCap of 11', () => {
      for (const entry of result.schedule) {
        expect(entry.rate).toBeLessThanOrEqual(11);
      }
    });

    it('monthly payment changes after year 5', () => {
      expect(result.schedule[5].monthlyPayment).not.toBeCloseTo(
        result.schedule[4].monthlyPayment,
        0,
      );
    });

    it('years 1-5 have the same monthly payment', () => {
      const year1Payment = result.schedule[0].monthlyPayment;
      for (let i = 1; i < 5; i++) {
        expect(result.schedule[i].monthlyPayment).toBeCloseTo(
          year1Payment,
          2,
        );
      }
    });

    it('year 6 monthlyPayment ~= 4139', () => {
      expect(result.schedule[5].monthlyPayment).toBeCloseTo(4139, 0);
    });

    it('year 10 monthlyPayment ~= 4499', () => {
      expect(result.schedule[9].monthlyPayment).toBeCloseTo(4499, 0);
    });

    it('monthly payment increases each year after fixed period', () => {
      for (let i = 6; i < result.schedule.length; i++) {
        expect(result.schedule[i].monthlyPayment).toBeGreaterThan(
          result.schedule[i - 1].monthlyPayment,
        );
      }
    });
  });
});
