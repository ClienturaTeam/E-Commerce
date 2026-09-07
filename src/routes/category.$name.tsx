import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { products } from "@/components/store/catalog";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { ProductFilters } from "@/components/store/ProductFilters";
import { SortAndStatsHeader } from "@/components/store/SortAndStatsHeader";
import { DEFAULT_FILTER_STATE, type FilterState, type SortOption } from "@/components/store/filter-types";
import { StoreProvider, useStore } from "@/components/store/store-context";
import { MobileSection } from "@/components/store/MobileSection";
import { FashionSection } from "@/components/store/FashionSection";
import { ElectronicsSection } from "@/components/store/ElectronicsSection";
import { BeautySection } from "@/components/store/BeautySection";
import { HomeSection } from "@/components/store/HomeSection";
import { AppliancesSection } from "@/components/store/AppliancesSection";
import { ToysGiftsSection } from "@/components/store/ToysGiftsSection";
import { GrocerySection } from "@/components/store/GrocerySection";
import { SportsSection } from "@/components/store/SportsSection";
import { BooksSection } from "@/components/store/BooksSection";
import { SlidersHorizontal, X, Tag, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/category/$name")({
  component: CategoryRoute,
});

const CATEGORY_BANNERS: Record<string, { subtitle: string; bgImage: string; subcats: string[] }> = {
  Furniture: {
    subtitle: "Upgrade your home with ergonomic chairs, luxury sofas & solid wood dining sets",
    bgImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Chairs", "Sofas", "Tables", "Beds", "Study Desk", "Bookshelves"],
  },
  Grocery: {
    subtitle: "Everyday essentials, organic dry fruits, honey & staples delivered fast",
    bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Dry Fruits", "Honey", "Olive Oil", "Coffee", "Rice", "Organic Milk"],
  },
  Books: {
    subtitle: "Bestsellers, self-help classics, technical guides & fiction titles",
    bgImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Self-Help", "Finance", "Technology", "History", "Fiction"],
  },
  Appliances: {
    subtitle: "Smart 4K TVs, washing machines, inverter refrigerators & air fryers",
    bgImage: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1200&q=80",
    subcats: ["TVs", "Washing Machines", "Refrigerators", "Air Conditioners", "Air Fryer"],
  },
  "Toys & Baby": {
    subtitle: "Fun building blocks, remote control stunt cars & plush soft toys",
    bgImage: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Building Blocks", "RC Cars", "Plush Toys", "Strollers", "Puzzles"],
  },
  Sports: {
    subtitle: "Running shoes, carbon badminton rackets, cricket bats & yoga mats",
    bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Footwear", "Rackets", "Cricket", "Fitness & Gym", "Football"],
  },
  Mobiles: {
    subtitle: "Latest 5G flagship smartphones, foldable screens & accessories",
    bgImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    subcats: ["5G Mobiles", "Flagship", "Foldables", "Budget Phones"],
  },
  Electronics: {
    subtitle: "Noise cancelling headphones, laptops, smartwatches & cameras",
    bgImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Headphones", "Laptops", "Smartwatches", "Cameras", "Audio"],
  },
};

function CategoryRoute() {
  return (
    <StoreProvider>
      <CategoryPage />
      <CartPanel />
      <ChatBot />
    </StoreProvider>
  );
}

function CategoryPage() {
  const { name } = Route.useParams();
  const { query } = useStore();
  const [filterState, setFilterState] = React.useState<FilterState>(DEFAULT_FILTER_STATE);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [selectedSubCat, setSelectedSubCat] = React.useState<string | null>(null);

  const decodedCategory = React.useMemo(() => {
    try {
      return decodeURIComponent(name);
    } catch {
      return name;
    }
  }, [name]);

  const catLower = decodedCategory.toLowerCase();

  // Unified Section Delegation for Mobiles, Fashion, Electronics, Beauty, Home, Appliances, Toys/Gifts, Grocery, Sports & Books
  if (catLower === "mobiles") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <MobileSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "fashion") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <FashionSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "electronics") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <ElectronicsSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "beauty") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <BeautySection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "home") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <HomeSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "appliances") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <AppliancesSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "toys" || catLower === "toys & gifts" || catLower === "toys & baby" || catLower === "gifts" || catLower === "toys-gifts") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <ToysGiftsSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "grocery" || catLower === "grocery & essentials") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <GrocerySection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "sports" || catLower === "sports & fitness") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <SportsSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (catLower === "books" || catLower === "books & stationery" || catLower === "stationery") {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main>
          <BooksSection />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const categoryMeta = CATEGORY_BANNERS[decodedCategory] || {
    subtitle: `Explore curated authentic items in ${decodedCategory}`,
    bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    subcats: ["Top Deals", "Bestsellers", "New Arrivals"],
  };

  const availableBrands = React.useMemo(() => {
    const brandSet = new Set<string>();
    products
      .filter((p) => p.category.toLowerCase() === decodedCategory.toLowerCase())
      .forEach((p) => {
        if (p.brand) brandSet.add(p.brand);
      });
    return Array.from(brandSet);
  }, [decodedCategory]);

  const displayedProducts = React.useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = p.category.toLowerCase() === decodedCategory.toLowerCase();

      const matchSub =
        !selectedSubCat ||
        p.title.toLowerCase().includes(selectedSubCat.toLowerCase()) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(selectedSubCat.toLowerCase()));

      const q = (query || filterState.searchQuery).trim().toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      const matchPrice =
        p.price >= filterState.priceRange[0] && p.price <= filterState.priceRange[1];

      const matchColor =
        filterState.selectedColors.length === 0 ||
        (p.color && filterState.selectedColors.includes(p.color));

      const matchSize =
        filterState.selectedSizes.length === 0 ||
        (p.sizes && p.sizes.some((s) => filterState.selectedSizes.includes(s)));

      const matchBrand =
        filterState.selectedBrands.length === 0 ||
        (p.brand && filterState.selectedBrands.includes(p.brand));

      const matchAssured = !filterState.onlyAssured || Boolean((p as any).isAssured);
      const matchRating = filterState.minRating === 0 || p.rating >= filterState.minRating;

      const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      const matchDiscount = filterState.minDiscount === 0 || off >= filterState.minDiscount;

      return (
        matchCat &&
        matchSub &&
        matchQuery &&
        matchPrice &&
        matchColor &&
        matchSize &&
        matchBrand &&
        matchAssured &&
        matchRating &&
        matchDiscount
      );
    });

    switch (filterState.sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        result = [...result].sort((a, b) => {
          const offA = (a.mrp - a.price) / a.mrp;
          const offB = (b.mrp - b.price) / b.mrp;
          return offB - offA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [decodedCategory, query, filterState, selectedSubCat]);

  const clearAllFilters = () => {
    setFilterState(DEFAULT_FILTER_STATE);
    setSelectedSubCat(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6 space-y-6">
        {/* Compact Visual Header Banner */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm p-6">
          <img
            src={categoryMeta.bgImage}
            alt={decodedCategory}
            className="absolute inset-0 size-full object-cover filter brightness-[0.25]"
          />
          <div className="relative z-10 space-y-2 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
              <Sparkles className="size-3" />
              Verified Category
            </span>
            <h1 className="text-2xl font-black md:text-3xl capitalize">{decodedCategory}</h1>
            <p className="text-xs md:text-sm opacity-90 max-w-xl font-medium">
              {categoryMeta.subtitle}
            </p>

            {/* Sub-category Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedSubCat(null)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  !selectedSubCat
                    ? "bg-white text-black font-extrabold"
                    : "bg-black/40 text-white hover:bg-black/60"
                }`}
              >
                All {decodedCategory}
              </button>
              {categoryMeta.subcats.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCat(sub === selectedSubCat ? null : sub)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    selectedSubCat === sub
                      ? "bg-white text-black font-extrabold"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Sidebar + Product Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block">
            <ProductFilters
              filters={filterState}
              onFilterChange={setFilterState}
              onClearAll={clearAllFilters}
              totalResults={displayedProducts.length}
              availableBrands={availableBrands}
            />
          </aside>

          {/* Mobile Filter Modal Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs lg:hidden">
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background p-4 shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-brand" />
                    Product Filters
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <ProductFilters
                  filters={filterState}
                  onFilterChange={setFilterState}
                  onClearAll={clearAllFilters}
                  totalResults={displayedProducts.length}
                  availableBrands={availableBrands}
                />
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="mt-4 w-full bg-brand py-2 text-xs font-bold text-primary-foreground rounded-md"
                >
                  Apply Filters ({displayedProducts.length})
                </button>
              </div>
            </div>
          )}

          {/* Right Side: Header Sorting & Product Grid */}
          <div className="lg:col-span-3">
            <SortAndStatsHeader
              totalCount={displayedProducts.length}
              currentSort={filterState.sortBy}
              onSortChange={(sortBy: SortOption) => setFilterState({ ...filterState, sortBy })}
              onMobileFilterOpen={() => setMobileFilterOpen(true)}
              categoryTitle={decodedCategory}
            />

            {displayedProducts.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-lg border border-border px-4 shadow-2xs">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <Tag className="size-6" />
                </div>
                <p className="text-base font-bold text-foreground">No matching products found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try expanding your price range, clearing specific filters, or searching with different keywords.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 bg-brand text-primary-foreground px-4 py-2 text-xs font-bold rounded-md hover:bg-brand-deep transition-colors cursor-pointer shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4">
                {displayedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badgeLabel={p.subCategory ? p.subCategory.toUpperCase() : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
