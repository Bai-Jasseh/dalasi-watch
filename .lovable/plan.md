

## Ask DalasiWatch — AI price assistant grounded in your data

A floating chat widget where users ask natural-language questions about commodity prices across Gambian regions, and an AI answers using **real data from `price_history` and `citizen_reports`**.

### Example questions it should handle
- "How much is rice in Brikama right now?"
- "Where is sugar cheapest this week?"
- "Compare onion prices in Banjul vs Basse"
- "What's the price trend for fish in Kanifing?"
- "Which region has the most expensive cooking oil?"

### Architecture (the key insight)

This is **NOT** a generic chatbot. It's a **tool-calling agent** with structured access to your data — the same pattern used by serious AI products. The model decides what data it needs and calls our functions; we never let it hallucinate prices.

```
User question
   ↓
Edge function `/ask-dalasi` (streaming)
   ↓
Lovable AI (google/gemini-2.5-flash) with TOOLS:
   • get_latest_price(commodity_id, region_id?)
   • get_price_trend(commodity_id, region_id, days)
   • compare_regions(commodity_id)
   • list_commodities() / list_regions()
   ↓
Each tool runs a real SQL query against price_history + citizen_reports
   ↓
Model formats the answer in plain English with actual numbers
   ↓
Stream tokens back to UI
```

### Why this wins judges
- **Grounded**: every price quoted comes from the database, not the model's imagination
- **Auditable**: tool calls are logged — you can prove where each number came from
- **Inclusive**: lowers the literacy/UI barrier — ask in plain English instead of navigating filters
- **Defensible AI**: it's RAG over civic data, not "ChatGPT in a box"

### Build plan

**1. Edge function `supabase/functions/ask-dalasi/index.ts`**
- POST endpoint, accepts `{ messages: [...] }`
- System prompt: "You are DalasiWatch's price assistant for The Gambia. Always use the provided tools to get real prices — never guess. Quote prices in GMD (Dalasi). Be concise."
- Calls Lovable AI Gateway with `tools: [...]` definitions
- Handles tool-call loop: when model returns `tool_calls`, run the SQL via `supabaseAdmin`, append tool results, call model again
- Final pass: `stream: true` so the answer streams to the UI
- Handle 429/402 with friendly errors
- `verify_jwt = false` in `supabase/config.toml` (public endpoint, RLS-safe since we only SELECT public data)

**2. Tool implementations (inside the edge function)**
- `list_commodities()` → returns id + name list (from `src/data/commodities.ts` mirrored as a constant in the function)
- `list_regions()` → returns id + name list
- `get_latest_price({ commodity_id, region_id? })` → most recent row(s) from `price_history` + most recent `citizen_reports`, averaged
- `get_price_trend({ commodity_id, region_id, days })` → series of points, plus computed % change
- `compare_regions({ commodity_id })` → latest price per region, sorted

Each tool validates input with light checks (length, known IDs) before querying.

**3. Frontend `src/components/AskDalasi.tsx`** (new)
- Floating button bottom-right (gold, with `MessageCircle` icon, "Ask DalasiWatch" label on hover)
- Click → opens a `Sheet` (slides in from right) — uses less screen real estate than a Dialog and feels chat-like
- Header: "Ask DalasiWatch" + subtitle "AI assistant powered by real market data"
- Message list with `ReactMarkdown` rendering (assistant replies often include numbers/lists)
- Input at the bottom + send button
- 3 starter suggestion chips: "Rice prices today", "Cheapest sugar", "Onion trend in Brikama"
- Streams tokens via `fetch` + SSE parser (per the streaming pattern in knowledge)
- Shows toast on 429/402

**4. Wire into `src/components/AppShell.tsx`**
- Render `<AskDalasi />` once at the shell level so it appears on every page

**5. Dependency**
- Add `react-markdown` for clean answer rendering

### What I'm NOT doing
- No persistent chat history (judges/users get a fresh session — keeps it simple, no auth needed)
- No voice input (nice-to-have for v2)
- No multilingual yet (English only — the data labels are English anyway)
- No analytics/tracking
- No new database tables (everything reads from existing `price_history` + `citizen_reports`)

### Files
- **New**: `supabase/functions/ask-dalasi/index.ts`
- **New**: `src/components/AskDalasi.tsx`
- **Edit**: `src/components/AppShell.tsx` (mount the widget)
- **Edit**: `supabase/config.toml` (add `[functions.ask-dalasi] verify_jwt = false`)
- **Add dep**: `react-markdown`

