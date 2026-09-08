import * as React from "react";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inr, type Product } from "./catalog";

export interface RemoveConfirmModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveToWishlist: () => void;
  onRemoveCompletely: () => void;
}

export function RemoveConfirmModal({
  product,
  open,
  onOpenChange,
  onMoveToWishlist,
  onRemoveCompletely,
}: RemoveConfirmModalProps) {
  if (!product) return null;

  const mrp = Number(product.mrp || product.original_price || product.price || 0);
  const price = Number(product.price || product.discounted_price || 0);
  const hasDiscount = mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94%] sm:w-full sm:max-w-[480px] bg-card border border-border/70 p-5 sm:p-6 shadow-2xl rounded-2xl sm:rounded-3xl space-y-4 font-sans focus:outline-none">
        
        {/* HEADER SECTION */}
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
                Remove item from cart?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                What would you like to do with this item?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* PRODUCT PREVIEW CARD */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-muted/40 p-3.5 transition-colors">
          <img
            src={product.image}
            alt={product.title}
            className="size-[76px] rounded-xl border border-border/80 bg-background p-1.5 object-contain shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">
              {product.brand}
            </span>
            <h4 className="line-clamp-2 text-xs font-bold text-foreground leading-snug">
              {product.title}
            </h4>
            <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
              <span className="text-sm font-black text-foreground">
                {inr(price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-muted-foreground line-through font-semibold">
                    {inr(mrp)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ({discountPct}% OFF)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ACTION SECTION */}
        <div className="space-y-2 pt-1">
          {/* Primary Action: Move to Wishlist */}
          <button
            type="button"
            onClick={() => {
              onMoveToWishlist();
              onOpenChange(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 py-3 text-xs font-extrabold cursor-pointer transition-all active:scale-[0.99] shadow-2xs"
          >
            <Heart className="size-4 fill-pink-600/20 stroke-pink-600 dark:stroke-pink-400" />
            Move to Wishlist
          </button>

          {/* Secondary Action: Remove Completely */}
          <button
            type="button"
            onClick={() => {
              onRemoveCompletely();
              onOpenChange(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-3 text-xs font-extrabold cursor-pointer transition-all active:scale-[0.99] shadow-2xs"
          >
            <Trash2 className="size-4" />
            Remove Completely
          </button>

          {/* Tertiary Action: Keep in Cart */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center"
          >
            Keep in Cart
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
