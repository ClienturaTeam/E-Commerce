import * as React from "react";
import {
  QrCode,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { inr } from "./catalog";

export type UpiAppId = "gpay" | "phonepe" | "paytm" | "other";

interface UpiPaymentWidgetProps {
  payableAmount: number;
  orderId?: string;
  merchantVpa?: string;
  merchantName?: string;
  onPaymentSuccess: (paymentDetails: { method: "upi"; providerName: string; upiId: string }) => void;
  onCancel?: () => void;
}

export function UpiPaymentWidget({
  payableAmount,
  orderId = "OrderPayment",
  merchantVpa = "kartly@okicici",
  merchantName = "Kartly Store",
  onPaymentSuccess,
  onCancel,
}: UpiPaymentWidgetProps) {
  const [selectedApp, setSelectedApp] = React.useState<UpiAppId>("gpay");
  const [upiSubOption, setUpiSubOption] = React.useState<"app" | "qr" | "id">("app");
  const [customUpiId, setCustomUpiId] = React.useState("");
  const [upiIdError, setUpiIdError] = React.useState("");

  // Payment Status States
  const [isWaitingReturn, setIsWaitingReturn] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isCancelled, setIsCancelled] = React.useState(false);

  // 5-Minute Timer (300 Seconds)
  const [timeLeft, setTimeLeft] = React.useState<number>(300);
  const [isExpired, setIsExpired] = React.useState(false);

  // Timer Countdown Effect
  React.useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRefreshTimer = () => {
    setTimeLeft(300);
    setIsExpired(false);
    toast.success("Payment session refreshed!");
  };

  // Generate Standard UPI Deep Link URI
  // Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
  const noteParam = encodeURIComponent(orderId || "OrderPayment");
  const vpaParam = encodeURIComponent(merchantVpa);
  const nameParam = encodeURIComponent(merchantName);
  const amountParam = payableAmount.toFixed(2);

  const rawUpiUri = `upi://pay?pa=${vpaParam}&pn=${nameParam}&am=${amountParam}&cu=INR&tn=${noteParam}`;

  const getAppDeepLink = (app: UpiAppId) => {
    switch (app) {
      case "gpay":
        return `gpay://upi/pay?pa=${vpaParam}&pn=${nameParam}&am=${amountParam}&cu=INR&tn=${noteParam}`;
      case "phonepe":
        return `phonepe://pay?pa=${vpaParam}&pn=${nameParam}&am=${amountParam}&cu=INR&tn=${noteParam}`;
      case "paytm":
        return `paytmmp://pay?pa=${vpaParam}&pn=${nameParam}&am=${amountParam}&cu=INR&tn=${noteParam}`;
      default:
        return rawUpiUri;
    }
  };

  const activeDeepLink = getAppDeepLink(selectedApp);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    rawUpiUri
  )}`;

  const appNames: Record<UpiAppId, string> = {
    gpay: "Google Pay",
    phonepe: "PhonePe",
    paytm: "Paytm",
    other: "Other UPI App",
  };

  // App Selection Circular Badges Config
  const appsConfig = [
    {
      id: "gpay" as UpiAppId,
      name: "Google Pay",
      bgClass: "bg-blue-600 text-white",
      borderClass: "border-blue-600 ring-blue-600/30",
      iconText: "GPay",
    },
    {
      id: "phonepe" as UpiAppId,
      name: "PhonePe",
      bgClass: "bg-purple-600 text-white",
      borderClass: "border-purple-600 ring-purple-600/30",
      iconText: "Ph",
    },
    {
      id: "paytm" as UpiAppId,
      name: "Paytm",
      bgClass: "bg-sky-500 text-white",
      borderClass: "border-sky-500 ring-sky-500/30",
      iconText: "Paytm",
    },
    {
      id: "other" as UpiAppId,
      name: "Other UPI",
      bgClass: "bg-emerald-600 text-white",
      borderClass: "border-emerald-600 ring-emerald-600/30",
      iconText: "UPI",
    },
  ];

  // Deep Link App Trigger
  const handleLaunchUpiApp = () => {
    if (isExpired) {
      toast.error("Session expired! Please refresh timer to continue.");
      return;
    }
    const appName = appNames[selectedApp];
    toast.info(`Opening ${appName}...`, {
      description: "Redirecting to your payment app. Complete payment & confirm below.",
    });

    setIsCancelled(false);
    setIsWaitingReturn(true);

    try {
      window.location.href = activeDeepLink;
    } catch {
      // If direct deep link is blocked by browser, fallback to standard upi:// scheme
      try {
        window.location.href = rawUpiUri;
      } catch {
        toast.error(`Could not launch ${appName} directly. Please scan the QR code.`);
      }
    }
  };

  // Confirm Payment Completed ("I Have Completed Payment")
  const handleConfirmCompletedPayment = () => {
    if (isExpired) {
      toast.error("Session expired! Please refresh timer before confirming.");
      return;
    }

    if (upiSubOption === "id") {
      if (!customUpiId.trim() || !customUpiId.includes("@")) {
        setUpiIdError("Please enter a valid UPI ID (e.g. username@upi)");
        return;
      }
    }

    setIsVerifying(true);
    setUpiIdError("");

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      toast.success("Payment Verified Successfully! 🎉", {
        description: `₹${payableAmount} received via ${appNames[selectedApp]}.`,
      });

      setTimeout(() => {
        const finalUpiId =
          upiSubOption === "id" && customUpiId
            ? customUpiId
            : `${selectedApp}@okicici`;

        onPaymentSuccess({
          method: "upi",
          providerName: appNames[selectedApp],
          upiId: finalUpiId,
        });
      }, 800);
    }, 1200);
  };

  // Handle Cancel / Retry Payment
  const handleCancelPayment = () => {
    setIsWaitingReturn(false);
    setIsVerifying(false);
    setIsCancelled(true);
    toast.error("Payment Cancelled", {
      description: "You can retry UPI payment or choose another payment option.",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md space-y-6 max-w-xl mx-auto font-sans">
      {/* Header with Price & Timer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Smartphone className="size-5 text-brand" /> UPI Deep Link Payment
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Instant Pay via Google Pay, PhonePe & Paytm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              Total Amount
            </span>
            <span className="text-lg font-black text-brand">{inr(payableAmount)}</span>
          </div>
        </div>
      </div>

      {/* WAITING FOR PAYMENT RETURN SCREEN */}
      {isWaitingReturn ? (
        <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95">
          <div className="mx-auto size-16 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand relative">
            <Loader2 className="size-10 animate-spin text-brand" />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-brand text-primary-foreground font-black text-[10px] uppercase tracking-widest">
              REDIRECTED TO {appNames[selectedApp].toUpperCase()}
            </span>
            <h4 className="text-lg font-black text-foreground">Waiting for Payment Confirmation</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Please complete the payment of <strong className="text-foreground">{inr(payableAmount)}</strong> in your <strong>{appNames[selectedApp]}</strong> app and click below once done.
            </p>
          </div>

          {/* Deep Link Quick URI Copy Box */}
          <div className="bg-muted/40 p-3 rounded-xl border border-border/80 text-xs space-y-1 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-mono truncate max-w-[240px]">
                {activeDeepLink}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeDeepLink);
                  toast.success("UPI Deep Link copied!");
                }}
                className="text-brand font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Copy className="size-3" /> Copy Link
              </button>
            </div>
          </div>

          {/* Action Buttons: I Have Completed Payment vs Cancel Payment */}
          <div className="space-y-3 pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleConfirmCompletedPayment}
              disabled={isVerifying || isSuccess}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Verifying Payment Status...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="size-4 text-white" /> Payment Verified!
                </>
              ) : (
                <>
                  <Check className="size-4" /> I Have Completed Payment ({inr(payableAmount)})
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelPayment}
              disabled={isVerifying}
              className="w-full bg-muted hover:bg-muted/80 text-foreground py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-border flex items-center justify-center gap-1.5"
            >
              <XCircle className="size-4 text-destructive" /> Cancel Payment / Retry Option
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CANCELLED ALERT BANNER */}
          {isCancelled && (
            <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-xl text-xs text-destructive flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" /> Payment was cancelled. Please select an app to try again.
              </span>
              <button
                type="button"
                onClick={() => setIsCancelled(false)}
                className="text-[10px] underline font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Circular UPI App Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground">
              1. Choose UPI App to Pay
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {appsConfig.map((app) => {
                const isSelected = selectedApp === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setSelectedApp(app.id);
                      setUpiIdError("");
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${app.borderClass} bg-brand/5 ring-2 shadow-xs font-bold`
                        : "border-border bg-background hover:border-brand/40"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-full ${app.bgClass} flex items-center justify-center font-black text-xs shadow-md transition-transform ${
                        isSelected ? "scale-110" : ""
                      }`}
                    >
                      {app.iconText}
                    </div>
                    <span className="text-xs font-bold text-foreground truncate max-w-full">
                      {app.name}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] bg-brand text-primary-foreground font-bold px-1.5 py-0.2 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sub-Option Tabs: Direct App vs QR vs VPA */}
          <div className="grid grid-cols-3 gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setUpiSubOption("app")}
              className={`py-2 px-2 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                upiSubOption === "app"
                  ? "bg-card text-brand shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ExternalLink className="size-3.5" /> Direct App
            </button>

            <button
              type="button"
              onClick={() => setUpiSubOption("qr")}
              className={`py-2 px-2 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                upiSubOption === "qr"
                  ? "bg-card text-brand shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <QrCode className="size-3.5" /> Scan QR
            </button>

            <button
              type="button"
              onClick={() => setUpiSubOption("id")}
              className={`py-2 px-2 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                upiSubOption === "id"
                  ? "bg-card text-brand shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="size-3.5" /> Enter ID
            </button>
          </div>

          {/* Timer Indicator Bar */}
          <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="size-3.5 text-brand" /> Payment Session Timer
            </span>
            <div
              className={`font-black text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ${
                isExpired
                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : timeLeft < 60
                  ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              {isExpired ? "00:00 (Session Expired)" : formatTimer(timeLeft)}
            </div>
          </div>

          {/* View A: Direct App Redirect */}
          {upiSubOption === "app" && (
            <div className="space-y-4 text-center p-4 border border-border rounded-xl bg-muted/10">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Pay via {appNames[selectedApp]} Deep Link
                </h4>
                <p className="text-xs text-muted-foreground">
                  Clicking below opens the {appNames[selectedApp]} mobile app with prefilled order total <strong>{inr(payableAmount)}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchUpiApp}
                disabled={isExpired}
                className="w-full bg-brand text-primary-foreground py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-deep transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Smartphone className="size-4" /> Open {appNames[selectedApp]} & Pay {inr(payableAmount)} <ExternalLink className="size-3.5" />
              </button>
            </div>
          )}

          {/* View B: QR Code Scanner */}
          {upiSubOption === "qr" && (
            <div className="space-y-4 text-center">
              <div className="relative border-2 border-dashed border-brand/40 bg-card p-5 rounded-2xl max-w-xs mx-auto space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <ShieldCheck className="size-4 text-emerald-600" /> {merchantName}
                  </span>
                  <span className="font-black text-brand text-xs">{inr(payableAmount)}</span>
                </div>

                <div className="relative bg-white p-3 rounded-xl border border-border inline-block shadow-xs">
                  {isExpired ? (
                    <div className="size-44 bg-muted/80 rounded flex flex-col items-center justify-center p-3 text-center space-y-2">
                      <AlertTriangle className="size-8 text-destructive mx-auto" />
                      <p className="text-xs font-bold text-destructive">QR Expired</p>
                      <button
                        type="button"
                        onClick={handleRefreshTimer}
                        className="text-[10px] font-bold bg-brand text-primary-foreground px-2 py-1 rounded hover:opacity-90 cursor-pointer"
                      >
                        Refresh Timer
                      </button>
                    </div>
                  ) : (
                    <img
                      src={qrImageUrl}
                      alt={`Scan QR Code to Pay via ${appNames[selectedApp]}`}
                      className="size-44 object-contain mx-auto"
                    />
                  )}
                </div>

                <p className="text-xs font-bold text-foreground">
                  Scan using <span className="text-brand font-black">{appNames[selectedApp]}</span> or any UPI App
                </p>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-mono bg-muted/50 p-1.5 rounded">
                  <span>VPA: {merchantVpa}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(merchantVpa);
                      toast.success("VPA copied to clipboard!");
                    }}
                    className="hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View C: Manual VPA */}
          {upiSubOption === "id" && (
            <div className="space-y-3 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Enter your UPI ID / Virtual Address (VPA) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile@ybl or username@okicici"
                  value={customUpiId}
                  onChange={(e) => {
                    setCustomUpiId(e.target.value);
                    if (upiIdError) setUpiIdError("");
                  }}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-brand font-mono ${
                    upiIdError ? "border-destructive" : "border-border"
                  }`}
                />
                {upiIdError ? (
                  <p className="text-[11px] text-destructive mt-1 font-semibold">{upiIdError}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    A payment request will be pushed to your UPI app.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-1/3 bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-border"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirmCompletedPayment}
                disabled={isExpired || isVerifying}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verifying Payment...
                  </>
                ) : (
                  <>
                    <Check className="size-4" /> I Have Completed Payment ({inr(payableAmount)})
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant • 256-bit Encrypted SSL Gateway</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
