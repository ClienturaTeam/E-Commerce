import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { OrderInvoiceModal } from "@/components/store/OrderInvoiceModal";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore, type Order } from "@/components/store/store-context";
import { products, inr } from "@/components/store/catalog";

export const Route = createFileRoute("/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: (search.orderId as string) || undefined,
  }),
  component: SuccessRoute,
});

function SuccessRoute() {
  return <SuccessPage />;
}

function SuccessPage() {
  const { orders } = useStore();
  const search = Route.useSearch();
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);

  const lastOrderId = React.useMemo(() => {
    if (search.orderId) return search.orderId;
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("kartly.lastOrderId");
      }
    } catch {}
    return null;
  }, [search.orderId]);

  const currentOrder = React.useMemo(() => {
    if (lastOrderId) {
      const found = orders.find((o) => o.id === lastOrderId);
      if (found) return found;
    }
    if (orders.length > 0 && orders[0]) return orders[0];

    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const item1 = products[0]!;
    const item2 = products[1] || products[0]!;

    return {
      id: "KART-ORD-928415",
      date: now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      items: [
        { product: item1, qty: 1, priceAtPurchase: item1.price },
        { product: item2, qty: 1, priceAtPurchase: item2.price },
      ],
      subtotal: item1.price + item2.price,
      discount: (item1.mrp - item1.price) + (item2.mrp - item2.price),
      deliveryCharge: 0,
      couponDiscount: 0,
      totalAmount: item1.price + item2.price,
      address: {
        id: "addr-1",
        name: "Rahul Sharma",
        phone: "9876543210",
        house: "Flat 402, Sunshine Apartments",
        street: "5th Main, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        type: "home" as const,
      },
      payment: {
        method: "upi" as const,
        providerName: "PhonePe",
        upiId: "rahul@ybl",
      },
      status: "PLACED" as const,
      estimatedDelivery: deliveryDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      timeline: [],
    };
  }, [orders]);

  const addr = (currentOrder as any).address || (currentOrder as any).deliveryAddress;
  const addrName = addr?.name || addr?.fullName || "Kartly Customer";
  const addrLine = addr?.house ? `${addr.house}, ${addr.street}` : addr?.addressLine || "Indiranagar";
  const addrPhone = addr?.phone || "9876543210";
  const payMethod = (currentOrder as any).payment?.method || (currentOrder as any).paymentMethod || "UPI";

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1000px] px-4 py-8 space-y-6">
        {/* Success Announcement Header */}
        <div className="border border-emerald-200 bg-emerald-50 p-6 rounded-lg text-center space-y-3 shadow-sm">
          <div className="mx-auto size-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-emerald-800 font-medium max-w-lg mx-auto">
            Thank you for shopping with Kartly! Confirmation SMS and email has been sent to{" "}
            <strong>{addrPhone}</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold">
              <span>Order ID: #{currentOrder.id}</span>
              <span>·</span>
              <span>Placed on: {currentOrder.date}</span>
            </div>

            <button
              onClick={() => setInvoiceOpen(true)}
              className="inline-flex items-center gap-2 bg-brand text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold hover:bg-brand-deep cursor-pointer transition-colors shadow-xs"
            >
              <FileText className="size-3.5" /> View & Print Tax Invoice
            </button>
          </div>
        </div>

        {/* Delivery Progress Tracker */}
        <div className="border border-border bg-card p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Truck className="size-5 text-brand" /> Estimated Delivery:{" "}
            <span className="text-brand font-extrabold">{currentOrder.estimatedDelivery}</span>
          </h2>

          {/* Timeline steps */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: "Order Placed", done: true },
              { label: "Packed", done: true },
              { label: "On The Way", done: false },
              { label: "Delivered", done: false },
            ].map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {step.done ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address Details */}
          <div className="border border-border bg-card p-5 space-y-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <MapPin className="size-4 text-brand" /> Delivery Address
            </h3>
            <div className="text-xs text-foreground space-y-1">
              <p className="font-bold text-sm">{addrName}</p>
              <p>{addrLine}</p>
              <p>
                {addr?.city}, {addr?.state} - {addr?.pincode}
              </p>
              <p className="pt-1 flex items-center gap-1 font-semibold text-muted-foreground">
                <Phone className="size-3" /> {addrPhone}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border border-border bg-card p-5 space-y-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <ShieldCheck className="size-4 text-brand" /> Payment Information
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold uppercase text-foreground">{payMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-bold text-emerald-600">SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{inr(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Total Discount Saved:</span>
                  <span>-{inr(currentOrder.discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                <span>Total Paid:</span>
                <span className="text-brand font-extrabold">{inr(currentOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            Items Ordered ({currentOrder.items.reduce((acc: number, i: any) => acc + i.qty, 0)})
          </h3>

          <div className="divide-y divide-border">
            {currentOrder.items.map((line: any) => (
              <div key={line.product.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={line.product.image}
                    alt={line.product.title}
                    className="size-16 object-contain bg-muted p-1 rounded shrink-0"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-foreground line-clamp-1">
                      {line.product.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5">Brand: {line.product.brand}</p>
                    <p className="text-muted-foreground">Qty: {line.qty}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 text-xs">
                  <p className="font-bold text-foreground">{inr(line.product.price * line.qty)}</p>
                  <p className="text-muted-foreground line-through">
                    {inr(line.product.mrp * line.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/invoice/$orderId"
            params={{ orderId: currentOrder.id }}
            className="w-full sm:w-auto bg-brand px-6 py-3 text-center text-xs font-black text-primary-foreground transition-all hover:bg-brand-deep flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer"
          >
            <FileText className="size-4" /> View & Download Tax Invoice
          </Link>
          <Link
            to="/track/$id"
            params={{ id: currentOrder.id }}
            className="w-full sm:w-auto bg-accent px-6 py-3 text-center text-xs font-black text-accent-foreground transition-opacity hover:opacity-90 flex items-center justify-center gap-2 rounded-xl shadow-xs cursor-pointer"
          >
            <Truck className="size-4" /> Track Order
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto border border-border bg-card px-6 py-3 text-center text-xs font-bold text-foreground transition-colors hover:border-brand flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            Continue Shopping <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
      <OrderInvoiceModal order={(currentOrder || null) as any} open={invoiceOpen} onOpenChange={setInvoiceOpen} />
    </div>
  );
}
