// src/components/custom/ExportControls.tsx
'use client';

import React from 'react';
import { useDataStore } from '@/store/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { triggerDownload } from '@/lib/utils';
import Papa from 'papaparse';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function ExportControls() {
  // Get data from store
  const clients = useDataStore((state) => state.clients);
  const workers = useDataStore((state) => state.workers);
  const tasks = useDataStore((state) => state.tasks);
  const rules = useDataStore((state) => state.rules);
  const prioritizationWeights = useDataStore((state) => state.prioritizationWeights);

  const handleExport = () => {
    try {
      // Prepare data for CSV export with human-readable _errors
      const serializeErrors = (row: { _errors?: Record<string, string> }) => {
        if (!row._errors) return '';
        return Object.entries(row._errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; ');
      };
      const prepareForExport = <T extends { _errors?: Record<string, string> }>(rows: T[]) =>
        rows.map(row => ({
          ...row,
          _errors: serializeErrors(row),
        }));

      const clientsCsv = Papa.unparse(prepareForExport(clients));
      const workersCsv = Papa.unparse(prepareForExport(workers));
      const tasksCsv = Papa.unparse(prepareForExport(tasks));

      // Export JSON config
      const config = {
        rules,
        prioritizationWeights,
        exportDate: new Date().toISOString(),
      };

      // Download files
      triggerDownload(clientsCsv, 'clients_cleaned.csv', 'text/csv');
      triggerDownload(workersCsv, 'workers_cleaned.csv', 'text/csv');
      triggerDownload(tasksCsv, 'tasks_cleaned.csv', 'text/csv');
      triggerDownload(JSON.stringify(config, null, 2), 'rules.json', 'application/json');

      toast.success('All files exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <Card className="flex flex-col gap-6 rounded-xl border py-6 shadow-md bg-primary text-primary-foreground">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
        <CardTitle className="leading-none font-semibold">5. Export Configuration</CardTitle>
        <CardDescription className="text-sm text-primary-foreground/80">
          Download your cleaned data and the generated `rules.json` file.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Button
          onClick={handleExport}
          disabled={!hasData}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-10 rounded-md px-6 has-[>svg]:px-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Download className="mr-2 h-5 w-5" />
          Export All Files
        </Button>
      </CardContent>
    </Card>
  );
}