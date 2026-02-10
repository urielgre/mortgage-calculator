'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { RentVsBuyChart } from '@/components/charts/RentVsBuyChart';

export function RentVsBuyTab() {
  const { inputs, results } = useCalculator();
  const { yearData, breakEvenYear, totalRentCost, totalBuyCost } =
    results.rentVsBuy;

  const heroColor = breakEvenYear
    ? breakEvenYear <= 5
      ? 'text-green-600'
      : breakEvenYear <= 8
        ? 'text-amber-600'
        : 'text-red-600'
    : 'text-amber-600';

  const heroText = breakEvenYear
    ? `Buying breaks even in Year ${breakEvenYear}`
    : 'Renting may be better for the next 10 years';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <p className={`text-2xl font-bold text-center ${heroColor}`}>
            {heroText}
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Wealth Comparison Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <RentVsBuyChart
            data={yearData.map((y) => ({
              year: y.year,
              buyerWealth: y.buyerWealth,
              renterWealth: y.renterWealth,
            }))}
            breakEvenYear={breakEvenYear}
          />
        </CardContent>
      </Card>

      {/* 10-Year Summary */}
      <Card>
        <CardHeader>
          <CardTitle>10-Year Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Total Rent Cost
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(totalRentCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Total Buy Cost
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(totalBuyCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Buyer Wealth (Year 10)
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(yearData[9].buyerWealth)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Renter Wealth (Year 10)
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(yearData[9].renterWealth)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monthly Rent</span>
            <span className="text-sm font-medium">
              {formatCurrency(inputs.rentAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rent Increase</span>
            <span className="text-sm font-medium">
              {inputs.rentIncrease}%/yr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Investment Return
            </span>
            <span className="text-sm font-medium">
              {inputs.investReturn}%/yr
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
