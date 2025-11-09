import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  editToken: varchar("edit_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // Store as ISO date string
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  participantName: text("participant_name").notNull(),
  availableSlotIds: text("available_slot_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  timeSlots: many(timeSlots),
  responses: many(responses),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one }) => ({
  event: one(events, {
    fields: [timeSlots.eventId],
    references: [events.id],
  }),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  event: one(events, {
    fields: [responses.eventId],
    references: [events.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
