

## Minimal "Watch demo" text link on the homepage

A small, unobtrusive text link that doesn't compete with the main CTA but is discoverable for judges/visitors who want to see the pitch.

### Best placement

Inside the existing meta row directly below the primary CTA — the line that currently reads:

> 🇬🇲 7 Regions · 25+ Tracked Commodities · Updated Daily

Add a fourth item: **▶ Watch 4-min demo**

Why this spot:
- Already a low-emphasis line, so it doesn't fight the gold "Launch Dashboard" button
- Sits right under the CTA where eyes naturally land after reading the hero
- Fits the existing visual rhythm (dot separators, same muted color)
- No layout shift, no new section, no modal infrastructure needed beyond a single click handler

### Changes

**1. Copy the video into public assets**
- Copy `/mnt/documents/DalasiWatch-Pitch-Demo.mp4` → `public/demo.mp4`

**2. Edit `src/routes/index.tsx`**
- Add `useState` for dialog open state
- Replace the static meta row with one that includes a `<button>` styled as a text link: `▶ Watch 4-min demo` — same muted color (`text-navy-foreground/70`), underline on hover
- On click, open a shadcn `Dialog` containing `<video controls preload="none" src="/demo.mp4">`
- Dialog auto-pauses video on close (set `src=""` or pause via ref)

No new component file — keep it inline in `index.tsx` to stay minimal.

### Files touched
- `public/demo.mp4` (new — copied from /mnt/documents)
- `src/routes/index.tsx` (add link + inline dialog)

### What I'm NOT doing
- No second button, no header icon, no `/demo` route, no AppShell changes, no poster image extraction (the `<video>` element shows a black frame until played, which is fine for a text-link entry point)

