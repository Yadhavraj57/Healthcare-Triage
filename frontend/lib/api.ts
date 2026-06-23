import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export interface TriageRequest {
  symptoms: string;
  age?: number;
  gender?: string;
  existing_conditions: string[];
  medications: string[];
}

export interface TriageCondition {
  name: string;
  probability: "High" | "Medium" | "Low";
}

export interface TriageResponse {
  session_id: string;
  urgency_level: "Emergency" | "Urgent" | "Semi-urgent" | "Non-urgent";
  urgency_color: "red" | "orange" | "yellow" | "green";
  conditions: TriageCondition[];
  specialist: string;
  red_flags: string[];
  report_markdown: string;
  self_care: string[];
  emergency_advice: string;
  session_summary?: string;
}

export interface BookingRequest {
  session_id?: string;
  specialist_type: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  contact_email: string;
}

export const triageApi = {
  submit: (data: TriageRequest) => api.post<TriageResponse>("/api/triage", data),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
};

export const appointmentsApi = {
  book: (data: BookingRequest) => api.post("/api/appointments", data),
  list: () => api.get("/api/appointments"),
};

export const historyApi = {
  get: () => api.get("/api/history"),
};
