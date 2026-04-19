import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type LineSpec = { type: "line"; title?: string; xKey: string; yKey: string; unit?: string; data: Array<Record<string, any>> };
type MultiLineSpec = { type: "multiLine"; title?: string; xKey: string; unit?: string; series: Array<{ name: string; data: Array<{ date: string; value: number }> }> };
type BarSpec = { type: "bar"; title?: string; xKey: string; yKey: string; unit?: string; data: Array<Record<string, any>> };
export type ChartSpec = LineSpec | MultiLineSpec | BarSpec;

const COLORS = ["hsl(var(--primary))", "hsl(var(--gold))", "hsl(var(--destructive))", "#10b981", "#8b5cf6"];

function fmtTip(unit?: string) {
  return (v: any) => (typeof v === "number" ? `${unit ?? ""} ${Math.round(v).toLocaleString()}`.trim() : v);
}

export function ChartBlock({ spec }: { spec: ChartSpec }) {
  return (
    <div className="my-2 rounded-lg border border-border bg-background/50 p-3">
      {spec.title && <p className="mb-2 text-xs font-semibold text-foreground/80">{spec.title}</p>}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === "bar" ? (
            <BarChart data={spec.data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey={spec.xKey} tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={fmtTip(spec.unit)} contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey={spec.yKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : spec.type === "multiLine" ? (
            (() => {
              // Merge series into a single dataset keyed by date
              const map = new Map<string, Record<string, any>>();
              spec.series.forEach((s) => s.data.forEach((p) => {
                const row = map.get(p.date) ?? { [spec.xKey]: p.date };
                row[s.name] = p.value;
                map.set(p.date, row);
              }));
              const data = [...map.values()].sort((a, b) => String(a[spec.xKey]).localeCompare(String(b[spec.xKey])));
              return (
                <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey={spec.xKey} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip formatter={fmtTip(spec.unit)} contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {spec.series.map((s, i) => (
                    <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
                  ))}
                </LineChart>
              );
            })()
          ) : (
            <LineChart data={spec.data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey={spec.xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={fmtTip(spec.unit)} contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey={spec.yKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Splits assistant content into markdown segments and chart specs.
 * Recognises ```chart\n{json}\n``` fenced blocks.
 */
export function parseAssistantContent(content: string): Array<{ kind: "md"; text: string } | { kind: "chart"; spec: ChartSpec }> {
  const parts: Array<{ kind: "md"; text: string } | { kind: "chart"; spec: ChartSpec }> = [];
  const re = /```chart\s*\n([\s\S]*?)\n```/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > lastIdx) parts.push({ kind: "md", text: content.slice(lastIdx, m.index) });
    try {
      const spec = JSON.parse(m[1]) as ChartSpec;
      if (spec && (spec.type === "line" || spec.type === "bar" || spec.type === "multiLine")) {
        parts.push({ kind: "chart", spec });
      } else {
        parts.push({ kind: "md", text: m[0] });
      }
    } catch {
      parts.push({ kind: "md", text: m[0] });
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < content.length) parts.push({ kind: "md", text: content.slice(lastIdx) });
  return parts;
}
