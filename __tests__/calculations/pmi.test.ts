import { describe, it, expect } from 'vitest';
import { calculatePMITimeline } from '@/lib/calculations/pmi';
import { calculateMonthlyPayment } from '@/lib/calculations/mortgage';

describe('calculatePMITimeline', () => {
  // =============================================================
  // 20% down — no PMI
  // =============================================================

  describe('20% down (no PMI)', () => {
    const result = calculatePMITimeline({
      loanAmount: 640000,
      purchasePrice: 800000,
      monthlyPI: calculateMonthlyPayment(640000, 6.5, 30),
      interestRate: 6.5,
      appreciationRate: 3,
      downPaymentPercent: 20,
      extraMonthly: 0,
      pmiRate: 0.5,
    });

    it('hasPMI is false', () => {
      expect(result.hasPMI).toBe(false);
    });

    it('monthlyPMI is 0', () => {
      expect(result.monthlyPMI).toBe(0);
    });

    it('autoRemovalMonth is null', () => {
      expect(result.autoRemovalMonth).toBeNull();
    });

    it('requestRemovalMonth is null', () => {
      expect(result.requestRemovalMonth).toBeNull();
    });

    it('totalPMIPaidUntilAuto is 0', () => {
      expect(result.totalPMIPaidUntilAuto).toBe(0);
    });

    it('savedByRequesting is 0', () => {
      expect(result.savedByRequesting).toBe(0);
    });

    it('autoRemovalYear is N/A', () => {
      expect(result.autoRemovalYear).toBe('N/A');
    });

    it('requestRemovalYear is N/A', () => {
      expect(result.requestRemovalYear).toBe('N/A');
    });
  });

  // =============================================================
  // 10% down — PMI required
  // =============================================================

  describe('10% down (PMI required)', () => {
    const purchasePrice = 400000;
    const loanAmount = 360000; // 90% LTV
    const monthlyPI = calculateMonthlyPayment(loanAmount, 6.5, 30);

    const result = calculatePMITimeline({
      loanAmount,
      purchasePrice,
      monthlyPI,
      interestRate: 6.5,
      appreciationRate: 3,
      downPaymentPercent: 10,
      extraMonthly: 0,
      pmiRate: 0.5,
    });

    it('hasPMI is true', () => {
      expect(result.hasPMI).toBe(true);
    });

    it('monthlyPMI > 0', () => {
      expect(result.monthlyPMI).toBeGreaterThan(0);
    });

    it('monthlyPMI = loanAmount * pmiRate / 100 / 12', () => {
      // 360000 * 0.5 / 100 / 12 = 150
      expect(result.monthlyPMI).toBeCloseTo(150, 2);
    });

    it('autoRemovalMonth exists and is a positive number', () => {
      expect(result.autoRemovalMonth).not.toBeNull();
      expect(result.autoRemovalMonth).toBeGreaterThan(0);
    });

    it('requestRemovalMonth exists and is a positive number', () => {
      expect(result.requestRemovalMonth).not.toBeNull();
      expect(result.requestRemovalMonth).toBeGreaterThan(0);
    });

    it('requestRemovalMonth is earlier than autoRemovalMonth', () => {
      expect(result.requestRemovalMonth!).toBeLessThan(result.autoRemovalMonth!);
    });

    it('totalPMIPaidUntilAuto > 0', () => {
      expect(result.totalPMIPaidUntilAuto).toBeGreaterThan(0);
    });

    it('savedByRequesting > 0', () => {
      expect(result.savedByRequesting).toBeGreaterThan(0);
    });

    it('autoRemovalYear is a numeric string', () => {
      expect(result.autoRemovalYear).not.toBe('N/A');
      expect(parseFloat(result.autoRemovalYear)).toBeGreaterThan(0);
    });

    it('requestRemovalYear is a numeric string', () => {
      expect(result.requestRemovalYear).not.toBe('N/A');
      expect(parseFloat(result.requestRemovalYear)).toBeGreaterThan(0);
    });

    it('savedByRequesting = (autoRemovalMonth - requestRemovalMonth) * monthlyPMI', () => {
      const expected =
        (result.autoRemovalMonth! - result.requestRemovalMonth!) * result.monthlyPMI;
      expect(result.savedByRequesting).toBeCloseTo(expected, 2);
    });
  });

  // =============================================================
  // 5% down — higher PMI, faster request removal with appreciation
  // =============================================================

  describe('5% down (high LTV)', () => {
    const purchasePrice = 400000;
    const loanAmount = 380000; // 95% LTV
    const monthlyPI = calculateMonthlyPayment(loanAmount, 6.5, 30);

    const result = calculatePMITimeline({
      loanAmount,
      purchasePrice,
      monthlyPI,
      interestRate: 6.5,
      appreciationRate: 3,
      downPaymentPercent: 5,
      extraMonthly: 0,
      pmiRate: 0.5,
    });

    it('hasPMI is true', () => {
      expect(result.hasPMI).toBe(true);
    });

    it('monthlyPMI is higher than 10% down scenario', () => {
      // 380000 * 0.5 / 100 / 12 ~ 158.33
      expect(result.monthlyPMI).toBeCloseTo(158.33, 0);
      expect(result.monthlyPMI).toBeGreaterThan(150); // > 10% down PMI
    });

    it('autoRemovalMonth is later than 10% down scenario', () => {
      const tenPercentResult = calculatePMITimeline({
        loanAmount: 360000,
        purchasePrice: 400000,
        monthlyPI: calculateMonthlyPayment(360000, 6.5, 30),
        interestRate: 6.5,
        appreciationRate: 3,
        downPaymentPercent: 10,
        extraMonthly: 0,
        pmiRate: 0.5,
      });
      expect(result.autoRemovalMonth!).toBeGreaterThan(tenPercentResult.autoRemovalMonth!);
    });

    it('requestRemovalMonth is earlier than autoRemovalMonth', () => {
      expect(result.requestRemovalMonth!).toBeLessThan(result.autoRemovalMonth!);
    });

    it('appreciation helps achieve early request removal', () => {
      // Without appreciation (0%), request removal would be later
      const noAppreciation = calculatePMITimeline({
        loanAmount,
        purchasePrice,
        monthlyPI,
        interestRate: 6.5,
        appreciationRate: 0,
        downPaymentPercent: 5,
        extraMonthly: 0,
        pmiRate: 0.5,
      });
      // With 0% appreciation, requestRemoval relies only on principal paydown,
      // so it should match autoRemoval (or be null if LTV never hits 80% of original)
      if (noAppreciation.requestRemovalMonth !== null) {
        expect(result.requestRemovalMonth!).toBeLessThanOrEqual(
          noAppreciation.requestRemovalMonth
        );
      }
    });
  });

  // =============================================================
  // Extra monthly payments accelerate PMI removal
  // =============================================================

  describe('extra monthly payments accelerate PMI removal', () => {
    const purchasePrice = 400000;
    const loanAmount = 360000;
    const monthlyPI = calculateMonthlyPayment(loanAmount, 6.5, 30);

    const withoutExtra = calculatePMITimeline({
      loanAmount,
      purchasePrice,
      monthlyPI,
      interestRate: 6.5,
      appreciationRate: 3,
      downPaymentPercent: 10,
      extraMonthly: 0,
      pmiRate: 0.5,
    });

    const withExtra = calculatePMITimeline({
      loanAmount,
      purchasePrice,
      monthlyPI,
      interestRate: 6.5,
      appreciationRate: 3,
      downPaymentPercent: 10,
      extraMonthly: 500,
      pmiRate: 0.5,
    });

    it('autoRemovalMonth is earlier with extra payments', () => {
      expect(withExtra.autoRemovalMonth!).toBeLessThan(withoutExtra.autoRemovalMonth!);
    });

    it('totalPMIPaidUntilAuto is less with extra payments', () => {
      expect(withExtra.totalPMIPaidUntilAuto).toBeLessThan(
        withoutExtra.totalPMIPaidUntilAuto
      );
    });
  });
});
