import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root Boundary Error:", error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full border border-border bg-card p-8 rounded-xl shadow-lg text-center space-y-4">
        <div className="mx-auto size-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Portal Rendering Recovered
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We encountered a minor layout initialization issue. You can reload the portal or navigate directly to the customer home store or portals hub directory.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-brand px-4 py-2 text-primary-foreground hover:bg-brand-deep cursor-pointer transition-colors"
          >
            Reload Page
          </button>
          <a
            href="/portals"
            className="rounded-md border border-border bg-muted/50 px-4 py-2 text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            Portals Directory
          </a>
          <a
            href="/"
            className="rounded-md border border-border bg-background px-4 py-2 text-foreground hover:bg-accent cursor-pointer transition-colors"
          >
            Store Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kartly — Online Shopping for Every Need" },
      {
        name: "description",
        content:
          "Shop mobiles, fashion, electronics, home and beauty on Kartly with fast delivery and everyday low prices.",
      },
      { property: "og:title", content: "Kartly — Online Shopping for Every Need" },
      {
        property: "og:description",
        content: "Mobiles, fashion, electronics and more with fast delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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

import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider } from "@/components/auth/enterprise-auth-context";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <EnterpriseAuthProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <CartPanel />
          <ChatBot />
          <Toaster position="bottom-center" />
        </EnterpriseAuthProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
