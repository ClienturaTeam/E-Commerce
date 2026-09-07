import * as React from "react";
import {
  Smartphone,
  Zap,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ArrowRight,
  ArrowLeft,
  PackageCheck,
  Gamepad2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "./ProductCard";
import { products, Product, inr } from "./catalog";
import { useStore } from "./store-context";

// Hero Banner Defs
type HeroSlide = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  route: string;
};

const MOBILE_HERO_SLIDES: HeroSlide[] = [
  {
    id: "flagship-hero",
    tag: "FLAGSHIP LAUNCH",
    title: "Next-Gen 5G Ultra Smartphone",
    subtitle: "200MP OIS Camera, Snapdragon 8 Gen 3 & 120Hz AMOLED",
    discount: "UP TO ₹10,000 OFF",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80",
    route: "/mobiles/flagship",
  },
  {
    id: "gaming-hero",
    tag: "GAMING BEAST",
    title: "Pro Gaming 5G Mobiles",
    subtitle: "165Hz Refresh Rate, Vapor Cooling & AirTriggers",
    discount: "FLAT 25% OFF",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=1600&q=80",
    route: "/mobiles/gaming",
  },
  {
    id: "budget-hero",
    tag: "BUDGET KINGS",
    title: "5G Phones Under ₹15,000",
    subtitle: "5000mAh Battery, 50MP AI Dual Camera & Fast Charge",
    discount: "FROM ₹7,499",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1600&q=80",
    route: "/mobiles/budget",
  },
];

// CIRCULAR LOGO DEFINITIONS (FLIPKART STYLE)
const BRAND_ICON_LOGOS: Record<string, React.ReactNode> = {
  apple: (
    <svg viewBox="0 0 24 24" className="size-7 fill-current text-slate-800 dark:text-white transition-colors">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.67-.82 1.13-1.97.99-3.12-1 .04-2.2.67-2.9 1.49-.62.73-1.17 1.9-1.01 3.03 1.12.09 2.25-.57 2.92-1.4" />
    </svg>
  ),
  samsung: (
    <span className="text-xs font-black tracking-widest text-blue-600 uppercase font-mono">
      SAMSUNG
    </span>
  ),
  vivo: (
    <span className="text-sm font-black tracking-wider text-blue-500 italic uppercase">
      vivo
    </span>
  ),
  oppo: (
    <span className="text-sm font-black tracking-widest text-emerald-600 uppercase font-sans">
      oppo
    </span>
  ),
  realme: (
    <span className="text-sm font-black tracking-tight text-amber-500 lowercase font-sans">
      realme
    </span>
  ),
  redmi: (
    <span className="text-sm font-black tracking-wider text-rose-600 uppercase font-sans">
      Redmi
    </span>
  ),
  oneplus: (
    <div className="flex items-center font-black text-rose-600 text-xs">
      <span className="border border-rose-600 px-1 rounded-sm">1+</span>
    </div>
  ),
  nothing: (
    <span className="text-[9px] font-black tracking-wider text-slate-800 dark:text-white uppercase font-mono text-center">
      NOTHING
    </span>
  ),
  motorola: (
    <div className="size-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
      M
    </div>
  ),
  lava: (
    <span className="text-sm font-black tracking-widest text-red-600 uppercase font-serif">
      LAVA
    </span>
  ),
};

const CIRCULAR_BRAND_LIST = [
  { slug: "apple", name: "Apple" },
  { slug: "samsung", name: "Samsung" },
  { slug: "vivo", name: "Vivo" },
  { slug: "oppo", name: "Oppo" },
  { slug: "realme", name: "Realme" },
  { slug: "redmi", name: "Redmi" },
  { slug: "oneplus", name: "OnePlus" },
  { slug: "nothing", name: "Nothing" },
  { slug: "motorola", name: "Motorola" },
  { slug: "lava", name: "Lava" },
];

// Clickable Mobile Sections
const MOBILE_SECTIONS = [
  {
    id: "trending",
    title: "TRENDING PHONES",
    subtitle: "Top-rated 5G smartphones with high demand",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    route: "/mobiles/trending",
  },
  {
    id: "budget",
    title: "BUDGET PHONES",
    subtitle: "Best value smartphones under ₹15,000",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    route: "/mobiles/budget",
  },
  {
    id: "flagship",
    title: "FLAGSHIP PHONES",
    subtitle: "Ultra high-end specs, pro cameras & 8K video",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    route: "/mobiles/flagship",
  },
  {
    id: "gaming",
    title: "GAMING PHONES",
    subtitle: "Ultra-fast processors & high refresh rate screens",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80",
    route: "/mobiles/gaming",
  },
];

const FILTER_BRANDS = ["Apple", "Samsung", "OnePlus", "Nothing", "Realme", "Redmi", "Vivo", "Oppo", "Motorola", "Lava", "Nexon", "ASUS"];

export function MobileSection({
  selectedBrand,
  selectedType,
}: {
  selectedBrand?: string;
  selectedType?: string;
}) {
  const { query } = useStore();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Filter States
  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(150000);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    selectedBrand ? [selectedBrand] : []
  );
  const [sortBy, setSortBy] = React.useState<"popularity" | "low-high" | "high-low" | "newest">("popularity");

  // Sync prop selection with filter array
  React.useEffect(() => {
    if (selectedBrand) {
      const match = FILTER_BRANDS.find((b) => b.toLowerCase() === selectedBrand.toLowerCase());
      if (match) setSelectedBrands([match]);
    }
  }, [selectedBrand]);

  // Auto slide Carousel
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MOBILE_HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((i) => i !== b) : [...prev, b]));
  };

  const clearFilters = () => {
    setMinPrice(0);
    setMaxPrice(150000);
    setSelectedBrands([]);
    setSortBy("popularity");
  };

  // COMBINED FILTER SUPPORT
  const mobileProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (p.category !== "Mobiles") return false;

      // Brand Filter if in route or sidebar
      if (selectedBrand) {
        if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // Section/Type Filter if in route
      if (selectedType) {
        const type = selectedType.toLowerCase();
        if (p.mobileType === type || p.subCategory === type) return true;

        const title = p.title.toLowerCase();
        if (type === "budget") return p.price <= 20000 || title.includes("budget") || title.includes("spark");
        if (type === "flagship") return p.price >= 35000 || title.includes("flagship") || title.includes("pro max") || title.includes("fold") || title.includes("ultra");
        if (type === "gaming") return title.includes("rog") || title.includes("gaming") || title.includes("turbo") || title.includes("edge");
        if (type === "trending") return p.rating >= 4.3 || title.includes("note") || title.includes("iphone") || title.includes("oneplus");

        return false;
      }

      return true;
    });
  }, [selectedBrand, selectedType]);

  // Apply Search, Price & Sorting
  const filteredProducts = React.useMemo(() => {
    let result = mobileProducts.filter((p) => {
      if (query && query.trim() !== "") {
        const q = query.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand) return false;
      }

      if (p.price < minPrice || p.price > maxPrice) return false;

      if (selectedBrands.length > 0) {
        const matchesBrandInArray = selectedBrands.some(
          (b) => b.toLowerCase() === p.brand.toLowerCase()
        );
        if (!matchesBrandInArray) return false;
      }

      return true;
    });

    if (sortBy === "low-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [mobileProducts, query, minPrice, maxPrice, selectedBrands, sortBy]);

  // Discovery lists for /mobiles main page
  const recommendedPhones = React.useMemo(() => {
    return products.filter((p) => p.category === "Mobiles" && p.mrp > p.price).slice(0, 4);
  }, []);

  const popularPhones = React.useMemo(() => {
    return products.filter((p) => p.category === "Mobiles" && p.rating >= 4.3).slice(0, 4);
  }, []);

  const activeHeaderTitle = selectedBrand
    ? `${selectedBrand.toUpperCase()} SMARTPHONES`
    : selectedType
    ? `${selectedType.toUpperCase()} SMARTPHONES`
    : "MOBILES STORE";

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 space-y-8 font-sans">
      {/* 1. ROUTE /mobiles: MAIN PAGE (BANNER SLIDER + FLIPKART CIRCULAR BRAND ICONS + SECTION CARDS) */}
      {!selectedBrand && !selectedType ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Banner Slider */}
          <div
            className="relative rounded-3xl overflow-hidden border border-border shadow-md aspect-21/9 sm:aspect-25/9 min-h-[240px] md:min-h-[340px] bg-slate-900 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <img
              key={MOBILE_HERO_SLIDES[currentSlide].id}
              src={MOBILE_HERO_SLIDES[currentSlide].image}
              alt={MOBILE_HERO_SLIDES[currentSlide].title}
              className="size-full object-cover transition-all duration-700 filter brightness-90 animate-in fade-in"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center p-6 md:p-12 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-primary-foreground text-xs font-black uppercase tracking-widest self-start shadow-md">
                <Flame className="size-3.5 fill-current" /> {MOBILE_HERO_SLIDES[currentSlide].tag}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {MOBILE_HERO_SLIDES[currentSlide].title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg">
                {MOBILE_HERO_SLIDES[currentSlide].subtitle}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/search"
                  search={{ discount: MOBILE_HERO_SLIDES[currentSlide].discount }}
                  className="px-6 py-3 bg-brand text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-brand-deep transition-transform cursor-pointer hover:scale-105 inline-block text-center"
                >
                  EXPLORE MOBILES • {MOBILE_HERO_SLIDES[currentSlide].discount}
                </Link>
              </div>
            </div>

            {/* Manual Left/Right Arrows */}
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? MOBILE_HERO_SLIDES.length - 1 : prev - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % MOBILE_HERO_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* === FLIPKART-STYLE SMALL CIRCULAR BRAND ICONS (80px CIRCLES, NO HEADING, NO LARGE CARDS) === */}
          <div className="py-2">
            <div className="flex items-center justify-start md:justify-center gap-6 md:gap-8 overflow-x-auto pb-4 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CIRCULAR_BRAND_LIST.map((b) => (
                <Link
                  key={b.slug}
                  to={`/mobiles/brand/${b.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {/* 80px (size-20) Circular Icon Box with background #f5f5f5 */}
                  <div className="size-20 rounded-full bg-[#f5f5f5] dark:bg-slate-800 border border-border/40 flex items-center justify-center p-3 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-brand">
                    {BRAND_ICON_LOGOS[b.slug] || (
                      <span className="font-black text-xs uppercase text-foreground">{b.name}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground/90 group-hover:text-brand tracking-tight transition-colors">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* BELOW BRAND ICONS: CLICKABLE SECTION CARDS */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Layers className="size-5 text-brand" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Browse By Mobile Section</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {MOBILE_SECTIONS.map((card) => (
                <Link
                  key={card.id}
                  to={card.route}
                  className="group relative rounded-3xl overflow-hidden border border-border shadow-md min-h-[260px] flex flex-col justify-end p-5 cursor-pointer bg-card transition-all duration-300 hover:shadow-2xl hover:border-brand text-left"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="relative z-10 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-brand bg-card/90 px-2 py-0.5 rounded-full inline-block">
                      SECTION
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-between">
                      <span>{card.title}</span>
                      <ArrowRight className="size-4 text-brand group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-[11px] text-white/80 font-medium line-clamp-2">{card.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Phones */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500 fill-current" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Recommended Smartphones</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedPhones.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Popular Phones Catalogue */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-brand fill-current" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Popular Smartphones Catalogue</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {popularPhones.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. BRAND OR SECTION FILTERED PRODUCT LISTING PAGE (e.g. /mobiles/brand/apple or /mobiles/budget) */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Link
                to="/mobiles"
                className="px-3.5 py-1.5 bg-card border border-border rounded-xl text-xs font-bold text-foreground hover:border-brand hover:text-brand transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="size-4" /> Mobiles Overview
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight capitalize flex items-center gap-2">
                  <Smartphone className="size-6 text-brand" />
                  {activeHeaderTitle}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Showing {filteredProducts.length} mobile(s) available
                </p>
              </div>
            </div>

            {/* Quick Switch Links */}
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border overflow-x-auto">
              {[
                { type: "trending", label: "Trending", route: "/mobiles/trending" },
                { type: "budget", label: "Budget", route: "/mobiles/budget" },
                { type: "flagship", label: "Flagship", route: "/mobiles/flagship" },
                { type: "gaming", label: "Gaming", route: "/mobiles/gaming" },
              ].map((tab) => (
                <Link
                  key={tab.type}
                  to={tab.route}
                  className={
                    "px-3 py-1 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shrink-0 " +
                    (selectedType === tab.type
                      ? "bg-brand text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* FILTER SIDEBAR + SORT BAR + GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT 3 COLS: FILTER SIDEBAR */}
            <aside className="lg:col-span-3 space-y-6 rounded-3xl border border-border bg-card p-5 shadow-xs sticky top-20">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-brand" />
                  <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">
                    Filter Mobiles
                  </h3>
                </div>

                {(minPrice > 0 || maxPrice < 150000 || selectedBrands.length > 0 || query) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" /> Clear
                  </button>
                )}
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground uppercase">Price Range</span>
                  <span className="text-brand font-black">
                    {inr(minPrice)} – {inr(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              {/* Brand Filter */}
              <div className="space-y-2 border-t border-border pt-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Brands
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {FILTER_BRANDS.map((brand) => {
                    const checked = selectedBrands.some((b) => b.toLowerCase() === brand.toLowerCase());
                    return (
                      <label
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer hover:text-brand transition-colors"
                      >
                        <div
                          className={
                            "size-4 rounded-md border flex items-center justify-center transition-all " +
                            (checked
                              ? "bg-brand border-brand text-primary-foreground"
                              : "border-border bg-background")
                          }
                        >
                          {checked && <Check className="size-3" />}
                        </div>
                        <span>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* RIGHT 9 COLS: SORT BAR & PRODUCT GRID */}
            <div className="lg:col-span-9 space-y-6">
              {/* Sort Bar */}
              <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-3 shadow-xs">
                <span className="text-xs font-bold text-muted-foreground uppercase">Sort Options:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-brand cursor-pointer shadow-xs"
                >
                  <option value="popularity">Popularity</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="newest">Customer Rating</option>
                </select>
              </div>

              {/* 4-COLUMN PRODUCT GRID */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 max-w-md mx-auto border border-dashed border-border rounded-3xl p-6 bg-card shadow-xs">
                  <h3 className="text-lg font-bold text-foreground">No products available in this category</h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Try widening your price range or clearing active brand filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 bg-brand text-primary-foreground text-xs font-bold uppercase rounded-xl cursor-pointer hover:bg-brand-deep transition-colors shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
