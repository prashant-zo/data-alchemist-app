// src/components/custom/DataDisplayGrid.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useDataStore } from '@/store/dataStore';
import { EntityType, Client, Worker, Task, FilterCondition } from '@/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const columnConfig = {
  clients: [
    { header: 'Client ID', accessor: 'ClientID' },
    { header: 'Name', accessor: 'ClientName' },
    { header: 'Priority', accessor: 'PriorityLevel' },
    { header: 'Requested Tasks', accessor: 'RequestedTaskIDs' },
    { header: 'Attributes JSON', accessor: 'AttributesJSON' },
    { header: 'Group', accessor: 'GroupTag' },
  ],
  workers: [
    { header: 'Worker ID', accessor: 'WorkerID' },
    { header: 'Name', accessor: 'WorkerName' },
    { header: 'Skills', accessor: 'Skills' },
    { header: 'Available Slots', accessor: 'AvailableSlots' },
    { header: 'Max Load', accessor: 'MaxLoadPerPhase' },
  ],
  tasks: [
    { header: 'Task ID', accessor: 'TaskID' },
    { header: 'Name', accessor: 'TaskName' },
    { header: 'Duration', accessor: 'Duration' },
    { header: 'Required Skills', accessor: 'RequiredSkills' },
    { header: 'Preferred Phases', accessor: 'PreferredPhases' },
  ],
};

const getEntityKey = (item: Client | Worker | Task): string => {
  if ('ClientID' in item) return item.ClientID;
  if ('WorkerID' in item) return item.WorkerID;
  if ('TaskID' in item) return item.TaskID;
  return 'unknown-key';
};

const renderCellContent = (item: Record<string, unknown>, accessor: string) => {
  const value = item[accessor];
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
};

// Type guard for entities
function isEntity(item: unknown): item is Client | Worker | Task {
  return (
    typeof item === 'object' && item !== null &&
    (
      'ClientID' in item ||
      'WorkerID' in item ||
      'TaskID' in item
    )
  );
}

const applyFilters = <T extends Client | Worker | Task>(data: T[], filters: FilterCondition[]): T[] => {
  if (filters.length === 0) return data;
  return data.filter(item => {
    return filters.every(filter => {
      // @ts-expect-error: dynamic access
      const itemValue = item[filter.field];
      if (itemValue === undefined) return false;
      switch (filter.operator) {
        case '=': return itemValue == filter.value;
        case '>': return itemValue > filter.value;
        case '<': return itemValue < filter.value;
        case '>=': return itemValue >= filter.value;
        case '<=': return itemValue <= filter.value;
        case 'contains':
          if (Array.isArray(itemValue)) return itemValue.map(String).includes(String(filter.value));
          return String(itemValue).includes(String(filter.value));
        case 'not contains':
          if (Array.isArray(itemValue)) return !itemValue.map(String).includes(String(filter.value));
          return !String(itemValue).includes(String(filter.value));
        default: return true;
      }
    });
  });
};

// Helper function to safely check for errors with proper typing
const getFieldError = (item: Client | Worker | Task, field: string): string | undefined => {
  if (!item._errors) return undefined;
  if ('ClientID' in item) {
    return (item._errors as Record<keyof Omit<Client, '_id' | '_errors'>, string>)[field as keyof Omit<Client, '_id' | '_errors'>];
  }
  if ('WorkerID' in item) {
    return (item._errors as Record<keyof Omit<Worker, '_id' | '_errors'>, string>)[field as keyof Omit<Worker, '_id' | '_errors'>];
  }
  if ('TaskID' in item) {
    return (item._errors as Record<keyof Omit<Task, '_id' | '_errors'>, string>)[field as keyof Omit<Task, '_id' | '_errors'>];
  }
  return undefined;
};

function renderAttributesJSONCell(item: Record<string, unknown>) {
  const value = item.AttributesJSON;
  const error = getFieldError(item as unknown as Client | Worker | Task, 'AttributesJSON');
  let displayValue = '';

  if (typeof value === 'string') {
    displayValue = value;
  } else if (typeof value === 'object' && value !== null) {
    if ('_parseError' in value && (value as { _parseError?: boolean })._parseError) {
      displayValue = (value as { value?: string }).value || '';
    } else {
      displayValue = JSON.stringify(value);
    }
  }

  return (
    <div
      style={{
        background: error ? '#ffeaea' : undefined,
        color: error ? '#d32f2f' : undefined,
        borderRadius: error ? 4 : undefined,
        padding: error ? '2px 6px' : undefined,
      }}
    >
      {displayValue}
      {error && (
        <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 2 }}>
          {error}
        </div>
      )}
    </div>
  );
}

interface DataDisplayGridProps {
  entityType: EntityType;
  title: string;
}

export function DataDisplayGrid({ entityType, title }: DataDisplayGridProps) {
  const allData = useDataStore((state) => state[entityType]);
  const activeFilters = useDataStore((state) => state.activeFilters[entityType]);
  const setActiveFilters = useDataStore((state) => state.setActiveFilters);
  const clearFilters = useDataStore((state) => state.clearFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const filteredData = useMemo(() => {
    // Only filter if allData is an array of entities
    if (Array.isArray(allData) && allData.every(isEntity)) {
      return applyFilters(allData as (Client | Worker | Task)[], activeFilters);
    }
    return [];
  }, [allData, activeFilters]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/ai-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          entityType,
          data: allData,
        }),
      });

      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      if (result.filters && result.filters.length > 0) {
        setActiveFilters(entityType, result.filters);
        toast.success(`Applied ${result.filters.length} filter(s)`);
      } else {
        toast.info('No matching filters found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    clearFilters(entityType);
    setSearchQuery('');
    toast.success('Filters cleared');
  };
  
  if (allData.length === 0) return null;
  const columns = columnConfig[entityType];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {filteredData.length} of {allData.length} items
          {activeFilters.length > 0 && (
            <span className="text-blue-600"> (filtered)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Search with natural language..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          {activeFilters.length > 0 && (
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col: { header: string; accessor: string }) => (
                  <TableHead key={col.accessor} className="font-semibold">{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item._id || getEntityKey(item)}>
                    {columns.map((col: { header: string; accessor: string }) => {
                      if (entityType === 'clients' && col.accessor === 'AttributesJSON') {
                        return (
                          <TableCell 
                            key={`${item._id || getEntityKey(item)}-${col.accessor}`}
                          >
                            {renderAttributesJSONCell(item as unknown as Record<string, unknown>)}
                          </TableCell>
                        );
                      }
                      const hasError = getFieldError(item, col.accessor);
                      return (
                        <TableCell 
                          key={`${item._id || getEntityKey(item)}-${col.accessor}`}
                          className={`relative ${hasError ? 'bg-red-50 border-red-200' : ''}`}
                        >
                          <div className={hasError ? 'text-red-700' : ''}>
                            {renderCellContent(item as unknown as Record<string, unknown>, col.accessor)}
                          </div>
                          {hasError && (
                            <div className="text-red-600 text-xs mt-1 font-medium">
                              ⚠️ {hasError}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No data to display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}