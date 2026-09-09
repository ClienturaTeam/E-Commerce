import * as React from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Smartphone,
  CreditCard,
  ChevronRight,
  RefreshCw,
  X,
  Send,
  Gift,
  Tag,
  Star,
  FileText,
  Settings,
  ArrowLeft,
  QrCode,
  Check,
  Percent,
  SlidersHorizontal,
  Coins,
  Receipt,
  Download,
  Flame,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inr } from "./catalog";

export type WalletTransaction = {
  id: string;
  type: "refund" | "cashback" | "purchase" | "topup" | "withdrawal" | "gift";
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: "Completed" | "Processing";
  refId: string;
};

export type EligibleRefund = {
  id: string;
  orderId: string;
  itemTitle: string;
  amount: number;
  reason: string;
  date: string;
  isClaimed: boolean;
};

export type WalletState = {
  balance: number;
  cashback: number;
  rewardsPoints: number;
  instantRefundEnabled: boolean;
  pinLockEnabled: boolean;
  transactions: WalletTransaction[];
  eligibleRefunds: EligibleRefund[];
};

const STORAGE_KEY = "kartly_wallet_state_v2";

const INITIAL_WALLET: WalletState = {
  balance: 2450,
  cashback: 180,
  rewardsPoints: 1250,
  instantRefundEnabled: true,
  pinLockEnabled: false,
  eligibleRefunds: [
    {
      id: "ref-1",
      orderId: "OD94821034",
      itemTitle: "Noise ColorFit Pulse 2 Smartwatch",
      amount: 499,
      reason: "Order Cancelled by Customer (Before Dispatch)",
      date: "Today, 10:15 AM",
      isClaimed: false,
    },
    {
      id: "ref-2",
      orderId: "OD88329410",
      itemTitle: "Puma Graphic Athletic Gym Set",
      amount: 699,
      reason: "Returned Item Picked Up by Courier",
      date: "Yesterday, 04:30 PM",
      isClaimed: false,
    },
    {
      id: "ref-3",
      orderId: "OD77318029",
      itemTitle: "boAt Airdopes 141 Bluetooth Earbuds",
      amount: 999,
      reason: "Item returned and inspected",
      date: "04 Sep 2026",
      isClaimed: true,
    },
  ],
  transactions: [
    {
      id: "txn-1",
      type: "refund",
      title: "Order Refund",
      subtitle: "Noise ColorFit Pulse 2 (Order #OD94821034)",
      amount: 499,
      date: "Today, 11:20 AM",
      status: "Completed",
      refId: "TXN_REF_881920",
    },
    {
      id: "txn-2",
      type: "cashback",
      title: "Cashback",
      subtitle: "SuperFest 5% Instant Cashback",
      amount: 50,
      date: "07 Sep 2026, 02:40 PM",
      status: "Completed",
      refId: "TXN_CB_994821",
    },
    {
      id: "txn-3",
      type: "purchase",
      title: "Order #KRT1024",
      subtitle: "Zara Casual Cotton Shirt & Denim Pants",
      amount: 799,
      date: "05 Sep 2026, 06:15 PM",
      status: "Completed",
      refId: "TXN_PAY_773618",
    },
    {
      id: "txn-4",
      type: "topup",
      title: "Wallet Top-up",
      subtitle: "Added via Google Pay UPI (user@okhdfc)",
      amount: 2000,
      date: "28 Aug 2026, 09:30 AM",
      status: "Completed",
      refId: "TXN_TOP_662810",
    },
  ],
};

export function getSavedWalletState(): WalletState {
  if (typeof window === "undefined") return INITIAL_WALLET;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WALLET;
    return JSON.parse(raw);
  } catch {
    return INITIAL_WALLET;
  }
}

export function saveWalletState(state: WalletState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("kartly_wallet_updated", { detail: state }));
  } catch {}
}

export function UserWalletModal({
  open,
  onOpenChange,
  initialTab = "main",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTab?: "main" | "add" | "pay" | "refunds" | "gift" | "cashback" | "rewards" | "history" | "settings";
}) {
  const [wallet, setWallet] = React.useState<WalletState>(getSavedWalletState);
  const [currentView, setCurrentView] = React.useState<
    "main" | "add" | "pay" | "refunds" | "gift" | "cashback" | "rewards" | "history" | "settings"
  >(initialTab);

  React.useEffect(() => {
    if (open) {
      setWallet(getSavedWalletState());
      setCurrentView("main");
    }
  }, [open]);

  React.useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail) setWallet(e.detail);
      else setWallet(getSavedWalletState());
    };
    window.addEventListener("kartly_wallet_updated", handleSync);
    return () => window.removeEventListener("kartly_wallet_updated", handleSync);
  }, []);

  // --- ADD MONEY STATE ---
  const [addAmount, setAddAmount] = React.useState<string>("1000");
  const [addMethod, setAddMethod] = React.useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessingAdd, setIsProcessingAdd] = React.useState(false);

  // --- PAY WITH WALLET STATE ---
  const [payAmount, setPayAmount] = React.useState<string>("499");
  const [payOrderId, setPayOrderId] = React.useState<string>("OD" + Math.floor(10000000 + Math.random() * 90000000));
  const [isProcessingPay, setIsProcessingPay] = React.useState(false);

  // --- GIFT CARD STATE ---
  const [giftCode, setGiftCode] = React.useState<string>("");

  // --- REWARDS CONVERT STATE ---
  const [isRedeemingPoints, setIsRedeemingPoints] = React.useState(false);

  // --- REFUND WITHDRAW STATE ---
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>("");
  const [withdrawUpi, setWithdrawUpi] = React.useState<string>("demo@okhdfcbank");
  const [isProcessingWithdraw, setIsProcessingWithdraw] = React.useState(false);

  // --- HISTORY FILTER ---
  const [historyFilter, setHistoryFilter] = React.useState<"all" | "credits" | "debits">("all");

  // UNCLAIMED REFUNDS COUNT
  const pendingRefunds = wallet.eligibleRefunds.filter((r) => !r.isClaimed);

  // 1. ACTION: ADD MONEY
  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt < 10) {
      toast.error("Invalid amount", { description: "Please enter at least ₹10 to add to wallet" });
      return;
    }
    setIsProcessingAdd(true);
    setTimeout(() => {
      const bonus = amt >= 1000 ? Math.round(amt * 0.05) : 0;
      const newBalance = wallet.balance + amt + bonus;
      const newCashback = wallet.cashback + bonus;

      const newTxn: WalletTransaction = {
        id: "txn-" + Date.now(),
        type: "topup",
        title: "Wallet Top-up",
        subtitle: `Added via ${addMethod.toUpperCase()} ${bonus > 0 ? `(+₹${bonus} Cashback)` : ""}`,
        amount: amt,
        date: "Just now",
        status: "Completed",
        refId: "TXN_TOP_" + Math.floor(100000 + Math.random() * 900000),
      };

      const updated: WalletState = {
        ...wallet,
        balance: newBalance,
        cashback: newCashback,
        transactions: [newTxn, ...wallet.transactions],
      };
      setWallet(updated);
      saveWalletState(updated);
      setIsProcessingAdd(false);
      toast.success(`₹${amt.toLocaleString("en-IN")} Added to Kartly Wallet!`, {
        description: bonus > 0 ? `You also received ₹${bonus} 5% bonus cashback!` : "Ready for instant payments.",
      });
      setCurrentView("main");
    }, 800);
  };

  // 2. ACTION: PAY WITH WALLET
  const handlePayWithWallet = () => {
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount", { description: "Please enter a valid amount to pay" });
      return;
    }
    if (amt > wallet.balance) {
      toast.error("Insufficient Balance", {
        description: `Wallet balance is ${inr(wallet.balance)}. Please add funds first.`,
      });
      return;
    }
    setIsProcessingPay(true);
    setTimeout(() => {
      const newBalance = wallet.balance - amt;
      const pointsEarned = Math.round(amt / 10); // 1 pt per ₹10 spent
      const newTxn: WalletTransaction = {
        id: "txn-" + Date.now(),
        type: "purchase",
        title: `Order #${payOrderId.slice(-7)}`,
        subtitle: "Instant 1-Click Store Payment (Zero OTP)",
        amount: amt,
        date: "Just now",
        status: "Completed",
        refId: "TXN_PAY_" + Math.floor(100000 + Math.random() * 900000),
      };
      const updated: WalletState = {
        ...wallet,
        balance: newBalance,
        rewardsPoints: wallet.rewardsPoints + pointsEarned,
        transactions: [newTxn, ...wallet.transactions],
      };
      setWallet(updated);
      saveWalletState(updated);
      setIsProcessingPay(false);
      toast.success(`Payment of ${inr(amt)} Successful!`, {
        description: `Paid with Kartly Wallet for Order #${payOrderId}. Earned +${pointsEarned} reward points!`,
      });
      setCurrentView("main");
    }, 800);
  };

  // 3. ACTION: CLAIM ORDER REFUND
  const handleClaimRefund = (refund: EligibleRefund) => {
    const updatedRefunds = wallet.eligibleRefunds.map((r) =>
      r.id === refund.id ? { ...r, isClaimed: true } : r
    );
    const newBalance = wallet.balance + refund.amount;
    const newTxn: WalletTransaction = {
      id: "txn-" + Date.now(),
      type: "refund",
      title: "Order Refund",
      subtitle: `${refund.itemTitle} (Order #${refund.orderId})`,
      amount: refund.amount,
      date: "Just now",
      status: "Completed",
      refId: "TXN_REF_" + Math.floor(100000 + Math.random() * 900000),
    };
    const updated: WalletState = {
      ...wallet,
      balance: newBalance,
      eligibleRefunds: updatedRefunds,
      transactions: [newTxn, ...wallet.transactions],
    };
    setWallet(updated);
    saveWalletState(updated);
    toast.success(`₹${refund.amount.toLocaleString("en-IN")} Refund Credited!`, {
      description: `Order #${refund.orderId} funds are now available in your balance.`,
    });
  };

  // 4. ACTION: WITHDRAW REFUND TO BANK / UPI
  const handleWithdrawToBank = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 50) {
      toast.error("Invalid amount", { description: "Minimum bank withdrawal is ₹50" });
      return;
    }
    if (amt > wallet.balance) {
      toast.error("Insufficient Balance", { description: `Your available balance is ${inr(wallet.balance)}` });
      return;
    }
    setIsProcessingWithdraw(true);
    setTimeout(() => {
      const newBalance = wallet.balance - amt;
      const newTxn: WalletTransaction = {
        id: "txn-" + Date.now(),
        type: "withdrawal",
        title: "Bank Payout Transfer",
        subtitle: `Sent to UPI ID: ${withdrawUpi || "demo@okhdfc"}`,
        amount: amt,
        date: "Just now",
        status: "Completed",
        refId: "TXN_WTH_" + Math.floor(100000 + Math.random() * 900000),
      };
      const updated: WalletState = {
        ...wallet,
        balance: newBalance,
        transactions: [newTxn, ...wallet.transactions],
      };
      setWallet(updated);
      saveWalletState(updated);
      setIsProcessingWithdraw(false);
      setWithdrawAmount("");
      toast.success(`${inr(amt)} Transferred to Your Bank Account!`, {
        description: `Sent to ${withdrawUpi}. UTR: 20260909${Math.floor(100000 + Math.random() * 900000)}.`,
      });
      setCurrentView("main");
    }, 900);
  };

  // 5. ACTION: REDEEM GIFT CARD CODE
  const handleRedeemGiftCard = () => {
    const code = giftCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a gift voucher code");
      return;
    }
    let value = 250;
    if (code.includes("500")) value = 500;
    else if (code.includes("1000")) value = 1000;
    else if (code.includes("100")) value = 100;

    const newBalance = wallet.balance + value;
    const newTxn: WalletTransaction = {
      id: "txn-" + Date.now(),
      type: "gift",
      title: "Gift Voucher Redeemed",
      subtitle: `Code: ${code}`,
      amount: value,
      date: "Just now",
      status: "Completed",
      refId: "TXN_GFT_" + Math.floor(100000 + Math.random() * 900000),
    };
    const updated: WalletState = {
      ...wallet,
      balance: newBalance,
      transactions: [newTxn, ...wallet.transactions],
    };
    setWallet(updated);
    saveWalletState(updated);
    setGiftCode("");
    toast.success(`🎉 ${inr(value)} Gift Voucher Redeemed!`, {
      description: `Card ${code} successfully added to your balance.`,
    });
    setCurrentView("main");
  };

  // 6. ACTION: REDEEM REWARD POINTS
  const handleRedeemPoints = () => {
    if (wallet.rewardsPoints < 500) {
      toast.error("Insufficient Reward Points", { description: "You need at least 500 pts to redeem ₹50 cash" });
      return;
    }
    setIsRedeemingPoints(true);
    setTimeout(() => {
      const ptsToUse = 500;
      const cashCredit = 50;
      const newPoints = wallet.rewardsPoints - ptsToUse;
      const newBalance = wallet.balance + cashCredit;
      const newTxn: WalletTransaction = {
        id: "txn-" + Date.now(),
        type: "cashback",
        title: "Reward Points Redeemed",
        subtitle: `Converted ${ptsToUse} pts to Wallet Cash`,
        amount: cashCredit,
        date: "Just now",
        status: "Completed",
        refId: "TXN_RWD_" + Math.floor(100000 + Math.random() * 900000),
      };
      const updated: WalletState = {
        ...wallet,
        balance: newBalance,
        rewardsPoints: newPoints,
        transactions: [newTxn, ...wallet.transactions],
      };
      setWallet(updated);
      saveWalletState(updated);
      setIsRedeemingPoints(false);
      toast.success(`Redeemed 500 pts for ₹50 Wallet Cash!`, {
        description: `New reward balance: ${newPoints} pts.`,
      });
      setCurrentView("main");
    }, 700);
  };

  // Filtered transactions for History view
  const filteredTxns = React.useMemo(() => {
    if (historyFilter === "credits") {
      return wallet.transactions.filter((t) => t.type === "refund" || t.type === "cashback" || t.type === "topup" || t.type === "gift");
    }
    if (historyFilter === "debits") {
      return wallet.transactions.filter((t) => t.type === "purchase" || t.type === "withdrawal");
    }
    return wallet.transactions;
  }, [wallet.transactions, historyFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[92vh] overflow-y-auto p-0 rounded-3xl border border-border/80 bg-card text-foreground shadow-2xl overflow-hidden font-sans">
        {/* SUB-VIEW HEADER (If not in main view) */}
        {currentView !== "main" ? (
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40 sticky top-0 z-20 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-amber-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Wallet</span>
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {currentView === "add" && "Add Money"}
              {currentView === "pay" && "Pay with Wallet"}
              {currentView === "refunds" && "Refunds & Claims"}
              {currentView === "gift" && "Gift Cards"}
              {currentView === "cashback" && "Cashback Offers"}
              {currentView === "rewards" && "Super Rewards"}
              {currentView === "history" && "All Transactions"}
              {currentView === "settings" && "Wallet Settings"}
            </span>
          </div>
        ) : (
          /* MAIN TOP HEADER */
          <DialogHeader className="p-4 pb-2 border-b border-border/50 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-400 text-zinc-950 font-black shadow-xs">
                <Wallet className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-black tracking-wider uppercase text-amber-400">
                  KARTLY WALLET
                </DialogTitle>
                <DialogDescription className="text-[10px] text-zinc-400">
                  Instant Pay • Returns Refund • RBI Compliant
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="size-3" /> ACTIVE
              </span>
            </div>
          </DialogHeader>
        )}

        {/* MAIN VIEW CONTENT (Follows exact ASCII structure) */}
        {currentView === "main" && (
          <div className="p-4 space-y-4">
            {/* 1. TOP SECTION: AVAILABLE BALANCE FINTECH CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 text-white border border-amber-500/30 shadow-xl">
              {/* Subtle background glow */}
              <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 p-3 opacity-20 text-amber-400">
                <Coins className="size-16" />
              </div>

              {/* EMV Chip & Contactless Indicator */}
              <div className="flex items-center justify-between relative z-10 mb-2">
                <div className="flex items-center gap-2">
                  {/* Metallic Chip Graphic */}
                  <div className="w-8 h-6 rounded-sm bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-5 h-3.5 border border-amber-600/50 rounded-xs" />
                  </div>
                  <Zap className="size-3.5 text-amber-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase">
                  KartlyPay Pass
                </span>
              </div>

              {/* Available Balance */}
              <div className="relative z-10 my-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Available Balance
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {inr(wallet.balance)}
                  </h2>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    Ready
                  </span>
                </div>
              </div>

              {/* Action Buttons: [+ Add Money]  [Pay with Wallet] */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setCurrentView("add")}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="size-4 stroke-[2.5]" />
                  + Add Money
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView("pay")}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-xs font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  Pay with Wallet
                </button>
              </div>
            </div>

            {/* 2. CASHBACK & REWARDS ROW */}
            <div className="grid grid-cols-2 gap-3">
              {/* Cashback Card */}
              <div
                onClick={() => setCurrentView("cashback")}
                className="p-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Tag className="size-3 text-emerald-500" /> Cashback
                  </span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-foreground">{inr(wallet.cashback)}</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Instant Store Cash
                </span>
              </div>

              {/* Rewards Card */}
              <div
                onClick={() => setCurrentView("rewards")}
                className="p-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Star className="size-3 text-amber-500 fill-amber-500" /> Rewards
                  </span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-foreground">
                    {wallet.rewardsPoints.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold">pts</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
                  ≈ ₹{Math.round(wallet.rewardsPoints / 10)} Value
                </span>
              </div>
            </div>

            {/* 3. QUICK ACTIONS (6 Interactive Cards) */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Refunds */}
                <button
                  type="button"
                  onClick={() => setCurrentView("refunds")}
                  className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <RotateCcw className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Refunds</span>
                  {pendingRefunds.length > 0 && (
                    <span className="absolute -top-1.5 -right-1 size-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center animate-bounce">
                      {pendingRefunds.length}
                    </span>
                  )}
                </button>

                {/* 2. Gift Cards */}
                <button
                  type="button"
                  onClick={() => setCurrentView("gift")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Gift className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Gift Cards</span>
                </button>

                {/* 3. Cashback */}
                <button
                  type="button"
                  onClick={() => setCurrentView("cashback")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Tag className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Cashback</span>
                </button>

                {/* 4. Rewards */}
                <button
                  type="button"
                  onClick={() => setCurrentView("rewards")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Star className="size-4 fill-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Rewards</span>
                </button>

                {/* 5. History */}
                <button
                  type="button"
                  onClick={() => setCurrentView("history")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <FileText className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">History</span>
                </button>

                {/* 6. Settings */}
                <button
                  type="button"
                  onClick={() => setCurrentView("settings")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-amber-500/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-zinc-500/10 text-zinc-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Settings className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Settings</span>
                </button>
              </div>
            </div>

            {/* 4. RECENT TRANSACTIONS SECTION */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Recent Transactions
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView("history")}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  View All →
                </button>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-border/60 rounded-2xl border border-border bg-card overflow-hidden">
                {wallet.transactions.slice(0, 3).map((txn) => {
                  const isCredit =
                    txn.type === "refund" || txn.type === "cashback" || txn.type === "topup" || txn.type === "gift";

                  return (
                    <div
                      key={txn.id}
                      className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-xl flex items-center justify-center ${
                            isCredit
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {txn.type === "refund" && <RotateCcw className="size-4" />}
                          {txn.type === "cashback" && <Tag className="size-4" />}
                          {txn.type === "topup" && <ArrowDownLeft className="size-4" />}
                          {txn.type === "gift" && <Gift className="size-4" />}
                          {txn.type === "purchase" && <ArrowUpRight className="size-4" />}
                          {txn.type === "withdrawal" && <Building className="size-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-tight">{txn.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                            {txn.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-black ${
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                          }`}
                        >
                          {isCredit ? `+ ${inr(txn.amount)}` : `- ${inr(txn.amount)}`}
                        </span>
                        <span className="block text-[9px] text-muted-foreground/80 font-medium">
                          {txn.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 1: ADD MONEY --- */}
        {currentView === "add" && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <label className="block text-xs font-bold text-foreground mb-1">
                Enter Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-xl font-black text-foreground focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="flex items-center gap-2 mt-3">
                {["500", "1000", "2000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      addAmount === amt
                        ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-xs"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    +₹{parseInt(amt).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {parseFloat(addAmount) >= 1000 && (
                <p className="mt-2.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="size-3.5" /> 5% Cashback bonus eligible (+₹{Math.round(parseFloat(addAmount) * 0.05)})!
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "upi", label: "UPI / GPay", icon: Smartphone },
                  { id: "card", label: "Cards", icon: CreditCard },
                  { id: "netbanking", label: "NetBanking", icon: Building },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAddMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      addMethod === m.id
                        ? "border-amber-500 bg-amber-500/10 font-bold text-foreground ring-1 ring-amber-500"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <m.icon className="size-4 mx-auto mb-1 text-amber-500" />
                    <span className="text-[11px] block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMoney}
              disabled={isProcessingAdd}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingAdd ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Adding Funds...
                </>
              ) : (
                <>
                  <ArrowDownLeft className="size-4" /> Add {addAmount ? inr(parseFloat(addAmount) || 0) : "₹0"} to Wallet
                </>
              )}
            </button>
          </div>
        )}

        {/* --- SUB-VIEW 2: PAY WITH WALLET --- */}
        {currentView === "pay" && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Amount to Pay (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="499"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-lg font-black text-foreground focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Kartly Order ID or Merchant
                </label>
                <input
                  type="text"
                  value={payOrderId}
                  onChange={(e) => setPayOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Available in Wallet:</span>
                <span className="font-black text-foreground">{inr(wallet.balance)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayWithWallet}
              disabled={isProcessingPay}
              className="w-full py-3 rounded-xl bg-zinc-950 text-amber-400 border border-amber-400 hover:bg-zinc-900 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingPay ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Authorizing 1-Click Pay...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Pay {payAmount ? inr(parseFloat(payAmount) || 0) : "₹0"} with 1-Click
                </>
              )}
            </button>
          </div>
        )}

        {/* --- SUB-VIEW 3: REFUNDS & CLAIMS --- */}
        {currentView === "refunds" && (
          <div className="p-4 space-y-4">
            {/* Instant Refund Claims */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <RotateCcw className="size-3.5 text-rose-500" /> Pending Order Refunds
              </span>

              {wallet.eligibleRefunds.length > 0 ? (
                <div className="space-y-2">
                  {wallet.eligibleRefunds.map((refund) => (
                    <div
                      key={refund.id}
                      className={`p-3 rounded-xl border ${
                        !refund.isClaimed
                          ? "border-rose-500/40 bg-rose-500/5"
                          : "border-border bg-card opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">
                            #{refund.orderId}
                          </span>
                          <h4 className="text-xs font-bold text-foreground leading-tight mt-0.5">
                            {refund.itemTitle}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{refund.reason}</p>
                        </div>
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                          {inr(refund.amount)}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{refund.date}</span>
                        {!refund.isClaimed ? (
                          <button
                            type="button"
                            onClick={() => handleClaimRefund(refund)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ArrowDownLeft className="size-3" /> Claim to Wallet
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Credited
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No active refund claims.</p>
              )}
            </div>

            {/* Transfer to Bank Payout */}
            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building className="size-3.5 text-blue-500" /> Transfer Balance to Bank / UPI
              </span>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Amount (Max ${wallet.balance})`}
                  className="w-full pl-7 pr-14 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(wallet.balance))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 hover:underline"
                >
                  MAX
                </button>
              </div>

              <input
                type="text"
                value={withdrawUpi}
                onChange={(e) => setWithdrawUpi(e.target.value)}
                placeholder="UPI ID (e.g. user@okhdfcbank)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleWithdrawToBank}
                disabled={isProcessingWithdraw || !withdrawAmount}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessingWithdraw ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" /> Processing IMPS Payout...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" /> Transfer {withdrawAmount ? inr(parseFloat(withdrawAmount) || 0) : "₹0"} to Bank
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 4: GIFT CARDS --- */}
        {currentView === "gift" && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="size-5 text-purple-500" />
                <h4 className="text-xs font-bold text-foreground">Redeem Kartly Gift Voucher</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enter your 16-digit voucher code or try test codes <strong className="text-purple-600 dark:text-purple-400">GIFT100</strong>, <strong className="text-purple-600 dark:text-purple-400">GIFT500</strong>.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  placeholder="e.g. GIFT500"
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-xs font-mono uppercase tracking-wider text-foreground focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleRedeemGiftCard}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 5: CASHBACK --- */}
        {currentView === "cashback" && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center space-y-2">
              <span className="inline-block p-3 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Tag className="size-6" />
              </span>
              <h3 className="text-base font-black text-foreground">Kartly Super Cashback</h3>
              <p className="text-xs text-muted-foreground">
                Earn flat 5% instant cashback on all top-ups above ₹1,000 and 10% on brand partner purchases.
              </p>
              <div className="p-3 bg-card rounded-xl border border-border inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Current Cashback Balance: {inr(wallet.cashback)}
              </div>
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 6: REWARDS --- */}
        {currentView === "rewards" && (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-2">
              <Star className="size-8 text-amber-500 fill-amber-500 mx-auto" />
              <h3 className="text-base font-black text-foreground">
                {wallet.rewardsPoints.toLocaleString("en-IN")} Reward Points
              </h3>
              <p className="text-xs text-muted-foreground">
                Earn 1 point for every ₹10 spent using your Kartly Wallet.
              </p>
              <button
                type="button"
                onClick={handleRedeemPoints}
                disabled={isRedeemingPoints || wallet.rewardsPoints < 500}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isRedeemingPoints ? "Redeeming..." : "Redeem 500 pts for ₹50 Wallet Cash"}
              </button>
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 7: HISTORY --- */}
        {currentView === "history" && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-[11px] font-bold">
              {[
                { id: "all", label: "All" },
                { id: "credits", label: "+ Credits" },
                { id: "debits", label: "- Debits" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={`flex-1 py-1 rounded-lg text-center cursor-pointer transition-all ${
                    historyFilter === f.id
                      ? "bg-card text-foreground shadow-2xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTxns.map((txn) => {
                const isCredit =
                  txn.type === "refund" || txn.type === "cashback" || txn.type === "topup" || txn.type === "gift";
                return (
                  <div
                    key={txn.id}
                    className="p-3 rounded-xl border border-border bg-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-7 rounded-lg flex items-center justify-center ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{txn.title}</p>
                        <p className="text-[10px] text-muted-foreground">{txn.subtitle}</p>
                        <span className="text-[9px] font-mono text-muted-foreground/70">
                          {txn.refId} • {txn.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-black ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        }`}
                      >
                        {isCredit ? `+ ${inr(txn.amount)}` : `- ${inr(txn.amount)}`}
                      </span>
                      <span className="block text-[9px] text-emerald-600 font-bold">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- SUB-VIEW 8: SETTINGS --- */}
        {currentView === "settings" && (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Instant Wallet Refunds</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Credit order cancellations directly to wallet in 2 mins
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !wallet.instantRefundEnabled;
                    const u = { ...wallet, instantRefundEnabled: next };
                    setWallet(u);
                    saveWalletState(u);
                    toast.success(next ? "Instant Refunds Enabled" : "Standard Bank Mode Selected");
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    wallet.instantRefundEnabled ? "bg-emerald-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition ${
                      wallet.instantRefundEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Wallet PIN Protection</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Require 4-digit PIN before approving wallet payments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !wallet.pinLockEnabled;
                    const u = { ...wallet, pinLockEnabled: next };
                    setWallet(u);
                    saveWalletState(u);
                    toast.success(next ? "PIN Security Enabled" : "PIN Security Disabled");
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    wallet.pinLockEnabled ? "bg-amber-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition ${
                      wallet.pinLockEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM BRAND FOOTER */}
        <div className="p-3 border-t border-border bg-muted/20 text-center text-[10px] text-muted-foreground flex items-center justify-between px-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-500" /> 256-Bit Bank Encryption
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="font-bold text-foreground hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
