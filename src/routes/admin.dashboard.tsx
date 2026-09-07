import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { ShieldCheck, Users, Store, ShoppingBag, ShieldAlert, BarChart3, Megaphone, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="ADMIN">
      <AdminDashboardPage />
    </RequirePortalAuth>
  );
}

function AdminDashboardPage() {
  const { user, logout } = useEnterpriseAuth();

  const handleAction = (actionName: string) => {
    toast.success(`Admin Action Authorized: ${actionName}`);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Admin Header */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center border border-amber-300">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "System Admin (Level 2)"}</h1>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                  RBAC Level 2 Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Scope: Product Moderation · Seller KYC · Orders Oversight</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Logout Session
            </button>
          </div>
        </div>

        {/* Admin Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Platform Users</span>
              <Users className="size-4 text-brand" />
            </div>
            <p className="text-xl font-extrabold text-foreground">1,24,800</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Verified Sellers</span>
              <Store className="size-4 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">3,420</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Orders Controlled</span>
              <ShoppingBag className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">8,940 today</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Pending Moderation</span>
              <ShieldAlert className="size-4 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-amber-600">14 items</p>
          </div>
        </div>

        {/* Product Moderation & Seller Approval Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
              <span>Seller Store Moderation Queue</span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">Action Required</span>
            </h2>

            <div className="divide-y divide-border text-xs">
              {[
                { store: "TechNova Gadgets Ltd", category: "Electronics", status: "KYC Pending" },
                { store: "VogueThreads Fashion", category: "Apparel", status: "Catalog Review" },
                { store: "Zenith Soundworks", category: "Audio", status: "Store Approval" },
              ].map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground">{item.store}</p>
                    <p className="text-muted-foreground text-[11px]">Category: {item.category} · Status: {item.status}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(`Approve Store: ${item.store}`)}
                      className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="size-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(`Reject Store: ${item.store}`)}
                      className="bg-destructive text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                    >
                      <XCircle className="size-3" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
              Admin Quick Tools
            </h2>
            <div className="space-y-2.5">
              <button
                onClick={() => handleAction("Generate System Analytics Report")}
                className="w-full border border-border p-2.5 rounded text-xs font-semibold text-foreground flex items-center justify-between hover:bg-muted cursor-pointer"
              >
                <span className="flex items-center gap-2"><BarChart3 className="size-4 text-brand" /> Platform Analytics</span>
                <span className="text-brand">→</span>
              </button>

              <button
                onClick={() => handleAction("Launch Marketing Promotion Campaign")}
                className="w-full border border-border p-2.5 rounded text-xs font-semibold text-foreground flex items-center justify-between hover:bg-muted cursor-pointer"
              >
                <span className="flex items-center gap-2"><Megaphone className="size-4 text-purple-600" /> Marketing Tools</span>
                <span className="text-brand">→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
