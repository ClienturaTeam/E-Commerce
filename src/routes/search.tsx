import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import * as React from "react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, ChevronRight, Sparkles, Filter, Tag } from "lucide-react";
import { products as baseProducts, type Product } from "@/components/store/catalog";
import { filterProductsByDiscount, parseDiscountFromBanner } from "@/lib/discount-filter";
import { getFallbackImage } from "@/components/store/image-fallback";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search["q"] as string) || "",
      discount: (search["discount"] as string) || undefined,
    };
  },
  component: SearchRoute,
});

function SearchRoute() {
  return (
    <StoreProvider>
      <SearchResultsPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function SearchResultsPage() {
  const { q, discount } = useSearch({ from: "/search" });
  const [queryInput, setQueryInput] = React.useState(q);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  React.useEffect(() => {
    setQueryInput(q);
  }, [q]);

  const discountRange = React.useMemo(() => {
    return parseDiscountFromBanner(discount);
  }, [discount]);

  const filteredProducts = React.useMemo(() => {
    let result = baseProducts;
    const searchTerm = queryInput.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((product) => {
        const inQuery =
          product.title.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm));

        const inCategory =
          selectedCategory === "all" ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        return inQuery && inCategory;
      });
    } else if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply Discount Banner Filter if provided (e.g. Up to 40% OFF -> 35% to 40%)
    if (discount) {
      result = filterProductsByDiscount(result, discount);
    }

    // Fallback Dummy Products: Ensure UI is NEVER empty
    if (result.length === 0) {
      const cat = selectedCategory !== "all" ? selectedCategory : "Mobiles";
      const targetDiscount = discountRange ? discountRange.max : 40;
      const mrp1 = 19999;
      const price1 = Math.round(mrp1 * (1 - targetDiscount / 100));
      const mrp2 = 24999;
      const price2 = Math.round(mrp2 * (1 - targetDiscount / 100));
      const mrp3 = 13330;
      const price3 = Math.round(mrp3 * (1 - targetDiscount / 100));

      result = [
        {
          id: `dummy-deal-1-${Date.now()}`,
          title: `Premium ${cat} Special Edition Deal`,
          brand: "Kartly Selection",
          price: price1,
          mrp: mrp1,
          original_price: mrp1,
          discounted_price: price1,
          discount_percentage: targetDiscount,
          rating: 4.6,
          reviews: "1,420",
          category: cat,
          image: getFallbackImage(cat),
          isBestseller: true,
          isAssured: true,
        },
        {
          id: `dummy-deal-2-${Date.now()}`,
          title: `NextGen ${cat} Smart Value Pack`,
          brand: "Apex Hub",
          price: price2,
          mrp: mrp2,
          original_price: mrp2,
          discounted_price: price2,
          discount_percentage: targetDiscount,
          rating: 4.8,
          reviews: "3,890",
          category: cat,
          image: getFallbackImage(cat),
          isAssured: true,
        },
        {
          id: `dummy-deal-3-${Date.now()}`,
          title: `Ultra Pro ${cat} Performance Edition`,
          brand: "Nexon",
          price: price3,
          mrp: mrp3,
          original_price: mrp3,
          discounted_price: price3,
          discount_percentage: targetDiscount,
          rating: 4.4,
          reviews: "820",
          category: cat,
          image: getFallbackImage(cat),
        },
      ];
    }

    return result;
  }, [queryInput, selectedCategory, discount]);

  const availableCategories = React.useMemo(() => {
    const set = new Set(baseProducts.map((p) => p.category));
    return Array.from(set);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link to="/" className="hover:text-brand transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-bold">Search & Banner Deals</span>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
              <Search className="size-7 text-brand" />
              {queryInput ? (
                <span>
                  Results for &ldquo;<span className="text-brand">{queryInput}</span>&rdquo;
                </span>
              ) : discount ? (
                <span className="flex items-center gap-2">
                  <span>Banner Offer Zone:</span>
                  <span className="text-pink-600 dark:text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full text-lg border border-pink-500/20">
                    {discount}
                  </span>
                </span>
              ) : (
                <span>Explore Store Deals</span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-2">
              <span>{filteredProducts.length} product(s) loaded</span>
              {discountRange && (
                <span className="inline-flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded font-bold">
                  <Tag className="size-3" /> Filtered by Discount ({discountRange.min}% - {discountRange.max}%)
                </span>
              )}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 shrink-0">
              <Filter className="size-3.5" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={
                "px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 " +
                (selectedCategory === "all"
                  ? "bg-brand text-primary-foreground border-brand"
                  : "bg-card border-border hover:border-brand")
              }
            >
              All Categories
            </button>

            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={
                  "px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 " +
                  (selectedCategory === cat
                    ? "bg-brand text-primary-foreground border-brand"
                    : "bg-card border-border hover:border-brand")
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
