import { describe, it, expect } from 'vitest';
import {
  calculateRentVsBuy,
  type RentVsBuyInput,
} from '@/lib/calculations/rent-vs-buy';

// --- Mock equity data (10 years) ---
const mockEquity = [
  170000, 185000, 205000, 230000, 260000, 295000, 335000, 380000, 430000,
  485000,
];

// --- Shared base input ---
const baseInput: RentVsBuyInput = {
  rentAmount: 3000,
  rentIncrease: 3,
  investReturn: 7,
  downPayment: 160000,
  trueMonthlyCost: 5946,
  wealthDataEquity: mockEquity,
};

describe('calculateRentVsBuy', () => {
  describe('default scenario ($3k rent, 3% increase, 7% returns)', () => {
    const result = calculateRentVsBuy(baseInput);

    it('returns 10 years of data', () => {
      expect(result.yearData).toHaveLength(10);
    });

    it('year 1 rent = 36000', () => {
      expect(result.yearData[0].rent).toBe(36000);
    });

    it('cumulative rent at year 10 = 412700', () => {
      expect(result.yearData[9].cumulativeRent).toBe(412700);
    });

    it('totalRentCost = 412700', () => {
      expect(result.totalRentCost).toBe(412700);
    });

    it('totalBuyCost = 713520', () => {
      expect(result.totalBuyCost).toBe(713520);
    });

    it('year 1 buyCost = 5946 * 12 = 71352', () => {
      expect(result.yearData[0].buyCost).toBe(71352);
    });

    it('breakEvenYear is null (renter wealth exceeds buyer throughout)', () => {
      expect(result.breakEvenYear).toBeNull();
    });

    it('year 1 renterWealth = 206552', () => {
      expect(result.yearData[0].renterWealth).toBe(206552);
    });

    it('year 10 renterWealth = 739664', () => {
      expect(result.yearData[9].renterWealth).toBe(739664);
    });

    it('year 10 buyerWealth = 485000 (from mockEquity)', () => {
      expect(result.yearData[9].buyerWealth).toBe(485000);
    });

    it('renterWealth grows each year', () => {
      for (let i = 1; i < result.yearData.length; i++) {
        expect(result.yearData[i].renterWealth).toBeGreaterThan(
          result.yearData[i - 1].renterWealth,
        );
      }
    });

    it('cumulativeRent increases each year', () => {
      for (let i = 1; i < result.yearData.length; i++) {
        expect(result.yearData[i].cumulativeRent).toBeGreaterThan(
          result.yearData[i - 1].cumulativeRent,
        );
      }
    });
  });

  describe('high rent scenario ($5k rent)', () => {
    const result = calculateRentVsBuy({
      ...baseInput,
      rentAmount: 5000,
    });

    it('returns 10 years of data', () => {
      expect(result.yearData).toHaveLength(10);
    });

    it('breakEvenYear = 6 (buying breaks even faster with high rent)', () => {
      expect(result.breakEvenYear).toBe(6);
    });

    it('year 1 rent = 60000', () => {
      expect(result.yearData[0].rent).toBe(60000);
    });

    it('totalRentCost is higher than default scenario', () => {
      const defaultResult = calculateRentVsBuy(baseInput);
      expect(result.totalRentCost).toBeGreaterThan(defaultResult.totalRentCost);
    });
  });

  describe('low rent scenario ($1500 rent)', () => {
    const result = calculateRentVsBuy({
      ...baseInput,
      rentAmount: 1500,
    });

    it('returns 10 years of data', () => {
      expect(result.yearData).toHaveLength(10);
    });

    it('breakEvenYear is null (buying never breaks even with low rent)', () => {
      expect(result.breakEvenYear).toBeNull();
    });

    it('year 1 rent = 18000', () => {
      expect(result.yearData[0].rent).toBe(18000);
    });

    it('renter wealth exceeds buyer wealth every year', () => {
      for (const entry of result.yearData) {
        expect(entry.renterWealth).toBeGreaterThan(entry.buyerWealth);
      }
    });
  });
});
