import * as React from "react";
import {
  Sparkles,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  ShoppingBag,
  Zap,
  ArrowRight,
  Clock,
  Shirt,
  Baby,
  Footprints,
  Watch,
  Smile,
  Gem,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { products, Product, inr } from "./catalog";
import { ProductCard } from "./ProductCard";
import { useStore } from "./store-context";

// 1. Hero Carousel Banners
const HERO_BANNERS = [
  {
    id: "b1",
    tag: "MYNTRA GRAND SALE",
    title: "FLAT 50% - 80% OFF",
    subtitle: "Top Brands: Zara, H&M, Mango & Nike",
    discount: "MIN 60% OFF",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    category: "Fashion",
  },
  {
    id: "b2",
    tag: "FESTIVE ELEGANCE",
    title: "UP TO 70% OFF ON ETHNIC WEAR",
    subtitle: "Designer Sarees, Anarkalis & Kurta Sets",
    discount: "FLAT 70% OFF",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80",
    category: "Fashion",
  },
  {
    id: "b3",
    tag: "SUPER SAVINGS DAYS",
    title: "FLAGSHIP TECH & SMARTPHONES",
    subtitle: "5G Phones, ANC Earbuds & Smartwatches",
    discount: "FROM ₹13,499",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80",
    category: "Mobiles",
  },
];

// 2. Circular Category Icons Row
const CIRCULAR_CATEGORIES = [
  {
    id: "men",
    label: "Men",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    route: "/fashion",
  },
  {
    id: "women",
    label: "Women",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80",
    route: "/fashion",
  },
  {
    id: "kids",
    label: "Kids",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=300&q=80",
    route: "/fashion",
  },
  {
    id: "beauty",
    label: "Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
    route: "/beauty",
  },
  {
    id: "footwear",
    label: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    route: "/fashion",
  },
  {
    id: "accessories",
    label: "Accessories",
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=300&q=80",
    route: "/fashion",
  },
];

// 5. Trending Collections
const TRENDING_COLLECTIONS = [
  {
    id: "tc1",
    title: "ROYAL ETHNIC WEAR",
    subtitle: "Silk Sarees, Heavy Sherwanis & Lehengas",
    discount: "UP TO 75% OFF",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tc2",
    title: "STREETWEAR CASUALS",
    subtitle: "Oversized Hoodies, Cargo Pants & Denim",
    discount: "MIN 60% OFF",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80",
  },
];

// 6. Shop By Category Grids
const SHOP_BY_CATEGORY = [
  {
    name: "Western Dresses",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    discount: "UNDER ₹999",
  },
  {
    name: "Men's Shirts",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80",
    discount: "FLAT 50% OFF",
  },
  {
    name: "Active Sportswear",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    discount: "UNDER ₹799",
  },
  {
    name: "Footwear & Sneakers",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    discount: "MIN 40% OFF",
  },
];

// 7. Curated Collections
const CURATED_COLLECTIONS = [
  {
    title: "Western Wear",
    subtitle: "Chic Blazer Sets & Midi Dresses",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Ethnic Festive",
    subtitle: "Kurta Sets & Embellished Dupattas",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Office Formals",
    subtitle: "Crisp Shirts, Trousers & Oxfords",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80",
  },
];

// 8. Price Deal Sections
const PRICE_DEALS = [
  { label: "UNDER ₹199", bg: "from-pink-500 to-rose-600", desc: "Socks, Hairclips & Daily Essentials" },
  { label: "UNDER ₹299", bg: "from-purple-600 to-indigo-600", desc: "Graphic Tees, Belts & Beauty Minis" },
  { label: "UNDER ₹499", bg: "from-amber-500 to-orange-600", desc: "Casual Shirts, Shorts & Accessories" },
];

export function MyntraFashionFeed() {
  const { setCategory, recentlyViewed } = useStore();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto carousel slide
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Featured Deals for "Deal of the Day"
  const dealOfTheDay = React.useMemo(() => {
    return products.filter((p) => p.category === "Fashion").slice(0, 4);
  }, []);

  // Footwear & Accessories
  const footwearItems = React.useMemo(() => {
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes("shoe") ||
        p.title.toLowerCase().includes("heel") ||
        p.title.toLowerCase().includes("boot")
    );
  }, []);

  const beautyAccessoriesItems = React.useMemo(() => {
    return products.filter(
      (p) =>
        p.category === "Beauty" ||
        p.title.toLowerCase().includes("watch") ||
        p.title.toLowerCase().includes("perfume")
    );
  }, []);

  // Feed items
  const feedItems = React.useMemo(() => {
    return products.slice(0, 16);
  }, []);

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* 1. HERO BANNER CAROUSEL */}
      <div
        className="relative rounded-3xl overflow-hidden border border-border shadow-lg aspect-21/9 sm:aspect-25/9 min-h-[220px] md:min-h-[320px] bg-slate-900 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          key={HERO_BANNERS[currentSlide].id}
          src={HERO_BANNERS[currentSlide].image}
          alt={HERO_BANNERS[currentSlide].title}
          className="size-full object-cover transition-all duration-700 filter brightness-90 animate-in fade-in"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center p-6 md:p-12 space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest self-start shadow-md">
            <Flame className="size-3.5 fill-current" /> {HERO_BANNERS[currentSlide].tag}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {HERO_BANNERS[currentSlide].title}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 font-medium max-w-md line-clamp-1">
            {HERO_BANNERS[currentSlide].subtitle}
          </p>

          <div className="pt-1">
            <Link
              to="/search"
              search={{ discount: HERO_BANNERS[currentSlide].discount }}
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-95 transition-transform cursor-pointer hover:scale-105"
            >
              EXPLORE NOW • {HERO_BANNERS[currentSlide].discount}
            </Link>
          </div>
        </div>

        {/* Carousel Left/Right Controls */}
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1))
          }
          className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-600 cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-600 cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-5 flex gap-1.5 z-10">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={
                "h-2 rounded-full transition-all cursor-pointer " +
                (currentSlide === idx ? "w-6 bg-pink-500" : "w-2 bg-white/50 hover:bg-white")
              }
            />
          ))}
        </div>
      </div>

      {/* 2. CATEGORY ICONS ROW (HORIZONTAL SCROLL) */}
      <div id="categories-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-4 text-pink-500" /> Categories To Explore
          </h3>
          <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400">Scroll right →</span>
        </div>

        <div className="flex items-center gap-5 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CIRCULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.route}
              onClick={() => setCategory(cat.label)}
              className="group flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <div className="size-16 sm:size-20 rounded-full overflow-hidden border-2 border-pink-500/30 p-0.5 bg-card shadow-sm group-hover:border-pink-500 group-hover:scale-105 transition-all">
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  className="size-full object-cover rounded-full"
                />
              </div>
              <span className="text-xs font-extrabold text-foreground group-hover:text-pink-600 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. "DEAL OF THE DAY" / FEATURED GRID */}
      <div className="space-y-3 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-amber-500/5 p-5 rounded-3xl border border-pink-500/20 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-pink-500 text-white">
              <Zap className="size-4" />
            </span>
            <div>
              <h3 className="font-black text-foreground text-lg uppercase tracking-tight">DEAL OF THE DAY</h3>
              <p className="text-xs text-muted-foreground font-medium">Handpicked fashion steals at unbeatable prices</p>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <Clock className="size-3.5" /> Ends in 04h 22m
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {dealOfTheDay.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="50% OFF" />
          ))}
        </div>
      </div>

      {/* 4. TRENDING COLLECTIONS */}
      <div className="space-y-4">
        <div className="border-l-4 border-pink-500 pl-3">
          <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Trending Collections</h3>
          <p className="text-xs text-muted-foreground font-medium">Discover top fashion aesthetics for every mood</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRENDING_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className="group relative rounded-3xl overflow-hidden border border-border shadow-md min-h-[220px] flex flex-col justify-end p-6 cursor-pointer bg-card transition-all duration-300 hover:shadow-2xl hover:border-pink-500/40"
            >
              <img
                src={col.image}
                alt={col.title}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                  TRENDING NOW
                </span>
                <h4 className="text-2xl font-black text-white tracking-tight">{col.title}</h4>
                <p className="text-xs text-white/80 font-medium">{col.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SHOP BY CATEGORY (2x2 GRID) */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-foreground border-b border-border pb-2">
          Shop By Category
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SHOP_BY_CATEGORY.map((item) => (
            <Link
              key={item.name}
              to="/fashion"
              className="group relative rounded-2xl overflow-hidden border border-border aspect-4/3 flex flex-col justify-end p-4 cursor-pointer shadow-xs hover:border-pink-500 transition-all"
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                  {item.discount}
                </span>
                <h4 className="text-sm font-black text-white">{item.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. CURATED COLLECTIONS (HORIZONTAL SCROLL) */}
      <div className="space-y-3">
        <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Curated Styles</h3>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CURATED_COLLECTIONS.map((c) => (
            <div
              key={c.title}
              className="w-64 shrink-0 rounded-2xl overflow-hidden border border-border bg-card shadow-xs group cursor-pointer hover:border-pink-500 transition-all"
            >
              <div className="aspect-4/3 overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h4 className="text-xs font-black uppercase text-foreground">{c.title}</h4>
                <p className="text-[11px] text-muted-foreground font-medium">{c.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. PRICE DEAL SECTIONS */}
      <div className="space-y-3">
        <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Budget Corner Deals</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICE_DEALS.map((p) => (
            <div
              key={p.label}
              className={
                "p-5 rounded-2xl bg-gradient-to-r text-white space-y-2 shadow-md hover:scale-[1.02] transition-transform cursor-pointer " +
                p.bg
              }
            >
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                BUDGET CORNER
              </span>
              <h4 className="text-2xl font-black">{p.label}</h4>
              <p className="text-xs text-white/90 font-medium">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. FOOTWEAR SECTION */}
      {footwearItems.length > 0 && (
        <div className="space-y-3 bg-card p-5 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-pink-500/10 text-pink-500">
                <Footprints className="size-4" />
              </span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">Footwear & Sneakers</h3>
            </div>
            <Link to="/fashion" className="text-xs font-bold text-pink-600 dark:text-pink-400">
              View All →
            </Link>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {footwearItems.map((item) => (
              <div key={item.id} className="w-56 shrink-0">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ACCESSORIES & BEAUTY PASTELS */}
      {beautyAccessoriesItems.length > 0 && (
        <div className="space-y-3 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-amber-500/5 p-5 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500 text-white">
                <Gem className="size-4" />
              </span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">Accessories & Beauty</h3>
            </div>
            <Link to="/beauty" className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Explore All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            {beautyAccessoriesItems.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* 10. PRODUCT FEED (2-COLUMN GRID) */}
      <div id="feed-grid" className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Fashion Feed</h3>
            <p className="text-xs text-muted-foreground font-medium">Curated recommendations personalized for you</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {feedItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
