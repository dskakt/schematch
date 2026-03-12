# MeetSync Design Guidelines

## Design Approach: Modern Productivity SaaS

**Selected System:** Clean, minimal aesthetic inspired by Linear and Notion
**Rationale:** MeetSync is a utility-focused scheduling tool where clarity, efficiency, and ease of use are paramount. The design should feel modern and trustworthy while remaining approachable for all users.

**Core Principles:**
- Progressive disclosure through clear step navigation
- Visual clarity in availability grids
- Instant feedback on user actions
- Mobile-first responsive design

---

## Typography

**Font Family:** Inter (Google Fonts)
- Headings: Inter 600 (Semibold)
- Body: Inter 400 (Regular)
- Labels/UI: Inter 500 (Medium)

**Type Scale:**
- Page titles: text-3xl (30px)
- Step headers: text-2xl (24px)
- Section headers: text-xl (20px)
- Body text: text-base (16px)
- Helper text: text-sm (14px)
- Labels: text-xs uppercase tracking-wide

---

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6 or p-8
- Section spacing: gap-8 or gap-12
- Form field spacing: space-y-6
- Button padding: px-6 py-3

**Container Strategy:**
- Main content: max-w-4xl mx-auto
- Forms/steps: max-w-2xl mx-auto
- Calendar grids: max-w-5xl mx-auto
- Full-width header/footer

---

## Component Library

### Navigation & Progress
**Step Indicator:**
- Horizontal stepper showing Steps 1, 2, 3
- Active step emphasized with visual weight
- Completed steps show checkmark
- Connected with line/progress bar

**Header:**
- Logo "MeetSync" (text-2xl font-semibold)
- Clean, minimal top bar with subtle border-b
- No complex navigation needed

### Forms & Inputs

**Input Fields:**
- Clear labels above inputs
- Generous touch targets (h-12 minimum)
- Rounded corners (rounded-lg)
- Focus states with ring treatment

**Event Creation Form (Step 1):**
- Event name (text input)
- Description (textarea, h-32)
- Organizer email (email input with validation indicator)
- Clear field hierarchy with consistent spacing

### Calendar/Time Selection (Step 2)

**Graphical Date Picker:**
- Monthly calendar view with selectable dates
- Multi-select capability with visual feedback
- Selected dates highlighted with distinct treatment
- Date cells: square aspect ratio, adequate touch targets

**Time Slot Grid:**
- Time ranges displayed horizontally
- 30-minute or 1-hour increments
- Checkbox/toggle selection per time slot
- Visual grouping by date
- Responsive grid: stacks vertically on mobile

### Results & Availability Grid

**Participant Response Table:**
- Column headers: Date/time options
- Row headers: Participant names
- Cell indicators: checkmarks for available, empty for unavailable
- Hover states showing participant details
- Summary row showing total availability count per slot
- Visual emphasis on most popular slots

**Response Cards (Mobile):**
- Stack responses vertically on small screens
- Each participant's availability in accordion/expandable format

### Buttons & CTAs

**Primary Actions:**
- Solid treatment with rounded-lg
- px-8 py-3 for comfortable clicking
- Font weight 500
- Clear hover states (subtle opacity/transform)

**Secondary Actions:**
- Outlined variant or subtle treatment
- Same sizing as primary for consistency

**Button Hierarchy:**
- "Next Step" / "Create Event" - Primary
- "Back" / "Edit" - Secondary
- "Copy Link" - Secondary with icon

### Cards & Containers

**Event Card (for sharing/viewing):**
- Rounded-xl with subtle border or shadow
- Event name as card header (text-xl)
- Description section
- Date options list with icons
- Response count indicator

**Step Container:**
- Centered card layout with p-8 or p-12
- Subtle background treatment to separate from page
- Rounded corners (rounded-2xl)

### Icons
**Library:** Heroicons (outline for UI, solid for emphasis)
- Calendar icon for dates
- Clock icon for times
- Mail icon for email
- Check icon for confirmations
- Link icon for sharing
- Edit icon for organizer actions

---

## Page Layouts

### Event Creation Flow (Organizer)

**Step 1 - Event Details:**
- Centered form container (max-w-2xl)
- Step indicator at top
- Form fields with generous spacing
- Primary CTA at bottom

**Step 2 - Select Dates/Times:**
- Calendar component centered
- Time slot selector below calendar
- Selected options summary card on side (desktop) or below (mobile)
- Navigation buttons (Back/Next)

**Step 3 - Confirmation & Share:**
- Success message with check icon
- Event summary card
- Shareable link with copy button
- Email confirmation message
- Organizer edit link prominent

### Participant Response Page

**Layout:**
- Event details header (name, description, organizer)
- Graphical availability grid as main content
- Name input field at top of grid
- Submit button below grid
- View results link (subtle)

### Results Page

**Layout:**
- Event header with edit option (if organizer)
- Availability matrix as primary focus
- Summary statistics (total participants, most popular slot)
- Add response CTA for new participants

---

## Responsive Behavior

**Desktop (lg):** Side-by-side layouts, wide grids, horizontal step progress
**Tablet (md):** Condensed grids, stacked forms with 2-column where appropriate
**Mobile (base):** Full vertical stacking, touch-optimized controls, simplified grids

**Critical Mobile Optimizations:**
- Calendar: One month view, larger date cells
- Time grid: Stack time slots vertically
- Results table: Horizontal scroll or card-based view
- Navigation: Bottom-anchored action buttons

---

## Interaction Patterns

**Selection Feedback:**
- Immediate visual state change on click
- Multi-select with clear selected state
- Batch operations (select all times for a date)

**Validation:**
- Real-time email validation
- Required field indicators
- Inline error messages below fields

**Loading States:**
- Skeleton screens for data loading
- Spinner for form submissions
- Disabled state for buttons during processing

---

## Images

**No hero images required.** This is a utility application focused on functionality. Visual interest comes from well-designed UI components, calendar grids, and clean typography rather than decorative imagery.

**Icon Usage:** Functional icons throughout to improve scannability and reinforce actions.