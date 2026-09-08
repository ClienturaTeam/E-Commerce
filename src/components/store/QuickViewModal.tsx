import * as React from "react";
import { X, Star, Heart, Zap, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { Product, inr, getColorImages } from "./catalog";
import { useStore, getGstBreakdown } from "./store-context";
import { handleImageError } from "./image-fallback";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addToCart, buyNow, wishlist, toggleWishlist, pincode } = useStore();
  const navigate = useNavigate();

  if (!product || !open) return null;

  const saved = wishlist.some(
    (id) => String(id) === String(product.id || (product as any).product_id || (product as any)._id)
  );

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const gstInfo = getGstBreakdown(product.price, 1);
  const images = getColorImages(product);

  const [activeImg, setActiveImg] = React.useState(images[0] || product.image);

  const handleBuyNow = () => {
    buyNow(product, 1);
    onOpenChange(false);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Close Quick View"
        >
          <X className="size-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Product Photography */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border">
              <img
                src={activeImg}
                alt={product.title}
                onError={(e) => handleImageError(e, product.category)}
                className="size-full object-contain p-4 transition-all duration-300"
              />
              <span className="absolute top-3 left-3 bg-brand text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-md uppercase">
                Quick View
              </span>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={
                      "size-14 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer " +
                      (activeImg === img ? "border-brand ring-2 ring-brand/20" : "border-border opacity-70 hover:opacity-100")
                    }
                  >
                    <img src={img} alt="" onError={(e) => handleImageError(e, product.category)} className="size-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                {product.brand}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
                {product.title}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {product.rating.toFixed(1)}
                  <Star className="size-3 fill-current" />
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {product.reviews} Customer Ratings
                </span>
              </div>

              {/* Price & GST Breakdown */}
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/80 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{inr(product.price)}</span>
                  <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
                  <span className="text-xs font-extrabold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    Save {off}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Inclusive of {gstInfo.rate}% GST ({inr(gstInfo.gstAmount)}) • Base price {inr(gstInfo.itemPrice)}
                </p>
              </div>

              {/* Stock & Delivery Note */}
              <div className="mt-3 space-y-1.5 text-xs font-medium">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> In Stock & Ready to Ship
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="size-4 text-brand" /> Deliver to <strong className="text-foreground">{pincode || "560001"}</strong> within 3-5 days
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success("Added to cart", { description: product.title });
                  }}
                  className="w-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-brand px-4 py-2.5 text-sm font-bold text-primary-foreground rounded-xl transition-opacity hover:bg-brand-deep cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Zap className="size-4" /> Buy Now
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className={"size-4 " + (saved ? "fill-brand text-brand" : "")} />
                {saved ? "Remove from Wishlist" : "Save to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
