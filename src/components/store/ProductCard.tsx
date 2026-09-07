import * as React from "react";
import { Heart, Star, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { inr, type Product } from "./catalog";
import { useStore } from "./store-context";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

export function ProductCard({
  product,
  badgeLabel,
}: {
  product: Product;
  badgeLabel?: string;
}) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addRecentlyViewed } = useStore();
  const [imgSrc, setImgSrc] = React.useState(product.image);

  React.useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const saved = wishlist.includes(product.id);

  const handleCardClick = () => {
    addRecentlyViewed(product.id);
    navigate({ to: "/product/$id", params: { id: product.id } });
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-3.5 transition-all duration-300 hover:border-brand/50 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc(FALLBACK_IMG)}
          loading="lazy"
          width={640}
          height={640}
          className="size-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 z-10">
          {product.isBestseller && (
            <span className="bg-amber-500 text-black px-2 py-0.5 text-[10px] font-extrabold uppercase rounded shadow-2xs">
              Bestseller
            </span>
          )}
          {badgeLabel && !product.isBestseller && (
            <span className="bg-brand text-primary-foreground px-2 py-0.5 text-[10px] font-extrabold uppercase rounded shadow-2xs">
              {badgeLabel}
            </span>
          )}
          {off >= 50 && (
            <span className="bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase rounded shadow-2xs">
              {off}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon ❤️ */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute right-1.5 top-1.5 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur-xs transition-all hover:bg-background hover:text-brand hover:scale-110 shadow-xs cursor-pointer"
        >
          <Heart className={"size-4 " + (saved ? "fill-pink-600 text-pink-600" : "")} />
        </button>

        {/* Express Delivery Badge */}
        {product.deliveryDays && product.deliveryDays <= 1 && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-background/90 text-amber-600 px-1.5 py-0.5 text-[10px] font-bold rounded backdrop-blur-xs">
            <Zap className="size-3 fill-amber-500 text-amber-500" />
            Express
          </span>
        )}
      </div>

      {/* Brand & Assured */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
          {product.brand}
        </p>

        {product.isAssured && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
            <ShieldCheck className="size-3 text-blue-600 dark:text-blue-400" />
            Assured
          </span>
        )}
      </div>

      {/* Product Title */}
      <h3 className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-brand transition-colors leading-snug">
        {product.title}
      </h3>

      {/* Rating & Reviews */}
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
          {product.rating.toFixed(1)}
          <Star className="size-3 fill-current" />
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">({product.reviews})</span>
      </div>

      {/* Price Information */}
      <div className="mt-auto pt-3">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-extrabold text-foreground">{inr(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{off}% off</span>
        </div>
      </div>
    </article>
  );
}
