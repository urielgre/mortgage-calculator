import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculatePITI,
  calculateUpfrontCosts,
  calculateYear1Interest,
} from '@/lib/calculations/mortgage';

// =============================================================
// calculateMonthlyPayment
// =============================================================

describe('calculateMonthlyPayment', () => {
  it('$640,000 at 6.5% for 30 years returns ~$4,045.68', () => {
    const result = calculateMonthlyPayment(640000, 6.5, 30);
    expect(result).toBeCloseTo(4045.68, 0);
  });

  it('$360,000 at 7.0% for 30 years returns ~$2,395.09', () => {
    const result = calculateMonthlyPayment(360000, 7.0, 30);
    expect(result).toBeCloseTo(2395.09, 0);
  });

  it('$400,000 at 5.0% for 15 years returns ~$3,163.26', () => {
    const result = calculateMonthlyPayment(400000, 5.0, 15);
    expect(result).toBeCloseTo(3163.26, 0);
  });

  it('$300,000 at 0% for 30 years returns $833.33 exactly', () => {
    const result = calculateMonthlyPayment(300000, 0, 30);
    expect(result).toBeCloseTo(833.33, 2);
  });

  it('$0 principal returns $0', () => {
    const result = calculateMonthlyPayment(0, 6.5, 30);
    expect(result).toBe(0);
  });
});

// =============================================================
// calculatePITI — 20% down (no PMI)
// =============================================================

describe('calculatePITI', () => {
  const defaultInput = {
    purchasePrice: 800000,
    loanAmount: 640000, // not used directly; derived from purchasePrice & downPaymentPercent
    interestRate: 6.5,
    loanTerm: 30,
    propertyTaxRate: 1.1,
    melloRoos: 0,
    insurance: 2400,
    hoa: 0,
    downPaymentPercent: 20,
    pmiRate: 0.5,
    maintenance: 1,
    utilities: 300,
    extraMonthly: 0,
    lumpSum: 0,
  };

  it('calculates downPayment = 160,000', () => {
    const result = calculatePITI(defaultInput);
    expect(result.downPayment).toBe(160000);
  });

  it('calculates loanAmount = 640,000', () => {
    const result = calculatePITI(defaultInput);
    expect(result.loanAmount).toBe(640000);
  });

  it('calculates monthlyPI ~ $4,045.68', () => {
    const result = calculatePITI(defaultInput);
    expect(result.monthlyPI).toBeCloseTo(4045.68, 0);
  });

  it('calculates monthlyPropertyTax = $733.33', () => {
    const result = calculatePITI(defaultInput);
    // 800000 * 1.1 / 100 / 12 = 733.333...
    expect(result.monthlyPropertyTax).toBeCloseTo(733.33, 0);
  });

  it('calculates monthlyInsurance = $200', () => {
    const result = calculatePITI(defaultInput);
    expect(result.monthlyInsurance).toBe(200);
  });

  it('calculates monthlyPMI = 0 (20% down)', () => {
    const result = calculatePITI(defaultInput);
    expect(result.monthlyPMI).toBe(0);
  });

  it('calculates monthlyMaintenance ~ $666.67', () => {
    const result = calculatePITI(defaultInput);
    // 800000 * 1 / 100 / 12 = 666.666...
    expect(result.monthlyMaintenance).toBeCloseTo(666.67, 0);
  });

  it('calculates monthlyUtilities = $300', () => {
    const result = calculatePITI(defaultInput);
    expect(result.monthlyUtilities).toBe(300);
  });

  it('calculates monthlyPITI ~ $4,979.01 (PI + tax + insurance + PMI + HOA + mello)', () => {
    const result = calculatePITI(defaultInput);
    // 4045.68 + 733.33 + 0 + 200 + 0 + 0 = 4979.01
    expect(result.monthlyPITI).toBeCloseTo(4979.01, 0);
  });

  it('calculates trueMonthlyCost ~ $5,945.68 (PITI + maintenance + utilities + extra)', () => {
    const result = calculatePITI(defaultInput);
    // 4979.01 + 666.67 + 300 + 0 = 5945.68
    expect(result.trueMonthlyCost).toBeCloseTo(5945.68, 0);
  });

  // --- PMI scenario (10% down) ---
  describe('with 10% down (PMI scenario)', () => {
    const pmiInput = {
      ...defaultInput,
      purchasePrice: 400000,
      loanAmount: 360000,
      downPaymentPercent: 10,
    };

    it('monthlyPMI should be > 0 when down payment < 20%', () => {
      const result = calculatePITI(pmiInput);
      expect(result.monthlyPMI).toBeGreaterThan(0);
    });

    it('calculates correct PMI amount', () => {
      const result = calculatePITI(pmiInput);
      // loanAmount = 400000 * 0.9 = 360000
      // monthlyPMI = (360000 * 0.5 / 100) / 12 = 150
      expect(result.monthlyPMI).toBeCloseTo(150, 2);
    });

    it('calculates correct downPayment for 10%', () => {
      const result = calculatePITI(pmiInput);
      expect(result.downPayment).toBe(40000);
    });

    it('calculates correct loanAmount for 10% down', () => {
      const result = calculatePITI(pmiInput);
      expect(result.loanAmount).toBe(360000);
    });
  });

  // --- Lump sum scenario ---
  describe('with lump sum payment', () => {
    const lumpSumInput = {
      ...defaultInput,
      lumpSum: 50000,
    };

    it('effectiveLumpSum equals the lump sum applied', () => {
      const result = calculatePITI(lumpSumInput);
      expect(result.effectiveLumpSum).toBe(50000);
    });

    it('effectiveLoanAmount = loanAmount - lumpSum', () => {
      const result = calculatePITI(lumpSumInput);
      // 640000 - 50000 = 590000
      expect(result.effectiveLoanAmount).toBe(590000);
    });

    it('monthlyPI is lower than without lump sum', () => {
      const withoutLump = calculatePITI(defaultInput);
      const withLump = calculatePITI(lumpSumInput);
      expect(withLump.monthlyPI).toBeLessThan(withoutLump.monthlyPI);
    });
  });
});

// =============================================================
// calculateUpfrontCosts
// =============================================================

describe('calculateUpfrontCosts', () => {
  const purchasePrice = 800000;
  const loanAmount = 640000;
  const downPayment = 160000;
  const effectiveLumpSum = 0;
  const interestRate = 6.5;
  const insurance = 2400;
  const monthlyPropertyTax = 733.33;
  const monthlyInsurance = 200;
  const hoa = 0;

  const result = calculateUpfrontCosts(
    purchasePrice,
    loanAmount,
    downPayment,
    effectiveLumpSum,
    interestRate,
    insurance,
    monthlyPropertyTax,
    monthlyInsurance,
    hoa
  );

  it('loan origination = loanAmount * 0.0075 = $4,800', () => {
    expect(result.closingCosts['Loan Origination (0.75%)']).toBeCloseTo(4800, 2);
  });

  it('appraisal fee = $600', () => {
    expect(result.closingCosts['Appraisal Fee']).toBe(600);
  });

  it('credit report = $50', () => {
    expect(result.closingCosts['Credit Report']).toBe(50);
  });

  it('title insurance = purchasePrice * 0.003 = $2,400', () => {
    expect(result.closingCosts['Title Insurance']).toBeCloseTo(2400, 2);
  });

  it('escrow fee = purchasePrice * 0.002 = $1,600', () => {
    expect(result.closingCosts['Escrow Fee']).toBeCloseTo(1600, 2);
  });

  it('recording fees = $200', () => {
    expect(result.closingCosts['Recording Fees']).toBe(200);
  });

  it('notary fees = $200', () => {
    expect(result.closingCosts['Notary Fees']).toBe(200);
  });

  it('home inspection = $500', () => {
    expect(result.closingCosts['Home Inspection']).toBe(500);
  });

  it('pest inspection = $150', () => {
    expect(result.closingCosts['Pest Inspection']).toBe(150);
  });

  it('prepaid interest (15 days) is calculated correctly', () => {
    // (640000 * 6.5 / 100 / 365) * 15 = 1709.589...
    const expected = ((640000 * 6.5) / 100 / 365) * 15;
    expect(result.closingCosts['Prepaid Interest (15 days)']).toBeCloseTo(expected, 2);
  });

  it('prepaid property tax (2 months) = monthlyPropertyTax * 2', () => {
    expect(result.closingCosts['Prepaid Property Tax (2 mo)']).toBeCloseTo(733.33 * 2, 0);
  });

  it('prepaid insurance (12 months) = annual insurance', () => {
    expect(result.closingCosts['Prepaid Insurance (12 mo)']).toBe(2400);
  });

  it('does NOT include HOA transfer fee when hoa = 0', () => {
    expect(result.closingCosts['HOA Transfer Fee']).toBeUndefined();
  });

  it('totalClosingCosts is the sum of all closing cost items', () => {
    const sum = Object.values(result.closingCosts).reduce((a, b) => a + b, 0);
    expect(result.totalClosingCosts).toBeCloseTo(sum, 2);
  });

  it('escrowReserve = monthlyPropertyTax * 2 + monthlyInsurance * 2', () => {
    const expected = monthlyPropertyTax * 2 + monthlyInsurance * 2;
    expect(result.escrowReserve).toBeCloseTo(expected, 0);
  });

  it('totalCashNeeded = downPayment + totalClosingCosts + escrowReserve + effectiveLumpSum', () => {
    const expected =
      downPayment + result.totalClosingCosts + result.escrowReserve + effectiveLumpSum;
    expect(result.totalCashNeeded).toBeCloseTo(expected, 2);
  });

  // --- with HOA ---
  describe('with HOA > 0', () => {
    const resultWithHOA = calculateUpfrontCosts(
      purchasePrice,
      loanAmount,
      downPayment,
      effectiveLumpSum,
      interestRate,
      insurance,
      monthlyPropertyTax,
      monthlyInsurance,
      350
    );

    it('includes HOA Transfer Fee of $500 when hoa > 0', () => {
      expect(resultWithHOA.closingCosts['HOA Transfer Fee']).toBe(500);
    });
  });
});

// =============================================================
// calculateYear1Interest
// =============================================================

describe('calculateYear1Interest', () => {
  it('$640,000 at 6.5% with monthlyPI ~$4,045.68 and no extra returns ~$41,389', () => {
    const monthlyPI = calculateMonthlyPayment(640000, 6.5, 30);
    const result = calculateYear1Interest(640000, 6.5, monthlyPI, 0);
    // Year 1 interest should be around $41,000-$41,500 (mostly interest early in amortization)
    expect(result).toBeGreaterThan(40000);
    expect(result).toBeLessThan(42000);
    expect(result).toBeCloseTo(41389, 0); // within $1
  });

  it('extra $500/month reduces year-1 interest', () => {
    const monthlyPI = calculateMonthlyPayment(640000, 6.5, 30);
    const withoutExtra = calculateYear1Interest(640000, 6.5, monthlyPI, 0);
    const withExtra = calculateYear1Interest(640000, 6.5, monthlyPI, 500);
    expect(withExtra).toBeLessThan(withoutExtra);
  });

  it('year-1 interest with $500/month extra is still substantial', () => {
    const monthlyPI = calculateMonthlyPayment(640000, 6.5, 30);
    const result = calculateYear1Interest(640000, 6.5, monthlyPI, 500);
    // With extra payments, the balance drops faster so interest is slightly less
    expect(result).toBeGreaterThan(39000);
    expect(result).toBeLessThan(42000);
  });

  it('returns 0 for 0% interest rate', () => {
    const monthlyPI = calculateMonthlyPayment(300000, 0, 30);
    const result = calculateYear1Interest(300000, 0, monthlyPI, 0);
    expect(result).toBe(0);
  });

  it('returns 0 for $0 loan amount', () => {
    const result = calculateYear1Interest(0, 6.5, 0, 0);
    expect(result).toBe(0);
  });
});
