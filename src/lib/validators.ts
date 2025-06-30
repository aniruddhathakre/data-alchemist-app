import { DataRow, useAppStore } from "./store";

export interface ValidationError {
  entityId: string;
  field: string;
  message: string;
}

// This function checks for invalid PriorityLevel in the client data.
export function validateClientPriority(
  clientData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = []; // Start with an empty list of errors

  clientData.forEach((client) => {
    const priority = client.PriorityLevel;
    const clientId = client.ClientID;

    // We check if the priority is not a number OR is less than 1 OR is greater than 5.
    if (typeof priority !== "number" || priority < 1 || priority > 5) {
      // If it's invalid, we create an error object and add it to our list.
      errors.push({
        entityId: clientId,
        field: "PriorityLevel",
        message: `PriorityLevel must be a number between 1 and 5. Found: '${priority}'`,
      });
    }
  });

  return errors; // Return the list of all errors we found.
}

// --- Duplicate ID Validators ---

// A generic helper function to find duplicates in any array of data
function findDuplicateIds(data: DataRow[], idField: string): string[] {
  const ids = data.map((row) => row[idField]);
  const uniqueIds = new Set(ids);
  // If the set size is the same as the array length, there are no duplicates.
  if (uniqueIds.size === ids.length) {
    return [];
  }
  // Otherwise, find which IDs are duplicated.
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  });
  return Array.from(duplicates);
}

// A specific validator for duplicate Client IDs
export function validateDuplicateClientIDs(
  clientData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(clientData, "ClientID");
  // For each duplicated ID we found, create a list of error objects for every row that has that ID.
  return clientData
    .filter((client) => duplicateIds.includes(client.ClientID))
    .map((client) => ({
      entityId: client.ClientID,
      field: "ClientID",
      message: `Duplicate ClientID '${client.ClientID}' found. IDs must be unique.`,
    }));
}

// We can reuse the same pattern for Workers and Tasks
export function validateDuplicateWorkerIDs(
  workersData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(workersData, "WorkerID");
  return workersData
    .filter((worker) => duplicateIds.includes(worker.WorkerID))
    .map((worker) => ({
      entityId: worker.WorkerID,
      field: "WorkerID",
      message: `Duplicate WorkerID '${worker.WorkerID}' found. IDs must be unique.`,
    }));
}

export function validateDuplicateTaskIDs(
  tasksData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(tasksData, "TaskID");
  return tasksData
    .filter((task) => duplicateIds.includes(task.TaskID))
    .map((task) => ({
      entityId: task.TaskID,
      field: "TaskID",
      message: `Duplicate TaskID '${task.TaskID}' found. IDs must be unique.`,
    }));
}

// --- Data Format Validators ---

// Validator #5: Check if Task Duration is valid
export function validateTaskDuration(tasksData: DataRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  tasksData.forEach((task) => {
    const duration = task.Duration;
    const taskId = task.TaskID;

    // Check if duration is not a number or is less than 1
    if (typeof duration !== "number" || duration < 1) {
      errors.push({
        entityId: taskId,
        field: "Duration",
        message: `Duration must be a number greater than or equal to 1. Found: '${duration}'`,
      });
    }
  });

  return errors;
}

// Validator #6: Check if the AttributesJSON string is valid JSON
export function validateClientAttributesJSON(
  clientData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  clientData.forEach((client) => {
    const jsonString = client.AttributesJSON;
    const clientId = client.ClientID;

    // We use a try...catch block. If JSON.parse fails, it throws an error.
    // This is a professional and robust way to validate JSON strings.
    try {
      // If the string is empty or just whitespace, it's not valid for our purposes.
      if (!jsonString || !jsonString.trim()) {
        throw new Error("is empty");
      }
      JSON.parse(jsonString);
    } catch (e) {
      errors.push({
        entityId: clientId,
        field: "AttributesJSON",
        message: `AttributesJSON is not valid JSON. Error: ${
          (e as Error).message
        }`,
      });
    }
  });

  return errors;
}

// --- Cross-File Validators ---

// Validator #7: Check if a client requests a task that doesn't exist.
export function validateUnknownTaskReferences(
  clientData: DataRow[],
  tasksData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  // Create a Set of all valid TaskIDs for very fast lookups.
  const validTaskIds = new Set(tasksData.map((task) => task.TaskID));

  clientData.forEach((client) => {
    const requestedIds = client.RequestedTaskIDs?.split(",") || [];

    requestedIds.forEach((id: string) => {
      const trimmedId = id.trim();
      // If a requested ID is not in our set of valid IDs, create an error.
      if (trimmedId && !validTaskIds.has(trimmedId)) {
        errors.push({
          entityId: client.ClientID,
          field: "RequestedTaskIDs",
          message: `Requested TaskID '${trimmedId}' does not exist in the tasks data.`,
        });
      }
    });
  });

  return errors;
}

// Validator #8: Check if a required skill for a task is not covered by any worker.
export function validateSkillCoverage(
  workersData: DataRow[],
  tasksData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  // Create a Set of all available skills from all workers.
  const availableSkills = new Set<string>();
  workersData.forEach((worker) => {
    const workerSkills = worker.Skills?.split(",") || [];
    workerSkills.forEach((skill: string) => availableSkills.add(skill.trim()));
  });

  tasksData.forEach((task) => {
    const requiredSkills = task.RequiredSkills?.split(",") || [];

    requiredSkills.forEach((skill: string) => {
      const trimmedSkill = skill.trim();
      // If a required skill is not in our set of available skills, create an error.
      if (trimmedSkill && !availableSkills.has(trimmedSkill)) {
        errors.push({
          entityId: task.TaskID,
          field: "RequiredSkills",
          message: `Required skill '${trimmedSkill}' is not covered by any worker.`,
        });
      }
    });
  });

  return errors;
}

export function runAllValidators(): ValidationError[] {
  const { clientData, workersData, tasksData } = useAppStore.getState();

  const clientErrors = [
    ...validateClientPriority(clientData),
    ...validateDuplicateClientIDs(clientData),
    ...validateClientAttributesJSON(clientData),
  ];

  const workerErrors = [...validateDuplicateWorkerIDs(workersData)];

  const taskErrors = [
    ...validateDuplicateTaskIDs(tasksData),
    ...validateTaskDuration(tasksData),
  ];

  // We run the cross-file validators separately as they need multiple data sources
  const crossFileErrors = [
    ...validateUnknownTaskReferences(clientData, tasksData),
    ...validateSkillCoverage(workersData, tasksData),
  ];

  // Combine all errors from all validators into one big list.
  const allErrors = [
    ...clientErrors,
    ...workerErrors,
    ...taskErrors,
    ...crossFileErrors, // <-- Add the new cross-file errors
  ];

  console.log("Validation complete. Errors found:", allErrors.length);
  return allErrors;
}
