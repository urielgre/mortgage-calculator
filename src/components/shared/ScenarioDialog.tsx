'use client';

import { useState, useEffect } from 'react';
import type { CalculatorInputs } from '@/lib/store/types';
import {
  getScenarios,
  saveScenario,
  loadScenario,
  deleteScenario,
  type ScenarioSnapshot,
} from '@/lib/utils/local-storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Upload } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface ScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (inputs: CalculatorInputs) => void;
  currentInputs: CalculatorInputs;
}

export default function ScenarioDialog({
  open,
  onOpenChange,
  onLoad,
  currentInputs,
}: ScenarioDialogProps) {
  const [scenarios, setScenarios] = useState<ScenarioSnapshot[]>([]);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [saveName, setSaveName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const refreshScenarios = () => {
    setScenarios(getScenarios());
  };

  useEffect(() => {
    if (open) {
      refreshScenarios();
      setSavingSlot(null);
      setConfirmDelete(null);
    }
  }, [open]);

  const handleSaveClick = (slotIndex: number) => {
    setSavingSlot(slotIndex);
    setSaveName(`Scenario ${slotIndex + 1}`);
    setConfirmDelete(null);
  };

  const handleSaveConfirm = () => {
    if (savingSlot === null) return;
    saveScenario(saveName || `Scenario ${savingSlot + 1}`, currentInputs);
    setSavingSlot(null);
    setSaveName('');
    refreshScenarios();
  };

  const handleLoad = (index: number) => {
    const result = loadScenario(index);
    if (result) {
      onLoad(result);
      onOpenChange(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    setConfirmDelete(index);
    setSavingSlot(null);
  };

  const handleDeleteConfirm = (index: number) => {
    deleteScenario(index);
    setConfirmDelete(null);
    refreshScenarios();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Build a list of 3 slots, filling with existing scenarios
  const slots = Array.from({ length: 3 }, (_, i) => scenarios[i] ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Scenarios</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {slots.map((scenario, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              {scenario ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{scenario.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(scenario.timestamp)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(scenario.inputs.purchasePrice)} |{' '}
                      {scenario.inputs.interestRate}% |{' '}
                      {scenario.inputs.loanTerm}yr
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {confirmDelete === index ? (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfirm(index)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoad(index)}
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    {savingSlot === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Scenario name"
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveConfirm();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveConfirm}>
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSavingSlot(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Empty Slot
                      </p>
                    )}
                  </div>
                  {savingSlot !== index && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveClick(index)}
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
