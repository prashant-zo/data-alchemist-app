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
  // *** THE FIX: SELECT EACH PIECE OF STATE INDIVIDUALLY ***
  // This is the robust pattern that prevents infinite re-renders.
  const clients = useDataStore((state) => state.clients);
  const workers = useDataStore((state) => state.workers);
  const tasks = useDataStore((state) => state.tasks);
  const rules = useDataStore((state) => state.rules);
  const prioritizationWeights = useDataStore((state) => state.prioritizationWeights);

  const handleExport = () => {
    // --- 1. Prepare and Download rules.json ---
    const exportConfig = {
      rules: rules,
      prioritization: prioritizationWeights,
    };
    const jsonContent = JSON.stringify(exportConfig, null, 2);
    triggerDownload(jsonContent, 'rules.json', 'application/json');

    // --- 2. Prepare and Download cleaned data files ---
    // Remove our internal properties (_id, _errors) before exporting
    const cleanData = (data: any[]) => data.map(({ _id, _errors, ...rest }) => rest);

    const clientsForCsv = cleanData(clients).map(c => ({
      ...c,
      RequestedTaskIDs: c.RequestedTaskIDs.join(','),
      AttributesJSON: JSON.stringify(c.AttributesJSON),
    }));
    
    const workersForCsv = cleanData(workers).map(w => ({
        ...w,
        Skills: w.Skills.join(','),
        AvailableSlots: `[${w.AvailableSlots.join(',')}]`,
    }));
    
    const tasksForCsv = cleanData(tasks).map(t => ({
        ...t,
        RequiredSkills: t.RequiredSkills.join(','),
        PreferredPhases: `[${t.PreferredPhases.join(',')}]`,
    }));
    
    triggerDownload(Papa.unparse(clientsForCsv), 'clients_cleaned.csv', 'text/csv;charset=utf-8;');
    triggerDownload(Papa.unparse(workersForCsv), 'workers_cleaned.csv', 'text/csv;charset=utf-8;');
    triggerDownload(Papa.unparse(tasksForCsv), 'tasks_cleaned.csv', 'text/csv;charset=utf-8;');
    
    toast.success("All files exported successfully!");
  };

  const isDataReadyForExport = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <Card className="shadow-md bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle>5. Export Configuration</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Download your cleaned data and the generated `rules.json` file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          size="lg" 
          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          onClick={handleExport}
          disabled={!isDataReadyForExport}
        >
          <Download className="mr-2 h-5 w-5" />
          Export All Files
        </Button>
      </CardContent>
    </Card>
  );
}