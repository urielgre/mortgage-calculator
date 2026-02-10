'use client';

import { useState, useCallback } from 'react';
import { useCalculator } from '@/lib/store/CalculatorContext';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { PercentInput } from '@/components/shared/PercentInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function StepExpenses() {
  const { inputs, dispatch } = useCalculator();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = useCallback(
    (field: string, value: number) => {
      dispatch({ type: 'SET_INPUT', field: field as never, value });
    },
    [dispatch],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Loan &amp; costs</h2>

      {/* Interest Rate */}
      <PercentInput
        label="Interest Rate"
        value={inputs.interestRate}
        onChange={(v) => set('interestRate', v)}
        min={0}
        max={25}
      />

      {/* Loan Term Toggle */}
      <div className="space-y-1.5">
        <Label>Loan Term</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={inputs.loanTerm === 15 ? 'default' : 'outline'}
            className="h-12"
            onClick={() => set('loanTerm', 15)}
          >
            15 years
          </Button>
          <Button
            variant={inputs.loanTerm === 30 ? 'default' : 'outline'}
            className="h-12"
            onClick={() => set('loanTerm', 30)}
          >
            30 years
          </Button>
        </div>
      </div>

      {/* Insurance */}
      <CurrencyInput
        label="Home Insurance"
        suffix="/yr"
        value={inputs.insurance}
        onChange={(v) => set('insurance', v)}
        min={0}
      />

      {/* HOA */}
      <CurrencyInput
        label="HOA"
        suffix="/mo"
        value={inputs.hoa}
        onChange={(v) => set('hoa', v)}
        min={0}
      />

      {/* Advanced toggle */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent min-h-[48px]"
        onClick={() => setShowAdvanced((prev) => !prev)}
      >
        <span>Advanced</span>
        {showAdvanced ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {showAdvanced && (
        <div className="space-y-6">
          <PercentInput
            label="Maintenance"
            value={inputs.maintenance}
            onChange={(v) => set('maintenance', v)}
            min={0}
            max={10}
          />
          <CurrencyInput
            label="Utilities"
            suffix="/mo"
            value={inputs.utilities}
            onChange={(v) => set('utilities', v)}
            min={0}
          />
          <CurrencyInput
            label="Extra Monthly Payment"
            suffix="/mo"
            value={inputs.extraMonthly}
            onChange={(v) => set('extraMonthly', v)}
            min={0}
          />
          <PercentInput
            label="Appreciation"
            value={inputs.appreciation}
            onChange={(v) => set('appreciation', v)}
            min={0}
            max={20}
          />
        </div>
      )}
    </div>
  );
}
