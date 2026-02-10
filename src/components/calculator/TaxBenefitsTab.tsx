'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export function TaxBenefitsTab() {
  const { results } = useCalculator();
  const {
    totalAnnualTaxBenefit,
    monthlyTaxSavings,
    standardDeduction,
    itemizedWithHome,
    itemizedWithoutHome,
    shouldItemize,
    federalTaxSavings,
    stateTaxSavings,
    homesteadSavings,
    federalRate,
    stateRate,
    totalSALT,
    saltCap,
    deductibleSALT,
  } = results.taxBenefits;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Annual Tax Benefit</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(totalAnnualTaxBenefit)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(monthlyTaxSavings)}/mo
          </p>
        </CardContent>
      </Card>

      {/* Deduction Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Standard Deduction
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(standardDeduction)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Itemized With Home
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(itemizedWithHome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Itemized Without Home
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(itemizedWithoutHome)}
            </span>
          </div>
          <div className="pt-2">
            {shouldItemize ? (
              <Badge
                variant="outline"
                className="border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
              >
                Itemizing saves you money
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              >
                Standard deduction is better
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Savings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Savings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Federal Tax Savings{' '}
              <span className="text-xs">
                (at {formatPercent(federalRate * 100)} rate)
              </span>
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(federalTaxSavings)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              State Tax Savings{' '}
              <span className="text-xs">
                (at {formatPercent(stateRate * 100)} rate)
              </span>
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(stateTaxSavings)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Homestead Exemption
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(homesteadSavings)}
            </span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between font-semibold">
            <span className="text-sm">Total</span>
            <span className="text-sm">{formatCurrency(totalAnnualTaxBenefit)}</span>
          </div>
        </CardContent>
      </Card>

      {/* SALT Details */}
      <Card>
        <CardHeader>
          <CardTitle>SALT Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total SALT</span>
            <span className="text-sm font-medium">
              {formatCurrency(totalSALT)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">SALT Cap</span>
            <span className="text-sm font-medium">
              {formatCurrency(saltCap)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Deductible SALT
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(deductibleSALT)}
            </span>
          </div>
          {totalSALT > saltCap && (
            <div className="pt-2">
              <Badge
                variant="outline"
                className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              >
                SALT cap limits your deduction by{' '}
                {formatCurrency(totalSALT - deductibleSALT)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
