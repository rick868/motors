import { users, motorcycles, sales, customers, type User, type InsertUser, type Motorcycle, type InsertMotorcycle, type Sale, type InsertSale, type Customer, type InsertCustomer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Motorcycle related methods
  getMotorcycles(): Promise<Motorcycle[]>;
  getMotorcycle(id: number): Promise<Motorcycle | undefined>;
  createMotorcycle(motorcycle: InsertMotorcycle): Promise<Motorcycle>;
  updateMotorcycle(id: number, motorcycle: Partial<Motorcycle>): Promise<Motorcycle | undefined>;
  deleteMotorcycle(id: number): Promise<boolean>;
  
  // Customer related methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Sales related methods
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  getTopSellingModels(): Promise<any[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Motorcycle related methods
  async getMotorcycles(): Promise<Motorcycle[]> {
    return await db.select().from(motorcycles).orderBy(motorcycles.model);
  }

  async getMotorcycle(id: number): Promise<Motorcycle | undefined> {
    const [motorcycle] = await db.select().from(motorcycles).where(eq(motorcycles.id, id));
    return motorcycle;
  }

  async createMotorcycle(insertMotorcycle: InsertMotorcycle): Promise<Motorcycle> {
    const [motorcycle] = await db
      .insert(motorcycles)
      .values(insertMotorcycle)
      .returning();
    return motorcycle;
  }

  async updateMotorcycle(id: number, motorcycleData: Partial<Motorcycle>): Promise<Motorcycle | undefined> {
    const [motorcycle] = await db
      .update(motorcycles)
      .set(motorcycleData)
      .where(eq(motorcycles.id, id))
      .returning();
    return motorcycle;
  }

  async deleteMotorcycle(id: number): Promise<boolean> {
    const deleted = await db
      .delete(motorcycles)
      .where(eq(motorcycles.id, id));
    return true;
  }

  // Customer related methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.lastName);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(customerData)
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const deleted = await db
      .delete(customers)
      .where(eq(customers.id, id));
    return true;
  }

  // Sales related methods
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.saleDate));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values(insertSale)
      .returning();
    return sale;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return await db
      .select()
      .from(sales)
      .where(
        and(
          gte(sales.saleDate, startDate),
          lte(sales.saleDate, endDate)
        )
      )
      .orderBy(desc(sales.saleDate));
  }

  async getTopSellingModels(): Promise<any[]> {
    // This is a complex query best handled with SQL
    // For a complete implementation, we'd use SQL or another approach
    // For now, we'll return a simplified approach
    const result = await db.query.motorcycles.findMany({
      with: {
        sales: true
      }
    });
    
    // Calculate total sales per model and sort
    const models = result.map(model => ({
      id: model.id,
      model: model.model,
      make: model.make,
      price: model.price,
      imageUrl: model.imageUrl,
      unitsSold: model.sales.length,
      totalSales: model.sales.reduce((acc, sale) => acc + Number(sale.salePrice), 0)
    }));
    
    // Sort by units sold descending
    return models.sort((a, b) => b.unitsSold - a.unitsSold);
  }
}

export const storage = new DatabaseStorage();
