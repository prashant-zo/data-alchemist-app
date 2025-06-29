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
  // Get the weights and the update actions from the store
  const weights = useDataStore((state) => state.prioritizationWeights);
  const setPrioritizationWeights = useDataStore((state) => state.setPrioritizationWeights);
  const resetPrioritizationWeights = useDataStore((state) => state.resetPrioritizationWeights);

  // A helper function to handle slider changes and update the store
  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setPrioritizationWeights({ [key]: value[0] });
  };

  const handleReset = () => {
    resetPrioritizationWeights();
    toast.info("Prioritization weights have been reset to default.");
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>4. Set Prioritization & Weights</CardTitle>
        <CardDescription>
          Adjust the sliders to define the importance of different allocation criteria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Slider for Client Priority Level */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="priorityLevel" className="font-semibold">Client Priority Weight</Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.priorityLevel.toFixed(1)}</span>
          </div>
          <Slider
            id="priorityLevel"
            value={[weights.priorityLevel]}
            onValueChange={(value) => handleWeightChange('priorityLevel', value)}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground">
            How much to prioritize high-priority clients (1-5 scale). Higher weight means satisfying a client with PriorityLevel=5 is much more important.
          </p>
        </div>

        {/* Slider for Task Fulfillment */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="fulfillment" className="font-semibold">Task Fulfillment Weight</Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.requestedTaskFulfillment.toFixed(1)}</span>
          </div>
          <Slider
            id="fulfillment"
            value={[weights.requestedTaskFulfillment]}
            onValueChange={(value) => handleWeightChange('requestedTaskFulfillment', value)}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground">
            How important it is to complete all tasks a client has requested.
          </p>
        </div>

        {/* Slider for Fairness */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="fairness" className="font-semibold">Fairness Weight</Label>
            <span className="text-sm font-medium text-muted-foreground w-12 text-center">{weights.fairness.toFixed(1)}</span>
          </div>
          <Slider
            id="fairness"
            value={[weights.fairness]}
            onValueChange={(value) => handleWeightChange('fairness', value)}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground">
            How much to spread tasks evenly among workers vs. loading up the most qualified ones.
          </p>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}