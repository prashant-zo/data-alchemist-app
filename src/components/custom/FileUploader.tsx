// src/components/custom/FileUploader.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useDataStore } from '@/store/dataStore';
import { EntityType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, FileUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface FileUploaderProps {
  entityType: EntityType;
  title: string;
}

export function FileUploader({ entityType, title }: FileUploaderProps) {
  const setData = useDataStore((state) => state.setData);
  const fileErrors = useDataStore((state) => state.fileErrors[entityType]);
  const hasData = useDataStore((state) => state[entityType].length > 0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChangeAndSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    const formData = new FormData(formRef.current!);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file.');
      }

      setData(entityType, result.data, null);
      toast.success("Success!", { description: result.message });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setData(entityType, [], errorMessage);
      toast.error(`Error loading ${title}`, { description: errorMessage });
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
      setFileName(null);
    }
  };

  return (
    <form ref={formRef} className="w-full">
      <input type="hidden" name="entityType" value={entityType} />

      <Label className="text-lg font-semibold">{title}</Label>
      <div className="mt-2 flex items-center space-x-4 p-4 border-2 border-dashed rounded-lg">
        <div className="flex-shrink-0">
          {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : fileErrors ? <AlertTriangle className="h-8 w-8 text-destructive" /> : hasData ? <CheckCircle className="h-8 w-8 text-green-500" /> : <FileUp className="h-8 w-8 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{fileName || `Upload ${title} Data`}</p>
          <p className="text-xs text-muted-foreground">{fileErrors ? <span className="text-destructive">{fileErrors}</span> : 'CSV or XLSX file'}</p>
        </div>
        <div className="flex-shrink-0">
          <Label 
            htmlFor={`file-upload-${entityType}`}
            className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : 'Upload'}
          </Label>
          <Input 
            id={`file-upload-${entityType}`}
            name="file"
            type="file" 
            className="hidden" 
            onChange={handleFileChangeAndSubmit} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            disabled={isLoading}
          />
        </div>
      </div>
    </form>
  );
}