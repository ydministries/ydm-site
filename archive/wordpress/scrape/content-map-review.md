# content-map.json — Pass 1a Review

**Scope:** 10 singleton top-level pages + global/nav/footer shared keys.
**Source of truth:** `archive/wordpress/scrape/content-map.json`
**Your job:** Go page-by-page below. For each page, confirm the three things at the bottom of the section. Anything marked `__needs_authoring__: true` is copy that the current WordPress site does not have (or has placeholder theme-demo copy) — you'll write those later in the admin panel.

---

## How to read a key

```
home.hero.title → { "type": "text", "value": "Ministries" }
│    │    │          │              │
│    │    │          │              └── the string that seeds into Supabase
│    │    │          └── value_type (text / richtext / url / email / phone / asset_key / number / date)
│    │    └── field name within the section
│    └── section on the page
└── page key

"value": null + "__needs_authoring__": true  → Bishop writes this later in the admin panel.
"__hint__": "..."                             → guidance for when Bishop writes it.
"note": "..."                                 → something to double-check before publish.
```

---

## 1. `global.*` — site-wide shared keys (nav, footer, identity, contact, service times, social)

**What it covers:** site name + taglines, copyright, phone/email/mailing address, venue address, Sunday & Bible-study times, 4 social URLs, header nav labels, footer column titles, newsletter prompt.

**Flagged for your eyes:**
- `service.biblestudy.time` = **7:00 PM** (per your locked decision — the old contact page said 7:30, we're going with 7:00).
- `site.copyright` = `© 2026 – All Rights Reserved`.

☐ Identity + taglines correct
☐ Phone / email / addresses correct
☐ Social URLs all work

---

## 2. `home.*` — the homepage

**What it covers:** 15 sections in order — hero → support banner → service promo → tagline → welcome → mission → vision → values → ministries grid → events → featured sermons → leaders → campaign promo → get involved (3 cards) → newsletter.

**Flagged for your eyes:**
- `hero.title` = "Ministries" (scrape had the typo "Minstries" — we're fixing it).
- `campaign_promo.body` needs authoring (current WP duplicated the support-banner copy — lazy).
- The three `get_involved.*.body` fields (Pray / Serve / Partner cards) need authoring — current WP has only titles, no body copy.
- `ministries_grid.subtitle` is empty by design — optional.

☐ Hero CTAs point to the right places
☐ Mission / Vision / Values wording matches what you actually preach
☐ "Get Involved" cards — you'll write the 3 short blurbs in the admin panel after launch

---

## 3. `about.*` — primary About page (replaces current `/aboutydm/`)

**What it covers:** hero → story → 5 beliefs → leadership teaser → closing CTA.

**Flagged for your eyes:**
- The 5 beliefs (`beliefs.item1` through `item5`) are authentic YDM copy pulled from the current ministry pages — these are real.
- Everything else (`story.body`, `leadership_teaser.body`, `cta.body`) starts empty because the current About is CMSMasters demo placeholder ("Corlears school" content).
- You will write the Story section after launch using the admin panel. Recommended: 3–5 paragraphs covering Bishop's calling, YDM's founding, and current reach.

☐ The 5 beliefs wording is correct (lightly edited for punctuation)
☐ OK that `story.body` is blank until you author it
☐ The page structure (hero → story → beliefs → leaders teaser → CTA) makes sense

---

## 4. `contact.*` — contact page

**What it covers:** hero → contact info block → hours → 9-category form → map.

**Flagged for your eyes:**
- `form.category.*` — 9 categories exactly as we agreed.
- `info.body` needs a short welcoming paragraph (optional — can be one sentence).
- Hours block shows Sunday 1 PM + Thursday 7 PM (locked).
- `map.embed_lat/lng` coordinates point at 2460 The Collegeway — verify the pin lands right when the page builds.

☐ 9 form categories correct
☐ Hours block is right
☐ All 6 form fields (name, email, phone, org, category, message, consent) feel right

---

## 5. `prayer_requests.*` — prayer wall page

**What it covers:** hero → intro → 4-field form → public prayer wall.

**Flagged for your eyes:**
- Form has a "share publicly (first-name only)" checkbox — if checked, the request appears on the public wall.
- `intro.body` needs authoring (warm 2-paragraph invitation).
- Success message reads "We're praying for you." — tune to your voice.

☐ OK with anonymous option (name = "Anonymous")
☐ OK with public wall — first-name only
☐ OK with team-lifts-up-requests framing

---

## 6. `our_ministries.*` — ministries index

**What it covers:** hero → intro → 7-tile grid. Each tile has a label + one-sentence summary; full ministry pages are Pass 1b (CPT template).

**Flagged for your eyes:**
- 7 summary sentences are my drafts — these are the first strings Bishop will read on the hub page, so they need to sound like YDM, not me. Edit in admin after launch.
- `intro.body` needs authoring.

☐ 7 ministries listed in a good order (Worship → Outreach → Family → Worldwide → Leadership → Partnership → Ask Bishop)
☐ My 1-sentence summaries are close enough to use as seeds

---

## 7. `our_team.*` — leadership team index

**What it covers:** hero → short intro → roster (roster comes from the Profile CPT in Pass 1b).

**Flagged for your eyes:**
- Currently only 2 profiles: Bishop Huel O. Wilson, Clementina Wilson. Both bios are placeholder theme-demo and need rewriting. That happens at Pass 1b (CPT templates).

☐ 2-profile roster is what you want for v1 (can add more anytime via admin)

---

## 8. `events_page.*` — events index

**What it covers:** hero → intro → filterable list (list items come from the Event CPT in Pass 1b).

**Flagged for your eyes:**
- Two filters to start: Services, Study groups (matches WordPress taxonomy).
- Empty-state message if no upcoming events.

☐ Two filter tabs is right

---

## 9. `latest_sermons.*` — sermon library

**What it covers:** hero → intro → featured/latest sermon → full list with 4 category filters + search.

**Flagged for your eyes:**
- 4 filter tabs: Expository / Narrative / Textual / Topical (matches current WordPress taxonomy).
- Search placeholder hints at searching scripture AND series.

☐ 4 category tabs is right
☐ OK with prominent "Latest sermon" featured block above the list

---

## 10. `our_campaigns.*` — give / campaigns landing

**What it covers:** hero → intro → active campaigns list → "other ways to give" (in-person, mail, monthly partner) → thank-you line.

**Flagged for your eyes:**
- `hero.title` is "Give" (friendlier than "Our Campaigns").
- The intro paragraph is authentic YDM copy (lifted from `/campaigns/supportydm/`).
- Mail address listed is P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0.
- Thank-you line preserves the 🙏 emoji from the current page.

☐ Hero title "Give" over "Our Campaigns" is fine
☐ Mail address listed correctly
☐ 🙏 emoji on thank-you line stays (this is the ONE place emoji shows in UI — final call)

---

## 11. `blog_page.*` — blog index

**What it covers:** hero → intro → filterable article list (articles come from blog-post CPT in Pass 1b).

**Flagged for your eyes:**
- 3 filter tabs: Faith / God's Word / Jesus (matches current WordPress categories).
- Search across article bodies.

☐ 3 category tabs is right

---

## Summary — what I need from you

For each of the 11 sections above, either:

- ✅ **Approve** (check the boxes, maybe flag small wording tweaks inline), or
- 🔄 **Revise** (tell me what changes — I edit content-map.json and we re-review).

**Common feedback you might give:**
- "Change `hero.subtitle` on the homepage to …"
- "Drop the `__needs_authoring__` flag on X — here's the copy: …"
- "Add a section for Y that I forgot to mention."
- "`mission.body` should say … not …"

Once Pass 1a is locked, Pass 1b generates content for every CPT instance (all sermons, ministries, events, campaigns, blog posts, profiles) from the WordPress XML export automatically. Then we seed Supabase (Step 2), build the primitives (Step 4), codegen the pages (Step 5), ship the admin (Step 6), and **only then** start styling.

Ready when you are.
