# Handoff: Kredesh — internal WhatsApp-style messenger for Freight 24

## Overview

**Kredesh** is an internal messaging product for Freight 24's warehouse / freight-forwarding operations. It looks and feels like WhatsApp (the team already lives there) but adds an **AI extraction layer** that pulls structured logistics data out of every conversation — container numbers, vehicle plates, drivers, ETAs, customers, products — and turns that data into:

- **Auto-tasks** with assignees, due times, source links
- **An ETA dashboard** that shows every scheduled arrival / loadout
- **Per-message context** in a side panel: every field extracted from the current chat

It's an internal tool. There is no customer-facing surface. Employees are added by an admin.

The prototype currently scopes to four screens:
1. **Auth** — sign in + sign up
2. **Chats** — chat list + chat view + extraction panel
3. **Tasks** — instruction list, ETA-dashboard style
4. **ETA dashboard** — chronological arrivals/loadouts
5. **Admin** — user management + invite modal

---

## About the Design Files

The files bundled in `source/` are **design references** built as React+JSX HTML prototypes that run in the browser via in-browser Babel. They:

- Use inline styles + CSS variables + a small set of shared primitives (Btn / Pill / Avatar / TaskCheckbox / Rail / Icons)
- Run all "routing" through React `useState` + `localStorage`, no real backend
- Are seeded with realistic-but-fake Freight 24 data in `data.js`

Your job is to **recreate these designs in the target codebase's existing environment** (React/Next.js, Vue, native, etc.) using its established component library and state management. If there's no codebase yet, **Next.js (App Router) + TypeScript + Tailwind + TanStack Query** is the natural fit for this product — chat-style apps benefit from streaming, server components for the lists, and websocket subscriptions for live updates.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, bubble styles, hover behaviors, and the WhatsApp visual language are all intentional. Match them precisely.

The seeded message content is modeled on real WhatsApp screenshots from the Freight 24 ops group ("WHS 24 OPERATIONS") — feel free to keep the structure of those examples (multi-line, "Hi All", "Driver — name / Horse — plate / Trailer 1 — plate / Cell — number / ID — number" patterns) when you build real extraction prompts.

---

## Tech notes about the prototype source

```
index.html             entry point — loads fonts, scripts in order
styles.css             design tokens (CSS vars) + bubble + extraction styles
data.js                window.KredeshData = { users, chats, c1Messages, tasks, employees, etas }
icons.jsx              window.Icons — 20×20 SVG stroke set
shell.jsx              Rail, Avatar, Pill, Btn, TaskCheckbox (shared primitives)
app.jsx                App = auth gate + 4-way route switch
screens/auth.jsx       AuthScreen (sign in + sign up cards)
screens/chats.jsx      ChatsScreen → ChatList + ChatView + ExtractionPanel
                       Includes: MessageBubble, QuotedSnippet, ReplyBar,
                       MessageActions, RemindMenu, ReadInfoPopover,
                       VoiceWaveform, DocAttachment, ExtractBubble
screens/tasks.jsx      TasksScreen — instruction list with ETA-style layout
screens/eta.jsx        EtaScreen — Today timeline + Tomorrow + This week tabs
screens/admin.jsx      AdminScreen + InviteModal
```

Each `<script type="text/babel">` gets its own scope; shared components are attached to `window` at the bottom of each file. In production, use real ES modules instead.

---

## Design Tokens

All in `styles.css` under `:root`. Copy these directly into your token system (Tailwind config, CSS vars, Stitches theme, whatever).

### Colors — surfaces (WhatsApp dark-inspired)
```
--bg-0: #0B141A   /* canvas */
--bg-1: #111B21   /* app shell, chat list, side panels */
--bg-2: #202C33   /* received bubble, header, card surfaces */
--bg-3: #2A3942   /* hover, selected, input wells */
--bg-4: #182229   /* alt surface */
--line:   #222D33 /* hairlines */
--line-2: #2A3942 /* strong borders */
```

### Colors — sent bubble (you)
```
--sent:   #005C4B
--sent-2: #054640
```

### Colors — text
```
--ink-0: #E9EDEF    /* primary */
--ink-1: #D1D7DB    /* secondary */
--ink-2: #AEBAC1    /* tertiary */
--ink-3: #8696A0    /* muted, timestamps */
--ink-4: #54656F    /* placeholder, disabled */
```

### Colors — accents
```
--green:      #00A884   /* primary action / brand */
--green-2:    #06CF9C   /* brighter, used for live dot & extraction accent */
--green-dim:  #008069
--green-soft: rgba(0,168,132,0.16)
--read:       #53BDEB   /* read-receipt blue ticks */
--warn:       #FFB020   /* warnings, "on route", med priority */
--warn-soft:  rgba(255,176,32,0.18)
--bad:        #F15C6D   /* overdue, suspended, alerts */
--bad-soft:   rgba(241,92,109,0.16)
```

### Typography
```
--ui:   "Inter Tight", "Space Grotesk", system-ui, sans-serif
--mono: "JetBrains Mono", ui-monospace, monospace
```

**Type scale:**
- Page H1: 17 / weight 600
- Section H2: 14–15 / weight 600
- Bubble body: 14.2 / line-height 1.42
- Sender name in bubble: 11.5 / weight 600 / colored per-user
- Timestamp (mono): 10.5 in bubble meta, 11 in chat row
- Eyebrow / section label (mono uppercase): 10 / letter-spacing 0.6
- Big due time in tasks/ETA: 16–17 / mono / weight 700 / letter-spacing −0.5
- KPI number: 28 / mono / weight 600

**Rules:**
- Any **machine-readable value** (container codes, vehicle plates, IDs, cell numbers, timestamps, ETA times) uses `var(--mono)`
- Section eyebrows are mono uppercase tracked +0.6 letter-spacing
- Everything else uses `var(--ui)`

### Spacing / radii
- Radii: `7` (buttons, small chips), `8` (bubbles, primary inputs), `10–14` (cards, modals), `999` (pills, avatars)
- Spacing: mostly 8/12/14/16/22 — chat list rows use `10px 16px`; bubble padding is `7px 9px 8px`
- Hairlines always 1px `var(--line)`. Use `var(--line-2)` on raised surfaces and active states.

### Shadows
The design is intentionally flat. Bubbles get a 1px `0 1px 0.5px rgba(11,20,26,0.13)` shadow (matches WhatsApp). Modals use `0 30px 80px rgba(0,0,0,0.5)` + a 4px blur backdrop. Popovers use `0 14px 40px rgba(0,0,0,0.55)`.

---

## Shared Components

### `Rail` — left nav (64px wide)
Vertical strip of icon-only tabs. Items: Chats / Tasks / ETAs / Admin (admin-only). Each tab is a 44×44 button with 22px icon, active state = `bg-3` background + `green-2` icon color. Unread/pending counts appear as a small badge top-right. The Kredesh logo squircle sits at the top, the user avatar at the bottom (clicking signs out in the prototype).

### `Btn`
Sizes: `sm` (5/10, fs 12) · `md` (8/13, fs 13) · `lg` (11/18, fs 14)
Variants: default (bg-3 / ink-0) · `primary` (green / ink-0 dark text) · `ghost` (transparent) · `danger` (bad / white). Radius 8.

### `Pill`
Soft-bg + colored fg + 1px border. Tones: `neutral` · `green` · `warn` · `bad`. Always pill-shaped (999). Used for statuses, role tags, eyebrow live indicators.

### `Avatar`
Sized 18–46px. Initials in mono 700, dark text on a vibrant color (the user's `avatar` hex). Online state = green-2 dot, away = warn dot, both with 2px shell-colored ring.

### `TaskCheckbox`
Three states:
- `complete`: filled green with a dark check
- `pending`: hollow with 1.5px `--ink-3` border
- `incomplete`: hollow with 1.5px `--bad` border + small red dot

### `chip` (CSS class)
Mono 11px, green-soft bg, 1px translucent green border. Used for extracted-entity tags ("PRO 778-441920", "T-442 reefer", "Joeys / CT17549"). Variant: `.chip.warn` for amber.

### `.hl` (CSS class)
Inline text highlight inside message bubbles — dashed bottom border in `green-2`, hover gets a soft green bg. Variant: `.hl.warn` (amber). When the user clicks one, it gets `.active` (filled bg + green ring).

### `Icons`
20×20 stroke icons (1.6px). Always pass `stroke` not fill. Keys used in this prototype: `inbox`, `tasks`, `shield`, `clock`, `search`, `plus`, `send`, `paper`, `mic`, `smile`, `users`, `user`, `check`, `warn`, `doc`, `pin`, `pin2`, `filter`, `more`, `link`, `pkg`, `arrow`, `arrowDown`, `lock`, `mail`, `building`, `spark`, `truck`, `thermo`, `logout`, `eye`, `copy`, `download`, `qr`, `play`, `bell`. `spark` ✨ means "AI did this".

---

## Data shape (see `data.js`)

```ts
type User = {
  id: string; name: string; role: string;
  status: 'online' | 'last seen <when>';
  avatar: string;  // hex
  initials: string;
  isMe?: boolean;
  isAdmin?: boolean;
};

type Chat = {
  id: string;
  kind: 'dm' | 'group';
  with?: string;          // user id, for DMs
  name?: string;          // for groups
  members?: string[];     // user ids, for groups
  preview: string;        // last-message preview
  lastAt: string;         // display string ("11:42" / "Yesterday")
  unread: number;
  pinned?: boolean;
};

type Message = {
  id: string;
  from: string;           // user id ('me' for current user)
  at: string;             // display time
  kind?: 'system' | 'extract';  // optional special bubbles
  text?: string;          // for system bubbles
  segments?: Array<       // for normal messages
    { t: string; hl?: true | 'warn' | 'address' | 'time' | 'location'; entity?: string }
  >;
  attachments?: Array<{ kind: 'doc'; name: string; size: string }>;
  voice?: { dur: string; waveform: number[] };
  status?: 'sent' | 'delivered' | 'read';
  // group-chat read receipts (own messages only)
  readBy?: Array<{ user: string; at: string }>;
  // reply-to-message threading
  replyTo?: string;       // id of message being replied to
  // inline reminders
  reminders?: Array<{ user: string; at: string; label: string }>;
  // for kind: 'extract'
  fields?: number; tasks?: number;
  edited?: boolean;
};

type Task = {
  id: string; title: string; chat: string;
  status: 'pending' | 'complete' | 'incomplete';
  assignee: string;       // user id
  due: string;            // 'Today 14:00' / 'Tomorrow' / 'Wed 10:00' / 'EOD'
  priority: 'low' | 'med' | 'high';
  extractedFrom?: string; // source entity ('PRO 778-441920', 'T-442 reefer')
  overdue?: boolean;
  completedAt?: string;
};

type Eta = {
  id: string;
  kind: 'inbound' | 'outbound' | 'visit';
  what: string;           // 'Joeys Linehaul · SLES'
  detail: string;         // 'Driver Eugene · Horse CT17549 + 2 trailers'
  customer: string; dest: string; vehicle: string;
  at: string;             // '08:45' or 'TBC'
  when: 'today' | 'tomorrow' | 'thursday' | 'friday' | 'fri 9';
  status: 'arrived' | 'enroute' | 'scheduled' | 'delayed';
  chat: string;           // source chat id
  mins?: number;          // signed minutes-from-now; only set for today
};

type Employee = {
  id: string; name: string; email: string; role: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string; joined: string;
};
```

---

## Screens

### 1. Auth (`AuthScreen`)
Single centered card on a radial-green-tinted dark background. Logo squircle (gradient green) + wordmark above the card. Pill-tab segmented control toggles between **Sign in** and **Sign up**. Form fields use the `Field` helper (icon left, optional right action, dark input well). Errors render in a red `ErrMsg` bar. Primary CTA: full-width green button. Mobile: same card, full viewport width minus 20px gutter.

### 2. Chats (`ChatsScreen`)
Three columns when wide (≥1180px): **rail** (64) · **chat list** (360) · **chat view** (flex) · **extraction panel** (340, toggleable). Below ~1180px the extraction panel auto-hides; the ✨ icon in the chat header toggles it.

#### Chat list (left)
- Dark header bar (`bg-2`, padding 12/16) with "Chats" title + new-group / new-chat / more icon buttons
- Search input (`bg-2`, padding 6/12, radius 8) with search icon + placeholder "Search or start new chat"
- 3 pill filters: All · Unread · Groups (active = green-soft bg + green-fg + green border)
- Vertical list of `ChatRow`s:
  - 46px avatar (DM) or grouped-people icon tile (group)
  - Name (14.5 / weight 500) with pin icon if pinned
  - Timestamp right-aligned, mono 11, green-2 when unread
  - Preview line (13 / ink-3, ellipsis)
  - Unread count badge: mono 11 / weight 700 / green bg / dark text / pill

#### Chat view (center)
- Dark header (`bg-2`, padding 10/16) with avatar/group-icon + name + status line + action icons (search · ✨ extraction toggle · more)
- Status line for DMs: "online" + live-dot, or "last seen…". For groups: "N members · Name1, Name2, …"
- Messages container has the **tiled chat background** (very subtle white dots on bg-0)
- Padding: `20px 7%` so bubbles don't crowd the panel edges
- `MessageBubble`s, see below

##### `MessageBubble` (and variants)
- System bubbles (kind: 'system'): centered pill, e.g. "Today"
- Extract bubbles (kind: 'extract'): centered card with green-soft bg, ✨ + "Kredesh extracted N fields · created M tasks" + 3 task previews with checkboxes
- Normal bubbles:
  - Sent (own): green `--sent` bg, right-aligned, top-right corner squared, CSS tail on right
  - Received: `bg-2`, left-aligned, top-left squared, CSS tail on left
  - Sender name (received only, first in group) in user-specific color (`getNameColor(fromId)` — stable hash to 7-color palette)
  - Body: segments with `.hl` highlights (dashed green underline → click to highlight in extraction panel)
  - `white-space: pre-wrap` so line breaks in source messages render
  - Optional quoted reply at top (see `QuotedSnippet`)
  - Optional doc attachment(s)
  - Optional voice waveform
  - Meta line floats right: timestamp + read-ticks (for sent messages). Ticks become a button in group chats — click opens `ReadInfoPopover`.

##### Hover actions on a bubble
- On mouseenter, a small pill toolbar appears beside the bubble (opposite side from the bubble): Reply ↩ · Bell 🔔 · More ⋯
- Reply → sets `replyTo` state in `ChatView`; a `ReplyBar` appears above the composer with the quoted snippet + ✕ to clear
- Bell → opens `RemindMenu` (dropdown below bubble) with preset options: "In 15 min" · "In 1 hour" · "In 4 hours" · "Tomorrow 08:00" · "1h before ETA". Picking one adds a `reminder` to local state; rendered as a small amber bell-pill beneath the bubble.

##### `ReadInfoPopover`
Anchored under your own sent message in a group chat (click on the read-ticks). Shows: "Message info" eyebrow, "N of M read" headline, then a list of group members with avatar + name + "Read · {time}" or "Delivered" + a ticks icon.

##### Composer
- Reply preview bar (if replying)
- Live extraction preview banner (if composer text matches PRO/container/cell/ETA patterns)
- Smile · Attach · Textarea (`bg-3`) · Voice (when empty) / Send (when text) — round 38px button on the right
- Enter sends, Shift+Enter newlines

#### Extraction panel (right)
- Header (`bg-2`, padding 14/16): ✨ + "Extracted data"
- "N fields" section: vertical list of `ExtractedField` cards. Each card: icon + uppercase mono label + value (12.5, may wrap) + copy icon. Tones (green or warn) per field.
- "Auto-tasks" section: list of `SidebarTaskRow`s — checkbox + title + initials/due. Click jumps to Tasks tab.
- Footer dashed-border tip card explaining the panel.

In the prototype, this panel is only populated when viewing the c1 (WHS 24 OPERATIONS) chat. In production, populate from real extraction for every chat.

### 3. Tasks (`TasksScreen`) — **ETA-dashboard-style instruction list**
Full-width (no detail panel). The redesign explicitly mirrors the ETA dashboard so the team reads tasks as direct instructions, not as a project-management board.

- Dark top bar (`bg-2`, padding 12/22): "Tasks" title + green live pill "Auto-extracted" + subtitle ("N total · N overdue") + search input on the right
- 4 underline-tab row: **Today** · **Upcoming** · **Overdue** · **Done**, each with a mono count. Active tab gets a 2px green-2 (or `bad` for Overdue) underline.
- Today view adds 3 mini-stat cards: High priority · Assigned to me · Overdue (mono 28 numeral, colored per-tone)
- Then a single card wrapping the list of `InstructionRow`s:
  - **Grid**: `90px 28px 1fr 130px 116px 40px` (when · checkbox · instruction · assignee · open-chat button · more)
  - Big mono 16 due time (e.g. `14:00`, `EOD`, `TBC`); turns red if `overdue`
  - Sub-label below it (e.g. "today", "tomorrow", "wed", "overdue") — suppressed when it would duplicate the main when
  - `TaskCheckbox` — one tap to complete
  - Instruction: bold 14 title (strikethrough + ink-3 when complete). Below: ✨ "from <chip>" showing the extracted source, plus a green completion timestamp if done.
  - Assignee: 26px avatar + "You" / first name + priority label (mono 10, color per priority)
  - **Open chat** button (`whiteSpace: nowrap`) jumps to the source conversation
  - More button (transparent)
  - Whole row fades to 62% opacity when complete

Empty state: centered ✓ icon + "Nothing in this lane."

### 4. ETA dashboard (`EtaScreen`)
- Dark top bar (`bg-2`): "ETA dashboard" + green live pill + subtitle + search
- 3 underline tabs: **Today** · **Tomorrow** · **This week** (with counts)
- Today view: 3 mini-stat cards (Arrived · On route · Scheduled), then a single card with a chronological list of `EtaRow`s sorted by `mins`. A **`NowLine`** is inserted at the first row whose `mins >= 0`: dashed green-2 borders top/bottom, soft green tint, live-dot + mono "NOW · {time}". If all rows are in the past, an end-of-day "done for the day" muted variant renders at the bottom.
- Tomorrow / This week views: grouped by `when` label, each group has a mono eyebrow ("Tomorrow · 4") + a card of rows.

##### `EtaRow`
- **Grid**: `72px 1fr 130px 110px 40px` (time · what + meta · status pill · chat button · more)
- Big mono 17 time (e.g. `08:45`, `TBC`) + relative label below in the status color (`45m ago` · `Now` · `in 12m` · `in 1h 12m`)
- Kind eyebrow (mono 10, colored per kind): `↓ Inbound` (green-2) · `↑ Outbound` (#7CC4FF) · `◆ Visit` (#C4B5FD)
- "What" headline (14 / weight 600)
- Meta row: `Customer X` · `To Y` · `Vehicle Z` (separated by gaps, vehicle in mono)
- Italic detail line (11.5 / ink-3): e.g. "Driver Eugene · Horse CT17549 + 2 trailers"
- Status pill (right-aligned): Arrived (green) · On route (warn) · Scheduled (neutral) · Delayed (bad)
- Chat button: jumps to source conversation

### 5. Admin (`AdminScreen`)
- Dark top bar with "Admin" breadcrumb (mono uppercase 10.5) + "User management" H1 + primary **Invite user** button
- 3 stat cards: Active · Pending invites · Suspended
- Filter chips: All · Invites · Suspended, each with a count
- Search input
- Users table — 5 columns: Name (avatar + email mono) · Role · Last active (mono) · Status pill (Active/Invited/Suspended) · More menu
  - Invited users get a dashed-border avatar instead of a filled one
- **InviteModal**: centered modal with backdrop blur. Header: mail-icon tile + "Invite a teammate". Body: emails textarea (mono, comma/newline-separated), live chip preview, role `<select>`. Footer: Cancel + **Send N invites** primary.

---

## Interactions & Behavior

### Routing
Flat `route = { screen, chatId?, taskId?, ... }` in `useState`, persisted to `localStorage` so reloads keep position. Sidebar rail setRoute({screen}); chat rows setRoute({screen:'chats', chatId}); extracted-task cards and the ETA "Open chat" button setRoute({screen:'chats', chatId: t.chat}) to jump. **In production**: use your framework's router (Next.js App Router, React Router) and put chatId / taskId in the URL path.

### Auth gate
The `App` component checks `localStorage['kredesh-auth']` and renders either `AuthScreen` or the main shell. Successful sign-in flips the flag. **In production**: this is the entry to your real auth (SSO via Google Workspace / Microsoft 365 is the natural pick for an internal tool).

### Inline extraction sync
- Click any `.hl` highlight in a message → that entity gets "active" styling + the matching `ExtractedField` in the right panel gets a green border
- Click an `ExtractedField` in the panel → does the inverse (re-renders message with `.active` on the right `.hl`)
- A short "re-analyzing" indicator runs after the user sends a new message (`extractAnimating` flag, ~1.2s)

### Composer extraction preview
Regex scan as you type. Currently recognizes:
- Container: `^\b[A-Z]{4}\d{6,7}\b$` (ISO 6346 ish — FSCU8065100)
- SA vehicle plates: `\b(CT|GP|ZN|NP|EC|FS|WC|NW|LP)\d{4,6}\b`
- ETA: `\b\d{1,2}h\d{2}\b` (08h45)
- Container size: `\b(20|40)\s*ft\b|\b\d{1,2}\s*m\b`
- ISO doc: `\bISO\d{4,6}\b`
- 13-digit ID
- SA cell (`0\d{9}`)

In production, replace with a server-side NER/LLM call (Anthropic Claude with a system prompt covering Freight 24's domain entities is the natural pick — see "Suggested extraction prompts" below).

### Reply-to-message threading
- Hover bubble → toolbar shows. Click reply ↩ icon. State.replyTo = msg.id.
- `ReplyBar` renders above the composer with a colored stripe + sender name + preview text + ✕
- On send, the message persists with `replyTo: m.id`
- Rendered messages with `replyTo` show a `QuotedSnippet` at the top of the bubble — colored 3px stripe (matches the original sender's name color) + sender name + preview (line-clamped 1 row, ellipsis)
- Click on the quoted snippet should scroll to original (not implemented in prototype — wire this up in production)

### Per-recipient read receipts (group chats)
- Own messages in groups can carry `readBy: [{ user, at }]`
- The double-tick in the meta line is a button (group only). Click → `ReadInfoPopover` opens beneath the bubble.
- Popover lists every member except self, shows avatar / name / "Read · <time>" or "Delivered" / tick icon (blue if read). Header shows "N of M read".
- Click outside the popover to dismiss (handled via a window-scoped event listener).

### Inline reminders
- Hover bubble → bell icon. Click → `RemindMenu` dropdown opens beneath the bubble.
- Presets: "In 15 min" · "In 1 hour" · "In 4 hours" · "Tomorrow 08:00" · "1h before ETA"
- Pick one → reminder stored locally per-message in `localReminders` state. Renders as a small amber bell-pill (warn-soft bg, ▲ FCD68A text) beneath the bubble.
- **In production**: schedule a server-side notification job tied to the user; surface upcoming reminders in a top-right notification tray + push to mobile/desktop.

### Task completion
Click the `TaskCheckbox` → status toggles `pending ↔ complete`. Completed tasks fade to 62% opacity, get a strikethrough + green "✓ <time>" inline. Production wires this to `markTaskComplete(taskId)` mutation.

### Invite flow
Modal collects emails (comma/newline) + role. Each email becomes a `chip`. Send pushes new rows into the employees list with `status: 'invited'`. Production: POST `/invitations` returning a tokenized link per invitee that lands them on the Sign-up tab of AuthScreen (with email pre-filled).

### Sign out
Bottom-of-rail avatar button calls `window.__signOut()` which clears `localStorage['kredesh-auth']` and renders AuthScreen.

---

## State Management

In the prototype: local `useState`. In production:

**Server state (TanStack Query / SWR / RTK Query):**
- `useChats()` / `useChat(id)` / `useMessages(chatId)` — paginated, websocket-driven for live updates
- `useTasks({status, assignee, search})` — same
- `useEtas({when})` — derived from extraction; server-computed
- `useEmployees({status})` — admin only

**Client state (Zustand / Jotai / Context):**
- Current route (better: URL — use framework router)
- Per-chat composer drafts (persist to localStorage so reloads don't lose typing)
- Per-chat `replyTo` (transient, but persist for the current session)
- Extraction panel open/closed (persist to localStorage)
- Highlighted entity in current chat (transient)
- Open popover (info/remind) anchor (transient)

**Mutations:**
- `sendMessage(chatId, { body, replyTo? })` — optimistic insert with `pending` state. Server returns extracted entities to merge in.
- `setReminder(messageId, { at, label })` — server schedules the trigger
- `markRead(chatId, lastMessageId)` — fires when a chat is opened or scroll reaches bottom
- `markTaskComplete(taskId)` / `reopenTask(taskId)` — optimistic
- `inviteUsers({emails, role})` — pushes invited rows
- `updateUserRole(userId, role)` / `suspendUser(userId)`

**Real-time:**
The product needs a websocket subscription per workspace pushing: new messages, message updates (extracted entities arriving), read-receipt updates, reminder triggers, task state changes, ETA updates. The "live" pulsing-dot indicators and the typing indicator both rely on it.

---

## Suggested extraction prompts (for the AI extraction layer)

The seeded `c1Messages` thread is your best test corpus — it includes multi-line plans-for-tomorrow lists, driver detail blocks, customer visit announcements, and incident reports.

A system prompt should target these entity kinds (every one corresponds to a real field in `data.js`'s `etas` and seeded extraction panel):

- **Container**: ISO 6346 codes (4 letters + 6–7 digits, e.g. FSCU8065100) and ISO doc refs (ISO68750)
- **Container size**: 20ft / 40ft / 12m / 6m
- **Vehicle / Horse / Trailer**: South African plates (`CT`/`GP`/`ZN`/`NP`/`EC` + digits)
- **Driver**: name + optional cell (`0\d{9}`) + optional ID (13 digits)
- **Transporter**: company name following "Transporter —" / "Transporter:"
- **Linehaul**: company name following "LINEHAUL"
- **Customer**: known names (Tristar, Tronox, Allied, NIS, …) or text after "for delivery to" / "for"
- **Destination**: known locations (F24 wrhs, Prospecton, DBN office, …)
- **Product / cargo**: SLES, Slackwax, Caustic Soda, prime cargo, drums, bricks, …
- **ETA**: `\d{1,2}h\d{2}` or `\d{1,2}:\d{2}` or "Today/Tomorrow + time"
- **Plan list items**: "N x Xft <product>" lines (1 x 20ft Slackwax → quantity 1, size 20ft, product Slackwax)
- **Booking signals**: "X unpack teams booked" / "X loading teams"
- **Customer visit**: company name + day + city (when announced)
- **Incident signals**: "drums collapsed", "container damaged", "delay", etc.

Each extracted entity should also generate **task suggestions** (the prototype has 12 examples in `tasks`):
- "Plans for tomorrow" → one task per item
- Driver / vehicle details message → "Confirm <transporter> arrival at <customer>"
- Customer visit announcement → "Confirm <customer> visit date"
- Incident → "Follow up on <incident>"
- Container on route → "Track arrival of <container>"

---

## Assets

No images, photos, or external icon libraries are used. Everything is text, an `Icons` SVG, or an inline SVG (the route mini-map / voice waveforms / read-ticks SVG / logo squircle).

The **logo** is an inline SVG: green→cyan gradient squircle (radius 11) with a small truck silhouette inside. See `Rail` and `AuthScreen.BrandHeader` (in `auth.jsx`).

If your codebase has a Freight 24 brand asset, swap it in. Otherwise the inline SVG is ready to ship — extract to a `<Logo />` component.

---

## Implementation order (recommended)

1. **Tokens** — translate `styles.css` `:root` into your token system. Verify dark surfaces / sent-bubble color / mono font load before anything else.
2. **Primitives** — Btn / Pill / Avatar / TaskCheckbox / Icons / Rail. Static, no state.
3. **Auth** — sign in / sign up form. Trivial; ship early to unblock end-to-end testing.
4. **Chat shell** — ChatList + ChatView + MessageBubble (no extraction yet). Get bubbles, voice notes, doc attachments, the tiled background, and the composer working with real data.
5. **Extraction layer** — wire the LLM/NER call, render `.hl` highlights in segments, build the right-side ExtractionPanel, render the inline `extract` summary bubble.
6. **Reply / Reminders / Read receipts** — three independent feature flags. Reply is the simplest, ship first.
7. **Tasks tab** — straightforward CRUD on top of the extraction-generated tasks.
8. **ETA dashboard** — derive from extraction; server should compute `mins` field for "today" entries.
9. **Admin** — last. CRUD on employees + invite flow. Wire SSO if applicable.

---

## What's NOT in the prototype (deferred)

Notable real-product needs not modeled here:

- Actual chat persistence + history pagination
- Read-receipt propagation up the message list (only the latest is shown)
- Notification tray for triggered reminders
- File upload UI (drag-drop, image previews)
- @mentions and channel-style hash tagging (the team uses one-off group chats)
- Mobile / driver-facing companion
- Reports / analytics
- Audit log
- Role-permissions matrix
- WhatsApp Business API bridge (if you want to bring real WhatsApp threads in)

All of these are reasonable next phases — keep them out of v1 to ship faster.

---

## Files

Everything you need is in `source/`. Walk them in this order to build a mental model:

- `data.js` — start here, it's the data shape and seeded Freight 24 content
- `styles.css` — design tokens
- `icons.jsx` — icon set
- `shell.jsx` — primitives (Btn / Pill / Avatar / Rail / TaskCheckbox)
- `screens/chats.jsx` — the centerpiece (ChatView, MessageBubble, ExtractionPanel, ReplyBar, ReadInfoPopover, RemindMenu, ExtractBubble, VoiceWaveform, DocAttachment)
- `screens/tasks.jsx` — instruction-list pattern
- `screens/eta.jsx` — companion pattern to tasks
- `screens/admin.jsx` — user management + invite modal
- `screens/auth.jsx` — sign in / sign up
- `app.jsx` — auth gate + route switch
- `index.html` — the entry point
