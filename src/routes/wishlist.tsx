import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { products } from "@/components/store/catalog";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";

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
    return products.filter((p) => wishlist.includes(p.id));
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
              const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);

              return (
                <article
                  key={p.id}
                  className="group relative flex h-full flex-col border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-card/90 p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove from wishlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="relative mb-3 aspect-square overflow-hidden bg-muted block"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
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
                    <span className="text-base font-bold text-foreground">{inr(p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
                    <span className="text-xs font-semibold text-brand">{off}% off</span>
                  </p>

                  <button
                    onClick={() => addToCart(p)}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-opacity hover:opacity-90"
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
