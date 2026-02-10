'use client';

import { useMemo, useCallback } from 'react';
import { COUNTY_TAX_DATA, type County } from '@/lib/data/state-tax-data';
import { STATE_META } from '@/lib/data/income-tax-rates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StateCountySelectProps {
  selectedState: string;
  selectedCounty: string;
  onStateChange: (state: string, county: string, taxRate: number) => void;
}

const sortedStateCodes = Object.keys(STATE_META).sort((a, b) =>
  STATE_META[a].name.localeCompare(STATE_META[b].name)
);

export function StateCountySelect({
  selectedState,
  selectedCounty,
  onStateChange,
}: StateCountySelectProps) {
  const counties: County[] = useMemo(
    () => COUNTY_TAX_DATA[selectedState] ?? [],
    [selectedState]
  );

  const handleStateChange = useCallback(
    (stateCode: string) => {
      const stateCounties = COUNTY_TAX_DATA[stateCode] ?? [];
      const firstCounty = stateCounties[0];
      const rate = firstCounty?.rate ?? 0;
      const rateStr = rate.toFixed(2);
      onStateChange(stateCode, rateStr, rate);
    },
    [onStateChange]
  );

  const handleCountyChange = useCallback(
    (rateStr: string) => {
      const rate = parseFloat(rateStr);
      onStateChange(selectedState, rateStr, rate);
    },
    [selectedState, onStateChange]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div className="space-y-1.5">
        <Label>State</Label>
        <Select value={selectedState} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {sortedStateCodes.map((code) => (
              <SelectItem key={code} value={code}>
                {STATE_META[code].name} ({code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>County</Label>
        <Select value={selectedCounty} onValueChange={handleCountyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((county) => (
              <SelectItem key={county.name} value={county.rate.toFixed(2)}>
                {county.name} ({county.rate.toFixed(2)}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
