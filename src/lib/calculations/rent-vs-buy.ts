// =============================================================
// rent-vs-buy.ts — Rent vs buy comparison
// Extracted from index.html without modifying formulas
// =============================================================

// --- Interfaces ---

export interface RentVsBuyInput {
  rentAmount: number; // monthly rent $
  rentIncrease: number; // annual % increase, e.g. 3
  investReturn: number; // annual % return on investments, e.g. 7
  downPayment: number; // $ amount
  trueMonthlyCost: number; // total monthly housing cost if buying
  /** Year-by-year wealth data from amortization schedule (totalEquity per year) */
  wealthDataEquity: number[]; // array of 10 totalEquity values, index 0 = year 1
}

export interface RentVsBuyYearData {
  year: number;
  rent: number; // annual rent for this year
  cumulativeRent: number;
  buyCost: number; // annual buy cost
  cumulativeBuy: number;
  buyerWealth: number; // total equity
  renterWealth: number; // investment portfolio value
}

export interface RentVsBuyResult {
  yearData: RentVsBuyYearData[];
  breakEvenYear: number | null;
  totalRentCost: number;
  totalBuyCost: number;
}

// --- Functions ---

/**
 * Produce year-by-year rent vs buy comparison arrays.
 * Extracted from calculateRentVsBuy() in index.html.
 */
export function calculateRentVsBuy(
  input: RentVsBuyInput
): RentVsBuyResult {
  const rentIncrease = input.rentIncrease / 100;
  const investReturn = input.investReturn / 100;

  const years = 10;
  const yearData: RentVsBuyYearData[] = [];
  let cumulativeRent = 0;
  let cumulativeBuy = 0;
  let renterPortfolio = input.downPayment; // Renter invests the down payment
  let breakEvenYear: number | null = null;

  for (let y = 1; y <= years; y++) {
    const currentRent =
      input.rentAmount * Math.pow(1 + rentIncrease, y - 1);
    const yearlyRent = currentRent * 12;
    cumulativeRent += yearlyRent;

    // Renter invests monthly savings (buy cost - rent cost) + grows portfolio
    const monthlySavings = Math.max(0, input.trueMonthlyCost - currentRent);
    renterPortfolio =
      renterPortfolio * (1 + investReturn) + monthlySavings * 12;

    // Buyer: cumulative housing costs
    cumulativeBuy += input.trueMonthlyCost * 12;

    const buyerWealth =
      input.wealthDataEquity[y - 1] ??
      input.wealthDataEquity[input.wealthDataEquity.length - 1] ??
      0;

    if (!breakEvenYear && buyerWealth > renterPortfolio) {
      breakEvenYear = y;
    }

    yearData.push({
      year: y,
      rent: Math.round(yearlyRent),
      cumulativeRent: Math.round(cumulativeRent),
      buyCost: Math.round(input.trueMonthlyCost * 12),
      cumulativeBuy: Math.round(cumulativeBuy),
      buyerWealth: Math.round(buyerWealth),
      renterWealth: Math.round(renterPortfolio),
    });
  }

  return {
    yearData,
    breakEvenYear,
    totalRentCost: Math.round(cumulativeRent),
    totalBuyCost: Math.round(cumulativeBuy),
  };
}
