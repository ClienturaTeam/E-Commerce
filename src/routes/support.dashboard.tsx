import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Headphones, MessageSquare, RefreshCcw, CheckCircle2, MessageCircle, LogOut } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/support/dashboard")({
  component: SupportDashboardRoute,
});

function SupportDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="SUPPORT">
      <SupportDashboardPage />
    </RequirePortalAuth>
  );
}

function SupportDashboardPage() {
  const { user, logout } = useEnterpriseAuth();

  const [tickets, setTickets] = React.useState([
    { id: "TCK-4810", customer: "Rahul Sharma", issue: "Item size exchange request", status: "OPEN", priority: "HIGH" },
    { id: "TCK-4811", customer: "Priya Patel", issue: "Payment deducted double", status: "OPEN", priority: "URGENT" },
    { id: "TCK-4812", customer: "Anand Verma", issue: "Tracking link update needed", status: "RESOLVED", priority: "NORMAL" },
  ]);

  const handleResolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)),
    );
    toast.success(`Ticket ${id} marked Resolved`);
  };

  const handleProcessRefund = (customer: string) => {
    toast.success(`Refund Authorization Sent`, { description: `Processed refund of ₹1,499 for ${customer}` });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Support Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xl flex items-center justify-center border border-indigo-300">
              <Headphones className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Ananya Roy (Senior Executive)"}</h1>
                <span className="text-xs bg-indigo-100 text-indigo-900 font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                  <MessageCircle className="size-3" /> Live Chat Desk Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Department: Tier-2 Escalations & Refunds · Queue Status: ONLINE</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> End Shift
            </button>
          </div>
        </div>

        {/* Support Ticket Resolution Console */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><MessageSquare className="size-4 text-indigo-600" /> Support Ticket Queue</span>
            <span className="text-xs text-muted-foreground">Open Tickets: 2</span>
          </h2>

          <div className="divide-y divide-border text-xs">
            {tickets.map((t) => (
              <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>{t.id}</span>
                    <span className="text-muted-foreground">({t.customer})</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] ${
                      t.priority === "URGENT" ? "bg-red-100 text-red-900 font-extrabold" : "bg-muted text-muted-foreground"
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{t.issue}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "OPEN" ? (
                    <>
                      <button
                        onClick={() => handleResolveTicket(t.id)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleProcessRefund(t.customer)}
                        className="border border-border px-3 py-1 rounded text-xs font-bold hover:bg-muted flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCcw className="size-3 text-purple-600" /> Process Refund
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Resolved & Closed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
