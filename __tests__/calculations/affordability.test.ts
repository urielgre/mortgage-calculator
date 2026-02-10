import { describe, it, expect } from 'vitest';
import {
  calculateAffordability,
  type AffordabilityInput,
} from '@/lib/calculations/affordability';

// --- Shared base input ---
const baseInput: AffordabilityInput = {
  annualIncome: 480000,
  interestRate: 6.5,
  loanTerm: 30,
  propertyTaxRate: 1.1,
  insurance: 2400,
  hoa: 0,
  pmiRate: 0.5,
  maintenance: 1,
  utilities: 300,
  downPaymentPercent: 20,
  downPaymentMode: 'percent',
};

describe('calculateAffordability', () => {
  describe('default scenario ($480k income, 20% down, 6.5% rate)', () => {
    const result = calculateAffordability(baseInput);

    it('targetPITI = grossMonthly * 0.28 = 11200', () => {
      expect(result.targetPITI).toBeCloseTo(11200, 0);
    });

    it('grossMonthlyIncome = 480000 / 12 = 40000', () => {
      expect(result.grossMonthlyIncome).toBeCloseTo(40000, 0);
    });

    it('maxPurchasePrice = 1572000', () => {
      expect(result.maxPurchasePrice).toBe(1572000);
    });

    it('maxPurchasePrice is above $1M for a $480k income', () => {
      expect(result.maxPurchasePrice).toBeGreaterThan(1000000);
    });

    it('usedFallbackIncome is false', () => {
      expect(result.usedFallbackIncome).toBe(false);
    });
  });

  describe('low income ($80k)', () => {
    const result = calculateAffordability({
      ...baseInput,
      annualIncome: 80000,
    });

    it('maxPurchasePrice = 201000', () => {
      expect(result.maxPurchasePrice).toBe(201000);
    });

    it('maxPurchasePrice is lower than the default scenario', () => {
      const defaultResult = calculateAffordability(baseInput);
      expect(result.maxPurchasePrice).toBeLessThan(
        defaultResult.maxPurchasePrice,
      );
    });

    it('targetPITI = 80000/12 * 0.28 ~= 1867', () => {
      expect(result.targetPITI).toBeCloseTo(1867, 0);
    });

    it('usedFallbackIncome is false', () => {
      expect(result.usedFallbackIncome).toBe(false);
    });
  });

  describe('zero income (fallback to $150k)', () => {
    const result = calculateAffordability({
      ...baseInput,
      annualIncome: 0,
    });

    it('usedFallbackIncome is true', () => {
      expect(result.usedFallbackIncome).toBe(true);
    });

    it('grossMonthlyIncome = 150000 / 12 = 12500', () => {
      expect(result.grossMonthlyIncome).toBeCloseTo(12500, 0);
    });

    it('targetPITI = 12500 * 0.28 = 3500', () => {
      expect(result.targetPITI).toBeCloseTo(3500, 0);
    });

    it('maxPurchasePrice = 441000', () => {
      expect(result.maxPurchasePrice).toBe(441000);
    });
  });

  describe('fixed dollar down payment ($100k)', () => {
    const result = calculateAffordability({
      ...baseInput,
      downPaymentMode: 'amount',
      downPaymentFixedAmount: 100000,
    });

    it('maxPurchasePrice = 1340000', () => {
      expect(result.maxPurchasePrice).toBe(1340000);
    });

    it('targetPITI stays 11200 (income unchanged)', () => {
      expect(result.targetPITI).toBeCloseTo(11200, 0);
    });

    it('usedFallbackIncome is false', () => {
      expect(result.usedFallbackIncome).toBe(false);
    });

    it('maxPurchasePrice is lower than percent mode (fixed $100k < 20% of $1.3M+)', () => {
      const percentResult = calculateAffordability(baseInput);
      expect(result.maxPurchasePrice).toBeLessThan(
        percentResult.maxPurchasePrice,
      );
    });
  });
});
