import { type User, type InsertUser, type GraffitiLocation, type InsertGraffitiLocation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Graffiti location methods
  getGraffitiLocation(id: string): Promise<GraffitiLocation | undefined>;
  getAllGraffitiLocations(): Promise<GraffitiLocation[]>;
  createGraffitiLocation(location: InsertGraffitiLocation): Promise<GraffitiLocation>;
  updateGraffitiLocation(id: string, location: Partial<InsertGraffitiLocation>): Promise<GraffitiLocation | undefined>;
  deleteGraffitiLocation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private graffitiLocations: Map<string, GraffitiLocation>;

  constructor() {
    this.users = new Map();
    this.graffitiLocations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGraffitiLocation(id: string): Promise<GraffitiLocation | undefined> {
    return this.graffitiLocations.get(id);
  }

  async getAllGraffitiLocations(): Promise<GraffitiLocation[]> {
    return Array.from(this.graffitiLocations.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createGraffitiLocation(insertLocation: InsertGraffitiLocation): Promise<GraffitiLocation> {
    const id = randomUUID();
    const location: GraffitiLocation = {
      ...insertLocation,
      id,
      createdAt: new Date(),
      address: insertLocation.address ?? null,
      description: insertLocation.description ?? null,
      tags: (insertLocation.tags as string[]) ?? [],
      photos: (insertLocation.photos as string[]) ?? [],
    };
    this.graffitiLocations.set(id, location);
    return location;
  }

  async updateGraffitiLocation(id: string, updateData: Partial<InsertGraffitiLocation>): Promise<GraffitiLocation | undefined> {
    const existing = this.graffitiLocations.get(id);
    if (!existing) return undefined;

    const updated: GraffitiLocation = {
      ...existing,
      ...updateData,
      address: updateData.address !== undefined ? updateData.address ?? null : existing.address,
      description: updateData.description !== undefined ? updateData.description ?? null : existing.description,
      tags: updateData.tags !== undefined ? (updateData.tags as string[]) ?? [] : existing.tags,
      photos: updateData.photos !== undefined ? (updateData.photos as string[]) ?? [] : existing.photos,
    };
    this.graffitiLocations.set(id, updated);
    return updated;
  }

  async deleteGraffitiLocation(id: string): Promise<boolean> {
    return this.graffitiLocations.delete(id);
  }
}

export const storage = new MemStorage();
