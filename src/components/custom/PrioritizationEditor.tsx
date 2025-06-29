// src/components/custom/PrioritizationEditor.tsx
'use client';

import React from 'react';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PrioritizationEditor() {
  const weights = useDataStore((state) => state.prioritizationWeights);
  const setPrioritizationWeights = useDataStore((state) => state.setPrioritizationWeights);
  const resetPrioritizationWeights = useDataStore((state) => state.resetPrioritizationWeights);

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setPrioritizationWeights({ [key]: value[0] });
  };

  const handleReset = () => {
    resetPrioritizationWeights();
    toast.info("Prioritization weights have been reset to default.");
  };

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-md">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
        <CardTitle className="leading-none font-semibold">4. Set Prioritization & Weights</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">Adjust the sliders to define the importance of different allocation criteria.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="priorityLevel" className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-semibold">
              Client Priority Weight
            </Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.priorityLevel.toFixed(1)}</span>
          </div>
          <Slider
            id="priorityLevel"
            min={0}
            max={2}
            step={0.1}
            value={[weights.priorityLevel]}
            onValueChange={(value) => handleWeightChange('priorityLevel', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">How much to prioritize high-priority clients (1-5 scale). Higher weight means satisfying a client with PriorityLevel=5 is much more important.</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="fulfillment" className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-semibold">
              Task Fulfillment Weight
            </Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.requestedTaskFulfillment.toFixed(1)}</span>
          </div>
          <Slider
            id="fulfillment"
            min={0}
            max={2}
            step={0.1}
            value={[weights.requestedTaskFulfillment]}
            onValueChange={(value) => handleWeightChange('requestedTaskFulfillment', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">How important it is to complete all tasks a client has requested.</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="fairness" className="flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-semibold">
              Fairness Weight
            </Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.fairness.toFixed(1)}</span>
          </div>
          <Slider
            id="fairness"
            min={0}
            max={2}
            step={0.1}
            value={[weights.fairness]}
            onValueChange={(value) => handleWeightChange('fairness', value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">How much to spread tasks evenly among workers vs. loading up the most qualified ones.</p>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleReset}
            variant="outline"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}