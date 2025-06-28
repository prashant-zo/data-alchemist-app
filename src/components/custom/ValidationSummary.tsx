// src/components/custom/ValidationSummary.tsx
'use client';

import React from 'react';
import { useDataStore } from '@/store/dataStore';
import { runValidators } from '@/lib/validators';
import { ValidationSummary as ValidationSummaryType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function ValidationSummary() {
  const clients = useDataStore((state) => state.clients);
  const workers = useDataStore((state) => state.workers);
  const tasks = useDataStore((state) => state.tasks);
  const validationSummary = useDataStore((state) => state.validationSummary);
  const setValidationSummary = useDataStore((state) => state.setValidationSummary);
  const setEntityErrors = useDataStore((state) => state.setEntityErrors);
  const clearAllErrors = useDataStore((state) => state.clearAllErrors);

  const handleRunValidation = () => {
    // 1. Clear all previous errors from the state
    clearAllErrors();
    
    // 2. Run the validators on the current data
    const allData = { clients, workers, tasks };
    const errors = runValidators(allData);

    // 3. Create the summary object to be displayed
    const summary: ValidationSummaryType = {
      totalErrors: errors.length,
      errorsByEntity: {
        clients: errors.filter(e => e.entityType === 'clients').length,
        workers: errors.filter(e => e.entityType === 'workers').length,
        tasks: errors.filter(e => e.entityType === 'tasks').length,
      },
      errorMessages: errors,
    };
    
    // 4. Update the store with the new summary. This makes the error list appear.
    setValidationSummary(summary);

    // 5. *** THIS IS THE CRITICAL FIX ***
    //    Iterate through the found errors and update the `_errors` property
    //    on each specific entity in the Zustand store.
    if (errors.length > 0) {
      // Group errors by a unique entity key (e.g., "client-C1") to update each entity just once
      const errorsToApply = new Map<string, { entityType: any, errors: any }>();

      errors.forEach(error => {
        const entityKey = `${error.entityType}-${error.entityId}`;
        // If we haven't seen this entity yet, initialize it in our map
        if (!errorsToApply.has(entityKey)) {
          errorsToApply.set(entityKey, { entityType: error.entityType, errors: {} });
        }
        // Add the specific field error to the entity's error object
        const existing = errorsToApply.get(entityKey)!;
        existing.errors[error.field] = error.message;
      });

      // Now, loop through our map and call the state update action for each entity that has errors
      errorsToApply.forEach((value, key) => {
        const [_, entityId] = key.split('-');
        setEntityErrors(value.entityType, entityId, value.errors);
      });
    }
  };

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>2. Validate Data</CardTitle>
        <CardDescription>
          Run checks across all datasets to find errors and inconsistencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRunValidation} disabled={!hasData}>Run Validation</Button>
        
        {validationSummary && (
          <div className="mt-6">
            {validationSummary.totalErrors === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <p className="font-semibold">All validations passed successfully!</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-semibold">Found {validationSummary.totalErrors} error(s).</p>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm max-h-40 overflow-y-auto">
                  {validationSummary.errorMessages.map((error, index) => (
                    <li key={index}>
                      <span className="font-semibold capitalize">{error.entityType.slice(0, -1)}</span>{' '}
                      (ID: <span className="font-mono">{error.entityId}</span>, Field:{' '}
                      <span className="font-mono">{error.field}</span>): {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}