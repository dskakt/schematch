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

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  createEventWithSlots(event: InsertEvent, slots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventByEditToken(token: string): Promise<Event | undefined>;
  
  // Time Slots
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]>;
  getTimeSlotsByEvent(eventId: string): Promise<TimeSlot[]>;
  
  // Responses
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByEvent(eventId: string): Promise<Response[]>;
}

export class DatabaseStorage implements IStorage {
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async createEventWithSlots(insertEvent: InsertEvent, insertSlots: InsertTimeSlot[]): Promise<{ event: Event; timeSlots: TimeSlot[] }> {
    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      const [event] = await tx
        .insert(events)
        .values(insertEvent)
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
}

export const storage = new DatabaseStorage();
