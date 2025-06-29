// src/lib/parsers.ts
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Client, Worker, Task, EntityType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const getValue = (row: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return null;
};

const safeParseJson = (input: unknown): Record<string, unknown> => {
  if (!input) return {};
  if (typeof input === 'object') return input as Record<string, unknown>;
  
  try {
    const parsed = JSON.parse(String(input));
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return { _parseError: true, value: String(input) };
  }
};

const parseStringArray = (input: unknown): string[] => {
  if (!input) return [];
  return String(input).split(',').map(s => s.trim()).filter(Boolean);
};

const parseNumberArray = (input: unknown): number[] => {
  if (!input) return [];
  const cleanedInput = String(input).replace(/[\[\]]/g, '');
  return cleanedInput.split(',').map(s => parseInt(s.trim(), 10)).filter(num => !isNaN(num));
};

const parsePhaseArray = (input: unknown): (string | number)[] => {
    if (!input) return [];
    const strInput = String(input);
    if (strInput.includes('-')) {
        const parts = strInput.split('-');
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
    }
    return parseNumberArray(input);
};

export const parseClients = (data: Record<string, unknown>[]): Client[] => data.map((row, index) => ({
    _id: uuidv4(),
    ClientID: String(getValue(row, ['ClientID']) ?? `C${index + 1}`),
    ClientName: String(getValue(row, ['ClientName']) ?? ''),
    PriorityLevel: parseInt(String(getValue(row, ['PriorityLevel']) ?? '0'), 10),
    RequestedTaskIDs: parseStringArray(getValue(row, ['RequestedTaskIDs'])),
    GroupTag: String(getValue(row, ['GroupTag']) ?? ''),
    AttributesJSON: safeParseJson(getValue(row, ['AttributesJSON'])),
}));

export const parseWorkers = (data: Record<string, unknown>[]): Worker[] => data.map((row, index) => ({
    _id: uuidv4(),
    WorkerID: String(getValue(row, ['WorkerID']) ?? `W${index + 1}`),
    WorkerName: String(getValue(row, ['WorkerName']) ?? ''),
    Skills: parseStringArray(getValue(row, ['Skills'])),
    AvailableSlots: parseNumberArray(getValue(row, ['AvailableSlots'])),
    MaxLoadPerPhase: parseInt(String(getValue(row, ['MaxLoadPerPhase']) ?? '0'), 10),
    WorkerGroup: String(getValue(row, ['WorkerGroup']) ?? ''),
    QualificationLevel: String(getValue(row, ['QualificationLevel']) ?? ''),
}));

export const parseTasks = (data: Record<string, unknown>[]): Task[] => data.map((row, index) => ({
    _id: uuidv4(),
    TaskID: String(getValue(row, ['TaskID']) ?? `T${index + 1}`),
    TaskName: String(getValue(row, ['TaskName']) ?? ''),
    Category: String(getValue(row, ['Category']) ?? ''),
    Duration: parseInt(String(getValue(row, ['Duration']) || '1'), 10),
    RequiredSkills: parseStringArray(getValue(row, ['RequiredSkills'])),
    PreferredPhases: parsePhaseArray(getValue(row, ['PreferredPhases'])),
    MaxConcurrent: parseInt(String(getValue(row, ['MaxConcurrent']) || '1'), 10),
}));

const ENTITY_PARSERS: Record<EntityType, (data: Record<string, unknown>[]) => (Client[] | Worker[] | Task[])> = {
  clients: parseClients,
  workers: parseWorkers,
  tasks: parseTasks,
};

export const processFile = async (file: File, entityType: EntityType): Promise<Client[] | Worker[] | Task[]> => {
    let data: Record<string, unknown>[];
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      data = result.data as Record<string, unknown>[];
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    } else {
      throw new Error("Unsupported file type.");
    }
    // Filter out empty rows that papaparse might create
    const nonEmptyData = data.filter(row => Object.values(row).some(val => val !== null && val !== ''));
    return ENTITY_PARSERS[entityType](nonEmptyData);
};