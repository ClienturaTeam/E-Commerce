import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PackageCheck, QrCode, CheckCircle2, Truck, LogOut } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/warehouse/dashboard")({
  component: WarehouseDashboardRoute,
});

function WarehouseDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="WAREHOUSE">
      <WarehouseDashboardPage />
    </RequirePortalAuth>
  );
}

function WarehouseDashboardPage() {
  const { user, logout } = useEnterpriseAuth();

  const [queue, setQueue] = React.useState([
    { id: "ORD-9481", item: "Nexon Pro Max Headphones", step: "PICK", bin: "A4-RACK-02" },
    { id: "ORD-9482", item: "Loomwear Silk Blend Saree", step: "PACK", bin: "B1-RACK-09" },
    { id: "ORD-9483", item: "Wireless Earbuds Studio Pro", step: "DISPATCH", bin: "C3-DOCK-01" },
  ]);

  const handleNextStep = (orderId: string) => {
    setQueue((prev) =>
      prev.map((q) => {
        if (q.id === orderId) {
          if (q.step === "PICK") return { ...q, step: "PACK" };
          if (q.step === "PACK") return { ...q, step: "DISPATCH" };
          return { ...q, step: "COMPLETED" };
        }
        return q;
      }),
    );
    toast.success(`Workflow Updated for ${orderId}`);
  };

  const handleScanBarcode = () => {
    toast("Barcode Scanned: BARCODE-KART-98402", { description: "Matched item Nexon Pro Max in Bin A4-RACK-02" });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Warehouse Banner */}
        <div className="border border-border bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center border border-emerald-300">
              <PackageCheck className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{user?.name || "Rajesh Kumar (Packing Station)"}</h1>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded">
                  Station: WH-BLR-04
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Workflow: PICK → PACK → DISPATCH · Live Barcode Scanner Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleScanBarcode}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
            >
              <QrCode className="size-4" /> Simulate Barcode Scan
            </button>
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Logout Station
            </button>
          </div>
        </div>

        {/* Dispatch Queue Workflow */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Warehouse Order Queue (Pick → Pack → Dispatch)</span>
            <span className="text-xs text-emerald-600 font-bold">3 Active Tasks</span>
          </h2>

          <div className="divide-y divide-border text-xs">
            {queue.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>Order #{item.id}</span>
                    <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground">{item.bin}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{item.item}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      item.step === "PICK" ? "bg-amber-100 text-amber-900" :
                      item.step === "PACK" ? "bg-purple-100 text-purple-900" :
                      item.step === "DISPATCH" ? "bg-blue-100 text-blue-900" : "bg-emerald-100 text-emerald-900"
                    }`}>
                      {item.step}
                    </span>
                  </div>

                  {item.step !== "COMPLETED" ? (
                    <button
                      onClick={() => handleNextStep(item.id)}
                      className="bg-brand text-primary-foreground px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                    >
                      Advance Step →
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Dispatched
                    </span>
                  )}
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
