import { 
  type Event, 
  type InsertEvent,
  type TimeSlot,
  type InsertTimeSlot,
  type Response,
  type InsertResponse,
  events,
  timeSlots,
  responses
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Generate a random 6-character alphanumeric short ID
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a unique short ID (check for duplicates)
async function generateUniqueShortId(): Promise<string> {
  let shortId = generateShortId();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const [existing] = await db.select().from(events).where(eq(events.shortId, shortId));
    if (!existing) {
      return shortId;
    }
    shortId = generateShortId();
    attempts++;
  }
  
  throw new Error("Failed to generate unique short ID after " + maxAttempts + " attempts");
}

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  createEventWithSlots(event: InsertEvent, slots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventByShortId(shortId: string): Promise<Event | undefined>;
  getEventByEditToken(token: string): Promise<Event | undefined>;
  updateEventWithSlots(eventId: string, title: string, slots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }>;
  
  // Time Slots
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]>;
  getTimeSlotsByEvent(eventId: string): Promise<TimeSlot[]>;
  deleteTimeSlotsByEvent(eventId: string): Promise<void>;
  
  // Responses
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByEvent(eventId: string): Promise<Response[]>;
}

export class DatabaseStorage implements IStorage {
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // Generate unique short ID
    const shortId = await generateUniqueShortId();
    
    const [event] = await db
      .insert(events)
      .values({ ...insertEvent, shortId })
      .returning();
    return event;
  }

  async createEventWithSlots(insertEvent: InsertEvent, insertSlots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }> {
    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Generate unique short ID
      const shortId = await generateUniqueShortId();
      
      const [event] = await tx
        .insert(events)
        .values({ ...insertEvent, shortId })
        .returning();
      
      if (insertSlots.length === 0) {
        throw new Error("Event must have at least one time slot");
      }

      const slots = await tx
        .insert(timeSlots)
        .values(insertSlots.map(slot => ({ ...slot, eventId: event.id })))
        .returning();
      
      return { event, timeSlots: slots };
    });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByShortId(shortId: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.shortId, shortId));
    return event || undefined;
  }

  async getEventByEditToken(token: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.editToken, token));
    return event || undefined;
  }

  async createTimeSlot(insertSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [slot] = await db
      .insert(timeSlots)
      .values(insertSlot)
      .returning();
    return slot;
  }

  async createTimeSlots(insertSlots: InsertTimeSlot[]): Promise<TimeSlot[]> {
    if (insertSlots.length === 0) return [];
    const slots = await db
      .insert(timeSlots)
      .values(insertSlots)
      .returning();
    return slots;
  }

  async getTimeSlotsByEvent(eventId: string): Promise<TimeSlot[]> {
    const slots = await db.select().from(timeSlots).where(eq(timeSlots.eventId, eventId));
    return slots;
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponsesByEvent(eventId: string): Promise<Response[]> {
    const responseList = await db.select().from(responses).where(eq(responses.eventId, eventId));
    return responseList;
  }

  async deleteTimeSlotsByEvent(eventId: string): Promise<void> {
    await db.delete(timeSlots).where(eq(timeSlots.eventId, eventId));
  }

  async updateEventWithSlots(eventId: string, title: string, insertSlots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }> {
    return await db.transaction(async (tx) => {
      // Update event title
      const [event] = await tx
        .update(events)
        .set({ title })
        .where(eq(events.id, eventId))
        .returning();
      
      if (!event) {
        throw new Error("Event not found");
      }

      // Delete existing time slots
      await tx.delete(timeSlots).where(eq(timeSlots.eventId, eventId));

      // Insert new time slots
      if (insertSlots.length === 0) {
        throw new Error("Event must have at least one time slot");
      }

      const slots = await tx
        .insert(timeSlots)
        .values(insertSlots.map(slot => ({ ...slot, eventId: event.id })))
        .returning();
      
      return { event, timeSlots: slots };
    });
  }
}

export const storage = new DatabaseStorage();
