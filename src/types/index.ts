// src/types/index.ts

// --- Core Data Entities ---
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; 
  RequestedTaskIDs: string[]; 
  GroupTag: string;
  AttributesJSON: Record<string, unknown>; 
  _id?: string;
  _errors?: Record<string, string>;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[]; 
  AvailableSlots: number[]; 
  MaxLoadPerPhase: number; 
  WorkerGroup: string;
  QualificationLevel: string; 
  _id?: string;
  _errors?: Record<string, string>;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number; 
  RequiredSkills: string[]; 
  PreferredPhases: (string | number)[];
  MaxConcurrent: number; 
  _id?: string;
  _errors?: Record<string, string>;
}

// --- Helper Types ---
export type EntityType = 'clients' | 'workers' | 'tasks';

export interface DataBundle {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
}

export interface FilterCondition {
  field: string;
  operator: '>' | '<' | '=' | '>=' | '<=' | 'contains' | 'not contains';
  value: string | number;
}


// --- Validation Types ---
export interface ValidationError {
  entityType: EntityType;
  entityId: string;
  field: string; 
  message: string;
}

export interface ValidationSummary {
  totalErrors: number;
  errorsByEntity: {
    clients: number;
    workers: number;
    tasks: number;
  };
  errorMessages: ValidationError[];
}


// ---------------
// Rule Types (Your Corrected, Superior Structure)
// ---------------

export type RuleType = 'coRun' | 'slotRestriction' | 'loadLimit';

export interface BaseRule {
  id: string;
  type: RuleType;
  description: string;
}

export interface CoRunRule extends BaseRule {
  type: "coRun";
  tasks: string[];
}

export interface SlotRestrictionRule extends BaseRule {
  type: "slotRestriction";
  groupType: "client" | "worker";
  groupName: string;
  minCommonSlots: number;
}

// Your excellent, consistent LoadLimitRule
export interface LoadLimitRule extends BaseRule {
  type: "loadLimit";
  groupType: "worker";
  groupName: string;
  maxSlotsPerPhase: number;
}

export type BusinessRule = CoRunRule | SlotRestrictionRule | LoadLimitRule;


// --- Prioritization & AI Types ---
export interface PrioritizationWeights {
  [key: string]: number;
  priorityLevel: number;
  requestedTaskFulfillment: number;
  fairness: number;
}

export const DEFAULT_PRIORITIZATION_WEIGHTS: PrioritizationWeights = {
  priorityLevel: 1.0,
  requestedTaskFulfillment: 1.0,
  fairness: 0.5,
};

export interface AiFilteredIds {
  clients: string[];
  workers: string[];
  tasks: string[];
}