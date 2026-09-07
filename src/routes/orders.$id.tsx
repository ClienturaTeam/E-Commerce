import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  XCircle,
  Truck,
  RotateCcw,
  FileText,
  Tag,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  return (
    <StoreProvider>
      <OrderDetailPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function OrderDetailPage() {
  const { id } = useParams({ from: "/orders/$id" });
  const { orders, cancelOrder, requestReturn } = useStore();

  const order = orders.find((o) => o.id === id);

  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("Changed my mind");

  if (!order) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col justify-between">
        <SiteHeader />
        <main className="mx-auto max-w-[800px] w-full px-4 py-16 text-center">
          <div className="rounded-xl border border-border bg-card p-10 shadow-sm space-y-4">
            <Package className="mx-auto size-12 text-muted-foreground opacity-50" />
            <h1 className="text-xl font-bold text-foreground">Order Not Found</h1>
            <p className="text-xs text-muted-foreground">
              We couldn't find an order with ID <strong className="text-foreground">{id}</strong>.
            </p>
            <Link
              to="/orders"
              className="inline-block rounded-md bg-brand px-6 py-2 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer"
            >
              Back to My Orders
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  const isCanCancel =
    order.status === "PLACED" || order.status === "CONFIRMED" || order.status === "PACKED";

  // Timeline steps definition
  const steps = [
    { key: "PLACED", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PACKED", label: "Packed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const statusOrder = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-4 py-8 space-y-6">
        {/* Navigation back & Invoice Download */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to All Orders
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">ID: {order.id}</span>
            <button
              onClick={() => window.print()}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <FileText className="size-3.5" />
              Download Tax Invoice
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground">Order Details</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on {order.date} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-brand">{inr(order.totalAmount)}</span>
            {isCancelled ? (
              <span className="rounded bg-red-500/10 px-2.5 py-1 text-xs font-extrabold text-red-600 dark:text-red-400 border border-red-500/20">
                CANCELLED
              </span>
            ) : isDelivered ? (
              <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                DELIVERED
              </span>
            ) : (
              <span className="rounded bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {order.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {/* Timeline Stepper (If Active) */}
        {!isCancelled && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Truck className="size-4 text-brand" />
                Delivery Tracking
              </h2>
              <span className="text-xs text-muted-foreground">
                Estimated Delivery: <strong className="text-foreground">{order.estimatedDelivery}</strong>
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 pt-2">
              {steps.map((step, idx) => {
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-brand text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground border border-border"
                      } ${isCurrent ? "ring-2 ring-brand ring-offset-2" : ""}`}
                    >
                      {isPassed ? <CheckCircle2 className="size-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        isPassed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancellation Box if Cancelled */}
        {isCancelled && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-400 space-y-2">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <XCircle className="size-5" />
              This order was cancelled
            </h2>
            <p className="text-xs">
              Cancellation Reason: <strong>{order.cancellationReason || "Changed my mind"}</strong>
            </p>
            {order.refundStatus && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Mock Refund Status: {order.refundStatus} ({inr(order.totalAmount)} via {order.payment.providerName || "Original Payment"})
              </p>
            )}
          </div>
        )}

        {/* Two-Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Purchased Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                Purchased Items ({Array.isArray(order.items) ? order.items.length : 0})
              </h2>

              <div className="divide-y divide-border">
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => {
                    const prod = item?.product || {};
                    return (
                      <div key={prod.id || idx} className="flex gap-4 py-3">
                        <img
                          src={prod.image || "https://picsum.photos/100"}
                          alt={prod.title || "Product"}
                          className="size-20 object-contain border border-border rounded-md bg-muted p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-foreground line-clamp-2">
                            {prod.title || "Ordered Product"}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Brand: {prod.brand || "Kartly"} · Qty: {item?.qty || 1}
                          </p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-sm font-black text-foreground">
                              {inr(item?.priceAtPurchase || prod.price || 0)}
                            </span>
                            {prod.mrp ? (
                              <span className="text-xs text-muted-foreground line-through">
                                {inr(prod.mrp)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic py-3">Order confirmed. Item details recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Address & Payment Summary */}
          <div className="space-y-4">
            {/* Delivery Address */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2 text-xs">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm border-b border-border pb-2">
                <MapPin className="size-4 text-brand" />
                Delivery Address
              </h3>
              <p className="font-bold text-foreground">{order.address?.name || "Valued Customer"}</p>
              <p className="text-muted-foreground">{order.address?.house || "123 Main Street"}</p>
              <p className="text-muted-foreground">{order.address?.street || "Sector 4"}</p>
              <p className="text-muted-foreground">
                {order.address?.city || "Bengaluru"}, {order.address?.state || "Karnataka"} - {order.address?.pincode || "560001"}
              </p>
              <p className="text-muted-foreground pt-1">Phone: {order.address?.phone || "+91 9876543210"}</p>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2 text-xs">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm border-b border-border pb-2">
                <CreditCard className="size-4 text-brand" />
                Payment Method
              </h3>
              <p className="font-bold text-foreground capitalize">
                {(order.payment?.method || "UPI").toUpperCase()} ({order.payment?.providerName || "Card/UPI"})
              </p>
              <p className="text-muted-foreground">
                Status: <strong className="text-emerald-600">Paid / Verified</strong>
              </p>
            </div>

            {/* Price Detailed Breakdown */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-3 text-xs">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm border-b border-border pb-2">
                <Tag className="size-4 text-brand" />
                Price Breakdown
              </h3>
              <div className="flex justify-between text-muted-foreground">
                <span>Item Subtotal ({order.items.length} items)</span>
                <span className="font-semibold text-foreground">{inr(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST & Statutory Taxes</span>
                <span className="font-semibold text-brand">+{inr(Math.round(order.subtotal * 0.1))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                {order.deliveryCharge === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-foreground">{inr(order.deliveryCharge)}</span>
                )}
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{inr(order.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-border pt-2.5 flex justify-between font-extrabold text-sm text-foreground">
                <span>Final Paid Amount</span>
                <span className="text-brand font-black">{inr(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
