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

### November 11, 2025

**Email Link Security & URL Construction:**
- Fixed email link construction to prevent Host header injection vulnerabilities
- Implemented `getTrustedBaseUrl()` helper function for secure URL generation
- URL construction priority:
  1. `BASE_URL` environment variable (recommended for production deployments)
  2. `REPLIT_DEV_DOMAIN` environment variable (workspace environment)
  3. `http://localhost:5000` (local development fallback)
- **IMPORTANT:** For production deployments, set the `BASE_URL` environment variable to your app's public URL (e.g., `https://your-app.replit.app`)
- URL normalization: Handles protocol prefixes and trailing slashes automatically

**Participant Response Notifications:**
- Implemented email notification to organizer when participants submit responses
- Notification email contains:
  - Participant name
  - Event title
  - Direct link to results page
- Notification is sent asynchronously (non-blocking)
- Email sending failures do not affect response submission success

**Email Content Improvements:**
- Removed duplicate heading in response notification email (was redundant with subject line)
- Simplified email layout for better readability

**Event Edit Functionality Removed:**
- Removed event editing feature to simplify user experience
- Organizer links now point directly to results page instead of edit page
- Deleted EditEventPage component and related routes
- Updated email notifications to send results link instead of edit link

**Email Notification Updates:**
- Replaced "organizer edit link" with "organizer results link"
- Simplified email content:
  - Removed greeting text and redundant messages
  - Moved "Thank you for using" message above participant link
  - Clear sections for participant link and results link
- Updated EventConfirmation component to show results link

**Results Display Improvements:**
- Changed availability display from icons to Japanese text symbols
- Participant availability now shown as:
  - 参加可能（available）: ○ (blue, bold)
  - 参加不可（unavailable）: × (gray, bold)
- Updated ResultsView component to use text spans instead of Lucide icons
- Improved visual clarity with larger, bolder symbols
- "View Results" button changed to "回答せず集計結果を見る" (View results without responding)

**Footer and Static Pages:**
- Created Footer component (`client/src/components/Footer.tsx`)
  - Displays links to Terms of Service, Privacy Policy, and Contact pages
  - Responsive design (vertical on mobile, horizontal on desktop)
  - Copyright notice "© 2025 スケマッチ"
  - Fixed React warnings by removing nested anchor tags
- Added Footer to CreateEvent page (both form and confirmation states)
  - Used flex layout to pin footer to bottom
- Created three static pages:
  - Terms of Service page (`client/src/pages/TermsOfService.tsx`)
  - Privacy Policy page (`client/src/pages/PrivacyPolicy.tsx`)
  - Contact page (`client/src/pages/Contact.tsx`)
  - Contact email updated to `schematch.office@gmail.com`
- All static pages include:
  - Header component for consistency
  - Structured content in Card component
  - "トップページに戻る" (Back to home) button
- Added routing for new pages in App.tsx:
  - `/terms` - Terms of Service
  - `/privacy` - Privacy Policy
  - `/contact` - Contact

**Email Link Improvements:**
- Fixed email link mismatch issue where links in emails differed from confirmation page
- Frontend now sends `origin` (window.location.origin) to backend
- Backend validates and uses frontend's origin if it's a Replit domain, localhost, or matches trusted URL
- Security: Prevents phishing attacks by validating origin
- Validation rules:
  - Accept: localhost, 127.0.0.1, Replit domains (*.replit.app, *.repl.co), or exact match with trusted base URL hostname
  - Reject: All other origins (with warning logged)
- Falls back to `getTrustedBaseUrl()` if origin validation fails
- This ensures email links always match the confirmation page links while maintaining security
- Updated both event creation and participant response flows

**Results Display Sorting:**
- Individual responses table now sorts time slots by date first, then by time
- Implemented `timeToMinutes` parser that correctly handles various time formats:
  - "8:00-8:30 AM" → 8:00 (480 minutes)
  - "11:30 AM-12:00 PM" → 11:30 (690 minutes)
  - "1:00-1:30 PM" → 13:00 (780 minutes)
  - "12:30-1:00 PM" → 12:30 (750 minutes)
- Parser extracts first time and AM/PM marker from time range strings
- Handles 12-hour format with proper AM/PM conversion (12 AM → 0:00, 12 PM → 12:00)
- Unparseable time slots are pushed to the end of the table
- ResultsCalendar component unchanged (uses grid-based display, not affected by sort order)

**UI Improvements:**
- Added helper text below email input on event creation form
- Changed helper text from "参加者の予定を送信します" to "集計結果を送信します"
- Clarifies that the email will receive aggregated results

**Calendar Display Improvements:**
- Calendar date headers show day only: "d日" format (e.g., "9日", "10日")
- Time column header features diagonal line separator dividing month and time labels:
  - Month displayed in top-right corner (e.g., "11月")
  - Time label displayed in bottom-left corner ("時間")
  - Diagonal line runs from top-left to bottom-right using CSS linear-gradient
- Applied consistently to both WeeklyCalendar and ResultsCalendar components
- "今週" (This week) button enlarged for better visibility (text-base font-medium)

**Email Subject and Content Updates:**
- Participant response notification email subject changed from "[スケマッチ] 新しい回答が届きました - ${eventTitle}" to "${eventTitle} - 新しい回答が届きました"
- Subject now leads with event name for better clarity
- Removed duplicate heading from event creation email body (was redundant with subject line: "スケマッチ イベント「${eventTitle}」を作成しました")
- Email now starts directly with greeting message for cleaner layout

**UI Layout Updates:**
- Moved email confirmation message ("このリンクを含む確認メールがメールアドレスに送信されました") from inside results link card to below it
- Message now displays as centered text beneath the results link card for better visual hierarchy

**Individual Responses Table Layout:**
- Transposed individual responses table: swapped rows and columns
- Table now shows:
  - Row headers: Time slots (one per row)
  - Column headers: Participant names (one per column)
  - Previous layout had time slots as columns and participants as rows
- This makes it easier to compare participants' availability for each time slot horizontally
- Table cells and headers are left-aligned for better readability

**Google Analytics Integration:**
- Integrated Google Analytics 4 for tracking page views and user interactions
- Created analytics utility files:
  - `client/src/lib/analytics.ts` - Core GA functions (initGA, trackPageView, trackEvent)
  - `client/src/hooks/use-analytics.tsx` - Hook for automatic page view tracking on route changes
  - `client/src/env.d.ts` - TypeScript definitions for VITE_GA_MEASUREMENT_ID
- Updated App.tsx to initialize Google Analytics on mount and track page views automatically
- Requires `VITE_GA_MEASUREMENT_ID` environment variable (set in Replit Secrets)
- GA script is dynamically loaded into the document head
- Page views are automatically tracked when users navigate between routes

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
  - HTML-formatted email with clear visual sections (fully localized in Japanese)
- **Configuration:**
  - Set `RESEND_API_KEY` environment variable to enable actual email delivery
  - Without API key: Falls back to console logging (development mode)
  - With API key: Sends actual emails via Resend service
- Email sending is non-blocking - event creation succeeds even if email fails
- Installed `resend` npm package for email delivery
- **Note:** User declined Replit Resend integration - using direct API key setup instead
- **To enable email sending:** User needs to obtain API key from https://resend.com/ and add it to Replit Secrets as RESEND_API_KEY