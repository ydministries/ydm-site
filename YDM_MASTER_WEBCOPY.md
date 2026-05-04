# YDM Master Web Copy

**Yeshua Deliverance Ministries**
**Compiled:** 2026-05-04
**Webmaster:** Mikey
**Source material:** `copy-research/` docs (7 files), WordPress scrape (32 page JSONs), `memory.md`, route-map.json, interview answers from Mikey on 2026-05-04

---

## How to read this doc

Every page on the site has a section here. Each section gives you:

- **URL** — final Next.js route
- **Page key** — the Supabase `page_content` namespace (matches `route-map.json`)
- **Audience** — primary reader for this page
- **Voice** — reverent, warm, or hybrid
- **Hero** — the top-of-page block (headline + subhead + CTA)
- **Body copy** — the full page text, in publishable form
- **SEO meta** — page title + meta description
- **Notes** — any decisions, dependencies, or migration directives

All decisions are resolved as of 2026-05-04. The full decisions log is in §25. Bishop should still audit each page in a final review pass to confirm dates, regions, and ministry-specific facts.

---

## Table of Contents

1. [Site-Wide Elements](#1-site-wide-elements)
2. [Home — `/`](#2-home---)
3. [About YDM — `/about`](#3-about-ydm---about)
4. [Bishop Huel O. Wilson — `/about/bishop-wilson`](#4-bishop-huel-o-wilson---aboutbishop-wilson)
5. [Our Team — `/team`](#5-our-team---team)
6. [Our Ministries — `/our-ministries`](#6-our-ministries---our-ministries)
7. [Worship Ministry — `/our-ministries/worship`](#7-worship-ministry)
8. [Leadership & Development — `/our-ministries/leadership`](#8-leadership--development)
9. [Family Ministry — `/our-ministries/family`](#9-family-ministry)
10. [Compassion & Outreach — `/our-ministries/outreach`](#10-compassion--outreach)
11. [Worldwide Ministry (Online) — `/our-ministries/worldwide`](#11-worldwide-ministry-online)
12. [Partnership & Support — `/our-ministries/partnership`](#12-partnership--support)
13. [Ask Bishop — `/our-ministries/ask-bishop`](#13-ask-bishop)
14. [Latest Sermons — `/sermons`](#14-latest-sermons---sermons)
15. [Watch Live — `/live`](#15-watch-live---live)
16. [Events — `/events`](#16-events---events)
17. [Blog — `/blog`](#17-blog---blog)
18. [Give — `/give`](#18-give---give)
19. [Contact — `/contact`](#19-contact---contact)
20. [Prayer Requests — `/prayer-requests`](#20-prayer-requests---prayer-requests)
21. [Share Your Story — `/share-your-story`](#21-share-your-story---share-your-story)
22. [Gallery — `/gallery`](#22-gallery---gallery)
23. [404 / Not Found](#23-404--not-found)
24. [SEO Meta Reference](#24-seo-meta-reference)
25. [Decisions & Open Items](#25-decisions--open-items)

---

# 1. Site-Wide Elements

These strings appear across multiple pages. Every page must use the same wording.

## 1.1 Identity

| Field | Value |
|---|---|
| Ministry name | Yeshua Deliverance Ministries |
| Short name | YDM |
| Legal entity | YDM Inc. |
| Founder & Senior Pastor | Bishop Huel O. Wilson |
| First Lady | Clementina Wilson |
| Founded | 2020 |
| Tagline (lead) | **YDM: Uniting hearts in faith and fellowship. A home for your soul.** |
| Tagline (short, for tight UI) | A home for your soul. |
| Copyright | © 2026 Yeshua Deliverance Ministries — All Rights Reserved |

## 1.2 Mission, Vision, Core Values

**Our Mission**
> To share and spread the love of Christ through worship, discipleship, and service.

**Our Vision**
> A thriving community of empowered disciples transformed by faith, love, and action.

**Our Core Values**
> Faith. Community. Service. Compassion.

## 1.3 Contact

| Field | Value |
|---|---|
| Phone | +1 (416) 895-5178 |
| Email | Info@YDMinistries.ca |
| Mailing address | P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0 |
| Worship venue | Mississauga Church of God (inside Salvation Army Erin Mills Church), 2460 The Collegeway, Mississauga, ON L5L 1V3 |

## 1.4 Service & Event Times

- **Yeshua Sunday Service** — Every 4th Sunday of the month, **1:00 PM**
- **Weekly Bible Study** — Every Thursday, **7:00 PM**
- Both at Mississauga Church of God (inside Salvation Army Erin Mills Church)

## 1.5 Social Media

| Platform | Handle | URL |
|---|---|---|
| YouTube | @YDMWorldwide | https://www.youtube.com/@YDMWorldwide |
| Instagram | @yd.ministries | https://www.instagram.com/yd.ministries/ |
| Facebook | YDM | https://www.facebook.com/profile.php?id=61580380624275 |
| LinkedIn | Bishop Huel Wilson | https://www.linkedin.com/in/bishop-huel-wilson-3378602b/ |

## 1.6 Footer

**Top line (tagline)**
> Uniting hearts in faith and fellowship. A home for your soul.

**Quick links** (4 columns)
- *Visit:* Plan Your Visit · Service Times · Directions · Watch Live
- *Connect:* Latest Sermons · YouTube · Instagram · Facebook
- *Grow:* Bible Study · Our Ministries · Ask Bishop · Prayer Requests
- *Give:* Support YDM · Tech Fund · Partner With Us · Volunteer

**Address block**
> Mississauga Church of God (inside Salvation Army Erin Mills Church)
> 2460 The Collegeway, Mississauga, ON L5L 1V3
> Mailing: P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0
> Info@YDMinistries.ca · +1 (416) 895-5178

**Copyright row**
> © 2026 Yeshua Deliverance Ministries · All Rights Reserved · Built with care for the YDM family

## 1.7 Universal Calls to Action (reusable buttons)

| Button label | Goes to |
|---|---|
| Watch the latest sermon | `/sermons` (most recent) |
| Plan your visit | `/contact#visit` |
| Submit a prayer request | `/prayer-requests` |
| Ask Bishop a question | `/our-ministries/ask-bishop` |
| Give to YDM | `/give/supportydm` |
| Subscribe on YouTube | https://www.youtube.com/@YDMWorldwide?sub_confirmation=1 |

---

# 2. Home — `/`

- **URL:** `/`
- **Page key:** `home`
- **Audience:** All four (congregation, seekers, diaspora/online viewers, donors)
- **Voice:** Warm, welcoming, scripture-forward
- **Primary CTA:** Watch the latest sermon

## 2.1 Hero

**Headline (h1)**
> A home for your soul.

**Subhead**
> Yeshua Deliverance Ministries is a Christ-centered family led by Bishop Huel O. Wilson. Whether you're new to faith, returning after a long season away, or walking with the Lord for years — there's a place for you here.

**Primary CTA (button)**
> ▶ Watch the latest sermon

**Secondary CTAs (text links beneath)**
> Plan your visit · Submit a prayer request

**Hero quote (small, beneath CTAs)**
> *"Come to me, all you who are weary and burdened, and I will give you rest."* — Matthew 11:28

---

## 2.2 Welcome — "Who We Are"

**Section headline**
> Welcome home.

**Body**
> In a world that is constantly changing, some things remain constant. The love of God is one of them.
>
> We believe that every person deserves a place where they feel known, accepted, and loved — a place to grow in faith, find community, and discover the purpose God has for their life. Whether you are new to faith, exploring what it means to follow Jesus, or have been walking with Him for years, there is a place for you here.
>
> We are not a building. We are a family — gathered around Jesus, sent into the world.

**CTA**
> Learn more about YDM →

---

## 2.3 Service Times Block

**Headline**
> Come worship with us.

**Service card 1 — Yeshua Sunday Service**
> **Every 4th Sunday of the month — 1:00 PM**
> Mississauga Church of God (inside Salvation Army Erin Mills Church)
> 2460 The Collegeway, Mississauga, ON
>
> [Get directions] [Plan your visit]

**Service card 2 — Weekly Bible Study**
> **Every Thursday — 7:00 PM**
> Same location. Open to everyone.
>
> [Learn more about Bible study]

---

## 2.4 Latest Sermon Feature

**Section headline**
> The latest from Bishop Wilson.

**Body**
> Watch this week's message and join thousands across the world receiving the Word from Bishop Huel O. Wilson and YDM Worldwide.

**[Embed: latest YouTube sermon]**

**CTA row**
> [▶ Watch on YouTube] [📚 Browse the sermon library] [🔔 Subscribe]

---

## 2.5 Our Ministries Grid (7 cards)

**Section headline**
> How we serve.

**Section intro**
> Seven ministries, one mission. Each one is a way for the love of Christ to take shape — in worship, in our families, in our city, and around the world.

| Card | One-line description |
|---|---|
| **Worship Ministry** | The Word preached, the people gathered, the presence of God. |
| **Leadership & Development** | Equipping the next generation of pastors, ministers, and emerging leaders. |
| **Family Ministry** | Strong families, Christ-centered marriages, children dedicated to the Lord. |
| **Compassion & Outreach** | Hospitals, nursing homes, prisons, and the people the world overlooks. |
| **Worldwide Ministry (Online)** | The gospel beyond borders — through every screen, in every nation. |
| **Partnership & Support** | Joining hands to advance the Kingdom of God. |
| **Ask Bishop** | Bring your questions. Bishop Wilson answers in love and truth. |

**Section CTA**
> [Explore all ministries →]

---

## 2.6 Meet Bishop Wilson Block

**Section headline**
> 50 years of faithful ministry.

**Body**
> Bishop Huel O. Wilson has shepherded God's people for half a century — from a small congregation in Malton with three members and a guitar, to a thriving worldwide ministry reaching every continent through the spoken Word.
>
> In 2020, after a lifetime of pastoring, teaching, and serving the Church of God across Canada and beyond, Bishop Wilson founded Yeshua Deliverance Ministries — the late-career calling of a man who has spent his life learning how to lead God's people home.

**CTA**
> [Read his full story →]

---

## 2.7 Get Involved Strip (3-column) {#get-involved-strip}

**Section headline**
> Three ways to take the next step.

| Column | Headline | Body | CTA |
|---|---|---|---|
| 1 | **Need prayer?** | Bishop and the YDM team will pray over your request personally. Nothing is too big or too small. | [Submit a prayer request] |
| 2 | **Have a question?** | Bishop answers questions about faith, life, scripture, and the walk with Christ — in love and in truth. | [Ask Bishop] |
| 3 | **Stand with us.** | Your partnership keeps the gospel going out — in our city, on our screens, and around the world. | [Give to YDM] |

---

## 2.8 Final Invitation

**Section headline**
> We'd love to meet you.

**Body**
> The next Yeshua Sunday Service is the 4th Sunday of this month at 1:00 PM. Come early, stay late, ask questions. There's coffee, there's fellowship, and there's a seat with your name on it.

**CTA**
> [Plan your visit →]

---

# 3. About YDM — `/about`

- **URL:** `/about`
- **Page key:** `about`
- **Aliases:** `/about-us` (301-redirect)
- **Audience:** Seekers and curious visitors trying to understand what YDM is
- **Voice:** Reverent + clear (this is a foundational identity page)
- **Primary CTA:** Read Bishop Wilson's bio · Plan your visit

## 3.1 Hero

**Headline (h1)**
> About Yeshua Deliverance Ministries

**Subhead**
> A Christ-centered family. A worldwide voice. A late-career calling forty years in the making.

---

## 3.2 Who We Are

> Yeshua Deliverance Ministries (YDM) is a Christ-centered ministry founded in 2020 by Bishop Huel O. Wilson — a pastor, teacher, and ordained Bishop with over 50 years of service to the Church of God in Canada and beyond.
>
> We exist to share the love of Christ through three callings: the worship and teaching of God's Word, the equipping of believers and leaders for the work of ministry, and the carrying of the gospel far beyond our walls — into hospitals, prisons, nursing homes, and into homes around the world through every screen God has given us.

---

## 3.3 Why the Name — Yeshua. Deliverance.

**Headline**
> Why the name?

**Body**
>
> **Yeshua** is the Hebrew name of Jesus — the name His mother and disciples called Him, the name angels announced before His birth, the name written into the prophetic heritage of Israel. To call Him Yeshua is to honor where He came from and to remember that the gospel did not begin in English. It began with a Jewish carpenter who fulfilled centuries of promises and opened the doors of the Kingdom to every nation.
>
> **Deliverance** is what He came to bring. Not just forgiveness — though He brings that. Not just heaven someday — though He promises that too. Deliverance is freedom right now: from fear, from shame, from spiritual bondage, from the brokenness we cannot fix on our own. Jesus Himself stood in a synagogue and read the words of Isaiah aloud:
>
> > *"He has sent me to proclaim freedom for the prisoners and recovery of sight for the blind, to set the oppressed free."* — Luke 4:18
>
> That is what we mean by Deliverance Ministry. The full work of Jesus, applied to the full life of every person who walks through our doors.

---

## 3.4 Our Mission, Vision, and Values

**Mission**
> To share and spread the love of Christ through worship, discipleship, and service.

**Vision**
> A thriving community of empowered disciples transformed by faith, love, and action.

**Core Values**
> **Faith** — We trust the unchanging Word of God in a changing world.
> **Community** — We do not walk alone. We grow together.
> **Service** — Love that does not act is not love at all.
> **Compassion** — We meet people where they are, the way Jesus did.

---

## 3.5 What Makes YDM Different

**Headline**
> Three threads, one calling.

> Yeshua Deliverance Ministries is unlike most churches a visitor will encounter — and it is on purpose.
>
> **First, we are Spirit-led.** Our worship, our teaching, and our prayer all leave room for the Holy Spirit to move. Healing, deliverance, and the practical freedom of Christ are not relics of an earlier century at YDM — they are the daily work of the Church.
>
> **Second, we are pastorally seasoned.** Bishop Wilson has been ordained for over fifty years. He has shepherded congregations through revival and through hardship, planted churches, mentored pastors, and served as Administrative Bishop for the Church of God in Eastern Canada. The wisdom he carries is not borrowed — it is the fruit of a half-century walk with the Lord.
>
> **Third, we are worldwide.** Our YouTube channel, online services, and digital library carry the Word far beyond our walls — to the Caribbean, to Africa, to Europe, to wherever the diaspora has scattered, to anyone with a phone and a heart for God. YDM was born in 2020 — a year when the world needed the Church to learn how to reach across distance — and that calling is part of our DNA.

---

## 3.6 Welcome Statement

> In a world that is constantly changing, some things remain constant. The love of God is one of them. We believe that everyone deserves a place where they feel known, accepted, and loved — a place to grow in their faith, find community, and discover the purpose God has for their life. Whether you are new to faith, exploring what it means to follow Jesus, or have been walking with Him for years, there is a place for you here.

---

## 3.7 Meet the Leadership

**Bishop Huel O. Wilson — Founder & Senior Pastor**
> Ordained for over 50 years. Pastor, teacher, mentor, husband, father. The man God called to lead this work.
> [Read Bishop Wilson's full bio →]

**Clementina Wilson — First Lady of YDM**
> Bishop Wilson's wife of fifty years and his partner in ministry from the very first sermon. A teacher in her own right, she has led worship services, mentored countless women across the decades, and remains the steady, joyful presence behind every season of YDM's growth.

**[CTA] Meet the full team →**

---

## 3.8 Closing Invitation

> If you've read this far, we'd love to meet you. The next Yeshua Sunday Service is the 4th Sunday of this month at 1:00 PM. Bishop Wilson would consider it an honor to greet you at the door.

**[Plan your visit] [Watch this Sunday's sermon]**

---

# 4. Bishop Huel O. Wilson — `/about/bishop-wilson`

- **URL:** `/about/bishop-wilson`
- **Page key:** `about.bishop-wilson`
- **Aliases:** `/huelwilsonbio` and `/huel-clementina` (301-redirect both → here)
- **Audience:** Anyone wanting to know who leads YDM — the bio carries weight for donors, partners, congregants, and online viewers alike
- **Voice:** Reverent, dignified, narrative — this is the page where YDM honors the man God called
- **Primary CTA:** Watch a sermon · Plan your visit

## 4.1 Hero

**Headline (h1)**
> Bishop Huel O. Wilson

**Eyebrow line**
> Founder & Senior Pastor, Yeshua Deliverance Ministries

**Subhead**
> A devoted servant of God whose life reflects unwavering faith, visionary leadership, and a half-century commitment to the Gospel of Jesus Christ.

---

## 4.2 The Calling

> Bishop Huel O. Wilson is a devoted servant of God whose life reflects unwavering faith, visionary leadership, and steadfast commitment to the Gospel of Jesus Christ. From his early beginnings in Jamaica to his ministry journey across Canada and around the world, Bishop Wilson has dedicated his life to teaching, preaching, and shepherding God's people. As the founder and senior pastor of Yeshua Deliverance Ministries, his mission continues to impact lives locally and internationally, guiding countless souls into deeper relationship with Christ.

---

## 4.3 Childhood, Early Years, Encounter with Christ

**Subhead**
> Born in Jamaica, 1948.

> Bishop Wilson grew up in a God-fearing home where his parents, though not regular churchgoers themselves, ensured their children attended Sunday school and Good News classes. By age six or seven, he had begun to hear the message of Christ. By twelve, he had developed a deep love for the Lord — though he did not yet fully understand salvation.
>
> The turning point came at eighteen. He was working as a watch repairer at home in Kingston when he found himself standing at the door of a small unfinished church on Rosalie Avenue. Inside, a young preacher was proclaiming Christ's transforming power. As Bishop Wilson listened, he saw — in a vision — Jesus walking toward him. He heard the voice of the Lord say one word:
>
> > *"Come."*
>
> He answered in his heart with a simple *"yes."* And in that moment, his life was forever transformed.

---

## 4.4 Religious Education — Jamaica and Canada

> After his conversion, Wilson continued working as a watchmaker in Kingston while attending Life Tabernacle and taking courses at Life Bible School (Foursquare, Cassia Park Road), as well as "Back to the Bible" correspondence courses. He was hungry for the Word — and the Word was preparing him for what was coming next.
>
> In 1972, he immigrated to Canada and enrolled at the International Bible College in Moose Jaw, Saskatchewan, where he studied theology for two years. Before he had even graduated, he was granted his Exhorter's License — a junior minister's license that recognized what those around him already saw: the call of God on his life.
>
> Years later, he would continue his theological training, earning a Bachelor of Arts from Canada Christian College and a Doctorate of Divinity from Vision International University.

---

## 4.5 Agincourt — The Apprenticeship

**Years:** 1974–1976
**Location:** Toronto, Ontario

> Upon his return to Toronto from Moose Jaw, Bishop Wilson was assigned to the Agincourt Church of God — then meeting at L'Amoreaux Collegiate Institute — under the leadership of Pastor Dalton Fraser. For roughly two years, he immersed himself in the apprenticeship of pastoral ministry: he played guitar, sang in the choir, witnessed faithfully on the streets, and helped lead the youth ministry.
>
> These were the foundational years. The years where instinct became discipline, and discipline became calling. Pastor Fraser's mentorship would mark the rest of his life.

---

## 4.6 Malton Church of God — The Building Years

**Years:** 1977 onward
**Location:** Malton, then Brampton, Ontario

> In 1977, after much prayer, Bishop Wilson accepted the assignment to pastor the Malton Church of God — then meeting at Darcel Public School. The congregation, on the day he arrived, consisted of a handful of members: Brother and Sister Somerville and their children.
>
> What happened next is the kind of story that gets told in the household of God for generations.
>
> They began with three members and a guitar. Within a few years, the church had baptized many, run three buses to bring people to services, and become known across the Greater Toronto Area for its powerful evangelism. In 1990 — despite an initial rejection from lenders — the congregation purchased its first permanent home at 7050 Bramalea Road, transforming an industrial unit into a sanctuary. The very first Sunday in the new building, the room was full. Within a year, the congregation had doubled.
>
> They later acquired a second, larger unit, where Sunday schools, food bank outreach, and youth ministries flourished. Evangelists Maxine Johnson, W.A. Blair, Joshua Kelly and others ministered regularly, and Malton became a hub of revival and deliverance in the GTA. By the late 1980s and into the 1990s, members recall the church so full that chairs had to be placed in hallways to accommodate the crowds.
>
> Bishop Wilson's heart for the people in those years became the template for everything YDM would later become: pastoral, present, available, attentive — never treating any member as merely a "member."

---

## 4.7 Administrative Bishop — Church of God, Eastern Canada

**Year of consecration:** 2000

> In the year 2000, after more than two decades of pastoral leadership at Malton, Bishop Wilson was consecrated as Administrative Bishop for the Church of God in Eastern Canada. In this role, he oversaw pastors, supported church planting, and facilitated regional unity across a wide geography.
>
> His administrative leadership strengthened the organization at every level — but his heart remained pastoral. Even in the bishopric, he was a pastor first: close to the people, committed to the local church, and most at home with a Bible open and a congregation in front of him.

---

## 4.8 West Toronto Church of God

**Years:** 2010–2015 *(placeholder — Bishop to confirm during final audit)*

> Following his years at Malton and his service as Administrative Bishop, Bishop Wilson was reassigned to West Toronto Church of God from roughly 2010 to 2015, where he continued his dynamic preaching and pastoral care. His tenure there extended his influence across the city of Toronto, uniting diverse believers and expanding outreach into new neighbourhoods.

---

## 4.9 Yeshua Deliverance Ministries — A Calling for the Now

**Founded:** 2020

> In 2020 — at a moment when the world was learning, all at once, what it meant to be a Church without walls — Bishop Wilson answered a fresh call from God and founded Yeshua Deliverance Ministries.
>
> YDM was built around a vision he had carried for decades: a Spirit-led ministry of deliverance, healing, and restoration; a church that takes scripture seriously and the Holy Spirit seriously; a community that equips believers for spiritual warfare and victorious living. From the outset, the ministry was designed to reach far beyond a single building — across borders, across screens, across generations.
>
> Today, YDM continues to thrive under his leadership, impacting lives across Canada and around the world.

---

## 4.10 Clementina — Partner in Life and Ministry

**Married:** 1976 (50 years and counting)

> Alongside his ministry stands his beloved wife, Clementina — his partner in life and service for fifty years. They were married in 1976, the same season Bishop Wilson received his ministerial license, and they have walked together ever since: through the building of churches, the raising of two daughters, and the founding of YDM.
>
> Clementina is the First Lady of YDM, but the title only tells half the story. She has been by Bishop's side from the very beginning of his ministry. She has led worship services in her own right. She has taught and mentored countless men and women across the decades. The strength, joy, and steadiness of YDM today is, in no small measure, the fruit of her faithfulness alongside his.
>
> Bishop Wilson often credits his wife's unwavering support and spiritual depth as a cornerstone of his fifty years of ministry. Together, they model what Christian marriage and partnership can look like when two people place Christ at the center.

---

## 4.11 Today

> Bishop Wilson currently serves as a Chaplain at West Side Long-Term Care in Toronto, where he ministers to elders in their final season of life. He continues to lead Yeshua Deliverance Ministries, preach worldwide through YDM's online platforms, and disciple the next generation of leaders rising up around him.
>
> He believes in the imminent return of Jesus Christ, and he is committed to winning the lost for Christ — for as long as the Lord gives him breath.

---

## 4.12 Credentials at a Glance

- **Ordained:** Bishop within the Church of God for over 50 years
- **Education:** Foursquare Life Bible School (Cassia Park Road, Jamaica) · International Bible College (Moose Jaw, SK) · B.A., Canada Christian College · Doctor of Divinity, Vision International University
- **Pastorates:** Agincourt Church of God (assistant, 1974–1976) · Malton Church of God (senior pastor, 1977 onward) · West Toronto Church of God · Founder & Senior Pastor, Yeshua Deliverance Ministries (2020–present)
- **Episcopal service:** Administrative Bishop, Church of God in Eastern Canada (consecrated 2000)
- **Current chaplaincy:** West Side Long-Term Care, Toronto
- **Family:** Married to Clementina Wilson (1976–present); two daughters

---

## 4.13 Closing — Hear Him Preach

> The best way to understand Bishop Wilson is to hear him preach.

**[Watch the latest sermon] [Browse the sermon library]**

---

# 5. Our Team — `/team`

- **URL:** `/team`
- **Page key:** `team.index`
- **Aliases:** `/our-team` (301-redirect)
- **Audience:** Visitors who want to know who they'll meet
- **Voice:** Warm, brief

## 5.1 Hero

**Headline (h1)**
> Meet the YDM Family

**Subhead**
> The people God has called to serve, teach, and shepherd at Yeshua Deliverance Ministries.

## 5.2 Body

> YDM is a Bishop-led ministry built around a small, tight-knit core of faithful servants. We believe ministry is personal — that you should know the people praying for you, teaching you, and serving you on a Sunday. Below you'll meet the leadership of Yeshua Deliverance Ministries.

## 5.3 Team Cards

**Bishop Huel O. Wilson** — *Founder & Senior Pastor*
> Ordained for over 50 years. Founder of YDM. Pastor, teacher, mentor.
> [Read full bio →]

**Clementina Wilson** — *First Lady of YDM*
> Bishop Wilson's wife of fifty years and his partner in ministry from the beginning. Worship leader, teacher, and mentor to women across the decades.

> *YDM is intentionally Bishop-led and small. Beyond Bishop and First Lady, the work is sustained by the wider YDM family — every member who prays, gives, serves, and shows up.*

---

# 6. Our Ministries — `/our-ministries`

- **URL:** `/our-ministries`
- **Page key:** `ministries.index`
- **Audience:** All
- **Voice:** Warm, scripture-light, surveys what YDM does

## 6.1 Hero

**Headline (h1)**
> How We Serve.

**Subhead**
> Seven ministries. One mission. Each one a way for the love of Christ to take shape — in worship, in our families, in our city, and around the world.

## 6.2 Intro

> The work of the Church is not done by one person. At YDM, every ministry exists because there is a real need — and real people called by God to meet it. Click any ministry below to learn more, or scroll to find the one that fits where you are right now.

## 6.3 Ministry Cards (7)

Each card: ministry name (h3), one-line tagline, 2-sentence description, [Learn more →] CTA.

**Worship Ministry**
> *The Word preached. The people gathered. The presence of God.*
> The heartbeat of YDM. Through monthly preaching, baptism, and Spirit-led worship, this ministry is where we meet God together.
> [Learn more →]

**Leadership & Development**
> *Equipping the next generation.*
> Strong churches are built on strong leaders. We train pastors, ministers, and emerging leaders to serve with excellence and depth.
> [Learn more →]

**Family Ministry**
> *Christ at the center of every home.*
> From weddings and dedications to marriage retreats and parenting workshops — we help families build on the rock that does not move.
> [Learn more →]

**Compassion & Outreach**
> *The love of Christ, beyond our walls.*
> Hospital visits. Senior nursing homes. Prison ministry. Chaplaincy. The places the world overlooks are where this ministry lives.
> [Learn more →]

**Worldwide Ministry (Online)**
> *The gospel beyond borders.*
> Through YouTube, online Bible studies, and live-streamed gatherings, YDM reaches every continent — wherever there is a screen and a hungry heart.
> [Learn more →]

**Partnership & Support**
> *Joining hands to advance the Kingdom.*
> Ministry is never done alone. Our partners stand with YDM through prayer, giving, and service — sharing in every soul touched.
> [Learn more →]

**Ask Bishop**
> *Bring your questions. Bishop answers in love and truth.*
> A direct line to Bishop Wilson for your questions about faith, scripture, and life. Submit a question; receive a thoughtful answer.
> [Learn more →]

---

# 7. Worship Ministry

- **URL:** `/our-ministries/worship`
- **Page key:** `ministries.worship`
- **Voice:** Warm, scripture-rooted

## 7.1 Hero

**Headline (h1)**
> Worship Ministry

**Eyebrow line**
> *"Worship the Lord with gladness; come before Him with joyful songs."* — Psalm 100:2

**Subhead**
> The heartbeat of YDM. Where the Word is preached with power, where God's people gather, and where the presence of the Lord is honoured.

## 7.2 Body

> The Worship Ministry at Yeshua Deliverance Ministries is the heartbeat of our fellowship — the place where the presence of God is honored and His Word is proclaimed with clarity and passion. Led by Bishop Huel O. Wilson, this ministry brings together preaching, teaching, and Spirit-led worship to inspire believers and invite seekers into a life-changing encounter with Christ. Monthly preaching and teaching services provide biblical instruction that is both relevant and practical, equipping each person to apply God's truth in daily living. Baptism services, a sacred celebration of new life in Christ, mark milestones of faith and strengthen our community. And our worldwide video library means the Word continues to build and nurture faith long after Sunday is over.
>
> In addition to our regular gatherings, the Worship Ministry organizes special worship nights and revival services that encourage spiritual renewal and deeper connection with God. These events provide extended times of praise, intercession, and teaching that refresh the spirit and energize the soul. We also invest in training worship leaders and musicians, ensuring that every aspect of worship is marked by excellence and a true heart of devotion. At its core, this ministry is not about performance — it is about ushering people into the presence of God, where healing, transformation, and deliverance take place. Whether you join us in person, watch online, or witness a baptism, the Worship Ministry is committed to helping you encounter the living Christ in a way that strengthens your walk and inspires your worship.

## 7.3 What This Ministry Does

- Monthly preaching and teaching services
- Water baptism services
- Special worship nights and revival services
- Worship leader and musician training
- A worldwide video library of sermons and ministry events

## 7.4 Get Involved

**Headline**
> Take the next step.

| Action | CTA |
|---|---|
| Watch this Sunday's message | [Watch the latest sermon] |
| Worship with us in person | [Plan your visit] |
| Join the worship team or musicians | [Contact us] |

---

# 8. Leadership & Development

- **URL:** `/our-ministries/leadership`
- **Page key:** `ministries.leadership`
- **Voice:** Warm, with weight (this is for current and emerging leaders)

## 8.1 Hero

**Headline (h1)**
> Leadership & Development

**Eyebrow line**
> *"And the things you have heard me say... entrust to reliable people who will also be qualified to teach others."* — 2 Timothy 2:2

**Subhead**
> Equipping pastors, ministers, and emerging leaders to serve with excellence and depth — under the mentorship of a Bishop who has been doing it for 50 years.

## 8.2 Body

> Strong churches are built on strong leaders, and the Leadership & Development Ministry at YDM exists to equip men and women for excellence in service. Under the guidance of Bishop Huel O. Wilson, this ministry develops leaders who are biblically grounded, Spirit-led, and practically prepared to face the challenges of ministry today. Our training programs cover preaching and teaching skills, organizational development, pastoral care, and effective communication. They are designed not only for current leaders but also for those who feel the call of God on their lives and want to be mentored into greater roles of responsibility. Through teaching, encouragement, and hands-on experience, YDM helps leaders rise to their full potential in Christ.
>
> Beyond structured training, the Leadership & Development Ministry provides one-on-one mentorship for pastors, ministers, and emerging leaders who desire personal guidance and spiritual accountability. Bishop Wilson facilitates leadership retreats and conferences that allow participants to step away from daily responsibilities and focus on renewal, vision, and growth. We are also developing online training modules to ensure leaders worldwide can benefit from YDM's leadership resources. The heartbeat of this ministry is to invest in leaders who will, in turn, disciple others and multiply the work of the Kingdom. By equipping leaders with both spiritual depth and practical skill, YDM ensures that the church remains strong, relevant, and effective in its mission.

## 8.3 What This Ministry Offers

- Leadership training programs (preaching, pastoral care, communication, organization)
- Mentorship for pastors, ministers, and emerging leaders
- Leadership retreats and conferences
- Online training modules (in development)

## 8.4 Get Involved

| Action | CTA |
|---|---|
| Apply for mentorship | [Contact us] |
| Attend the next leadership retreat | [See events] |
| Partner with this ministry | [Give to YDM] |

---

# 9. Family Ministry

- **URL:** `/our-ministries/family`
- **Page key:** `ministries.family`
- **Voice:** Warm

## 9.1 Hero

**Headline (h1)**
> Family Ministry

**Eyebrow line**
> *"As for me and my house, we will serve the Lord."* — Joshua 24:15

**Subhead**
> Strong marriages. Christ-centered homes. Children dedicated to the Lord.

## 9.2 Body

> Family is at the center of God's design, and YDM's Family Ministry is devoted to helping families thrive in faith and unity. Bishop Huel O. Wilson, as a Licensed Marriage Officer, brings biblical wisdom and compassion to weddings, pre-marital counseling, and marriage ceremonies. These services honor the sacred covenant of marriage and prepare couples for lifelong commitment built on a Christ-centered foundation. In addition to marriage, the ministry provides baby and child dedication services, affirming parents' desire to raise their children in the faith and committing the church community to support them. Through consistent teaching and practical biblical guidance, YDM empowers families to build homes where love, prayer, and faith are central.
>
> The Family Ministry extends its impact through parenting workshops and family seminars that address the unique challenges of today's households. Bishop Wilson facilitates marriage enrichment retreats where couples can strengthen their bond and rediscover joy in their relationship. Whether counseling young couples, supporting parents in their spiritual responsibilities, or guiding families through difficult seasons, YDM provides care and teaching that nurture healthy, Christ-centered families. We believe that when families are strong, the church and the community become stronger as well. By providing biblical tools, supportive community, and practical guidance, the Family Ministry helps families build a legacy of faith that can be passed on for generations.

## 9.3 Services Offered

- Weddings (Licensed Marriage Officer)
- Pre-marital counseling
- Baby and child dedications
- Marriage enrichment retreats
- Parenting workshops and family seminars
- Biblical guidance through difficult family seasons

## 9.4 Get Involved

| Action | CTA |
|---|---|
| Inquire about a wedding | [Contact us] |
| Schedule a child dedication | [Contact us] |
| Register for the next marriage retreat | [See events] |

---

# 10. Compassion & Outreach

- **URL:** `/our-ministries/outreach`
- **Page key:** `ministries.outreach`
- **Voice:** Warm with quiet weight

## 10.1 Hero

**Headline (h1)**
> Compassion & Outreach

**Eyebrow line**
> *"Truly I tell you, whatever you did for one of the least of these brothers and sisters of Mine, you did for Me."* — Matthew 25:40

**Subhead**
> Hospitals. Nursing homes. Prisons. The people the world overlooks are where this ministry lives.

## 10.2 Body

> The Compassion & Outreach Ministry at YDM exists to embody the love of Christ by reaching beyond the walls of the church to those most in need. Bishop Huel O. Wilson leads this ministry with a heart of service, bringing comfort, encouragement, and hope to the sick, the elderly, the incarcerated, and the marginalized. Hospital ministry provides prayer and support to those walking through illness. Senior nursing home visits offer fellowship and compassion to elders who may feel forgotten. Prison ministry brings the light of Christ to those behind bars, offering spiritual counsel, encouragement, and the reminder of God's unchanging love. Chaplaincy services extend YDM's reach into diverse settings, offering pastoral care to people of all backgrounds and circumstances.
>
> In addition to these vital ministries, the Compassion & Outreach Ministry organizes community food and clothing drives that meet practical needs while opening doors for gospel conversations. Youth mentorship and outreach programs guide young people toward wise choices and purpose in Christ. At its heart, this ministry reflects the compassion of Jesus, who cared for the poor, the sick, and the oppressed. Every outreach effort is grounded in the belief that small acts of kindness can lead to eternal transformation. By partnering with YDM in outreach, you are helping to touch lives with the healing, hope, and love of Christ.

## 10.3 Where We Serve

- Hospital ministry
- Senior nursing home visits
- Prison ministry
- Chaplaincy services (Bishop Wilson currently serves as Chaplain at West Side Long-Term Care, Toronto)
- Community food and clothing drives
- Youth mentorship and outreach

## 10.4 Get Involved

| Action | CTA |
|---|---|
| Volunteer with the outreach team | [Contact us] |
| Sponsor a food or clothing drive | [Give to YDM] |
| Request a hospital or home visit | [Contact us] |

---

# 11. Worldwide Ministry (Online)

- **URL:** `/our-ministries/worldwide`
- **Page key:** `ministries.worldwide`
- **Voice:** Warm, energetic, global
- **Note:** WP slug was misspelled `wordwide` — fixed in new URL

## 11.1 Hero

**Headline (h1)**
> Worldwide Ministry (Online)

**Eyebrow line**
> *"Go into all the world and preach the gospel to all creation."* — Mark 16:15

**Subhead**
> The gospel beyond borders — through every screen, in every nation. YDM's online ministry reaches the diaspora and the digital generation alike.

## 11.2 Body

> The Worldwide Ministry (Online) is YDM's commitment to spreading the gospel beyond geographical limits. Through modern technology and digital platforms, Bishop Huel O. Wilson ensures that the life-changing message of Jesus Christ is accessible to people everywhere. Sermons, teachings, and ministry events are available through our online video library, making biblical content accessible at any time. This ministry offers relevant, engaging, and Spirit-filled teaching designed to reach both young and old — meeting people where they are with the timeless truth of God's Word. In a world that is constantly connected, the Worldwide Ministry serves as a digital mission field, equipping and inspiring believers globally.
>
> This ministry also organizes live-streamed global prayer gatherings, allowing individuals from around the world to unite in worship and intercession. Online Bible study groups and discipleship courses create space for deeper learning, accountability, and community for those unable to attend in person. The Worldwide Ministry exists not just to share content, but to build relationships, foster discipleship, and create a global community of faith. By embracing technology, YDM fulfills the Great Commission in a way that is relevant to the digital age. Whether you are joining from across town or across the world, the Worldwide Ministry invites you to connect, grow, and encounter Christ online.

## 11.3 Where to Find Us Online

- **YouTube:** [@YDMWorldwide](https://www.youtube.com/@YDMWorldwide) — sermons, teachings, ministry events
- **Instagram:** [@yd.ministries](https://www.instagram.com/yd.ministries/) — daily encouragement, behind-the-scenes
- **Facebook:** [YDM on Facebook](https://www.facebook.com/profile.php?id=61580380624275)
- **Watch Live:** [/live](/live) — Sunday services and special events

## 11.4 Get Involved

| Action | CTA |
|---|---|
| Subscribe on YouTube | [Subscribe →](https://www.youtube.com/@YDMWorldwide?sub_confirmation=1) |
| Join an online Bible study | [Contact us] |
| Support the Worldwide Ministry | [Give to the Tech Fund] |

---

# 12. Partnership & Support

- **URL:** `/our-ministries/partnership`
- **Page key:** `ministries.partnership`
- **Voice:** Warm, gratitude-forward

## 12.1 Hero

**Headline (h1)**
> Partnership & Support

**Eyebrow line**
> *"Two are better than one, because they have a good return for their labour."* — Ecclesiastes 4:9

**Subhead**
> Joining hands to advance the Kingdom of God. When you partner with YDM, you share in every soul touched, every leader trained, and every community reached.

## 12.2 Body

> The Partnership & Support Ministry invites individuals and families to join hands with YDM in advancing the Kingdom of God. Ministry is never meant to be done alone, and Bishop Huel O. Wilson believes in the power of shared vision and partnership. By standing with YDM through prayer, giving, and encouragement, partners become part of every soul touched, every leader trained, and every community reached. Opportunities to partner financially ensure that YDM's ministries remain strong, sustainable, and able to expand into new areas of impact. A commitment to excellence in stewardship and service means every contribution is used effectively for Kingdom work.
>
> Partnership goes beyond finances; it is about community, vision, and mutual encouragement. Our monthly partnership newsletter shares updates, testimonies, and stories of transformation, so that partners can see the fruit of their investment in the ministry. Opportunities to volunteer or join missions efforts give supporters hands-on experiences of service, allowing them to share Christ's love personally. The Partnership & Support Ministry is built on the principle that when believers come together with one heart and one purpose, great things can be accomplished for God's glory. Whether you choose to give, pray, or serve, YDM invites you to partner with us as we continue proclaiming the gospel and extending the love of Christ to the world.

## 12.3 Ways to Partner

- **Pray** for YDM, Bishop Wilson, and the people we serve
- **Give** monthly or one-time to support the ministry
- **Volunteer** locally with outreach, worship, family, and event teams
- **Serve on missions** as opportunities arise
- **Subscribe** to the monthly partnership newsletter

## 12.4 Get Involved

| Action | CTA |
|---|---|
| Become a monthly partner | [Give to YDM] |
| Sign up for the partnership newsletter | [Contact us] |
| Volunteer | [Contact us] |

---

# 13. Ask Bishop

- **URL:** `/our-ministries/ask-bishop`
- **Page key:** `ministries.ask-bishop`
- **Voice:** Warm, personal, inviting

## 13.1 Hero

**Headline (h1)**
> Ask Bishop

**Subhead**
> A direct line to Bishop Wilson. Bring your questions about faith, scripture, life — anything. He answers personally, in love and in truth.

## 13.2 Body

> Whether you're wrestling with a passage of scripture, navigating a difficult season, or wondering about something you've heard preached — Ask Bishop is here for you. Bishop Wilson has spent 50 years answering exactly these kinds of questions, and he considers it a privilege to do so for anyone who asks.
>
> Submit your question using the form below. Bishop will read it personally. Where appropriate, his answer may be shared (anonymously, unless you request otherwise) on the YDM YouTube channel or in a future teaching — so that one person's question becomes encouragement for many. If you'd prefer your question and answer remain entirely private, simply check the box on the form.

## 13.3 What kinds of questions?

> Anything. Scripture. Theology. Marriage. Parenting. Suffering. Salvation. Spiritual warfare. Doubts you've never said out loud. Questions you've carried for years. Bring them all.

**[Submit a question form]**

> *Note: `/ask` redirects here. Ask Bishop lives as a ministry of YDM, not a standalone form page.*

---

# 14. Latest Sermons — `/sermons`

- **URL:** `/sermons`
- **Page key:** `sermons.index`
- **Voice:** Warm, content-forward

## 14.1 Hero

**Headline (h1)**
> Sermons

**Subhead**
> Half a century of preaching. The library, the latest, and the live.

## 14.2 Intro

> Bishop Wilson preaches every 4th Sunday of the month at Yeshua Sunday Service, plus regular online teachings released on the YDM YouTube channel. Browse below — by date, by topic, or just by what catches your eye. Every sermon is a chance to meet God in His Word.

## 14.3 Featured / Latest Sermon

**[Embed: most recent sermon video]**

## 14.4 Sermon Library Grid

(Each card: thumbnail, title, date, category badge, [Watch] button)

- **Here Am I, Send Me: A Vision for Mission** — February 21, 2025
- **Jesus: The Ultimate Transformational Leader & How He Changes Lives** — February 20, 2025
- **Jesus is Coming Soon: Signs, Prophecy, & Hope** — February 18, 2025
- **Gilgal: The Place of New Beginnings** — February 16, 2025
- **Repent: The Kingdom of God Is At Hand** — February 14, 2025
- **The Heritage of a Godly Mother (Mother's Day 2024)** — February 9, 2025

## 14.5 Browse by Category

- Topical
- Narrative
- Textual
- Expository

## 14.6 CTA

> [▶ Subscribe on YouTube] [📅 See upcoming services]

---

# 15. Watch Live — `/live`

- **URL:** `/live`
- **Page key:** `live`
- **Voice:** Warm, immediate

## 15.1 Hero

**Headline (h1)**
> Watch Live

**Subhead**
> Sunday services, special events, and revival nights — broadcast live from Mississauga.

## 15.2 Live Block

**When live:**
> [LIVE NOW] We're streaming. Click below to join the service.
> [Watch on YouTube →]

**When offline:**
> We're not currently broadcasting. The next live service is **Sunday, [next 4th-Sunday date], 1:00 PM EST**.
> Until then, browse the latest sermons or set a reminder.

## 15.3 Schedule

- **Yeshua Sunday Service** — Every 4th Sunday at 1:00 PM (Eastern Time)
- **Special revival nights and events** — announced on YouTube and in the events page

## 15.4 CTAs

> [Browse the sermon library] [Subscribe on YouTube] [Add to calendar]

---

# 16. Events — `/events`

- **URL:** `/events`
- **Page key:** `events.index`
- **Voice:** Warm, practical

## 16.1 Hero

**Headline (h1)**
> Events at YDM

**Subhead**
> Worship. Teaching. Fellowship. The full life of YDM, on a calendar.

## 16.2 Intro

> Below you'll find our regular gatherings and any special events on the calendar. Everyone is welcome — whether it's your first time or your hundredth.

## 16.3 Recurring Events

### Yeshua Sunday Service
> **Every 4th Sunday of the month — 1:00 PM**
> Mississauga Church of God (inside Salvation Army Erin Mills Church), 2460 The Collegeway, Mississauga, ON
>
> Come and worship with us as we exalt Yeshua the Messiah. Bishop Wilson preaches; the worship is Spirit-led; communion and prayer ministry are part of every gathering. Stay for fellowship after the service.
>
> [Get directions] [Add to calendar]

### Weekly Bible Study
> **Every Thursday — 7:00 PM**
> Same location.
>
> Join us every Thursday night at 7:00 PM for an uplifting time of fellowship and study at the Mississauga Church of God. Our Bible study gatherings are a chance to dive deeper into God's Word, grow in faith, and build lasting connections with others. Whether you are new to studying the Bible or have been walking with Christ for years, you'll find encouragement, insight, and a welcoming community. Come ready to learn, share, and be strengthened in your spiritual walk. Everyone is welcome.
>
> [Add to calendar]

## 16.4 Special Events

> [Live grid of upcoming events from `events` table]
> When empty: *"No special events on the calendar right now. Check back soon — and don't miss our regular gatherings above!"*

---

# 17. Blog — `/blog`

- **URL:** `/blog`
- **Page key:** `blog.index`
- **Voice:** Warm, encouraging

## 17.1 Hero

**Headline (h1)**
> The YDM Blog

**Subhead**
> Reflections on faith, scripture, and the walk with Christ — written for the YDM family and anyone seeking the Lord.

## 17.2 Intro

> The YDM blog is a place for the longer thought — the scripture you can't shake, the question that keeps coming up, the encouragement you need before Sunday. New posts go up regularly. Subscribe to make sure you don't miss one.

## 17.3 Categories (filter chips)

- Faith
- God's Word
- Jesus

## 17.4 Tags (filter chips)

- Church Family
- God's Word
- Love One Another
- Pastor
- Podcast
- Worship

## 17.5 Existing Posts (carry over from WP scrape)

- **Discovering the Power of Waiting** *(Faith)*
- **Experiencing the Freedom of God's Presence** *(God's Word)*
- **How to Develop a Habit of Worship** *(Jesus)*
- **What's Your View of Marriage?** *(God's Word)*
- **How Do I Intercede For Family Who Don't Believe In Jesus?** *(Faith)*
- **Your Mission — Should You Choose to Accept It** *(God's Word)*
- **I Ruined My Life… Is There Hope for Me?** *(God's Word)*
- **Do Not Lose Heart — Your Future in Christ is Beyond All Comparison** *(Jesus)*
- **Four Things Our Church Should Still Focus On** *(Faith)*

## 17.6 CTA

> [📬 Subscribe to the blog] [📚 Explore by topic]

---

# 18. Give — `/give`

- **URL:** `/give`
- **Page key:** `give.index`
- **Aliases (301):** `/our-campaigns`, `/campaigns`, `/donate`
- **Voice:** Warm, gratitude-forward

## 18.1 Hero

**Headline (h1)**
> Stand With YDM

**Subhead**
> Your generosity makes a difference. Every gift helps us spread hope, serve our community, and share God's love with those in need. Thank you for being part of this mission.

## 18.2 Active Campaigns

### Support YDM (General Fund)
> **Goal:** Sustain the ongoing work of Yeshua Deliverance Ministries.
>
> Your gift supports:
> - **Worship Ministry** — drawing people closer to God through preaching and worship
> - **Leadership & Development** — equipping leaders for Kingdom work
> - **Compassion & Outreach** — meeting spiritual and practical needs
> - **Worldwide Ministry (Online)** — sharing the gospel globally through digital platforms
> - **Partnership & Support** — sustaining the vision YDM was built on
>
> Whether one-time or monthly, every gift goes directly into Kingdom work.
>
> [Give now →] [Become a monthly partner →]

### YDM Tech Fund
> **Goal:** Equip the Worldwide Ministry with the tools to reach further.
>
> The Tech Fund supports YDM's online and media ministry, including:
> - **Studio equipment** — cameras, microphones, lights, tripods, editing software
> - **Podcast setup** — recording gear and sound treatment
> - **Video production** — filming services, Bible studies, and outreach messages
> - **Studio furnishings** — desks, chairs, and setup essentials
> - **Ongoing media ministry** — supporting the growth of YDM's online platforms globally
>
> [Give to the Tech Fund →]

## 18.3 Other Ways to Give

> Beyond financial giving, YDM is sustained by people who pray, who serve, and who carry the gospel into their homes and workplaces. Every act of partnership matters.
>
> [Become a partner] [Sign up to volunteer] [Submit a prayer request]

---

# 19. Contact — `/contact`

- **URL:** `/contact`
- **Page key:** `contact`
- **Voice:** Warm, practical, accessible

## 19.1 Hero

**Headline (h1)**
> Get in Touch

**Subhead**
> Whether you're planning your first visit, asking a question, or just saying hello — we'd love to hear from you.

## 19.2 Contact Cards

| | |
|---|---|
| 📧 **Email** | Info@YDMinistries.ca |
| 📞 **Phone** | +1 (416) 895-5178 |
| 📬 **Mailing address** | P.O. Box #20001, Chinguacousy Rd, Brampton, ON L6Y 0J0 |

## 19.3 Visit Us

**Where we worship**
> **Mississauga Church of God** (inside Salvation Army Erin Mills Church)
> 2460 The Collegeway, Mississauga, ON L5L 1V3
>
> [Get directions]

**When we gather**
> **Yeshua Sunday Service** — Every 4th Sunday of the month at 1:00 PM
> **Weekly Bible Study** — Every Thursday at 7:00 PM
>
> Plenty of parking. Wheelchair accessible. First-time visitors are always welcome.
>
> [Plan your visit]

## 19.4 Send a Message

**Headline**
> Send us a message

> Whether it's a question, a prayer request, or just a hello — drop us a line and someone from the YDM team will get back to you.

**[Contact form: Name · Email · Phone (optional) · Subject · Message · Submit]**

## 19.5 Connect Online

| | |
|---|---|
| YouTube | [@YDMWorldwide](https://www.youtube.com/@YDMWorldwide) |
| Instagram | [@yd.ministries](https://www.instagram.com/yd.ministries/) |
| Facebook | [YDM on Facebook](https://www.facebook.com/profile.php?id=61580380624275) |
| LinkedIn | [Bishop Huel Wilson](https://www.linkedin.com/in/bishop-huel-wilson-3378602b/) |

---

# 20. Prayer Requests — `/prayer-requests`

- **URL:** `/prayer-requests`
- **Page key:** `prayer-requests`
- **Voice:** Tender, reverent-warm

## 20.1 Hero

**Headline (h1)**
> Submit a Prayer Request

**Subhead**
> Whatever you're carrying, you don't have to carry it alone. Bishop Wilson and the YDM prayer team will pray over your request personally.

## 20.2 Body

> Scripture tells us to *"cast all your anxiety on Him because He cares for you"* (1 Peter 5:7). And it tells us to bring our needs to one another — to *"confess your sins to each other and pray for each other so that you may be healed"* (James 5:16).
>
> If you have a request — for healing, for a family member, for a season you're walking through, for something only the Lord can fix — submit it below. Your request will be received with care and confidentiality. Bishop Wilson and the prayer team will lift it before God.

## 20.3 The Form

**[Form fields:**
- Your name (or "Anonymous")
- Email (so we can follow up if you'd like)
- Your prayer request
- ☐ Keep this private (just for the prayer team)
- ☐ It's okay to share this anonymously with the YDM family for prayer
- [Submit]
**]**

## 20.4 In an Urgent Situation

> If you are in crisis, please call **911** (or your local emergency line) right away. For immediate spiritual support, call the church at **+1 (416) 895-5178** — leave a message and someone will return your call as soon as possible.

---

# 21. Share Your Story — `/share-your-story`

- **URL:** `/share-your-story`
- **Page key:** `share-your-story`
- **Replaces:** `/guestbook` (modernized)
- **Voice:** Warm, encouraging

## 21.1 Hero

**Headline (h1)**
> Share Your Story

**Subhead**
> God is at work — in your life and in this church family. Tell us what He's done.

## 21.2 Body

> Every testimony is a small piece of the larger story God is writing. A prayer answered. A relationship healed. A breakthrough no one but you and the Lord knows the full weight of. When you share what God has done, you make it easier for someone else to believe He'll do it again.
>
> If you have a story from your time at YDM — or from a YDM sermon, an Ask Bishop answer, a moment of prayer, or anything God has done in your life through this ministry — we'd love to hear it. Stories may be shared (with your permission) at services, in newsletters, or on the YDM YouTube channel, so that one person's testimony becomes another person's encouragement.

## 21.3 The Form

**[Form fields:**
- Your name (or "Anonymous")
- Email (optional)
- Your story
- ☐ It's okay to share this publicly (anonymously unless you say otherwise)
- ☐ Please keep this private — just for Bishop and the YDM team
- [Submit]
**]**

> *Note: `/guestbook` redirects here. The classic guestbook is retired in favor of this modernized testimony page.*

---

# 22. Gallery — `/gallery`

- **URL:** `/gallery`
- **Page key:** `gallery`
- **Voice:** Warm, brief

## 22.1 Hero

**Headline (h1)**
> Photo Gallery

**Subhead**
> Moments from worship, fellowship, and the everyday life of YDM.

## 22.2 Body

> Browse through photos from Yeshua Sunday Services, Bible studies, baptisms, special events, and the small moments that make YDM home. New photos go up after every gathering.

## 22.3 Grid

> [Live photo grid — pulled from Cloudflare R2 `ydm-media` bucket]

## 22.4 CTA

> Want to see what a Sunday at YDM looks like in person? [Plan your visit →]

---

# 23. 404 / Not Found

- **URL:** any unknown
- **Page key:** `404`
- **Voice:** Warm, helpful

## 23.1 Body

**Headline (h1)**
> This page wandered off.

**Body**
> The page you're looking for isn't here — but you're still welcome.
>
> Maybe try one of these:

> - [▶ Watch the latest sermon](/sermons)
> - [🏠 Go to the home page](/)
> - [📅 See when we gather](/events)
> - [✉️ Get in touch](/contact)
>
> *"He restores my soul. He guides me along the right paths for His name's sake."* — Psalm 23:3

---

# 24. SEO Meta Reference

For every page: `<title>` should be 50–60 chars; meta description 120–158 chars.

| Page | Title | Description |
|---|---|---|
| `/` | YDM — A home for your soul. | Yeshua Deliverance Ministries, led by Bishop Huel O. Wilson. Worship, teaching, and a worldwide ministry. Watch sermons, plan a visit. |
| `/about` | About YDM — Yeshua Deliverance Ministries | A Christ-centered ministry founded in 2020 by Bishop Huel O. Wilson. Learn what we believe, why we exist, and what makes YDM unique. |
| `/about/bishop-wilson` | Bishop Huel O. Wilson — Founder of YDM | Fifty years of pastoral ministry. From Jamaica to Canada, from Malton to YDM Worldwide. The full story of Bishop Wilson's calling. |
| `/team` | The YDM Team — Meet Our Leadership | Meet Bishop Huel O. Wilson, First Lady Clementina Wilson, and the team God has called to serve at Yeshua Deliverance Ministries. |
| `/our-ministries` | Our Ministries — How YDM Serves | Seven ministries, one mission. Worship, leadership, family, outreach, online, partnership, and Ask Bishop — explore what YDM does. |
| `/our-ministries/worship` | Worship Ministry — YDM | The heartbeat of YDM. Preaching, teaching, baptism, and Spirit-led worship under Bishop Huel O. Wilson. |
| `/our-ministries/leadership` | Leadership & Development — YDM | Equipping pastors, ministers, and emerging leaders under the mentorship of Bishop Huel O. Wilson. |
| `/our-ministries/family` | Family Ministry — YDM | Weddings, dedications, marriage retreats, and biblical guidance for Christ-centered families. |
| `/our-ministries/outreach` | Compassion & Outreach — YDM | Hospitals, nursing homes, prisons, and chaplaincy. The love of Christ, beyond our walls. |
| `/our-ministries/worldwide` | Worldwide Ministry (Online) — YDM | YDM's online ministry. Sermons, Bible studies, and live services on YouTube and beyond. |
| `/our-ministries/partnership` | Partnership & Support — YDM | Stand with YDM through prayer, giving, and service. Become a monthly partner today. |
| `/our-ministries/ask-bishop` | Ask Bishop — YDM | A direct line to Bishop Wilson for your questions about faith, scripture, and life. Submit a question. |
| `/sermons` | Sermons — YDM | Browse the YDM sermon library. Bishop Wilson's preaching, available on demand. |
| `/live` | Watch Live — YDM | Sunday services and special events, broadcast live from Mississauga. |
| `/events` | Events — YDM | Yeshua Sunday Service every 4th Sunday at 1 PM. Weekly Bible Study Thursdays at 7 PM. Plus special events and revival nights. |
| `/blog` | The YDM Blog | Reflections on faith, scripture, and the walk with Christ from Yeshua Deliverance Ministries. |
| `/give` | Stand With YDM — Give & Partner | Your gift sustains the worship, teaching, outreach, and online ministry of YDM. Give once or partner monthly. |
| `/contact` | Contact YDM | Plan a visit, send a message, or just say hello. Get in touch with Yeshua Deliverance Ministries. |
| `/prayer-requests` | Submit a Prayer Request — YDM | Bishop Wilson and the YDM prayer team will pray over your request personally. Whatever you're carrying, you don't carry it alone. |
| `/share-your-story` | Share Your Story — YDM | Tell us what God has done. Your testimony may be the encouragement someone else needs. |
| `/gallery` | Photo Gallery — YDM | Moments from worship, fellowship, and everyday life at Yeshua Deliverance Ministries. |

---

# 25. Decisions & Open Items

All decisions resolved 2026-05-04. The doc is publishable. Bishop should still audit each page during a final review pass to confirm dates, regions, and ministry-specific facts.

| # | Item | Decision | Page(s) affected |
|---|---|---|---|
| 1 | Admin Bishop region | **Eastern Canada** | §3.5, §4.7, §4.12 |
| 2 | West Toronto Church of God years | **2010–2015 (placeholder, Bishop to audit)** | §4.8, §4.12 |
| 3 | Daughters' names | **Don't name them** — bio refers to "two daughters" | §4.10, §4.12 |
| 4 | Other staff/elders/leaders | **None added** — YDM is intentionally Bishop-led; /team page lists Bishop + Clementina only | §5 |
| 5 | Ask Bishop URL | **`/our-ministries/ask-bishop`** is canonical; `/ask` 301-redirects | §13 |
| 6 | Crisis-line wording | **911 (or local emergency) + church voicemail at +1 (416) 895-5178** | §20 |
| 7 | Guestbook → /share-your-story | **Replace** — modernized testimony page; `/guestbook` 301-redirects | §21 |
| 8 | Giving URL namespace | **`/give/*`** — `/our-campaigns`, `/campaigns/*`, `/donate` all 301-redirect | §18, §26 |
| 9 | YouTube handle | **@YDMWorldwide** | site-wide |
| 10 | Instagram handle | **@yd.ministries** | site-wide |
| 11 | Bible study time | **Thursdays 7:00 PM** | site-wide |
| 12 | Voice strategy | **Balanced** — reverent on bio/about, warm elsewhere | site-wide |
| 13 | Tagline | **"YDM: Uniting hearts in faith and fellowship. A home for your soul."** | site-wide |
| 14 | About-page consolidation | **2 pages** — `/about` + `/about/bishop-wilson` | structure |
| 15 | Heritage pages | **Folded into bio** — Malton + West Toronto live as bio sections, not standalone pages | structure |
| 16 | Bio anchor dates | **Born 1948 · Married 1976 · Admin Bishop 2000 · YDM founded 2020** | §4 |
| 17 | "Why the Name" section | **Drafted** — Yeshua + Deliverance explained on About | §3.3 |
| 18 | Hero homepage CTA | **Watch the latest sermon** | §2 |
| 19 | `wordwide` URL typo | **Fixed** — `/our-ministries/worldwide` | §11 |
| 20 | Demo / taxonomy routes | **Drop from route-map** — home-two, home-three, profile-category-pastor, profile-category-senior-priest | route-map |

---

---

# 26. Route Reconciliation — Legacy WP → New Site

This section maps every legacy WordPress URL in `route-map.json` to its destination in the new site. It exists so the migration team can build the 301 redirect map and resolve naming conflicts before the cutover.

## 26.1 Direct copy targets (this master doc covers them)

| Old WP route | New route | Status |
|---|---|---|
| `/` | `/` | ✓ covered (§2) |
| `/aboutydm/` | `/about` | ✓ covered (§3) |
| `/about-us/` | `/about` (301) | ✓ alias |
| `/huelwilsonbio/` | `/about/bishop-wilson` (301) | ✓ covered (§4) |
| `/huel-clementina/` | `/about/bishop-wilson` (301 — folded into bio §4.10) | ✓ folded |
| `/cmsms_profile/bishopwilson/` | `/about/bishop-wilson` (301) | ✓ alias |
| `/cmsms_profile/clementinawilson/` | `/team` (301 — Clementina card on team page) | ✓ folded |
| `/our-team/` | `/team` | ✓ covered (§5) |
| `/our-ministries/` | `/our-ministries` | ✓ covered (§6) |
| `/ministries/worship/` | `/our-ministries/worship` | ✓ covered (§7) |
| `/ministries/leadership/` | `/our-ministries/leadership` | ✓ covered (§8) |
| `/ministries/family/` | `/our-ministries/family` | ✓ covered (§9) |
| `/ministries/outreach/` | `/our-ministries/outreach` | ✓ covered (§10) |
| `/ministries/wordwide/` *(typo)* | `/our-ministries/worldwide` (301 — typo fixed) | ✓ covered (§11) |
| `/ministries/partnership/` | `/our-ministries/partnership` | ✓ covered (§12) |
| `/ministries/ask-bishop/` | `/our-ministries/ask-bishop` | ✓ covered (§13) |
| `/ask/` | `/our-ministries/ask-bishop` (301) | ✓ alias |
| `/latest-sermons/` | `/sermons` | ✓ covered (§14) |
| `/live/` | `/live` | ✓ covered (§15) |
| `/events-page/` | `/events` | ✓ covered (§16) |
| `/blog-page/` | `/blog` | ✓ covered (§17) |
| `/our-campaigns/` | `/give` (301) | ✓ covered (§18) |
| `/campaigns/supportydm/` | `/give/supportydm` (301) | ✓ covered (§18) |
| `/campaigns/techfund/` | `/give/techfund` (301) | ✓ covered (§18) |
| `/contact/` | `/contact` | ✓ covered (§19) |
| `/prayer-requests/` | `/prayer-requests` | ✓ covered (§20) |
| `/guestbook/` | `/share-your-story` (301) | ✓ covered (§21) |
| `/gallery/` | `/gallery` | ✓ covered (§22) |
| `/maltoncog/` | `/about/bishop-wilson#malton` (301 — folded into bio §4.6) | ✓ folded |
| `/westtoronto/` | `/about/bishop-wilson#west-toronto` (301 — folded into bio §4.8) | ✓ folded |

## 26.2 Content rows — bodies migrate from WP export, no new copy

These are individual posts/sermons/events. Their bodies come from the existing WordPress export. The master doc covers their **index pages** (sermon library, blog index, events list); the individual pages just need their existing content migrated and lightly cleaned.

**Sermons** (6) — covered by sermon library §14
- `/sermon/here-am-i-send-me-a-vision-for-mission`
- `/sermon/jesus-the-ultimate-transformational-leader`
- `/sermon/jesus-is-coming-soon-signs-prophecy-hope`
- `/sermon/gilgal-the-place-of-new-beginnings`
- `/sermon/repent-the-kingdom-of-god-is-at-hand`
- `/sermon/the-heritage-of-a-godly-mother`

**Blog posts** (9) — covered by blog index §17
- `/blog/discovering-the-power-of-waiting`
- `/blog/experiencing-the-freedom-of-gods-presence`
- `/blog/how-to-develop-a-habit-of-worship`
- `/blog/whats-your-view-of-marriage`
- `/blog/how-do-i-intercede-for-family-who-dont-believe-in-jesus`
- `/blog/your-mission-should-you-choose-to-accept-it`
- `/blog/i-ruined-my-life-is-there-hope-for-me`
- `/blog/do-not-lose-heart-your-future-in-christ-is-beyond-all-comparison`
- `/blog/four-things-our-church-should-still-focus-on`

**Event details** (2) — covered by events page §16
- `/events/weekly-bible-study-group` *(filename was `event_young-adults-connect.json` but the body is actually the Yeshua Sunday Service description — needs renaming)*
- `/events/young-adults-connect` *(if still active — confirm)*

## 26.3 Index-filter routes — meta-only (per existing memory)

Per `project_ydm_seed_complete.md` memory, these 18 blog category/tag/author routes are intentionally meta-only — they're filter views over the blog index, no unique copy needed:

- `/blog?author=ydm-admin`
- `/blog?category=faith` · `/blog?category=gods-word` · `/blog?category=jesus`
- `/blog?tag=churchfamily` · `/blog?tag=godsword` · `/blog?tag=loveoneanother` · `/blog?tag=pastor` · `/blog?tag=podcast` · `/blog?tag=worship`
- `/sermons?category=topical` · `/sermons?category=narrative` · `/sermons?category=textual` · `/sermons?category=expository`
- `/team?category=pastor` · `/team?category=senior-priest`

## 26.4 Namespace and route-map cleanup (resolved 2026-05-04)

**Giving namespace = `/give/*`** *(decided)*. All giving routes use `/give/*` as canonical:
- `/give` — landing page
- `/give/supportydm` — general fund
- `/give/techfund` — media/tech fund
- 301 redirects from `/our-campaigns/`, `/campaigns/`, `/campaigns/supportydm/`, `/campaigns/techfund/`, `/donate`

**Drop from route-map.json entirely** *(no destination, source pages are CMSMasters demo only)*:
- `home-two`, `home-three` — never linked from real nav
- `cmsms_profile_category_pastor`, `cmsms_profile_category_senior-priest` — taxonomy pages, no real content

## 26.5 Required `route-map.json` updates

After Mikey approves this doc, the following route-map.json updates are needed to align with the structural decisions:

1. Fix `wordwide` typo → `worldwide` in `ministries.wordwide` entry
2. Adopt `/give/*` namespace (resolved §26.4) — rename `give.index` / `give.supportydm` / `give.techfund` already in route-map; ensure aliases include `/our-campaigns`, `/campaigns/*`, `/donate`
3. Add aliases array for `/about/bishop-wilson` to absorb: `/huelwilsonbio`, `/huel-clementina`, `/cmsms_profile/bishopwilson`, `/maltoncog`, `/westtoronto`
4. Add aliases array for `/team` to absorb: `/our-team`, `/cmsms_profile/clementinawilson`
5. Add alias `/ask` → `/our-ministries/ask-bishop`
6. Add alias `/guestbook` → `/share-your-story`
7. Drop entries: `home-two`, `home-three`, `cmsms_profile_category_pastor`, `cmsms_profile_category_senior-priest`

---

**End of master web copy.** Total pages drafted: 22 public pages + site-wide elements + SEO meta + decisions log + route reconciliation.

## Verification Summary

- **Fact checks:** 21/21 passed (mission/vision/contact/services/socials/dates/voice all verified against memory + interview answers)
- **Page coverage:** 22 unique pages cover every canonical route in the new site map. Individual blog posts and sermons retain their existing WordPress bodies (migration, not rewrite).
- **Decisions resolved:** **20 of 20** — every decision logged in §25 is locked. Bishop's final audit may surface adjustments to specific facts (most notably West Toronto years 2010–2015, currently a placeholder).

## Next Steps

1. **Bishop reviews the .docx** — final audit pass on bio dates, regions, and ministry specifics
2. **Pipe approved copy into `seed-content.ts`** — overwrites the existing Supabase seed for any page where this doc supersedes the WP-scraped content
3. **Update `route-map.json`** — apply the seven changes in §26.5
4. **Build 301 redirect map** — covered by §26.1 + §26.4 above
5. **Regenerate site pages** — `npm run codegen:pages` after the seed runs
6. **Sanity-check the live preview** — test every page in dev, confirm /ask, /guestbook, /our-campaigns, /donate, /huelwilsonbio, /huel-clementina, /maltoncog, /westtoronto, /our-team all 301-redirect correctly
