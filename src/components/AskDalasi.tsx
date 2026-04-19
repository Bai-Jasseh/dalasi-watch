import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What's the price of rice in Brikama?",
  "Where is sugar cheapest right now?",
  "Compare onion prices across regions",
];

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-dalasi`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function AskDalasi() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        if (resp.status === 429) toast.error("Too many requests. Please try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add credits in workspace settings.");
        else toast.error(err.error || "Something went wrong");
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
        return;
      }

      const data = await resp.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content || "(no response)" }]);
    } catch (e) {
      console.error(e);
      toast.error("Network error");
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask DalasiWatch AI"
        className={cn(
          "fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-gold px-4 py-3 text-sm font-semibold text-gold-foreground shadow-elegant transition-all hover:scale-105 md:bottom-6 md:right-6",
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask DalasiWatch</span>
        <MessageCircle className="h-4 w-4 sm:hidden" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border bg-navy p-4 text-left text-navy-foreground">
            <SheetTitle className="flex items-center gap-2 text-navy-foreground">
              <Sparkles className="h-4 w-4 text-gold" />
              Ask DalasiWatch
            </SheetTitle>
            <SheetDescription className="text-navy-foreground/70">
              AI assistant powered by real market data from all 7 regions.
            </SheetDescription>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ask about prices, compare regions, or check trends. Try:
                </p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-8 bg-navy text-navy-foreground"
                    : "mr-8 bg-muted text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-8 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                </span>
                Checking the markets…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prices…"
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
