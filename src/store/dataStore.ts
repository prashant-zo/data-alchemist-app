// src/store/dataStore.ts
import { create } from 'zustand';
import {
  Client,
  Worker,
  Task,
  EntityType,
  ValidationSummary,
  BusinessRule,
  PrioritizationWeights,
  DEFAULT_PRIORITIZATION_WEIGHTS,
  AiFilteredIds,
  FilterCondition,
} from '@/types';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';

interface AppState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  isLoading: { clients: boolean; workers: boolean; tasks: boolean; };
  fileErrors: { clients: string | null; workers: string | null; tasks: string | null; };
  validationSummary: ValidationSummary | null;
  rules: BusinessRule[];
  prioritizationWeights: PrioritizationWeights;
  naturalLanguageQuery: string;
  aiFilteredIds: AiFilteredIds | null;
  isAiFiltering: boolean;
  activeFilters: {
    clients: FilterCondition[];
    workers: FilterCondition[];
    tasks: FilterCondition[];
  };
}

interface AppActions {
  setData: (entityType: EntityType, data: unknown[], fileError?: string | null) => void;
  setLoading: (entityType: EntityType, isLoading: boolean) => void;
  updateClient: (clientId: string, updatedFields: Partial<Client>) => void;
  updateWorker: (workerId: string, updatedFields: Partial<Worker>) => void;
  updateTask: (taskId: string, updatedFields: Partial<Task>) => void;
  setValidationSummary: (summary: ValidationSummary | null) => void;
  setEntityErrors: (entityType: EntityType, entityId: string, errors: Record<string, string> | undefined) => void;
  clearAllErrors: () => void;
  addRule: (rule: BusinessRule) => void;
  updateRule: (ruleId: string, updatedFields: Partial<BusinessRule>) => void;
  deleteRule: (ruleId: string) => void;
  setPrioritizationWeights: (weights: Partial<PrioritizationWeights>) => void;
  resetPrioritizationWeights: () => void;
  setNaturalLanguageQuery: (query: string) => void;
  setAiFilteredIds: (ids: AiFilteredIds | null) => void;
  setIsAiFiltering: (isFiltering: boolean) => void;
  resetStore: () => void;
  setActiveFilters: (entityType: EntityType, filters: FilterCondition[]) => void;
  clearFilters: (entityType: EntityType) => void;
}

const initialState: AppState = {
  clients: [],
  workers: [],
  tasks: [],
  isLoading: { clients: false, workers: false, tasks: false },
  fileErrors: { clients: null, workers: null, tasks: null },
  validationSummary: null,
  rules: [],
  prioritizationWeights: DEFAULT_PRIORITIZATION_WEIGHTS,
  naturalLanguageQuery: "",
  aiFilteredIds: null,
  isAiFiltering: false,
  activeFilters: { 
    clients: [],
    workers: [],
    tasks: [],
  },
};

export const useDataStore = create<AppState & AppActions>()(
  immer((set) => ({
    ...initialState,

    setData: (entityType, data: unknown[], fileError = null) => { 
      set((state: WritableDraft<AppState>) => { 
        if (entityType === 'clients') {
          state[entityType] = data as Client[];
        } else if (entityType === 'workers') {
          state[entityType] = data as Worker[];
        } else if (entityType === 'tasks') {
          state[entityType] = data as Task[];
        }
        state.fileErrors[entityType] = fileError; 
        state.isLoading[entityType] = false; 
        state.validationSummary = null; 
        state.activeFilters[entityType] = []; 
      }); 
    },
    
    setLoading: (entityType, isLoading) => { 
      set((state) => { 
        state.isLoading[entityType] = isLoading; 
      }); 
    },
    
    updateClient: (clientId, updatedFields) => { 
      set((state) => { 
        const clientIndex = state.clients.findIndex((c: Client) => (c._id || c.ClientID) === clientId); 
        if (clientIndex !== -1) { 
          state.clients[clientIndex] = { ...state.clients[clientIndex], ...updatedFields }; 
        } 
      }); 
    },
    
    updateWorker: (workerId, updatedFields) => { 
      set((state) => { 
        const workerIndex = state.workers.findIndex((w: Worker) => (w._id || w.WorkerID) === workerId); 
        if (workerIndex !== -1) { 
          state.workers[workerIndex] = { ...state.workers[workerIndex], ...updatedFields }; 
        } 
      }); 
    },
    
    updateTask: (taskId, updatedFields) => { 
      set((state) => { 
        const taskIndex = state.tasks.findIndex((t: Task) => (t._id || t.TaskID) === taskId); 
        if (taskIndex !== -1) { 
          state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updatedFields }; 
        } 
      }); 
    },
    
    setValidationSummary: (summary) => { 
      set((state) => { 
        state.validationSummary = summary; 
      }); 
    },
    
    setEntityErrors: (entityType, entityId, errors: Record<string, string> | undefined) => { 
      set(state => { 
        const idKeyMap = {
          clients: 'ClientID',
          workers: 'WorkerID', 
          tasks: 'TaskID'
        };
        const idKey = idKeyMap[entityType];
        const list = state[entityType] as (Client[] | Worker[] | Task[]); 
        const itemIndex = list.findIndex(item => { 
          const itemPublicId = (item as unknown as Record<string, unknown>)[idKey] as string; 
          return String(itemPublicId).trim() === String(entityId).trim(); 
        }); 
        if (itemIndex !== -1) { 
          (list[itemIndex] as unknown as Record<string, unknown>)._errors = errors; 
        } else { 
          console.error(`Failed to find item with ID '${entityId}' in ${entityType}`); 
        } 
      }); 
    },
    
    clearAllErrors: () => { 
      set(state => { 
        state.validationSummary = null; 
        state.clients.forEach((c: Client) => c._errors = undefined); 
        state.workers.forEach((w: Worker) => w._errors = undefined); 
        state.tasks.forEach((t: Task) => t._errors = undefined); 
        state.fileErrors = { clients: null, workers: null, tasks: null }; 
      }); 
    },

    addRule: (rule) => {
      set((state) => {
        state.rules.push(rule);
      });
    },
    
    updateRule: (ruleId, updatedFields) => {
      set((state) => {
        const ruleIndex = state.rules.findIndex((r: BusinessRule) => r.id === ruleId);
        if (ruleIndex !== -1) {
          state.rules[ruleIndex] = { ...state.rules[ruleIndex], ...updatedFields } as BusinessRule;
        }
      });
    },
    
    deleteRule: (ruleId) => {
      set((state) => {
        state.rules = state.rules.filter((r: BusinessRule) => r.id !== ruleId);
      });
    },
    
    setPrioritizationWeights: (weights) => {
      set((state) => {
        for (const key in weights) {
          if (Object.prototype.hasOwnProperty.call(weights, key)) {
            const typedKey = key as keyof PrioritizationWeights;
            const value = weights[typedKey];
            if (value !== undefined) {
              state.prioritizationWeights[typedKey] = value;
            }
          }
        }
      });
    },
    
    resetPrioritizationWeights: () => {
      set(state => {
        state.prioritizationWeights = DEFAULT_PRIORITIZATION_WEIGHTS;
      });
    },
    
    setActiveFilters: (entityType, filters) => {
      set(state => {
        state.activeFilters[entityType] = filters;
      });
    },
    
    clearFilters: (entityType) => {
      set(state => {
        state.activeFilters[entityType] = [];
      });
    },

    setNaturalLanguageQuery: (query) => { 
      set(state => { 
        state.naturalLanguageQuery = query; 
      }); 
    },
    
    setAiFilteredIds: (ids) => { 
      set(state => { 
        state.aiFilteredIds = ids; 
      }); 
    },
    
    setIsAiFiltering: (isFiltering) => { 
      set(state => { 
        state.isAiFiltering = isFiltering; 
      }); 
    },

    resetStore: () => {
      set(initialState);
    },
  }))
);
