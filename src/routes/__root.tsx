import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppProvider } from "@/context/AppContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#002147" },
      { title: "LumaTrack — National Market Intelligence for The Gambia" },
      {
        name: "description",
        content:
          "LumaTrack is The Gambia's community-powered price monitoring platform. Track fair prices from Banjul to Basse and stay ahead of inflation.",
      },
      { name: "author", content: "LumaTrack" },
      { property: "og:title", content: "LumaTrack — National Market Intelligence for The Gambia" },
      {
        property: "og:description",
        content: "Official community-powered price monitoring for The Gambia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "LumaTrack — National Market Intelligence for The Gambia" },
      { name: "description", content: "DalasiWatch is Gambia's official market intelligence system for fair prices and inflation monitoring." },
      { property: "og:description", content: "DalasiWatch is Gambia's official market intelligence system for fair prices and inflation monitoring." },
      { name: "twitter:description", content: "DalasiWatch is Gambia's official market intelligence system for fair prices and inflation monitoring." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e54a63b8-9ee5-4729-8592-88d5545af9d3/id-preview-c7933dba--3ecb6358-2d95-46cc-be75-136abbea10cd.lovable.app-1776568710434.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e54a63b8-9ee5-4729-8592-88d5545af9d3/id-preview-c7933dba--3ecb6358-2d95-46cc-be75-136abbea10cd.lovable.app-1776568710434.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}
