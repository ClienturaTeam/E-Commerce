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
  const { query, setQuery } = useStore();
  const [queryInput, setQueryInput] = React.useState(q || query || "");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  React.useEffect(() => {
    setQueryInput(q || query || "");
  }, [q, query]);

  const discountRange = React.useMemo(() => {
    return parseDiscountFromBanner(discount);
  }, [discount]);

  const { filteredProducts, isSearchEmpty } = React.useMemo(() => {
    let result = baseProducts;
    const searchTerm = queryInput.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((product) => {
        const inTitle = (product.title || "").toLowerCase().includes(searchTerm);
        const inBrand = (product.brand || "").toLowerCase().includes(searchTerm);
        const inCat = (product.category || "").toLowerCase().includes(searchTerm);
        const inSub = (product.subCategory || "").toLowerCase().includes(searchTerm);
        const inFashion = (product.fashionCategory || "").toLowerCase().includes(searchTerm);
        const inDesc = (product.description || "").toLowerCase().includes(searchTerm);

        const inQuery = inTitle || inBrand || inCat || inSub || inFashion || inDesc;
        const inCategory =
          selectedCategory === "all" ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        return inQuery && inCategory;
      });

      // If user typed a search term and no catalog product matched
      if (result.length === 0) {
        return { filteredProducts: [], isSearchEmpty: true };
      }
    } else if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply Discount Banner Filter if provided (e.g. Up to 40% OFF -> 35% to 40%)
    if (discount) {
      result = filterProductsByDiscount(result, discount);
    }

    // Fallback Dummy Products for empty banner/category filter results
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

    return { filteredProducts: result, isSearchEmpty: false };
  }, [queryInput, selectedCategory, discount, discountRange]);

  const availableCategories = React.useMemo(() => {
    const set = new Set(baseProducts.map((p) => p.category));
    return Array.from(set);
  }, []);

  const popularRecommendations = React.useMemo(() => {
    return baseProducts.filter((p) => p.isBestseller || p.rating >= 4.5).slice(0, 8);
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
          <span className="text-foreground font-bold">Search Results</span>
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
              <span>{filteredProducts.length} product(s) found</span>
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

        {/* SEARCH RESULTS DISPLAY OR EMPTY STATE */}
        {isSearchEmpty ? (
          <div className="space-y-10 py-6">
            <div className="rounded-3xl border border-border bg-card p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="mx-auto size-16 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Search className="size-8 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground">No Products Found</h3>
                <p className="text-xs text-muted-foreground">
                  We couldn't find any products matching &ldquo;<strong className="text-foreground">{queryInput}</strong>&rdquo;.
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/60">
                💡 Try searching for popular categories like <strong>Mobiles</strong>, <strong>Fashion</strong>, <strong>Headphones</strong>, or <strong>Groceries</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQueryInput("");
                  setQuery("");
                }}
                className="px-6 py-2.5 bg-brand hover:bg-brand-deep text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                Clear Search & Explore Store
              </button>
            </div>

            {/* Popular Recommendations Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                  Popular Bestsellers You Might Like
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {popularRecommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
