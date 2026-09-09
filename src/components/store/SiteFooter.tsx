import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Mail,
  Send,
  HelpCircle,
  ExternalLink,
  Store,
  CheckCircle2,
} from "lucide-react";
import { FooterInfoModal, type FooterSectionKey } from "./FooterInfoModal";

const columns: { title: string; links: FooterSectionKey[] }[] = [
  { title: "About", links: ["Contact Us", "About Us", "Careers", "Press"] },
  { title: "Help", links: ["Payments", "Shipping", "Cancellation", "Returns"] },
  { title: "Policy", links: ["Return Policy", "Terms of Use", "Privacy", "Security"] },
  { title: "Sell", links: ["Become a Seller", "Seller Hub", "Advertise", "Gift Cards"] },
];

export function SiteFooter() {
  const navigate = useNavigate();
  const [modalItem, setModalItem] = React.useState<FooterSectionKey | null>(null);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  const handleLinkClick = (link: FooterSectionKey) => {
    if (link === "Become a Seller") {
      navigate({ to: "/seller" });
      return;
    }
    setModalItem(link);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed to Kartly VIP Perks! 🎉", {
      description: `Exclusive discounts & early flash sales will be sent to ${newsletterEmail}`,
    });
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-brand-deep text-primary-foreground font-sans">
      {/* Top Value Propositions & Trust Highlights */}
      <div className="border-b border-primary-foreground/10 bg-brand-deep/80">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-foreground text-primary-foreground">100% Genuine</p>
              <p className="text-[11px] opacity-70">Direct from verified brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Truck className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-foreground text-primary-foreground">Free Shipping</p>
              <p className="text-[11px] opacity-70">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <RotateCcw className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-foreground text-primary-foreground">7-Day Returns</p>
              <p className="text-[11px] opacity-70">Hassle-free doorstep pickup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <CreditCard className="size-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-foreground text-primary-foreground">Secure Payments</p>
              <p className="text-[11px] opacity-70">256-Bit SSL encrypted UPI & cards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Columns & Newsletter Section */}
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        {/* Dynamic Nav Columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
              <span>{col.title}</span>
            </h2>
            <ul className="mt-4 space-y-2.5 text-xs opacity-90">
              {col.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    className="group flex items-center gap-1 text-left hover:text-accent hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>{link}</span>
                    {link === "Become a Seller" && (
                      <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent">
                        NEW
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter / Exclusive Deals Box */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
            <span>STAY UPDATED</span>
          </h2>
          <p className="mt-4 text-xs opacity-75 leading-relaxed">
            Get instant updates on daily flash sales, exclusive discount coupons, and new tech launches.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-3 space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full rounded-lg border border-primary-foreground/20 bg-background/10 px-3 py-2 text-xs text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Send className="size-3" />
              Subscribe for Deals
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-primary-foreground/15 bg-brand-deep/95">
        <div className="mx-auto flex max-w-[1400px] flex-col sm:flex-row items-center justify-between gap-3 px-4 py-5 text-xs opacity-70">
          <p>© 2026 Kartly Retail Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setModalItem("Privacy")}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setModalItem("Terms of Use")}
              className="hover:underline cursor-pointer"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setModalItem("Security")}
              className="hover:underline cursor-pointer"
            >
              Security
            </button>
            <span>•</span>
            <span className="font-semibold text-accent opacity-100">🇮🇳 India</span>
          </div>
        </div>
      </div>

      {/* Footer Info Modal */}
      <FooterInfoModal
        item={modalItem}
        open={Boolean(modalItem)}
        onOpenChange={(open) => {
          if (!open) setModalItem(null);
        }}
      />
    </footer>
  );
}
