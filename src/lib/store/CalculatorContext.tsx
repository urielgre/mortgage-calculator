'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { calculatorReducer, initialState } from './reducer';
import type { CalculatorInputs, CalculatorResults, CalculatorAction } from './types';

interface CalculatorContextValue {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  dispatch: React.Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  return (
    <CalculatorContext.Provider value={{ inputs: state.inputs, results: state.results, dispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider');
  return ctx;
}
