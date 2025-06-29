// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, parseXLSX } from '@/lib/parsers';
import { Client, Worker, Task, EntityType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as EntityType;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!entityType) {
      return NextResponse.json({ error: 'No entity type provided' }, { status: 400 });
    }

    let parsedData: any[] = [];

    if (file.name.endsWith('.csv')) {
      const csvText = await file.text();
      parsedData = parseCSV(csvText);
    } else if (file.name.endsWith('.xlsx')) {
      const arrayBuffer = await file.arrayBuffer();
      parsedData = parseXLSX(arrayBuffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // --- CRITICAL FIX: Proper Data Transformation ---
    const transformedData = parsedData.map((row: any, index) => {
      const baseItem = {
        _id: `${entityType}-${index + 1}`, // Ensure unique React key
      };

      switch (entityType) {
        case 'clients':
          // --- FIXED: JSON Validation for AttributesJSON ---
          let attributesJSON = row.AttributesJSON || row['Attributes JSON'] || row.attributesjson || '{}';
          let jsonParseError = false;
          
          // Try to parse JSON and set error flag if invalid
          try {
            if (typeof attributesJSON === 'string' && attributesJSON.trim() !== '') {
              JSON.parse(attributesJSON);
            }
          } catch (error) {
            jsonParseError = true;
          }

          return {
            ...baseItem,
            ClientID: String(row.ClientID || row['Client ID'] || row.clientid || `C${index + 1}`),
            ClientName: String(row.ClientName || row['Client Name'] || row.clientname || ''),
            PriorityLevel: Number(row.PriorityLevel || row['Priority Level'] || row.prioritylevel || 1),
            RequestedTaskIDs: Array.isArray(row.RequestedTaskIDs) 
              ? row.RequestedTaskIDs 
              : String(row.RequestedTaskIDs || row['Requested Task IDs'] || row.requestedtaskids || '')
                .split(',')
                .map((id: string) => id.trim())
                .filter((id: string) => id.length > 0),
            GroupTag: String(row.GroupTag || row['Group Tag'] || row.grouptag || ''),
            AttributesJSON: jsonParseError ? { _parseError: true, value: attributesJSON } : attributesJSON,
          } as Client;

        case 'workers':
          return {
            ...baseItem,
            WorkerID: String(row.WorkerID || row['Worker ID'] || row.workerid || `W${index + 1}`),
            WorkerName: String(row.WorkerName || row['Worker Name'] || row.workername || ''),
            Skills: Array.isArray(row.Skills) 
              ? row.Skills 
              : String(row.Skills || row.skills || '')
                .split(',')
                .map((skill: string) => skill.trim())
                .filter((skill: string) => skill.length > 0),
            AvailableSlots: Array.isArray(row.AvailableSlots) 
              ? row.AvailableSlots.map(Number)
              : String(row.AvailableSlots || row['Available Slots'] || row.availableslots || '')
                .split(',')
                .map((slot: string) => Number(slot.trim()))
                .filter((slot: number) => !isNaN(slot)),
            MaxLoadPerPhase: Number(row.MaxLoadPerPhase || row['Max Load Per Phase'] || row.maxloadperphase || 1),
            WorkerGroup: String(row.WorkerGroup || row['Worker Group'] || row.workergroup || ''),
            QualificationLevel: String(row.QualificationLevel || row['Qualification Level'] || row.qualificationlevel || ''),
          } as Worker;

        case 'tasks':
          return {
            ...baseItem,
            TaskID: String(row.TaskID || row['Task ID'] || row.taskid || `T${index + 1}`),
            TaskName: String(row.TaskName || row['Task Name'] || row.taskname || ''),
            Category: String(row.Category || row.category || ''),
            Duration: Number(row.Duration || row.duration || 1),
            RequiredSkills: Array.isArray(row.RequiredSkills) 
              ? row.RequiredSkills 
              : String(row.RequiredSkills || row['Required Skills'] || row.requiredskills || '')
                .split(',')
                .map((skill: string) => skill.trim())
                .filter((skill: string) => skill.length > 0),
            PreferredPhases: Array.isArray(row.PreferredPhases) 
              ? row.PreferredPhases 
              : String(row.PreferredPhases || row['Preferred Phases'] || row.preferredphases || '')
                .split(',')
                .map((phase: string) => {
                  const trimmed = phase.trim();
                  return isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
                })
                .filter((phase: any) => phase !== ''),
            MaxConcurrent: Number(row.MaxConcurrent || row['Max Concurrent'] || row.maxconcurrent || 1),
          } as Task;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    });

    return NextResponse.json({ 
      data: transformedData,
      count: transformedData.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' }, 
      { status: 500 }
    );
  }
}