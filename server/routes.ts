import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertCategorySchema, insertMemorySchema } from "@shared/schema";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is an admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // User profile routes
  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only return public user information
      const { password, verificationToken, email, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/users/:id", isAuthenticated, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only update their own profile
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Filter out sensitive fields
      const { password, verificationToken, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      next(error);
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/categories/:id", async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res, next) => {
    try {
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Users can only update their own categories
      if (category.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You can only update your own categories" });
      }
      
      // Don't allow updating default categories
      if (category.isDefault) {
        return res.status(403).json({ message: "Default categories cannot be updated" });
      }
      
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Users can only delete their own categories
      if (category.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You can only delete your own categories" });
      }
      
      // Don't allow deleting default categories
      if (category.isDefault) {
        return res.status(403).json({ message: "Default categories cannot be deleted" });
      }
      
      const success = await storage.deleteCategory(categoryId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Memory routes
  app.get("/api/memories", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const memories = await storage.getMemoriesByUserId(userId);
      res.json(memories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/memories/public", async (req, res, next) => {
    try {
      const memories = await storage.getPublicMemories();
      res.json(memories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/memories/:id", async (req, res, next) => {
    try {
      const memoryId = parseInt(req.params.id);
      const memory = await storage.getMemory(memoryId);
      
      if (!memory) {
        return res.status(404).json({ message: "Memory not found" });
      }
      
      // Check if authenticated
      const isAuth = req.isAuthenticated();
      
      // For private memories, require authentication and appropriate permissions
      if (memory.visibility === "private") {
        if (!isAuth) {
          return res.status(401).json({ message: "Authentication required: This memory is private" });
        }
        
        if (req.user.id !== memory.userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Forbidden: You don't have permission to view this private memory" });
        }
      }
      
      res.json(memory);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/memories", isAuthenticated, async (req, res, next) => {
    try {
      const memoryData = insertMemorySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Verify category exists if provided
      if (memoryData.categoryId) {
        const category = await storage.getCategory(memoryData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
      }
      
      const memory = await storage.createMemory(memoryData);
      res.status(201).json(memory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.put("/api/memories/:id", isAuthenticated, async (req, res, next) => {
    try {
      const memoryId = parseInt(req.params.id);
      const memory = await storage.getMemory(memoryId);
      
      if (!memory) {
        return res.status(404).json({ message: "Memory not found" });
      }
      
      // Users can only update their own memories
      if (memory.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You can only update your own memories" });
      }
      
      // Verify category exists if provided
      if (req.body.categoryId) {
        const category = await storage.getCategory(req.body.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
      }
      
      const updatedMemory = await storage.updateMemory(memoryId, req.body);
      res.json(updatedMemory);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/memories/:id", isAuthenticated, async (req, res, next) => {
    try {
      const memoryId = parseInt(req.params.id);
      const memory = await storage.getMemory(memoryId);
      
      if (!memory) {
        return res.status(404).json({ message: "Memory not found" });
      }
      
      // Users can only delete their own memories
      if (memory.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You can only delete your own memories" });
      }
      
      const success = await storage.deleteMemory(memoryId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Memory not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      // Filter out sensitive fields
      const safeUsers = users.map(({ password, verificationToken, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Admin can't delete themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own admin account" });
      }
      
      const success = await storage.deleteUser(userId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent removing admin role from self
      if (userId === req.user.id && req.body.role === "user") {
        return res.status(400).json({ message: "You cannot remove your own admin privileges" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Filter out sensitive fields
      const { password, verificationToken, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
