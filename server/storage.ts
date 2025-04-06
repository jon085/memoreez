import { users, User, InsertUser, categories, memories, Category, InsertCategory, Memory, InsertMemory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  verifyUser(token: string): Promise<User | undefined>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Memory operations
  getMemory(id: number): Promise<Memory | undefined>;
  getMemoriesByUserId(userId: number): Promise<Memory[]>;
  getPublicMemories(): Promise<Memory[]>;
  getMemoriesByCategoryId(categoryId: number): Promise<Memory[]>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  updateMemory(id: number, memory: Partial<Memory>): Promise<Memory | undefined>;
  deleteMemory(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private categoryStore: Map<number, Category>;
  private memoryStore: Map<number, Memory>;
  private userIdCounter: number;
  private categoryIdCounter: number;
  private memoryIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.userStore = new Map();
    this.categoryStore = new Map();
    this.memoryStore = new Map();
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.memoryIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Create default categories
    this.createCategory({
      name: "Travel",
      description: "Memories from your adventures around the world",
      userId: 0,
      isDefault: true
    });
    this.createCategory({
      name: "Family",
      description: "Special moments with loved ones",
      userId: 0,
      isDefault: true
    });
    this.createCategory({
      name: "Milestones",
      description: "Important life achievements and events",
      userId: 0,
      isDefault: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: timestamp,
      isVerified: false
    };
    this.userStore.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.userStore.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.userStore.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userStore.delete(id);
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const user = Array.from(this.userStore.values()).find(
      (user) => user.verificationToken === token
    );
    
    if (user) {
      const updatedUser = { ...user, isVerified: true, verificationToken: undefined };
      this.userStore.set(user.id, updatedUser);
      return updatedUser;
    }
    
    return undefined;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoryStore.get(id);
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    // Return default categories + user-specific categories
    const defaultCategories = Array.from(this.categoryStore.values()).filter(
      category => category.isDefault
    );
    
    const userCategories = Array.from(this.categoryStore.values()).filter(
      category => category.userId === userId && !category.isDefault
    );
    
    return [...defaultCategories, ...userCategories];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const timestamp = new Date();
    const category: Category = { ...categoryData, id, createdAt: timestamp };
    this.categoryStore.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    // Don't allow updating default categories
    if (category.isDefault) return category;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categoryStore.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.getCategory(id);
    if (!category || category.isDefault) return false;
    
    // Update memories with this category to have no category
    const relatedMemories = await this.getMemoriesByCategoryId(id);
    for (const memory of relatedMemories) {
      await this.updateMemory(memory.id, { categoryId: null });
    }
    
    return this.categoryStore.delete(id);
  }

  // Memory operations
  async getMemory(id: number): Promise<Memory | undefined> {
    return this.memoryStore.get(id);
  }

  async getMemoriesByUserId(userId: number): Promise<Memory[]> {
    return Array.from(this.memoryStore.values()).filter(
      memory => memory.userId === userId
    );
  }

  async getPublicMemories(): Promise<Memory[]> {
    return Array.from(this.memoryStore.values()).filter(
      memory => memory.visibility === 'public'
    );
  }

  async getMemoriesByCategoryId(categoryId: number): Promise<Memory[]> {
    return Array.from(this.memoryStore.values()).filter(
      memory => memory.categoryId === categoryId
    );
  }

  async createMemory(memoryData: InsertMemory): Promise<Memory> {
    const id = this.memoryIdCounter++;
    const timestamp = new Date();
    const memory: Memory = { 
      ...memoryData, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.memoryStore.set(id, memory);
    return memory;
  }

  async updateMemory(id: number, memoryData: Partial<Memory>): Promise<Memory | undefined> {
    const memory = await this.getMemory(id);
    if (!memory) return undefined;
    
    const updatedMemory = { 
      ...memory, 
      ...memoryData,
      updatedAt: new Date()
    };
    this.memoryStore.set(id, updatedMemory);
    return updatedMemory;
  }

  async deleteMemory(id: number): Promise<boolean> {
    return this.memoryStore.delete(id);
  }
}

export const storage = new MemStorage();
