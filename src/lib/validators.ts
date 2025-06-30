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
  const errors: ValidationError[] = [];

  clientData.forEach((client) => {
    // FIX: We explicitly convert the 'unknown' values to the types we expect.
    const priority = Number(client.PriorityLevel);
    const clientId = String(client.ClientID);

    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({
        entityId: clientId,
        field: "PriorityLevel",
        message: `PriorityLevel must be a number between 1 and 5. Found: '${client.PriorityLevel}'`,
      });
    }
  });

  return errors;
}

// --- Duplicate ID Validators ---

// A generic helper function to find duplicates in any array of data.
function findDuplicateIds(data: DataRow[], idField: string): string[] {
  // FIX: Cast each ID to a string to ensure type safety.
  const ids = data.map((row) => String(row[idField]));
  const uniqueIds = new Set(ids);
  if (uniqueIds.size === ids.length) {
    return [];
  }
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

// Validators for each entity type that use the generic helper.
export function validateDuplicateClientIDs(
  clientData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(clientData, "ClientID");
  return clientData
    .filter((client) => duplicateIds.includes(String(client.ClientID)))
    .map((client) => ({
      entityId: String(client.ClientID),
      field: "ClientID",
      message: `Duplicate ClientID '${client.ClientID}' found. IDs must be unique.`,
    }));
}

export function validateDuplicateWorkerIDs(
  workersData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(workersData, "WorkerID");
  return workersData
    .filter((worker) => duplicateIds.includes(String(worker.WorkerID)))
    .map((worker) => ({
      entityId: String(worker.WorkerID),
      field: "WorkerID",
      message: `Duplicate WorkerID '${worker.WorkerID}' found. IDs must be unique.`,
    }));
}

export function validateDuplicateTaskIDs(
  tasksData: DataRow[]
): ValidationError[] {
  const duplicateIds = findDuplicateIds(tasksData, "TaskID");
  return tasksData
    .filter((task) => duplicateIds.includes(String(task.TaskID)))
    .map((task) => ({
      entityId: String(task.TaskID),
      field: "TaskID",
      message: `Duplicate TaskID '${task.TaskID}' found. IDs must be unique.`,
    }));
}

// --- Data Format Validators ---

export function validateTaskDuration(tasksData: DataRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  tasksData.forEach((task) => {
    const duration = Number(task.Duration);
    const taskId = String(task.TaskID);

    if (isNaN(duration) || duration < 1) {
      errors.push({
        entityId: taskId,
        field: "Duration",
        message: `Duration must be a number greater than or equal to 1. Found: '${task.Duration}'`,
      });
    }
  });
  return errors;
}

export function validateClientAttributesJSON(
  clientData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  clientData.forEach((client) => {
    const jsonString = String(client.AttributesJSON || "");
    const clientId = String(client.ClientID);

    try {
      if (!jsonString.trim()) {
        throw new Error("is empty");
      }
      JSON.parse(jsonString);
    } catch (e) {
      errors.push({
        entityId: clientId,
        field: "AttributesJSON",
        message: `AttributesJSON is not valid JSON.`,
      });
    }
  });
  return errors;
}

// --- Cross-File Validators ---

export function validateUnknownTaskReferences(
  clientData: DataRow[],
  tasksData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const validTaskIds = new Set(tasksData.map((task) => String(task.TaskID)));

  clientData.forEach((client) => {
    const requestedIds = String(client.RequestedTaskIDs || "").split(",");

    requestedIds.forEach((id: string) => {
      const trimmedId = id.trim();
      if (trimmedId && !validTaskIds.has(trimmedId)) {
        errors.push({
          entityId: String(client.ClientID),
          field: "RequestedTaskIDs",
          message: `Requested TaskID '${trimmedId}' does not exist in the tasks data.`,
        });
      }
    });
  });
  return errors;
}

export function validateSkillCoverage(
  workersData: DataRow[],
  tasksData: DataRow[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const availableSkills = new Set<string>();
  workersData.forEach((worker) => {
    const workerSkills = String(worker.Skills || "").split(",");
    workerSkills.forEach((skill: string) => availableSkills.add(skill.trim()));
  });

  tasksData.forEach((task) => {
    const requiredSkills = String(task.RequiredSkills || "").split(",");

    requiredSkills.forEach((skill: string) => {
      const trimmedSkill = skill.trim();
      if (trimmedSkill && !availableSkills.has(trimmedSkill)) {
        errors.push({
          entityId: String(task.TaskID),
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
  const crossFileErrors = [
    ...validateUnknownTaskReferences(clientData, tasksData),
    ...validateSkillCoverage(workersData, tasksData),
  ];

  const allErrors = [
    ...clientErrors,
    ...workerErrors,
    ...taskErrors,
    ...crossFileErrors,
  ];

  console.log("Validation complete. Errors found:", allErrors.length);
  return allErrors;
}
