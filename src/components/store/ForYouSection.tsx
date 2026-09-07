import * as React from "react";
import {
  Flame,
  Zap,
  Star,
  Sparkles,
  Tag,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Gift,
  Shirt,
  Smartphone,
  Tv,
  Sparkle,
  Home as HomeIcon,
  Refrigerator,
  ShoppingBag,
  Trophy,
  BookOpen,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ProductCard } from "./ProductCard";
import { products, type Product, inr } from "./catalog";
import { useStore } from "./store-context";

// 1. BIG BANNER CAROUSEL DATA
type MainBanner = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  route: string;
  badgeColor: string;
};

const HOMEPAGE_BANNERS: MainBanner[] = [
  {
    id: "sale-banner-1",
    tag: "GRAND SHOPPING SALE",
    title: "Big Freedom Shopping Fest",
    subtitle: "Up to 80% OFF on 1,00,000+ Items across Mobiles, Fashion & Tech",
    discount: "MIN 50% OFF",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
    route: "/fashion",
    badgeColor: "bg-pink-600",
  },
  {
    id: "electronics-banner-2",
    tag: "TECH & MOBILES CARNIVAL",
    title: "Next-Gen Smartphone & Laptop Deals",
    subtitle: "Flagship 5G Mobiles, OLED Laptops & Smartwatches with No-Cost EMI",
    discount: "FLAT ₹10,000 OFF",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80",
    route: "/mobiles",
    badgeColor: "bg-blue-600",
  },
  {
    id: "fashion-banner-3",
    tag: "MYNTRA & FLIPKART FASHION",
    title: "Trending Fashion & Ethnic Wear",
    subtitle: "Top Brands Levi's, Nike, Zara, Biba & HRX Season Clearance",
    discount: "UP TO 70% OFF",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    route: "/fashion",
    badgeColor: "bg-purple-600",
  },
  {
    id: "grocery-banner-4",
    tag: "SUPERMARKET DEALS",
    title: "Fresh Grocery & Daily Essentials",
    subtitle: "Organic Fruits, Breakfast Essentials, Dry Fruits & Gourmet Snacks",
    discount: "EVERYDAY LOW PRICES",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    route: "/grocery",
    badgeColor: "bg-emerald-600",
  },
];



// 9. TOP BRANDS LIST
const TOP_BRANDS = [
  { name: "Apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80" },
  { name: "Samsung", logo: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80" },
  { name: "Nike", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80" },
  { name: "Sony", logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
  { name: "Philips", logo: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=300&q=80" },
  { name: "Adidas", logo: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=300&q=80" },
  { name: "Zara", logo: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80" },
  { name: "H&M", logo: "https://images.unsplash.com/photo-1542272604-780c36856d60?auto=format&fit=crop&w=300&q=80" },
];

export function ForYouSection() {
  const { setCategory, recentlyViewed } = useStore();
  const navigate = useNavigate();

  // Banner State
  const [activeBanner, setActiveBanner] = React.useState(0);
  const [isBannerHovered, setIsBannerHovered] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  // Live Countdown timer for Limited Time Deals
  const [timeLeft, setTimeLeft] = React.useState({ hours: 4, minutes: 18, seconds: 42 });

  React.useEffect(() => {
    if (isBannerHovered) return;
    const bannerTimer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % HOMEPAGE_BANNERS.length);
    }, 3500);

    const clockTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => {
      clearInterval(bannerTimer);
      clearInterval(clockTimer);
    };
  }, [isBannerHovered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 40) {
      setActiveBanner((prev) => (prev + 1) % HOMEPAGE_BANNERS.length);
    } else if (touchEndX.current - touchStartX.current > 40) {
      setActiveBanner((prev) => (prev - 1 + HOMEPAGE_BANNERS.length) % HOMEPAGE_BANNERS.length);
    }
  };

  // DATA LOGIC FOR ALL 10 HOMEPAGE SECTIONS
  const recentProducts = React.useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0) return [];
    return recentlyViewed
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 6);
  }, [recentlyViewed]);

  // 3. Deals of the Day (6-10 items with top discount)
  const dealsOfTheDay = React.useMemo(() => {
    return products.filter((p) => p.isDealOfTheDay || p.mrp > p.price).slice(0, 6);
  }, []);

  // 4. Trending Products (sorted by rating / popularity)
  const trendingProducts = React.useMemo(() => {
    return [...products].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, []);

  // 5. Most Selling Items (Best Sellers)
  const mostSellingItems = React.useMemo(() => {
    return products.slice(2, 8);
  }, []);

  // 6. Recommended For You (mixed products from all categories)
  const recommendedProducts = React.useMemo(() => {
    return products.slice(5, 11);
  }, []);

  // 7. Discount Zone (High discounts >= 40%)
  const discountZoneProducts = React.useMemo(() => {
    return products
      .filter((p) => Math.round(((p.mrp - p.price) / p.mrp) * 100) >= 40)
      .slice(0, 6);
  }, []);

  // 8. New Arrivals (Fresh products)
  const newArrivals = React.useMemo(() => {
    return products.slice(8, 14);
  }, []);

  // 10. Limited Time Deals (Flash sale)
  const flashSaleDeals = React.useMemo(() => {
    return products.slice(1, 7);
  }, []);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-4 space-y-12 font-sans">
      {/* 🎥 1. BIG BANNER CAROUSEL (350px-450px, Auto-Slide, Arrows & Dots) */}
      <div
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="group relative w-full h-[350px] sm:h-[400px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-border bg-slate-900"
      >
        {HOMEPAGE_BANNERS.map((b, idx) => (
          <div
            key={b.id}
            className={
              "absolute inset-0 transition-opacity duration-700 ease-in-out flex items-end p-6 md:p-12 " +
              (idx === activeBanner ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none")
            }
          >
            <img
              src={b.image}
              alt={b.title}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80";
              }}
              className="absolute inset-0 size-full object-cover filter brightness-[0.85] transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-20 space-y-3 max-w-xl text-left">
              <span className={`inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-white font-black text-xs uppercase tracking-widest ${b.badgeColor} shadow-md`}>
                <Sparkles className="size-3.5 fill-current" /> {b.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                {b.title}
              </h2>
              <p className="text-xs sm:text-sm md:text-lg text-pink-100 font-medium drop-shadow-xs">
                {b.subtitle}
              </p>
              <Link
                to="/search"
                search={{ discount: b.discount }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <span>Explore Mega Deals ({b.discount})</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ))}

        {/* Previous Arrow */}
        <button
          type="button"
          onClick={() => setActiveBanner((prev) => (prev - 1 + HOMEPAGE_BANNERS.length) % HOMEPAGE_BANNERS.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 size-11 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer shadow-md"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={() => setActiveBanner((prev) => (prev + 1) % HOMEPAGE_BANNERS.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 size-11 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer shadow-md"
          aria-label="Next Banner"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HOMEPAGE_BANNERS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveBanner(i)}
              className={
                "h-2 rounded-full transition-all cursor-pointer " +
                (i === activeBanner ? "w-8 bg-pink-600" : "w-2 bg-white/60 hover:bg-white")
              }
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* RECENTLY VIEWED SECTION (If Available) */}
      {recentProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-black">
                <Clock className="size-5" />
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                  Recently Viewed
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Products you browsed recently
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} badgeLabel="RECENT" />
            ))}
          </div>
        </div>
      )}

      {/* ⚡ 3. DEALS OF THE DAY */}
      <div className="space-y-4 rounded-3xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-pink-950/20 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-200/80 dark:border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-600 text-white font-black">
              <Flame className="size-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Deals of the Day
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Handpicked top discounts refreshed daily
              </p>
            </div>
          </div>
          <Link
            to="/category/Electronics"
            className="px-3.5 py-1.5 bg-pink-600 text-white text-xs font-bold rounded-xl hover:bg-pink-700 transition-colors shadow-xs"
          >
            View All Deals →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {dealsOfTheDay.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="DEAL OF DAY" />
          ))}
        </div>
      </div>

      {/* 🔥 4. TRENDING PRODUCTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white font-black">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Trending Products
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Highest customer rated items across all categories
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingProducts.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="TRENDING" />
          ))}
        </div>
      </div>

      {/* ⭐ 5. MOST SELLING ITEMS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black">
              <Award className="size-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Most Selling Items
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Top purchased bestsellers this week
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mostSellingItems.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="BEST SELLER" />
          ))}
        </div>
      </div>

      {/* 🎯 6. RECOMMENDED FOR YOU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-600 text-white font-black">
              <Sparkles className="size-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Curated department picks tailored to your style
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendedProducts.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="RECOMMENDED" />
          ))}
        </div>
      </div>

      {/* 💸 7. DISCOUNT ZONE */}
      <div className="space-y-4 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black">
              <Tag className="size-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Super Discount Zone (Min 40% OFF)
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Unbeatable savings on high value items
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {discountZoneProducts.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="MIN 40% OFF" />
          ))}
        </div>
      </div>

      {/* 🆕 8. NEW ARRIVALS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-600 text-white font-black">
              <Zap className="size-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                New Arrivals
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Fresh stock added to catalog this week
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="NEW" />
          ))}
        </div>
      </div>

      {/* 🏆 9. TOP BRANDS STORE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black">
              <Trophy className="size-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                Top Brands Store
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Shop official storefronts with 100% brand warranty
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TOP_BRANDS.map((b) => (
            <div
              key={b.name}
              onClick={() => {
                navigate({ to: "/search", search: { q: b.name } });
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl border border-border bg-card shadow-xs hover:border-pink-600 hover:shadow-md transition-all cursor-pointer text-center"
            >
              <div className="size-14 rounded-xl overflow-hidden bg-muted mb-2 border border-border/60">
                <img
                  src={b.logo}
                  alt={b.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";
                  }}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-pink-600 transition-colors">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ⏳ 10. LIMITED TIME DEALS */}
      <div className="space-y-4 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200/80 dark:border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-600 text-white font-black shadow-md animate-pulse">
              <Clock className="size-6" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                Limited Time Flash Sale
              </h2>
              <p className="text-xs text-muted-foreground font-bold">
                Prices drop for a limited time only!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-white bg-rose-600 px-4 py-2 rounded-xl shadow-md">
            <span className="px-1.5 py-0.5 bg-black/30 rounded-md">
              {String(timeLeft.hours).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-black/30 rounded-md">
              {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-black/30 rounded-md">
              {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {flashSaleDeals.map((p) => (
            <ProductCard key={p.id} product={p} badgeLabel="FLASH SALE" />
          ))}
        </div>
      </div>
    </section>
  );
}
