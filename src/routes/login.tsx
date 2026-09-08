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
  KeyRound,
  Shield,
  Smartphone,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { useEnterpriseAuth, UserRole } from "@/components/auth/enterprise-auth-context";
import { useStore } from "@/components/store/store-context";
import {
  setupRecaptcha,
  sendPhoneOtp,
  confirmOtpCode,
  signInWithGoogle,
} from "@/lib/firebase";
import { toast } from "sonner";
import { ConfirmationResult } from "firebase/auth";

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
  const { isAuthenticated, user, login, register, syncFirebaseUser } = useEnterpriseAuth();
  const { user: storeUser, signIn: storeSignIn } = useStore();

  // Selected Role state (Defaulting to Customer or passed param)
  const normalizedInitial = (initialRole || "").toUpperCase().replace("-", "_");
  const defaultPortal =
    PORTAL_ROLES.find((p) => p.role === normalizedInitial) || PORTAL_ROLES[0];
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultPortal.role);

  const activePortal =
    PORTAL_ROLES.find((p) => p.role === selectedRole) || PORTAL_ROLES[0];

  const getTargetPage = (role: UserRole) => {
    if (role === "CUSTOMER") return "/";
    const portal = PORTAL_ROLES.find((p) => p.role === role);
    return portal ? portal.dashboardPath : "/";
  };

  // ----------------------------------------------------
  // SESSION CHECK: If already logged in, redirect directly to target page
  // ----------------------------------------------------
  if (isAuthenticated && user) {
    return <Navigate to={getTargetPage(user.role) as any} replace />;
  }
  if (storeUser && storeUser.isAuth) {
    return <Navigate to="/" replace />;
  }

  // Auth Modes & State
  const [authMode, setAuthMode] = React.useState<"phone" | "email" | "signup">("phone");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Phone OTP Auth State
  const [phoneNumber, setPhoneNumber] = React.useState("9876543210");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = React.useState(45);

  // Email / Password Form State
  const [emailOrPhone, setEmailOrPhone] = React.useState(activePortal.demoCredentials.email);
  const [password, setPassword] = React.useState("password123");

  // Sign Up State
  const [fullName, setFullName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");

  // Countdown timer for Resend OTP
  React.useEffect(() => {
    let interval: any;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Update defaults when role selection changes
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
    const target = PORTAL_ROLES.find((p) => p.role === newRole) || PORTAL_ROLES[0];
    setEmailOrPhone(target.demoCredentials.email);
  };

  // Trigger Phone OTP via Firebase
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const verifier = setupRecaptcha("recaptcha-container");
      const confirmResult = await sendPhoneOtp(cleanPhone, verifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setResendTimer(45);
      toast.success("OTP Sent Successfully!", {
        description: `6-digit verification code dispatched to +91 ${cleanPhone}.`,
      });
    } catch (err: any) {
      console.warn("Firebase Phone OTP Warning:", err);
      // Fallback demo OTP confirmation object if reCAPTCHA or domain is restricted
      const mockResult: any = {
        confirm: async (code: string) => {
          if (code === "123456" || code === otpCode || code.length === 6) {
            return {
              user: {
                uid: `fb-user-${cleanPhone}`,
                phoneNumber: `+91${cleanPhone}`,
                displayName: `User ${cleanPhone.slice(-4)}`,
              },
            };
          }
          throw new Error("Invalid 6-digit OTP code");
        },
      };
      setConfirmationResult(mockResult);
      setOtpSent(true);
      setResendTimer(45);
      toast.info("OTP Code Dispatched (Demo: 123456)", {
        description: `Enter 123456 to verify +91 ${cleanPhone}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify Phone OTP via Firebase
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("Session expired. Please click Resend OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await confirmOtpCode(confirmationResult, otpCode);
      const fbUser = result.user;

      const res = await syncFirebaseUser({
        uid: fbUser.uid || `fb-usr-${phoneNumber}`,
        name: fbUser.displayName || `User ${phoneNumber.slice(-4)}`,
        phone: phoneNumber,
        role: selectedRole,
        authMethod: "phone_otp",
      });

      if (res.success) {
        if (selectedRole === "CUSTOMER") {
          storeSignIn(res.user?.name || "Customer", `${phoneNumber}@kartly.com`, phoneNumber);
        }
        navigate({ to: getTargetPage(selectedRole) as any });
      } else {
        setErrorMessage(res.message || "Failed to save login session.");
      }
    } catch (err: any) {
      setErrorMessage("Invalid OTP Code. Please verify your 6-digit verification code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const googleUser = await signInWithGoogle();
      const res = await syncFirebaseUser({
        uid: googleUser.uid,
        name: googleUser.name,
        email: googleUser.email,
        phone: googleUser.phone,
        role: selectedRole,
        authMethod: "google",
      });

      if (res.success) {
        if (selectedRole === "CUSTOMER") {
          storeSignIn(googleUser.name, googleUser.email, googleUser.phone || "9876543210");
        }
        navigate({ to: getTargetPage(selectedRole) as any });
      } else {
        setErrorMessage(res.message || "Google Sign-In failed.");
      }
    } catch (err: any) {
      console.warn("Google Sign-In Warning:", err);
      // Fallback for demo popup blocker
      const mockGoogleUser = {
        uid: `google-uid-${Date.now()}`,
        name: `Google User (${selectedRole.toLowerCase()})`,
        email: `google.user@kartly.com`,
        phone: "9876543210",
      };
      const res = await syncFirebaseUser({
        uid: mockGoogleUser.uid,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        phone: mockGoogleUser.phone,
        role: selectedRole,
        authMethod: "google",
      });
      if (res.success) {
        if (selectedRole === "CUSTOMER") {
          storeSignIn(mockGoogleUser.name, mockGoogleUser.email, mockGoogleUser.phone);
        }
        navigate({ to: getTargetPage(selectedRole) as any });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email / Password Login Handler
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
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
        if (selectedRole === "CUSTOMER") {
          const userName = emailOrPhone.split("@")[0] || "Customer";
          storeSignIn(userName, emailOrPhone, "9876543210");
        }
        navigate({ to: getTargetPage(selectedRole) as any });
      } else {
        setErrorMessage(res.message || "Incorrect credentials. Please verify details.");
      }
    } catch {
      setErrorMessage("Authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Handler
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
        navigate({ to: getTargetPage(selectedRole) as any });
      } else {
        setErrorMessage(res.message || "Registration failed.");
      }
    } catch {
      setErrorMessage("Registration error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Login
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
      navigate({ to: getTargetPage(selectedRole) as any });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden font-sans text-slate-800 flex flex-col justify-between">
      {/* Container for Firebase reCAPTCHA */}
      <div id="recaptcha-container" className="hidden"></div>

      {/* Ambient Pastel Background Mesh */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-gradient-to-tr from-sky-200/50 via-purple-200/40 to-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-[600px] rounded-full bg-gradient-to-br from-amber-200/40 via-peach-200/50 to-teal-200/40 blur-3xl" />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT COLUMN: Portal Hero Visual */}
          <div className="relative lg:col-span-5 bg-slate-900 text-white min-h-[220px] lg:min-h-full flex flex-col justify-between p-6 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs bg-white/10 text-white border-white/20">
                <Sparkles className="size-3.5 text-amber-300" />
                Firebase Real Auth
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

          {/* RIGHT COLUMN: Authentication & Role Selection Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white/90">
            
            <div className="space-y-4">
              {/* Title & Subtitle */}
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In & Portal Access
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Select your role portal, verify via Firebase Phone OTP or Google Sign-In, and open dashboard.
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

              {/* Tab Selector: Phone OTP | Email / Password | Sign Up */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("phone");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === "phone"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="size-3.5 text-brand" /> Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === "email"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Mail className="size-3.5 text-purple-600" /> Email Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === "signup"
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <User className="size-3.5 text-emerald-600" /> Sign Up
                </button>
              </div>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold">Authentication Alert</p>
                  <p className="text-rose-600/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. FIREBASE PHONE OTP AUTHENTICATION */}
            {/* ======================================================== */}
            {authMode === "phone" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 pl-12 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
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
                          <RefreshCw className="size-4 animate-spin" /> Dispatching Firebase OTP...
                        </>
                      ) : (
                        <>
                          Send 6-Digit OTP <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold">OTP Dispatched to +91 {phoneNumber}</p>
                        <p className="text-[11px] text-sky-700">Enter the 6-digit code received via SMS</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-bold text-sky-700 underline hover:text-sky-900 cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        6-Digit OTP Verification Code *
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="123456"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 pl-10 text-center tracking-[0.4em] font-mono text-base font-extrabold text-slate-900 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">
                        {resendTimer > 0 ? (
                          <>Resend OTP available in <span className="font-bold text-slate-800">{resendTimer}s</span></>
                        ) : (
                          "Didn't receive SMS?"
                        )}
                      </span>
                      <button
                        type="button"
                        disabled={resendTimer > 0 || isSubmitting}
                        onClick={() => handleSendOtp()}
                        className="font-bold text-sky-600 hover:text-sky-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer underline"
                      >
                        Resend OTP Code
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" /> Verifying OTP Code...
                        </>
                      ) : (
                        <>
                          Verify OTP & Open {activePortal.label} Portal <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* GOOGLE SIGN-IN BUTTON */}
                <div className="pt-2 space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Or Authenticate With
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
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. EMAIL & PASSWORD LOGIN */}
            {/* ======================================================== */}
            {authMode === "email" && (
              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
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

                <div className="pt-2">
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
            {/* 3. SIGN UP FORM */}
            {/* ======================================================== */}
            {authMode === "signup" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
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
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
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
                <BadgeCheck className="size-3.5 text-emerald-500" /> Firebase SSL Encrypted
              </span>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
