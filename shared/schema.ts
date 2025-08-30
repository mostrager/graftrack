import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const graffitiLocations = pgTable("graffiti_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  title: text("title").notNull(),
  city: text("city"),
  address: text("address"),
  description: text("description"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGraffitiLocationSchema = createInsertSchema(graffitiLocations).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type GraffitiLocation = typeof graffitiLocations.$inferSelect;
export type InsertGraffitiLocation = z.infer<typeof insertGraffitiLocationSchema>;
