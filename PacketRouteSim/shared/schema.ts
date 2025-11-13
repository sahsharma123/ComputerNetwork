import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Network Simulator Types
export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'router' | 'source' | 'destination';
}

export interface NetworkEdge {
  from: string;
  to: string;
  cost: number;
}

export interface Network {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface PathSegment {
  from: NetworkNode;
  to: NetworkNode;
  edge: NetworkEdge;
}

export interface SimulationState {
  sourceNodeId: string | null;
  destinationNodeId: string | null;
  path: PathSegment[];
  isAnimating: boolean;
  isComplete: boolean;
  message: string;
}
