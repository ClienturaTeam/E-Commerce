import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "./store-context";
import { toast } from "sonner";
import bannerHero from "@/assets/banner-hero.jpg";
import bannerAudio from "@/assets/banner-audio.jpg";

type Slide = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  category: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: "mobiles-slide",
    tag: "Super Savings Days",
    title: "Up to 60% Off On Top Mobiles",
    subtitle: "Latest launches | Best deals | No cost EMI",
    ctaText: "Shop Now",
    category: "Mobiles",
    image: bannerHero,
  },
  {
    id: "fashion-slide",
    tag: "New Collection",
    title: "Up to 70% Off On Fashion Trends",
    subtitle: "Men, Women & Kids Wear | Extra 10% Bank Discount",
    ctaText: "Explore Fashion",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "electronics-slide",
    tag: "Best of Tech",
    title: "Mega Deals On Laptops & Audio",
    subtitle: "Wireless Earbuds, Smartwatches & 4K Smart TVs",
    ctaText: "Shop Electronics",
    category: "Electronics",
    image: bannerAudio,
  },
  {
    id: "grocery-slide",
    tag: "Daily Essentials",
    title: "Up to 50% Off On Grocery Staples",
    subtitle: "Dry fruits, Organic Oils & Daily Essentials Delivered Fast",
    ctaText: "Shop Grocery",
    category: "Grocery",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const { setCategory } = useStore();

  const jumpToDeals = () =>
    document.getElementById("deals")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Auto-slide every 3 seconds unless hovered
  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[currentIndex];

  return (
    <div
      className="relative overflow-hidden bg-brand-deep min-h-[300px] sm:min-h-[360px] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Images Wrapper */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full h-full shrink-0">
            <img
              src={slide.image}
              alt={slide.title}
              width={1600}
              height={640}
              className="h-[300px] sm:h-[360px] w-full object-cover"
            />
            {/* Gradient Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent flex flex-col justify-center gap-3 p-6 sm:p-10">
              <p className="w-fit bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                {slide.tag}
              </p>
              <h2 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-4xl">
                {slide.title}
              </h2>
              <p className="max-w-md text-xs sm:text-sm text-white/90 font-medium">
                {slide.subtitle}
              </p>
              <Link
                to="/search"
                search={{ discount: slide.title }}
                className="w-fit bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-md mt-1 inline-block"
              >
                {slide.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Left & Right Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx ? "w-6 bg-accent" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
