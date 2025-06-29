    // src/components/custom/ValidationSummary.tsx
    'use client';

    import React from 'react';
    import { useDataStore } from '@/store/dataStore';
    import { runValidators } from '@/lib/validators';
    import { ValidationSummary as ValidationSummaryType } from '@/types';
    import { EntityType } from '@/types';
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
        // Clear any existing errors first
        clearAllErrors();
        
        // Run validation on all data
        const allData = { clients, workers, tasks };
        const errors = runValidators(allData);

        // Build summary for display
        const summary: ValidationSummaryType = {
        totalErrors: errors.length,
        errorsByEntity: {
            clients: errors.filter(e => e.entityType === 'clients').length,
            workers: errors.filter(e => e.entityType === 'workers').length,
            tasks: errors.filter(e => e.entityType === 'tasks').length,
        },
        errorMessages: errors,
        };
        
        // Update the store with validation results
        setValidationSummary(summary);

        // Apply errors to individual entities for highlighting
        if (errors.length > 0) {
        const errorsToApply = new Map<string, { entityType: string, errors: Record<string, string> }>();

        errors.forEach(error => {
            const entityKey = `${error.entityType}-${error.entityId}`;
            if (!errorsToApply.has(entityKey)) {
            errorsToApply.set(entityKey, { entityType: error.entityType, errors: {} });
            }
            const existing = errorsToApply.get(entityKey)!;
            existing.errors[error.field] = error.message;
        });

        // Update each entity with its specific errors
        errorsToApply.forEach((value, key) => {
            const entityId = key.split('-')[1];
            setEntityErrors(value.entityType as EntityType, entityId, value.errors);
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