// src/app/api/ai-filter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateFiltersFromQuery } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { query, entityType } = await request.json();

    if (!query || !entityType) {
      return NextResponse.json({ success: false, error: 'Query and entityType are required.' }, { status: 400 });
    }

    const result = await generateFiltersFromQuery(query, entityType);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}