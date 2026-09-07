import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import * as React from "react";
import { getAllProducts, CategoryPageData } from "@/data/categoryData";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, ChevronRight, PackageX, Sparkles, Filter } from "lucide-react";
import { Product } from "@/components/store/catalog";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search["q"] as string) || "",
    };
  },
  component: SearchResultsRoute,
});

function SearchResultsRoute() {
  const { q } = useSearch({ from: "/search" });
  const [queryInput, setQueryInput] = React.useState(q);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  React.useEffect(() => {
    setQueryInput(q);
  }, [q]);

  const allProducts = React.useMemo(() => {
    return getAllProducts();
  }, []);

  const matchingProducts = React.useMemo(() => {
    const searchTerm = queryInput.trim().toLowerCase();
    if (!searchTerm) return [];

    return allProducts.filter((product) => {
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
  }, [allProducts, queryInput, selectedCategory]);

  const availableCategories = React.useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category));
    return Array.from(set);
  }, [allProducts]);

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
              ) : (
                <span>Search Products</span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {matchingProducts.length} product(s) found across all store categories
            </p>
          </div>

          {/* Category Filter Pills */}
          {matchingProducts.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 shrink-0">
                <Filter className="size-3.5" /> Filter Category:
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
                    (selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-brand text-primary-foreground border-brand"
                      : "bg-card border-border hover:border-brand")
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Results or Empty State */}
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <PackageX className="size-10 text-brand" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                No results found for &ldquo;{queryInput}&rdquo;
              </h3>
              <p className="text-xs text-muted-foreground">
                We couldn&apos;t find any items matching your query. Check your spelling or try searching for generic terms like &ldquo;mobile&rdquo;, &ldquo;shoes&rdquo;, or &ldquo;laptop&rdquo;.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-primary-foreground font-bold text-xs rounded-xl hover:bg-brand-deep transition-colors shadow-sm"
            >
              <Sparkles className="size-4" /> Explore All Categories
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
