// src/app/(main)/page.tsx
'use client';

import { FileUploader } from "@/components/custom/FileUploader";
import { DataDisplayGrid } from "@/components/custom/DataDisplayGrid";
import { ValidationSummary } from "@/components/custom/ValidationSummary";
import { RuleBuilder } from "@/components/custom/RuleBuilder"; 
import { PrioritizationEditor } from "@/components/custom/PrioritizationEditor"; 
import { ExportControls } from "@/components/custom/ExportControls";


export default function HomePage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Data Alchemist</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Forge order out of spreadsheet chaos. Upload your data to begin.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-12">
        <section className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Upload Data</h2>
          <div className="space-y-6 pt-4">
            <FileUploader entityType="clients" title="Clients" />
            <FileUploader entityType="workers" title="Workers" />
            <FileUploader entityType="tasks" title="Tasks" />
          </div>
        </section>

        <section>
          <ValidationSummary />
        </section>

        {/* --- RULE BUILDER SECTION --- */}
        <section>
          <RuleBuilder />
        </section>

        <section>
          <PrioritizationEditor />
        </section>

        <section>
          <ExportControls />
        </section>

        <section className="space-y-8">
          <DataDisplayGrid entityType="clients" title="Clients" />
          <DataDisplayGrid entityType="workers" title="Workers" />
          <DataDisplayGrid entityType="tasks" title="Tasks" />
        </section>
      </main>
    </div>
  );
}