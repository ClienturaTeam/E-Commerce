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
  return (
    <StoreProvider>
      <WishlistPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const savedProducts = React.useMemo(() => {
    const allProducts = getAllProducts();
    const items: Product[] = [];

    for (const item of wishlist) {
      if (!item) continue;
      if (typeof item === "object" && ((item as any).id || (item as any).product_id)) {
        items.push(item as Product);
      } else {
        const itemStr = String(item);
        const found = allProducts.find(
          (p) =>
            String(p.id) === itemStr ||
            String((p as any).product_id) === itemStr ||
            String((p as any)._id) === itemStr
        );
        if (found) {
          items.push(found);
        }
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


  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {/* Page Title Header */}
        <div className="flex items-center justify-between border-b-2 border-brand pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="size-6 fill-brand text-brand" />
            <h1 className="text-xl font-bold text-foreground">My Wishlist</h1>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {savedProducts.length} saved item(s)
          </span>
        </div>

        {/* Empty Wishlist State */}
        {savedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Heart className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="text-lg font-bold text-foreground">Your wishlist is empty</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Explore products and click the heart icon on any item to save it to your wishlist.
            </p>
            <Link
              to="/"
              className="inline-block bg-brand px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid using existing design standards */
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
                  className="group relative flex h-full flex-col border border-border bg-card p-4 transition-shadow hover:shadow-md rounded-lg"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-card/90 p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove from wishlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="relative mb-3 aspect-square overflow-hidden bg-muted block rounded-md"
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

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {p.brand}
                  </p>

                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="mt-0.5 line-clamp-2 text-sm text-foreground hover:text-brand transition-colors font-medium"
                  >
                    {p.title}
                  </Link>

                  <p className="mt-auto flex flex-wrap items-baseline gap-2 pt-3">
                    <span className="text-base font-bold text-foreground">{inr(price)}</span>
                    {mrp > price && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
                        <span className="text-xs font-semibold text-brand">{off}% off</span>
                      </>
                    )}
                  </p>

                  <button
                    onClick={() => {
                      addToCart(p);
                    }}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-opacity hover:opacity-90 rounded cursor-pointer"
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
