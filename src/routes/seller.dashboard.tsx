import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Store, Package, TrendingUp, DollarSign, RefreshCw, CheckCircle2, LogOut, Plus } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { products, inr } from "@/components/store/catalog";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/seller/dashboard")({
  component: SellerDashboardRoute,
});

function SellerDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="SELLER">
      <SellerDashboardPage />
    </RequirePortalAuth>
  );
}

function SellerDashboardPage() {
  const { user, logout } = useEnterpriseAuth();

  const handleAddProduct = () => {
    toast.success("New Product Draft Created", { description: "Added to seller catalog moderation queue." });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Seller Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xl flex items-center justify-center border border-purple-200">
              <Store className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.storeName || "Apex Digital Hub"}</h1>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Store Approved & Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Seller ID: SEL-89410 · KYC Status: VERIFIED</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddProduct}
              className="bg-brand text-primary-foreground px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
            >
              <Plus className="size-3.5" /> Add New Product
            </button>
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Sales & Inventory Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Revenue</span>
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">₹4,82,900</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Active Products</span>
              <Package className="size-4 text-purple-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{products.length + 14}</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Pending Orders</span>
              <RefreshCw className="size-4 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-foreground">18 orders</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Next Payout</span>
              <DollarSign className="size-4 text-brand" />
            </div>
            <p className="text-xl font-extrabold text-brand">₹64,200</p>
          </div>
        </div>

        {/* Product Inventory Control List */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
            <span>Store Products & Inventory Stock</span>
            <span className="text-xs text-muted-foreground font-medium">Real-time Stock Tracking</span>
          </h2>

          <div className="divide-y divide-border text-xs">
            {products.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.image} alt={p.title} className="size-10 object-contain bg-muted p-1 rounded shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground line-clamp-1">{p.title}</p>
                    <p className="text-muted-foreground text-[11px]">SKU: APX-PROD-00{idx + 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="font-bold text-foreground">{inr(p.price)}</p>
                    <p className="text-emerald-600 font-semibold text-[11px]">In Stock ({42 - idx * 8} units)</p>
                  </div>

                  <button
                    onClick={() => toast.success(`Stock updated for ${p.title}`)}
                    className="border border-border px-2.5 py-1 rounded text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Update Stock
                  </button>
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
