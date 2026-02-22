import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authService } from "./server/services/auth.service.ts";
import { complaintService } from "./server/services/complaint.service.ts";
import { adminService } from "./server/services/admin.service.ts";
import { authMiddleware, roleMiddleware } from "./server/middleware/auth.ts";

dotenv.config();

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  app.use(cors());
  app.use(express.json());

  // Socket.io connection handling
  io.on("connection", (socket) => {
    socket.on("join-room", (room) => {
      socket.join(room);
    });
  });

  // Attach io to request
  app.use((req: any, res, next) => {
    req.io = io;
    next();
  });

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Complaints
  app.post("/api/complaints", authMiddleware, async (req: any, res) => {
    try {
      const complaint = await complaintService.create(req.body, req.user.id);
      req.io.emit("new-complaint", complaint);
      res.status(201).json(complaint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/complaints", authMiddleware, async (req: any, res) => {
    try {
      const filters = req.query;
      // If user is not ADMIN or STAFF, only show their own complaints
      if (req.user.role === "USER") {
        filters.userId = req.user.id;
      }
      const result = await complaintService.getAll(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/complaints/:id", authMiddleware, async (req, res) => {
    try {
      const complaint = await complaintService.getById(req.params.id);
      if (!complaint) return res.status(404).json({ message: "Not found" });
      res.json(complaint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/complaints/:id", authMiddleware, async (req: any, res) => {
    try {
      const complaint = await complaintService.update(req.params.id, req.body);
      req.io.to(`complaint-${req.params.id}`).emit("complaint-updated", complaint);
      req.io.emit("status-change", complaint);
      res.json(complaint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin
  app.get("/api/admin/analytics", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
      const analytics = await adminService.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/assign", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
      const { complaintId, staffId } = req.body;
      const complaint = await adminService.assignComplaint(complaintId, staffId);
      res.json(complaint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Departments & Categories
  app.get("/api/departments", async (req, res) => {
    const departments = await prisma.department.findMany({ include: { categories: true } });
    res.json(departments);
  });

  app.get("/api/staff", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    const staff = await prisma.user.findMany({ where: { role: "STAFF" } });
    res.json(staff);
  });

  // Seed Data Endpoint (for demo purposes)
  app.post("/api/seed", async (req, res) => {
    try {
      // Create departments
      const it = await prisma.department.upsert({
        where: { name: "IT Support" },
        update: {},
        create: { name: "IT Support", description: "Technical issues" }
      });
      const hr = await prisma.department.upsert({
        where: { name: "HR" },
        update: {},
        create: { name: "HR", description: "Human resources" }
      });

      // Create categories
      const categories = [
        { name: "Hardware", departmentId: it.id },
        { name: "Software", departmentId: it.id },
        { name: "Payroll", departmentId: hr.id },
        { name: "Benefits", departmentId: hr.id },
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { id: `cat-${cat.name}` }, // Using a stable ID for upsert
          update: {},
          create: { ...cat, id: `cat-${cat.name}` }
        });
      }

      // Create Admin
      const adminPassword = await authService.register({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "ADMIN"
      }).catch(() => null);

      // Create Staff
      await authService.register({
        name: "Staff Member",
        email: "staff@example.com",
        password: "password123",
        role: "STAFF",
        departmentId: it.id
      }).catch(() => null);

      // Create Demo User
      await authService.register({
        name: "Demo User",
        email: "demo@gmail.com",
        password: "12341234",
        role: "USER"
      }).catch(() => null);

      res.json({ message: "Seed successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
