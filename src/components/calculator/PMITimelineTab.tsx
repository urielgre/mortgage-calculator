'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { PMIChart } from '@/components/charts/PMIChart';

export function PMITimelineTab() {
  const { inputs, results } = useCalculator();
  const {
    hasPMI,
    monthlyPMI,
    autoRemovalMonth,
    requestRemovalMonth,
    totalPMIPaidUntilAuto,
    savedByRequesting,
    autoRemovalYear,
    requestRemovalYear,
  } = results.pmiTimeline;

  if (!hasPMI) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-green-600">
              No PMI Required
            </p>
            <p className="text-sm text-muted-foreground">
              Your down payment of {inputs.downPaymentPercent}% meets the 20%
              threshold.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* PMI Cost */}
      <Card>
        <CardHeader>
          <CardTitle>PMI Cost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monthly PMI</span>
            <span className="text-sm font-medium">
              {formatCurrency(monthlyPMI)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Total PMI Cost
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(totalPMIPaidUntilAuto)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>PMI Removal Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Auto-cancellation (78% original LTV)
            </span>
            <span className="text-sm font-medium">
              Month {autoRemovalMonth} ({autoRemovalYear} years)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Request removal (80% current value)
            </span>
            <span className="text-sm font-medium">
              Month {requestRemovalMonth} ({requestRemovalYear} years)
            </span>
          </div>
          {savedByRequesting > 0 && (
            <p className="text-sm font-medium text-green-600">
              Request early to save {formatCurrency(savedByRequesting)}!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>LTV Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <PMIChart
            purchasePrice={inputs.purchasePrice}
            loanAmount={results.piti.loanAmount}
            monthlyPI={results.piti.monthlyPI}
            interestRate={inputs.interestRate}
            appreciationRate={inputs.appreciation}
            extraMonthly={inputs.extraMonthly}
            autoRemovalMonth={results.pmiTimeline.autoRemovalMonth}
            requestRemovalMonth={results.pmiTimeline.requestRemovalMonth}
          />
        </CardContent>
      </Card>
    </div>
  );
}
