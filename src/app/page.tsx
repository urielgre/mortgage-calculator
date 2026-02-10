'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCalculator } from '@/lib/store/CalculatorContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ScenarioDialog from '@/components/shared/ScenarioDialog';
import { JsonLd } from '@/components/shared/JsonLd';
import { MortgageTab } from '@/components/calculator/MortgageTab';

// Lazy-load non-critical tabs
const AffordabilityTab = dynamic(() => import('@/components/calculator/AffordabilityTab').then(m => ({ default: m.AffordabilityTab })));
const RentVsBuyTab = dynamic(() => import('@/components/calculator/RentVsBuyTab').then(m => ({ default: m.RentVsBuyTab })));
const TaxBenefitsTab = dynamic(() => import('@/components/calculator/TaxBenefitsTab').then(m => ({ default: m.TaxBenefitsTab })));
const WealthBuildingTab = dynamic(() => import('@/components/calculator/WealthBuildingTab').then(m => ({ default: m.WealthBuildingTab })));
const ExtraPaymentsTab = dynamic(() => import('@/components/calculator/ExtraPaymentsTab').then(m => ({ default: m.ExtraPaymentsTab })));
const PMITimelineTab = dynamic(() => import('@/components/calculator/PMITimelineTab').then(m => ({ default: m.PMITimelineTab })));

// Lazy-load mobile-only components
const MobileWizard = dynamic(() => import('@/components/wizard/MobileWizard'));
const MobileResults = dynamic(() => import('@/components/mobile/MobileResults'));
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { decodeStateFromURL, hasURLState, encodeStateToURL } from '@/lib/utils/url-state';
import { saveData } from '@/lib/utils/local-storage';
import { exportPDF } from '@/lib/utils/pdf';
import type { CalculatorInputs } from '@/lib/store/types';
import {
  Calculator,
  DollarSign,
  Home as HomeIcon,
  Receipt,
  TrendingUp,
  CreditCard,
  Shield,
} from 'lucide-react';

const tabs = [
  { value: 'mortgage', label: 'Calculator', icon: Calculator },
  { value: 'affordability', label: 'Affordability', icon: DollarSign },
  { value: 'rent-vs-buy', label: 'Rent vs Buy', icon: HomeIcon },
  { value: 'tax-benefits', label: 'Tax Benefits', icon: Receipt },
  { value: 'wealth-building', label: 'Wealth Building', icon: TrendingUp },
  { value: 'extra-payments', label: 'Extra Payments', icon: CreditCard },
  { value: 'pmi', label: 'PMI', icon: Shield },
];

export default function Home() {
  const { inputs, results, dispatch } = useCalculator();
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [mobileView, setMobileView] = useState<'wizard' | 'results'>('wizard');

  // Load from URL on mount
  useEffect(() => {
    if (hasURLState()) {
      const params = decodeStateFromURL(window.location.search);
      if (Object.keys(params).length > 0) {
        dispatch({ type: 'LOAD_FROM_URL', params });
      }
    }
  }, [dispatch]);

  // Auto-save on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveData(inputs), 1000);
    return () => clearTimeout(timer);
  }, [inputs]);

  const handleSave = useCallback(() => {
    saveData(inputs);
    setStatusMessage('Saved!');
    setTimeout(() => setStatusMessage(''), 2000);
  }, [inputs]);

  const handleShare = useCallback(() => {
    const queryString = encodeStateToURL(inputs);
    const url = `${window.location.origin}${window.location.pathname}?${queryString}`;
    navigator.clipboard.writeText(url).then(() => {
      setStatusMessage('Link copied!');
      setTimeout(() => setStatusMessage(''), 2000);
    });
  }, [inputs]);

  const handlePDF = useCallback(() => {
    exportPDF(inputs, results);
  }, [inputs, results]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setStatusMessage('Reset to defaults');
    setTimeout(() => setStatusMessage(''), 2000);
  }, [dispatch]);

  const handleScenarioLoad = useCallback((loadedInputs: CalculatorInputs) => {
    dispatch({ type: 'LOAD_SCENARIO', inputs: loadedInputs });
    setScenarioOpen(false);
    setStatusMessage('Scenario loaded!');
    setTimeout(() => setStatusMessage(''), 2000);
  }, [dispatch]);

  const handleMobileCalculate = useCallback(() => {
    setMobileView('results');
  }, []);

  const handleMobileEdit = useCallback(() => {
    setMobileView('wizard');
  }, []);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <JsonLd />
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <Header
          onSave={handleSave}
          onShare={handleShare}
          onScenario={() => setScenarioOpen(true)}
          onPDF={handlePDF}
          onReset={handleReset}
          statusMessage={statusMessage}
        />

        {/* Desktop: Tab layout (>= 768px) */}
        <div className="hidden md:block">
          <Tabs defaultValue="mortgage" className="mt-6">
            <TabsList className="flex w-full overflow-x-auto scrollbar-hide">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="mortgage" className="animate-in fade-in-0 duration-200">
              <MortgageTab />
            </TabsContent>
            <TabsContent value="affordability" className="animate-in fade-in-0 duration-200">
              <AffordabilityTab />
            </TabsContent>
            <TabsContent value="rent-vs-buy" className="animate-in fade-in-0 duration-200">
              <RentVsBuyTab />
            </TabsContent>
            <TabsContent value="tax-benefits" className="animate-in fade-in-0 duration-200">
              <TaxBenefitsTab />
            </TabsContent>
            <TabsContent value="wealth-building" className="animate-in fade-in-0 duration-200">
              <WealthBuildingTab />
            </TabsContent>
            <TabsContent value="extra-payments" className="animate-in fade-in-0 duration-200">
              <ExtraPaymentsTab />
            </TabsContent>
            <TabsContent value="pmi" className="animate-in fade-in-0 duration-200">
              <PMITimelineTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile: Wizard or Results (< 768px) */}
        <div className="md:hidden mt-4">
          {mobileView === 'wizard' ? (
            <MobileWizard onCalculate={handleMobileCalculate} />
          ) : (
            <MobileResults onEdit={handleMobileEdit} />
          )}
        </div>

        <ScenarioDialog
          open={scenarioOpen}
          onOpenChange={setScenarioOpen}
          onLoad={handleScenarioLoad}
          currentInputs={inputs}
        />

        <Footer />
      </div>
    </main>
  );
}
