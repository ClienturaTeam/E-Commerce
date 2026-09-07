import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Truck, MapPin, CheckCircle2, DollarSign, Navigation, Upload, LogOut, Phone } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/delivery/dashboard")({
  component: DeliveryDashboardRoute,
});

function DeliveryDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="DELIVERY">
      <DeliveryDashboardPage />
    </RequirePortalAuth>
  );
}

function DeliveryDashboardPage() {
  const { user, logout } = useEnterpriseAuth();

  const [deliveryOtp, setDeliveryOtp] = React.useState("");
  const [activeStep, setActiveStep] = React.useState<"PICKUP" | "NAVIGATE" | "DELIVER" | "CONFIRMED">("NAVIGATE");

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOtp || deliveryOtp.length < 4) {
      toast.error("Enter 4-digit Customer OTP");
      return;
    }

    setActiveStep("CONFIRMED");
    toast.success("Delivery Confirmed!", { description: "Order #KART-ORD-928415 marked delivered." });
  };

  const handleUploadProof = () => {
    toast.success("Doorstep Photo Uploaded", { description: "Proof attached to Order #KART-ORD-928415" });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Delivery Partner Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-teal-100 text-teal-800 font-extrabold text-xl flex items-center justify-center border border-teal-300">
              <Truck className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Vikram Singh (Rider #892)"}</h1>
                <span className="text-xs bg-teal-100 text-teal-900 font-bold px-2.5 py-0.5 rounded">
                  Status: ON DUTY
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Vehicle: Electric Two-Wheeler · Hub: Indiranagar Hub</p>
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
              <LogOut className="size-3.5" /> Off Duty
            </button>
          </div>
        </div>

        {/* Rider Earnings Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Today's Earnings</span>
              <DollarSign className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">₹1,450</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Completed Drops</span>
              <CheckCircle2 className="size-4 text-teal-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">12 drops</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Active Drop</span>
              <Navigation className="size-4 text-brand" />
            </div>
            <p className="text-xl font-extrabold text-brand">1 Pending</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Delivery Rating</span>
              <span className="text-amber-500 font-bold text-xs">★ 4.92</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">Top Rider</p>
          </div>
        </div>

        {/* Active Drop & OTP Confirmation */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">Active Order Drop: #KART-ORD-928415</h2>
              <p className="text-xs text-muted-foreground">Customer: Rahul Sharma · Contact: 9876543210</p>
            </div>
            <span className="text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded">
              Current Step: {activeStep}
            </span>
          </div>

          {/* Location details */}
          <div className="bg-muted/50 p-4 rounded border border-border space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Flat 402, Sunshine Apartments, 5th Main, Indiranagar</p>
                <p className="text-muted-foreground">Bengaluru, Karnataka - 560001</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="tel:9876543210"
                className="bg-brand text-primary-foreground px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 hover:opacity-90"
              >
                <Phone className="size-3" /> Call Customer
              </a>

              <button
                onClick={() => toast("Live GPS Route Opened in Maps")}
                className="border border-border px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 hover:bg-muted cursor-pointer"
              >
                <Navigation className="size-3 text-emerald-600" /> Start GPS Route
              </button>

              <button
                onClick={handleUploadProof}
                className="border border-border px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 hover:bg-muted cursor-pointer"
              >
                <Upload className="size-3 text-purple-600" /> Upload Delivery Proof Photo
              </button>
            </div>
          </div>

          {/* OTP Confirmation Form */}
          {activeStep !== "CONFIRMED" ? (
            <form onSubmit={handleConfirmDelivery} className="border-t border-border pt-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-foreground mb-1">
                  Enter 4-Digit Delivery OTP received by Customer
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 7492"
                  value={deliveryOtp}
                  onChange={(e) => setDeliveryOtp(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm font-mono tracking-widest text-foreground outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-teal-700 text-white px-6 py-2.5 rounded text-xs font-extrabold hover:opacity-90 cursor-pointer shrink-0 mt-3 sm:mt-5"
              >
                Confirm Drop & Complete Order
              </button>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded text-center text-xs font-bold space-y-1">
              <CheckCircle2 className="size-6 text-emerald-600 mx-auto" />
              <p className="text-sm">Order #KART-ORD-928415 Delivered Successfully!</p>
              <p className="text-emerald-800 font-normal">Payout of ₹85 credited to your daily wallet.</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
