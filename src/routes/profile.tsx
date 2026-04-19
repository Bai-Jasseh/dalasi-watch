import { createFileRoute } from "@tanstack/react-router";
import { Globe, Smartphone, Bookmark, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { useApp } from "@/context/AppContext";
import type { Lang } from "@/i18n/strings";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — LumaTrack" },
      {
        name: "description",
        content:
          "Choose your language (English, Wolof, Mandinka), manage saved markets, and install LumaTrack.",
      },
    ],
  }),
  component: Profile,
});

const LANGS: { id: Lang; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "wo", label: "Wolof", native: "Wolof" },
  { id: "mn", label: "Mandinka", native: "Mandinka" },
];

function Profile() {
  const { lang, setLang, refreshHistory } = useApp();

  function resetData() {
    if (typeof window === "undefined") return;
    if (!confirm("Reset all local LumaTrack data?")) return;
    localStorage.removeItem("lumatrack:history:v1");
    localStorage.removeItem("lumatrack:reports:v1");
    refreshHistory();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Profile</h1>
        </div>

        <PageIntro
          title="Make LumaTrack feel like home"
          description="This is your settings room. Choose the language you read best, install the app on your phone, and manage the data we keep on your device."
          bullets={[
            "Switch the whole app to English, Wolof, or Mandinka.",
            "Follow the steps to add LumaTrack to your phone's home screen.",
            "Reset local data if you ever want a fresh start.",
          ]}
        />

        <Section icon={Globe} title="Language">
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                  lang === l.id
                    ? "border-navy bg-navy text-navy-foreground shadow-elegant"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                <div className="font-bold">{l.label}</div>
                <div className="text-xs opacity-70">{l.native}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Smartphone} title="Install LumaTrack">
          <p className="text-sm text-muted-foreground">
            Add LumaTrack to your home screen for one-tap access — works offline with cached data.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-foreground/85">
            <li>Open this site in your phone's browser.</li>
            <li>Tap the share/menu button.</li>
            <li>
              Choose <strong>Add to Home Screen</strong>.
            </li>
          </ol>
        </Section>

        <Section icon={Bookmark} title="Saved Markets">
          <p className="text-sm text-muted-foreground">
            Save your favorite commodities from any market page (coming soon).
          </p>
        </Section>

        <Section icon={Trash2} title="Local Data">
          <button
            onClick={resetData}
            className="rounded-lg border border-alert/40 bg-alert/10 px-4 py-2 text-sm font-medium text-alert hover:bg-alert/20"
          >
            Reset all local data
          </button>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-navy-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
