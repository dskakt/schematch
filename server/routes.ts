import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { normalizeTimeSlot } from "../shared/timeUtils";
import { sendOrganizerEmail, sendResponseNotification, sendPollOrganizerEmail, sendPollVoteNotification } from "./email";
import { z } from "zod";
import { randomBytes } from "crypto";

// Helper function to get trusted base URL from environment
// NOTE: For production deployments, set the BASE_URL environment variable
// to your app's public URL (e.g., https://your-app.replit.app)
function getTrustedBaseUrl(): string {
  let baseUrl: string;
  
  // Priority 1: Custom BASE_URL (recommended for production)
  if (process.env.BASE_URL) {
    baseUrl = process.env.BASE_URL;
  }
  // Priority 2: REPLIT_DEV_DOMAIN (workspace environment)
  else if (process.env.REPLIT_DEV_DOMAIN) {
    const domain = process.env.REPLIT_DEV_DOMAIN;
    // If domain already has protocol, use as-is
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      baseUrl = domain;
    } else {
      // Otherwise, add https protocol
      baseUrl = `https://${domain}`;
    }
  }
  // Priority 3: Default to localhost for local development
  else {
    baseUrl = "http://localhost:5000";
  }
  
  // Normalize: remove trailing slash
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

const createEventRequestSchema = z.object({
  title: z.string().min(1),
  organizerEmail: z.string().email(),
  timeSlots: z.array(z.object({
    date: z.string(),
    time: z.string(),
  })).min(1),
  origin: z.string().url().optional(),
});

const createResponseRequestSchema = z.object({
  participantName: z.string().min(1),
  availableSlotIds: z.array(z.string()),
  notes: z.string().optional(),
  origin: z.string().url().optional(),
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
      
      // Construct URLs for email (using short URLs)
      // Use origin from request if it's a valid Replit domain, localhost, or matches trusted URL
      let baseUrl = getTrustedBaseUrl();
      if (data.origin) {
        try {
          const originUrl = new URL(data.origin);
          const trustedUrl = new URL(baseUrl);
          // Trust the origin if it's localhost, matches trusted domain, or is a Replit domain
          const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
          const isSameDomain = originUrl.hostname === trustedUrl.hostname;
          const isReplitDomain = originUrl.hostname.endsWith('.replit.app') || originUrl.hostname.endsWith('.repl.co');
          
          if (isLocalhost || isSameDomain || isReplitDomain) {
            baseUrl = data.origin;
          } else {
            console.warn('Untrusted origin rejected:', data.origin);
          }
        } catch (error) {
          // Invalid URL, use trusted base URL
          console.warn('Invalid origin URL provided:', data.origin);
        }
      }
      // Use short URLs for easier sharing
      const participantLink = `${baseUrl}/e/${event.shortId}`;
      const resultsLink = `${baseUrl}/r/${event.shortId}`;
      
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

      // Construct URLs for email (using short URLs)
      // Use origin from request if it's a valid Replit domain, localhost, or matches trusted URL
      let baseUrl = getTrustedBaseUrl();
      if (data.origin) {
        try {
          const originUrl = new URL(data.origin);
          const trustedUrl = new URL(baseUrl);
          // Trust the origin if it's localhost, matches trusted domain, or is a Replit domain
          const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
          const isSameDomain = originUrl.hostname === trustedUrl.hostname;
          const isReplitDomain = originUrl.hostname.endsWith('.replit.app') || originUrl.hostname.endsWith('.repl.co');
          
          if (isLocalhost || isSameDomain || isReplitDomain) {
            baseUrl = data.origin;
          } else {
            console.warn('Untrusted origin rejected:', data.origin);
          }
        } catch (error) {
          // Invalid URL, use trusted base URL
          console.warn('Invalid origin URL provided:', data.origin);
        }
      }
      // Use short URLs for easier sharing
      const participantLink = `${baseUrl}/e/${event.shortId}`;
      const resultsLink = `${baseUrl}/r/${event.shortId}`;

      // Get all responses (including the one just created) to list participants
      const allResponses = await storage.getResponsesByEvent(req.params.id);
      const participantNames = allResponses.map(r => r.participantName);

      // Send notification email to organizer (non-blocking)
      sendResponseNotification({
        organizerEmail: event.organizerEmail,
        eventTitle: event.title,
        participantNames,
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

  // ========== Poll API Endpoints ==========
  
  const createPollRequestSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    organizerEmail: z.string().email(),
    allowMultiple: z.boolean().default(false),
    options: z.array(z.object({
      text: z.string().min(1),
    })).min(2, "Poll must have at least 2 options"),
    origin: z.string().url().optional(),
  });
  
  const createVoteRequestSchema = z.object({
    voterName: z.string().min(1),
    selectedOptionIds: z.array(z.string()).min(1, "Please select at least one option"),
    origin: z.string().url().optional(),
  });
  
  // Create poll with options
  app.post("/api/polls", async (req, res) => {
    try {
      const data = createPollRequestSchema.parse(req.body);
      
      // Generate edit token
      const editToken = randomBytes(32).toString("hex");
      
      // Create poll and options in a transaction
      const { poll, pollOptions } = await storage.createPollWithOptions(
        {
          title: data.title,
          description: data.description || null,
          organizerEmail: data.organizerEmail,
          editToken,
          allowMultiple: data.allowMultiple,
        },
        data.options.map(option => ({
          pollId: "", // Will be set by the transaction
          text: option.text,
        }))
      );
      
      // Construct URLs for email (using short URLs)
      let baseUrl = getTrustedBaseUrl();
      if (data.origin) {
        try {
          const originUrl = new URL(data.origin);
          const trustedUrl = new URL(baseUrl);
          const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
          const isSameDomain = originUrl.hostname === trustedUrl.hostname;
          const isReplitDomain = originUrl.hostname.endsWith('.replit.app') || originUrl.hostname.endsWith('.repl.co');
          
          if (isLocalhost || isSameDomain || isReplitDomain) {
            baseUrl = data.origin;
          } else {
            console.warn('Untrusted origin rejected:', data.origin);
          }
        } catch (error) {
          console.warn('Invalid origin URL provided:', data.origin);
        }
      }
      
      // Use short URLs for easier sharing
      const participantLink = `${baseUrl}/p/${poll.shortId}`;
      const resultsLink = `${baseUrl}/pr/${poll.shortId}`;
      
      // Send email to organizer (non-blocking)
      sendPollOrganizerEmail({
        organizerEmail: poll.organizerEmail,
        pollTitle: poll.title,
        pollId: poll.id,
        participantLink,
        resultsLink,
      }).catch(error => {
        console.error("Failed to send organizer email:", error);
        // Don't fail the request if email sending fails
      });
      
      res.json({ poll, pollOptions, participantLink, resultsLink });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error creating poll:", error);
        res.status(500).json({ error: "Failed to create poll" });
      }
    }
  });
  
  // Get poll by ID
  app.get("/api/polls/:id", async (req, res) => {
    try {
      const poll = await storage.getPoll(req.params.id);
      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }
      res.json(poll);
    } catch (error) {
      console.error("Error getting poll:", error);
      res.status(500).json({ error: "Failed to get poll" });
    }
  });
  
  // Get poll options
  app.get("/api/polls/:id/options", async (req, res) => {
    try {
      const options = await storage.getPollOptionsByPoll(req.params.id);
      res.json(options);
    } catch (error) {
      console.error("Error getting poll options:", error);
      res.status(500).json({ error: "Failed to get poll options" });
    }
  });
  
  // Submit vote
  app.post("/api/polls/:id/votes", async (req, res) => {
    try {
      const data = createVoteRequestSchema.parse(req.body);
      
      // Verify poll exists
      const poll = await storage.getPoll(req.params.id);
      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }
      
      // Get poll options to validate ownership
      const options = await storage.getPollOptionsByPoll(req.params.id);
      const validOptionIds = new Set(options.map(opt => opt.id));
      
      // Validate that ALL selected options belong to this poll
      for (const optionId of data.selectedOptionIds) {
        if (!validOptionIds.has(optionId)) {
          return res.status(400).json({ 
            error: `Invalid option ID: ${optionId}. This option does not belong to the specified poll.` 
          });
        }
      }
      
      // If single choice poll, ensure only one option is selected
      if (!poll.allowMultiple && data.selectedOptionIds.length > 1) {
        return res.status(400).json({ error: "This poll only allows one choice" });
      }
      
      // Create vote
      const vote = await storage.createVote({
        pollId: req.params.id,
        voterName: data.voterName,
        selectedOptionIds: data.selectedOptionIds,
      });
      
      // Get all votes to send in notification
      const allVotes = await storage.getVotesByPoll(req.params.id);
      const voterNames = allVotes.map(v => v.voterName);
      
      // Construct result link
      let baseUrl = getTrustedBaseUrl();
      if (data.origin) {
        try {
          const originUrl = new URL(data.origin);
          const trustedUrl = new URL(baseUrl);
          const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
          const isSameDomain = originUrl.hostname === trustedUrl.hostname;
          const isReplitDomain = originUrl.hostname.endsWith('.replit.app') || originUrl.hostname.endsWith('.repl.co');
          
          if (isLocalhost || isSameDomain || isReplitDomain) {
            baseUrl = data.origin;
          }
        } catch (error) {
          console.warn('Invalid origin URL provided:', data.origin);
        }
      }
      
      const resultsLink = `${baseUrl}/pr/${poll.shortId}`;
      
      // Send notification email to organizer (non-blocking)
      sendPollVoteNotification({
        organizerEmail: poll.organizerEmail,
        pollTitle: poll.title,
        voterNames,
        resultsLink,
      }).catch(error => {
        console.error("Failed to send vote notification:", error);
        // Don't fail the request if email sending fails
      });
      
      res.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error submitting vote:", error);
        res.status(500).json({ error: "Failed to submit vote" });
      }
    }
  });
  
  // Get votes for a poll
  app.get("/api/polls/:id/votes", async (req, res) => {
    try {
      const votes = await storage.getVotesByPoll(req.params.id);
      res.json(votes);
    } catch (error) {
      console.error("Error getting votes:", error);
      res.status(500).json({ error: "Failed to get votes" });
    }
  });
  
  // Short URL redirect: /p/:shortId -> /sorematch/poll/:id
  app.get("/p/:shortId", async (req, res) => {
    try {
      const poll = await storage.getPollByShortId(req.params.shortId);
      if (!poll) {
        return res.status(404).send("Poll not found");
      }
      res.redirect(301, `/sorematch/poll/${poll.id}`);
    } catch (error) {
      console.error("Error redirecting poll short URL:", error);
      res.status(500).send("Internal server error");
    }
  });
  
  // Short URL redirect: /pr/:shortId -> /sorematch/poll/:id/results
  app.get("/pr/:shortId", async (req, res) => {
    try {
      const poll = await storage.getPollByShortId(req.params.shortId);
      if (!poll) {
        return res.status(404).send("Poll not found");
      }
      res.redirect(301, `/sorematch/poll/${poll.id}/results`);
    } catch (error) {
      console.error("Error redirecting poll results short URL:", error);
      res.status(500).send("Internal server error");
    }
  });
  
  // ========== Event Short URL Redirects ==========
  
  // Short URL redirect: /e/:shortId -> /event/:id
  app.get("/e/:shortId", async (req, res) => {
    try {
      const event = await storage.getEventByShortId(req.params.shortId);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      res.redirect(301, `/event/${event.id}`);
    } catch (error) {
      console.error("Error redirecting short URL:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Short URL redirect: /r/:shortId -> /event/:id/results
  app.get("/r/:shortId", async (req, res) => {
    try {
      const event = await storage.getEventByShortId(req.params.shortId);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      res.redirect(301, `/event/${event.id}/results`);
    } catch (error) {
      console.error("Error redirecting short URL:", error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
