import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGraffitiLocationSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Public file serving endpoint
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Object serving endpoint for uploaded photos
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for photos
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Get all graffiti locations for authenticated user
  app.get("/api/locations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locations = await storage.getUserGraffitiLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get specific graffiti location
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getGraffitiLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  // Create new graffiti location
  app.post("/api/locations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertGraffitiLocationSchema.parse({
        ...req.body,
        userId
      });
      
      // Normalize photo URLs if they're upload URLs
      if (validatedData.photos && validatedData.photos.length > 0) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPhotos = (validatedData.photos as string[]).map((photoUrl: string) => 
          objectStorageService.normalizeObjectEntityPath(photoUrl)
        );
        validatedData.photos = normalizedPhotos;
      }

      const location = await storage.createGraffitiLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid location data", details: error.message });
      }
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  // Update graffiti location
  app.put("/api/locations/:id", async (req, res) => {
    try {
      const validatedData = insertGraffitiLocationSchema.partial().parse(req.body);
      
      // Normalize photo URLs if they're upload URLs
      if (validatedData.photos && validatedData.photos.length > 0) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPhotos = (validatedData.photos as string[]).map((photoUrl: string) => 
          objectStorageService.normalizeObjectEntityPath(photoUrl)
        );
        validatedData.photos = normalizedPhotos;
      }

      const location = await storage.updateGraffitiLocation(req.params.id, validatedData);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error updating location:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid location data", details: error.message });
      }
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  // Delete graffiti location
  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGraffitiLocation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
