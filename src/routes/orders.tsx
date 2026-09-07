import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
  ShoppingBag,
  Star,
  Settings,
  ShieldCheck,
  RefreshCw,
  FileText,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";
import type { OrderStatus } from "@/components/store/types";

export const Route = createFileRoute("/orders")({
  component: OrdersRoute,
});

function OrdersRoute() {
  return (
    <StoreProvider>
      <OrdersPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function OrdersPage() {
  const {
    user,
    orders,
    openAuthModal,
    cancelOrder,
    requestReturn,
    updateOrderStatus,
    rateProduct,
    reorderItems,
  } = useStore();

  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "delivered" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals state
  const [cancelModalOrderId, setCancelModalOrderId] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("Changed my mind");

  const [returnModalOrderId, setReturnModalOrderId] = React.useState<string | null>(null);
  const [returnReason, setReturnReason] = React.useState("Damaged product");

  const [rateModalOrderId, setRateModalOrderId] = React.useState<string | null>(null);
  const [ratingStars, setRatingStars] = React.useState(5);
  const [reviewText, setReviewText] = React.useState("");

  // Dev Controller toggle
  const [showAdminController, setShowAdminController] = React.useState(false);

  // Safe Orders Array
  const safeOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => Boolean(o && o.id));
  }, [orders]);

  // Require Auth
  React.useEffect(() => {
    if (!user || !user.isAuth) {
      openAuthModal("Please log in to view your orders.");
    }
  }, [user, openAuthModal]);

  // Counts
  const counts = React.useMemo(() => {
    let active = 0;
    let delivered = 0;
    let cancelled = 0;

    safeOrders.forEach((o) => {
      const status = o.status || "PLACED";
      if (status === "DELIVERED") delivered++;
      else if (status === "CANCELLED" || status === "RETURNED" || status === "REFUNDED") cancelled++;
      else active++;
    });

    return { all: safeOrders.length, active, delivered, cancelled };
  }, [safeOrders]);

  const filteredOrders = React.useMemo(() => {
    return safeOrders.filter((o) => {
      // Tab filter
      const status = o.status || "PLACED";
      const isDelivered = status === "DELIVERED";
      const isCancelled = status === "CANCELLED" || status === "RETURNED" || status === "REFUNDED";
      const isActive = !isDelivered && !isCancelled;

      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "delivered" && !isDelivered) return false;
      if (activeTab === "cancelled" && !isCancelled) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchId = (o.id || "").toLowerCase().includes(q);
      const items = Array.isArray(o.items) ? o.items : [];
      const matchItem = items.some(
        (item: any) =>
          item?.product?.title?.toLowerCase().includes(q) ||
          item?.product?.brand?.toLowerCase().includes(q)
      );

      return matchId || matchItem;
    });
  }, [safeOrders, activeTab, searchQuery]);

  const handleConfirmCancel = () => {
    if (cancelModalOrderId) {
      cancelOrder(cancelModalOrderId, cancelReason);
      setCancelModalOrderId(null);
    }
  };

  const handleConfirmReturn = () => {
    if (returnModalOrderId) {
      requestReturn(returnModalOrderId, returnReason);
      setReturnModalOrderId(null);
    }
  };

  const handleConfirmRate = () => {
    if (rateModalOrderId) {
      rateProduct(rateModalOrderId, ratingStars, reviewText);
      setRateModalOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-4 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Package className="size-6 text-brand" />
              My Orders
            </h1>
            <p className="text-xs text-muted-foreground">
              Track, cancel, return, or reorder your past and current purchases
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dev Admin Controller Toggle */}
            <button
              onClick={() => setShowAdminController(!showAdminController)}
              className="flex items-center gap-1 text-[11px] font-bold text-brand bg-brand/10 px-2.5 py-1 rounded border border-brand/20 hover:bg-brand/20 cursor-pointer"
              title="Toggle Dev Status Controller"
            >
              <Settings className="size-3.5" />
              <span>{showAdminController ? "Hide Status Controls" : "Dev Status Controller"}</span>
            </button>

            {/* Search order history */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, product or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs (All, Active, Delivered, Cancelled) */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
          {[
            { id: "all", label: `All Orders (${counts.all})` },
            { id: "active", label: `Active Orders (${counts.active})` },
            { id: "delivered", label: `Delivered (${counts.delivered})` },
            { id: "cancelled", label: `Cancelled & Returned (${counts.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-brand text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center bg-card rounded-lg border border-border px-4 shadow-2xs space-y-3">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground opacity-50" />
            <h2 className="text-base font-bold text-foreground">No orders found</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}".`
                : "You haven't placed any orders in this category yet."}
            </p>
            <Link
              to="/"
              className="inline-block rounded-md bg-brand px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isCanCancel =
                order.status === "PLACED" ||
                order.status === "CONFIRMED" ||
                order.status === "PACKED";
              const isDelivered = order.status === "DELIVERED";
              const isCancelled = order.status === "CANCELLED";
              const isReturnRequested = order.status === "RETURN_REQUESTED";

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-2xs hover:border-brand/40 transition-all space-y-4"
                >
                  {/* Top Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-muted-foreground font-medium">
                        ORDER ID: <strong className="text-foreground font-mono">{order.id}</strong>
                      </p>
                      <p className="text-[11px] text-muted-foreground">Order Date: {order.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-foreground">
                        {inr(order.totalAmount)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Dev Status Controller Selector (If Enabled) */}
                  {showAdminController && (
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-2.5 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Settings className="size-3.5" />
                        Dev Status Control:
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="rounded border border-amber-500/40 bg-background px-2 py-1 font-bold text-xs text-foreground focus:outline-none"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item: any, idx: number) => {
                        const prod = item?.product || {};
                        return (
                          <div key={prod.id || idx} className="flex items-center gap-3">
                            <img
                              src={prod.image || "https://picsum.photos/100"}
                              alt={prod.title || "Product"}
                              className="size-16 object-contain border border-border rounded-md bg-muted p-1 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-foreground line-clamp-1">
                                {prod.title || "Ordered Item"}
                              </h3>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Brand: {prod.brand || "Kartly"} · Qty: {item?.qty || 1}
                              </p>
                              <p className="text-xs font-bold text-foreground mt-0.5">
                                {inr(item?.priceAtPurchase || prod.price || 0)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Order confirmed. Item details recorded.</p>
                    )}
                  </div>

                  {/* Cancellation / Refund Information Bar */}
                  {isCancelled && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600 dark:text-red-400 space-y-0.5">
                      <p className="font-bold">
                        Cancelled on: {order.cancelledAt || order.date} ({order.cancellationReason || "Customer request"})
                      </p>
                      {order.refundStatus && (
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Refund Status: <strong>{order.refundStatus}</strong> ({inr(order.totalAmount || 0)} via {order.payment?.providerName || "Original Method"})
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rating / Review Display if rated */}
                  {order.userRating && (
                    <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <span>Your Rating:</span>
                        <span className="flex items-center gap-0.5">
                          {order.userRating} <Star className="size-3 fill-amber-500" />
                        </span>
                      </div>
                      {order.userReview && (
                        <p className="text-muted-foreground italic">"{order.userReview}"</p>
                      )}
                    </div>
                  )}

                  {/* Actions Bar strictly depending on Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Delivery Address:</span>
                      <span className="font-bold text-foreground">
                        {order.address
                          ? [order.address.house, order.address.city].filter(Boolean).join(", ") || "Delivery Address"
                          : "Delivery Address"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1. Track Order Button (For Active Orders) */}
                      {!isCancelled && !isDelivered && (
                        <Link
                          to="/track/$id"
                          params={{ id: order.id }}
                          className="flex items-center gap-1 rounded-md bg-brand px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer shadow-2xs"
                        >
                          Track Order
                          <ChevronRight className="size-3.5" />
                        </Link>
                      )}

                      {/* 2. Cancel Order Button (For PLACED, CONFIRMED, PACKED) */}
                      {isCanCancel && (
                        <button
                          onClick={() => setCancelModalOrderId(order.id)}
                          className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* 3. Return / Replace Button (For DELIVERED) */}
                      {isDelivered && (
                        <button
                          onClick={() => setReturnModalOrderId(order.id)}
                          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                        >
                          Return / Replace
                        </button>
                      )}

                      {/* 4. Rate Product Button (For DELIVERED) */}
                      {isDelivered && !order.userRating && (
                        <button
                          onClick={() => setRateModalOrderId(order.id)}
                          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Star className="size-3.5 fill-amber-500" />
                          Rate Product
                        </button>
                      )}

                      {/* 5. Buy Again / Reorder Button (For DELIVERED or CANCELLED) */}
                      {(isDelivered || isCancelled) && (
                        <button
                          onClick={() => reorderItems(order.id)}
                          className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="size-3" />
                          Buy Again
                        </button>
                      )}

                      {/* View Details Link */}
                      <Link
                        to="/orders/$id"
                        params={{ id: order.id }}
                        className="rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                      >
                        View Details
                      </Link>

                      {/* View & Download Tax Invoice */}
                      <Link
                        to="/invoice/$orderId"
                        params={{ orderId: order.id }}
                        className="rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/20 cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="size-3.5" />
                        Invoice
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Order Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-foreground">Cancel Order {cancelModalOrderId}?</h3>
            <p className="text-xs text-muted-foreground">Select a reason for cancellation:</p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded border border-border bg-background p-2 text-xs text-foreground focus:border-brand focus:outline-none"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Found a better price">Found a better price</option>
              <option value="Delivery taking too long">Delivery taking too long</option>
              <option value="Product no longer required">Product no longer required</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="rounded border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {returnModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-foreground">Return / Replace Item</h3>
            <p className="text-xs text-muted-foreground">Select a reason for return:</p>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full rounded border border-border bg-background p-2 text-xs text-foreground focus:border-brand focus:outline-none"
            >
              <option value="Damaged product">Damaged product</option>
              <option value="Defective product">Defective product</option>
              <option value="Wrong item delivered">Wrong item delivered</option>
              <option value="Missing item">Missing item</option>
              <option value="Product not as described">Product not as described</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReturnModalOrderId(null)}
                className="rounded border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="rounded bg-brand px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer"
              >
                Request Return Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Product Modal */}
      {rateModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-foreground">Rate & Review Product</h3>
            <div className="flex items-center gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`size-6 ${
                      star <= ratingStars ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Write a brief review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full rounded border border-border bg-background p-2 text-xs text-foreground focus:border-brand focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRateModalOrderId(null)}
                className="rounded border border-border px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRate}
                className="rounded bg-brand px-3.5 py-1.5 text-xs font-bold text-primary-foreground cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="size-3" />
          DELIVERED
        </span>
      );
    case "CANCELLED":
    case "RETURNED":
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
          <XCircle className="size-3" />
          {status}
        </span>
      );
    case "OUT_FOR_DELIVERY":
    case "SHIPPED":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Truck className="size-3 animate-bounce" />
          {status.replace(/_/g, " ")}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Clock className="size-3" />
          {status}
        </span>
      );
  }
}
