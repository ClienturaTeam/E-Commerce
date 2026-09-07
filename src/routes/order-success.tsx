import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { CheckCircle2, PackageCheck, ArrowRight, Truck, Home, ShoppingBag, ShieldCheck, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: (search.orderId as string) || undefined,
  }),
  component: OrderSuccessRoute,
});

function OrderSuccessRoute() {
  return (
    <StoreProvider>
      <OrderSuccessPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function OrderSuccessPage() {
  const { orders, savedAddress, buyNowProduct, cart, clearCart, setBuyNowProduct } = useStore();
  const search = Route.useSearch();

  const orderIdFromParam = React.useMemo(() => {
    if (search.orderId) return search.orderId;
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("kartly.lastOrderId");
      }
    } catch {}
    return null;
  }, [search.orderId]);

  const currentOrder = React.useMemo(() => {
    if (orderIdFromParam) {
      const found = orders.find((o) => o.id === orderIdFromParam);
      if (found) return found;
    }
    return orders.length > 0 ? orders[0] : null;
  }, [orderIdFromParam, orders]);

  const displayOrderId = currentOrder?.id || orderIdFromParam || "KARTLY-ORD-849201";

  const orderItems = React.useMemo(() => {
    if (currentOrder && currentOrder.items && currentOrder.items.length > 0) {
      return currentOrder.items;
    }
    if (buyNowProduct) return [buyNowProduct];
    if (cart && cart.length > 0) return cart;
    return [];
  }, [currentOrder, buyNowProduct, cart]);

  const totalPaid = currentOrder?.totalAmount || orderItems.reduce((n, l) => n + l.qty * l.product.price, 0);

  const addr = currentOrder?.address;
  const addressName = addr?.name || savedAddress?.fullName || "Valued Customer";
  const addressLine = addr ? `${addr.house}, ${addr.street}` : savedAddress?.addressLine || "123 Main Street, Sector 4";
  const addressCityState = addr
    ? `${addr.city}, ${addr.state} - ${addr.pincode}`
    : `${savedAddress?.city || "Bengaluru"}, ${savedAddress?.state || "Karnataka"} - ${savedAddress?.pincode || "560001"}`;
  const addressPhone = addr?.phone || savedAddress?.phone || "+91 9876543210";

  // Clean up order transient state on mount
  React.useEffect(() => {
    setBuyNowProduct(null);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("buyNowProduct");
      }
    } catch {}
  }, [setBuyNowProduct]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1000px] px-4 py-12 space-y-8 text-center">
        {/* SUCCESS ICON & HEADER */}
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shadow-xl">
            <CheckCircle2 className="size-12 stroke-[2.5]" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xs">
            ORDER PLACED SUCCESSFULLY
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Thank You For Your Order!
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
            Order <span className="font-bold text-foreground font-mono">{displayOrderId}</span> has been confirmed and is being processed for express delivery.
          </p>
        </div>

        {/* ORDER SUMMARY & DELIVERY DETAILS CONTAINER */}
        <div className="grid gap-6 md:grid-cols-2 text-left border border-border bg-card p-6 md:p-8 rounded-3xl shadow-sm">
          {/* Left: Shipping Address */}
          <div className="space-y-4 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Truck className="size-4 text-emerald-600" /> Delivery Address
            </h2>
            <div className="space-y-1 text-xs font-semibold text-foreground bg-muted/50 p-4 rounded-2xl border border-border/60">
              <p className="font-bold text-sm text-foreground">{addressName}</p>
              <p>{addressLine}</p>
              <p>{addressCityState}</p>
              <p className="text-muted-foreground pt-1">Phone: {addressPhone}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <PackageCheck className="size-4 shrink-0" />
              <span>Estimated Delivery: Within 24-48 Hours</span>
            </div>
          </div>

          {/* Right: Ordered Products */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="size-4 text-brand" /> Order Items ({orderItems.length})
            </h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {orderItems.length > 0 ? (
                orderItems.map((line, idx) => (
                  <div key={line.product?.id || idx} className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl border border-border/40">
                    <img
                      src={line.product?.image || "https://picsum.photos/100"}
                      alt={line.product?.title || "Product"}
                      className="size-12 object-cover rounded-lg border border-border bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{line.product?.title || "Purchased Product"}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {line.qty} × {inr(line.product?.price || 0)}</p>
                    </div>
                    <span className="text-xs font-black text-foreground">{inr(line.qty * (line.product?.price || 0))}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Order confirmed. Item details recorded.</p>
              )}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Smartphone className="size-3.5 text-emerald-600" />
                  {currentOrder?.payment?.providerName
                    ? `UPI (${currentOrder.payment.providerName})`
                    : "UPI (Google Pay / PhonePe / Paytm)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-bold text-foreground">{displayOrderId}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-border/50">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 text-lg font-black">{inr(totalPaid > 0 ? totalPaid : 999)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            onClick={() => clearCart()}
            className="px-6 py-3 bg-brand hover:bg-brand-deep text-primary-foreground font-black text-xs uppercase rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Home className="size-4" /> Return to Store
          </Link>
          <Link
            to="/customer/dashboard"
            className="px-6 py-3 bg-card border border-border hover:border-brand text-foreground font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
          >
            View Order History
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
