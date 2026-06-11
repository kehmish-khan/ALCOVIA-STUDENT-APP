# ALCOVIA-STUDENT-APP
# Alcovia — Offline-First Study App

A study app for grades 6–12 with offline-first sync across two devices.

---

## Features

- **Focus Sessions** — start a timer, earn coins and streak on success
- **Syllabus Progress** — track tasks per chapter, progress rolls up to subject level
- **Offline First** — everything works with no network, syncs when connection returns
- **Two Device Sync** — two devices diverge offline and reconcile to identical state on reconnect
- **n8n Automation** — notification fires exactly once per successful session

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo) + TypeScript |
| Backend | Express + TypeScript |
| Database | sql.js (SQLite in JS) |
| Automation | n8n Cloud |
| Notifications | webhook.site (mock sink) |

---

## Project Structure

```
alcovia/
  app/          # React Native Expo app
  server/       # Express backend
  shared/       # Shared TypeScript types and constants
  n8n-workflow.json  # Importable n8n workflow
  DECISIONS.md  # Architecture and sync design decisions
```

---

## How To Run

### 1. Start The Server

```bash
cd server
npm install
```

Create a `.env` file in the server folder:

```
PORT=3000
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/alcovia
```

Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:3000`. Test with:

```
GET http://localhost:3000/ping
```

---

### 2. Start The App

```bash
cd app
npm install
npx expo start
```

Open in browser with `w` or scan QR code with Expo Go.

---

### 3. Import n8n Workflow

1. Go to your n8n instance
2. Click **Add Workflow**
3. Click three dots menu → **Import from file**
4. Select `n8n-workflow.json` from the repo root
5. Click **Publish** to activate

---

## Two Device Setup

Since two browser tabs share storage, use different namespaces:

- **Device 1** — open app normally at `http://localhost:8081`
- **Device 2** — open in incognito window at `http://localhost:8081`

Both share `studentId: student_1` but have separate `deviceId` values.

---

## Dev Panel

Access the Dev Panel from the home screen. It lets you:

- Toggle network on/off per device
- Trigger manual sync
- View current device state (coins, streak, tasks, sessions)
- See sync logs in real time
- Reset all local data

---

## Conflict Cases Handled

| Scenario | Resolution |
|---|---|
| Same task status changed on both devices | Higher logical clock wins |
| Task edited on one device, deleted on other | Deletion wins (soft delete) |
| Same sync message arriving twice | Deduplicated by sessionId |
| Focus session from two devices | Server checks rewardGranted flag — rewards once |
| n8n notification for same session | Deduplicated by sessionId in workflow static data |

---

## Idempotency

### Backend
Every focus session has a `rewardGranted` boolean. Server checks this before awarding coins and streak. Even if the same session syncs 10 times, rewards are granted exactly once.

### n8n
The Code node stores processed sessionIds in workflow static data. If the same sessionId arrives again, it sets `skip: true` and the notification is not sent.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /ping | Health check |
| POST | /sync | Main sync endpoint |
| GET | /student/:id | Get student state |
| GET | /sessions/:studentId | Get all sessions |
| POST | /webhook/n8n-mock | Mock notification sink |

---

## Sync Flow

```
Device reconnects
  → reads pending queue
  → POST /sync with pending changes + lastSeenClock
  → server merges tasks (logical clock wins)
  → server processes sessions (idempotent rewards)
  → server fires n8n webhook if new successful session
  → server returns what device missed
  → device merges incoming changes
  → device saves new lastSeenClock
  → device clears pending queue
```

---

## What's Left / Known Limitations

- App backgrounding detection works on device but may behave differently in Expo web
- Two browser tabs need incognito mode to simulate two devices on web
- n8n static data resets if workflow is re-imported — sessionIds need to be re-deduped
- Server runs locally — n8n cloud cannot call back to localhost (one-way flow only)
- No user authentication — studentId is hardcoded as `student_1`

---

## What I Would Do Next

- Add persistent device storage using SQLite via Expo SQLite
- Expose server via ngrok or deploy to Railway/Render for full two-way n8n flow
- Add vector clocks for more precise conflict detection with 3+ devices
- Add fuzz testing for sync convergence
- Surface conflicts to the user when automatic merge isn't obvious
