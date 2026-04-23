# memory.md — ydministries.ca Full Site Ingest

**Site:** https://ydministries.ca/
**Ingested:** 2026-04-18
**Source:** Live site (WebFetch) + existing WordPress scrape at `archive/wordpress/scrape/` (177 pages indexed)
**Purpose:** Canonical reference for the YDM WordPress → Next.js migration. Every visible string, page, leader, ministry, sermon, event, and asset the site exposes is captured here so seed data and components can be built without re-scraping.

---

## 1. Organization Identity

- **Ministry name:** Yeshua Deliverance Ministries (YDM)
- **Legal entity:** YDM inc.
- **Founder / Bishop:** Bishop Huel O. Wilson (also styled "Bishop H.O. Wilson", "Huel Wilson")
- **Co-leader:** Clementina Wilson
- **Tagline:** *"Ministry by Bishop H.O. Wilson"* / *"YDM: a home for your soul."* / *"Uniting hearts in faith and fellowship."*
- **Copyright:** © 2026 – All Rights Reserved
- **Site builder attribution (footer):** cmsmasters.studio (WordPress theme by CMSMasters)

### Mission
> "To share and spread the love of Christ through worship, discipleship, and service."

### Vision
> "A thriving community of empowered disciples transformed by faith, love, and action."

### Core Values
Faith, Community, Service, and Compassion.

### Welcome statement (homepage "Who we are")
> "In a world that is constantly changing, some things remain constant. The love of God is one of them. We believe that everyone deserves a place where they feel known, accepted, and loved — a place to grow in their faith, find community, and discover the purpose God has for their life. Whether you are new to faith, exploring what it means to follow Jesus, or have been walking with Him for years, there is a place for you here."

---

## 2. Contact Information

- **Phone:** +1 (416) 895-5178
- **Email:** Info@YDMinistries.ca
- **Website:** YDMinistries.ca
- **Mailing address:** P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0
- **Worship venue:** Mississauga Church of God (inside the Salvation Army Erin Mills Church), 2460 The Collegeway, Mississauga, ON L5L 1V3

### Social Media
| Platform | Handle / URL |
|---|---|
| Facebook | https://www.facebook.com/profile.php?id=61580380624275 |
| Instagram | https://www.instagram.com/yd.ministries/ (@yd.ministries) |
| YouTube | https://www.youtube.com/@BishopHuelWilson |
| LinkedIn | https://www.linkedin.com/in/bishop-huel-wilson-3378602b/ |

---

## 3. Service & Event Times

| Event | When | Where |
|---|---|---|
| **Yeshua Sunday Service** | Every **4th Sunday** of the month, 1:00 PM | Mississauga Church of God, 2460 The Collegeway, Mississauga, ON L5L 1V3 (inside Salvation Army Erin Mills Church) |
| **Weekly Bible Study Group** | **Thursdays at 7:00 PM** (also listed as 7:30pm on contact page — treat 7:00 PM as primary) | Same venue |

Note: A secondary program-time block appears on the ministries pages (*"Tuesdays, 12:30pm–3:00pm / Thursdays, 9:00am–11:00am"* and a kids-ministry agenda starting "10:00 AM – Welcome kids and playtime…"). This is residual template content from the CMSMasters demo and should NOT be treated as real YDM service times.

---

## 4. Site Structure — Full Page Inventory

The WordPress scrape indexes **177 URLs**. Grouped below by function. Every URL uses `https://ydministries.ca` as base.

### 4.1 Top-level pages
| Slug | URL | Purpose |
|---|---|---|
| home | `/` | Landing page — hero, who we are, ministries grid, events, featured sermons, leaders, CTAs |
| home-two | `/home-two/` | Alt home layout (theme demo — not linked in nav) |
| home-three | `/home-three/` | Alt home layout (theme demo — not linked in nav) |
| aboutydm | `/aboutydm/` | Primary About page ("Yeshua Deliverance Ministries") |
| about-us | `/about-us/` | Secondary About page (duplicate — linked from footer) |
| huel-clementina | `/huel-clementina/` | Huel & Clementina Wilson (the Wilsons together) |
| huelwilsonbio | `/huelwilsonbio/` | Bishop Wilson — Bio |
| maltoncog | `/maltoncog/` | Malton Church of God |
| westtoronto | `/westtoronto/` | West Toronto Church of God |
| our-ministries | `/our-ministries/` | Index of ministries |
| our-team | `/our-team/` | Leadership team |
| events-page | `/events-page/` | Events listing |
| gallery | `/gallery/` | Photo Gallery |
| live | `/live/` | Watch Live stream |
| latest-sermons | `/latest-sermons/` | Sermon library |
| our-campaigns | `/our-campaigns/` | Fundraising campaigns landing |
| blog-page | `/blog-page/` | Blog index |
| contact | `/contact/` | Contact form + info |
| ask | `/ask/` | Submit questions for Bishop |
| prayer-requests | `/prayer-requests/` | Submit prayer requests |
| guestbook | `/guestbook/` | Visitor guestbook |

### 4.2 Ministries (CPT: `ministries`)
| URL | Ministry |
|---|---|
| `/ministries/ask-bishop/` | Ask Bishop |
| `/ministries/worship/` | Worship Ministry |
| `/ministries/outreach/` | Compassion & Outreach |
| `/ministries/family/` | Family Ministry |
| `/ministries/wordwide/` | Worldwide Ministry (Online) *(note: URL typo "wordwide")* |
| `/ministries/leadership/` | Leadership & Development |
| `/ministries/partnership/` | Partnership & Support Ministry |

### 4.3 Sermons (CPT: `sermon`)
| URL | Title |
|---|---|
| `/sermon/here-am-i-send-me-a-vision-for-mission/` | Here Am I, Send Me: A Vision for Mission |
| `/sermon/jesus-the-ultimate-transformational-leader/` | Jesus: The Ultimate Transformational Leader & How He Changes Lives |
| `/sermon/jesus-is-coming-soon-signs-prophecy-hope/` | Jesus is Coming Soon: Signs, Prophecy, & Hope |
| `/sermon/gilgal-the-place-of-new-beginnings/` | Gilgal: The Place of New Beginnings |
| `/sermon/repent-the-kingdom-of-god-is-at-hand/` | Repent: The Kingdom of God Is At Hand |
| `/sermon/the-heritage-of-a-godly-mother/` | The Heritage of a Godly Mother (Mothers Day 2024) |

Sermon taxonomy (`sermons-category`): **Expository**, **Narrative**, **Textual**, **Topical**.

### 4.4 Events (CPT: `event`)
| URL | Event |
|---|---|
| `/event/weekly-bible-study-group/` | Weekly Bible Study Group |
| `/event/young-adults-connect/` | Yeshua Sunday Service *(slug mismatch: labelled "young-adults-connect" but title is "Yeshua Sunday Service")* |

Event taxonomy (`events_category`): **Services**, **Study Group**.

### 4.5 Campaigns (CPT: `campaigns`)
| URL | Campaign |
|---|---|
| `/campaigns/supportydm/` | Support Our Ministry |
| `/campaigns/techfund/` | YDM Tech Fund (Creator's Studio build-out) |

### 4.6 Blog posts (9 total, from `/blog-page/`)
| Slug | Title |
|---|---|
| discovering-the-power-of-waiting | Discovering the Power of Waiting |
| experiencing-the-freedom-of-gods-presence | Experiencing the Freedom of God's Presence |
| how-to-develop-a-habit-of-worship | How to Develop a Habit of Worship |
| whats-your-view-of-marriage | What's Your View of Marriage? |
| how-do-i-intercede-for-family-who-dont-believe-in-jesus | How Do I Intercede For Family Who Don't Believe In Jesus? |
| your-mission-should-you-choose-to-accept-it | Your Mission – Should You Choose to Accept It |
| i-ruined-my-lifeis-there-hope-for-me | I Ruined My life…is There Hope for Me? |
| do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison | Do Not Lose Heart – Your Future in Christ is Beyond All Comparison |
| four-things-our-church-should-still-focus-on | Four Things Our Church Should Still Focus On |

Blog taxonomy (`category`): **Faith**, **God's Word**, **Jesus**.
Blog tags (`tag`): churchfamily, godsword, loveoneanother, pastor, podcast, worship.

### 4.7 Staff / Profile CPT (`cmsms_profile`)
- `/cmsms_profile/bishopwilson/` — Bishop Wilson
- `/cmsms_profile/clementinawilson/` — Clementina Wilson
- Taxonomy `cmsms_profile_category`: **Pastor**, **Senior Priest**

### 4.8 Author archive
- `/author/ydm-admin/` (WordPress author: ydm-admin)

### 4.9 Media assets (scraped `.webp` uploads)
Stored under `/wp-content/uploads/YYYY/MM/`. 30+ assets catalogued (home hero, instagram tiles, open-post banners, megamenu images, theme/open-ministry imagery). Representative paths:
- `2025/02/58-home-1.webp` … `58-home-8.webp`
- `2025/02/58-instagram-1.webp`, `58-instagram-2.webp`
- `2025/02/58-open-post-1.webp` … `58-open-post-15.webp`
- `2025/03/58-home-3-3.webp` … `58-home-3-10.webp`
- `2025/03/58-instagram-1.webp`, `58-instagram-4.webp`, `58-instagram-5.webp`
- `2025/03/58-open-ministry-1-1.webp`
- `2025/03/home-2-2-tablet.webp`, `home-2-6.webp`, `home-2-7.webp`, `home-2-8.webp`
- `2025/03/megamenu-4.webp`, `2025/09/megamenu-4-4.webp`
- `2025/03/open-post-1.webp`, `-2.webp`, `-27.webp`, `-28.webp`, `-29.webp`, `-30.webp`

Full list: `archive/wordpress/scrape/pages/wp-content_uploads_*.json`.

---

## 5. Navigation Structure

### Header (mega-menu, from `navigation.json`)
- **Home** → `/`
- **About** (dropdown) → `/aboutydm/`
  - Huel & Clementina Wilson → `/huel-clementina/`
  - Bishop Wilson – Bio → `/huelwilsonbio/`
  - Malton Church of God → `/maltoncog/`
  - West Toronto Church of God → `/westtoronto/`
  - Yeshua Deliverance Ministries → `/aboutydm/`
- **Pages** (dropdown)
  - Our Ministries → `/our-ministries/`
  - Our Team → `/our-team/`
  - Events → `/events-page/`
  - Gallery → `/gallery/`
  - Image Credits → `/?page_id=44568`
- **Sermons** (dropdown)
  - Watch Live → `/live/`
  - Latest Sermons → `/latest-sermons/`
  - Our Campaigns → `/our-campaigns/`
- **Blog** → `/blog-page/`
- **Contact** (dropdown)
  - Contact YDM → `/contact/`
  - Ask → `/ask/`
  - Prayer Requests → `/prayer-requests/`
  - Guestbook → `/guestbook/`

### Footer
- Pages: About Us, Ministries, Sermons, Our Campaigns
- Contact: +1 (416) 895-5178, Info@YDMinistries.ca
- Social icons: Facebook, Instagram, YouTube, LinkedIn
- Signoff: "YDM – Yeshua Deliverance Ministries" / "YDM inc." / © 2026

---

## 6. Homepage Sections (in order)

1. **Hero / intro strip** — H1: *"Ministries"* (note: spelled "Minstries" in scrape — typo on live site), CTAs: "Give", "Join Us In-person", "Watch Live"
2. **"Support Our Mission" banner** — *"Your generosity makes a difference! Every gift helps us spread hope, serve our community, and share God's love with those in need. Thank you for being a part of this mission!"*
   - "Ways to give:" sub-section with "Give In-Person" + "Give Online" (→ `/campaigns/supportydm/`)
3. **"1:00 PM Every 4th Sunday"** — service promo tile, "Inside Mississauga Church of God"
4. **"YDM: a home for your soul."** — tagline block
5. **"Who we are" — "A Christ-Centered Community for Worship & Growth"** — Mission / Vision / Values trio
6. **"You're always welcome here."**
7. **"YDM Ministries"** — grid of 7 ministries
8. **"Upcoming Events"** — Weekly Bible Study Group + Yeshua Sunday Service cards
9. **"Featured Sermons"** — sermon carousel, CTA "Sermon Library"
10. **"Don't miss the next service"** — Leading with Love / Meet Our Leaders
11. **"Support YDM's Mission"** — campaign promo
12. **"Get Involved with YDM"** — three cards: Pray With Us / Serve With Us / Partner With Us
13. **"Stay Connected"** — email signup *"Get updates on events and inspiration to your email."*
14. **Footer** — Pages / Location / Contact columns

---

## 7. About / Bio Content

### Bishop Huel O. Wilson
- Title: Bishop, senior pastor
- Role: Founder of Yeshua Deliverance Ministries; Licensed Marriage Officer; conducts weddings, pre-marital counseling, marriage ceremonies, baby/child dedications, parenting workshops, leadership retreats
- Preaches monthly at Yeshua Sunday Service and teaches Thursday Bible studies
- Guest speaker (e.g. Ebenezer Urban Ministry Center — "Here Am I, Send Me" — June 30, 2024)
- YouTube: @BishopHuelWilson
- **NOTE:** The about-section paragraphs currently rendered on the live site for Huel & Clementina, Bishop Bio, Malton COG, West Toronto COG, and about-us are **placeholder/lorem content borrowed from the CMSMasters "Corlears" school theme demo** (references to "Corlears", "students, families and staff", "compassion, growth, courage to act…", "curriculum", etc.). This copy is NOT YDM-authored and must be rewritten before migration.

### Clementina Wilson
- Profile page: `/cmsms_profile/clementinawilson/`
- Listed alongside Bishop Wilson on About, Our Team, and Huel & Clementina pages; same placeholder bio issue.

### YDM's stated beliefs (from `/ministries/*` pages — these ARE YDM copy)
1. **Christ as Head** — "We acknowledge Jesus Christ as the head of our church and fully submit ourselves to His will…"
2. **Authority of Scripture** — "We believe the Bible is God's inspired authoritative and trustworthy rule of faith and practice…"
3. **Power of Prayer** — "We believe in the power of prayer. Therefore, the ministries and activities of our church will be characterized by a reliance on personal and corporate prayer…"
4. **Great Commission** — "…committed to reaching unsaved and unchurched people locally, nationally and worldwide…"
5. **Family** — "We believe God ordained the family to glorify him…"

---

## 8. Ministry Descriptions (YDM-authored)

### Ask Bishop (`/ministries/ask-bishop/`)
Channel for submitting biblical/life questions; Bishop Wilson may answer privately or via YouTube video.

### Worship Ministry (`/ministries/worship/`)
The heartbeat of YDM. Led by Bishop Wilson. Monthly preaching and teaching services. Aspires to add worship nights, revival services, worship-leader training. Not about performance — about ushering people into God's presence.
- Worship Service: 4th Sunday @ 1:00 PM
- Bible Study: Thursdays @ 7:30 PM
- Venue: Mississauga Church of God, 2460 The Collegeway, Mississauga, ON L5L 1V3

### Compassion & Outreach (`/ministries/outreach/`)
Hospital ministry, senior/nursing-home visits, prison ministry, chaplaincy, community food & clothing drives, youth mentorship.

### Family Ministry (`/ministries/family/`)
Weddings, pre-marital counseling, marriage ceremonies (Bishop is Licensed Marriage Officer), baby/child dedications, parenting workshops, family seminars, marriage enrichment retreats.

### Worldwide Ministry — Online (`/ministries/wordwide/`)
Online video library of sermons/teachings, live-streamed global prayer gatherings, online Bible studies, discipleship courses.

### Leadership & Development (`/ministries/leadership/`)
Training for preaching, teaching, organizational development, pastoral care, communication. Mentorship for pastors, ministers, emerging leaders. Retreats and conferences. Online training modules in development.

### Partnership & Support Ministry (`/ministries/partnership/`)
Recurring-giving and prayer-partnership track. Financial stewardship emphasis.

---

## 9. Contact Page — Inquiry Categories

Form on `/contact/` lets users select a reason:
1. General Inquiries
2. Prayer Requests
3. Book / Invite Bishop Wilson (speaking, weddings, baptisms, conventions, podcasts, interviews)
4. Ask Bishop (biblical guidance — may be answered via YouTube)
5. Question the Word (scripture/passage questions)
6. Shop / Order Inquiries
7. Leadership Training Inquiries
8. Family Ministry Inquiries (pre-marital, relationship, family, individual Christian counseling)
9. Compassion & Outreach Ministry Inquiries (hospital/prison/nursing-home/community)

Consent checkbox: *"Yes, I agree with the privacy policy and terms and conditions. I consent to YDM Ministries storing my submitted information privately to respond to this request."*

---

## 10. Sermon Summaries (for seed content)

### "Here Am I, Send Me: A Vision for Mission"
Delivered at Ebenezer Urban Ministry Center, June 30 2024 (guest). Isaiah 6 framework: Upward Look (Isa 6:1) / Inward Look (Isa 6:5) / Outward Look (Isa 6:8-9). Calls believers to mission-centered life. Supporting texts: Prov 29:18, Exod 33:18, Rom 12:1, Ps 99:1-5, Acts 1:8, Ps 51:1-3.

### "Jesus is Coming Soon: Signs, Prophecy, & Hope"
Doctrine of Christ's second coming. Certainty (John 14:3, Matt 24:34-35, Acts 1:10-11), signs (deception, wars, famine, persecution, false prophets, iniquity, departure, mockers, gospel-to-all-nations), suddenness (Matt 24:27, 37-41; parables of Matt 25), consolation (John 14:1-3, Rev 19-21). Heavy in NIV citations with timestamps (video-linked).

### "Gilgal: The Place of New Beginnings"
Joshua 4:17-20. Twelve stones as memorial of Jordan crossing. Desert as God's "university". Joshua/Caleb's faith vs. 10 murmuring spies. Matt 16:18 — the church will prevail.

### "Repent: The Kingdom of God Is At Hand"
Matt 3:1-2, Matt 4:17. Repentance = sincere turning from self to God. Four elements of God's Kingdom: King (Jehovah), Territory (Ps 24:1), People/Subjects, Rules/Laws (love). Examples: Thief on the Cross (Luke 23:42), Prodigal Son (Luke 15), Philippian Jailer (Acts 16). Altar-call prayer of repentance.

### "The Heritage of a Godly Mother" (Mother's Day 2024)
Heritage vs. legacy. Honoring parents (Eph 6:1-3). Hannah (1 Sam 1) — persistent prayer, dedicated Samuel. Mary (Luke 1:26-38) — humble obedience; carried pain of the cross. Encourages never ceasing to pray for children; don't judge single mothers.

### "Jesus: The Ultimate Transformational Leader & How He Changes Lives"
Jesus as the model of transformational leadership. Uses parable of the prodigal son (Luke 15:11-32).

---

## 11. Campaigns

### Support Our Ministry (`/campaigns/supportydm/`)
> "At Yeshua Deliverance Ministries (YDM), our mission is to reach souls, build families, and impact communities with the love and power of Jesus Christ. Every donation you make is more than just a contribution — it is a seed of faith that fuels the growth and expansion of our ministries."

One-time or recurring monthly. "🙏 Thank you for standing with YDM and helping us advance the Kingdom of God."

### YDM Tech Fund (`/campaigns/techfund/`)
Fundraiser to build a **Creator's Studio** — equipment for producing podcasts, YouTube videos, worship messages, digital content. Currently on outdated equipment.

Giving stack uses **GiveWP** (evidenced by `--givewp-yellow-100`, `--givewp-emerald-400`, `--givewp-neutral-900` CSS custom properties in the scraped stylesheet).

---

## 12. Design System

### Colors (extracted from `colors.json`)
Key brand tokens (Elementor `--e-global-color-*` variables):
- `--e-global-color-accent: #D38605` (amber/gold — brand accent)
- Alternate: `var(--e-global-color-alternate, #f8f1e6)` (warm cream)
- Primary surfaces include `#d9dfdb`, `#fdfdfd` (off-white), `#1a0f00` (near-black warm), `#002613` (deep green), `#8c1700` (deep red), `#120566` (deep indigo), `#ff4500` (accent orange), `#219653` (green).
- The Events Calendar (TEC) accent: `#ed5a2f` (orange).
- GiveWP palette present: yellow (`#fff0a6`, `#ffdf40`, `#ffe399`), emerald (`#0cf27f`, `#7cbf7e`), neutral (`#060c1a`).
- WordPress preset palette present (`--wp--preset--color--vivid-green-cyan: #00d084`, etc.) — these are stock and mostly unused.

**Working brand triad for Tailwind tokens:** amber/gold `#D38605` (accent), cream `#f8f1e6` (alternate surface), dark `#1a0f00` (text/deep). Corroborate against live site before shipping.

### Fonts
Full `fonts.json` dump not fully read in this ingest; CMSMasters theme typically ships with Google Fonts (Roboto, Montserrat, Playfair Display, or similar serif/sans pairing). **Action:** confirm by reading `archive/wordpress/scrape/fonts.json` before setting Tailwind font tokens.

### Theme stack (from CSS classes in scrape)
- WordPress + **Elementor Pro** page builder
- **CMSMasters** starter theme (`cmsmasters-slider-*`, `cmsmasters-colors-alternate`, footer attribution to cmsmasters.studio)
- **The Events Calendar** (TEC) plugin — variables prefixed `--tec-color-*`
- **GiveWP** donation plugin
- `.DS_Store` files present → site was developed on macOS

---

## 13. Migration Implications

1. **Placeholder copy everywhere.** About / Bio / Huel & Clementina / Malton COG / West Toronto COG / About Us currently ship the CMSMasters school-theme demo content ("Corlears", "curriculum", "students, families and staff"). Seed DB with **empty** or **clearly flagged placeholder** keys so admin is forced to write real copy; do not migrate the demo text verbatim.
2. **Real YDM copy is concentrated in:** mission/vision/values block, ministry "Our Beliefs" 5-point list, each ministry's top 3-4 paragraphs, sermon notes, campaign blurbs, contact page categories, event descriptions.
3. **Duplicate demo content** (the "Tuesdays 12:30pm–3:00pm / Thursdays 9:00am–11:00am" block + "10:00 AM Welcome kids…") appears on every ministry page — it's theme boilerplate, not YDM schedule. Exclude from seed.
4. **URL typo preserved:** `/ministries/wordwide/` (should be "worldwide"). Decide whether to fix in Next.js routes and 301-redirect old URL.
5. **Slug mismatch:** event `/event/young-adults-connect/` renders as "Yeshua Sunday Service". Rename slug in new CMS; set up redirect.
6. **Header typo on live site:** Homepage H1 is "Minstries" (missing "i"). Fix on migration.
7. **Alternate home layouts** (`/home-two/`, `/home-three/`) are theme demos — do not migrate.
8. **Image credits page** (`/?page_id=44568`) is linked from nav but has no slug; determine if it's worth migrating.
9. **Giving integration:** GiveWP currently handles campaigns. Per CLAUDE.md the target stack is Stripe — plan a GiveWP → Stripe cutover with donor migration.
10. **Sermon content is rich** (full notes w/ scripture refs and timestamps). Model `sermons` table with: title, video_url, date, series, scripture_refs[], notes_html, timestamp_markers[].
11. **177 scraped URLs** are in `archive/wordpress/scrape/pages/` — use these as the primary seed source, NOT fresh re-scrapes.

---

## 14. Seed-data key candidates for `page_content` table

High-level namespacing suggestion (matches FOM pattern of `page.section.field`):

```
home.hero.headline            "Ministries"   (fix typo)
home.hero.subhead             "Uniting hearts in faith and fellowship."
home.support.title            "Support Our Mission"
home.support.body             "Your generosity makes a difference! …"
home.service_promo.time       "1:00 PM Every 4th Sunday"
home.service_promo.venue      "Inside Mississauga Church of God"
home.welcome.title            "A Christ-Centered Community for Worship & Growth"
home.welcome.body             "In a world that is constantly changing…"
home.mission.title            "Our Mission"
home.mission.body             "To share and spread the love of Christ through worship, discipleship, and service."
home.vision.title             "Our Vision"
home.vision.body              "A thriving community of empowered disciples transformed by faith, love, and action."
home.values.title             "Our Values"
home.values.body              "Faith, Community, Service, and Compassion."
home.ministries.title         "YDM Ministries"
home.events.title             "Upcoming Events"
home.featured_sermons.title   "Featured Sermons"
home.leaders.title            "Leading with Love"
home.get_involved.card1.title "Pray With Us"
home.get_involved.card2.title "Serve With Us"
home.get_involved.card3.title "Partner With Us"
home.newsletter.prompt        "Get updates on events and inspiration to your email."
footer.copyright              "© 2026 - All Rights Reserved"
contact.phone                 "+1 (416) 895-5178"
contact.email                 "Info@YDMinistries.ca"
contact.address               "P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0"
contact.venue                 "2460 The Collegeway, Mississauga, ON L5L 1V3"
```

Mirror the pattern for each `/ministries/*`, `/sermon/*`, `/campaigns/*`, `/event/*`, and blog post.

---

## 15. Authoritative source files in this repo

| File | What it gives you |
|---|---|
| `archive/wordpress/scrape/site-map.json` | All 177 URLs with titles |
| `archive/wordpress/scrape/pages/*.json` | Per-page headings + paragraphs + buttons + images |
| `archive/wordpress/scrape/navigation.json` | Header + footer menu structure |
| `archive/wordpress/scrape/colors.json` | Every color used in the compiled CSS |
| `archive/wordpress/scrape/fonts.json` | Font-family declarations |
| `archive/wordpress/scrape/images.json` | Image asset URLs |
| `archive/wordpress/scrape/styles.json` | Compiled CSS variables/rules |
| `archive/wordpress/scrape/pages.json` | Consolidated page JSON |

---

## 16. Open questions / things to verify before building

- [ ] Confirm actual Bible-study start time (7:00 PM on home/event pages vs. 7:30 PM on contact page)
- [ ] Read `fonts.json` to lock in typography tokens
- [ ] Get fresh, real bios for Bishop Huel and Clementina Wilson (current copy is CMSMasters demo)
- [ ] Decide fate of `/home-two/`, `/home-three/`, `/?page_id=44568` (image credits)
- [ ] Audit GiveWP → Stripe migration path for recurring donors
- [ ] Fix site-wide typos on relaunch ("Minstries" H1, "wordwide" slug, "Visit Out Sermons" heading — should be "Visit Our Sermons")
- [ ] Verify social-media URLs still active (Facebook profile ID looks like a new page from late 2024 based on the numeric ID)

---

*End of memory.md. Keep this file current as the site evolves or new pages are discovered.*
