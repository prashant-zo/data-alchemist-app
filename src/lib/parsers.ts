// src/lib/parsers.ts
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseCSV(csvText: string): any[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => {
      // Handle empty strings and convert to appropriate types
      if (value === '' || value === null || value === undefined) {
        return '';
      }
      return value;
    }
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data;
}

export function parseXLSX(arrayBuffer: ArrayBuffer): any[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with proper header handling
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  });

  if (jsonData.length === 0) {
    return [];
  }

  // Extract headers from first row
  const headers = jsonData[0] as string[];
  const dataRows = jsonData.slice(1);

  // Convert to array of objects
  return dataRows.map((row: any) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        // Clean up header names and handle various formats
        const cleanHeader = header.toString().trim();
        obj[cleanHeader] = row[index];
      }
    });
    return obj;
  });
}

// Helper function to safely convert values
export function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function safeArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  
  const str = String(value).trim();
  if (str === '') return [];
  
  return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
}