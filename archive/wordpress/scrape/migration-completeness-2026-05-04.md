# YDM Migration Completeness Audit

Read-only cross-reference: WP XML export → `route-map.json`. Flags every published item with substantive body content that has no migrated route.

## Summary

- Published WP items: **70**
- Migrated: **47**
- Intentionally dropped: **16**
- System / pagination: **0**
- **LIKELY MISSED: 7**

### Per post_type breakdown (published)

| post_type | count |
|---|---|
| `page` | 32 |
| `post` | 9 |
| `ministries` | 7 |
| `product` | 6 |
| `sermon` | 6 |
| `campaigns` | 2 |
| `cmsms_profile` | 2 |
| `tribe_organizer` | 2 |
| `tribe_venue` | 2 |
| `tribe_events` | 2 |

## LIKELY MISSED

| post_type | slug | title | body | date | reason | recommendation |
|---|---|---|---|---|---|---|
| `page` | `author-page` | Author Page | 4695B | 2023-09-19 | no matching route | review — likely real content |
| `product` | `faithful-leaders` | Faithful Leaders | 831B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |
| `product` | `beyond-sunday` | Beyond Sunday | 831B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |
| `product` | `workers-for-your-joy` | Workers for Your Joy | 722B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |
| `product` | `how-jesus-runs-the-church` | How Jesus Runs the Church | 502B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |
| `product` | `promoting-a-safer-church` | Promoting a Safer Church | 502B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |
| `product` | `to-heal-and-not-to-hurt` | To Heal And Not To Hurt | 502B | 2024-01-19 | unmapped post_type=product | review — short but mapped type |

## INTENTIONALLY DROPPED

| post_type | slug | body | reason |
|---|---|---|---|
| `page` | `donation-confirmation` | 14B | tiny body (14B) |
| `page` | `donation-failed` | 92B | tiny body (92B) |
| `page` | `home-two` | 14320B | demo/variant slug |
| `page` | `home-three` | 12668B | demo/variant slug |
| `page` | `donation-confirmation-2` | 14B | tiny body (14B) |
| `page` | `donor-dashboard-2` | 50B | tiny body (50B) |
| `page` | `donation-page` | 0B | tiny body (0B) |
| `page` | `donation-failed-2` | 92B | tiny body (92B) |
| `page` | `donor-dashboard` | 50B | tiny body (50B) |
| `page` | `our-campaigns-3` | 26B | tiny body (26B) |
| `page` | `campaigns-2` | 26B | tiny body (26B) |
| `page` | `our-campaigns-2` | 30B | tiny body (30B) |
| `tribe_organizer` | `emma-thompson` | 0B | tiny body (0B) |
| `tribe_organizer` | `bishop-h-o-wilson` | 0B | tiny body (0B) |
| `tribe_venue` | `church` | 0B | tiny body (0B) |
| `tribe_venue` | `erin-mills-church-of-god-inside-salvation-army-erin-mills-church` | 0B | tiny body (0B) |

## SYSTEM / PAGINATION

_None._

## ALL MIGRATED

| post_type | slug | route key |
|---|---|---|
| `campaigns` | `techfund` | `give.techfund` |
| `campaigns` | `supportydm` | `give.supportydm` |
| `cmsms_profile` | `bishopwilson` | `team.bishopwilson` |
| `cmsms_profile` | `clementinawilson` | `team.clementinawilson` |
| `ministries` | `partnership` | `ministries.partnership` |
| `ministries` | `leadership` | `ministries.leadership` |
| `ministries` | `wordwide` | `ministries.wordwide` |
| `ministries` | `family` | `ministries.family` |
| `ministries` | `outreach` | `ministries.outreach` |
| `ministries` | `worship` | `blog.tag.worship` |
| `ministries` | `ask-bishop` | `ministries.ask-bishop` |
| `page` | `contact` | `contact` |
| `page` | `about-us` | `about` |
| `page` | `blog-page` | `blog.index` |
| `page` | `home` | `home` |
| `page` | `our-ministries` | `ministries.index` |
| `page` | `latest-sermons` | `sermons.index` |
| `page` | `our-team` | `team.index` |
| `page` | `our-campaigns` | `give.index` |
| `page` | `events-page` | `events.index` |
| `page` | `gallery` | `gallery` |
| `page` | `ask` | `ask` |
| `page` | `prayer-requests` | `prayer` |
| `page` | `guestbook` | `guestbook` |
| `page` | `huel-clementina` | `team.huel_clementina` |
| `page` | `huelwilsonbio` | `team.huel_wilson` |
| `page` | `maltoncog` | `locations.maltoncog` |
| `page` | `westtoronto` | `locations.westtoronto` |
| `page` | `aboutydm` | `about` |
| `page` | `live` | `live` |
| `post` | `whats-your-view-of-marriage` | `blog.whats-your-view-of-marriage` |
| `post` | `how-to-develop-a-habit-of-worship` | `blog.how-to-develop-a-habit-of-worship` |
| `post` | `experiencing-the-freedom-of-gods-presence` | `blog.experiencing-the-freedom-of-gods-presence` |
| `post` | `discovering-the-power-of-waiting` | `blog.discovering-the-power-of-waiting` |
| `post` | `i-ruined-my-lifeis-there-hope-for-me` | `blog.i-ruined-my-lifeis-there-hope-for-me` |
| `post` | `your-mission-should-you-choose-to-accept-it` | `blog.your-mission-should-you-choose-to-accept-it` |
| `post` | `do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison` | `blog.do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison` |
| `post` | `four-things-our-church-should-still-focus-on` | `blog.four-things-our-church-should-still-focus-on` |
| `post` | `how-do-i-intercede-for-family-who-dont-believe-in-jesus` | `blog.how-do-i-intercede-for-family-who-dont-believe-in-jesus` |
| `sermon` | `the-heritage-of-a-godly-mother` | `sermons.the-heritage-of-a-godly-mother` |
| `sermon` | `repent-the-kingdom-of-god-is-at-hand` | `sermons.repent-the-kingdom-of-god-is-at-hand` |
| `sermon` | `gilgal-the-place-of-new-beginnings` | `sermons.gilgal-the-place-of-new-beginnings` |
| `sermon` | `jesus-is-coming-soon-signs-prophecy-hope` | `sermons.jesus-is-coming-soon-signs-prophecy-hope` |
| `sermon` | `jesus-the-ultimate-transformational-leader` | `sermons.jesus-the-ultimate-transformational-leader` |
| `sermon` | `here-am-i-send-me-a-vision-for-mission` | `sermons.here-am-i-send-me-a-vision-for-mission` |
| `tribe_events` | `weekly-bible-study-group` | `events.weekly-bible-study-group` |
| `tribe_events` | `young-adults-connect` | `events.young-adults-connect` |
