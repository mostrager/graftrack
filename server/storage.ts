import { users, graffitiLocations, prospects, type User, type UpsertUser, type GraffitiLocation, type InsertGraffitiLocation, type Prospect, type InsertProspect } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
  
  // Prospect methods
  getProspect(id: string): Promise<Prospect | undefined>;
  getAllProspects(): Promise<Prospect[]>;
  getUserProspects(userId: string): Promise<Prospect[]>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: string, prospect: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private graffitiLocations: Map<string, GraffitiLocation>;
  private prospects: Map<string, Prospect>;

  constructor() {
    this.users = new Map();
    this.graffitiLocations = new Map();
    this.prospects = new Map();
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
      id,
      userId: insertLocation.userId ?? null,
      latitude: insertLocation.latitude,
      longitude: insertLocation.longitude,
      title: insertLocation.title,
      type: insertLocation.type ?? 'Tag',
      city: insertLocation.city ?? null,
      address: insertLocation.address ?? null,
      description: insertLocation.description ?? null,
      tags: (insertLocation.tags as string[]) ?? [],
      photos: (insertLocation.photos as string[]) ?? [],
      photoHeadings: insertLocation.photoHeadings ? (insertLocation.photoHeadings as number[]) : null,
      createdAt: new Date(),
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
      photoHeadings: updateData.photoHeadings !== undefined ? (updateData.photoHeadings ? (updateData.photoHeadings as number[]) : null) : existing.photoHeadings,
    };
    this.graffitiLocations.set(id, updated);
    return updated;
  }

  async deleteGraffitiLocation(id: string): Promise<boolean> {
    return this.graffitiLocations.delete(id);
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    return this.prospects.get(id);
  }

  async getAllProspects(): Promise<Prospect[]> {
    return Array.from(this.prospects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUserProspects(userId: string): Promise<Prospect[]> {
    return Array.from(this.prospects.values())
      .filter(prospect => prospect.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const id = randomUUID();
    const prospect: Prospect = {
      ...insertProspect,
      id,
      userId: insertProspect.userId ?? null,
      createdAt: new Date(),
      notes: insertProspect.notes ?? null,
      city: insertProspect.city ?? null,
      address: insertProspect.address ?? null,
    };
    this.prospects.set(id, prospect);
    return prospect;
  }

  async updateProspect(id: string, updateData: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const existing = this.prospects.get(id);
    if (!existing) return undefined;

    const updated: Prospect = {
      ...existing,
      ...updateData,
      notes: updateData.notes !== undefined ? updateData.notes ?? null : existing.notes,
      city: updateData.city !== undefined ? updateData.city ?? null : existing.city,
      address: updateData.address !== undefined ? updateData.address ?? null : existing.address,
    };
    this.prospects.set(id, updated);
    return updated;
  }

  async deleteProspect(id: string): Promise<boolean> {
    return this.prospects.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getGraffitiLocation(id: string): Promise<GraffitiLocation | undefined> {
    const [location] = await db.select().from(graffitiLocations).where(eq(graffitiLocations.id, id));
    return location;
  }

  async getAllGraffitiLocations(): Promise<GraffitiLocation[]> {
    const locations = await db.select().from(graffitiLocations).orderBy(graffitiLocations.createdAt);
    return locations;
  }

  async getUserGraffitiLocations(userId: string): Promise<GraffitiLocation[]> {
    const locations = await db
      .select()
      .from(graffitiLocations)
      .where(eq(graffitiLocations.userId, userId))
      .orderBy(graffitiLocations.createdAt);
    return locations;
  }

  async createGraffitiLocation(insertLocation: InsertGraffitiLocation): Promise<GraffitiLocation> {
    const locationData: any = {
      latitude: insertLocation.latitude,
      longitude: insertLocation.longitude,
      title: insertLocation.title,
      type: insertLocation.type || 'Tag',
      userId: insertLocation.userId || null,
      city: insertLocation.city || null,
      address: insertLocation.address || null,
      description: insertLocation.description || null,
      tags: Array.isArray(insertLocation.tags) ? insertLocation.tags : [],
      photos: Array.isArray(insertLocation.photos) ? insertLocation.photos : [],
      photoHeadings: insertLocation.photoHeadings ? (insertLocation.photoHeadings as number[]) : null,
    };
    const [location] = await db
      .insert(graffitiLocations)
      .values(locationData)
      .returning();
    return location;
  }

  async updateGraffitiLocation(id: string, updateData: Partial<InsertGraffitiLocation>): Promise<GraffitiLocation | undefined> {
    const cleanedData: any = {};
    if (updateData.latitude !== undefined) cleanedData.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) cleanedData.longitude = updateData.longitude;
    if (updateData.userId !== undefined) cleanedData.userId = updateData.userId;
    if (updateData.city !== undefined) cleanedData.city = updateData.city;
    if (updateData.address !== undefined) cleanedData.address = updateData.address;
    if (updateData.description !== undefined) cleanedData.description = updateData.description;
    if (updateData.tags !== undefined) cleanedData.tags = updateData.tags || [];
    if (updateData.photos !== undefined) cleanedData.photos = updateData.photos || [];
    if (updateData.photoHeadings !== undefined) cleanedData.photoHeadings = updateData.photoHeadings ? (updateData.photoHeadings as number[]) : null;
    if (updateData.type !== undefined) cleanedData.type = updateData.type;
    
    const [updated] = await db
      .update(graffitiLocations)
      .set(cleanedData)
      .where(eq(graffitiLocations.id, id))
      .returning();
    return updated;
  }

  async deleteGraffitiLocation(id: string): Promise<boolean> {
    const result = await db.delete(graffitiLocations).where(eq(graffitiLocations.id, id));
    return true;
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, id));
    return prospect;
  }

  async getAllProspects(): Promise<Prospect[]> {
    const prospectList = await db.select().from(prospects).orderBy(prospects.createdAt);
    return prospectList;
  }

  async getUserProspects(userId: string): Promise<Prospect[]> {
    const prospectList = await db
      .select()
      .from(prospects)
      .where(eq(prospects.userId, userId))
      .orderBy(prospects.createdAt);
    return prospectList;
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const prospectData = {
      ...insertProspect,
      notes: insertProspect.notes || null,
      city: insertProspect.city || null,
      address: insertProspect.address || null,
    };
    const [prospect] = await db
      .insert(prospects)
      .values(prospectData)
      .returning();
    return prospect;
  }

  async updateProspect(id: string, updateData: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const cleanedData: any = {};
    if (updateData.latitude !== undefined) cleanedData.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) cleanedData.longitude = updateData.longitude;
    if (updateData.userId !== undefined) cleanedData.userId = updateData.userId;
    if (updateData.notes !== undefined) cleanedData.notes = updateData.notes;
    if (updateData.city !== undefined) cleanedData.city = updateData.city;
    if (updateData.address !== undefined) cleanedData.address = updateData.address;
    
    const [updated] = await db
      .update(prospects)
      .set(cleanedData)
      .where(eq(prospects.id, id))
      .returning();
    return updated;
  }

  async deleteProspect(id: string): Promise<boolean> {
    const result = await db.delete(prospects).where(eq(prospects.id, id));
    return true;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
