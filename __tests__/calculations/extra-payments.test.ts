import { describe, it, expect } from 'vitest';
import { calculateExtraPayments } from '@/lib/calculations/extra-payments';

describe('calculateExtraPayments', () => {
  // =============================================================
  // No extra payments
  // =============================================================

  describe('no extra payments', () => {
    const result = calculateExtraPayments({
      loanAmount: 640000,
      effectiveLoanAmount: 640000,
      interestRate: 6.5,
      loanTerm: 30,
      extraMonthly: 0,
      lumpSum: 0,
    });

    it('interestSaved is 0', () => {
      expect(result.interestSaved).toBe(0);
    });

    it('monthsSaved is 0', () => {
      expect(result.monthsSaved).toBe(0);
    });

    it('originalMonths is 360', () => {
      expect(result.originalMonths).toBe(360);
    });

    it('newMonths equals originalMonths', () => {
      expect(result.newMonths).toBe(result.originalMonths);
    });

    it('hasExtraPayments is false', () => {
      expect(result.hasExtraPayments).toBe(false);
    });
  });

  // =============================================================
  // $500/month extra payment
  // =============================================================

  describe('$500/month extra payment', () => {
    const result = calculateExtraPayments({
      loanAmount: 640000,
      effectiveLoanAmount: 640000,
      interestRate: 6.5,
      loanTerm: 30,
      extraMonthly: 500,
      lumpSum: 0,
    });

    it('hasExtraPayments is true', () => {
      expect(result.hasExtraPayments).toBe(true);
    });

    it('saves substantial interest (> $100,000)', () => {
      expect(result.interestSaved).toBeGreaterThan(100000);
    });

    it('saves substantial months (> 60 months / 5 years)', () => {
      expect(result.monthsSaved).toBeGreaterThan(60);
    });

    it('newMonths < originalMonths', () => {
      expect(result.newMonths).toBeLessThan(result.originalMonths);
    });

    it('originalMonths is 360', () => {
      expect(result.originalMonths).toBe(360);
    });

    it('monthsSaved + newMonths = originalMonths', () => {
      expect(result.monthsSaved + result.newMonths).toBe(result.originalMonths);
    });
  });

  // =============================================================
  // $50,000 lump sum
  // =============================================================

  describe('$50,000 lump sum', () => {
    const result = calculateExtraPayments({
      loanAmount: 640000,
      effectiveLoanAmount: 590000,
      interestRate: 6.5,
      loanTerm: 30,
      extraMonthly: 0,
      lumpSum: 50000,
    });

    it('hasExtraPayments is true', () => {
      expect(result.hasExtraPayments).toBe(true);
    });

    it('saves substantial interest', () => {
      expect(result.interestSaved).toBeGreaterThan(50000);
    });

    it('months saved may be 0 (lump sum reduces balance, not monthly payment schedule)', () => {
      // Lump sum reduces starting balance but the monthly PI is recalculated
      // for the same term, so payoff duration stays the same
      expect(result.monthsSaved).toBeGreaterThanOrEqual(0);
    });

    it('newMonths <= originalMonths', () => {
      expect(result.newMonths).toBeLessThanOrEqual(result.originalMonths);
    });

    it('originalMonths is 360', () => {
      expect(result.originalMonths).toBe(360);
    });
  });

  // =============================================================
  // Combined: $500/month + $50,000 lump sum
  // =============================================================

  describe('$500/month extra + $50,000 lump sum', () => {
    const result = calculateExtraPayments({
      loanAmount: 640000,
      effectiveLoanAmount: 590000,
      interestRate: 6.5,
      loanTerm: 30,
      extraMonthly: 500,
      lumpSum: 50000,
    });

    it('saves more interest than either strategy alone', () => {
      const monthlyOnly = calculateExtraPayments({
        loanAmount: 640000,
        effectiveLoanAmount: 640000,
        interestRate: 6.5,
        loanTerm: 30,
        extraMonthly: 500,
        lumpSum: 0,
      });

      const lumpOnly = calculateExtraPayments({
        loanAmount: 640000,
        effectiveLoanAmount: 590000,
        interestRate: 6.5,
        loanTerm: 30,
        extraMonthly: 0,
        lumpSum: 50000,
      });

      expect(result.interestSaved).toBeGreaterThan(monthlyOnly.interestSaved);
      expect(result.interestSaved).toBeGreaterThan(lumpOnly.interestSaved);
    });

    it('saves more months than either strategy alone', () => {
      const monthlyOnly = calculateExtraPayments({
        loanAmount: 640000,
        effectiveLoanAmount: 640000,
        interestRate: 6.5,
        loanTerm: 30,
        extraMonthly: 500,
        lumpSum: 0,
      });

      const lumpOnly = calculateExtraPayments({
        loanAmount: 640000,
        effectiveLoanAmount: 590000,
        interestRate: 6.5,
        loanTerm: 30,
        extraMonthly: 0,
        lumpSum: 50000,
      });

      expect(result.monthsSaved).toBeGreaterThan(monthlyOnly.monthsSaved);
      expect(result.monthsSaved).toBeGreaterThan(lumpOnly.monthsSaved);
    });
  });

  // =============================================================
  // Edge: 0% interest rate
  // =============================================================

  describe('0% interest rate', () => {
    const result = calculateExtraPayments({
      loanAmount: 300000,
      effectiveLoanAmount: 300000,
      interestRate: 0,
      loanTerm: 30,
      extraMonthly: 0,
      lumpSum: 0,
    });

    it('no interest saved with no extras at 0% rate', () => {
      expect(result.interestSaved).toBe(0);
    });

    it('originalMonths is 360', () => {
      expect(result.originalMonths).toBe(360);
    });
  });
});
