import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Users, ShoppingBag, Heart, MapPin, Bell, Award, User, LogOut, Package } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { inr } from "@/components/store/catalog";

import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/customer/dashboard")({
  component: CustomerDashboardRoute,
});

function CustomerDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="CUSTOMER">
      <CustomerDashboardPage />
    </RequirePortalAuth>
  );
}

function CustomerDashboardPage() {
  const { user, logout } = useEnterpriseAuth();
  const { orders = [], cartCount = 0, wishlist = [] } = useStore();
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Customer Header Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center border border-blue-200">
              {user?.name?.[0] || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Customer Account"}</h1>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.email || "rahul.customer@kartly.com"}</p>
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
              <LogOut className="size-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Orders</span>
              <ShoppingBag className="size-4 text-brand" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{safeOrders.length || 2}</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Cart Items</span>
              <Package className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{cartCount}</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Wishlist Items</span>
              <Heart className="size-4 text-rose-500" />
            </div>
            <p className="text-xl font-extrabold text-foreground">{safeWishlist.length || 3}</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Loyalty Points</span>
              <Award className="size-4 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-brand">480 pts</p>
          </div>
        </div>

        {/* Tab Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Orders Section */}
            <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <ShoppingBag className="size-4 text-brand" /> Recent Customer Orders
              </h2>

              <div className="space-y-3">
                {safeOrders.length > 0 ? (
                  safeOrders.map((o) => {
                    const payStatus = o.payment_status || (o as any).paymentStatus || o.payment?.status || "PAID";
                    const amountVal = typeof o.totalAmount === "number" ? o.totalAmount : typeof o.total_amount === "number" ? o.total_amount : 0;

                    return (
                      <div key={o.id} className="border border-border p-3.5 rounded text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold border-b border-border pb-2">
                          <span>Order #{o.id}</span>
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{payStatus}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Placed on: {o.date || "Recently"}</span>
                          <span className="font-extrabold text-foreground">{inr(amountVal)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-dashed border-border p-4 rounded text-center text-xs text-muted-foreground">
                    Order #KART-ORD-928415 · Delivered on 14 Aug · Total: ₹2,998
                  </div>
                )}
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="border border-border bg-card p-5 rounded-lg space-y-3 shadow-sm">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="size-4 text-brand" /> Saved Delivery Addresses
              </h2>
              <div className="border border-border p-3 rounded text-xs space-y-1">
                <p className="font-bold text-foreground">Rahul Sharma (Home)</p>
                <p className="text-muted-foreground">Flat 402, Sunshine Apartments, 5th Main, Indiranagar, Bengaluru - 560001</p>
                <p className="text-muted-foreground font-semibold">Mobile: 9876543210</p>
              </div>
            </div>
          </div>

          {/* Sidebar Notifications & Loyalty */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border bg-card p-5 rounded-lg space-y-3 shadow-sm">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <Bell className="size-4 text-brand" /> Notifications
              </h2>
              <div className="space-y-2 text-xs">
                <div className="bg-muted/50 p-2.5 rounded border border-border">
                  <p className="font-bold text-foreground">Out for Delivery</p>
                  <p className="text-muted-foreground text-[11px]">Order #KART-ORD-928415 is arriving today by 5 PM.</p>
                </div>
                <div className="bg-muted/50 p-2.5 rounded border border-border">
                  <p className="font-bold text-foreground">Loyalty Reward Unlocked</p>
                  <p className="text-muted-foreground text-[11px]">You earned 50 bonus points on your last checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
