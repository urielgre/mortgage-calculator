'use client';

import { useCallback } from 'react';
import { useCalculator } from '@/lib/store/CalculatorContext';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilingStatus } from '@/lib/store/types';

export function StepIncome() {
  const { inputs, dispatch } = useCalculator();

  const handleIncomeChange = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_INPUT', field: 'annualIncome', value });
    },
    [dispatch],
  );

  const handleFilingStatusChange = useCallback(
    (value: string) => {
      dispatch({
        type: 'SET_INPUT',
        field: 'filingStatus',
        value: value as FilingStatus,
      });
    },
    [dispatch],
  );

  const handleTaxYearChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_INPUT', field: 'taxYear', value });
    },
    [dispatch],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Your income details</h2>
        <p className="text-sm text-muted-foreground">
          Used to calculate your tax benefits and affordability
        </p>
      </div>

      {/* Annual Income */}
      <CurrencyInput
        label="Annual Gross Income"
        value={inputs.annualIncome}
        onChange={handleIncomeChange}
        min={0}
      />

      {/* Filing Status */}
      <div className="space-y-1.5">
        <Label>Filing Status</Label>
        <Select
          value={inputs.filingStatus}
          onValueChange={handleFilingStatusChange}
        >
          <SelectTrigger className="min-h-[48px] w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married_jointly">
              Married Filing Jointly
            </SelectItem>
            <SelectItem value="head_of_household">
              Head of Household
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tax Year */}
      <div className="space-y-1.5">
        <Label>Tax Year</Label>
        <Select value={inputs.taxYear} onValueChange={handleTaxYearChange}>
          <SelectTrigger className="min-h-[48px] w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
