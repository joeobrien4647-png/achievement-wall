# Achievement Wall — Phases 12–17

## Architecture Decisions

**Navigation**: Add "Wishlist" as 6th nav tab (mobile handles 6 fine with smaller text). Keep "Next" for the active training view — it serves a different purpose to the aspirational bucket list.

**Schema**: Extend events with `status: "wishlist"`, plus new fields `targetYear`, `appeal`, `kitList`, `nutritionPlan`. Add `mantras` and `weeklyCheckins` to preferences.

**Principle**: Embed features into existing pages where they naturally belong (kit/nutrition → event detail, streaks → home, YoY → stats). Only add a new page when it deserves its own mental space (bucket list does).

---

## Phase 12: Bucket List / Wishlist ✅
- [x] Add `"wishlist"` as valid event status in schema.js
- [x] Add `targetYear` (number|null) and `appeal` (string) fields to `createEvent()`
- [x] Update `useEvents` hook: add `wishlist` array (status === "wishlist")
- [x] Create `BucketListPage.jsx` — aspirational design with recommendations
- [x] Add `Compass` icon + "Wishlist" tab to Nav.jsx (6th tab)
- [x] Register page in App.jsx routing

## Phase 13: Finish Times & Pace ✅
- [x] Add time parsing utility `src/lib/pace.js`
- [x] Update EventFormPage: proper time input field
- [x] Update EventDetail: show finish time + calculated pace
- [x] Update useStats: add `fastestPace` to personalRecords
- [x] Update StatsPage personal records: show fastest pace PR

## Phase 14: Kit & Nutrition ✅
- [x] Add `kitList` and `nutritionPlan` to createEvent defaults
- [x] Kit checklist section in EventDetail (add, check/uncheck, delete)
- [x] Nutrition plan section in EventDetail
- [x] Add kit and nutrition fields to EventFormPage

## Phase 15: Advanced Stats ✅
- [x] Year-over-year comparison card on StatsPage
- [x] Difficulty progression chart
- [x] Event comparison feature (CompareOverlay on EventsPage)

## Phase 16: Streaks & Consistency ✅
- [x] Add `weeklyCheckins` (array of ISO date strings) to preferences
- [x] Weekly check-in button on HomePage ("I trained" / "✓ Done")
- [x] Streak display: current streak + longest streak
- [x] Activity heatmap on StatsPage (52-week grid, 13-col layout)

## Phase 17: Motivation Wall ✅
- [x] Add `mantras` (array of strings) to preferences with 6 seed defaults
- [x] MotivationCard component on HomePage (daily rotating mantra)
- [x] Mantra management overlay (add/delete custom mantras)
- [x] Context-aware motivation (event countdown + streak acknowledgment)

---

## All Phases Complete 🏆

Phases 1-17 are fully implemented. The app is a complete endurance tracking PWA with:
- Event CRUD with timeline, search, filter, compare
- Training tracker with weekly check-ins and streaks
- Stats dashboard with YoY, difficulty progression, heatmap, UK map
- Bucket list with smart recommendations
- Motivation wall with daily mantras
- PWA support, export/import, shareable cards
