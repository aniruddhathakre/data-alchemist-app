import { create } from "zustand";

import { type ValidationError } from "./validators";

export type DataRow = Record<string, any>;

// 1. DEFINE THE STRUCTURE OF A RULE OBJECT
export interface Rule {
  type: string; // e.g., 'coRun', 'loadLimit'
  // This allows for any other properties, making our type flexible
  [key: string]: any;
}

interface AppState {
  clientFile: File | null;
  workersFile: File | null;
  tasksFile: File | null;
  setClientFile: (file: File | null) => void;
  setWorkersFile: (file: File | null) => void;
  setTasksFile: (file: File | null) => void;

  clientData: DataRow[];
  workersData: DataRow[];
  tasksData: DataRow[];
  setClientData: (data: DataRow[]) => void;
  setWorkersData: (data: DataRow[]) => void;
  setTasksData: (data: DataRow[]) => void;

  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;

  rules: Rule[];
  addRule: (newRule: Rule) => void;
  clearRules: () => void; // A helper to clear all rules

  weights: { [key: string]: number };
  setWeight: (key: string, value: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  clientFile: null,
  workersFile: null,
  tasksFile: null,
  clientData: [],
  workersData: [],
  tasksData: [],
  validationErrors: [],
  rules: [],
  weights: { fulfillment: 50, fairness: 50 },

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
