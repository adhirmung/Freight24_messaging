# Handoff: Kredesh — Logistics Messaging OS

## Overview

**Kredesh** is an internal messaging app for a warehouse / freight forwarding company. It's a dispatch console where ops people, brokers, warehouse leads, and drivers talk to each other — and where every inbound message is automatically parsed for **logistics data** (PRO numbers, addresses, time windows, equipment, weights, etc.) and turned into **tasks** that the receiving person can close out.

The product spans:
- **Desktop ops console** (primary) — multi-pane: sidebar nav, inbox list, thread view, AI extraction panel
- **Mobile driver app** (secondary) — same data, redesigned for one-thumb use in the cab
- **Admin dashboard** — only company-internal employees use this product, so a real user-management surface (invites, roles, MFA, audit log) is part of the core experience
- **Auth** — sign-in + invite-acceptance + 2FA, gated by a company SSO

---

## About the Design Files

The files bundled in this handoff are **design references** built as React+JSX HTML prototypes that run directly in a browser via in-browser Babel. They are **not** production code to copy — they:
- Use inline styles and a small handful of global windows-scope components
- Run all routing through `localStorage` and React `useState` (no real backend)
- Use seeded data from `data.js` for every list, table, and chart

Your job is to **recreate these designs in the target codebase's existing environment** (React/Next.js, Vue, SwiftUI, native, whatever) using its established patterns, component library, and state-management approach. If no environment exists yet, choose the framework that best fits the team's roadmap (most likely Next.js + TypeScript + Tailwind for a SaaS like this) and implement there.

---

## Fidelity

This is a **high-fidelity** design package. Colors, typography, spacing, and interactions are all final and intentional. You should:
- Match colors exactly (hex values listed below)
- Match typography (Space Grotesk for UI, JetBrains Mono for IDs/numbers/timestamps, Instrument Serif for the auth-screen display headline)
- Match the visual hierarchy (dark surfaces, hairline borders, accent-blue brand, status-tinted pills)
- Keep the AI-extraction visual language: dashed underlines on inline entities, "chip" pills for extracted fields, a `Spark` icon wherever AI does something

Some seeded data (specific PRO numbers, addresses, customer names) is illustrative — replace with whatever the real data model produces.

---

## Tech notes about the prototype source

The prototype is split across:
- `index.html` — loads fonts (Google Fonts: Space Grotesk + JetBrains Mono + Instrument Serif), `styles.css`, and all JSX files via `<script type="text/babel">`
- `styles.css` — CSS custom properties (the canonical token list — see below)
- `data.js` — vanilla JS attached to `window.KredeshData`; the canonical data shape (users, threads, messages, tasks, shipments, notifications, employees)
- `icons.jsx` — `Icons` object: a stroked-SVG icon set on a 20×20 grid, 1.6px stroke
- `sidebar.jsx` — `Sidebar`, `Avatar`, `TopBar`, `SearchInput`, `Pill`, `Btn` (the shared primitives)
- `screens/auth.jsx` — `AuthScreen` (sign-in, invite-acceptance, MFA)
- `screens/inbox.jsx` — `InboxScreen`, thread-list rows
- `screens/thread.jsx` — `ThreadView`, message rows, extraction panel, voice notes, doc attachments, route mini-map
- `screens/tasks.jsx` — `TasksScreen`, task table, task board, detail panel
- `screens/shipments.jsx` — `ShipmentsScreen`, list, detail with map
- `screens/notifications.jsx` — `NotificationsScreen`
- `screens/reports.jsx` — `ReportsScreen` with KPIs, charts, heatmap
- `screens/settings.jsx` — `SettingsScreen` with 5 sub-tabs
- `screens/admin.jsx` — `AdminScreen` with users / invites / roles / audit; `InviteModal` (3-step)
- `screens/driver.jsx` — `DriverScreen` (iOS-framed mobile preview with Home/Thread/Tasks)
- `app.jsx` — `App` (auth gate, routing, command palette)
- `starters/ios-frame.jsx` — pre-built iOS 26 device frame (status bar, home indicator)

---

## Design Tokens

All tokens live in `styles.css` under `:root` and are referenced via `var(--token)`. Copy these into your design-token system verbatim.

### Colors — surfaces (dark theme)
```
--bg-0:  #070B14   /* canvas — outermost background */
--bg-1:  #0B1220   /* app shell — sidebar, top bars */
--bg-2:  #0F172A   /* cards */
--bg-3:  #131C2F   /* raised — selected rows, hover surfaces */
--bg-4:  #1B2942   /* deep hover (rare) */
--line:    #1E2A44 /* hairline borders */
--line-2:  #243353 /* strong borders, focused inputs */
```

### Colors — text
```
--ink-0: #F4F7FB   /* primary */
--ink-1: #CBD5E1   /* secondary */
--ink-2: #94A3B8   /* tertiary */
--ink-3: #64748B   /* muted */
--ink-4: #475569   /* placeholder / disabled */
```

### Colors — brand & status
```
--brand:      #3B82F6   /* primary action / brand */
--brand-2:    #2563EB
--brand-soft: rgba(59,130,246,0.14)
--cyan:       #22D3EE   /* secondary accent — used for data IDs (PRO numbers), live indicators */
--cyan-soft:  rgba(34,211,238,0.14)
--ok:         #22C55E   /* complete, delivered */
--ok-soft:    rgba(34,197,94,0.14)
--warn:       #F59E0B   /* delayed, attention */
--warn-soft:  rgba(245,158,11,0.16)
--bad:        #EF4444   /* overdue, suspended, alerts */
--bad-soft:   rgba(239,68,68,0.16)
--purple:     #A78BFA
--pink:       #F472B6
```

### Typography
```
--ui:      "Space Grotesk", system-ui, sans-serif
--mono:    "JetBrains Mono", ui-monospace, monospace
--display: "Instrument Serif", serif   /* only used in the auth-screen brand panel headline */
```

**Type scale (px):**
- Brand display (auth panel): `clamp(40, 5.2vw, 60)` / line-height 1.02 / letter-spacing −1.0 / serif
- Page H1 (top bar): 18, weight 600, letter-spacing −0.2
- Section H2: 15–16, weight 600
- Body: 13–14
- Label: 12.5, weight 600
- Caption / "mono" labels: 10–11, mono, uppercase, letter-spacing 0.6, color `--ink-3`
- KPI number: 26, mono, weight 600, letter-spacing −0.5
- Data chip: 11.5, mono, weight 500

**Font usage rules:**
- Any **machine-readable value** (IDs, codes, timestamps, weights, percentages, addresses-in-tables) uses `--mono`
- Section eyebrow labels use mono uppercase
- Everything else uses `--ui`
- The display serif appears **once** — the auth-screen brand panel headline

### Spacing & radii
- Radii: `8` (controls), `10–11` (cards), `14` (large cards / modals), `999` (pills)
- Spacing follows 4/8 — most paddings are `8/10/11/12/14/16/22/24`
- Hairlines are always 1px `var(--line)`. "Stronger" borders use `--line-2`.

### Shadows
The design intentionally avoids drop shadows almost entirely. The only place they're used:
- Logo squircle: `0 0 0 1px rgba(255,255,255,0.06), 0 2px 12px rgba(59,130,246,0.35)`
- Brand panel logo (auth): `0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(59,130,246,0.35)`
- Modal backdrop: `0 30px 80px rgba(0,0,0,0.5)` + `backdrop-filter: blur(4px)` overlay
- Command palette: `0 30px 80px rgba(0,0,0,0.6)` + `backdrop-filter: blur(3px)`

Depth comes from layered background colors (bg-0 → bg-3) and hairline borders, not shadows.

---

## Shared Components

### `Btn` — primary button primitive
Sizes: `sm` (padding 5/10, fs 12) · `md` (padding 8/13, fs 13) · `lg` (padding 11/18, fs 14)
Variants:
- default — `bg-3` / `ink-0` / `line-2`
- `primary` — `brand` / white / `brand`
- `ghost` — transparent / `ink-1`
- `danger` — `bad` / white / `bad`
Optional `icon` prop renders a leading icon. Radius 8.

### `Pill` — status badge
Tones: `neutral` · `blue` · `cyan` · `ok` · `warn` · `bad` · `purple`. Each tone is a soft-bg + branded-fg + 1px branded border. Always pill-shaped (`radius 999`). Used everywhere for statuses, role badges, and inline meta.

### `Avatar` — circular initials avatar
Sizes: 18 / 20 / 26 / 30 / 32 / 36 / 56. Color comes from `user.avatar` (a hex). Status dot (online green / away amber) docks at bottom-right with a 2px shell-colored ring. Initials shown in mono 700.

### `TaskCheckbox` — task-state widget
Three states:
- `complete`: filled `--ok` with a check glyph
- `pending`: hollow circle/square with 1.5px `--ink-3` border
- `incomplete`: hollow with 1.5px `--bad` border + a small filled dot

### `chip` (CSS class) — inline data chip for extracted entities
Mono 11.5px, soft-blue background, 1px translucent blue border, 6px radius, hover darkens. Tinted variants: `.chip.cyan` / `.chip.warn` / `.chip.ok`.

### `.hl` (CSS class) — inline text highlight (extracted entity in message body)
Dashed underline + soft background gradient. Variants: default (blue), `.hl.cyan`, `.hl.warn`. When the field is selected in the right panel, the matching `.hl` gets brightness 1.4 and a 2px blue ring.

### `Icons` — stroked icon set
20×20 viewBox, 1.6px stroke, round caps/joins. Always pass `stroke` color (not fill). Keys used: `inbox`, `tasks`, `truck`, `bell`, `chart`, `gear`, `shield`, `search`, `plus`, `send`, `paper`, `mic`, `smile`, `hash`, `user`, `users`, `check`, `clock`, `warn`, `doc`, `pin`, `pin2`, `filter`, `more`, `link`, `pkg`, `map`, `arrow`, `arrowDown`, `lock`, `mail`, `building`, `spark`, `thermo`, `logout`, `eye`, `copy`, `refresh`, `download`, `qr`, `play`. The `spark` icon is reserved for "AI did this" moments.

### `TopBar`
60px tall, `bg-1`, bottom hairline, padding 14/22. Left: optional `breadcrumb` (mono uppercase 10.5), then H1 + optional subtitle (13 / `ink-2`). Right slot for actions (typically `SearchInput`, filter button, primary button).

### `SearchInput`
6/10 padding, `bg-2`, 1px `line`, radius 8, mono `⌘K` shortcut hint pinned right.

---

## Screens

### 1. Auth (`AuthScreen`)
Two-column. Left: brand panel with logo, live-ops eyebrow, serif headline ("The signal between the warehouse and the road."), description paragraph, and 4-card "Recent activity" live ticker showing PROs and their stages. Right: form area with two pill tabs at top (Sign in / Accept invite), then the form.

- **Sign in form**: Email + password fields (with eye toggle), "Keep me signed in" + "Forgot password?" row, **Continue** primary button (full width), divider with "OR", **Continue with Kredesh SSO** button.
- **Accept invite**: Blue info banner at top stating who invited you / what role. Email (disabled, pre-filled), Full name, Password, Confirm password. Checkbox for handbook/policy agreement. **Create account** primary button.
- **2FA step** (after sign-in submit): 6 large boxed digit inputs (52×60, mono 26px), auto-advancing focus. "Try demo code →" link fills 1-6 for demo purposes.

Form validation errors show in a red `ErrMsg` row above the submit button.

### 2. Inbox (`InboxScreen` + `ThreadView`)
Three-column when wide (≥1200px): **Sidebar** (216w) · **Thread list** (308w) · **Center thread** (flex) · **Extraction panel** (320w, toggleable). At narrower widths the extraction panel hides by default — there's a ✨ icon in the thread header to toggle it.

**Sidebar:**
- Logo squircle (blue→cyan gradient) + "Kredesh / LOGISTICS OS" wordmark
- Org switcher button (building icon + name + tier)
- Primary nav: Inbox (with unread badge), Tasks (pending count), Shipments, Notifications (red badge), Reports
- "Channels" mono heading + list of `#channel` rows (`incidents` has a red dot when there's an active alert)
- Bottom nav: Settings, Admin (admin-only), Mobile (driver) — these are below a flex spacer
- User card at bottom: avatar + name + role + logout icon

**Thread list (middle column):**
- Header with title + filter/new buttons + search input
- Filter tabs row (All / Unread / Carriers / Drivers / Warehouse / Channels) — horizontal scroll, active = `bg-3` chip
- Thread rows: 11/14 padding, 1px bottom border, left-edge 2px brand border when active. Row shows: avatar (26) or # for channel · title (bolder when unread) · timestamp (mono 10.5) · 2-line preview · kind-pill + 2 hashtag chips + unread count pill

**Thread view (center):**
- Header: avatar (36) or # · title + status pill (e.g. "Load active" cyan) · participant role + member count + "Live · last seen just now" with pulsing green dot · right-side icon buttons: link-shipment, pin, **toggle extraction panel** (`spark`), more
- "Today · Tue, May 19" date pill centered
- Messages grouped by sender (no avatar repeat on consecutive messages from same person):
  - 32px avatar column
  - Name + role + timestamp row (only on first of a group)
  - Body with inline `.hl` highlights for extracted entities — click toggles selection sync with the right panel
  - Doc attachments: 32×38 PDF-styled thumbnail with green checkmark badge + filename + meta + download icon
  - Voice notes: 30px play button (brand) + 30-bar waveform (first 8 bars highlighted as "played") + duration + "Auto-transcribed" cyan tag
  - Reactions: small pills below message body; user's own reaction is brand-tinted
- **Inline extraction summary card** after the messages: gradient blue card with `spark` badge, "Kredesh extracted 8 fields and created 3 tasks", and 3 task rows inside
- Typing indicator at bottom: avatar + "Jonas is typing" + 3 pulsing dots
- **Composer**: rounded `bg-2` box. Live extraction preview appears above when typing matches PRO/weight/pallet/time patterns ("Will extract: PRO PRO 778-441920"). Bottom row: attach / voice / link-shipment / emoji / **AI suggest reply** (spark) buttons · `⌘↵` hint · Send button. When the composer is empty, 3 SuggestChips appear below ("POD required on delivery + temp log", etc.) — click to fill composer.

**Extraction panel (right):**
- Header: `spark` icon + "Extracted data" + "re-analyzing..." indicator when animating
- **Linked shipment card**: PRO mono cyan + status pill + mini route SVG (curved path with gradient stroke for completed portion, dashed for remaining, truck icon at current position, dest-pin at end) + ETA / Carrier / Driver row
- **Fields (N)** section: vertical list of `ExtractedField` cards. Each: icon (left) + uppercase mono label + value + copy icon. Clicking highlights both the chip and the in-message `.hl`. Tones (blue/cyan/warn) match the kind.
- **Auto-tasks** section header + "N created" pill + list of compact `SidebarTaskRow` (checkbox + title + initials/due)
- **Confidence** bars: 4 rows (Addresses 98%, PRO/IDs 100%, Time windows 92%, Risk signals 76%) with bar color shifting ok→brand→warn based on threshold
- Footer dashed-border tip: "Anything wrong? Click any field to jump to its source, or request a re-analysis."

### 3. Tasks (`TasksScreen`)
TopBar + 4-card KPI strip (Active load tasks / Completed today / Avg time-to-close / Overdue), then a tab row: **Pending** (brand) / **Complete** (ok) / **Incomplete** (bad) with counts pinned in a same-toned soft pill. Right side has a List / Board view toggle.

**List view**: 7-column table — checkbox (status toggle) · Task title (with optional overdue red sub-text or completed-at sub-text) · "Extracted from" chip · Due (mono, red if overdue) · Assignee (avatar + initials) · Source thread (link icon + thread name) · Priority pill (High bad / Med warn / Low neutral).

**Board view**: grouped by assignee team into vertical lanes (cards inside).

Clicking any row opens the right **Task detail panel** (340w):
- Priority pill + status pill + more menu
- H3 title
- Detail rows: Assignee · Due · Source thread (link → opens the thread) · Extracted entity (chip) · Completed timestamp if any
- **Activity** timeline: small icon-tile + body + mono timestamp. Entries: "Kredesh AI created task", "Assigned to X", "Marked complete", optionally "Task is overdue — escalation suggested"
- **Subtasks** list (3 hardcoded items showing the close-out loop)
- Footer actions: **Mark complete** primary (or **Reopen task** ghost if already done) + **Thread** button that navigates to source

**The core task workflow** the design encodes:
1. Inbound message is analyzed → fields extracted → 1+ tasks auto-created in `pending`
2. Tasks auto-route to the right assignee (usually the recipient of the message)
3. Recipient marks complete → task moves to `complete` tab; the activity log records who/when
4. If due time passes without completion → task is `incomplete` (overdue) and the system suggests escalation/reassignment

### 4. Shipments (`ShipmentsScreen`)
TopBar with wide search + "New shipment" primary. Tabs: Active / Delivered / Quoting.

**Table** (6 columns): PRO (mono cyan) · Route (customer name + Origin → Dest + 200px progress bar underneath + optional warn-pill for alerts like "I-84 closure") · Equipment · ETA · Pallets · Status pill.

**Detail panel** (360w, right):
- PRO mono cyan + customer H3 + Origin → Dest · mi
- **Map panel** (160h): gridded SVG faux-map with route arc (gradient for traveled portion, dashed for remaining), origin/dest pins, current truck position dot, "Live" pill + zoom buttons
- Detail rows: Status · ETA · Equipment · Weight · Pallets · Temp set (when reefer) · Carrier · Driver · Rate
- **Documents** section: list of doc attachments (BOL + Rate Con; POD if delivered) with green-check badges
- **Linked thread** card: opens the thread

### 5. Notifications (`NotificationsScreen`)
TopBar with "Mark all read" button. Tabs: All / Unread / Alerts / Tasks / @Mentions. Centered max-width 920px column.

Each notification row: left 3px colored border (matches kind) + 32px icon-tile (soft-tinted) + title + body (2 lines max) + mono timestamp. Unread rows use `bg-3` + `line-2`; read rows use `bg-2` + `line`. Kinds: alert (red), task (blue), doc (cyan), mention (purple).

### 6. Reports (`ReportsScreen`)
TopBar with 24h / 7d / 30d / QTR segmented range + Export button.

- **4-card KPI strip** with sparklines (On-time delivery / Avg dwell time / Loads in flight / Messages auto-resolved)
- **Extraction quality** panel (left, 1.4fr): horizontal stacked bars per field type (green = high confidence, amber = needs review), each row showing field name + "N% high confidence" mono
- **Task closeout** panel (right, 1fr): per-team avg time bars
- **Daily message volume** bar chart: 7 days × 2 grouped bars (inbound brand / auto-handled cyan)
- **Top carriers (on-time %)**: 5 rows with truck icon + name + load count + horizontal bar + percentage
- **Lanes heatmap**: 7 lanes × 14 days of small `bg = rgba(brand, 0.1 + v*0.85)` cells

### 7. Settings (`SettingsScreen`)
220w left sub-nav (Profile · Notifications · AI extraction · Security & devices · Integrations) + form area.

- **Profile**: name, email (disabled), role (disabled), team, time zone, avatar upload
- **Notifications**: 6 toggle rows + Quiet hours
- **AI extraction**: 4 toggle rows + confidence-threshold range slider (60–99, defaults 84) + "Excluded threads" chip list
- **Security & devices**: MFA status pill + Change password + Active sessions table (3 rows with "This device" pill on the current one)
- **Integrations**: 2-col grid of cards — McLeod TMS, Project44, Samsara, Google Drive, Slack, QuickBooks — each with "Connected" pill or "Connect" button

The reusable patterns here: `FormRow` (220w label/hint column + value column, 14px vertical padding, hairline bottom), `Toggle` (34×20 pill switch, brand bg when on), `TextInput` (full-width, 9/11 padding, `bg-2`, `line-2` border, radius 8).

### 8. Admin (`AdminScreen`)
TopBar with "Admin" breadcrumb + "User management" H1 + Export CSV + **Invite user** primary.

4-card stat strip: Active employees / Pending invites / Suspended / MFA enrolled.

Tabs: **All users** · **Invites** · **Roles & permissions** · **Audit log**.

**All users / Invites table** (8 columns): checkbox · Name (avatar + email mono below — invited users get a dashed-border avatar with no fill) · Role · Team · Last active (mono) · Status pill (Active ok / Invited warn / Suspended bad) · MFA (ok pill with check, or em-dash) · More menu.
- Bulk select toolbar appears when any row checked: "N selected" + Change role / Add to team / **Suspend** (danger).
- Search input + role-filter `<select>` + More filters button above the table.

**Invite modal** (`InviteModal`) — 3-step wizard with progress bar:
1. **Emails + role + team**: textarea for comma/newline-separated emails, live preview chips below, role and team `<select>`s
2. **Permissions**: 5 toggle rows with icon-tiles (Inbox / Tasks / Shipments / Reports / **Admin** — Admin gets a red-tinted icon and warning ring when on). Info card at bottom about MFA enrollment requirement.
3. **Personal note + preview**: textarea for welcome message, then a rendered email-style preview card showing how the invite will look.
Footer: Back / Cancel / Continue or **Send N invites** (with paper-plane icon).

**Roles & permissions tab**: 8×7 matrix table. Rows = permissions (View inbox, Send messages, Create/edit tasks, View shipments, Edit shipment fields, Access reports, Invite & manage users, Edit billing). Columns = roles (Ops, Disp, Brk, WH, Drv, CS, Adm). Cells = green check / em-dash / amber mono code (`self`, `rate`, `dims`) for partial permissions. Legend below explains codes.

**Audit log tab**: append-only log of who did what when (invite, role change, permission change, MFA enrollment, SCIM sync, CSV export). Mono timestamp · who · action description.

### 9. Mobile · Driver (`DriverScreen`)
The desktop view of this screen wraps an `IOSDevice` (392×832 dark) phone frame on the left, with annotation bullets on the right. Three internal views toggled via segmented control in the top bar:

- **Home**: greeting, **Active load card** (gradient blue with PRO, route, ETA, progress bar, Navigate / Call dispatch buttons), **Your tasks** section (3 rows), **Messages** section (unread on top, alert messages in red)
- **Thread**: chat-bubble UI with back button, header avatar/role, embedded shipment chip, message bubbles (driver = brand bg right-aligned, ops = white-translucent left-aligned, AI = cyan-bordered dashed), voice-note bubble, composer with mic button + horizontal scroll of **QuickReply** chips ("On the dock now" / "Need 15 min" / "Detention started" / "POD captured")
- **Tasks**: 3 segmented tabs (pending / complete / incomplete), task cards. Incomplete tab shows the overdue card with red bg + tint + Send now / Reassign buttons

Bottom tab bar (4 tabs: Load · Messages · Tasks · POD) with active in cyan.

The mobile design's principles (per the right-side annotations):
- ≥48px tap targets everywhere
- Voice-first composer (the mic is the primary action, not text)
- One-tap task completion
- POD capture as a top-level tab

---

## Interactions & Behavior

### Routing
The prototype uses a flat `route = { screen, threadId?, shipmentId? }` shape in `useState`, persisted to `localStorage`. Sidebar items setRoute({screen: ...}); thread rows setRoute({screen: 'inbox', threadId: ...}); the command palette and admin invite both invoke setRoute too. In production, swap for the codebase's router (Next.js App Router, React Router, etc.).

### Auth gate
The `App` component checks `localStorage['kredesh-auth']` and renders either `AuthScreen` or the main shell. After successful sign-in (or invite-acceptance, or "Continue with SSO"), it sets the flag and switches. **In production**: this is the entry to your real auth (SSO via Okta/Auth0/etc., or in-house with a refresh-token cookie). The MFA step is mandatory once enrolled.

### Command palette (`⌘K`)
Opens a centered modal with a search input + flat list of all threads / shipments / tasks / nav destinations. Filtered live by query. Up/Down arrows + Enter to navigate, Esc to close.

### Inline extraction sync
- Clicking any `.hl` highlight in a message body **selects** that entity. The matching field in the right panel gets a brand-colored border + bg shift.
- Clicking an `ExtractedField` in the right panel does the inverse — the matching `.hl` in the message gets brightness +40% + a 2px ring.
- The "re-analyzing" indicator (after Send) animates for ~1.2s.

### Composer extraction preview
While typing, the prototype regex-matches PRO numbers, weights, pallet counts, and times, then shows "Will extract: ..." chips in a blue banner above the composer. Production version should hit your NLP service / LLM for real extraction.

### Task completion
Clicking the checkbox toggles status `pending ↔ complete`. The detail panel reflects this immediately; activity log gets a "Marked complete" entry; the source thread's inline summary card updates its check state.

### Invite flow
3-step modal. Each step is independent state; "Back" preserves what you typed. "Send N invites" pushes new rows into the employees list with `status: 'invited'` and `joined: 'Invited just now'`. **In production**: this hits POST `/invitations` with `{emails[], role, team, permissions, message}`; each invitee gets a tokenized link that lands them on the Accept-invite tab of AuthScreen.

### Notifications
Top-of-list newest first. "Mark all read" sets `read: true` on all items. Each kind has its own bg + border tint. Production: subscribe via WebSocket or polling.

### Sign out
Bottom-of-sidebar logout button calls `window.__signOut()` which clears `localStorage['kredesh-auth']` and renders `AuthScreen`. Production: hit `/auth/logout`, clear refresh token cookie.

---

## State Management

In the prototype everything is local `useState`; in production you'll want:

**Server state (TanStack Query / SWR / RTK Query):**
- `useThreads()` / `useThread(id)` — paginated, polling or socket-driven
- `useTasks({status, assignee, source})` — same
- `useShipments({tab})` — same
- `useNotifications()` — socket-driven, optimistic mark-read
- `useEmployees({status, role})` — admin only
- `useExtractedFields(threadId)` — depends on thread query

**Client state (Zustand / Jotai / Context):**
- Current route (better: URL — use the framework's router)
- Composer drafts per thread (persist to localStorage)
- Extraction panel open/closed (persist to localStorage)
- Selected entity in current thread (transient)
- Selected task in tasks screen (transient)
- Command palette open (transient)

**Mutations:**
- `sendMessage(threadId, body)` — optimistic insert with `pending` flag; on settle, server may return extracted entities to merge in
- `markTaskComplete(taskId)` / `reopenTask(taskId)` — optimistic
- `inviteUsers({emails, role, team, permissions, message})` — pushes invited rows
- `updateUserRole(userId, role)` / `suspendUser(userId)` — optimistic with rollback on error

**Real-time:**
The product feels live. Production should have a WebSocket channel per workspace pushing: new messages, message updates (extracted entities arriving), task state changes, shipment updates, and notifications. The "Live · last seen just now" indicator and pulsing dot rely on it.

---

## Responsive behavior

- Desktop ≥ 1200px: all panes visible
- Desktop < 1200px: extraction panel auto-collapses; toggle button in thread header restores it
- Tablet (≤ 900px): the prototype doesn't have a great story here; production should collapse the sidebar to icon-only and stack the thread list above the thread view (or behind a back button)
- Mobile: build a separate mobile shell modeled on the **DriverScreen** patterns (bottom tab bar, chat bubbles, big-button composer). The driver-style is the mobile design language.

---

## Assets

No images or photos are used. Everything is either text, an icon (from `Icons` in `icons.jsx`), or an inline SVG (the route mini-maps, shipment map, bar/heat charts).

The **logo** is a custom inline SVG: a stylized truck silhouette inside a blue→cyan gradient squircle (8px radius). See `BrandHeader` / `Sidebar` for the markup.

If your codebase has a logo asset, replace inline. Otherwise the SVG inline is production-ready — just extract to a `<Logo />` component.

---

## Implementation suggestions

1. **Set up the token system first.** Translate the `:root` block in `styles.css` into your design-token format (Tailwind config, CSS vars, Stitches theme, whatever). Get colors and fonts working before any components.

2. **Build the primitives next** in this order: `Btn`, `Pill`, `Avatar`, `TaskCheckbox`, `Icons`, `TopBar`, `SearchInput`. These compose into everything else.

3. **Build the message-extraction surface third** — it's the spine of the product. The 3-way coupling (inline `.hl` ↔ extraction field card ↔ auto-task card) is the most distinctive interaction, and you'll want to nail it before touching the easier list/table screens.

4. **Wire the real backend** for: extraction (the LLM/NER service that turns message bodies into structured fields), shipments (the TMS integration), and notifications (the WebSocket). The rest is CRUD.

5. **Defer until last**: the reports charts (these are mostly cosmetic in the design — they'll need real data + a chart lib like Recharts/Visx) and the driver mobile app (build it second-phase as a native or PWA companion).

---

## Files

Everything you need is in this folder. Open them in this rough order to build a mental model:

- `data.js` — start here; this is the data shape
- `styles.css` — design tokens
- `icons.jsx` — icon set
- `sidebar.jsx` — primitives
- `screens/thread.jsx` — the centerpiece
- `screens/tasks.jsx` — the second centerpiece
- `screens/admin.jsx` — the third
- everything else fills in around those three
