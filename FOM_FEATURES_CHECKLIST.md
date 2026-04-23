# YDM Feature Checklist — Complete FOM Feature Inventory

> Every feature built into the FOM website, pulled from PROJECT.md, README.md, CLAUDE.md, and a deep code audit.
> Check off the features you want built into the YDM site. Delete features you don't need.
> Features are organized by area: Public Site, Member Portal, Admin Portal, Security, API, Database, Components, Infrastructure.

---

## A. PUBLIC WEBSITE — Front-Facing Pages

### A1. Homepage
- [ ] Hero image with background overlay and CTA buttons
- [ ] Welcome/intro section with editable text
- [ ] Animated stats counter (numbers animate on scroll — e.g., "500+ Families Served")
- [ ] "Why Choose Us" / feature cards section (icon + title + description cards)
- [ ] Team showcase section (photo, name, role for key people)
- [ ] Upcoming events preview (pulls from events table)
- [ ] Featured causes / fundraising section with progress bars
- [ ] Donation CTA section with button
- [ ] Newsletter signup form (email capture)
- [ ] Testimonials section (rotating or grid)
- [ ] Editable text blocks on every section (EditableContent CMS)

### A2. About Section
- [ ] About page — organization history, mission/vision/values, team preview, timeline, CTA
- [ ] Legacy page — historical timeline (milestone years with images), founding story, biographical content
- [ ] Team page — team member grid with photos, roles, bios (pulled from `team_members` table)
- [ ] Impact & Testimonials page — statistics display, community testimonials, before/after stories
- [ ] Transparency & Stewardship page — financial info, governance, annual reports
- [ ] Press & Media page — press releases, media coverage, story angles, FAQ for journalists

### A3. Ministry / Program Pages
- [ ] "What We Do" overview hub — links to all ministry pillars
- [ ] Food Bank Program page — program description, interactive location map (geocoded), volunteer CTA, donation needs
- [ ] Business & Education page — entrepreneurship training, scholarship fund, workshops, mentorship
- [ ] Spiritual Activities page — prayer groups, worship events, fellowship, Bible study
- [ ] Social Activities page — community events, cultural celebrations, galas, family activities

### A4. Initiatives & Goals
- [ ] Initiatives overview hub page
- [ ] Goals & Needs overview — browse all initiatives with category/pillar filtering, progress bars, fundraising status
- [ ] Individual initiative/goal detail pages (dynamic `[slug]` routes) with GoalDetailTemplate
- [ ] Individual need detail pages (dynamic `[id]` routes)
- [ ] Progress bar visualization (raised vs. goal amount, donor count)
- [ ] Video embedding support (YouTube, Vimeo, direct files) on initiative pages

### A5. News, Blog & Events
- [ ] News listing page with category filtering
- [ ] Individual news article pages (dynamic `[slug]`) with rich text, images, share button
- [ ] Blog listing page with category filtering and search
- [ ] Individual blog post pages with TipTap-rendered content, related posts
- [ ] Events listing page (upcoming events, calendar view)
- [ ] Individual event detail page — event info, RSVP, Stripe ticketing, location, capacity
- [ ] Past Events archive page

### A6. Community & Content
- [ ] Photo Gallery — masonry grid, album filtering, lightbox (zoom/swipe/download/share), infinite scroll, deep linking
- [ ] Gallery albums with slug-based routing (`/gallery/[slug]`)
- [ ] Guestbook — public submission form (name, message, connection/gender), admin moderation required
- [ ] Prayer Wall — prayer requests with public/private toggle, submission form
- [ ] Testimonials page — community testimonials grid with gender-aware avatars
- [ ] In Memoriam — tribute listing for deceased community members
- [ ] Individual tribute detail pages (dynamic `[slug]`) with photos, bio, memories
- [ ] FAQs page — accordion-style with category filtering and search
- [ ] Resources page — community resource links and documents (gated by access level)

### A7. Action Pages
- [ ] Donate page — Stripe-powered: preset amounts with impact statements, custom amount, one-time + recurring (monthly), CAD currency, dedication support, designation to specific programs
- [ ] Donation success/confirmation page with receipt download
- [ ] Volunteer signup page with opportunity descriptions
- [ ] Join/Register page — comprehensive multi-step registration wizard with conditional logic:
  - [ ] Step 1: Basic profile (name, email, phone, DOB, gender, location, photo consent, newsletter opt-in, password)
  - [ ] Step 1b: Background questions (connection to organization, how did you hear about us)
  - [ ] Step 2: Extended profile (areas of interest, involvement preference, accessibility needs)
  - [ ] Business tier opt-in (conditional): business name, tagline, category (13 options), type (6 options), years, description, service area, languages, price range, social media links, certifications, skills (18 options), mentoring/hiring interest
  - [ ] Volunteer tier opt-in (conditional): availability (days/times), commitment level, transportation, areas of service (16 options), skills (8 options), background check consent, emergency contact
  - [ ] Food Bank tier opt-in (conditional): household demographics, pickup details, dietary restrictions (10 options), cultural food preference (7 options), infant needs, clothing sizes, toy preferences, furniture needs, emergency contact
- [ ] Contact page — form (name, email, subject, reason from 15 categories, message) saved to Supabase
- [ ] Unsubscribe confirmation page

### A8. Authentication
- [ ] Login page (Supabase Auth, email/password)
- [ ] OAuth callback handler
- [ ] Auth state in header (logged out: login button, logged in: user dropdown with Dashboard/Profile/Settings/Admin/Sign Out)

### A9. Legal & Static Pages
- [ ] Accessibility Statement page
- [ ] Privacy Policy page
- [ ] Terms of Service page

---

## B. MEMBER DASHBOARD — Authenticated Portal

All dashboard pages require login. Accessible after authentication.

### B1. Dashboard Home & Profile
- [ ] Dashboard home — welcome message, quick links, recent activity, notification count
- [ ] Profile page — edit personal info, avatar upload with crop tool, membership tier display
- [ ] Settings page — account settings, notification preferences, password change

### B2. Communication
- [ ] Messages — direct messaging system between members (inbox, sent, compose)
- [ ] Notifications — notification feed (new messages, approvals, events, moderation)

### B3. Support
- [ ] Support Tickets — submit and track support requests with status tracking
- [ ] Ticket submission confirmation page

### B4. Community Features
- [ ] Prayer Wall (personal) — personal prayer request management (public/private toggle)
- [ ] Business Directory — searchable professional directory (opt-in, members only)
- [ ] Community Forum — discussion threads, post creation, replies
- [ ] Classifieds — community classified ads (buy/sell/trade), moderated
- [ ] Marketplace — community marketplace listings, moderated

### B5. Resources
- [ ] Resources library — member-only resource library (documents, videos, links, gated by access level)

### B6. Dynamic Pages
- [ ] Catch-all dashboard pages (`/dashboard/[slug]`) for future expansion

---

## C. ADMIN PORTAL — Content Management & Site Administration

Dark theme (`#182227`) with brand-color accents. Requires committee+ role. Organized into 7 sidebar sections with badge counts.

### C1. Admin Dashboard
- [ ] Admin home — activity feed showing recent actions across all sections
- [ ] Moderation queue — pending items count across guestbook, prayer, forum, classifieds, marketplace
- [ ] Quick stats — member count, pending items, recent donations, active events
- [ ] Badge counts on every sidebar section showing pending/new items

### C2. People Management
- [ ] Members list — search, filter by role/status, bulk actions
- [ ] Edit member — edit profile, change role (5 tiers), view activity history
- [ ] Collaborators management — staff/team member records with permissions

### C3. Content Management (CMS)
- [ ] **Page Content Editor** — edit ALL page text site-wide, auto-discovered from database `pages` table
- [ ] **Live preview panel** — split-screen: editor left, real-time page preview (iframe) right, with desktop/tablet/mobile toggle
- [ ] Blog post CRUD — create/edit/delete/publish with TipTap rich text editor, categories, featured images
- [ ] Content cards manager — homepage/section content blocks (title, description, icon, image, link, Bible verse, points list)
- [ ] Featured causes manager — fundraising causes with goal amount, raised amount, donor count, progress bars
- [ ] Donation presets manager — configurable preset amounts with impact statements, default flag
- [ ] FAQ manager — CRUD with categories and sort order
- [ ] Statistics manager — edit animated stat counters (label, value, icon, description, per-page assignment)
- [ ] Steps/tutorials manager — step-by-step content blocks with page + section organization
- [ ] Team members manager — add/edit profiles with photos, roles, bios, sort order
- [ ] Testimonials manager — CRUD with gender selection (male/female/neutral), display location (homepage/impact/both)
- [ ] Timeline manager — edit legacy/history timeline entries (year, title, description, image)
- [ ] In Memoriam/Tributes manager — manage tribute pages with card + tribute sections, photos
- [ ] Initiatives manager — edit initiative pages, goals, pillar assignment, fundraising progress
- [ ] Press content manager — manage press story angles and press-specific FAQs

### C4. Initiatives & Giving
- [ ] Donations dashboard — view full donation history, amounts, recurring status, donor info, Stripe session links
- [ ] PDF receipt generation — branded donation receipts with header, details, receipt number (downloadable)
- [ ] Events manager — create/edit/manage events, approve member submissions, capacity tracking
- [ ] News manager — create/edit news articles with rich text, categories, publishing
- [ ] Food Bank manager — manage food bank entries and locations (admin-only data, strict RLS)
- [ ] Membership Tiers manager — configure tier hierarchy, edit labels, add custom tiers, reorder, delete (core tiers protected)
- [ ] Needs/Fundraisers manager — create needs under goals, upload images/video, track progress (raised vs. goal), status management (Active/Funded/Closed/Pending)

### C5. Community Moderation
- [ ] Centralized moderation dashboard — unified queue for ALL pending content across all sections
- [ ] Guestbook moderation — approve/reject/edit entries with status workflow
- [ ] Prayer request moderation — approve/reject submissions
- [ ] Forum post moderation — moderate community discussion threads
- [ ] Business directory management — manage directory listings
- [ ] Classified ads moderation — approve/reject community ads
- [ ] Marketplace moderation — approve/reject marketplace listings

### C6. Media & Communications
- [ ] Gallery manager — upload photos (single or ZIP batch), manage albums, apply watermarks
- [ ] Albums manager — create/edit photo albums with slugs and cover photos
- [ ] Media library — browse all uploaded media files
- [ ] **Newsletter composer** — full-featured email campaign tool:
  - [ ] TipTap rich text editor with formatting toolbar
  - [ ] Featured image upload with preview
  - [ ] Send test email to admin before blast
  - [ ] Batch delivery (100 emails/batch, 500ms delays for Resend rate limits)
  - [ ] Campaign status tracking (draft → sending → sent → failed)
  - [ ] Save as reusable template / load from templates
  - [ ] Schedule newsletters for future send
  - [ ] Confirmation dialog showing total subscriber count before send
  - [ ] Track sent/failed counts per campaign
- [ ] Subscriber management — add individual, CSV bulk import, remove, search by name/email
- [ ] Banner manager — edit site-wide announcement banner (message, link, background color, active toggle)

### C7. Site Settings & Administration
- [ ] Page manager — manage custom/dynamic pages
- [ ] Form submissions manager — two-tab interface:
  - [ ] Contact submissions tab — view messages, filter by 15 reason categories, status workflow (new → reviewed → contacted → resolved → archived), expandable rows
  - [ ] Volunteer applications tab — filter by pillar interest, skills tracking, status management
- [ ] Security dashboard — real-time threat monitoring (see Security section below)
- [ ] Gated Resources manager — manage downloadable content with 4 access levels (Public/Member/Committee/Admin), status management (Draft/Pending/Published)
- [ ] Ticket Sales manager — view/manage event ticket purchases, filter by event/status, search by buyer
- [ ] Audit Log dashboard — view all admin actions (create/update/delete/login/logout/export/upload/approve/reject/settings_change), filter by action type, search, user email tracking
- [ ] Data Export — CSV export for members, donations, newsletter subscribers, contact submissions (dated files)
- [ ] Maintenance Mode toggle — enable/disable site-wide maintenance page (shows ComingSoon to non-admins, admins can bypass)

---

## D. SECURITY PORTAL — Threat Monitoring & Protection

### D1. Security Dashboard (`/admin/security`)
- [ ] Live statistics — blocked IPs count, active threat profiles, unresolved alerts, learned signatures count
- [ ] Security alerts table — browse all events by severity (critical/high/medium/low), search, filter
- [ ] Manual IP blocking — block IPs with custom reasons and expiration times
- [ ] Active blocklist management — view and unblock currently blocked IPs
- [ ] Threat pattern analysis — detected patterns with match counts and last triggered timestamps
- [ ] Auto-refresh capability for all security data

### D2. Security Agent (Self-Learning Engine)
- [ ] Request threat analysis across IP, path, method, headers, and body
- [ ] IP-based behavioral profiling with history tracking
- [ ] Auto-blocking with escalating ban durations (repeat offenders get longer bans)
- [ ] Rate limiting (120 requests/minute threshold)
- [ ] Scanner detection (path probing, 404 scanning patterns)
- [ ] Learned signature extraction — system remembers new attack patterns it discovers
- [ ] In-memory alert queuing with periodic database flush (~1% of requests)

### D3. Threat Knowledge Base
- [ ] Built-in pattern database covering: SQL Injection, XSS, Path Traversal, Command Injection, Bot/Scanner Detection, Credential Stuffing, Header Injection, Data Exfiltration
- [ ] Each pattern has regex signatures, severity levels, and action types (block/alert/log)
- [ ] Compiled signature caching for performance
- [ ] Pattern matching with auto-escalation on repeated violations

### D4. Infrastructure Security
- [ ] Security headers — X-Frame-Options (DENY), X-Content-Type-Options (nosniff), HSTS (2 years, includeSubDomains), Referrer-Policy, Permissions-Policy (disable camera/microphone/geolocation)
- [ ] API route cache control — `no-store, max-age=0` on all API endpoints
- [ ] Auth guards — `requireAdmin()` and `requireRole()` on all admin API routes
- [ ] Rate limiting — per-IP sliding window (60/min admin, 30/min public, 10/min upload, 5/min newsletter)
- [ ] File validation — magic byte detection + extension checks + path traversal prevention
- [ ] HTML sanitization — `isomorphic-dompurify` on all user-generated HTML (SafeHTML component)
- [ ] RLS policies — Supabase Row Level Security on all tables
- [ ] Food bank data privacy — food bank profiles table admin-only (no public/member access)
- [ ] CSRF protection — built into Supabase Auth session management

### D5. Audit System
- [ ] Audit log table tracking all admin actions with user ID, email, action type, resource, details, timestamp
- [ ] Non-blocking async logging (no performance impact)
- [ ] 9 action types tracked: create, update, delete, login, logout, export, upload, approve, reject, settings_change
- [ ] Admin dashboard displays 200 most recent audit entries

---

## E. API ROUTES — Backend Endpoints

### E1. Stripe Payment Endpoints
- [ ] `POST /api/stripe/donate` — Create checkout session for donations (one-time + recurring/subscription, CAD, preset/custom amounts, goal/need/cause attribution, dedication support)
- [ ] `POST /api/stripe/checkout` — General checkout session (event tickets with capacity checking, duplicate prevention)
- [ ] `POST /api/stripe/webhook` — Handle Stripe events: `checkout.session.completed` (update donations, goals, ticket status), `checkout.session.expired` (cancel pending tickets)

### E2. Admin Content Endpoints (require committee+ auth)
- [ ] `POST /api/admin/page-content` — Save CMS editable text (upsert to `page_content` table)
- [ ] `GET/POST /api/admin/team` — Team member CRUD (uses service role key, bypasses RLS)
- [ ] `GET/POST /api/admin/collaborators` — Staff/collaborator CRUD
- [ ] `GET/POST /api/admin/donations` — View/manage donation records
- [ ] `POST /api/admin/upload` — File upload with Sharp image processing (resize, optimize)

### E3. Admin Communication Endpoints
- [ ] `POST /api/admin/newsletter/send` — Batch newsletter send (100/batch, 500ms delay, 5-min max timeout)
- [ ] `GET/POST /api/admin/newsletter/subscribers` — Subscriber CRUD
- [ ] `POST /api/admin/newsletter/upload` — CSV bulk subscriber import

### E4. Admin Utility Endpoints
- [ ] `POST /api/admin/geocode` — Geocoding service for food bank/location maps
- [ ] `POST /api/admin/security` — Security settings management
- [ ] `POST /api/admin/export` — CSV data export (4 types: members, donations, newsletter, contact)
- [ ] `GET/POST /api/admin/maintenance` — Maintenance mode toggle (GET: read state, POST: enable/disable)
- [ ] `GET /api/admin/receipt` — PDF receipt generation for donations (branded, downloadable)
- [ ] `POST /api/admin/register-profile` — Save extended profile data during registration (works without session)
- [ ] `POST /api/admin/delete-account` — Cascade delete user data from 13+ tables + auth user

### E5. Gallery Endpoints
- [ ] `POST /api/gallery/upload` — Upload photos to gallery (ZIP batch support, metadata, media type detection)
- [ ] `POST /api/gallery/watermark` — Apply watermark overlay (15% width, 20% opacity, bottom-right)

### E6. Public Endpoints
- [ ] `POST /api/newsletter/unsubscribe` — Token-based newsletter unsubscribe

---

## F. DATABASE — Tables, Storage & Schema

### F1. Auth & User Management
- [ ] `profiles` — User profiles linked to Supabase Auth (full_name, email, phone, membership_tier, role [5 tiers], avatar_url, is_admin, is_volunteer, is_food_bank, newsletter_opt_in, unsubscribe_token)
- [ ] `food_bank_profiles` — Sensitive food bank data (admin-only RLS): family size, dietary notes, last referred, household demographics, clothing sizes, toy preferences

### F2. Content & CMS
- [ ] `pages` — Page registry (page_key, title, route, status, sort_order, meta_title, meta_description)
- [ ] `page_sections` — Ordered sections per page (page_key, section_key, label, sort_order)
- [ ] `page_content` — Every editable text element (page_key, section_key, content_key, content_type, tag, content, is_rich_text, metadata)
- [ ] `page_content_history` — Content edit history with rollback capability
- [ ] `posts` — Blog posts (title, slug, content [rich text], status [draft/published/rejected], author_id, category, featured_image)
- [ ] `news_articles` — News articles (title, slug, content, published_at, category)
- [ ] `events` — Events (title, description, event_date, location, submitted_by, approved, ticket_price, capacity, tickets_sold)
- [ ] `content_cards` — Content blocks (title, subtitle, description, icon, image_url, link, verse, points[], section, sort_order)
- [ ] `team_members` — Staff directory (name, role, bio, photo_url, sort_order, is_active)
- [ ] `testimonials` — Testimonials (name, quote, role, photo_url, gender [male/female/neutral], display_on [homepage/impact/both], sort_order)
- [ ] `timeline_entries` — Legacy page timeline (year, title, description, image_url, sort_order)
- [ ] `stats` — Animated statistics (label, value, description, icon, sort_order, page assignment)
- [ ] `featured_causes` — Fundraising causes (title, description, image_url, goal_amount, raised_amount, donor_count, link)
- [ ] `donation_presets` — Donation buttons (amount_cents, label, impact_statement, is_default, sort_order)
- [ ] `steps` — Step-by-step blocks (title, description, step_number, page, section)
- [ ] `faqs` — FAQ entries (question, answer, category, sort_order, is_published)
- [ ] `banner` — Site-wide announcement (message, link, active, bg_color)

### F3. Community & User-Generated Content
- [ ] `guestbook_entries` — Guestbook (name, email, message, gender [male/female/neutral], status [pending/approved/rejected])
- [ ] `prayer_requests` — Prayer wall (title, content, is_public, author_id, approved, is_anonymous)
- [ ] `forum_posts` — Community forum (title, content, author_id, category, replies)
- [ ] `classified_ads` — Classifieds (title, description, price, category, author_id, status, expires_at)
- [ ] `marketplace_listings` — Marketplace (title, description, price, category, author_id, status)
- [ ] `direct_messages` — Member messaging (sender_id, recipient_id, content, read_at)
- [ ] `notifications` — Notification feed (user_id, type, message, read, link)
- [ ] `support_tickets` — Support tickets (user_id, subject, description, status, priority)

### F4. Media & Gallery
- [ ] `gallery_photos` — Gallery images (url, caption, album_id, photographer, approved, sort_order)
- [ ] `gallery_albums` — Albums (name, slug, description, cover_photo, media_count)
- [ ] `media` — General media library (url, filename, type, size, uploaded_by)
- [ ] `page_gallery` — Page-specific gallery images (image_url, alt_text, caption, section, sort_order)

### F5. Financial & Subscriptions
- [ ] `donations` — Donation records (amount, currency [CAD], stripe_session_id, donor_email, donor_name, message, is_recurring, cause_id, goal_id, need_id)
- [ ] `event_tickets` — Ticket purchases (event_id, user_id, status [pending/paid/cancelled], amount_paid, stripe_session_id)
- [ ] `newsletter_subscribers` — Email list (email, name, subscribed, unsubscribe_token)
- [ ] `newsletters` — Newsletter campaigns (subject, content_html, featured_image, status [draft/sending/sent/failed], sent_count, failed_count)
- [ ] `newsletter_sends` — Per-recipient send tracking (newsletter_id, profile_id, status, resend_id, error_message)

### F6. Site Configuration
- [ ] `collaborators` — Staff records (name, role, email, permissions)
- [ ] `contact_submissions` / `form_submissions` — Contact form + volunteer form data (form_type, reason [15 categories], data [JSON], status, submitted_at)
- [ ] `membership_tiers` — Tier configuration (name, description, features, price)
- [ ] `initiatives` — Initiative/goal data (title, description, goal_type, pillar, status, raised_amount, donor_count, needs [JSONB])
- [ ] `needs` — Community needs/fundraisers (title, description, initiative_id, goal_amount, raised_amount, status, image_url, video_url)
- [ ] `site_settings` — Key-value store (maintenance_mode, other site-wide settings)
- [ ] `security_alerts` — Security event log (ip, path, method, threat_type, severity, blocked, details)
- [ ] `audit_log` — Admin action audit trail (user_id, user_email, action, resource, resource_id, details)

### F7. Supabase Storage Buckets
- [ ] `avatars` — User profile photos
- [ ] `gallery` — Gallery photos and albums
- [ ] `uploads` — General file uploads (newsletter images, documents, media)

### F8. Row Level Security (RLS) Policies
- [ ] Public read on content tables (pages, page_content, page_sections, stats, faqs, etc.)
- [ ] Staff write on content tables (check `profiles.is_ydm_staff`)
- [ ] Users read own profile, staff read all profiles
- [ ] Admin-only on food bank profiles (no public/member access)
- [ ] Author-only write on user-generated content (forum posts, classifieds, etc.)
- [ ] Public read on published structured content (team, testimonials, events, posts)

---

## G. COMPONENTS — Reusable UI Building Blocks

### G1. Layout & Navigation
- [ ] Sticky header — announcement banner, desktop/mobile responsive nav, auth state (login vs. user dropdown), admin portal link
- [ ] Dark footer — 4-column layout: logo, nav links, social icons, legal links, newsletter signup, editable copy
- [ ] SubPageHero — hero banner for all subpages (title, subtitle, breadcrumb, background image)
- [ ] Auto-breadcrumbs — generated from URL path structure (gold arrows, consistent styling)
- [ ] Page transition animation — branded overlay animation between pages

### G2. CMS Components
- [ ] EditableContent — inline click-to-edit on every text element, saves to `page_content` table (DB-first, no hardcoded fallback)
- [ ] ContentProvider — page-level batch content loading via React context (single query per page)
- [ ] TipTap rich text editor — full formatting: bold/italic/underline/strike, headings, lists, links, images, color, font-family, text-align, horizontal rules, subscript/superscript, blockquotes, code blocks, history (undo/redo)
- [ ] SafeHTML — XSS-safe HTML rendering for user-generated content (isomorphic-dompurify)
- [ ] Live preview panel — split-screen admin editing with real-time iframe preview

### G3. Interactive Components
- [ ] AnimatedStats — number counters that animate on scroll (e.g., "500+ Families Served")
- [ ] FoodBankMap / InteractiveMap — geocoded location display with markers
- [ ] GoalDetailTemplate — reusable template for initiative/goal pages with progress bars
- [ ] ShareButton — social sharing (copy link, share to platforms)
- [ ] VideoEmbed — auto-detects YouTube/Vimeo/direct video, renders responsive iframes (privacy-friendly YouTube via youtube-nocookie.com)
- [ ] SortableList — drag-and-drop reorderable list for admin content ordering (@dnd-kit)

### G4. Form Components
- [ ] ContactForm — multi-field form with 15 reason categories, saved to Supabase
- [ ] GuestbookForm — submission form with gender selector
- [ ] GenderAvatar — gender-aware avatar (male/female/neutral silhouettes on dark gradient, auto-switches to real photo when uploaded)
- [ ] GenderSelect — pill-button gender picker with SVG icons
- [ ] NewsletterSignupForm — email capture form (used in header + footer)
- [ ] PhotoUpload — photo upload with preview
- [ ] ImageCropper — image cropping tool (react-easy-crop)
- [ ] ImageUploadWithCrop — combined upload + crop workflow

### G5. Admin Components
- [ ] AdminLayout / AdminShell — complete admin wrapper: dark sidebar, 7 sections, badge counts, avatar menu, responsive
- [ ] AdminTheme — light/dark theme toggle for admin panel
- [ ] ComingSoon — full-screen maintenance/coming-soon page with branding, social links, admin bypass link

### G6. Auth Components
- [ ] AdminContext / AdminProvider — React context for admin role detection (`useIsAdmin()` hook)
- [ ] SignOutButton — logout button component

### G7. Branding Components
- [ ] Logo component — brand logo rendering
- [ ] Icon component — icon rendering utility

---

## H. EMAIL SYSTEM — Newsletter & Transactional

### H1. Newsletter Composer (Admin)
- [ ] TipTap rich text editor with full formatting toolbar
- [ ] Featured image upload with preview
- [ ] Subject line and preview text editing
- [ ] Save as reusable template / load from templates
- [ ] Send test email to admin before blast
- [ ] Schedule newsletters for future send dates
- [ ] Confirmation dialog showing total subscriber count
- [ ] Batch delivery (100 emails/batch, 500ms delays for rate limits)
- [ ] Campaign status tracking (draft → sending → sent → failed)
- [ ] Track sent/failed counts per campaign

### H2. Email Rendering Engine
- [ ] Branded HTML email template — table-based layout for maximum email client compatibility
- [ ] Dark branded header with logo and accent band
- [ ] Featured image support with responsive sizing
- [ ] Dark footer with token-based unsubscribe link
- [ ] Mobile responsive (max-width: 620px)
- [ ] Absolute URL conversion for all images

### H3. HTML Transformer (TipTap → Email)
- [ ] Convert TipTap editor output to email-safe inline-styled HTML
- [ ] Transform headings (serif font), paragraphs, links, images, blockquotes (colored left border), lists, horizontal rules, highlights
- [ ] Maintain brand fonts and colors in email rendering

### H4. Subscriber Management
- [ ] Add individual subscribers
- [ ] CSV bulk import
- [ ] Remove/unsubscribe subscribers
- [ ] Search by name or email
- [ ] Total subscriber count display
- [ ] Per-subscriber unsubscribe tokens

---

## I. GALLERY SYSTEM — Photos & Media

- [ ] Masonry grid layout with responsive columns
- [ ] Lightbox — zoom, swipe, download, share, captions (yet-another-react-lightbox)
- [ ] Album organization with slug-based routing
- [ ] Infinite scroll for large galleries
- [ ] Deep linking to individual photos
- [ ] ZIP bulk import for batch photo uploads
- [ ] Watermarking via Sharp (logo overlay: 15% of image width, 20% opacity, bottom-right)
- [ ] Admin upload UI with metadata entry (caption, alt text, album assignment)
- [ ] Photo submissions from members (moderated)
- [ ] Page-specific gallery images (section-filtered, e.g., "about page hero gallery")
- [ ] Supported formats: jpg, jpeg, png, webp, gif (images); mp4, mov, webm (video)
- [ ] Magic byte file type validation on upload

---

## J. PAYMENT SYSTEM — Stripe Integration

### J1. Donation Flow
- [ ] Preset donation amounts with impact statements (admin-configurable)
- [ ] Custom amount entry (min $1, max $25,000)
- [ ] One-time payments
- [ ] Monthly recurring subscriptions
- [ ] CAD (Canadian Dollar) currency
- [ ] Donation designations (specific programs/goals/needs)
- [ ] Donation messages and dedications
- [ ] Redirect to Stripe-hosted checkout page
- [ ] Success page with thank-you message
- [ ] PDF receipt generation (branded, downloadable)
- [ ] Webhook processes `checkout.session.completed` — records donation, updates goals/needs raised amounts and donor counts

### J2. Event Ticketing
- [ ] Ticket purchasing via Stripe checkout
- [ ] Capacity checking (prevent overselling)
- [ ] Duplicate purchase prevention
- [ ] Pending ticket creation on checkout start
- [ ] Ticket status update on payment confirmation
- [ ] Webhook processes `checkout.session.expired` — marks pending tickets cancelled

---

## K. NAVIGATION STRUCTURE

### K1. Main Navigation (6 sections)
- [ ] Home
- [ ] About dropdown (About, Legacy, Team, Impact, Transparency, Press)
- [ ] What We Do dropdown (Overview, 4 Ministry Pillars, Initiatives, Goals & Needs)
- [ ] Community dropdown (News, Blog, Events, Gallery, Guestbook, Prayer Wall, In Memoriam, Testimonials)
- [ ] Members dropdown (Dashboard, Forum, Directory, Classifieds, Marketplace, Messages) — authenticated only

### K2. Action Buttons (always visible)
- [ ] Donate CTA button (brand-colored)
- [ ] Contact button
- [ ] Volunteer / Join button

### K3. Mobile Navigation
- [ ] Responsive hamburger menu with full navigation tree
- [ ] Same sections and dropdowns as desktop

### K4. WordPress URL Redirects
- [ ] 301 redirects from all old WordPress URLs to new routes in `next.config.mjs`

---

## L. SEO & PWA — Search Engine Optimization & Progressive Web App

### L1. SEO
- [ ] Dynamic sitemap generation (`sitemap.ts`) — 35+ static pages with priority and change frequency
- [ ] Static metadata in root layout — Open Graph (title, description, URL, siteName, locale, type)
- [ ] Twitter card metadata (summary_large_image)
- [ ] Robots directives (index, follow, googleBot)
- [ ] Favicon (32px PNG)
- [ ] Keywords meta tag
- [ ] Canonical URLs

### L2. PWA (Progressive Web App)
- [ ] Web App Manifest (`manifest.json`) — app name, short name, display: standalone, theme color, background color
- [ ] App icons (192px and 512px PNG, maskable)
- [ ] Orientation: portrait-primary
- [ ] Categories: community, lifestyle, social
- [ ] Language: en-CA

---

## M. DESIGN SYSTEM — Visual Identity

- [ ] Custom Tailwind color tokens with `ydm-*` prefix — extracted from YDM WordPress theme
- [ ] Custom font configuration — heading font (serif) and body font (sans) from YDM WordPress theme
- [ ] Button style — brand color fill with circle-expand hover animation
- [ ] Dark admin theme background: `#182227`
- [ ] Brand color accents throughout admin panel
- [ ] Light/dark mode toggle in admin panel
- [ ] Responsive design — mobile-first, all breakpoints
- [ ] Elder-friendly admin UX — large buttons (44px+), 16px+ text, clear labels, no jargon, confirmation dialogs
- [ ] Admin sidebar — 7 sections with badge counts, responsive (desktop sidebar, mobile hamburger)
- [ ] Gender-aware avatars — silhouette defaults that switch to real photos when uploaded

---

## N. INFRASTRUCTURE — Framework, Hosting & DevOps

### N1. Framework & Runtime
- [ ] Next.js 16.2.2 with App Router
- [ ] React 19.2.4
- [ ] TypeScript strict mode
- [ ] Node.js 24 LTS

### N2. Rendering & Caching
- [ ] Server Components by default, `"use client"` only where interactivity is needed
- [ ] ISR with 5-minute revalidation on content pages (revalidate: 300)
- [ ] Admin and dashboard pages fully dynamic (no caching)
- [ ] API routes with `Cache-Control: no-store, max-age=0`

### N3. Deployment
- [ ] Vercel hosting with auto-deploy on push to main
- [ ] Environment variables managed via Vercel dashboard
- [ ] Preview deployments on feature branches
- [ ] Deploy script (`scripts/deployer.sh`)
- [ ] Vercel project linking (`.vercel/` directory)

### N4. Third-Party Integrations
- [ ] Supabase — database (PostgreSQL), auth, storage, RLS
- [ ] Stripe — payments (donations + event tickets + webhooks)
- [ ] Resend — newsletter delivery + transactional email
- [ ] Sharp — server-side image processing (resize, watermark, optimize)
- [ ] Google Fonts — custom typefaces via Next.js font optimization
- [ ] Vercel — hosting, CDN, environment variables, preview URLs

### N5. Development Tooling
- [ ] Database seed scripts (pages, sections, content, events, timeline, structured data)
- [ ] Database migration scripts (SQL schema files)
- [ ] Schema inspection utilities
- [ ] Image validation and processing scripts
- [ ] Photo batch processing directories
