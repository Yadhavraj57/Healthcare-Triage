import { create } from "zustand";
import { TriageResponse } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  triageResult: TriageResponse | null;
  triageInput: {
    symptoms: string;
    age: string;
    gender: string;
    existing_conditions: string;
    medications: string;
  };
  setUser: (user: User | null, token: string | null) => void;
  setTriageResult: (result: TriageResponse) => void;
  setTriageInput: (input: Partial<AppState["triageInput"]>) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  triageResult: null,
  triageInput: {
    symptoms: "",
    age: "",
    gender: "",
    existing_conditions: "",
    medications: "",
  },

  setUser: (user, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
    set({ user, token });
  },

  setTriageResult: (result) => set({ triageResult: result }),

  setTriageInput: (input) =>
    set((state) => ({ triageInput: { ...state.triageInput, ...input } })),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    set({ user: null, token: null });
  },
}));
