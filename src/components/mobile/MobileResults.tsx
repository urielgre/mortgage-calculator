'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculator } from '@/lib/store/CalculatorContext';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

import { PaymentBreakdown } from '@/components/results/PaymentBreakdown';
import { PaymentPieChart } from '@/components/charts/PaymentPieChart';
import { AffordabilityTab } from '@/components/calculator/AffordabilityTab';
import { RentVsBuyTab } from '@/components/calculator/RentVsBuyTab';
import { TaxBenefitsTab } from '@/components/calculator/TaxBenefitsTab';
import { WealthBuildingTab } from '@/components/calculator/WealthBuildingTab';
import { ExtraPaymentsTab } from '@/components/calculator/ExtraPaymentsTab';
import { PMITimelineTab } from '@/components/calculator/PMITimelineTab';

import {
  Pencil,
  Calculator,
  DollarSign,
  Home,
  Receipt,
  MoreHorizontal,
} from 'lucide-react';

interface MobileResultsProps {
  onEdit: () => void;
}

type TabId = 'payment' | 'afford' | 'rentbuy' | 'taxes' | 'more';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'payment', label: 'Payment', icon: Calculator },
  { id: 'afford', label: 'Afford', icon: DollarSign },
  { id: 'rentbuy', label: 'Rent/Buy', icon: Home },
  { id: 'taxes', label: 'Taxes', icon: Receipt },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

function getPaymentColor(amount: number): string {
  if (amount < 3000) return 'text-green-600';
  if (amount > 6000) return 'text-orange-600';
  return '';
}

export default function MobileResults({ onEdit }: MobileResultsProps) {
  const { inputs, results } = useCalculator();
  const [activeTab, setActiveTab] = useState<TabId>('payment');

  const monthlyPITI = results.piti.monthlyPITI;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sticky Compact Hero */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Monthly PITI</p>
            <p className={`text-2xl font-bold ${getPaymentColor(monthlyPITI)}`}>
              {formatCurrency(monthlyPITI)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="min-h-[44px]"
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="pt-[72px] pb-24 px-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'payment' && (
              <>
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
                <PaymentPieChart
                  pi={results.piti.monthlyPI}
                  tax={results.piti.monthlyPropertyTax}
                  insurance={results.piti.monthlyInsurance}
                  hoa={results.piti.monthlyHOA}
                  pmi={results.piti.monthlyPMI}
                  maintenance={results.piti.monthlyMaintenance}
                  utilities={results.piti.monthlyUtilities}
                />
              </>
            )}

            {activeTab === 'afford' && <AffordabilityTab />}
            {activeTab === 'rentbuy' && <RentVsBuyTab />}
            {activeTab === 'taxes' && <TaxBenefitsTab />}

            {activeTab === 'more' && (
              <>
                <WealthBuildingTab />
                <ExtraPaymentsTab />
                <PMITimelineTab />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around px-1 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 ${
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
