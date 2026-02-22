import { Complaint, User, Department } from "../types";

const API_BASE = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    async login(credentials: any) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    async register(data: any) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
  },
  complaints: {
    async getAll(params: any = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/complaints?${query}`, {
        headers: getHeaders(),
      });
      return res.json();
    },
    async getById(id: string) {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        headers: getHeaders(),
      });
      return res.json();
    },
    async create(data: any) {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async update(id: string, data: any) {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  admin: {
    async getAnalytics() {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: getHeaders(),
      });
      return res.json();
    },
    async assign(complaintId: string, staffId: string) {
      const res = await fetch(`${API_BASE}/admin/assign`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ complaintId, staffId }),
      });
      return res.json();
    },
    async getStaff() {
      const res = await fetch(`${API_BASE}/staff`, {
        headers: getHeaders(),
      });
      return res.json();
    }
  },
  departments: {
    async getAll() {
      const res = await fetch(`${API_BASE}/departments`, {
        headers: getHeaders(),
      });
      return res.json();
    },
  },
  seed: {
    async run() {
      const res = await fetch(`${API_BASE}/seed`, { method: "POST" });
      return res.json();
    }
  }
};
