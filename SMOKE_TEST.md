# YDM Final Smoke Test

Pre-handover walkthrough — run this on **production** (`https://ydministries.ca`), not localhost. Should take 15-20 minutes. Mark each item ✓ or ✗ as you go; if anything's ✗, note what you saw and we'll fix before handover.

## Public site — anonymous visitor

- [ ] **Homepage** loads at `/`, hero photo + spinning logo + service card visible
- [ ] Click each main nav link in order (Home / About / Sermons / Ministries / Events / Testimonies / Shop / Contact) — each loads cleanly, no broken images, no `[MISSING: …]` flags
- [ ] **Sermons page** lists all 6 sermons; click one — audio player loads, scripture cards render
- [ ] `/sermons/scripture` — scripture index renders with book groupings, click any sermon link → navigates correctly
- [ ] **Events page** — 2 events visible
- [ ] **Live page** — YouTube embed renders (if not actively streaming, shows YDM channel)
- [ ] **Gallery** — 14 photos masonry-grid; click one → lightbox opens; ← → arrow keys navigate; Esc closes
- [ ] **Contact form** — submit a test entry from your phone using a personal address. Confirm: (a) "thank you" success state, (b) email lands at `YDMinistries48@gmail.com`, (c) row appears in `/admin/messages`
- [ ] **Newsletter signup** at homepage bottom — submit your test email. Confirm: (a) success state, (b) welcome email arrives with gold accent, (c) row at `/admin/subscribers`
- [ ] **Testimonials page** — submit a test entry (10+ chars). Confirm: (a) "Thank you" state, (b) DOES NOT appear in public grid yet, (c) appears in `/admin/testimonials` Pending section
- [ ] **Give page** at `/give` — both columns render (Interac left with `donate@ydministries.ca` highlighted; Stripe right with 4 preset tier buttons + custom amount + Continue button)
- [ ] **Shop page** — either "No products yet" empty state OR a product grid (depending on whether Printful catalog has anything synced)

## Admin — sign in as Mikey (yeshuawebmaster@gmail.com, role=admin)

- [ ] `/admin/login` works; sign in succeeds
- [ ] **Admin landing** shows "Welcome" + 6 cards: Content / Messages / Subscribers / Testimonies / Donations / Orders / Assets / Profile / Users
- [ ] **Sidebar** has all entries: Dashboard / Content / Messages / Testimonies / Subscribers / Donations / Orders / Assets / Users / Profile
- [ ] `/admin/content` — list of all pages (47 routes)
- [ ] Click into any page (e.g. `home`) → field editor renders → edit a string → save → visit `/` → change visible
- [ ] `/admin/messages` — your earlier test contact submission visible
- [ ] `/admin/testimonials` — your test testimonial in Pending; click **Approve** → revisit `/testimonials` → it's now in the public grid; back to admin → click **Feature** → revisit `/testimonials` → it shows as the gold-bordered featured card at top
- [ ] `/admin/subscribers` — your test newsletter signup visible; click **Export CSV** → file downloads
- [ ] `/admin/donations` — empty unless you've done a Stripe test purchase
- [ ] `/admin/orders` — empty unless you've done a shop test purchase
- [ ] `/admin/assets` — gallery of all uploaded images; upload a fresh PNG → confirm appears in list with copy-URL button working
- [ ] `/admin/users` — your row at top with "You" badge, bishop row below (no actions on your own row)
- [ ] **Inline edit:** visit `/` → hover any heading → gold pencil appears → click → modal opens → edit → save → change visible

## Admin — sign in as Bishop (ydministries48@gmail.com, role=bishop)

- [ ] Sign out, sign back in as bishop
- [ ] **Bishop landing** shows "Welcome, Bishop" + 4 plain cards (Edit pages / Messages / Newsletter / Photos / Testimonies / Donations / Orders) + tip card
- [ ] **Sidebar** is bishop-friendly: Home / Edit pages / Messages / Testimonies / Newsletter / Donations / Orders / Photos / My account (NO Users link, NO Content link)
- [ ] Bishop can see and edit content (same flow as admin, just plain language)
- [ ] Bishop CANNOT visit `/admin/users` directly — should redirect to `/admin`

## Email cutover

- [ ] From your phone, send test email to each address — confirm landing inbox:
  - [ ] `info@ydministries.ca` → YDMinistries48
  - [ ] `bishop@ydministries.ca` → YDMinistries48
  - [ ] `donate@ydministries.ca` → YDMinistries48
  - [ ] `prayer@ydministries.ca` → YDMinistries48
  - [ ] `shop@ydministries.ca` → YDMinistries48
  - [ ] `admin@ydministries.ca` → yeshuawebmaster
- [ ] From hub Gmail, compose new email → From: `Bishop Huel Wilson <bishop@ydministries.ca>` → To: any non-Gmail address (use your iCloud) → send. Confirm received at iCloud with **no "via gmail.com" disclaimer**
- [ ] Same test for `info@`, `donate@`, `prayer@`, `shop@`
- [ ] From webmaster Gmail, send test as `admin@ydministries.ca` to your iCloud — clean

## Stripe (if your account is verified for live mode)

- [ ] Visit `/give`, fill out monthly recurring with **TEST card 4242 4242 4242 4242, any CVC, any future expiry** (sandbox)
- [ ] Lands on `/give/thanks` with "Your monthly partnership has begun"
- [ ] Receipt email arrives from Stripe
- [ ] Row appears in `/admin/donations` with status "Succeeded"
- [ ] In Stripe Dashboard → Subscriptions → confirm subscription active

## Shop (if Printful has products)

- [ ] Visit `/shop` → product grid renders
- [ ] Click a product → detail page with variant select + price + Buy Now
- [ ] Click Buy Now → Stripe Checkout (use 4242 test card)
- [ ] Lands on `/shop/success`
- [ ] Row appears in `/admin/orders` with status "Paid" + fulfillment "Submitted"
- [ ] In Printful Dashboard → Orders → draft order appears with the test address

## Auth flows

- [ ] At `/admin/login`, click **Forgot password** → enter your admin email → submit → success message → branded recovery email lands → click button → lands on `/admin/auth/reset` with "Set a new password" form → set new password → bounces to `/admin` signed in
- [ ] As admin in `/admin/users`, send invite to a test email → branded "You're invited" email arrives → click "Set up my account" → lands on `/admin/auth/reset` with "Welcome to YDM admin" → set password → signed in as new bishop
- [ ] In `/admin/users`, change the test user's role from Bishop to Admin → page refreshes, pill updates
- [ ] Click Revoke on the test user → row disappears

## Final checks

- [ ] Lighthouse score on `/` (Chrome DevTools → Lighthouse → mobile) — confirm >90 across all categories. Anything <80 needs investigation.
- [ ] Open `/` in a private/incognito window — no auth context, page loads fast, no admin UI bleed-through
- [ ] On mobile (or Chrome DevTools mobile emulation), test the homepage + nav + a form — all readable + tappable
- [ ] CHANGELOG and HANDOVER docs are checked into `main`

---

If everything ✓ — the site is handover-ready. If anything ✗ — we fix before sleep.
