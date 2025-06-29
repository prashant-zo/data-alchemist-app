// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/lib/parsers';
import { EntityType } from '@/types';

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

    const transformedData = await processFile(file, entityType);

    return NextResponse.json({ 
      data: transformedData,
      count: transformedData.length 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: errorMessage }, 
      { status: 500 }
    );
  }
}