# Claude Code prompt — Seed Home page from master doc

**For:** Mikey to run inside Claude Code (VS Code)
**Prereq:** Open `/Users/mikeymusiq/Documents/Claude/Projects/YDM` in VS Code, ensure `site/.env.local` has Supabase service-role key

Paste this prompt into Claude Code:

---

I just updated `archive/wordpress/scrape/manual-seed.json` with new copy for the Home page (mapped from `YDM_MASTER_WEBCOPY.md` §2). I need you to seed it into Supabase, regenerate the page, and verify it renders correctly.

Run these steps in order:

**1. Validate the JSON syntax**
```bash
cd site && node -e "JSON.parse(require('fs').readFileSync('../archive/wordpress/scrape/manual-seed.json', 'utf8')); console.log('OK')"
```

**2. Dry-run the seed to preview what will change**
```bash
cd site && npx tsx scripts/seed-content.ts --dry-run 2>&1 | tail -50
```
Look for the `manual-seed merged: +N rows` line and confirm the home page rows include the new keys (welcome.body, founded_in_faith.body, mission.title, mission.body, vision.title, vision.body, values.title, values.body, support_banner.title, support_banner.body, newsletter.title, newsletter.prompt). If anything looks wrong, stop and report.

**3. Commit the seed to Supabase**
```bash
cd site && npx tsx scripts/seed-content.ts --commit 2>&1 | tail -20
```
Watch for "manual-seed merged: +13 rows" or similar — the new home rows should be inserted/updated.

**4. Regenerate the page components**
```bash
cd site && npm run codegen:pages 2>&1 | tail -10
```

**5. Build to confirm there are no type errors**
```bash
cd site && npm run build 2>&1 | tail -30
```
If build fails, report the error and stop.

**6. Start the dev server**
```bash
cd site && npm run dev
```
Then open: http://localhost:3000/

**Verification checklist when the page loads:**
- [ ] Hero section subtitle reads "Uniting hearts in faith and fellowship." (NOT old fallback)
- [ ] Welcome band shows "YDM: A Home for Your Soul." h2 + the 3-paragraph welcome body ("In a world that is constantly changing... We are not a building. We are a family")
- [ ] Founded in Faith section heading reads "Fifty Years of Faithful Ministry, One New Calling" + the new origin paragraph mentioning Bishop's 50 years and YDM founded 2020
- [ ] Mission/Vision/Values 3-card grid shows the three short blurbs (mission "share and spread the love of Christ"; vision "thriving community of empowered disciples"; values listing Faith/Community/Service/Compassion in bold)
- [ ] Support YDM's Mission banner shows the new body paragraph mentioning worship/leaders/outreach/worldwide
- [ ] Newsletter section reads "Get sermons, prayer updates, and event reminders straight to your inbox."
- [ ] Footer tagline reads "Uniting hearts in faith and fellowship. A home for your soul."
- [ ] YouTube link in footer/social goes to @YDMWorldwide (not @BishopHuelWilson)

Report back with screenshots of:
1. The hero + welcome band area
2. The Founded in Faith + Mission/Vision/Values area
3. Footer (to confirm tagline + YouTube link)

If everything looks right, push to GitHub:
```bash
git add archive/wordpress/scrape/manual-seed.json site/src/app
git commit -m "feat(home): seed master-doc copy — welcome, founded-in-faith, mission/vision/values, support banner, newsletter prompt; correct YouTube handle to @YDMWorldwide and tagline"
git push
```

If anything's broken or the copy doesn't render, stop and tell me what you see — I'll fix the seed and we'll rerun.

---

## Notes

- **What this prompt does:** Updates 13 home-page rows + 2 global rows (YouTube URL + tagline). Total ~15 rows changed.
- **What it doesn't touch:** Other pages (about, ministries, sermons, etc.) — those come in subsequent rounds.
- **Rollback:** If the seed creates problems, the previous content is preserved in git history of `manual-seed.json`. Revert that file and re-run `seed-content.ts --commit` to restore.
- **Codegen rule:** Never hand-edit `site/src/app/(site)/page.tsx` — it's regenerated from route-map + content. All edits go through `manual-seed.json` → seed → codegen.
