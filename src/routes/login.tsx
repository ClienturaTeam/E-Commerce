import { createFileRoute, Navigate, useSearch, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  Users,
  Store,
  ShieldCheck,
  PackageCheck,
  Truck,
  Headphones,
  DollarSign,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { useEnterpriseAuth, UserRole } from "@/components/auth/enterprise-auth-context";
import { useStore } from "@/components/store/store-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search.role as string) || "CUSTOMER",
  }),
  component: UnifiedLoginRoute,
});

function UnifiedLoginRoute() {
  const { role: searchRole } = useSearch({ from: "/login" });
  return <UnifiedLoginPage initialRole={searchRole} />;
}

// 7 Non-SuperAdmin Portal Configuration
const PORTAL_ROLES: {
  role: UserRole;
  label: string;
  description: string;
  dashboardPath: string;
  icon: any;
  badgeBg: string;
  demoCredentials: { email: string; name: string };
  tagline: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
}[] = [
  {
    role: "CUSTOMER",
    label: "Customer",
    description: "Personal shopping, wishlist, cart, order history & loyalty points.",
    dashboardPath: "/customer/dashboard",
    icon: Users,
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    demoCredentials: { email: "customer@kartly.com", name: "Rahul Sharma" },
    tagline: "Your Ultimate Shopping Experience Begins Here",
    bullet1: "Track active orders & delivery status in real-time",
    bullet2: "Save favorite wishlist items across all devices",
    bullet3: "Earn instant 10% loyalty reward points on purchases",
  },
  {
    role: "SELLER",
    label: "Seller",
    description: "Store inventory, sales analytics, product listings & payouts.",
    dashboardPath: "/seller/dashboard",
    icon: Store,
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    demoCredentials: { email: "seller@kartly.com", name: "Apex Retailers Pvt Ltd" },
    tagline: "Empower Your E-Commerce Business & Scale Payouts",
    bullet1: "Manage inventory, stock levels & product catalogs",
    bullet2: "0% commission for the first 30 days of onboarding",
    bullet3: "Automated 7-day NEFT/RTGS bank disbursals",
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "User moderation, seller approvals, catalog oversight & controls.",
    dashboardPath: "/admin/dashboard",
    icon: ShieldCheck,
    badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    demoCredentials: { email: "admin@kartly.com", name: "System Admin" },
    tagline: "Level-2 Product Moderation & Oversight",
    bullet1: "Review & approve seller store onboarding requests",
    bullet2: "Moderate product listings & user moderation queues",
    bullet3: "Export platform analytics & marketing campaign tools",
  },
  {
    role: "WAREHOUSE",
    label: "Warehouse Staff",
    description: "Pick → Pack → Dispatch queue & inventory barcode scanner.",
    dashboardPath: "/warehouse/dashboard",
    icon: PackageCheck,
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    demoCredentials: { email: "warehouse@kartly.com", name: "Rajesh Kumar (WH-BLR-04)" },
    tagline: "Smart Packing & Live Warehouse Dispatch Queue",
    bullet1: "Barcode scanner integration & fulfillment tracking",
    bullet2: "Live Pick → Pack → Dispatch workflow pipeline",
    bullet3: "Station WH-BLR-04 packing station synchronization",
  },
  {
    role: "DELIVERY",
    label: "Delivery Partner",
    description: "Live GPS navigation, route maps, OTP delivery & earnings.",
    dashboardPath: "/delivery/dashboard",
    icon: Truck,
    badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
    demoCredentials: { email: "delivery@kartly.com", name: "Vikram Singh (Rider #892)" },
    tagline: "Express Delivery Rider & GPS Navigation Desk",
    bullet1: "Turn-by-turn GPS route navigation to customer addresses",
    bullet2: "Verify 4-digit OTP delivery confirmation codes",
    bullet3: "Track daily drop earnings & performance metrics",
  },
  {
    role: "SUPPORT",
    label: "Customer Support",
    description: "Ticket resolution queue, live customer chat desk & refunds.",
    dashboardPath: "/support/dashboard",
    icon: Headphones,
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    demoCredentials: { email: "support@kartly.com", name: "Ananya Roy (Senior Executive)" },
    tagline: "Tier-2 Customer Helpdesk & Ticket Escalations",
    bullet1: "Resolve customer inquiries & size/item exchange tickets",
    bullet2: "Process instant wallet or UPI refund transactions",
    bullet3: "Live customer chat desk support integration",
  },
  {
    role: "FINANCE",
    label: "Finance Team",
    description: "Seller settlements, GST compliance filings & revenue tracking.",
    dashboardPath: "/finance/dashboard",
    icon: DollarSign,
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    demoCredentials: { email: "finance@kartly.com", name: "Finance Comptroller" },
    tagline: "Financial Analytics, GST Filings & Payout Reconciliations",
    bullet1: "Automatic NEFT/RTGS gateway seller settlements",
    bullet2: "Audit GST liability calculation & export compliance reports",
    bullet3: "99.98% financial transaction reconciliation accuracy",
  },
];

function UnifiedLoginPage({ initialRole }: { initialRole: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, register } = useEnterpriseAuth();
  const { user: storeUser, signIn: storeSignIn } = useStore();

  // Selected Role state (Defaulting to Customer or passed param)
  const normalizedInitial = (initialRole || "").toUpperCase().replace("-", "_");
  const defaultPortal =
    PORTAL_ROLES.find((p) => p.role === normalizedInitial) || PORTAL_ROLES[0];
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultPortal.role);

  const activePortal =
    PORTAL_ROLES.find((p) => p.role === selectedRole) || PORTAL_ROLES[0];

  // ----------------------------------------------------
  // SESSION CHECK: If already logged in, redirect directly to portal dashboard
  // ----------------------------------------------------
  if (isAuthenticated && user) {
    const userRoleObj = PORTAL_ROLES.find((p) => p.role === user.role) || PORTAL_ROLES[0];
    return <Navigate to={userRoleObj.dashboardPath as any} replace />;
  }
  if (storeUser && storeUser.isAuth) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Form State
  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Inputs
  const [emailOrPhone, setEmailOrPhone] = React.useState(activePortal.demoCredentials.email);
  const [password, setPassword] = React.useState("password123");

  // Sign Up Extra State
  const [fullName, setFullName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");

  // Update defaults when role selection changes
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
    const target = PORTAL_ROLES.find((p) => p.role === newRole) || PORTAL_ROLES[0];
    setEmailOrPhone(target.demoCredentials.email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        emailOrPhone,
        password,
        role: selectedRole,
      });

      if (res.success) {
        // Sync store context if Customer
        if (selectedRole === "CUSTOMER") {
          const userName = emailOrPhone.split("@")[0] || "Customer";
          storeSignIn(userName, emailOrPhone, "9876543210");
        }
        toast.success(`Welcome to ${activePortal.label} Portal!`);
        navigate({ to: activePortal.dashboardPath as any });
      } else {
        setErrorMessage(res.message || "Incorrect credentials. Please verify your details.");
      }
    } catch {
      setErrorMessage("Authentication failed. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await register({
        name: fullName || emailOrPhone.split("@")[0],
        email: emailOrPhone,
        phone: regPhone || "9876543210",
        password,
        role: selectedRole,
      });

      if (res.success) {
        if (selectedRole === "CUSTOMER") {
          storeSignIn(fullName || "Customer", emailOrPhone, regPhone || "9876543210");
        }
        navigate({ to: activePortal.dashboardPath as any });
      } else {
        setErrorMessage(res.message || "Registration failed.");
      }
    } catch {
      setErrorMessage("Registration error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await login({
      emailOrPhone: activePortal.demoCredentials.email,
      password: "password123",
      role: selectedRole,
    });
    setIsSubmitting(false);
    if (res.success) {
      if (selectedRole === "CUSTOMER") {
        storeSignIn(activePortal.demoCredentials.name, activePortal.demoCredentials.email, "9876543210");
      }
      navigate({ to: activePortal.dashboardPath as any });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden font-sans text-slate-800 flex flex-col justify-between">
      {/* Soft Ambient Mesh */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-gradient-to-tr from-sky-200/50 via-purple-200/40 to-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-[600px] rounded-full bg-gradient-to-br from-amber-200/40 via-peach-200/50 to-teal-200/40 blur-3xl" />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* LEFT COLUMN: Portal Visual & Highlights */}
          <div className="relative lg:col-span-5 bg-slate-900 text-white min-h-[220px] lg:min-h-full flex flex-col justify-between p-6 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs bg-white/10 text-white border-white/20">
                <Sparkles className="size-3.5 text-amber-300" />
                Kartly Portal Access
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activePortal.badgeBg}`}>
                {activePortal.label}
              </span>
            </div>

            <div className="relative z-10 my-6 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
                {activePortal.tagline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activePortal.description}
              </p>
            </div>

            <div className="relative z-10 space-y-2.5 border-t border-white/15 pt-4 text-xs text-slate-200 hidden sm:block">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{activePortal.bullet1}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{activePortal.bullet2}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{activePortal.bullet3}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Unified Form + Portal Selection */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white/90">
            
            <div className="space-y-4">
              {/* Header Title & Subtitle */}
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In & Portal Selection
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Choose your role portal, enter your login details, and access your dashboard.
                </p>
              </div>

              {/* PORTAL SELECTION DROPDOWN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Portal Access (Role)
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all cursor-pointer"
                  >
                    {PORTAL_ROLES.map((p) => (
                      <option key={p.role} value={p.role}>
                        {p.label} Portal — {p.description.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Login / Sign Up Tab Selector */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In ({activePortal.label})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold">Authentication Error</p>
                  <p className="text-rose-600/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="user@kartly.com or 9876543210"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    <>
                      Sign In to {activePortal.label} Portal <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="user@kartly.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      Register & Open {activePortal.label} Portal <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Login Shortcut */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Sparkles className="size-3.5 text-amber-500" /> Quick Demo Login ({activePortal.label})
              </button>

              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <BadgeCheck className="size-3.5 text-emerald-500" /> SSL Protected
              </span>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
