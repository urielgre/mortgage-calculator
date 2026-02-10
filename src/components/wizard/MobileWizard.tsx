'use client';

import { useCallback, useRef } from 'react';
import { Wizard, useWizard } from 'react-use-wizard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

import { StepProperty } from './StepProperty';
import { StepIncome } from './StepIncome';
import { StepExpenses } from './StepExpenses';

interface MobileWizardProps {
  onCalculate: () => void;
}

// --- Animation variants ---

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

// --- AnimatedStep ---

function AnimatedStep({ children }: { children: React.ReactNode }) {
  const { activeStep } = useWizard();
  const prevStepRef = useRef(activeStep);

  const direction = activeStep >= prevStepRef.current ? 1 : -1;

  // Update ref after computing direction so it's available for the next render
  if (prevStepRef.current !== activeStep) {
    prevStepRef.current = activeStep;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={activeStep}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// --- ProgressDots ---

const STEP_LABELS = ['Property', 'Income', 'Costs'] as const;

function ProgressDots() {
  const { activeStep } = useWizard();

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="flex items-center gap-3">
        {STEP_LABELS.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={
                  isActive
                    ? 'h-3 w-3 rounded-full bg-primary'
                    : isCompleted
                      ? 'h-2.5 w-2.5 rounded-full bg-primary/60'
                      : 'h-2 w-2 rounded-full bg-muted'
                }
              />
              <span
                className={
                  isActive
                    ? 'text-xs font-medium text-foreground'
                    : 'text-xs text-muted-foreground'
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- WizardFooter ---

function WizardFooter({ onCalculate }: { onCalculate: () => void }) {
  const { nextStep, previousStep, isFirstStep, isLastStep } = useWizard();

  const handleNext = useCallback(() => {
    void nextStep();
  }, [nextStep]);

  const handlePrevious = useCallback(() => {
    previousStep();
  }, [previousStep]);

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-4">
      {!isFirstStep ? (
        <Button
          variant="outline"
          className="min-h-[48px]"
          onClick={handlePrevious}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <Button className="min-h-[48px] flex-1" onClick={onCalculate}>
          <Calculator className="size-4" />
          Calculate
        </Button>
      ) : (
        <Button
          className={isFirstStep ? 'min-h-[48px] w-full' : 'min-h-[48px]'}
          onClick={handleNext}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

// --- MobileWizard ---

export default function MobileWizard({ onCalculate }: MobileWizardProps) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      <Wizard
        header={<ProgressDots />}
        footer={<WizardFooter onCalculate={onCalculate} />}
        wrapper={<div className="flex-1 overflow-hidden px-1 py-4" />}
      >
        <AnimatedStep>
          <StepProperty />
        </AnimatedStep>
        <AnimatedStep>
          <StepIncome />
        </AnimatedStep>
        <AnimatedStep>
          <StepExpenses />
        </AnimatedStep>
      </Wizard>
    </div>
  );
}
