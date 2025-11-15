import { 
  type Event, 
  type InsertEvent,
  type TimeSlot,
  type InsertTimeSlot,
  type Response,
  type InsertResponse,
  type Poll,
  type InsertPoll,
  type PollOption,
  type InsertPollOption,
  type Vote,
  type InsertVote,
  events,
  timeSlots,
  responses,
  polls,
  pollOptions,
  votes
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

// Generate a unique short ID for events (check for duplicates)
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

// Generate a unique short ID for polls (check for duplicates)
async function generateUniquePollShortId(): Promise<string> {
  let shortId = generateShortId();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const [existing] = await db.select().from(polls).where(eq(polls.shortId, shortId));
    if (!existing) {
      return shortId;
    }
    shortId = generateShortId();
    attempts++;
  }
  
  throw new Error("Failed to generate unique poll short ID after " + maxAttempts + " attempts");
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
  
  // Polls
  createPollWithOptions(poll: InsertPoll, options: InsertPollOption[]): Promise<{ poll: Poll; options: PollOption[] }>;
  getPoll(id: string): Promise<Poll | undefined>;
  getPollByShortId(shortId: string): Promise<Poll | undefined>;
  getPollOptions(pollId: string): Promise<PollOption[]>;
  
  // Votes
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByPoll(pollId: string): Promise<Vote[]>;
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

  // Poll methods
  async createPollWithOptions(insertPoll: InsertPoll, insertOptions: InsertPollOption[]): Promise<{ poll: Poll; options: PollOption[] }> {
    return await db.transaction(async (tx) => {
      // Generate unique short ID
      const shortId = await generateUniquePollShortId();
      
      const [poll] = await tx
        .insert(polls)
        .values({ ...insertPoll, shortId })
        .returning();
      
      if (insertOptions.length === 0) {
        throw new Error("Poll must have at least one option");
      }

      const options = await tx
        .insert(pollOptions)
        .values(insertOptions.map(option => ({ ...option, pollId: poll.id })))
        .returning();
      
      return { poll, options };
    });
  }

  async getPoll(id: string): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll || undefined;
  }

  async getPollByShortId(shortId: string): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.shortId, shortId));
    return poll || undefined;
  }

  async getPollOptions(pollId: string): Promise<PollOption[]> {
    const options = await db.select().from(pollOptions).where(eq(pollOptions.pollId, pollId));
    return options;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    return vote;
  }

  async getVotesByPoll(pollId: string): Promise<Vote[]> {
    const voteList = await db.select().from(votes).where(eq(votes.pollId, pollId));
    return voteList;
  }
}

export const storage = new DatabaseStorage();
