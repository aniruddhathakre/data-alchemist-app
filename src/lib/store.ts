import { create } from "zustand";
import { type ValidationError } from "./validators";

// --- SHARED TYPES ---
// These types define the core data structures for our entire application.

// A DataRow represents a single row from one of our CSV files.
export type DataRow = Record<string, unknown>;

// NEW: We define the precise shape of a filter object returned by our AI.
// By exporting this, other files like page.tsx can use it.
export interface Filter {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains";
  value: string | number;
}

// This is a "discriminated union" type for our rules. It's a professional
// pattern that defines the exact shape for each possible rule type.
export type Rule =
  | { type: "coRun"; tasks: string[] }
  | {
      type: "slot-restriction";
      groupType: "client" | "worker";
      group: string;
      minCommonSlots: number;
    }
  | { type: "load-limit"; group: string; maxSlotsPerPhase: number };

// --- ZUSTAND STORE DEFINITION ---
// This interface defines the complete "shape" of our global state.
interface AppState {
  // Raw file objects uploaded by the user
  clientFile: File | null;
  workersFile: File | null;
  tasksFile: File | null;
  setClientFile: (file: File | null) => void;
  setWorkersFile: (file: File | null) => void;
  setTasksFile: (file: File | null) => void;

  // Parsed data from the files
  clientData: DataRow[];
  workersData: DataRow[];
  tasksData: DataRow[];
  setClientData: (data: DataRow[]) => void;
  setWorkersData: (data: DataRow[]) => void;
  setTasksData: (data: DataRow[]) => void;

  // Validation errors found in the data
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;

  // Business rules created by the user
  rules: Rule[];
  addRule: (newRule: Rule) => void;
  clearRules: () => void;

  // Prioritization weights set by the user
  weights: { [key: string]: number };
  setWeight: (key: string, value: number) => void;
}

// 'create' is the main function from Zustand to build our store.
export const useAppStore = create<AppState>((set) => ({
  // --- INITIAL STATE ---
  // This is the default state of the app when it first loads.
  clientFile: null,
  workersFile: null,
  tasksFile: null,
  clientData: [],
  workersData: [],
  tasksData: [],
  validationErrors: [],
  rules: [],
  weights: { fulfillment: 50, fairness: 50 },

  // --- ACTIONS ---
  // These are the functions that components can call to update the state.
  setClientFile: (file) => set({ clientFile: file }),
  setWorkersFile: (file) => set({ workersFile: file }),
  setTasksFile: (file) => set({ tasksFile: file }),
  setClientData: (data) => set({ clientData: data }),
  setWorkersData: (data) => set({ workersData: data }),
  setTasksData: (data) => set({ tasksData: data }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  addRule: (newRule) => set((state) => ({ rules: [...state.rules, newRule] })),
  clearRules: () => set({ rules: [] }),
  setWeight: (key, value) =>
    set((state) => ({
      weights: { ...state.weights, [key]: value },
    })),
}));
