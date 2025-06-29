// src/lib/ai.ts
'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, FunctionDeclarationSchema } from '@google/generative-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// --- Initialize the Google Gemini client ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// --- Define the structure of our filter (Zod schema is correct) ---
const filterSchema = z.object({
  field: z.string().describe("The field to filter on, e.g., 'Duration' or 'PriorityLevel'"),
  operator: z.enum(['>', '<', '=', '>=', '<=', 'contains', 'not contains']).describe("The comparison operator"),
  value: z.union([z.string(), z.number()]).describe("The value to compare against"),
}).describe("A single filter condition");

const filtersSchema = z.object({
  filters: z.array(filterSchema).describe("An array of filter conditions to apply. Multiple filters imply an AND relationship."),
}).describe("A list of filters to apply to the data");

// Convert the Zod schema to a JSON schema without adding a top-level definition.
// We'll process the resulting schema for Google's specific requirements.
// Remove 'name' option to avoid the top-level $ref and definitions if possible,
// or ensure the specific definition is extracted.
const rawJsonSchema = zodToJsonSchema(filtersSchema, {
  target: "openApi3",
  // We explicitly handle additionalProperties removal in post-processing
  // so we can rely on zodToJsonSchema's default behavior, or if 'additionalProperties'
  // is not supported in the options, this prevents a TypeScript error.
});

// --- NEW STEP: Post-process the JSON Schema for Google Gemini API compatibility ---
function cleanSchemaForGemini(schema: Record<string, unknown>): Record<string, unknown> {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const cleanedSchema: Record<string, unknown> = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      if (key === 'additionalProperties' || key === 'patternProperties') {
        continue;
      }

      if (key === 'type' && Array.isArray(schema[key])) {
        cleanedSchema['anyOf'] = (schema[key] as unknown[]).map((type) => ({ type: type }));
        continue;
      }

      if (Array.isArray(schema[key])) {
        cleanedSchema[key] = (schema[key] as unknown[]).map((item) => cleanSchemaForGemini(item as Record<string, unknown>));
      } else if (typeof schema[key] === 'object') {
        cleanedSchema[key] = cleanSchemaForGemini(schema[key] as Record<string, unknown>);
      } else {
        cleanedSchema[key] = schema[key];
      }
    }
  }

  if (cleanedSchema.properties && !cleanedSchema.type) {
    cleanedSchema.type = 'object';
  }

  if (cleanedSchema.$ref && cleanedSchema.definitions) {
    const refKey = (cleanedSchema.$ref as string).split('/').pop();
    if (refKey && (cleanedSchema.definitions as Record<string, unknown>)[refKey]) {
      return cleanSchemaForGemini((cleanedSchema.definitions as Record<string, unknown>)[refKey] as Record<string, unknown>);
    }
  }

  return cleanedSchema;
}

// Clean the schema for Gemini compatibility
const parametersSchema: FunctionDeclarationSchema = cleanSchemaForGemini(rawJsonSchema) as unknown as FunctionDeclarationSchema;


// --- Main function to generate filters ---
export async function generateFiltersFromQuery(query: string, entityType: 'clients' | 'workers' | 'tasks') {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      tools: [
        {
          functionDeclarations: [
            {
              name: 'apply_filters',
              description: 'Apply the generated filters to the dataset.',
              parameters: parametersSchema, // Use the cleaned schema
            },
          ],
        },
      ],
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `You are an expert at converting natural language queries into structured JSON filters for a dataset of ${entityType}. The user will provide a query, and you must call the 'apply_filters' function with the correct filter conditions.

    Available fields for ${entityType}:
    - Clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs (array of strings), GroupTag
    - Workers: WorkerID, WorkerName, Skills (array of strings), AvailableSlots (array of numbers), MaxLoadPerPhase
    - Tasks: TaskID, TaskName, Category, Duration, RequiredSkills (array of strings), PreferredPhases (array of numbers/strings)
    
    Use the 'contains' operator for checking if an item exists in an array.
    
    User Query: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    const functionCall = response.functionCalls()?.[0];

    if (functionCall && functionCall.name === 'apply_filters') {
      const validatedArgs = filtersSchema.parse(functionCall.args);
      return { success: true, filters: validatedArgs.filters };
    } else {
      const textResponse = response.text();
      console.warn("AI did not return a function call, responded with:", textResponse);
      throw new Error(`AI did not return a valid function call. It may have tried to answer in plain text: "${textResponse.substring(0, 100)}..."`);
    }

  } catch (error) {
    console.error("Error generating filters from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown AI error occurred.";
    return { success: false, error: errorMessage };
  }
}