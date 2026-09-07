import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Receipt,
  HelpCircle,
  Info,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { useStore, getProductGstRate } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";
import { handleImageError } from "@/components/store/image-fallback";
import { GstBreakdownModal, PlatformFeeModal } from "@/components/store/BillBreakdownModals";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const {
    cart,
    cartCount,
    setQty,
    removeFromCart,
    clearCart,
  } = useStore();

  const router = useRouter();

  const [couponCode, setCouponCode] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState("");

  // Modal states for GST & Platform Fee breakdowns
  const [isGstModalOpen, setIsGstModalOpen] = React.useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = React.useState(false);

  const safeCartItems = React.useMemo(() => {
    try {
      if (!cart || !Array.isArray(cart)) return [];
      return cart.filter((item) => item && item.product && typeof item.product.price === "number");
    } catch {
      return [];
    }
  }, [cart]);

  // Dynamic Swiggy/Zomato style bill calculations
  const platformFee = 10;

  const cartItemSubtotal = safeCartItems.reduce(
    (acc, line) => acc + line.product.price * line.qty,
    0
  );

  const cartMrpTotal = safeCartItems.reduce(
    (acc, line) => acc + line.product.mrp * line.qty,
    0
  );

  const cartGstTotal = safeCartItems.reduce((acc, line) => {
    const rate = getProductGstRate(line.product);
    return acc + Math.round((line.product.price * line.qty * rate) / 100);
  }, 0);

  const deliveryFee = cartItemSubtotal > 499 ? 0 : safeCartItems.length > 0 ? 40 : 0;
  const totalBeforeCoupon = cartItemSubtotal + cartGstTotal + platformFee + deliveryFee;
  const finalTotal = Math.max(0, totalBeforeCoupon - discount);
  const totalSavings = (cartMrpTotal - cartItemSubtotal) + discount;

  const handleProceedToCheckout = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("buyNowProduct");
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: "instant" });
    router.navigate({ to: "/checkout" });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "KARTLY10" || code === "SAVE10" || code === "WELCOME10") {
      const disc = Math.round(cartItemSubtotal * 0.1);
      setDiscount(disc);
      setAppliedCoupon(code);
      toast.success("Coupon Applied!", { description: `Saved extra ${inr(disc)} with ${code}` });
    } else {
      toast.error("Invalid Coupon", { description: "Try using code KARTLY10" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs text-muted-foreground flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Shopping Cart</span>
        </div>

        <div className="flex items-center justify-between border-b-2 border-brand pb-3 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-6 text-brand" />
            <h1 className="text-xl font-bold text-foreground">My Shopping Cart ({cartCount})</h1>
          </div>
          {safeCartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive underline cursor-pointer"
            >
              Clear Cart
            </button>
          )}
        </div>

        {safeCartItems.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="mx-auto size-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="size-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground">
              Looks like you haven't added anything to your cart yet. Explore our top categories and
              deals!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-brand px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 mt-2"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="border border-border bg-card divide-y divide-border rounded-xl shadow-xs overflow-hidden">
                {safeCartItems.map((line) => {
                  const rate = getProductGstRate(line.product);
                  const itemPrice = line.product.price * line.qty;
                  const gstAmount = Math.round((itemPrice * rate) / 100);
                  const totalPrice = itemPrice + gstAmount;
                  const gst = { rate, gstAmount, itemPrice, totalPrice };
                  const itemSavings = (line.product.mrp - line.product.price) * line.qty;

                  return (
                    <article
                      key={line.product.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
                    >
                      <Link to="/product/$id" params={{ id: line.product.id }} className="shrink-0">
                        <img
                          src={line.product.image}
                          alt={line.product.title}
                          onError={(e) => handleImageError(e, line.product.category)}
                          className="size-24 sm:size-28 object-contain bg-muted p-2 rounded-md mx-auto"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              {line.product.brand}
                            </p>
                            <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                              GST {gst.rate}% (₹{gst.gstAmount})
                            </span>
                          </div>

                          <Link
                            to="/product/$id"
                            params={{ id: line.product.id }}
                            className="font-medium text-sm text-foreground hover:text-brand line-clamp-2 mt-0.5"
                          >
                            {line.product.title}
                          </Link>

                          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <Truck className="size-3" /> In Stock · Free Delivery
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border border-border bg-background p-1 rounded-md">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => setQty(line.product.id, line.qty - 1)}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold">
                              {line.qty}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => setQty(line.product.id, line.qty + 1)}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          {/* Price & GST Breakdown */}
                          <div className="text-right">
                            <div className="flex items-baseline gap-2 justify-end">
                              <span className="text-base font-bold text-foreground">
                                {inr(gst.totalPrice)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {inr(line.product.mrp * line.qty)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Base: {inr(gst.itemPrice)} + GST ({gst.rate}%): {inr(gst.gstAmount)}
                            </p>
                            {itemSavings > 0 && (
                              <p className="text-[11px] font-semibold text-emerald-600">
                                Save {inr(itemSavings)}
                              </p>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart(line.product.id)}
                            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Security badge banner */}
              <div className="border border-border bg-card p-4 rounded-xl flex items-center gap-3 text-xs text-muted-foreground shadow-xs">
                <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
                <span>
                  Safe and Secure Payments. Easy returns and 100% Buyer Protection on all orders.
                </span>
              </div>
            </div>

            {/* Price Details Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Coupon section */}
              <div className="border border-border bg-card p-4 rounded-xl shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="size-4 text-brand" />
                  <h3 className="text-sm font-bold text-foreground">Apply Coupon</h3>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. KARTLY10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-background border border-border px-3 py-1.5 text-xs text-foreground uppercase outline-none focus:border-brand rounded-md"
                  />
                  <button
                    type="submit"
                    className="bg-brand text-primary-foreground px-3.5 py-1.5 text-xs font-bold hover:opacity-90 rounded-md cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {appliedCoupon && (
                  <p className="text-xs font-semibold text-emerald-600 mt-2">
                    ✓ Coupon "{appliedCoupon}" applied ({inr(discount)} OFF)
                  </p>
                )}
              </div>

              {/* Bill Summary Box (Swiggy/Zomato Style) */}
              <div className="border border-border bg-card p-5 space-y-4 rounded-xl shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Receipt className="size-4 text-brand" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Bill Detailed Breakdown
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Item Total */}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Item Total ({cartCount} items)</span>
                    <span className="font-semibold text-foreground">{inr(cartItemSubtotal)}</span>
                  </div>

                  {/* GST & Charges line with Clickable Popup Trigger */}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setIsGstModalOpen(true)}
                      className="inline-flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer group text-left"
                      title="Click to view detailed per-product GST breakdown"
                    >
                      <span className="underline decoration-dotted underline-offset-4 font-medium">
                        GST & Statutory Taxes
                      </span>
                      <span className="bg-brand/10 text-brand rounded-full p-0.5 group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                        <Info className="size-3.5" />
                      </span>
                    </button>
                    <span className="font-semibold text-brand">+{inr(cartGstTotal)}</span>
                  </div>

                  {/* Platform Fee line with Clickable Popup Trigger */}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setIsPlatformModalOpen(true)}
                      className="inline-flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer group text-left"
                      title="Click to view platform fee details"
                    >
                      <span className="underline decoration-dotted underline-offset-4 font-medium">
                        Platform Fee
                      </span>
                      <span className="bg-brand/10 text-brand rounded-full p-0.5 group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                        <Info className="size-3.5" />
                      </span>
                    </button>
                    <span className="font-semibold text-foreground">+{inr(platformFee)}</span>
                  </div>

                  {/* Delivery Charges */}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-foreground">{inr(deliveryFee)}</span>
                    )}
                  </div>

                  {/* Coupon Discount if applied */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-200/50">
                      <span className="flex items-center gap-1">
                        <Tag className="size-3.5" /> Coupon Discount ({appliedCoupon})
                      </span>
                      <span>-{inr(discount)}</span>
                    </div>
                  )}

                  {/* Final Payable Amount line */}
                  <div className="border-t border-dashed border-border pt-3.5 flex justify-between items-center font-black text-foreground">
                    <div className="space-y-0.5">
                      <span className="text-sm uppercase tracking-wider block">To Pay</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Inclusive of all taxes & charges
                      </span>
                    </div>
                    <span className="text-xl text-brand font-black">{inr(finalTotal)}</span>
                  </div>
                </div>

                {/* Savings Pill */}
                {totalSavings > 0 && (
                  <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold p-2.5 rounded-lg text-center border border-emerald-200/80 flex items-center justify-center gap-1.5 shadow-2xs">
                    <span>🎉</span> You saved <span className="underline font-extrabold">{inr(totalSavings)}</span> on this order!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full bg-brand hover:bg-brand-deep text-primary-foreground font-extrabold text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  Proceed to Checkout <ArrowRight className="size-4.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Swiggy/Zomato Style Interactive Popups */}
      <GstBreakdownModal
        isOpen={isGstModalOpen}
        onClose={() => setIsGstModalOpen(false)}
        items={safeCartItems}
        gstTotal={cartGstTotal}
      />

      <PlatformFeeModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        feeAmount={platformFee}
      />

      <SiteFooter />
    </div>
  );
}
