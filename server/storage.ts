import { type User, type UpsertUser, type GraffitiLocation, type InsertGraffitiLocation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Graffiti location methods
  getGraffitiLocation(id: string): Promise<GraffitiLocation | undefined>;
  getAllGraffitiLocations(): Promise<GraffitiLocation[]>;
  getUserGraffitiLocations(userId: string): Promise<GraffitiLocation[]>;
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

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
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

  async getUserGraffitiLocations(userId: string): Promise<GraffitiLocation[]> {
    return Array.from(this.graffitiLocations.values())
      .filter(location => location.userId === userId)
      .sort((a, b) => 
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
