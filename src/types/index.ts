// Core Data Entities

export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; 
  RequestedTaskIDs: string[]; 
  GroupTag: string;
  AttributesJSON: Record<string, any>; 
  _id?: string; // A unique ID for React keys
  _errors?: Record<keyof Omit<Client, '_id' | '_errors'>, string>; // To store validation errors per field
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
  _errors?: Record<keyof Omit<Worker, '_id' | '_errors'>, string>;
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
  _errors?: Record<keyof Omit<Task, '_id' | '_errors'>, string>;
}

// Helper Types for State Management
export type EntityType = 'clients' | 'workers' | 'tasks';

export interface DataBundle {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
}

// Validation Types
export interface ValidationError {
  entityType: EntityType;
  entityId: string;
  field: string; 
  message: string;
  isGlobal?: boolean; // For errors not tied to a specific field but to the entity or file
}

// To represent the validation status summary
export interface ValidationSummary {
  totalErrors: number;
  errorsByEntity: {
    clients: number;
    workers: number;
    tasks: number;
  };
  errorMessages: ValidationError[]; // Detailed list of errors
}


// Rule Types (We'll expand this for Milestone 2)
export interface BaseRule {
  id: string; 
  type: string;
  // We can add a user-defined name or description for the rule
  description?: string; 
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

// Add other rule types as needed from the assignment...
// e.g. LoadLimitRule, PhaseWindowRule, PatternMatchRule, PrecedenceOverrideRule

export type BusinessRule = 
  | CoRunRule 
  | SlotRestrictionRule;
  // | LoadLimitRule ... (add others when we build them)


// Prioritization Types (For Milestone 2)
export interface PrioritizationWeights {
  priorityLevel: number; // Weight for Client.PriorityLevel
  requestedTaskFulfillment: number; // Weight for fulfilling RequestedTaskIDs
  fairness: number; // Weight for fairness constraints (if applicable)
  // Add more as needed based on assignment details for prioritization
  [key: string]: number; // Allow for dynamic weights
}

export const DEFAULT_PRIORITIZATION_WEIGHTS: PrioritizationWeights = {
  priorityLevel: 1.0,
  requestedTaskFulfillment: 1.0,
  fairness: 0.5,
};

// For AI Interaction (Can be expanded)
export interface AiFilteredIds {
  clients: string[];
  workers: string[];
  tasks: string[];
}

export interface FilterCondition {
  field: string;
  operator: '>' | '<' | '=' | '>=' | '<=' | 'contains' | 'not contains';
  value: string | number;
}
