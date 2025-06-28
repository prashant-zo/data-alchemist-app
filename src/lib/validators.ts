// src/lib/validators.ts
import { DataBundle, ValidationError, Client, Worker, Task, EntityType } from '@/types';

// This will be our main validation function
export const runValidators = (data: DataBundle): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { clients, workers, tasks } = data;

  // --- Helper Sets for quick lookups ---
  const clientIDs = new Set(clients.map(c => c.ClientID));
  const workerIDs = new Set(workers.map(w => w.WorkerID));
  const taskIDs = new Set(tasks.map(t => t.TaskID));

  // --- Validator 1: Duplicate IDs ---
  // We create a generic function that correctly types the item and the key.
  // K extends keyof T ensures that idKey is a valid key of the items in the array.
  const findDuplicates = <T extends { [key in K]: string }, K extends string>(
    items: T[],
    idKey: K,
    entityType: EntityType
  ) => {
    const seen = new Set<string>();
    for (const item of items) {
      const id = item[idKey]; // This is now type-safe
      if (id && seen.has(id)) { // Check if id is not empty
        errors.push({
          entityType,
          entityId: id,
          field: idKey,
          message: `Duplicate ID found: ${id}.`,
        });
      }
      if (id) {
        seen.add(id);
      }
    }
  };

  findDuplicates(clients, 'ClientID', 'clients');
  findDuplicates(workers, 'WorkerID', 'workers');
  findDuplicates(tasks, 'TaskID', 'tasks');


  // --- Validator 2: Out-of-range values ---
  clients.forEach(client => {
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({
        entityType: 'clients',
        entityId: client.ClientID,
        field: 'PriorityLevel',
        message: `PriorityLevel must be between 1 and 5, but is ${client.PriorityLevel}.`
      });
    }
  });

  tasks.forEach(task => {
    if (task.Duration < 1) {
      errors.push({
        entityType: 'tasks',
        entityId: task.TaskID,
        field: 'Duration',
        message: `Duration must be at least 1, but is ${task.Duration}.`
      });
    }
  });
  
  // --- Validator 3: Broken JSON in AttributesJSON ---
  clients.forEach(client => {
    if (client.AttributesJSON && client.AttributesJSON._parseError) {
        errors.push({
            entityType: 'clients',
            entityId: client.ClientID,
            field: 'AttributesJSON',
            message: 'Invalid JSON format.',
        });
    }
  });

  // --- Validator 4: Unknown references in RequestedTaskIDs ---
  clients.forEach(client => {
    client.RequestedTaskIDs.forEach(reqTaskId => {
      if (!taskIDs.has(reqTaskId)) {
        errors.push({
          entityType: 'clients',
          entityId: client.ClientID,
          field: 'RequestedTaskIDs',
          message: `Requested TaskID "${reqTaskId}" does not exist in the tasks list.`
        });
      }
    });
  });
  
  // --- Validator 5: Skill Coverage ---
  const allWorkerSkills = new Set(workers.flatMap(w => w.Skills));
  tasks.forEach(task => {
    task.RequiredSkills.forEach(reqSkill => {
        if (!allWorkerSkills.has(reqSkill)) {
            errors.push({
                entityType: 'tasks',
                entityId: task.TaskID,
                field: 'RequiredSkills',
                message: `Required skill "${reqSkill}" is not provided by any worker.`
            });
        }
    });
  });

  return errors;
};