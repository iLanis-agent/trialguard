# TrialGuard

Free trials are designed to be forgotten: you enter a card, enjoy 7 days, and the first
charge lands before you remember it exists. TrialGuard is a dead-simple tracker - log
each trial, see the real monthly and yearly burn if everything converts, and get a
color-coded countdown to each cancel-by date. Mark trials cancelled and it keeps score
of what you saved per year.

- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- Urgency tiers: cancel today / 1-2 days / this week / safe / already converted
- `engine.js` holds the date math as pure functions, shared between the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers cancel-by date math (month/year/leap boundaries), days-left,
urgency tiers, urgency sorting (expired sink to bottom, input not mutated), burn and
savings totals.
