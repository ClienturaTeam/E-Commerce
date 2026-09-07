import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { DollarSign, FileText, CheckCircle2, TrendingUp, RefreshCw, LogOut } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/finance/dashboard")({
  component: FinanceDashboardRoute,
});

function FinanceDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="FINANCE">
      <FinanceDashboardPage />
    </RequirePortalAuth>
  );
}

function FinanceDashboardPage() {
  const { user, logout, logAction } = useEnterpriseAuth();

  const handleDisburseSettlement = (seller: string, amount: string) => {
    logAction(`Disbursed settlement of ${amount} to ${seller}`);
    toast.success(`Settlement Disbursed`, { description: `Transferred ${amount} to ${seller} bank account.` });
  };

  const handleDownloadGst = () => {
    logAction("Generated Monthly GST Tax Compliance Report");
    toast.success("GST Report Generated", { description: "Report downloaded as GSTR-3B_AUG_2026.pdf" });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Finance Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center border border-emerald-300">
              <DollarSign className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Finance Comptroller"}</h1>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded">
                  Audit Clearance: LEVEL 3
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Payment Reconciliation · Seller Disbursals · GST Filings</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadGst}
              className="bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 cursor-pointer"
            >
              <FileText className="size-4" /> Download GST Compliance Report
            </button>
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Finance Financial Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Monthly Gross Volume</span>
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-foreground">₹2,84,90,000</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Pending Settlements</span>
              <RefreshCw className="size-4 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-amber-600">₹18,40,000</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">GST Liability</span>
              <FileText className="size-4 text-brand" />
            </div>
            <p className="text-xl font-extrabold text-foreground">₹34,18,200</p>
          </div>

          <div className="border border-border bg-card p-4 rounded-lg space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Reconciliation Match</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="text-xl font-extrabold text-emerald-600">99.98%</p>
          </div>
        </div>

        {/* Seller Payout & Settlement Approval Queue */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Pending Seller Settlement Disbursals</span>
            <span className="text-xs text-muted-foreground">Automatic NEFT/RTGS Gateway</span>
          </h2>

          <div className="divide-y divide-border text-xs">
            {[
              { seller: "Apex Retailers Pvt Ltd", amount: "₹64,200", bank: "HDFC Bank (A/C: ****8910)" },
              { seller: "Loomwear Fashion Hub", amount: "₹1,28,900", bank: "ICICI Bank (A/C: ****4920)" },
              { seller: "TechNova Electronics", amount: "₹45,000", bank: "State Bank of India (A/C: ****1102)" },
            ].map((s, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-foreground">{s.seller}</p>
                  <p className="text-muted-foreground text-[11px]">{s.bank}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-extrabold text-foreground">{s.amount}</span>
                  <button
                    onClick={() => handleDisburseSettlement(s.seller, s.amount)}
                    className="bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                  >
                    Disburse Payout →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
