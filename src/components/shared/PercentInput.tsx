'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PercentInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
}

function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}

function parsePercent(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function PercentInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  id,
}: PercentInputProps) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value.toFixed(2));

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDisplayValue(value.toFixed(2));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    let parsed = parsePercent(displayValue);
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    onChange(parsed);
    setDisplayValue(parsed.toFixed(2));
  }, [displayValue, min, max, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    []
  );

  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        step={step}
        value={focused ? displayValue : formatPercent(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </div>
  );
}
