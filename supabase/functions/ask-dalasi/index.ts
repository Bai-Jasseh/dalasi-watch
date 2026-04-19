// Ask DalasiWatch — tool-calling AI agent grounded in real price data.
// Public endpoint (verify_jwt = false). Reads only public price tables.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mirror of src/data/commodities.ts (keep in sync if catalog changes)
const COMMODITIES = [
  { id: "rice-sadam", name: "Rice (Sadam)", unit: "50kg bag" },
  { id: "rice-broken", name: "Rice (Broken)", unit: "50kg bag" },
  { id: "rice-american", name: "Rice (American)", unit: "50kg bag" },
  { id: "sugar-50", name: "Sugar", unit: "50kg bag" },
  { id: "sugar-1", name: "Sugar", unit: "1kg" },
  { id: "flour", name: "Flour", unit: "50kg bag" },
  { id: "oil-20", name: "Cooking Oil", unit: "20L" },
  { id: "oil-5", name: "Cooking Oil", unit: "5L" },
  { id: "oil-1", name: "Cooking Oil", unit: "1L" },
  { id: "fish-bonga", name: "Bonga Fish", unit: "kg" },
  { id: "fish-ladyfish", name: "Ladyfish", unit: "kg" },
  { id: "beef-bone", name: "Beef (with bone)", unit: "kg" },
  { id: "beef-nobone", name: "Beef (boneless)", unit: "kg" },
  { id: "chicken-local", name: "Chicken (Local)", unit: "whole" },
  { id: "chicken-carton", name: "Chicken (Carton)", unit: "carton" },
  { id: "eggs", name: "Eggs", unit: "crate (30)" },
  { id: "onion-local", name: "Onions (Local)", unit: "kg" },
  { id: "onion-holland", name: "Onions (Holland)", unit: "kg" },
  { id: "potato", name: "Potatoes", unit: "kg" },
  { id: "tomato", name: "Tomatoes", unit: "kg" },
  { id: "bitter-tomato", name: "Bitter Tomato", unit: "kg" },
  { id: "pepper", name: "Peppers", unit: "kg" },
  { id: "charcoal", name: "Charcoal", unit: "large bag" },
  { id: "firewood", name: "Firewood", unit: "bundle" },
  { id: "gas-12", name: "Gas Cylinder", unit: "12.5kg" },
];

const REGIONS = [
  { id: "banjul", name: "Banjul" },
  { id: "kanifing", name: "Kanifing (Serekunda)" },
  { id: "brikama", name: "Brikama / Tanji" },
  { id: "soma", name: "Soma" },
  { id: "farafenni", name: "Farafenni" },
  { id: "bansang", name: "Bansang" },
  { id: "basse", name: "Basse" },
];

const REGION_IDS = new Set(REGIONS.map((r) => r.id));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Commodities that actually have price data — populated per-request.
let AVAILABLE_COMMODITY_IDS: Set<string> = new Set();

async function loadAvailableCommodities(): Promise<void> {
  const [ph, cr] = await Promise.all([
    supabase.from("price_history").select("commodity_id"),
    supabase.from("citizen_reports").select("commodity_id"),
  ]);
  const ids = new Set<string>();
  (ph.data ?? []).forEach((r: any) => ids.add(r.commodity_id));
  (cr.data ?? []).forEach((r: any) => ids.add(r.commodity_id));
  AVAILABLE_COMMODITY_IDS = ids;
}

function availableCommodities() {
  return COMMODITIES.filter((c) => AVAILABLE_COMMODITY_IDS.has(c.id));
}

// ---------- Tool implementations ----------

function commodityLabel(id: string) {
  const c = COMMODITIES.find((x) => x.id === id);
  return c ? `${c.name} (${c.unit})` : id;
}
function regionLabel(id: string) {
  const r = REGIONS.find((x) => x.id === id);
  return r ? r.name : id;
}

async function getLatestPrice(args: { commodity_id: string; region_id?: string }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id)) {
    return { error: `No price data available for "${args.commodity_id}". Use list_commodities to see commodities we currently track prices for.` };
  }
  if (args.region_id && !REGION_IDS.has(args.region_id)) {
    return { error: `Unknown region_id "${args.region_id}". Use list_regions to see valid IDs.` };
  }

  const regions = args.region_id ? [args.region_id] : Array.from(REGION_IDS);
  const results: Array<{ region: string; price: number; date: string; source: string }> = [];

  for (const rid of regions) {
    // Most recent price_history point
    const { data: ph } = await supabase
      .from("price_history")
      .select("price, point_date")
      .eq("commodity_id", args.commodity_id)
      .eq("region_id", rid)
      .order("point_date", { ascending: false })
      .limit(1);

    // Recent citizen reports (last 7 days)
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data: cr } = await supabase
      .from("citizen_reports")
      .select("price, report_date")
      .eq("commodity_id", args.commodity_id)
      .eq("region_id", rid)
      .gte("report_date", since.toISOString().slice(0, 10));

    const phPrice = ph?.[0] ? Number(ph[0].price) : null;
    const phDate = ph?.[0]?.point_date as string | undefined;

    if (cr && cr.length > 0) {
      const avg = cr.reduce((s, x) => s + Number(x.price), 0) / cr.length;
      const lastDate = cr.reduce((d, x) => ((x.report_date as string) > d ? (x.report_date as string) : d), cr[0].report_date as string);
      // Blend with history if both present
      const blended = phPrice != null ? Math.round((avg + phPrice) / 2) : Math.round(avg);
      results.push({ region: regionLabel(rid), price: blended, date: lastDate, source: phPrice != null ? "citizen+history" : "citizen" });
    } else if (phPrice != null) {
      results.push({ region: regionLabel(rid), price: Math.round(phPrice), date: phDate!, source: "history" });
    }
  }

  if (results.length === 0) {
    return { commodity: commodityLabel(args.commodity_id), prices: [], note: "No price data available yet for this commodity." };
  }
  return {
    commodity: commodityLabel(args.commodity_id),
    currency: "GMD",
    prices: results,
  };
}

async function getPriceTrend(args: { commodity_id: string; region_id: string; days?: number }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id)) return { error: `No price data for "${args.commodity_id}".` };
  if (!REGION_IDS.has(args.region_id)) return { error: `Unknown region_id "${args.region_id}".` };
  const days = Math.min(Math.max(args.days ?? 30, 1), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("price_history")
    .select("price, point_date")
    .eq("commodity_id", args.commodity_id)
    .eq("region_id", args.region_id)
    .gte("point_date", since.toISOString().slice(0, 10))
    .order("point_date", { ascending: true });

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { commodity: commodityLabel(args.commodity_id), region: regionLabel(args.region_id), points: [], note: "No trend data available." };
  }

  const points = data.map((d) => ({ date: d.point_date as string, price: Number(d.price) }));
  const first = points[0].price;
  const last = points[points.length - 1].price;
  const pctChange = first > 0 ? ((last - first) / first) * 100 : 0;

  // Sample down to ~12 points for the model
  const step = Math.max(1, Math.floor(points.length / 12));
  const sampled = points.filter((_, i) => i % step === 0);
  if (sampled[sampled.length - 1] !== points[points.length - 1]) sampled.push(points[points.length - 1]);

  return {
    commodity: commodityLabel(args.commodity_id),
    region: regionLabel(args.region_id),
    currency: "GMD",
    days,
    first_price: Math.round(first),
    last_price: Math.round(last),
    pct_change: Math.round(pctChange * 10) / 10,
    points: sampled.map((p) => ({ date: p.date, price: Math.round(p.price) })),
  };
}

async function compareRegions(args: { commodity_id: string }) {
  if (!AVAILABLE_COMMODITY_IDS.has(args.commodity_id)) return { error: `No price data for "${args.commodity_id}".` };
  const latest = await getLatestPrice({ commodity_id: args.commodity_id });
  if ("error" in latest) return latest;
  const sorted = [...(latest.prices ?? [])].sort((a, b) => a.price - b.price);
  return {
    commodity: latest.commodity,
    currency: "GMD",
    cheapest: sorted[0],
    most_expensive: sorted[sorted.length - 1],
    all: sorted,
  };
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_commodities",
      description: "List all tracked commodities with their IDs, names, and units.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "list_regions",
      description: "List all tracked regions of The Gambia with their IDs and names.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_latest_price",
      description: "Get the latest price for a commodity, optionally filtered to one region. Combines official price history and recent citizen reports.",
      parameters: {
        type: "object",
        properties: {
          commodity_id: { type: "string", description: "Commodity ID, e.g. 'rice-sadam'." },
          region_id: { type: "string", description: "Optional region ID, e.g. 'banjul'. Omit to get prices in all regions." },
        },
        required: ["commodity_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_price_trend",
      description: "Get the price trend for a commodity in a specific region over the last N days (default 30).",
      parameters: {
        type: "object",
        properties: {
          commodity_id: { type: "string" },
          region_id: { type: "string" },
          days: { type: "number", description: "Lookback window in days (1-365). Defaults to 30." },
        },
        required: ["commodity_id", "region_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_regions",
      description: "Compare the latest price of a commodity across all regions. Returns cheapest, most expensive, and full sorted list.",
      parameters: {
        type: "object",
        properties: { commodity_id: { type: "string" } },
        required: ["commodity_id"],
        additionalProperties: false,
      },
    },
  },
];

async function runTool(name: string, args: any) {
  switch (name) {
    case "list_commodities":
      return { commodities: availableCommodities() };
    case "list_regions":
      return { regions: REGIONS };
    case "get_latest_price":
      return await getLatestPrice(args);
    case "get_price_trend":
      return await getPriceTrend(args);
    case "compare_regions":
      return await compareRegions(args);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT = `You are DalasiWatch's price assistant for The Gambia. You help citizens find current commodity prices across 7 regions.

RULES:
- ALWAYS use the provided tools to get real prices. NEVER guess or invent numbers.
- All prices are in GMD (Gambian Dalasi). Format like "GMD 75" or "75 Dalasi".
- Be concise and conversational. Use markdown lists/tables when comparing items.
- If a tool returns no data for a commodity/region, say so honestly — don't fabricate.
- If a user asks about a commodity NOT in the tracked list below, say "We don't currently track [item] prices" and then suggest 2-3 related items we DO track from the catalog.
- If the user's question is ambiguous (e.g. "rice" — there are 3 types), ask a brief clarifying question OR show the closest match and mention alternatives.
- For "where is X cheapest?" use compare_regions. For trends/changes over time, use get_price_trend.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages } = await req.json();
    if (!Array.isArray(userMessages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    await loadAvailableCommodities();
    const catalog = availableCommodities()
      .map((c) => `- ${c.id}: ${c.name} (${c.unit})`)
      .join("\n");
    const dynamicSystem = `${SYSTEM_PROMPT}

CURRENTLY TRACKED COMMODITIES (only these have price data — do NOT offer or invent others):
${catalog}`;

    let messages: any[] = [
      { role: "system", content: dynamicSystem },
      ...userMessages,
    ];

    // Tool-call loop (max 5 rounds)
    for (let round = 0; round < 5; round++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools: TOOLS,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (resp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await resp.text();
        console.error("AI gateway error", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const json = await resp.json();
      const choice = json.choices?.[0];
      const msg = choice?.message;
      if (!msg) {
        return new Response(JSON.stringify({ error: "No response from model" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const toolCalls = msg.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        // Append assistant's tool-call message
        messages.push({
          role: "assistant",
          content: msg.content ?? "",
          tool_calls: toolCalls,
        });
        // Run each tool and append result
        for (const tc of toolCalls) {
          let parsed: any = {};
          try { parsed = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
          console.log("tool_call", tc.function.name, parsed);
          const result = await runTool(tc.function.name, parsed);
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue; // next round
      }

      // No tool calls — final answer. Return as plain JSON.
      return new Response(JSON.stringify({ content: msg.content ?? "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Tool-call loop exceeded max rounds." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ask-dalasi error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
