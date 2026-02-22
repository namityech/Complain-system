export type Role = "USER" | "STAFF" | "ADMIN";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
}

export interface Category {
  id: string;
  name: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  userId: string;
  assignedToId?: string;
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  category: Category;
  user: { name: string; email?: string };
  assignedTo?: { name: string; email?: string };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { name: string };
}
