import { describe, it, expect } from 'vitest';
import {
  calculateTaxBenefits,
  type TaxBenefitsInput,
} from '@/lib/calculations/tax-benefits';

// --- Shared CA base input ---
const caInput: TaxBenefitsInput = {
  totalInterestYear1: 41389.38,
  effectiveLoanAmount: 640000,
  purchasePrice: 800000,
  propertyTaxRate: 1.1,
  stateIncomeTax: 30000,
  annualIncome: 480000,
  federalTaxRate: 24,
  stateTaxRate: 9.3,
  standardDeduction: 31500,
  saltCap: 40000,
  stateCode: 'CA',
  taxYear: '2025',
  homesteadSavings: 77,
};

describe('calculateTaxBenefits', () => {
  describe('default CA scenario ($640k loan, $480k income)', () => {
    const result = calculateTaxBenefits(caInput);

    it('deductibleInterest equals totalInterestYear1 (loan < $750k)', () => {
      expect(result.deductibleInterest).toBeCloseTo(41389.38, 0);
    });

    it('annualPropertyTax = 800000 * 1.1 / 100 = 8800', () => {
      expect(result.annualPropertyTax).toBeCloseTo(8800, 0);
    });

    it('totalSALT = stateIncomeTax + propertyTax = 38800', () => {
      expect(result.totalSALT).toBeCloseTo(38800, 0);
    });

    it('deductibleSALT = 38800 (under $40k cap)', () => {
      expect(result.deductibleSALT).toBeCloseTo(38800, 0);
    });

    it('deductiblePropertyTax = 8800', () => {
      expect(result.deductiblePropertyTax).toBeCloseTo(8800, 0);
    });

    it('deductibleStateIncome = 30000', () => {
      expect(result.deductibleStateIncome).toBeCloseTo(30000, 0);
    });

    it('itemizedWithHome = deductibleInterest + deductibleSALT = 80189', () => {
      expect(result.itemizedWithHome).toBeCloseTo(80189, 0);
    });

    it('itemizedWithoutHome = min(stateIncomeTax, saltCap) = 30000', () => {
      expect(result.itemizedWithoutHome).toBeCloseTo(30000, 0);
    });

    it('shouldItemize is true (80189 > 31500)', () => {
      expect(result.shouldItemize).toBe(true);
    });

    it('wouldItemizeWithoutHome is false (30000 < 31500)', () => {
      expect(result.wouldItemizeWithoutHome).toBe(false);
    });

    it('federalTaxSavings is positive (~11685)', () => {
      expect(result.federalTaxSavings).toBeCloseTo(11685, 0);
    });

    it('stateTaxSavings is positive (~3849)', () => {
      expect(result.stateTaxSavings).toBeCloseTo(3849, 0);
    });

    it('annualTaxSavings = federal + state (~15535)', () => {
      expect(result.annualTaxSavings).toBeCloseTo(15535, 0);
    });

    it('totalAnnualTaxBenefit = annualTaxSavings + homestead (~15612)', () => {
      expect(result.totalAnnualTaxBenefit).toBeCloseTo(15612, 0);
    });

    it('monthlyTaxSavings = totalAnnualTaxBenefit / 12 (~1301)', () => {
      expect(result.monthlyTaxSavings).toBeCloseTo(1301, 0);
    });

    it('federalRate = 0.24', () => {
      expect(result.federalRate).toBe(0.24);
    });

    it('stateRate = 0.093', () => {
      expect(result.stateRate).toBeCloseTo(0.093, 10);
    });

    it('homesteadSavings passes through = 77', () => {
      expect(result.homesteadSavings).toBe(77);
    });

    it('saltCap passes through = 40000', () => {
      expect(result.saltCap).toBe(40000);
    });
  });

  describe('no income tax state (TX)', () => {
    const txInput: TaxBenefitsInput = {
      ...caInput,
      stateIncomeTax: 0,
      stateTaxRate: 0,
      stateCode: 'TX',
      homesteadSavings: 0,
    };
    const result = calculateTaxBenefits(txInput);

    it('totalSALT is just property tax = 8800', () => {
      expect(result.totalSALT).toBeCloseTo(8800, 0);
    });

    it('deductibleSALT = 8800 (well under $40k cap)', () => {
      expect(result.deductibleSALT).toBeCloseTo(8800, 0);
    });

    it('shouldItemize is true (interest + SALT > standard deduction)', () => {
      expect(result.shouldItemize).toBe(true);
    });

    it('itemizedWithHome = interest + SALT ~= 50189', () => {
      expect(result.itemizedWithHome).toBeCloseTo(50189, 0);
    });

    it('itemizedWithoutHome = 0 (no state income tax)', () => {
      expect(result.itemizedWithoutHome).toBe(0);
    });

    it('wouldItemizeWithoutHome is false', () => {
      expect(result.wouldItemizeWithoutHome).toBe(false);
    });

    it('federalTaxSavings is positive (~4485)', () => {
      expect(result.federalTaxSavings).toBeCloseTo(4485, 0);
    });

    it('stateTaxSavings = 0 (no state income tax)', () => {
      expect(result.stateTaxSavings).toBe(0);
    });

    it('stateRate = 0', () => {
      expect(result.stateRate).toBe(0);
    });
  });

  describe('over $750k loan (interest deduction cap)', () => {
    const overCapInput: TaxBenefitsInput = {
      ...caInput,
      totalInterestYear1: 58206.47,
      effectiveLoanAmount: 900000,
      purchasePrice: 1125000,
    };
    const result = calculateTaxBenefits(overCapInput);

    it('deductibleInterest is reduced by 750k/900k ratio (~48505)', () => {
      const expectedInterest = 58206.47 * (750000 / 900000);
      expect(result.deductibleInterest).toBeCloseTo(expectedInterest, 0);
    });

    it('deductibleInterest < totalInterestYear1', () => {
      expect(result.deductibleInterest).toBeLessThan(
        result.totalInterestYear1,
      );
    });

    it('shouldItemize is true', () => {
      expect(result.shouldItemize).toBe(true);
    });

    it('federalTaxSavings is positive (~13681)', () => {
      expect(result.federalTaxSavings).toBeCloseTo(13681, 0);
    });

    it('annualPropertyTax = 1125000 * 1.1 / 100 = 12375', () => {
      expect(result.annualPropertyTax).toBeCloseTo(12375, 0);
    });
  });
});
