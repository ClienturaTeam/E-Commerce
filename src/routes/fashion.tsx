import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";

export const Route = createFileRoute("/fashion")({
  component: FashionRoute,
});

function FashionRoute() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />
      <main>
        <h1 className="sr-only">Fashion Store — Men, Women & Kids</h1>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
