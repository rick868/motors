import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  profileImage: text("profile_image"),
  role: text("role").notNull().default("sales_manager"),
  facebookId: text("facebook_id"),
  instagramId: text("instagram_id"),
  twitterId: text("twitter_id"),
  linkedinId: text("linkedin_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const motorcycles = pgTable("motorcycles", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  model: text("model").notNull(),
  make: text("make").notNull(),
  year: integer("year").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  color: text("color").notNull(),
  price: doublePrecision("price").notNull(),
  cost: doublePrecision("cost").notNull(),
  msrp: doublePrecision("msrp"),
  vin: text("vin").unique().notNull(),
  engineType: text("engine_type"),
  engineCapacity: integer("engine_capacity"), // in cc
  transmission: text("transmission"),
  fuelCapacity: doublePrecision("fuel_capacity"), // in liters
  seatHeight: integer("seat_height"), // in mm
  weight: integer("weight"), // in kg
  power: integer("power"), // in hp
  torque: integer("torque"), // in Nm
  description: text("description"),
  features: jsonb("features").$type<string[]>(),
  warranty: text("warranty"),
  status: text("status").notNull().default("in_stock"), // in_stock, low_stock, out_of_stock, discontinued
  condition: text("condition").notNull().default("new"), // new, used, refurbished
  location: text("location"), // warehouse location or dealer
  stock: integer("stock").notNull().default(0),
  reorderPoint: integer("reorder_point").default(5),
  leadTime: integer("lead_time"), // in days
  supplierID: integer("supplier_id").references(() => suppliers.id),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const motorcycleImages = pgTable("motorcycle_images", {
  id: serial("id").primaryKey(),
  motorcycleId: integer("motorcycle_id").notNull().references(() => motorcycles.id, { onDelete: 'cascade' }),
  imageUrl: text("image_url").notNull(),
  alt: text("alt"),
  isPrimary: boolean("is_primary").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  website: text("website"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  status: text("status").default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  status: text("status").notNull().default("pending"), // pending, partially_received, received, cancelled
  subtotal: doublePrecision("subtotal").notNull(),
  tax: doublePrecision("tax").default(0),
  shipping: doublePrecision("shipping").default(0),
  total: doublePrecision("total").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  motorcycleId: integer("motorcycle_id").notNull().references(() => motorcycles.id),
  quantity: integer("quantity").notNull(),
  unitCost: doublePrecision("unit_cost").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  total: doublePrecision("total").notNull(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  motorcycleId: integer("motorcycle_id").notNull().references(() => motorcycles.id),
  transactionType: text("transaction_type").notNull(), // purchase, sale, adjustment, return, transfer
  quantity: integer("quantity").notNull(), // positive for in, negative for out
  referenceId: integer("reference_id"), // ID of the related transaction (sale, purchase, etc.)
  referenceType: text("reference_type"), // Type of the reference (sale, purchase_order, etc.)
  notes: text("notes"),
  batchNumber: text("batch_number"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  motorcycleId: integer("motorcycle_id").notNull().references(() => motorcycles.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  salePrice: doublePrecision("sale_price").notNull(),
  tax: doublePrecision("tax").default(0),
  discount: doublePrecision("discount").default(0),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("paid"), // paid, pending, partial, failed
  status: text("status").notNull().default("completed"), // pending, completed, cancelled, returned
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  dateOfBirth: timestamp("date_of_birth"),
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  notes: text("notes"),
  customerType: text("customer_type").default("individual"), // individual, business
  status: text("status").default("active"), // active, inactive
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Relations
export const motorcyclesRelations = relations(motorcycles, ({ many, one }) => ({
  sales: many(sales),
  images: many(motorcycleImages),
  supplier: one(suppliers, {
    fields: [motorcycles.supplierID],
    references: [suppliers.id],
  }),
  inventoryTransactions: many(inventoryTransactions),
  purchaseOrderItems: many(purchaseOrderItems),
}));

export const motorcycleImagesRelations = relations(motorcycleImages, ({ one }) => ({
  motorcycle: one(motorcycles, {
    fields: [motorcycleImages.motorcycleId],
    references: [motorcycles.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  motorcycle: one(motorcycles, {
    fields: [sales.motorcycleId],
    references: [motorcycles.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  motorcycles: many(motorcycles),
  purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchaseOrderItems),
  createdByUser: one(users, {
    fields: [purchaseOrders.createdBy],
    references: [users.id],
  }),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  motorcycle: one(motorcycles, {
    fields: [purchaseOrderItems.motorcycleId],
    references: [motorcycles.id],
  }),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  motorcycle: one(motorcycles, {
    fields: [inventoryTransactions.motorcycleId],
    references: [motorcycles.id],
  }),
  createdByUser: one(users, {
    fields: [inventoryTransactions.createdBy],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
  motorcyclesCreated: many(motorcycles, { relationName: 'createdMotorcycles' }),
  motorcyclesUpdated: many(motorcycles, { relationName: 'updatedMotorcycles' }),
  purchaseOrders: many(purchaseOrders),
  inventoryTransactions: many(inventoryTransactions),
}));

// Schema for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
});

export const insertMotorcycleSchema = createInsertSchema(motorcycles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const insertMotorcycleImageSchema = createInsertSchema(motorcycleImages).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  transactionDate: true,
  createdBy: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  saleDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedBy: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMotorcycle = z.infer<typeof insertMotorcycleSchema>;
export type Motorcycle = typeof motorcycles.$inferSelect;

export type InsertMotorcycleImage = z.infer<typeof insertMotorcycleImageSchema>;
export type MotorcycleImage = typeof motorcycleImages.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
