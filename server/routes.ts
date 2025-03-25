import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { motorcycles, sales, customers } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Motorcycles/Inventory API endpoints
  app.get("/api/motorcycles", async (req, res) => {
    const motorcycles = await storage.getMotorcycles();
    res.json(motorcycles);
  });

  app.get("/api/motorcycles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const motorcycle = await storage.getMotorcycle(id);
    
    if (!motorcycle) {
      return res.status(404).json({ message: "Motorcycle not found" });
    }
    
    res.json(motorcycle);
  });

  app.post("/api/motorcycles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const motorcycle = await storage.createMotorcycle(req.body);
      res.status(201).json(motorcycle);
    } catch (error) {
      res.status(400).json({ message: "Invalid motorcycle data", error });
    }
  });

  app.put("/api/motorcycles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const motorcycle = await storage.updateMotorcycle(id, req.body);
      
      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found" });
      }
      
      res.json(motorcycle);
    } catch (error) {
      res.status(400).json({ message: "Invalid motorcycle data", error });
    }
  });

  app.delete("/api/motorcycles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.status(403).json({ message: "Unauthorized action" });
    
    const id = parseInt(req.params.id);
    try {
      await storage.deleteMotorcycle(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting motorcycle", error });
    }
  });

  // Sales API endpoints
  app.get("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.get("/api/sales/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const sale = await storage.getSale(id);
    
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    
    res.json(sale);
  });

  app.post("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sale = await storage.createSale({
        ...req.body,
        userId: req.user?.id
      });
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data", error });
    }
  });

  app.get("/api/sales/range", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both startDate and endDate are required" });
    }
    
    try {
      const sales = await storage.getSalesByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving sales", error });
    }
  });

  // Customers API endpoints
  app.get("/api/customers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const customer = await storage.getCustomer(id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const customer = await storage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const customer = await storage.updateCustomer(id, req.body);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.status(403).json({ message: "Unauthorized action" });
    
    const id = parseInt(req.params.id);
    try {
      await storage.deleteCustomer(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer", error });
    }
  });

  // Dashboard API endpoints
  app.get("/api/dashboard/top-selling", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const topSellers = await storage.getTopSellingModels();
      res.json(topSellers);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving top selling models", error });
    }
  });

  // User profile update
  app.put("/api/user/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.id !== parseInt(req.params.id) && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    
    const id = parseInt(req.params.id);
    try {
      // Don't allow role updates unless admin
      let updateData = req.body;
      if (req.user?.role !== "admin") {
        const { role, ...allowed } = updateData;
        updateData = allowed;
      }
      
      const user = await storage.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
