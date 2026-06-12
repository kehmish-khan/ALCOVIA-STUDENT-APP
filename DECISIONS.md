# Architectural Decisions

## Data & Sync Model

The app uses an **offline-first, append-and-merge** sync model.

Every write (task update, focus session) is saved to local storage immediately and added to a pending queue. A sync engine runs every 10 seconds when online. On each cycle it:

1. Reads the pending queue (tasks + sessions not yet sent to the server)
2. POSTs them to `/sync` along with a `lastSeenClock` — the highest logical clock the device has already received
3. The server merges the incoming changes, calculates rewards, and returns everything the device has missed since `lastSeenClock`
4. The device merges the server response into local storage and clears the queue

The server holds the canonical state. The client holds a local replica that is always a superset of what the server knows (pending items included).

---

## Conflict Resolution

Tasks carry a `logicalClock` integer that increments on every edit. When the same task is modified on two devices while offline, both versions arrive at the server on the next sync. The server resolves the conflict by **keeping the version with the higher logical clock** — last write wins, but measured in logical time rather than wall-clock time.

Wall-clock timestamps are not used for ordering because device clocks can drift or be set incorrectly. Logical clocks are monotonically increasing per device and give a deterministic result regardless of when the devices actually sync.

---

## Why Two Devices Always End Up Identical

After both devices sync, they converge to the same state because:

- **Tasks** — the server always keeps the highest-clock version and returns it to all devices. Any device that held a lower-clock version overwrites it with the server's copy on the next sync response.
- **Student state (coins, streak)** — the server recalculates these from the session history on every sync and sends the result down. The client never keeps its own authoritative copy; it always overwrites with what the server returns.
- **Sessions** — sessions are immutable once written. They are never updated, only inserted. Both devices receive all sessions they haven't seen yet via the `lastSeenClock` filter. There is nothing to conflict.

Convergence is guaranteed because every sync cycle ends with the device saving the server's version of everything it missed. Two devices may diverge temporarily while offline, but after each syncs once they hold identical data.

---

## Idempotency

### Backend

Two flags in the `focus_sessions` table enforce exactly-once processing:

- `rewardGranted` — set to `1` the first time `grantReward()` runs for a session. Every subsequent sync that includes the same session hits the idempotency check at the top of `grantReward()` and returns early. Coins are never doubled.
- `notificationSent` — set to `1` after a successful webhook call to n8n. If the same session arrives again (e.g. the device resyncs before receiving the server's ack), `sendSessionNotification()` checks this flag and skips the call. n8n is never called twice for the same session.

The sync endpoint itself is also safe to call multiple times. Inserting a session that already exists is a no-op (checked with `SELECT` before `INSERT`). Merging tasks that are already present keeps whichever has the higher clock and discards the rest.

### n8n Workflow

The n8n workflow performs its own duplicate check on the incoming `sessionId`. If a webhook arrives for a session it has already processed, the workflow returns `{"notified": false, "reason": "duplicate"}` and stops. This is a second line of defence independent of the backend flag — it protects against any edge case where the backend sends the same session twice (e.g. a crash after the axios call succeeded but before `notificationSent` was written to the database).

---

## Tradeoff: Server as Sole Source of Truth for Coins

**What we chose:** Coins and streak are always overwritten by the server's value on sync. The client adds coins locally as an optimistic update so the UI feels instant, but those local values are discarded the moment a sync completes.

**The tradeoff:** If a student completes a session while offline, they see their coins increase immediately. But if the server calculates a different value (e.g. because another device also completed a session in the same window), the local value is silently replaced on sync. The student may see their coin count jump or correct itself. This is a visible inconsistency.

**Why we accepted it:** The alternative — merging coin deltas from multiple devices — requires tracking every individual coin transaction and replaying them in order, which adds significant complexity. For a student focus app where trust and simplicity matter more than sub-second coin accuracy, the correction-on-sync behaviour is acceptable. The student always ends up with the right total after syncing.
