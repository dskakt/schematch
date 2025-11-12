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