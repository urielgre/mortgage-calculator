'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

export function AffordabilityTab() {
  const { inputs, results } = useCalculator();
  const { maxPurchasePrice, targetPITI, grossMonthlyIncome, usedFallbackIncome } =
    results.affordability;

  const currentPrice = inputs.purchasePrice;
  const diff = currentPrice - maxPurchasePrice;
  const isOverBudget = currentPrice > maxPurchasePrice;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">You can afford up to</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(maxPurchasePrice)}
          </p>
          {usedFallbackIncome && (
            <Badge
              variant="outline"
              className="mt-3 border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            >
              Using default income ($150,000). Enter your income in the Calculator
              tab for accurate results.
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Gross Monthly Income
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(grossMonthlyIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Max Monthly Housing Cost (28% DTI)
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(targetPITI)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Current Purchase Price
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(currentPrice)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      {isOverBudget ? (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700 dark:text-amber-400"
            >
              Warning
            </Badge>
            <span className="text-sm text-amber-800 dark:text-amber-300">
              Your selected home price exceeds your affordable range by{' '}
              {formatCurrency(diff)}
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <Badge
              variant="outline"
              className="border-green-500 text-green-700 dark:text-green-400"
            >
              Within Budget
            </Badge>
            <span className="text-sm text-green-800 dark:text-green-300">
              Your selected home price is within your affordable range
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
