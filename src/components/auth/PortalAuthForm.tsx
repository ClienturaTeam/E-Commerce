import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEnterpriseAuth, UserRole } from "./enterprise-auth-context";
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  User,
  Store,
  Truck,
  Warehouse,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { toast } from "sonner";

interface PortalAuthFormProps {
  role: UserRole;
  portalTitle: string;
  portalDescription: string;
  dashboardPath: string;
  demoCredentials: {
    email: string;
    password: string;
    name: string;
  };
}

const PORTAL_THEMES: Record<
  UserRole,
  {
    heroImage: string;
    badgeBg: string;
    accentGlow: string;
    tagline: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
  }
> = {
  CUSTOMER: {
    heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    accentGlow: "from-sky-500/20 via-sky-400/10 to-transparent",
    tagline: "Your Ultimate Shopping Experience Begins Here",
    bullet1: "Track active orders & delivery status in real-time",
    bullet2: "Save favorite wishlist items across all devices",
    bullet3: "Earn 10% instant loyalty reward points on purchases",
  },
  SELLER: {
    heroImage: "https://images.unsplash.com/photo-1556742049-0a67568d049f?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    accentGlow: "from-purple-500/20 via-pink-400/10 to-transparent",
    tagline: "Empower Your E-Commerce Business & Scale Payouts",
    bullet1: "Manage inventory, stock levels & product catalogs",
    bullet2: "0% commission for the first 30 days of onboarding",
    bullet3: "Automated 7-day NEFT/RTGS bank disbursals",
  },
  ADMIN: {
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    accentGlow: "from-amber-500/20 via-yellow-400/10 to-transparent",
    tagline: "Level-2 Product Moderation & Oversight",
    bullet1: "Review & approve seller store onboarding requests",
    bullet2: "Moderate product listings & user moderation queues",
    bullet3: "Export platform analytics & marketing campaign tools",
  },
  SUPER_ADMIN: {
    heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    accentGlow: "from-rose-500/20 via-pink-400/10 to-transparent",
    tagline: "Root System Authorization & Infrastructure Access",
    bullet1: "Rotate API secret keys & HMAC signatures",
    bullet2: "Trigger automated database backup snapshots",
    bullet3: "Inspect immutable real-time security audit trails",
  },
  WAREHOUSE: {
    heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accentGlow: "from-emerald-500/20 via-teal-400/10 to-transparent",
    tagline: "Smart Packing & Live Warehouse Dispatch Queue",
    bullet1: "Barcode scanner integration & fulfillment tracking",
    bullet2: "Live Pick → Pack → Dispatch workflow pipeline",
    bullet3: "Station WH-BLR-04 packing station synchronization",
  },
  DELIVERY: {
    heroImage: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
    accentGlow: "from-teal-500/20 via-emerald-400/10 to-transparent",
    tagline: "Express Delivery Rider & GPS Navigation Desk",
    bullet1: "Turn-by-turn GPS route navigation to customer addresses",
    bullet2: "Verify 4-digit OTP delivery confirmation codes",
    bullet3: "Track daily drop earnings & performance metrics",
  },
  SUPPORT: {
    heroImage: "https://images.unsplash.com/photo-1534536281715-e28d7674177d?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    accentGlow: "from-indigo-500/20 via-purple-400/10 to-transparent",
    tagline: "Tier-2 Customer Helpdesk & Ticket Escalations",
    bullet1: "Resolve customer inquiries & size/item exchange tickets",
    bullet2: "Process instant wallet or UPI refund transactions",
    bullet3: "Live customer chat desk support integration",
  },
  FINANCE: {
    heroImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    accentGlow: "from-emerald-600/20 via-teal-400/10 to-transparent",
    tagline: "Financial Analytics, GST Filings & Payout Reconciliations",
    bullet1: "Automatic NEFT/RTGS gateway seller settlements",
    bullet2: "Audit GST liability calculation & export compliance reports",
    bullet3: "99.98% financial transaction reconciliation accuracy",
  },
};

export function PortalAuthForm({
  role,
  portalTitle,
  portalDescription,
  dashboardPath,
  demoCredentials,
}: PortalAuthFormProps) {
  const { login, register } = useEnterpriseAuth();
  const navigate = useNavigate();

  const theme = PORTAL_THEMES[role] || PORTAL_THEMES.CUSTOMER;

  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Login Form state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = React.useState(demoCredentials.email);
  const [loginPassword, setLoginPassword] = React.useState(demoCredentials.password);

  // Registration Common Fields
  const [fullName, setFullName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Role-Specific Fields
  const [address, setAddress] = React.useState("");
  const [shopName, setShopName] = React.useState("");
  const [businessType, setBusinessType] = React.useState("Retailer");
  const [vehicleType, setVehicleType] = React.useState("Electric Two-Wheeler");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [stationId, setStationId] = React.useState("WH-BLR-04");
  const [department, setDepartment] = React.useState("Tier-2 Escalations & Refunds");
  const [designation, setDesignation] = React.useState("Financial Comptroller");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login({
        emailOrPhone: loginEmailOrPhone,
        password: loginPassword,
        role,
      });

      if (res.success) {
        navigate({ to: dashboardPath as any });
      } else {
        setErrorMessage(res.message || "Incorrect credentials. Please verify your email/phone and password.");
      }
    } catch {
      setErrorMessage("Incorrect credentials. Login request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password entry.");
      return;
    }

    setIsSubmitting(true);

    try {
      const roleDetails: Record<string, string> = {};
      if (role === "CUSTOMER") roleDetails.address = address;
      if (role === "SELLER") {
        roleDetails.shopName = shopName;
        roleDetails.businessType = businessType;
      }
      if (role === "DELIVERY") {
        roleDetails.vehicleType = vehicleType;
        roleDetails.licenseNumber = licenseNumber;
      }
      if (role === "WAREHOUSE") {
        roleDetails.employeeId = employeeId;
        roleDetails.stationId = stationId;
      }
      if (role === "SUPPORT") {
        roleDetails.employeeId = employeeId;
        roleDetails.department = department;
      }
      if (role === "FINANCE") {
        roleDetails.employeeId = employeeId;
        roleDetails.designation = designation;
      }
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        roleDetails.employeeId = employeeId;
      }

      const res = await register({
        name: fullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role,
        ...roleDetails,
      });

      if (res.success) {
        navigate({ to: dashboardPath as any });
      } else {
        setErrorMessage(res.message || "Account already exists with this email address or phone number.");
      }
    } catch {
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await login({
        emailOrPhone: `user.google@kartly.com`,
        role,
        socialProvider: "google",
      });
      if (res.success) {
        navigate({ to: dashboardPath as any });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await login({
      emailOrPhone: demoCredentials.email,
      password: demoCredentials.password,
      role,
    });
    setIsSubmitting(false);
    if (res.success) {
      navigate({ to: dashboardPath as any });
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password Reset Email Sent", {
      description: `A reset link has been dispatched to ${loginEmailOrPhone || "your registered email"}.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden font-sans text-slate-800 flex flex-col justify-between">
      {/* Background Ambient Soft Pastel Gradient Mesh */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-gradient-to-tr from-sky-200/50 via-purple-200/40 to-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-[600px] rounded-full bg-gradient-to-br from-amber-200/40 via-peach-200/50 to-teal-200/40 blur-3xl" />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Hero Visual & Pastel Banner (Desktop & Mobile) */}
          {/* ======================================================== */}
          <div className="relative lg:col-span-5 bg-slate-900 text-white min-h-[220px] lg:min-h-full flex flex-col justify-between p-6 md:p-10 overflow-hidden">
            {/* Background Hero Image */}
            <img
              src={theme.heroImage}
              alt={portalTitle}
              className="absolute inset-0 size-full object-cover object-center opacity-40 transition-transform duration-700 hover:scale-105"
            />

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.accentGlow}`} />

            {/* Top Brand Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <Link to="/portals" className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white transition-colors">
                <span className="flex size-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  ←
                </span>
                Portals Directory
              </Link>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm ${theme.badgeBg}`}>
                <BadgeCheck className="size-3.5" />
                {role.replace("_", " ")}
              </span>
            </div>

            {/* Middle Copy */}
            <div className="relative z-10 my-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-md border border-white/15">
                <Sparkles className="size-3.5 text-amber-300" />
                Kartly Enterprise Platform
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight">
                {theme.tagline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium hidden sm:block">
                Experience seamless multi-vendor e-commerce role workflows backed by 256-bit encrypted JWT authentication.
              </p>
            </div>

            {/* Bottom Bullets (Hidden on small mobile for space) */}
            <div className="relative z-10 space-y-2 border-t border-white/15 pt-4 text-xs text-slate-200 hidden sm:block">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{theme.bullet1}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{theme.bullet2}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>{theme.bullet3}</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Authentication Form (Login & Sign Up) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white/90">
            
            {/* Header Title & Switcher */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{portalTitle}</h1>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{portalDescription}</p>
                </div>
                <span className={`self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${theme.badgeBg}`}>
                  {role} Portal
                </span>
              </div>

              {/* Pastel Tab Switcher */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In (Login)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 shadow-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-extrabold">Authentication Failed</p>
                  <p className="font-medium text-rose-600/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* LOGIN FORM */}
            {/* ======================================================== */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="user@kartly.com or 9876543210"
                      value={loginEmailOrPhone}
                      onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
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

                {/* Submit Button */}
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
                      Sign In to {role.replace("_", " ")} Portal <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                {/* GOOGLE SIGN-IN BUTTON */}
                <div className="pt-2 space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Or Continue With
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 text-sm cursor-pointer hover:border-slate-300"
                  >
                    <svg viewBox="0 0 24 24" className="size-5 shrink-0">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* SIGN UP (REGISTRATION) FORM */}
            {/* ======================================================== */}
            {activeTab === "signup" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-2.5">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    1. Account Credentials
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="name@domain.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROLE-SPECIFIC REGISTRATION DETAILS */}
                <div className="space-y-2.5 pt-1">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    2. {role.replace("_", " ")} Role Details
                  </p>

                  {role === "CUSTOMER" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Enter flat/house no, street name, city, pincode..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                      />
                    </div>
                  )}

                  {role === "SELLER" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Shop / Store Name *</label>
                        <div className="relative">
                          <Store className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apex Digital Hub"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Business Type *</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        >
                          <option value="Retailer">Retail Seller</option>
                          <option value="Wholesaler">Wholesaler & Distributor</option>
                          <option value="Brand Manufacturer">Direct Brand Manufacturer</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {role === "DELIVERY" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type *</label>
                        <div className="relative">
                          <Truck className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                          <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          >
                            <option value="Electric Two-Wheeler">Electric Two-Wheeler</option>
                            <option value="Motorcycle/Scooter">Motorcycle / Scooter</option>
                            <option value="Delivery Van">Delivery Cargo Van</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Driving License No. *</label>
                        <input
                          type="text"
                          required
                          placeholder="KA-01-2026-9041"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {(role === "WAREHOUSE" || role === "SUPPORT" || role === "FINANCE" || role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Employee / Staff ID *</label>
                        <div className="relative">
                          <Warehouse className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder={role === "WAREHOUSE" ? "WH-BLR-04" : "EMP-9021"}
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          />
                        </div>
                      </div>

                      {role === "WAREHOUSE" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Station *</label>
                          <select
                            value={stationId}
                            onChange={(e) => setStationId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          >
                            <option value="WH-BLR-04">WH-BLR-04 (Indiranagar Hub)</option>
                            <option value="WH-HYD-01">WH-HYD-01 (Mindspace Hub)</option>
                            <option value="WH-DEL-02">WH-DEL-02 (Airport Dock)</option>
                          </select>
                        </div>
                      )}

                      {role === "SUPPORT" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                          <input
                            type="text"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          />
                        </div>
                      )}

                      {role === "FINANCE" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                          <input
                            type="text"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Register Button */}
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
                      Complete Sign Up & Open Dashboard <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                {/* GOOGLE SIGN IN BUTTON FOR SIGNUP */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 text-sm cursor-pointer hover:border-slate-300"
                >
                  <svg viewBox="0 0 24 24" className="size-5 shrink-0">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign Up with Google</span>
                </button>
              </form>
            )}

            {/* Quick Demo Shortcut */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Sparkles className="size-3.5 text-amber-500" /> Quick Demo Login as {demoCredentials.name}
              </button>

              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <ShieldCheck className="size-3.5 text-emerald-500" /> 256-bit SSL Protected
              </span>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
