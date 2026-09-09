import * as React from "react";
import { Heart, Star, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { inr, type Product } from "./catalog";
import { useStore } from "./store-context";
import { getFallbackImage, handleImageError } from "./image-fallback";
import { calculateDiscountPct } from "@/lib/discount-filter";

export function ProductCard({
  product,
  badgeLabel,
}: {
  product: Product;
  badgeLabel?: string;
}) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addRecentlyViewed, customReviews } = useStore();

  const productCustomReviews = (customReviews && customReviews[product.id]) || [];
  const cardRating = React.useMemo(() => {
    if (productCustomReviews.length === 0) return product.rating;
    const defaultCount = 3;
    const totalCount = defaultCount + productCustomReviews.length;
    const sum = (product.rating * defaultCount) + productCustomReviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
    return Number((sum / totalCount).toFixed(1));
  }, [productCustomReviews, product.rating]);

  const cardReviewsCount = React.useMemo(() => {
    if (productCustomReviews.length === 0) return product.reviews;
    const num = parseInt(String(product.reviews).replace(/,/g, ""), 10);
    if (!isNaN(num)) {
      return (num + productCustomReviews.length).toLocaleString("en-IN");
    }
    return product.reviews;
  }, [productCustomReviews, product.reviews]);

  const initialImg = React.useMemo(() => {
    if (!product.image || product.image.toLowerCase().includes("no image")) {
      return getFallbackImage(product.category);
    }
    return product.image;
  }, [product.image, product.category]);

  const [imgSrc, setImgSrc] = React.useState(initialImg);

  React.useEffect(() => {
    setImgSrc(initialImg);
  }, [initialImg]);

  const mrp = Number(product.original_price || product.mrp || product.price || 0);
  const price = Number(product.discounted_price || product.price || 0);
  const off = typeof product.discount_percentage === "number"
    ? product.discount_percentage
    : calculateDiscountPct(mrp, price);

  const saved = wishlist.some((item) => {
    if (!item) return false;
    const itemId = typeof item === "string" ? item : String((item as any)?.id || (item as any)?.product_id || (item as any)?._id || "");
    const prodId = String(product.id || (product as any).product_id || (product as any)._id);
    return itemId === prodId;
  });


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
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
        <img
          src={imgSrc}
          alt={product.title}
          onError={(e) => {
            handleImageError(e, product.category);
            setImgSrc(getFallbackImage(product.category));
          }}
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
          {off >= 5 && (
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

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-brand transition-colors">
        {product.title}
      </h3>

      {/* Rating & Reviews */}
      <div className="mb-2.5 flex items-center gap-1.5 text-xs">
        <div className="flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <span>{cardRating}</span>
          <Star className="size-2.5 fill-white text-white" />
        </div>
        <span className="text-[11px] text-muted-foreground">({cardReviewsCount})</span>
      </div>

      {/* Price Block */}
      <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-1 border-t border-border/50">
        <span className="text-sm font-extrabold text-foreground">{inr(price)}</span>
        {mrp > price && (
          <>
            <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{off}% off</span>
          </>
        )}
      </div>
    </article>
  );
}
