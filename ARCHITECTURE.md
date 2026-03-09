# safe174th — Architecture Plan

## Overview

Community advocacy site for NE 174th Street road safety in Clark County, WA.
Hosted on Cloudflare Pages with D1 (SQLite) for dynamic features.

**Domain:** safe174th.com
**Stack:** Static HTML/CSS/JS + Cloudflare Pages Functions + D1

## Audiences

1. **Community** — Neighbors and surrounding communities. Need to understand the problem fast, sign the petition, share their story.
2. **Officials** — City, county, state. Need documented facts, code references, timeline of inaction.
3. **Builders** — Need to see community awareness and organized opposition to shortcuts.

## Site Map

```
/                   Home — hero, stats, map, CTAs (30-second pitch)
/timeline           Full chronological log of events
/facts              Core issues, code references, dev table, escalation
/sign               Petition form + live signature count + the two Asks
/community          Moderated neighbor stories and feedback
/admin              Moderate feedback, view/export signatures (password-protected)
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Hosting | Cloudflare Pages | Free, fast CDN, auto-deploy from git |
| API | Cloudflare Pages Functions (Workers) | Serverless, co-located with site |
| Database | Cloudflare D1 (SQLite) | Free tier, no server, perfect for low-volume |
| DNS/SSL | Cloudflare | Free, automatic HTTPS |
| Source | GitHub repo | Auto-deploy on push to main |

## Pages

### Home (`/`)
- Hero banner with headline + subtitle
- Stats dashboard (6 cards — homes, trips, traffic increase, road width, required width, zero infrastructure)
- Interactive Leaflet map (existing)
- Two CTA buttons: "Sign the Petition" → /sign, "Share Your Story" → /community
- Live signature count badge
- Brief "What We're Asking" summary

### Timeline (`/timeline`)
- Full chronological log (existing content, newest first)
- Each entry: date, title, body, urgency level
- Filterable by year or urgency (optional enhancement)

### Facts (`/facts`)
- Core Issues (6 argument cards)
- Developments table (5 projects + totals)
- Code references (county code citations)
- Escalation path
- Gated community analysis
- The two formal Asks (full text)
- Neighborhood contacts

### Sign (`/sign`)
- The two Asks displayed prominently
- Form: first name, last name, street address, email (optional), checkbox to agree
- Address should be in the NE 174th corridor area (soft validation, not hard block)
- Live count: "X neighbors have signed"
- List of first names + street (no email) of signers (optional, with consent checkbox)
- Success confirmation after signing

### Community (`/community`)
- Moderated feed of neighbor stories
- Submission form: name (optional), story/concern, street (optional), photo upload (future)
- Posts show after admin approval
- Each post: author first name, date, content
- Sort newest first

### Admin (`/admin`)
- Password-protected (simple bearer token or Cloudflare Access)
- View pending feedback submissions → approve / reject
- View all signatures → export CSV
- Dashboard: total signatures, pending feedback count

## API Endpoints (Cloudflare Pages Functions)

```
GET  /api/signatures          → { count, signers: [{ first_name, street }] }
POST /api/signatures          → { first_name, last_name, street, email?, agree }
GET  /api/feedback            → [ { id, name, content, date } ]  (approved only)
POST /api/feedback            → { name?, content, street? }
GET  /api/admin/feedback      → all feedback with status (requires auth)
POST /api/admin/feedback/:id  → { action: "approve" | "reject" } (requires auth)
GET  /api/admin/signatures    → full signature list with emails (requires auth)
```

## D1 Schema

```sql
-- Petition signatures
CREATE TABLE signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    street TEXT NOT NULL,
    email TEXT,
    show_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    ip_hash TEXT
);

-- Community feedback / stories
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    street TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending | approved | rejected
    created_at TEXT DEFAULT (datetime('now')),
    reviewed_at TEXT,
    ip_hash TEXT
);
```

## Directory Structure

```
safe174th/
├── public/
│   ├── index.html              # Home page
│   ├── timeline.html           # Timeline log
│   ├── facts.html              # Detailed facts & code refs
│   ├── sign.html               # Petition page
│   ├── community.html          # Community feedback
│   ├── admin.html              # Admin dashboard
│   ├── css/
│   │   └── style.css           # Shared styles
│   ├── js/
│   │   ├── nav.js              # Shared nav component
│   │   ├── map.js              # Leaflet map (extracted from current)
│   │   ├── signatures.js       # Sign form + count display
│   │   ├── feedback.js         # Feedback form + feed display
│   │   └── admin.js            # Admin dashboard logic
│   └── images/                 # Photos, og-image, etc.
├── functions/
│   └── api/
│       ├── signatures.js       # GET/POST signatures
│       ├── feedback.js         # GET/POST feedback
│       └── admin/
│           ├── feedback.js     # GET/POST admin feedback moderation
│           └── signatures.js   # GET admin signature export
├── schema.sql                  # D1 database schema
├── wrangler.toml               # Cloudflare config
├── package.json                # Project metadata
└── ARCHITECTURE.md             # This file
```

## Deployment

1. Push to GitHub → Cloudflare Pages auto-deploys
2. D1 database created via `wrangler d1 create safe174th`
3. Schema applied via `wrangler d1 execute safe174th --file=schema.sql`
4. Custom domain: `safe174th.com` pointed to Cloudflare Pages
5. Admin auth: Cloudflare Access (email-based) or simple token

## Design Principles

- **Mobile-first** — Most neighbors will visit on their phone
- **Fast** — No frameworks, no build step, vanilla HTML/CSS/JS
- **Accessible** — Semantic HTML, good contrast, screen-reader friendly
- **Credible** — Clean, professional design. Not angry — factual.
- **Shareable** — Good OG tags, each page has a clear purpose
- **Low maintenance** — Static content edited directly, dynamic via D1

## Content Migration

The existing `neighborhood_log.html` (1,289 lines) will be decomposed:
- Header/hero → Home page
- Stats dashboard → Home page
- Map → Home page (JS extracted to map.js)
- Core Issues → Facts page
- Timeline → Timeline page
- Code references → Facts page
- Escalation path → Facts page
- Contacts → Facts page footer
- The two Asks → Sign page

## Future Enhancements

- Photo gallery of road conditions
- Embed county meeting recordings
- Email notification when new timeline entries are posted
- Share-to-social buttons per timeline entry
- Print-friendly petition with signatures for county meetings
