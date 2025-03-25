import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { motorcycles, motorcycleImages, sales, customers, suppliers, purchaseOrders, 
         inventoryTransactions, type InsertMotorcycleImage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Motorcycles/Inventory API endpoints
  app.get("/api/motorcycles", async (req, res) => {
    try {
      const motorcycles = await storage.getMotorcycles();
      res.json(motorcycles);
    } catch (error) {
      console.error("Error fetching motorcycles:", error);
      res.status(500).json({ message: "Error fetching motorcycles" });
    }
  });

  app.get("/api/motorcycles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const motorcycle = await storage.getMotorcycle(id);
      
      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found" });
      }
      
      // Get motorcycle images
      const images = await storage.getMotorcycleImages(id);
      
      res.json({
        ...motorcycle,
        images
      });
    } catch (error) {
      console.error(`Error fetching motorcycle ID ${id}:`, error);
      res.status(500).json({ message: "Error fetching motorcycle details" });
    }
  });

  app.post("/api/motorcycles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Add the user ID as the creator
      const motorcycleData = {
        ...req.body,
        createdBy: req.user?.id
      };

      const motorcycle = await storage.createMotorcycle(motorcycleData);
      res.status(201).json(motorcycle);
    } catch (error) {
      console.error("Error creating motorcycle:", error);
      res.status(400).json({ message: "Invalid motorcycle data", error });
    }
  });

  app.put("/api/motorcycles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      // Add updated by information
      const motorcycleData = {
        ...req.body,
        updatedBy: req.user?.id,
        updatedAt: new Date()
      };

      const motorcycle = await storage.updateMotorcycle(id, motorcycleData);
      
      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found" });
      }
      
      res.json(motorcycle);
    } catch (error) {
      console.error(`Error updating motorcycle ID ${id}:`, error);
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
      console.error(`Error deleting motorcycle ID ${id}:`, error);
      res.status(500).json({ message: "Error deleting motorcycle", error });
    }
  });
  
  // Motorcycle Image API endpoints
  app.get("/api/motorcycles/:id/images", async (req, res) => {
    const motorcycleId = parseInt(req.params.id);
    try {
      const images = await storage.getMotorcycleImages(motorcycleId);
      res.json(images);
    } catch (error) {
      console.error(`Error fetching images for motorcycle ID ${motorcycleId}:`, error);
      res.status(500).json({ message: "Error fetching motorcycle images" });
    }
  });

  app.post("/api/motorcycles/:id/images", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const motorcycleId = parseInt(req.params.id);
    try {
      // Validate the motorcycle exists
      const motorcycle = await storage.getMotorcycle(motorcycleId);
      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found" });
      }
      
      const imageData: InsertMotorcycleImage = {
        ...req.body,
        motorcycleId
      };
      
      const motorcycleImage = await storage.createMotorcycleImage(imageData);
      res.status(201).json(motorcycleImage);
    } catch (error) {
      console.error(`Error adding image to motorcycle ID ${motorcycleId}:`, error);
      res.status(400).json({ message: "Invalid image data", error });
    }
  });

  app.delete("/api/motorcycles/images/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      await storage.deleteMotorcycleImage(id);
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting motorcycle image ID ${id}:`, error);
      res.status(500).json({ message: "Error deleting motorcycle image", error });
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

  // Supplier API endpoints
  app.get("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Error fetching suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      console.error(`Error fetching supplier ID ${id}:`, error);
      res.status(500).json({ message: "Error fetching supplier details" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Invalid supplier data", error });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      // Include update timestamp
      const supplierData = {
        ...req.body,
        updatedAt: new Date()
      };

      const supplier = await storage.updateSupplier(id, supplierData);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      console.error(`Error updating supplier ID ${id}:`, error);
      res.status(400).json({ message: "Invalid supplier data", error });
    }
  });

  // Purchase Order API endpoints
  app.get("/api/purchase-orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Error fetching purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const order = await storage.getPurchaseOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error(`Error fetching purchase order ID ${id}:`, error);
      res.status(500).json({ message: "Error fetching purchase order details" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderData = {
        ...req.body,
        createdBy: req.user?.id
      };
      
      const order = await storage.createPurchaseOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(400).json({ message: "Invalid purchase order data", error });
    }
  });

  // Inventory Transactions API endpoints
  app.get("/api/inventory-transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const motorcycleId = req.query.motorcycleId ? parseInt(req.query.motorcycleId as string) : undefined;
      const transactions = await storage.getInventoryTransactions(motorcycleId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "Error fetching inventory transactions" });
    }
  });

  app.post("/api/inventory-transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionData = {
        ...req.body,
        createdBy: req.user?.id
      };
      
      const transaction = await storage.createInventoryTransaction(transactionData);
      
      // Update the motorcycle stock level
      const motorcycle = await storage.getMotorcycle(transaction.motorcycleId);
      if (motorcycle) {
        const newStock = motorcycle.stock + transaction.quantity;
        await storage.updateMotorcycle(motorcycle.id, { 
          stock: newStock,
          // Update status based on new stock level and reorder point
          status: newStock <= 0 ? "out_of_stock" : (newStock <= (motorcycle.reorderPoint || 5) ? "low_stock" : "in_stock")
        });
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(400).json({ message: "Invalid inventory transaction data", error });
    }
  });

  // Dashboard API endpoints
  app.get("/api/dashboard/top-selling", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const topSellers = await storage.getTopSellingModels();
      res.json(topSellers);
    } catch (error) {
      console.error("Error retrieving top selling models:", error);
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time inventory updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Function to broadcast inventory updates to all connected clients
  const broadcastInventoryUpdate = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'inventory_update',
          data
        }));
      }
    });
  };
  
  return httpServer;
}
