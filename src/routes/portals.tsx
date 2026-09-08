import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import {
  Users,
  Store,
  ShieldCheck,
  Crown,
  PackageCheck,
  Truck,
  Headphones,
  DollarSign,
  ArrowRight,
  Lock,
  Globe,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";

export const Route = createFileRoute("/portals")({
  component: PortalsRoute,
});

function PortalsRoute() {
  return <PortalsPage />;
}

function PortalsPage() {
  const { user, logout } = useEnterpriseAuth();

  const portalsList = [
    {
      id: "customer",
      title: "1. Customer Portal",
      description: "Email/Password, Mobile+OTP, Google & Apple OAuth, Wishlist, Orders, Profile & Loyalty Points.",
      loginUrl: "/login?role=customer",
      dashboardUrl: "/customer/dashboard",
      icon: Users,
      badge: "Public Access",
      color: "border-blue-500/30 bg-blue-50/40 text-blue-700",
    },
    {
      id: "seller",
      title: "2. Seller Portal",
      description: "KYC Verification, Store Approval Status, Device Tracking, Inventory, Sales Analytics & Payouts.",
      loginUrl: "/login?role=seller",
      dashboardUrl: "/seller/dashboard",
      icon: Store,
      badge: "MFA Enforced",
      color: "border-purple-500/30 bg-purple-50/40 text-purple-700",
    },
    {
      id: "admin",
      title: "3. Admin Portal",
      description: "CAPTCHA Security, Users Moderation, Seller Approvals, Product Controls & Marketing Tools.",
      loginUrl: "/login?role=admin",
      dashboardUrl: "/admin/dashboard",
      icon: ShieldCheck,
      badge: "CAPTCHA + MFA",
      color: "border-amber-500/30 bg-amber-50/40 text-amber-700",
    },
    {
      id: "warehouse",
      title: "4. Warehouse Staff Portal",
      description: "Station Badge Auth, Barcode Scanner Integration, Pick → Pack → Dispatch Queue Workflow.",
      loginUrl: "/login?role=warehouse",
      dashboardUrl: "/warehouse/dashboard",
      icon: PackageCheck,
      badge: "Badge ID Login",
      color: "border-emerald-500/30 bg-emerald-50/40 text-emerald-700",
    },
    {
      id: "delivery",
      title: "5. Delivery Partner Portal",
      description: "Mobile-First OTP Auth, Live Map Navigation, OTP Delivery Confirmation & Earnings Tracking.",
      loginUrl: "/login?role=delivery",
      dashboardUrl: "/delivery/dashboard",
      icon: Truck,
      badge: "Mobile OTP",
      color: "border-teal-500/30 bg-teal-50/40 text-teal-700",
    },
    {
      id: "support",
      title: "6. Customer Support Portal",
      description: "Agent Desk Login, Ticket Queue (Open → Resolve → Close), Live Chat & Refund Processing.",
      loginUrl: "/login?role=support",
      dashboardUrl: "/support/dashboard",
      icon: Headphones,
      badge: "Agent Helpdesk",
      color: "border-indigo-500/30 bg-indigo-50/40 text-indigo-700",
    },
    {
      id: "finance",
      title: "7. Finance Team Portal",
      description: "Secure Financial Auth, Payment Reconciliation, Seller Settlements, GST Reports & Revenue Tracking.",
      loginUrl: "/login?role=finance",
      dashboardUrl: "/finance/dashboard",
      icon: DollarSign,
      badge: "Audit Logged",
      color: "border-emerald-600/30 bg-emerald-50/50 text-emerald-800",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-8">
        {/* Banner Header */}
        <div className="border border-border bg-card p-6 sm:p-8 rounded-lg space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand/10 text-brand px-2.5 py-1 rounded mb-2">
                <Globe className="size-3.5" /> Enterprise Multi-Vendor Architecture
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Enterprise Multi-Portal Login Directory
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                7 Specialized Role Portals powered by a Centralized JWT Authentication System.
              </p>
            </div>

            {user ? (
              <div className="bg-muted p-3.5 rounded text-xs space-y-1 shrink-0">
                <p className="font-bold text-foreground">Active Session: {user.name}</p>
                <p className="text-brand font-semibold">Role: {user.role}</p>
                <button
                  onClick={logout}
                  className="text-destructive font-bold underline mt-1 block"
                >
                  Logout Session
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted p-3 rounded">
                <Lock className="size-4 text-emerald-600 shrink-0" />
                <span>Centralized JWT Auth Service Active</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground pt-2">
            <div>✓ Single Sign-On Architecture</div>
            <div>✓ Multi-Factor Authentication</div>
            <div>✓ Role-Based Access Control</div>
            <div>✓ Real-time Audit Logging</div>
          </div>
        </div>

        {/* Portals Grid (All 8 Included) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {portalsList.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="border border-border bg-card p-5 rounded-lg flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-md bg-brand/5 text-brand group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${p.color}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-foreground">{p.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <Link
                    to={p.loginUrl as any}
                    className="w-full bg-brand px-3 py-2 text-center text-xs font-bold text-primary-foreground rounded transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    Open Login Portal <ArrowRight className="size-3.5" />
                  </Link>

                  <Link
                    to={p.dashboardUrl as any}
                    className="w-full border border-border px-3 py-1.5 text-center text-xs font-semibold text-foreground rounded hover:border-brand block"
                  >
                    Direct Dashboard View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
