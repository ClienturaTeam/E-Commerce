import * as React from "react";
import { Minus, Plus, ShoppingCart, Trash2, Tag, Check, X, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RemoveConfirmModal } from "./RemoveConfirmModal";
import { inr, type Product } from "./catalog";
import { useStore } from "./store-context";

export function CartPanel() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    cartMrpTotal,
    setQty,
    removeFromCartCompletely,
    moveCartItemToWishlist,
    clearCart,
    pincode,
    user,
    openAuthModal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscountAmount,
  } = useStore();

  const navigate = useNavigate();
  const [couponCodeInput, setCouponCodeInput] = React.useState("");
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [itemPendingRemoval, setItemPendingRemoval] = React.useState<Product | null>(null);

  const itemSavings = cartMrpTotal - cartTotal;
  const deliveryCharge = cartTotal > 500 ? 0 : 40;
  const finalPayable = cartTotal - couponDiscountAmount + deliveryCharge;
  const totalSavings = itemSavings + couponDiscountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    if (applyCoupon(couponCodeInput)) {
      setCouponCodeInput("");
    }
  };

  const handleProceedToCheckout = () => {
    if (!user || !user.isAuth) {
      setCartOpen(false);
      openAuthModal("Please log in to continue with your order.");
      return;
    }

    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      setCartOpen(false);
      navigate({ to: "/checkout" });
    }, 400);
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md bg-card">
        <SheetHeader className="border-b border-border pb-3">
          <SheetTitle className="flex items-center justify-between text-foreground font-extrabold">
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-brand" />
              Your Cart ({cartCount})
            </span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Delivering to <strong className="text-foreground">{pincode}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Fast Delivery Available</span>
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingCart className="size-7" />
            </div>
            <p className="text-sm font-bold text-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add products to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="mt-2 rounded-md bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer transition-colors shadow-xs"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4 py-2">
              {cart.map((line) => (
                <li key={line.product.id} className="flex gap-3 py-3.5">
                  <img
                    src={line.product.image}
                    alt={line.product.title}
                    className="size-16 shrink-0 rounded-md border border-border object-contain bg-muted p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold text-foreground leading-snug">
                      {line.product.title}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {inr(line.product.price)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {inr(line.product.mrp)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 border border-border rounded-md bg-background px-1">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(line.product.id, line.qty - 1)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-5 text-center text-xs font-bold text-foreground">
                          {line.qty}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(line.product.id, line.qty + 1)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        aria-label="Remove item"
                        onClick={() => setItemPendingRemoval(line.product)}
                        className="p-1 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border bg-muted/30 p-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4" />
                    <span>Coupon '{appliedCoupon.code}' Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. WELCOME10)"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="w-full rounded-md border border-border bg-background pl-8 pr-2 py-1.5 text-xs text-foreground uppercase placeholder:normal-case focus:border-brand focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Cart Footer */}
            <SheetFooter className="flex flex-col gap-3 border-t border-border p-4 sm:flex-col">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal (MRP)</span>
                  <span>{inr(cartMrpTotal)}</span>
                </div>
                {itemSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Item Discount</span>
                    <span>-{inr(itemSavings)}</span>
                  </div>
                )}
                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-{inr(couponDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span>{deliveryCharge === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : inr(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 text-sm font-extrabold text-foreground">
                  <span>Total Payable</span>
                  <span>{inr(finalPayable)}</span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  🎉 You are saving {inr(totalSavings)} on this order!
                </div>
              )}

              <button
                onClick={handleProceedToCheckout}
                disabled={isPlacingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-xs font-extrabold text-primary-foreground hover:bg-brand-deep cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Processing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>PROCEED TO CHECKOUT ({inr(finalPayable)})</span>
                    <ChevronRight className="size-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => setCartOpen(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline text-center cursor-pointer pt-0.5"
              >
                Continue Shopping
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>

      {/* Cart Item Removal Confirmation Dialog */}
      <RemoveConfirmModal
        product={itemPendingRemoval}
        open={Boolean(itemPendingRemoval)}
        onOpenChange={(open) => {
          if (!open) setItemPendingRemoval(null);
        }}
        onMoveToWishlist={() => {
          if (itemPendingRemoval) {
            moveCartItemToWishlist(itemPendingRemoval);
            setItemPendingRemoval(null);
          }
        }}
        onRemoveCompletely={() => {
          if (itemPendingRemoval) {
            removeFromCartCompletely(itemPendingRemoval.id);
            setItemPendingRemoval(null);
          }
        }}
      />
    </Sheet>
  );
}
