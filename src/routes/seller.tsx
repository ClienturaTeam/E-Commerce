import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import * as React from "react";
import { Store, TrendingUp, ShieldCheck, Truck, Users, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { toast } from "sonner";

export const Route = createFileRoute("/seller")({
  component: SellerRoute,
});

function SellerRoute() {
  const { pathname } = useLocation();
  if (pathname === "/seller" || pathname === "/seller/") {
    return (
      <StoreProvider>
        <SellerPage />
      </StoreProvider>
    );
  }
  return <Outlet />;
}


function SellerPage() {
  const [businessName, setBusinessName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [category, setCategory] = React.useState("Electronics");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration Received!", {
      description: `Thank you ${businessName}. Our seller onboarding team will contact you within 24 hours.`,
    });
    setBusinessName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-4 py-10 space-y-12">
        {/* Seller Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/20 via-card to-card p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-primary-foreground uppercase tracking-wider">
              <Store className="size-3.5" />
              Kartly Seller Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
              Sell to Millions of Customers Across India
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Grow your business with 0% commission for 30 days, fast 7-day payment cycles, and nationwide logistics delivery.
            </p>
          </div>

          {/* Registration Box */}
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-extrabold text-foreground">Register as a Seller</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Enterprises"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="seller@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Primary Product Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Electronics">Electronics & Gadgets</option>
                  <option value="Mobiles">Mobiles & Accessories</option>
                  <option value="Home">Home & Kitchen</option>
                  <option value="Beauty">Beauty & Personal Care</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-brand py-3 text-xs font-extrabold uppercase tracking-wider text-primary-foreground hover:bg-brand-deep cursor-pointer shadow-md transition-colors mt-2"
              >
                Start Selling Now
              </button>
            </form>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-2 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-2">
              <TrendingUp className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Lowest Commission</h3>
            <p className="text-xs text-muted-foreground">
              Enjoy 0% commission on select categories and maximize your profit margins.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-2">
              <Truck className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Fast Logistics Support</h3>
            <p className="text-xs text-muted-foreground">
              We pick up products directly from your doorstep and deliver across 19,000+ pincodes.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2 text-center shadow-2xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand mb-2">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Timely 7-Day Payments</h3>
            <p className="text-xs text-muted-foreground">
              Get payments deposited directly into your bank account within 7 days of order dispatch.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
