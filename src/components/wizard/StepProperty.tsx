'use client';

import { useCallback } from 'react';
import { useCalculator } from '@/lib/store/CalculatorContext';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { PercentInput } from '@/components/shared/PercentInput';
import { StateCountySelect } from '@/components/shared/StateCountySelect';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/format';

export function StepProperty() {
  const { inputs, dispatch } = useCalculator();

  const downPaymentAmount =
    (inputs.purchasePrice * inputs.downPaymentPercent) / 100;

  const handleStateCountyChange = useCallback(
    (state: string, county: string, taxRate: number) => {
      dispatch({ type: 'SET_STATE_COUNTY', state, county, taxRate });
    },
    [dispatch],
  );

  const handlePurchasePriceChange = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_INPUT', field: 'purchasePrice', value });
    },
    [dispatch],
  );

  const handleDownPaymentSlider = useCallback(
    (values: number[]) => {
      dispatch({
        type: 'SET_INPUT',
        field: 'downPaymentPercent',
        value: values[0],
      });
    },
    [dispatch],
  );

  const handlePropertyTaxChange = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_INPUT', field: 'propertyTaxRate', value });
    },
    [dispatch],
  );

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Where is your home?</h2>
        <StateCountySelect
          selectedState={inputs.selectedState}
          selectedCounty={inputs.selectedCounty}
          onStateChange={handleStateCountyChange}
        />
      </div>

      {/* Purchase Price */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">What&apos;s the price?</h2>
        <CurrencyInput
          label="Home Price"
          value={inputs.purchasePrice}
          onChange={handlePurchasePriceChange}
          min={50000}
        />
      </div>

      {/* Down Payment */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Down payment</h2>
        <div className="space-y-2">
          <Label>Down Payment Percent</Label>
          <Slider
            min={0}
            max={50}
            step={1}
            value={[inputs.downPaymentPercent]}
            onValueChange={handleDownPaymentSlider}
            className="min-h-[48px]"
          />
          <p className="text-sm text-muted-foreground">
            {inputs.downPaymentPercent}% &mdash;{' '}
            {formatCurrency(downPaymentAmount)}
          </p>
        </div>
      </div>

      {/* Property Tax Rate */}
      <div className="space-y-3">
        <PercentInput
          label="Property Tax Rate"
          value={inputs.propertyTaxRate}
          onChange={handlePropertyTaxChange}
          min={0}
          max={10}
        />
      </div>
    </div>
  );
}
