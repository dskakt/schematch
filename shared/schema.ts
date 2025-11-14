import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, unique, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  editToken: varchar("edit_token").notNull().unique(),
  shortId: varchar("short_id", { length: 6 }).notNull().unique(),
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
  notes: text("notes"),
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
  shortId: true,
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

// ========== ソレマッチ！(Poll/Voting) Schema ==========

export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  organizerEmail: text("organizer_email").notNull(),
  editToken: varchar("edit_token").notNull().unique(),
  shortId: varchar("short_id", { length: 6 }).notNull().unique(),
  allowMultiple: boolean("allow_multiple").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pollOptions = pgTable("poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  voterName: text("voter_name").notNull(),
  selectedOptionIds: text("selected_option_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const pollsRelations = relations(polls, ({ many }) => ({
  pollOptions: many(pollOptions),
  votes: many(votes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  poll: one(polls, {
    fields: [votes.pollId],
    references: [polls.id],
  }),
}));

// Insert schemas
export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  shortId: true,
  createdAt: true,
});

export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type PollOption = typeof pollOptions.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
