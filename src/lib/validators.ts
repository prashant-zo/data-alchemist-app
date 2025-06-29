// src/lib/validators.ts
import { DataBundle, ValidationError, EntityType } from '@/types';

export const runValidators = (data: DataBundle): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { clients, workers, tasks } = data;
  const taskIDs = new Set(tasks.map(t => t.TaskID));

  const findDuplicates = <T extends { [key in K]: string }, K extends string>(items: T[], idKey: K, entityType: EntityType) => {
    const seen = new Set<string>();
    for (const item of items) {
      const id = item[idKey];
      if (id && seen.has(id)) {
        errors.push({ entityType, entityId: id, field: idKey, message: `Duplicate ID found: ${id}.` });
      }
      if (id) seen.add(id);
    }
  };

  findDuplicates(clients, 'ClientID', 'clients');
  findDuplicates(workers, 'WorkerID', 'workers');
  findDuplicates(tasks, 'TaskID', 'tasks');

  clients.forEach(client => {
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({ entityType: 'clients', entityId: client.ClientID, field: 'PriorityLevel', message: `PriorityLevel must be between 1 and 5.` });
    }
    if (client.AttributesJSON && (client.AttributesJSON as Record<string, unknown>)._parseError) {
      errors.push({ entityType: 'clients', entityId: client.ClientID, field: 'AttributesJSON', message: 'Invalid JSON format.' });
    }
    client.RequestedTaskIDs.forEach(reqTaskId => {
      if (!taskIDs.has(reqTaskId)) {
        errors.push({ entityType: 'clients', entityId: client.ClientID, field: 'RequestedTaskIDs', message: `Requested TaskID "${reqTaskId}" does not exist.` });
      }
    });
  });

  tasks.forEach(task => {
    if (task.Duration < 1) {
      errors.push({ entityType: 'tasks', entityId: task.TaskID, field: 'Duration', message: `Duration must be at least 1.` });
    }
  });

  const allWorkerSkills = new Set(workers.flatMap(w => w.Skills));
  tasks.forEach(task => {
    task.RequiredSkills.forEach(reqSkill => {
      if (!allWorkerSkills.has(reqSkill)) {
        errors.push({ entityType: 'tasks', entityId: task.TaskID, field: 'RequiredSkills', message: `Required skill "${reqSkill}" is not provided by any worker.` });
      }
    });
  });

  return errors;
};