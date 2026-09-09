import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { getAllProducts } from "@/data/categoryData";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { inr, type Product } from "@/components/store/catalog";
import { getFallbackImage, handleImageError } from "@/components/store/image-fallback";
import { calculateDiscountPct } from "@/lib/discount-filter";

export const Route = createFileRoute("/wishlist")({
  component: WishlistRoute,
});

function WishlistRoute() {
  return <WishlistPage />;
}

function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const savedProducts = React.useMemo(() => {
    const allProducts = getAllProducts();
    const items: Product[] = [];

    for (const item of wishlist) {
      if (!item) continue;
      const id = typeof item === "string" ? item : String((item as any)?.id || (item as any)?.product_id || (item as any)?._id || "");
      const found = allProducts.find(
        (p) =>
          String(p.id) === id ||
          String((p as any).product_id) === id ||
          String((p as any)._id) === id
      );
      if (found) {
        items.push(typeof item === "object" ? { ...found, ...item } : found);
      } else if (typeof item === "object" && ((item as any).id || (item as any).title)) {
        items.push(item as Product);
      }
    }

    // Deduplicate by product ID
    return items.filter(
      (p, idx, self) =>
        self.findIndex(
          (item) =>
            String(item.id || (item as any).product_id || (item as any)._id) ===
            String(p.id || (p as any).product_id || (p as any)._id)
        ) === idx
    );
  }, [wishlist]);


  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    for (const p of savedProducts) {
      addToCart(p);
    }
    toast.success(`Moved all ${savedProducts.length} items to Cart!`, {
      description: "You can proceed to checkout anytime.",
    });
  };

  const popularPicks = React.useMemo(() => {
    const all = getAllProducts();
    return all.slice(0, 6);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {/* Page Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Heart className="size-5 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight">My Wishlist</h1>
              <p className="text-xs text-muted-foreground">
                {savedProducts.length} {savedProducts.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
          </div>

          {savedProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <ShoppingCart className="size-3.5" />
                Move All to Cart
              </button>
            </div>
          )}
        </div>

        {/* Empty Wishlist State */}
        {savedProducts.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500 ring-8 ring-rose-500/5">
              <Heart className="size-8 text-rose-500/60" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-lg font-black text-foreground">Your wishlist is currently empty</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save items you love by tapping the heart icon on any product card. We'll track price drops and deals for you!
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand px-6 py-2.5 text-xs font-bold text-primary-foreground rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all mt-2"
            >
              Continue Shopping
            </Link>

            {/* Popular Items to quickly add */}
            <div className="mt-12 text-left border-t border-border pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500 inline-block" />
                  Trending Picks You Might Like
                </h3>
                <span className="text-[11px] text-muted-foreground">Click heart to save</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {popularPicks.map((p) => {
                  const price = Number(p.discounted_price || p.price || 0);
                  const mrp = Number(p.original_price || p.mrp || p.price || 0);
                  const isItemSaved = wishlist.some((item) => {
                    if (!item) return false;
                    const id = typeof item === "string" ? item : String((item as any)?.id || (item as any)?.product_id || (item as any)?._id || "");
                    return id === String(p.id);
                  });
                  const rawImg = p.image || (p as any).imageUrl || (p as any).images?.[0];
                  const imgSrc = (!rawImg || rawImg.toLowerCase().includes("no image"))
                    ? getFallbackImage(p.category)
                    : rawImg;

                  return (
                    <div
                      key={p.id}
                      className="group relative flex flex-col rounded-xl border border-border bg-card p-3 shadow-2xs hover:shadow-md transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p)}
                        className={`absolute right-2 top-2 z-10 size-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isItemSaved
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-background/80 text-muted-foreground hover:text-rose-500 hover:bg-background"
                        }`}
                        title={isItemSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart className={`size-3.5 ${isItemSaved ? "fill-white" : ""}`} />
                      </button>

                      <Link to="/product/$id" params={{ id: p.id }} className="block aspect-square overflow-hidden rounded-lg bg-muted mb-2">
                        <img
                          src={imgSrc}
                          alt={p.title}
                          className="size-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </Link>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{p.brand}</p>
                      <p className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">{p.title}</p>
                      <p className="mt-2 text-xs font-black text-foreground">{inr(price)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {savedProducts.map((p) => {
              const mrp = Number(p.original_price || p.mrp || p.price || 0);
              const price = Number(p.discounted_price || p.price || 0);
              const off = typeof p.discount_percentage === "number"
                ? p.discount_percentage
                : calculateDiscountPct(mrp, price);

              const rawImg = p.image || (p as any).imageUrl || (p as any).images?.[0] || (p as any).thumbnail || (p as any).productImage;
              const imgSrc = (!rawImg || rawImg.toLowerCase().includes("no image"))
                ? getFallbackImage(p.category)
                : rawImg;

              return (
                <article
                  key={p.id}
                  className="group relative flex h-full flex-col border border-border bg-card p-3.5 transition-all hover:shadow-lg rounded-xl"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-card/90 p-1.5 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-2xs"
                    title="Remove from wishlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="relative mb-3 aspect-square overflow-hidden bg-muted block rounded-lg"
                  >
                    <img
                      src={imgSrc}
                      alt={p.title}
                      onError={(e) => handleImageError(e, p.category)}
                      loading="lazy"
                      width={640}
                      height={640}
                      className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {p.brand}
                  </p>

                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="mt-0.5 line-clamp-2 text-xs text-foreground hover:text-brand transition-colors font-semibold"
                  >
                    {p.title}
                  </Link>

                  <p className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-3">
                    <span className="text-sm font-black text-foreground">{inr(price)}</span>
                    {mrp > price && (
                      <>
                        <span className="text-[11px] text-muted-foreground line-through">{inr(mrp)}</span>
                        <span className="text-[11px] font-bold text-brand">{off}% off</span>
                      </>
                    )}
                  </p>

                  <button
                    onClick={() => {
                      addToCart(p);
                      toast.success("Added to Cart!", { description: p.title });
                    }}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-all hover:opacity-95 active:scale-95 rounded-lg cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="size-3.5" />
                    Move to Cart
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
