# スケマッチ (MeetSync)

## Overview

MeetSync is a scheduling coordination application that helps users create scheduling polls and coordinate meetings. The application allows organizers to create events with multiple time slot options, share links with participants to mark their availability, and view aggregated results to find the best meeting time.

The application follows a modern SaaS design pattern inspired by Linear and Notion, emphasizing clarity, efficiency, and progressive disclosure through a multi-step creation flow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system based on "New York" style variant
- Custom color palette with neutral base colors and primary blue accent (hsl(217 91% 60%))

**Key Design Decisions:**
- Multi-step form flow for event creation (details → time selection → confirmation)
- Weekly calendar grid interface for time slot selection
- Responsive mobile-first design
- Utility-focused, minimalist aesthetic prioritizing clarity

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Custom middleware for request logging and JSON parsing
- Vite integration for development hot-reloading

**API Design:**
- RESTful API endpoints under `/api` prefix
- POST `/api/events` - Create event with time slots
- POST `/api/events/:id/responses` - Submit participant availability
- GET `/api/events/:id` - Retrieve event details
- GET `/api/events/:id/responses` - Retrieve all responses

**Security:**
- Edit tokens for organizer-only access (32-byte random hex strings)
- Email validation using Zod schemas
- Input validation on all endpoints

### Data Storage

**Database:**
- PostgreSQL via Neon serverless
- Drizzle ORM for type-safe database queries
- WebSocket support for serverless PostgreSQL connections

**Schema Design:**
- `events` table: Stores event metadata (title, organizer email, edit token)
- `time_slots` table: Stores available time options for each event
- `responses` table: Stores participant availability with array of selected slot IDs
- Cascade delete relationships ensure cleanup when events are deleted

**Key Decisions:**
- UUIDs (gen_random_uuid()) for primary keys
- ISO date strings for date storage
- Array column for storing multiple availability selections
- Timestamps for all records (createdAt)

### External Dependencies

**Database Service:**
- Neon Database - Serverless PostgreSQL hosting
- Connection pooling via @neondatabase/serverless
- WebSocket-based connections for serverless environments

**UI Component Libraries:**
- Radix UI - Unstyled, accessible component primitives
- Lucide React - Icon library
- react-day-picker - Calendar/date picker component
- cmdk - Command palette component
- embla-carousel-react - Carousel functionality

**Utility Libraries:**
- date-fns - Date manipulation and formatting
- Zod - Runtime type validation and schema parsing
- drizzle-zod - Integration between Drizzle ORM and Zod
- class-variance-authority - Variant-based component styling
- tailwind-merge & clsx - Conditional className utilities
- resend - Email delivery service for transactional emails

**Development Tools:**
- TypeScript - Type safety across frontend and backend
- ESBuild - Fast JavaScript bundler for production builds
- tsx - TypeScript execution for development server
- Replit-specific plugins for development environment integration

**Font Loading:**
- Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- Loaded via CDN in HTML head

## Recent Changes

### November 9, 2025

**UI Improvements:**
- Implemented sticky calendar headers that remain fixed when scrolling
  - Date/day headers stay at top during vertical scroll
  - Time labels stay fixed on left during horizontal scroll
  - Maximum calendar height set to 600px with overflow scrolling
  - Applied to both WeeklyCalendar and ResultsCalendar components

**Email Notification System:**
- Implemented email notification system using Resend
- Created `server/email.ts` module for email handling
- Email automatically sent to organizer on event creation with:
  - Participant link for sharing
  - Edit link with secure token for organizer-only access
  - HTML-formatted email with clear visual sections
- **Configuration:**
  - Set `RESEND_API_KEY` environment variable to enable actual email delivery
  - Without API key: Falls back to console logging (development mode)
  - With API key: Sends actual emails via Resend service
- Email sending is non-blocking - event creation succeeds even if email fails
- Installed `resend` npm package for email delivery