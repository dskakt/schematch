import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { normalizeTimeSlot } from "../shared/timeUtils";
import { sendOrganizerEmail, sendResponseNotification } from "./email";
import { z } from "zod";
import { randomBytes } from "crypto";

const createEventRequestSchema = z.object({
  title: z.string().min(1),
  organizerEmail: z.string().email(),
  timeSlots: z.array(z.object({
    date: z.string(),
    time: z.string(),
  })).min(1),
});

const createResponseRequestSchema = z.object({
  participantName: z.string().min(1),
  availableSlotIds: z.array(z.string()),
  notes: z.string().optional(),
});

const updateEventRequestSchema = z.object({
  title: z.string().min(1),
  timeSlots: z.array(z.object({
    date: z.string(),
    time: z.string(),
  })).min(1),
  editToken: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create event with time slots
  app.post("/api/events", async (req, res) => {
    try {
      const data = createEventRequestSchema.parse(req.body);
      
      // Generate edit token
      const editToken = randomBytes(32).toString("hex");
      
      // Create event and time slots in a transaction
      const { event, timeSlots } = await storage.createEventWithSlots(
        {
          title: data.title,
          organizerEmail: data.organizerEmail,
          editToken,
        },
        data.timeSlots.map(slot => ({
          eventId: "", // Will be set by the transaction
          date: slot.date,
          time: normalizeTimeSlot(slot.time),
        }))
      );
      
      // Construct URLs for email
      const baseUrl = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : "http://localhost:5000";
      
      const participantLink = `${baseUrl}/event/${event.id}`;
      const resultsLink = `${baseUrl}/event/${event.id}/results`;
      
      // Send email to organizer (non-blocking)
      sendOrganizerEmail({
        organizerEmail: event.organizerEmail,
        eventTitle: event.title,
        eventId: event.id,
        participantLink,
        resultsLink,
      }).catch(error => {
        console.error("Failed to send organizer email:", error);
        // Don't fail the request if email sending fails
      });
      
      res.json({
        event,
        timeSlots,
        editToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });
  
  // Get event with time slots
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const timeSlots = await storage.getTimeSlotsByEvent(event.id);
      
      // Normalize time slots for consistent format
      const normalizedTimeSlots = timeSlots.map(slot => ({
        ...slot,
        time: normalizeTimeSlot(slot.time),
      }));
      
      res.json({
        event,
        timeSlots: normalizedTimeSlots,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });
  
  // Submit participant response
  app.post("/api/events/:id/responses", async (req, res) => {
    try {
      const data = createResponseRequestSchema.parse(req.body);
      
      // Verify event exists
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Validate that all slot IDs belong to this event
      const eventSlots = await storage.getTimeSlotsByEvent(req.params.id);
      const validSlotIds = new Set(eventSlots.map(slot => slot.id));
      const invalidSlots = data.availableSlotIds.filter(id => !validSlotIds.has(id));
      
      if (invalidSlots.length > 0) {
        return res.status(400).json({ 
          error: "Invalid slot IDs", 
          details: `The following slot IDs do not belong to this event: ${invalidSlots.join(", ")}`
        });
      }
      
      const response = await storage.createResponse({
        eventId: req.params.id,
        participantName: data.participantName,
        availableSlotIds: data.availableSlotIds,
        notes: data.notes,
      });

      // Construct results URL for email
      const baseUrl = process.env.REPL_SLUG 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : "http://localhost:5000";
      
      const resultsLink = `${baseUrl}/event/${event.id}/results`;

      // Send notification email to organizer (non-blocking)
      sendResponseNotification({
        organizerEmail: event.organizerEmail,
        eventTitle: event.title,
        participantName: data.participantName,
        resultsLink,
      }).catch(error => {
        console.error("Failed to send response notification email:", error);
        // Don't fail the request if email sending fails
      });
      
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error creating response:", error);
        res.status(500).json({ error: "Failed to create response" });
      }
    }
  });
  
  // Get all responses for an event
  app.get("/api/events/:id/responses", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const responses = await storage.getResponsesByEvent(req.params.id);
      
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Update event and time slots
  app.put("/api/events/:id", async (req, res) => {
    try {
      const data = updateEventRequestSchema.parse(req.body);
      
      // Verify event exists
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Verify edit token
      if (event.editToken !== data.editToken) {
        return res.status(403).json({ error: "Invalid edit token" });
      }

      // Update event and time slots
      const result = await storage.updateEventWithSlots(
        req.params.id,
        data.title,
        data.timeSlots.map(slot => ({
          eventId: req.params.id,
          date: slot.date,
          time: normalizeTimeSlot(slot.time),
        }))
      );

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
