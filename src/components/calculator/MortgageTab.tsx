'use client';

import { useCalculator } from '@/lib/store/CalculatorContext';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { PercentInput } from '@/components/shared/PercentInput';
import { StateCountySelect } from '@/components/shared/StateCountySelect';
import { HeroPayment } from '@/components/results/HeroPayment';
import { PaymentBreakdown } from '@/components/results/PaymentBreakdown';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/format';

export function MortgageTab() {
  const { inputs, results, dispatch } = useCalculator();

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      {/* Left Column — Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Location</h3>
            <StateCountySelect
              selectedState={inputs.selectedState}
              selectedCounty={inputs.selectedCounty}
              onStateChange={(state, county, taxRate) =>
                dispatch({ type: 'SET_STATE_COUNTY', state, county, taxRate })
              }
            />
          </div>

          {/* Loan Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Loan Details</h3>
            <CurrencyInput
              label="Home Price"
              value={inputs.purchasePrice}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'purchasePrice', value })
              }
            />
            <PercentInput
              label="Down Payment"
              value={inputs.downPaymentPercent}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'downPaymentPercent', value })
              }
              min={0}
              max={100}
            />
            <CurrencyInput
              label="Down Payment Amount"
              value={inputs.purchasePrice * inputs.downPaymentPercent / 100}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'downPaymentAmount', value })
              }
            />
            <PercentInput
              label="Interest Rate"
              value={inputs.interestRate}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'interestRate', value })
              }
              min={0}
              max={25}
            />
            <div className="space-y-1.5">
              <Label>Loan Term</Label>
              <Select
                value={String(inputs.loanTerm)}
                onValueChange={(value) =>
                  dispatch({ type: 'SET_INPUT', field: 'loanTerm', value: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Costs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Property Costs</h3>
            <PercentInput
              label="Property Tax Rate"
              value={inputs.propertyTaxRate}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'propertyTaxRate', value })
              }
              min={0}
              max={10}
            />
            <CurrencyInput
              label="Home Insurance"
              suffix="/yr"
              value={inputs.insurance}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'insurance', value })
              }
            />
            <CurrencyInput
              label="HOA"
              suffix="/mo"
              value={inputs.hoa}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'hoa', value })
              }
            />
            {inputs.downPaymentPercent < 20 && (
              <PercentInput
                label="PMI Rate"
                value={inputs.pmiRate}
                onChange={(value) =>
                  dispatch({ type: 'SET_INPUT', field: 'pmiRate', value })
                }
                min={0}
                max={5}
              />
            )}
            <CurrencyInput
              label="Mello-Roos"
              suffix="/yr"
              value={inputs.melloRoos}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'melloRoos', value })
              }
            />
          </div>

          {/* Extra Payments */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Extra Payments</h3>
            <CurrencyInput
              label="Extra Monthly"
              suffix="/mo"
              value={inputs.extraMonthly}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'extraMonthly', value })
              }
            />
            <CurrencyInput
              label="Lump Sum"
              value={inputs.lumpSum}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'lumpSum', value })
              }
            />
          </div>

          {/* Assumptions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Assumptions</h3>
            <PercentInput
              label="Appreciation"
              value={inputs.appreciation}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'appreciation', value })
              }
              min={0}
              max={20}
            />
            <CurrencyInput
              label="Utilities"
              suffix="/mo"
              value={inputs.utilities}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'utilities', value })
              }
            />
            <PercentInput
              label="Maintenance"
              value={inputs.maintenance}
              onChange={(value) =>
                dispatch({ type: 'SET_INPUT', field: 'maintenance', value })
              }
              min={0}
              max={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right Column — Results */}
      <div className="space-y-6">
        <HeroPayment
          monthlyPayment={results.piti.monthlyPITI}
          trueMonthlyCost={results.piti.trueMonthlyCost}
          monthlyTaxSavings={results.taxBenefits.monthlyTaxSavings}
        />

        <PaymentBreakdown
          monthlyPI={results.piti.monthlyPI}
          monthlyPropertyTax={results.piti.monthlyPropertyTax}
          monthlyMelloRoos={results.piti.monthlyMelloRoos}
          monthlyInsurance={results.piti.monthlyInsurance}
          monthlyHOA={results.piti.monthlyHOA}
          monthlyPMI={results.piti.monthlyPMI}
          monthlyMaintenance={results.piti.monthlyMaintenance}
          monthlyUtilities={results.piti.monthlyUtilities}
          extraMonthly={inputs.extraMonthly}
          monthlyPITI={results.piti.monthlyPITI}
          trueMonthlyCost={results.piti.trueMonthlyCost}
        />

        {/* Quick Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Down Payment</span>
              <span className="text-sm font-medium">
                {formatCurrency(results.piti.downPayment)} ({inputs.downPaymentPercent}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Amount</span>
              <span className="text-sm font-medium">
                {formatCurrency(results.piti.loanAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Cash Needed</span>
              <span className="text-sm font-medium">
                {formatCurrency(results.upfrontCosts.totalCashNeeded)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Closing Costs</span>
              <span className="text-sm font-medium">
                {formatCurrency(results.upfrontCosts.totalClosingCosts)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
