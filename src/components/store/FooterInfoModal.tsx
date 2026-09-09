import * as React from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Building2,
  Send,
  CheckCircle2,
  HelpCircle,
  FileText,
  Lock,
  Briefcase,
  Megaphone,
  Gift,
  ExternalLink,
  ChevronRight,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";

export type FooterSectionKey =
  | "Contact Us"
  | "About Us"
  | "Careers"
  | "Press"
  | "Payments"
  | "Shipping"
  | "Cancellation"
  | "Returns"
  | "Return Policy"
  | "Terms of Use"
  | "Privacy"
  | "Security"
  | "Become a Seller"
  | "Seller Hub"
  | "Advertise"
  | "Gift Cards";

export function FooterInfoModal({
  item,
  open,
  onOpenChange,
}: {
  item: FooterSectionKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  // Contact Us form states
  const [contactForm, setContactForm] = React.useState({
    name: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Gift Card form state
  const [giftCardAmount, setGiftCardAmount] = React.useState(1000);
  const [giftRecipient, setGiftRecipient] = React.useState("");

  if (!item) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Support ticket created!", {
        description: `Thank you ${contactForm.name}, our 24x7 team will reply to ${contactForm.email} within 2 hours.`,
      });
      setContactForm({ name: "", email: "", subject: "Order Inquiry", message: "" });
      onOpenChange(false);
    }, 800);
  };

  const handleBuyGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRecipient.trim()) {
      toast.error("Please enter recipient email");
      return;
    }
    toast.success(`₹${giftCardAmount} Gift Card Sent!`, {
      description: `Voucher code sent to ${giftRecipient}. Check inbox for voucher ID.`,
    });
    setGiftRecipient("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/40 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              {item === "Contact Us" && <Phone className="size-5" />}
              {item === "About Us" && <Building2 className="size-5" />}
              {item === "Careers" && <Briefcase className="size-5" />}
              {item === "Press" && <Megaphone className="size-5" />}
              {item === "Payments" && <CreditCard className="size-5" />}
              {item === "Shipping" && <Truck className="size-5" />}
              {(item === "Cancellation" || item === "Returns" || item === "Return Policy") && (
                <RotateCcw className="size-5" />
              )}
              {item === "Terms of Use" && <FileText className="size-5" />}
              {(item === "Privacy" || item === "Security") && <Lock className="size-5" />}
              {item === "Become a Seller" && <Store className="size-5" />}
              {item === "Seller Hub" && <Building2 className="size-5" />}
              {item === "Advertise" && <Megaphone className="size-5" />}
              {item === "Gift Cards" && <Gift className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">{item}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official information & customer self-service portal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm text-foreground">
          {/* 1. CONTACT US */}
          {item === "Contact Us" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                  <Phone className="size-5 text-accent mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">24x7 Helpline</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">1800-202-9898</p>
                  <span className="inline-block mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Toll Free
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                  <Mail className="size-5 text-accent mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">Email Support</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">support@kartly.com</p>
                  <span className="inline-block mt-1 text-[10px] text-brand font-semibold">
                    Reply in &lt; 2 hrs
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                  <Clock className="size-5 text-accent mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">Operating Hours</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Mon - Sun</p>
                  <span className="inline-block mt-1 text-[10px] text-muted-foreground font-semibold">
                    Always Open
                  </span>
                </div>
              </div>

              {/* Quick Message Form */}
              <form onSubmit={handleContactSubmit} className="rounded-xl border border-border p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Send a Direct Message
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:border-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:border-accent outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:border-accent outline-none"
                    >
                      <option value="Order Inquiry">Order Status & Delivery Delay</option>
                      <option value="Payment / Refund">Payment / Refund Status</option>
                      <option value="Return / Replacement">Return or Replacement Request</option>
                      <option value="Seller Support">Seller & Partnership Inquiry</option>
                      <option value="General Feedback">General Feedback or Bug Report</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Message Details
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please describe how we can help you..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:border-accent outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-accent py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                </button>
              </form>
            </div>
          )}

          {/* 2. ABOUT US */}
          {item === "About Us" && (
            <div className="space-y-4 leading-relaxed">
              <p className="text-muted-foreground">
                <strong className="text-foreground font-bold">Kartly</strong> is India’s premier digital retail platform, empowering over 50 million shoppers with genuine branded products, verified sellers, and unmatched customer convenience.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <p className="text-lg font-black text-accent">50M+</p>
                  <p className="text-[11px] text-muted-foreground">Happy Customers</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <p className="text-lg font-black text-accent">19,000+</p>
                  <p className="text-[11px] text-muted-foreground">Pincodes Served</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <p className="text-lg font-black text-accent">100%</p>
                  <p className="text-[11px] text-muted-foreground">Original Products</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <p className="text-lg font-black text-accent">2-Day</p>
                  <p className="text-[11px] text-muted-foreground">Express Dispatch</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Founded with the vision of making quality commerce transparent, accessible, and fast, our state-of-the-art logistics hubs in Bengaluru, Hyderabad, Mumbai, and Delhi ensure lightning-fast doorstep delivery nationwide.
              </p>
            </div>
          )}

          {/* 3. CAREERS */}
          {item === "Careers" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Build the future of Indian e-commerce with world-class engineering, design, and product leaders.
              </p>
              <div className="space-y-2.5">
                {[
                  { title: "Senior Full Stack Engineer (React / Node.js)", team: "Core Platform", loc: "Bengaluru / Remote" },
                  { title: "Product Designer (UI/UX & Design Systems)", team: "Design Ops", loc: "Hyderabad" },
                  { title: "Logistics Optimization Lead", team: "Supply Chain", loc: "Mumbai" },
                  { title: "Mobile Application Developer (React Native / iOS)", team: "Consumer Apps", loc: "Remote" },
                ].map((job) => (
                  <div key={job.title} className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-accent/50 transition-all">
                    <div>
                      <p className="text-xs font-bold text-foreground">{job.title}</p>
                      <p className="text-[11px] text-muted-foreground">{job.team} • {job.loc}</p>
                    </div>
                    <button
                      onClick={() => toast.success("Application started!", { description: `Applied for ${job.title}. Email your CV to careers@kartly.com` })}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PAYMENTS */}
          {item === "Payments" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Kartly supports instant, zero-friction, and 100% secure payment gateways certified with RBI regulations and PCI-DSS Level 1 security.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: "UPI & QR", sub: "PhonePe, GPay, Paytm, BHIM" },
                  { name: "Credit & Debit Cards", sub: "Visa, Mastercard, RuPay" },
                  { name: "Net Banking", sub: "50+ Major Indian Banks" },
                  { name: "Cash on Delivery", sub: "Pay upon doorstep delivery" },
                  { name: "Easy No-Cost EMI", sub: "Credit card & Bajaj Finserv" },
                  { name: "Kartly Wallet", sub: "Instant 1-click refund balance" },
                ].map((method) => (
                  <div key={method.name} className="rounded-xl border border-border p-3">
                    <p className="text-xs font-bold text-foreground">{method.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{method.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <ShieldCheck className="size-4 shrink-0" />
                256-Bit Bank Grade SSL Encryption active on every transaction.
              </div>
            </div>
          )}

          {/* 5. SHIPPING & DELIVERY */}
          {item === "Shipping" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="font-bold">Standard Delivery:</span>
                  <span className="text-muted-foreground">2 - 4 business days across 19,000+ pincodes</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="font-bold">Express Metro Delivery:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Next Day in Bengaluru, Hyderabad, Mumbai, Delhi</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <span className="font-bold">Delivery Fee:</span>
                  <span className="font-bold text-accent">FREE on orders above ₹499 (Flat ₹40 below ₹499)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                All packages are dispatched via certified express courier partners with SMS notifications and live doorstep map tracking.
              </p>
            </div>
          )}

          {/* 6. CANCELLATION & RETURNS */}
          {(item === "Cancellation" || item === "Returns" || item === "Return Policy") && (
            <div className="space-y-4">
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5 space-y-1">
                <p className="text-xs font-bold text-foreground">7-Day Hassle-Free Return Policy</p>
                <p className="text-[11px] text-muted-foreground">
                  If you receive a defective, damaged, or unsatisfactory product, initiate a return from "My Orders" for 100% money back or instant replacement.
                </p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span><strong>Doorstep Pickup:</strong> Free pickup by our logistics executive directly at your address.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span><strong>Instant Refund:</strong> UPI/Wallet refunds are processed within 2 hours of package verification.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span><strong>Pre-Dispatch Cancellation:</strong> 1-click zero-fee cancellation anytime before shipping.</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. TERMS OF USE, PRIVACY & SECURITY */}
          {(item === "Terms of Use" || item === "Privacy" || item === "Security") && (
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Kartly is dedicated to customer trust, data integrity, and authentic trading standards under Indian consumer protection laws.
              </p>
              <div className="rounded-xl border border-border p-3 space-y-1 bg-muted/20 text-foreground">
                <p className="font-bold">Key Protections & Privacy Commitments:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                  <li>We never sell or distribute your personal data to third-party advertisers.</li>
                  <li>Payment details are encrypted using tokenization and never stored on plain servers.</li>
                  <li>100% Buyer Protection Guarantee on all fulfilled deliveries.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 8. SELL / BECOME A SELLER / SELLER HUB */}
          {(item === "Become a Seller" || item === "Seller Hub" || item === "Advertise") && (
            <div className="space-y-4">
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Store className="size-5 text-brand" />
                  <h3 className="text-sm font-bold text-foreground">Sell on Kartly & Grow 10x</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reach 50M+ customers across India with 0% commission for first 30 days, doorstep pickup, and next-day settlements.
                </p>
                <button
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/seller" });
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-brand-deep transition-colors cursor-pointer"
                >
                  Go to Seller Registration Portal <ExternalLink className="size-3" />
                </button>
              </div>
            </div>
          )}

          {/* 9. GIFT CARDS */}
          {item === "Gift Cards" && (
            <form onSubmit={handleBuyGiftCard} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Send an instant digital Kartly e-Gift Card redeemable on millions of products across Fashion, Electronics, Mobiles & Home.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Select Card Value
                </label>
                <div className="flex gap-2">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGiftCardAmount(amt)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all cursor-pointer ${
                        giftCardAmount === amt
                          ? "border-accent bg-accent/15 text-accent ring-1 ring-accent"
                          : "border-border bg-card text-foreground hover:border-accent/40"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. friend@example.com"
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-accent outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-accent py-2.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Send ₹{giftCardAmount} Gift Card Now
              </button>
            </form>
          )}

          {/* 10. PRESS */}
          {item === "Press" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Latest media announcements, funding releases, and retail innovations from Kartly.
              </p>
              <div className="space-y-2">
                {[
                  { title: "Kartly Expands Same-Day Delivery to 15 Tier-1 Metros in India", date: "Aug 2026", source: "Economic Times" },
                  { title: "Kartly Introduces AI Visual Camera Search and Voice Assistance", date: "Jul 2026", source: "TechCrunch" },
                  { title: "Over 100,000 Micro-Sellers Onboarded onto Kartly Direct Hub", date: "May 2026", source: "LiveMint" },
                ].map((art) => (
                  <div key={art.title} className="rounded-xl border border-border p-3 text-xs hover:border-accent/40 transition-colors">
                    <p className="font-bold text-foreground">{art.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{art.source} • {art.date}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                For press and media queries, reach out to <strong className="text-foreground">press@kartly.com</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
          <span>Kartly Customer Trust & Policy Center</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="font-bold text-accent hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
