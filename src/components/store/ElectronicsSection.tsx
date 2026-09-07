import * as React from "react";
import {
  Laptop,
  Tv,
  Headphones,
  Watch,
  Camera,
  Tablet,
  Gamepad2,
  Cable,
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

const ELECTRONICS_HERO_SLIDES: HeroSlide[] = [
  {
    id: "laptops-hero",
    tag: "POWERFUL PERFORMANCE",
    title: "Next-Gen Laptops & MacBooks",
    subtitle: "M2 & Core i7 Processors, OLED Displays & All-Day Battery",
    discount: "UP TO 40% OFF",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80",
    route: "/electronics/laptops",
  },
  {
    id: "tv-hero",
    tag: "CINEMATIC ENTERTAINMENT",
    title: "4K Ultra HD Smart Google TVs",
    subtitle: "Dolby Vision, Atmos Sound & 120Hz Gaming Mode",
    discount: "FLAT ₹15,000 OFF",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80",
    route: "/electronics/tv",
  },
  {
    id: "audio-hero",
    tag: "PURE IMMERSIVE AUDIO",
    title: "Noise Cancelling Headphones & Earbuds",
    subtitle: "Active Noise Cancellation, 40H Playback & Deep Bass",
    discount: "MIN. 50% OFF",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    route: "/electronics/headphones",
  },
];

// CIRCULAR BRAND LOGOS FOR ELECTRONICS
const ELECTRONICS_BRAND_LOGOS: Record<string, React.ReactNode> = {
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
  sony: (
    <span className="text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase font-serif">
      SONY
    </span>
  ),
  hp: (
    <span className="text-base font-black tracking-tighter text-blue-700 italic font-sans">
      hp
    </span>
  ),
  dell: (
    <span className="text-sm font-black tracking-widest text-blue-600 uppercase font-sans">
      DELL
    </span>
  ),
  lenovo: (
    <span className="text-xs font-black tracking-wider text-rose-600 uppercase font-mono">
      Lenovo
    </span>
  ),
  asus: (
    <span className="text-xs font-black tracking-widest text-blue-700 uppercase font-sans">
      ASUS
    </span>
  ),
  boat: (
    <span className="text-xs font-black tracking-tight text-red-600 lowercase font-sans">
      boAt
    </span>
  ),
  jbl: (
    <span className="text-base font-black tracking-widest text-orange-600 uppercase font-sans">
      JBL
    </span>
  ),
};

const ELECTRONICS_BRAND_LIST = [
  { slug: "apple", name: "Apple" },
  { slug: "samsung", name: "Samsung" },
  { slug: "sony", name: "Sony" },
  { slug: "hp", name: "HP" },
  { slug: "dell", name: "Dell" },
  { slug: "lenovo", name: "Lenovo" },
  { slug: "asus", name: "ASUS" },
  { slug: "boat", name: "Boat" },
  { slug: "jbl", name: "JBL" },
];

// Clickable Category Sections
const ELECTRONICS_SECTIONS = [
  { slug: "laptop", title: "Laptops", subtitle: "MacBooks, Gaming & Thin/Light Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80" },
  { slug: "tv", title: "TVs & Displays", subtitle: "4K Smart Google TVs & OLED Displays", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80" },
  { slug: "headphones", title: "Headphones", subtitle: "ANC Over-Ear & TWS Wireless Earbuds", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { slug: "smartwatch", title: "Smart Watches", subtitle: "Apple Watch, Galaxy Watch & Active Trackers", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
  { slug: "camera", title: "Cameras", subtitle: "Full-Frame Mirrorless & Vlog Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80" },
  { slug: "tablet", title: "Tablets", subtitle: "iPads, Galaxy Tabs & Stylus Tablets", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80" },
  { slug: "gaming", title: "Gaming Gear", subtitle: "ROG Laptops, Consoles & Controllers", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80" },
  { slug: "accessories", title: "Accessories", subtitle: "Powerbanks, Chargers & Cables", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80" },
];

const FILTER_BRANDS = ["Apple", "Samsung", "Sony", "HP", "Dell", "Lenovo", "ASUS", "Boat", "JBL", "Nexon", "Pulseform"];

export function ElectronicsSection({
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
  const [maxPrice, setMaxPrice] = React.useState<number>(300000);
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
      setCurrentSlide((prev) => (prev + 1) % ELECTRONICS_HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((i) => i !== b) : [...prev, b]));
  };

  const clearFilters = () => {
    setMinPrice(0);
    setMaxPrice(300000);
    setSelectedBrands([]);
    setSortBy("popularity");
  };

  // COMBINED FILTER SUPPORT
  const electronicsProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (p.category !== "Electronics") return false;

      // Brand Filter if in route or sidebar
      if (selectedBrand) {
        if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // Section/Type Filter if in route
      if (selectedType) {
        const type = selectedType.toLowerCase();
        if (p.electronicsType === type || p.subCategory === type) return true;

        const title = p.title.toLowerCase();
        if (type === "laptops" || type === "laptop") return title.includes("macbook") || title.includes("laptop") || title.includes("pavilion") || title.includes("xps");
        if (type === "tv") return title.includes("tv") || title.includes("bravia") || title.includes("crystal");
        if (type === "headphones") return title.includes("headphone") || title.includes("earbud") || title.includes("rockerz") || title.includes("wh-1000xm5");
        if (type === "smartwatch") return title.includes("watch") || title.includes("active");
        if (type === "camera") return title.includes("camera") || title.includes("alpha");
        if (type === "tablet") return title.includes("ipad") || title.includes("tab");
        if (type === "gaming") return title.includes("gaming") || title.includes("rog") || title.includes("rtx");
        if (type === "accessories") return title.includes("cable") || title.includes("charger") || title.includes("audio");

        return false;
      }

      return true;
    });
  }, [selectedBrand, selectedType]);

  // Apply Search, Price & Sorting
  const filteredProducts = React.useMemo(() => {
    let result = electronicsProducts.filter((p) => {
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
  }, [electronicsProducts, query, minPrice, maxPrice, selectedBrands, sortBy]);

  // Discovery lists for /electronics main page
  const trendingElectronics = React.useMemo(() => {
    return products.filter((p) => p.category === "Electronics" && p.rating >= 4.5).slice(0, 4);
  }, []);

  const bestSellingElectronics = React.useMemo(() => {
    return products.filter((p) => p.category === "Electronics" && p.mrp > p.price).slice(0, 4);
  }, []);

  const budgetPicks = React.useMemo(() => {
    return products.filter((p) => p.category === "Electronics" && p.price <= 30000).slice(0, 4);
  }, []);

  const activeHeaderTitle = selectedBrand
    ? `${selectedBrand.toUpperCase()} ELECTRONICS`
    : selectedType
    ? `${selectedType.toUpperCase()} ELECTRONICS`
    : "ELECTRONICS STORE";

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-6 space-y-8 font-sans">
      {/* 1. ROUTE /electronics: MAIN PAGE (BANNER + CIRCULAR BRANDS + CATEGORY CARDS + TRENDING + BEST SELLING + BUDGET) */}
      {!selectedBrand && !selectedType ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Top Banner Slider */}
          <div
            className="relative rounded-3xl overflow-hidden border border-border shadow-md aspect-21/9 sm:aspect-25/9 min-h-[240px] md:min-h-[340px] bg-slate-900 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <img
              key={ELECTRONICS_HERO_SLIDES[currentSlide].id}
              src={ELECTRONICS_HERO_SLIDES[currentSlide].image}
              alt={ELECTRONICS_HERO_SLIDES[currentSlide].title}
              className="size-full object-cover transition-all duration-700 filter brightness-90 animate-in fade-in"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center p-6 md:p-12 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-primary-foreground text-xs font-black uppercase tracking-widest self-start shadow-md">
                <Flame className="size-3.5 fill-current" /> {ELECTRONICS_HERO_SLIDES[currentSlide].tag}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {ELECTRONICS_HERO_SLIDES[currentSlide].title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg">
                {ELECTRONICS_HERO_SLIDES[currentSlide].subtitle}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/search"
                  search={{ discount: ELECTRONICS_HERO_SLIDES[currentSlide].discount }}
                  className="px-6 py-3 bg-brand text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-brand-deep transition-transform cursor-pointer hover:scale-105 inline-block text-center"
                >
                  SHOP ELECTRONICS • {ELECTRONICS_HERO_SLIDES[currentSlide].discount}
                </Link>
              </div>
            </div>

            {/* Manual Left/Right Arrows */}
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? ELECTRONICS_HERO_SLIDES.length - 1 : prev - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % ELECTRONICS_HERO_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* CIRCULAR BRAND ICONS (FLIPKART STYLE 80px CIRCLES) */}
          <div className="py-2">
            <div className="flex items-center justify-start md:justify-center gap-6 md:gap-8 overflow-x-auto pb-4 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ELECTRONICS_BRAND_LIST.map((b) => (
                <Link
                  key={b.slug}
                  to={`/electronics/brand/${b.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <div className="size-20 rounded-full bg-[#f5f5f5] dark:bg-slate-800 border border-border/40 flex items-center justify-center p-3 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-brand">
                    {ELECTRONICS_BRAND_LOGOS[b.slug] || (
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

          {/* CLICKABLE CATEGORY SECTIONS GRID */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Layers className="size-5 text-brand" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Explore Electronics Categories</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {ELECTRONICS_SECTIONS.map((sec) => (
                <Link
                  key={sec.slug}
                  to={`/electronics/${sec.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-border shadow-md min-h-[220px] flex flex-col justify-end p-5 cursor-pointer bg-card transition-all duration-300 hover:shadow-2xl hover:border-brand text-left"
                >
                  <img
                    src={sec.image}
                    alt={sec.title}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="relative z-10 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-brand bg-card/90 px-2 py-0.5 rounded-full inline-block">
                      CATEGORY
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-between">
                      <span>{sec.title}</span>
                      <ArrowRight className="size-4 text-brand group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-[11px] text-white/80 font-medium line-clamp-2">{sec.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Electronics */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-brand fill-current" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Trending Electronics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {trendingElectronics.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Best Selling Electronics */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500 fill-current" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Best Selling Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellingElectronics.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Budget Picks */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-500" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Budget Electronics Picks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {budgetPicks.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. SECTION OR BRAND FILTERED PRODUCT LISTING PAGE (e.g. /electronics/laptops or /electronics/brand/sony) */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Link
                to="/electronics"
                className="px-3.5 py-1.5 bg-card border border-border rounded-xl text-xs font-bold text-foreground hover:border-brand hover:text-brand transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="size-4" /> Electronics Overview
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight capitalize flex items-center gap-2">
                  <Laptop className="size-6 text-brand" />
                  {activeHeaderTitle}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Showing {filteredProducts.length} electronics product(s) available
                </p>
              </div>
            </div>

            {/* Quick Switch Category Links */}
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border overflow-x-auto">
              {[
                { slug: "laptops", label: "Laptops", route: "/electronics/laptops" },
                { slug: "tv", label: "TVs", route: "/electronics/tv" },
                { slug: "headphones", label: "Headphones", route: "/electronics/headphones" },
                { slug: "smartwatch", label: "Smart Watches", route: "/electronics/smartwatch" },
              ].map((tab) => (
                <Link
                  key={tab.slug}
                  to={tab.route}
                  className={
                    "px-3 py-1 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shrink-0 " +
                    (selectedType === tab.slug
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
                    Filter Electronics
                  </h3>
                </div>

                {(minPrice > 0 || maxPrice < 300000 || selectedBrands.length > 0 || query) && (
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
                  max={300000}
                  step={2000}
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
