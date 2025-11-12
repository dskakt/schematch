# スケマッチ (MeetSync)

## Overview

MeetSync is a scheduling coordination application designed to streamline meeting and event coordination. It enables users to create scheduling polls with multiple time slot options, share these polls with participants to gather availability, and then view aggregated results to identify the most suitable meeting times. The application aims for a modern SaaS user experience, drawing inspiration from platforms like Linear and Notion, emphasizing clarity, efficiency, and a guided multi-step event creation process. It targets a business vision of simplifying scheduling for individuals and organizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework:** React with TypeScript, Vite for tooling, Wouter for routing, and TanStack Query for server state management.
- **UI/UX:** Utilizes Shadcn/ui and Radix UI for components, styled with Tailwind CSS and custom design tokens. Features a "New York" design variant with a primary blue accent.
- **Key Features:** Multi-step form for event creation (details, time selection, confirmation), weekly calendar grid for time slot management, and a responsive, mobile-first design with a minimalist aesthetic.
- **SEO & Branding:** HTML lang attribute set to "ja", optimized title and meta descriptions for Japanese keywords (日程調整, スケジュール調整), Open Graph tags, JSON-LD structured data (WebApplication schema), and a calendar-themed favicon. Google Analytics 4 is integrated for tracking.

### Backend

- **Server:** Express.js with TypeScript, including custom middleware for logging and JSON parsing.
- **API Design:** RESTful API under `/api` prefix, supporting event creation (`POST /api/events`), participant response submission (`POST /api/events/:id/responses`), and retrieval of event details/responses (`GET /api/events/:id`, `GET /api/events/:id/responses`).
- **Security:** Input validation on all endpoints using Zod schemas for data integrity and email validation. Secure URL generation for email links to prevent host header injection, prioritizing `BASE_URL`, `REPLIT_DEV_DOMAIN`, or localhost. Origin validation is performed for incoming requests to enhance security against phishing.

### Data Storage

- **Database:** PostgreSQL via Neon serverless, managed with Drizzle ORM for type-safe queries.
- **Schema:**
    - `events`: Stores event metadata (title, organizer email, edit token).
    - `time_slots`: Stores available time options for each event.
    - `responses`: Stores participant availability, referencing selected slot IDs.
- **Design Choices:** Uses UUIDs for primary keys, ISO date strings for date storage, array columns for multiple selections, and cascade delete relationships.

### System Enhancements

- **Email Notifications:** Implemented using Resend for transactional emails. Notifies organizers upon event creation (with participant and results links) and when participants submit responses. Email content is localized in Japanese, and sending is asynchronous.
- **Results Display:** Transposed individual responses table to show time slots as row headers and participant names as column headers. Availability is displayed using Japanese symbols (○ for available, × for unavailable). Time slots are sorted by date then time.
- **UI Improvements:** Sticky calendar headers for improved scrolling experience, enlarged "今週" (This week) button, updated calendar date headers to "d日" format, and a diagonally separated month/time header.
- **Static Pages & Footer:** Implemented a consistent footer across all pages with links to Terms of Service, Privacy Policy, and Contact pages. Static pages provide essential legal and contact information.

## External Dependencies

- **Database Service:** Neon Database (PostgreSQL)
- **Email Service:** Resend
- **UI Libraries:** Radix UI, Shadcn/ui, Lucide React, react-day-picker, cmdk, embla-carousel-react
- **Utility Libraries:** date-fns, Zod, drizzle-zod, class-variance-authority, tailwind-merge, clsx
- **Development Tools:** TypeScript, Vite, ESBuild, tsx
- **Analytics:** Google Analytics 4
- **Fonts:** Google Fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
## Recent Updates

### November 12, 2025

**Navigation & UX Improvements:**
- Made site name "スケマッチ" clickable in Header, linking to event creation page (/)
- Added event name display in Header for Event and Results pages (format: "スケマッチ / イベント名")
- Header now accepts optional eventTitle prop to show current event context
- Simplified email subject from "スケマッチ イベント「...」" to "イベント「...」"

**Header Layout Enhancement:**
- Updated header to vertically stack site name and event name on all screen sizes
- Site name "スケマッチ" displays on first line, event name "/ イベント名" on second line
- Both text elements are perfectly left-aligned (same horizontal position) on desktop and mobile
- Calendar icon positioned to the left with top alignment

**Branding Update:**
- Updated favicon to calendar-themed Lucide icon with blue color scheme
- Favicon matches the calendar icon used in the site header

**SEO Optimization:**
- Updated HTML lang attribute from "en" to "ja"
- Changed title tag to Japanese: "スケマッチ - 簡単日程調整ツール | 無料オンライン予定調整"
- Updated meta description with target keyword "日程調整" (schedule coordination)
- Added meta keywords including: 日程調整, スケジュール調整, 予定調整, 会議日程, イベント調整
- Added Open Graph tags for Facebook/Twitter social sharing optimization
- Added JSON-LD structured data (WebApplication schema) for Google search results
- Structured data emphasizes free tool offering and key features
- Added Google Search Console verification meta tag for webmaster tools integration
