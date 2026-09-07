import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Flame,
  Shirt,
  Baby,
} from "lucide-react";
import { ProductCard } from "./ProductCard";
import { products, type Product } from "./catalog";
import { ProductFilters } from "./ProductFilters";
import { SortAndStatsHeader } from "./SortAndStatsHeader";
import { DEFAULT_FILTER_STATE, type FilterState, type SortOption } from "./filter-types";

export type CategoryItemDef = {
  id: string;
  name: string;
  image: string;
};

export const MEN_CATEGORIES_LIST: CategoryItemDef[] = [
  { id: "shirts", name: "Shirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80" },
  { id: "t-shirts", name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80" },
  { id: "jeans", name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80" },
  { id: "trousers-pants", name: "Trousers & Pants", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80" },
  { id: "shorts", name: "Shorts", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80" },
  { id: "hoodies", name: "Hoodies", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80" },
  { id: "ethnic-wear", name: "Ethnic Wear", image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=400&q=80" },
  { id: "footwear", name: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=400&q=80" },
  { id: "grooming", name: "Grooming", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=400&q=80" },
  { id: "sportswear", name: "Sportswear", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80" },
];

export const WOMEN_CATEGORIES_LIST: CategoryItemDef[] = [
  { id: "western-wear", name: "Western Wear", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80" },
  { id: "ethnic-wear", name: "Ethnic Wear", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
  { id: "fusion-wear", name: "Fusion Wear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" },
  { id: "dresses", name: "Dresses", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=400&q=80" },
  { id: "tops", name: "Tops", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80" },
  { id: "jeans-leggings", name: "Jeans & Leggings", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80" },
  { id: "footwear", name: "Footwear", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80" },
  { id: "beauty", name: "Beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80" },
  { id: "sportswear", name: "Sportswear", image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=400&q=80" },
];

export const KIDS_CATEGORIES_LIST: CategoryItemDef[] = [
  { id: "boys-clothing", name: "Boys Clothing", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80" },
  { id: "girls-clothing", name: "Girls Clothing", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=400&q=80" },
  { id: "infants", name: "Infants", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" },
  { id: "teens", name: "Teens", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=400&q=80" },
  { id: "footwear", name: "Footwear", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=400&q=80" },
  { id: "toys", name: "Toys", image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=400&q=80" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" },
];

interface FashionSectionProps {
  selectedGender?: "men" | "women" | "kids";
  selectedSection?: string;
  selectedType?: string;
}

export function FashionSection({
  selectedGender,
  selectedSection,
  selectedType,
}: FashionSectionProps) {
  const navigate = useNavigate();

  // Determine current navigation level (Level 1, Level 2, or Level 3)
  const currentGender = selectedGender || (selectedType === "men" || selectedType === "women" || selectedType === "kids" ? selectedType : undefined);

  // If no gender is specified, we render LEVEL 1 (Main Fashion Page: Hero Carousel + 3 Category Boxes + Recommended Products)
  if (!currentGender) {
    return <FashionLevel1View />;
  }

  // If gender is specified but no section/category is specified, render LEVEL 2 (Category Grid)
  if (!selectedSection) {
    return <FashionLevel2View gender={currentGender} />;
  }

  // If both gender and section are specified, render LEVEL 3 (Product Grid for that specific section)
  return <FashionLevel3View gender={currentGender} sectionSlug={selectedSection} />;
}

/* ====================================================================
   🎥 1. HERO CAROUSEL COMPONENT (TOP SLIDABLE BANNER)
   ==================================================================== */
function FashionHeroCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const slides = [
    {
      id: "slide-1",
      badge: "MEGA FASHION FESTIVAL",
      title: "BIGGEST SEASON SALE",
      subtitle: "Up to 70% OFF on Top Indian & International Fashion Brands",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
      cta: "Explore Store Deals →",
      link: "/fashion/men",
    },
    {
      id: "slide-2",
      badge: "MEN'S SPECIAL",
      title: "URBAN STYLE COLLECTION",
      subtitle: "Shirts, T-Shirts, Denim & Footwear Starting @ ₹499",
      image: "https://images.unsplash.com/photo-1490578474895-699bc4e2cf59?auto=format&fit=crop&w=1600&q=80",
      cta: "Shop Men's Fashion →",
      link: "/fashion/men",
    },
    {
      id: "slide-3",
      badge: "WOMEN'S EDITION",
      title: "ETHNIC & WESTERN ELEGANCE",
      subtitle: "Sarees, Western Dresses, Tops & Beauty Starting @ ₹599",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
      cta: "Shop Women's Fashion →",
      link: "/fashion/women",
    },
    {
      id: "slide-4",
      badge: "KIDS' ZONE",
      title: "PLAYFUL KIDS WARDROBE",
      subtitle: "Cute Frocks, Boys Sets, Toys & Footwear Starting @ ₹299",
      image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1600&q=80",
      cta: "Shop Kids' Fashion →",
      link: "/fashion/kids",
    },
  ];

  // Auto slide every 3.5 seconds
  React.useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 40) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (touchEndX.current - touchStartX.current > 40) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div
      className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] overflow-hidden rounded-3xl border border-border shadow-xl bg-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Background Banner Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="size-full object-cover object-center"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white" />

          {/* Content Box */}
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4 p-6 sm:p-12 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-brand text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-md">
              {slide.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium line-clamp-2">
              {slide.subtitle}
            </p>
            <div className="pt-2">
              <Link
                to="/search"
                search={{ discount: slide.subtitle }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-primary-foreground bg-brand hover:bg-brand-deep px-6 py-3 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev Navigation Arrow */}
      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-md opacity-80 hover:opacity-100"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="size-6" />
      </button>

      {/* Next Navigation Arrow */}
      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-md opacity-80 hover:opacity-100"
        aria-label="Next Slide"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide ? "w-8 bg-brand" : "w-2.5 bg-white/60 hover:bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   🎯 LEVEL 1 – MAIN FASHION PAGE (/fashion)
   Features:
   1. TOP BANNER (BIG + SLIDABLE HERO CAROUSEL)
   2. CATEGORY BOXES (MEN / WOMEN / KIDS)
   3. RECOMMENDED ITEMS SECTION ("Recommended For You")
   ==================================================================== */
function FashionLevel1View() {
  const categoryBoxes = [
    {
      id: "men",
      title: "MEN",
      subtitle: "Shirts, T-Shirts, Jeans, Footwear & Accessories",
      image: "https://images.unsplash.com/photo-1520975922203-bcb7cbe8fcb9?auto=format&fit=crop&w=800&q=80",
      route: "/fashion/men",
      badge: "FLIPKART EXCLUSIVE",
    },
    {
      id: "women",
      title: "WOMEN",
      subtitle: "Dresses, Ethnic Sarees, Tops, Footwear & Beauty",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      route: "/fashion/women",
      badge: "TRENDING NOW",
    },
    {
      id: "kids",
      title: "KIDS",
      subtitle: "Boys, Girls, Infants, Toys & Accessories",
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
      route: "/fashion/kids",
      badge: "UP TO 70% OFF",
    },
  ];

  // Recommended Products: mixed items from Men, Women, Kids fashion
  const recommendedProducts = React.useMemo(() => {
    const fashionItems = products.filter((p) => p.category === "Fashion");
    return fashionItems.slice(0, 10);
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 space-y-10">
      {/* 1. TOP BANNER (BIG + SLIDABLE HERO CAROUSEL) */}
      <FashionHeroCarousel />

      {/* 2. CATEGORY BOXES (MEN / WOMEN / KIDS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Browse Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Select Your Category
            </h2>
          </div>
        </div>

        {/* 3 LARGE RECTANGULAR CARDS (Side by side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {categoryBoxes.map((b) => (
            <Link
              key={b.id}
              to={b.route}
              className="group relative h-[380px] sm:h-[440px] w-full overflow-hidden rounded-3xl border border-border shadow-md transition-all duration-500 hover:shadow-2xl hover:border-brand cursor-pointer flex flex-col justify-end p-6 sm:p-8"
            >
              {/* Background Image with Hover Zoom */}
              <img
                src={b.image}
                alt={b.title}
                loading="lazy"
                className="absolute inset-0 size-full object-cover object-center"
              />

              {/* Dark Overlay Gradient for Clear Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/95" />

              {/* Content Overlay */}
              <div className="relative z-10 space-y-3 text-white">
                <span className="inline-block px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white border border-white/30">
                  {b.badge}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-between">
                  <span>{b.title}</span>
                  <ChevronRight className="size-8 text-brand transition-transform duration-300 group-hover:translate-x-2" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-medium line-clamp-2">
                  {b.subtitle}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary-foreground bg-brand px-5 py-2.5 rounded-xl shadow-md group-hover:bg-brand-deep transition-colors">
                    Explore {b.title} Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. RECOMMENDED ITEMS SECTION */}
      <div className="space-y-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="size-3.5 fill-amber-500 text-amber-500" /> Handpicked Trends
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Recommended For You
            </h2>
            <p className="text-xs text-muted-foreground">
              Explore mixed trending styles across Men, Women & Kids collections.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} badgeLabel="RECOMMENDED" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   🎯 LEVEL 2 – CATEGORY PAGE (/fashion/men, /fashion/women, /fashion/kids)
   Shows Category Grid with small square cards (image + label below)
   ==================================================================== */
function FashionLevel2View({ gender }: { gender: "men" | "women" | "kids" }) {
  const categoryList =
    gender === "men"
      ? MEN_CATEGORIES_LIST
      : gender === "women"
      ? WOMEN_CATEGORIES_LIST
      : KIDS_CATEGORIES_LIST;

  const genderLabel = gender.toUpperCase();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
        <Link to="/fashion" className="hover:text-brand transition-colors">
          Fashion
        </Link>
        <ChevronRight className="size-3.5 opacity-50" />
        <span className="text-foreground font-bold">{genderLabel}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand/10 via-brand/5 to-transparent border border-brand/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-1">
            Department Store
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {genderLabel}'s Fashion Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a category to browse handpicked styles and deals for {genderLabel}.
          </p>
        </div>
        <Link
          to="/fashion"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" /> Switch Department
        </Link>
      </div>

      {/* CATEGORY GRID (Small Square Cards: Image + Label below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categoryList.map((cat) => (
          <Link
            key={cat.id}
            to={`/fashion/${gender}/${cat.id}`}
            className="group flex flex-col items-center justify-center p-3 rounded-2xl border border-border bg-card shadow-2xs hover:border-brand hover:shadow-md transition-all duration-300 text-center cursor-pointer"
          >
            {/* Small Square Image Card */}
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-muted mb-3 relative">
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>

            {/* Label Below */}
            <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   🎯 LEVEL 3 – PRODUCT PAGE (/fashion/men/$section, etc.)
   Shows ONLY related products for that gender & category section.
   Includes Filter sidebar (Price, Size, Brand, Color, Rating).
   ==================================================================== */
function FashionLevel3View({
  gender,
  sectionSlug,
}: {
  gender: "men" | "women" | "kids";
  sectionSlug: string;
}) {
  const categoryList =
    gender === "men"
      ? MEN_CATEGORIES_LIST
      : gender === "women"
      ? WOMEN_CATEGORIES_LIST
      : KIDS_CATEGORIES_LIST;

  const foundCategoryObj = categoryList.find(
    (c) => c.id === sectionSlug.toLowerCase()
  );

  const sectionName = foundCategoryObj
    ? foundCategoryObj.name
    : sectionSlug.replace(/-/g, " ").toUpperCase();

  const [filterState, setFilterState] = React.useState<FilterState>(DEFAULT_FILTER_STATE);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const clearAllFilters = () => setFilterState(DEFAULT_FILTER_STATE);

  // STRICT GENDER & SECTION DATA FILTERING (DO NOT MIX DATA!)
  const displayedProducts = React.useMemo(() => {
    // 1. Strict Gender Filter: MUST match fashionCategory === gender
    let result = products.filter((p) => {
      const isFashion = p.category === "Fashion";
      const isCorrectGender = p.fashionCategory === gender;
      return isFashion && isCorrectGender;
    });

    // 2. Section SubCategory Filter
    const normSlug = sectionSlug.toLowerCase().replace(/-/g, "");
    const matchingSectionProducts = result.filter((p) => {
      const sub = (p.subCategory || "").toLowerCase().replace(/-/g, "");
      const title = p.title.toLowerCase();
      const catNameNorm = sectionName.toLowerCase().replace(/[^a-z0-9]/g, "");

      return (
        sub === normSlug ||
        sub.includes(normSlug) ||
        normSlug.includes(sub) ||
        title.includes(normSlug) ||
        title.includes(catNameNorm)
      );
    });

    // If matching section items exist, use them; otherwise use gender items as clean fallback
    if (matchingSectionProducts.length > 0) {
      result = matchingSectionProducts;
    }

    // 3. User Active Filters Pipeline
    result = result.filter((p) => {
      // In-category search
      const matchQuery =
        !filterState.searchQuery ||
        p.title.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(filterState.searchQuery.toLowerCase());

      // Price range
      const matchPrice =
        p.price >= filterState.priceRange[0] && p.price <= filterState.priceRange[1];

      // Colors
      const matchColor =
        filterState.selectedColors.length === 0 ||
        (p.color && filterState.selectedColors.includes(p.color));

      // Sizes
      const matchSize =
        filterState.selectedSizes.length === 0 ||
        (p.sizes && p.sizes.some((s) => filterState.selectedSizes.includes(s)));

      // Brands
      const matchBrand =
        filterState.selectedBrands.length === 0 ||
        (p.brand && filterState.selectedBrands.includes(p.brand));

      // Assured
      const matchAssured = !filterState.onlyAssured || Boolean(p.isAssured);

      // Min Rating
      const matchRating = filterState.minRating === 0 || p.rating >= filterState.minRating;

      // Min Discount
      const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      const matchDiscount = filterState.minDiscount === 0 || off >= filterState.minDiscount;

      return (
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

    // 4. Sorting
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
  }, [gender, sectionSlug, sectionName, filterState]);

  // Compute available brands for this gender & section
  const availableBrands = React.useMemo(() => {
    const brandSet = new Set<string>();
    products
      .filter((p) => p.category === "Fashion" && p.fashionCategory === gender)
      .forEach((p) => {
        if (p.brand) brandSet.add(p.brand);
      });
    return Array.from(brandSet);
  }, [gender]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation (Level 1 → Level 2 → Level 3) */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
        <Link to="/fashion" className="hover:text-brand transition-colors">
          Fashion
        </Link>
        <ChevronRight className="size-3.5 opacity-50" />
        <Link to={`/fashion/${gender}`} className="hover:text-brand transition-colors capitalize">
          {gender}
        </Link>
        <ChevronRight className="size-3.5 opacity-50" />
        <span className="text-foreground font-bold">{sectionName}</span>
      </nav>

      {/* Main Dual Pane Layout: Left Sidebar Filters + Right Product Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
        {/* Left Sidebar Filters (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <ProductFilters
            filters={filterState}
            onFilterChange={setFilterState}
            onClearAll={clearAllFilters}
            totalResults={displayedProducts.length}
            availableBrands={availableBrands}
          />
        </div>

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
                  type="button"
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
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="mt-4 w-full bg-brand py-2 text-xs font-bold text-primary-foreground rounded-md"
              >
                Apply Filters ({displayedProducts.length})
              </button>
            </div>
          </div>
        )}

        {/* Right Side: Header Sorting & Product Grid */}
        <div className="lg:col-span-3 space-y-4">
          <SortAndStatsHeader
            totalCount={displayedProducts.length}
            currentSort={filterState.sortBy}
            onSortChange={(sortBy: SortOption) => setFilterState({ ...filterState, sortBy })}
            onMobileFilterOpen={() => setMobileFilterOpen(true)}
            categoryTitle={`${gender.toUpperCase()} / ${sectionName.toUpperCase()}`}
          />

          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center bg-card rounded-2xl border border-border px-4 shadow-2xs space-y-3">
              <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
              <p className="text-base font-bold text-foreground">No products found in this category</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try clearing active filters or explore other categories.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-brand text-primary-foreground px-4 py-2 text-xs font-bold rounded-md hover:bg-brand-deep cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  badgeLabel={sectionName.toUpperCase()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
