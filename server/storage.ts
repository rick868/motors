import { users, motorcycles, motorcycleImages, sales, customers, suppliers, purchaseOrders, purchaseOrderItems, inventoryTransactions, 
  type User, type InsertUser, type Motorcycle, type InsertMotorcycle, type Sale, type InsertSale, type Customer, type InsertCustomer,
  type MotorcycleImage, type InsertMotorcycleImage, type Supplier, type InsertSupplier, type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderItem, type InsertPurchaseOrderItem, type InventoryTransaction, type InsertInventoryTransaction
} from "@shared/schema";
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
  
  // Motorcycle Image methods
  getMotorcycleImages(motorcycleId: number): Promise<MotorcycleImage[]>;
  createMotorcycleImage(image: InsertMotorcycleImage): Promise<MotorcycleImage>;
  deleteMotorcycleImage(id: number): Promise<boolean>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier | undefined>;
  
  // Purchase Order methods
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  
  // Inventory Transaction methods
  getInventoryTransactions(motorcycleId?: number): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  
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
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

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
      .values(insertMotorcycle as any)
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

  // Motorcycle Image methods
  async getMotorcycleImages(motorcycleId: number): Promise<MotorcycleImage[]> {
    return await db
      .select()
      .from(motorcycleImages)
      .where(eq(motorcycleImages.motorcycleId, motorcycleId))
      .orderBy(motorcycleImages.displayOrder);
  }

  async createMotorcycleImage(image: InsertMotorcycleImage): Promise<MotorcycleImage> {
    const [motorcycleImage] = await db
      .insert(motorcycleImages)
      .values(image)
      .returning();
    return motorcycleImage;
  }

  async deleteMotorcycleImage(id: number): Promise<boolean> {
    await db
      .delete(motorcycleImages)
      .where(eq(motorcycleImages.id, id));
    return true;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .orderBy(suppliers.name);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values(supplier)
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplierData: Partial<Supplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(supplierData)
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .orderBy(desc(purchaseOrders.orderDate));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [order] = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id));
    return order;
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newOrder] = await db
      .insert(purchaseOrders)
      .values(order)
      .returning();
    return newOrder;
  }

  // Inventory Transaction methods
  async getInventoryTransactions(motorcycleId?: number): Promise<InventoryTransaction[]> {
    if (motorcycleId) {
      return await db
        .select()
        .from(inventoryTransactions)
        .where(eq(inventoryTransactions.motorcycleId, motorcycleId))
        .orderBy(desc(inventoryTransactions.transactionDate));
    }
    
    return await db
      .select()
      .from(inventoryTransactions)
      .orderBy(desc(inventoryTransactions.transactionDate));
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db
      .insert(inventoryTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
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
        sales: true,
        images: true
      }
    });
    
    // Calculate total sales per model and sort
    const models = result.map(model => {
      // Find the primary image or the first image
      const primaryImage = model.images.find(img => img.isPrimary) || model.images[0];
      const imageUrl = primaryImage?.imageUrl || null;
      
      return {
        id: model.id,
        model: model.model,
        make: model.make,
        price: model.price,
        imageUrl: imageUrl,
        unitsSold: model.sales.length,
        totalSales: model.sales.reduce((acc, sale) => acc + Number(sale.salePrice), 0)
      };
    });
    
    // Sort by units sold descending
    return models.sort((a, b) => b.unitsSold - a.unitsSold);
  }
}

export const storage = new DatabaseStorage();
