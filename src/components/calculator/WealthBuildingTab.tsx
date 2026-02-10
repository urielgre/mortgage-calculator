'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { WealthChart } from '@/components/charts/WealthChart';

export function WealthBuildingTab() {
  const { results } = useCalculator();
  const amort = results.amortization;
  const last = amort[amort.length - 1];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">10-Year Wealth Impact</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(last.totalWealthImpact)}
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Wealth Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <WealthChart data={amort} />
        </CardContent>
      </Card>

      {/* Summary Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Home Value (Year 10)</p>
            <p className="text-lg font-semibold">
              {formatCurrency(amort[9].homeValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Equity</p>
            <p className="text-lg font-semibold">
              {formatCurrency(amort[9].totalEquity)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Appreciation Gain</p>
            <p className="text-lg font-semibold">
              {formatCurrency(amort[9].appreciationGain)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Tax Savings</p>
            <p className="text-lg font-semibold">
              {formatCurrency(amort[9].cumulativeTaxSavings)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year-by-Year Table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-by-Year Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Year</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">
                    Home Value
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">
                    Mortgage Balance
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">
                    Total Equity
                  </th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">
                    Wealth Impact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {amort.map((entry) => (
                  <tr key={entry.year}>
                    <td className="py-2">{entry.year}</td>
                    <td className="py-2 text-right">
                      {formatCurrency(entry.homeValue)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(entry.remainingMortgage)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(entry.totalEquity)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(entry.totalWealthImpact)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
