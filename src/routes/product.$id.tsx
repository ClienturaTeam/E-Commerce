import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import {
  ArrowLeft,
  Star,
  Heart,
  Check,
  Zap,
  Tag,
  CreditCard,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  Share2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  products,
  inr,
  type Product,
  type ProductVariant,
} from "@/components/store/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { useStore } from "@/components/store/store-context";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailPage,
});

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    userName: "Rahul Sharma",
    rating: 5,
    comment: "Outstanding product quality! Fits accurate, fabric feels premium, and colors match the photo exactly.",
    date: "28 Aug 2026",
    verified: true,
  },
  {
    id: "rev-2",
    userName: "Sneha Patel",
    rating: 4,
    comment: "Very comfortable for daily use. Super fast delivery by Kartly. Great value for money!",
    date: "21 Aug 2026",
    verified: true,
  },
  {
    id: "rev-3",
    userName: "Amitav Roy",
    rating: 5,
    comment: "Top notch finish and vibrant color. Exceeded my expectations.",
    date: "14 Aug 2026",
    verified: true,
  },
];

const SIZES_DATA = [
  { name: "S", inStock: true, priceOffset: 0 },
  { name: "M", inStock: true, priceOffset: 0 },
  { name: "L", inStock: true, priceOffset: 50 },
  { name: "XL", inStock: true, priceOffset: 100 },
  { name: "XXL", inStock: false, priceOffset: 150 },
];

function ProductDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const {
    addToCart,
    buyNow,
    wishlist,
    toggleWishlist,
    addRecentlyViewed,
    pincode,
    setPincode,
    openAddressModal,
    user,
    openAuthModal,
    customReviews,
    addProductReview,
  } = useStore();

  // 1. Strict Product Lookup
  const product = React.useMemo(() => {
    return products.find((p) => p.id === id) || products[0]!;
  }, [id]);

  // 2. Strict Product-Level Variants (ONLY from product.variants)
  const productVariants = React.useMemo(() => {
    if (!product || !product.variants || !Array.isArray(product.variants)) {
      return [];
    }
    return product.variants;
  }, [product]);

  // 3. Variant & Size State
  const [selectedColor, setSelectedColor] = React.useState<string>(
    productVariants[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = React.useState<string>(
    product.sizes?.[0] || "M"
  );
  const [activeImage, setActiveImage] = React.useState<string>(product.image);

  // 4. RESET on Product Navigation change (id change)
  React.useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      setActiveImage(product.image);
      setSelectedSize(product.sizes?.[0] || "M");
      const vars = product.variants || [];
      setSelectedColor(vars[0]?.color || "");
    }
  }, [id, product, addRecentlyViewed]);

  // Active Variant Object
  const activeVariantObj = React.useMemo(() => {
    if (productVariants.length === 0) return null;
    return (
      productVariants.find((v) => v.color === selectedColor) ||
      productVariants[0] ||
      null
    );
  }, [productVariants, selectedColor]);

  // Active Gallery Images
  const currentGalleryImages = React.useMemo(() => {
    if (!activeVariantObj || !activeVariantObj.images || activeVariantObj.images.length === 0) {
      return [product.image];
    }
    const combined = [product.image, ...activeVariantObj.images];
    return Array.from(new Set(combined.filter(Boolean)));
  }, [product.image, activeVariantObj]);

  // Offers Collapse State
  const [showMoreOffers, setShowMoreOffers] = React.useState(false);

  // Accordion State
  const [expandedSections, setExpandedSections] = React.useState<{
    description: boolean;
    specifications: boolean;
    fabric: boolean;
    fit: boolean;
  }>({
    description: true,
    specifications: false,
    fabric: false,
    fit: false,
  });

  // Review Form State
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [newRating, setNewRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [newComment, setNewComment] = React.useState("");

  // Pincode State
  const [pincodeCheckInput, setPincodeCheckInput] = React.useState(pincode || "560001");
  const [pincodeStatusObj, setPincodeStatusObj] = React.useState<
    | { type: "empty" }
    | { type: "checking" }
    | { type: "invalid_format"; message: string }
    | { type: "unavailable"; title: string; subtext: string }
    | { type: "available"; title: string; subtext: string; location?: string }
  >({ type: "empty" });

  React.useEffect(() => {
    if (pincode && pincode !== pincodeCheckInput) {
      setPincodeCheckInput(pincode);
    }
  }, [pincode]);

  // Check category type
  const isFashionCategory = React.useMemo(() => {
    const cat = (product.category || "").toLowerCase();
    return cat.includes("fashion") || cat.includes("clothing") || cat.includes("apparel") || Boolean(product.sizes);
  }, [product]);

  // Price & Offset Calculations
  const variantPriceOffset = activeVariantObj?.priceOffset || 0;
  const sizeObj = SIZES_DATA.find((s) => s.name === selectedSize) || SIZES_DATA[1]!;
  const sizePriceOffset = isFashionCategory ? sizeObj.priceOffset : 0;
  const totalOffset = variantPriceOffset + sizePriceOffset;

  const dynamicPrice = product.price + totalOffset;
  const dynamicMrp = product.mrp + totalOffset;
  const dynamicDiscountPct = Math.round(((dynamicMrp - dynamicPrice) / dynamicMrp) * 100);
  const isSelectedSizeInStock = isFashionCategory ? sizeObj.inStock : true;

  // Handle Color Swatch Selection
  const handleColorSelect = (varObj: ProductVariant) => {
    setSelectedColor(varObj.color);
    if (varObj.images && varObj.images[0]) {
      setActiveImage(varObj.images[0]);
    }
  };

  // Accordion Toggle
  const toggleSection = (key: "description" | "specifications" | "fabric" | "fit") => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pincode Check
  const handlePincodeCheck = async (e?: React.FormEvent, overridePin?: string) => {
    if (e) e.preventDefault();
    const pin = (overridePin || pincodeCheckInput).trim();

    // 1. EMPTY PIN
    if (!pin) {
      setPincodeStatusObj({ type: "empty" });
      return;
    }

    // 2. INVALID FORMAT (< 6 digits, letters, starts with 0)
    if (pin.length !== 6 || !/^\d{6}$/.test(pin) || pin.startsWith("0")) {
      setPincodeStatusObj({
        type: "invalid_format",
        message: "❌ Invalid PIN code. Must be 6 digits.",
      });
      return;
    }

    // 6. LOADING STATE (while checking)
    setPincodeStatusObj({ type: "checking" });

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (!res.ok) {
        setPincodeStatusObj({
          type: "unavailable",
          title: "❌ Delivery Currently Unavailable",
          subtext: "Invalid or non-existent PIN code.",
        });
        return;
      }

      const data = await res.json();
      if (data && data[0] && data[0].Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const locationName = po.District && po.State ? `${po.District}, ${po.State}` : po.Name || "";

        setPincode(pin);
        setPincodeStatusObj({
          type: "available",
          title: "✓ Delivery Available",
          subtext: "Estimated delivery: 2-4 business days",
          location: locationName,
        });
      } else {
        // 3. 6 DIGITS BUT DOES NOT EXIST (e.g. 000000, 999999, 111111)
        setPincodeStatusObj({
          type: "unavailable",
          title: "❌ Delivery Currently Unavailable",
          subtext: "Invalid or non-existent PIN code.",
        });
      }
    } catch (err) {
      console.error("Pincode check error:", err);
      setPincodeStatusObj({
        type: "unavailable",
        title: "❌ Delivery Currently Unavailable",
        subtext: "Could not verify PIN code. Please try again.",
      });
    }
  };

  // ADD TO CART Action
  const handleAddToCart = () => {
    if (!isSelectedSizeInStock) {
      toast.error("Selected size is out of stock!");
      return;
    }
    addToCart({
      ...product,
      price: dynamicPrice,
      mrp: dynamicMrp,
      image: activeImage,
      color: selectedColor || product.color || "",
    });
    toast.success("Added to Cart successfully!", {
      description: `${product.title} ${selectedColor ? `(${selectedColor})` : ""}`,
    });
  };

  // BUY NOW Action
  const handleBuyNow = () => {
    if (!isSelectedSizeInStock) {
      toast.error("Selected size is out of stock!");
      return;
    }
    if (pincodeStatusObj.type === "unavailable" || pincodeStatusObj.type === "invalid_format") {
      toast.error("❌ Delivery Currently Unavailable for this PIN code.");
      return;
    }
    if (!user || !user.isAuth) {
      openAuthModal("Please log in to proceed with Buy Now.");
      return;
    }
    buyNow({
      ...product,
      price: dynamicPrice,
      mrp: dynamicMrp,
      image: activeImage,
      color: selectedColor || product.color || "",
    });
    router.navigate({ to: "/checkout" });
  };

  // Submit Review Form
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.isAuth) {
      openAuthModal("Please log in to post a review.");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Please enter a review comment!");
      return;
    }
    addProductReview(product.id, newRating, newComment, user?.name);
    setNewComment("");
    setShowReviewForm(false);
    toast.success("Thank you for your review!", {
      description: "Your rating & review have been posted dynamically.",
    });
  };

  // Combine Product Reviews & Compute Dynamic Ratings
  const productCustomReviews = React.useMemo(() => {
    return (customReviews && customReviews[product.id]) || [];
  }, [customReviews, product.id]);

  const allReviews = React.useMemo(() => {
    return [...productCustomReviews, ...DEFAULT_REVIEWS];
  }, [productCustomReviews]);

  const { dynamicRating, totalReviewsCount, starBreakdown } = React.useMemo(() => {
    if (allReviews.length === 0) {
      return {
        dynamicRating: product.rating || 4.5,
        totalReviewsCount: 0,
        starBreakdown: [
          { stars: 5, pct: "100%", count: 0 },
          { stars: 4, pct: "0%", count: 0 },
          { stars: 3, pct: "0%", count: 0 },
          { stars: 2, pct: "0%", count: 0 },
          { stars: 1, pct: "0%", count: 0 },
        ],
      };
    }

    const totalStars = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = totalStars / allReviews.length;

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars] || 0;
      const pctNum = Math.round((count / allReviews.length) * 100);
      return { stars, pct: `${pctNum}%`, count };
    });

    return {
      dynamicRating: Number(avg.toFixed(1)),
      totalReviewsCount: allReviews.length,
      starBreakdown: breakdown,
    };
  }, [allReviews, product.rating]);

  const similarProducts = React.useMemo(() => {
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category || p.subCategory === product.subCategory)
      )
      .slice(0, 6);
  }, [product]);

  const saved = wishlist.some((item) => {
    if (!item) return false;
    const itemId = typeof item === "string" ? item : String((item as any)?.id || (item as any)?.product_id || (item as any)?._id || "");
    const prodId = String(product?.id || (product as any)?.product_id || (product as any)?._id);
    return itemId === prodId;
  });

  const emiMonthly = Math.round(dynamicPrice / 6);

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Link
            to="/category/$name"
            params={{ name: product.category }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to {product.category}
          </Link>

          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Product link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border bg-card cursor-pointer"
          >
            <Share2 className="size-3.5" /> Share
          </button>
        </div>

        {/* MAIN PRODUCT LAYOUT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* 1. LEFT SECTION: PRODUCT IMAGES & THUMBNAILS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            {/* Main Product Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
              <img
                src={activeImage}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                }}
                className="size-full object-contain"
              />

              {/* Wishlist Button Overlay */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute right-4 top-4 rounded-full bg-background/90 p-2.5 text-muted-foreground backdrop-blur-xs hover:bg-background hover:text-brand shadow-md transition-all cursor-pointer z-10"
                title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={"size-5 " + (saved ? "fill-pink-600 text-pink-600" : "")} />
              </button>
            </div>

            {/* Thumbnails Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {currentGalleryImages.map((imgUrl, idx) => {
                const isActive = activeImage === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-square size-16 shrink-0 overflow-hidden rounded-xl border p-1 bg-muted cursor-pointer transition-all ${
                      isActive
                        ? "border-brand ring-2 ring-brand shadow-md scale-105"
                        : "border-border hover:border-brand/60"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                      className="size-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. RIGHT SECTION: PRODUCT INFO & VARIANTS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Brand */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-brand">
                {product.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Ratings & Verified Buyers */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 font-black text-white shadow-2xs">
                {dynamicRating.toFixed(1)}
                <Star className="size-3.5 fill-current" />
              </span>

              <span className="text-muted-foreground font-bold">
                {totalReviewsCount} Ratings & Reviews
              </span>

              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Verified Buyers
              </span>
            </div>

            {/* Pricing Section */}
            <div className="rounded-xl bg-muted/30 p-4 border border-border space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  {inr(dynamicPrice)}
                </span>
                <span className="text-base text-muted-foreground line-through font-semibold">
                  {inr(dynamicMrp)}
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ({dynamicDiscountPct}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold">Inclusive of all taxes & GST receipt</p>
            </div>

            {/* Offers Section */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Tag className="size-3.5" />
                  Available Offers & Discounts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMoreOffers(!showMoreOffers)}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {showMoreOffers ? "Show Less" : "View More Offers"}
                  {showMoreOffers ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              </div>

              <ul className="space-y-1.5 text-foreground/90 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-amber-600 shrink-0" />
                  <span><strong>Bank Offer:</strong> 10% Instant Discount on HDFC Credit Card transactions.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-amber-600 shrink-0" />
                  <span><strong>No Cost EMI:</strong> Available starting from <strong>{inr(emiMonthly)}/month</strong>.</span>
                </li>

                {showMoreOffers && (
                  <>
                    <li className="flex items-center gap-1.5 pt-1 border-t border-amber-500/20">
                      <Check className="size-3.5 text-amber-600 shrink-0" />
                      <span><strong>Partner Offer:</strong> Extra ₹200 cashback on Paytm UPI transactions above ₹1,499.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-amber-600 shrink-0" />
                      <span><strong>Special Discount:</strong> Get extra 5% OFF with coupon code <strong>SAVE500</strong>.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* COLOR SELECTION (Rendered ONLY if product has explicit variants - Debug Protection) */}
            {productVariants.length > 0 && (
              <div className="space-y-2.5 rounded-xl border border-border bg-card p-4">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
                  Select Color / Variant: <strong className="text-brand font-black">{selectedColor || productVariants[0]?.color}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {productVariants.map((varObj) => {
                    const isSelected = selectedColor === varObj.color;
                    return (
                      <button
                        key={varObj.color}
                        type="button"
                        onClick={() => handleColorSelect(varObj)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand ring-2 ring-brand/30 bg-brand/10 text-brand scale-105"
                            : "border-border bg-background text-foreground hover:border-brand/40"
                        }`}
                      >
                        {varObj.colorHex && (
                          <span
                            className="size-3.5 rounded-full border border-black/20 shadow-xs flex items-center justify-center shrink-0"
                            style={{ backgroundColor: varObj.colorHex }}
                          >
                            {isSelected && <Check className="size-2 text-white" />}
                          </span>
                        )}
                        <span>{varObj.color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTION (Rendered ONLY for Fashion/Clothing categories with sizes) */}
            {isFashionCategory && product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-foreground uppercase tracking-wider">
                    Select Size: <strong className="text-brand font-black">{selectedSize}</strong>
                  </span>
                  <button type="button" className="text-brand font-bold hover:underline text-[11px] cursor-pointer">
                    Size Chart
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {SIZES_DATA.map((sz) => {
                    const isSelected = selectedSize === sz.name;
                    return (
                      <button
                        key={sz.name}
                        type="button"
                        disabled={!sz.inStock}
                        onClick={() => setSelectedSize(sz.name)}
                        className={`min-w-[50px] py-2.5 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer relative ${
                          !sz.inStock
                            ? "opacity-40 border-dashed border-border bg-muted cursor-not-allowed line-through"
                            : isSelected
                              ? "border-brand bg-brand text-primary-foreground shadow-md ring-2 ring-brand/30 scale-105"
                              : "border-border bg-background text-foreground hover:border-brand/60"
                        }`}
                      >
                        {sz.name}
                        {!sz.inStock && (
                          <span className="block text-[8px] font-normal text-destructive no-underline">Out of Stock</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pincode Availability Checker */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="size-3.5 text-brand" />
                  Delivery & Service Availability
                </label>
                <button
                  type="button"
                  onClick={openAddressModal}
                  className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                >
                  Change Location
                </button>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeCheckInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPincodeCheckInput(val);
                    // VALID PIN -> CHANGE TO INVALID PIN: Immediately wipe previous status
                    setPincodeStatusObj({ type: "empty" });
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pincodeStatusObj.type === "checking"}
                  className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-brand-deep cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {pincodeStatusObj.type === "checking" && <Loader2 className="size-3 animate-spin" />}
                  Check
                </button>
              </form>

              {pincodeStatusObj.type === "checking" && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mt-1 animate-pulse">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Checking delivery availability...</span>
                </div>
              )}

              {pincodeStatusObj.type === "invalid_format" && (
                <div className="mt-1 text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{pincodeStatusObj.message}</span>
                </div>
              )}

              {pincodeStatusObj.type === "unavailable" && (
                <div className="mt-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 space-y-0.5">
                  <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                    <XCircle className="size-4 shrink-0" />
                    <span>{pincodeStatusObj.title}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground pl-5.5">
                    {pincodeStatusObj.subtext}
                  </p>
                </div>
              )}

              {pincodeStatusObj.type === "available" && (
                <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 space-y-0.5">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{pincodeStatusObj.title}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground pl-5.5">
                    {pincodeStatusObj.subtext}
                    {pincodeStatusObj.location ? ` • Delivery to ${pincodeStatusObj.location}` : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons (ADD TO CART & BUY NOW) */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-xl border-2 border-brand bg-card py-3.5 text-xs font-black uppercase tracking-wider text-brand hover:bg-brand/10 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
              >
                <ShoppingCart className="size-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 rounded-xl bg-brand py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:bg-brand-deep transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="size-4 fill-current" />
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* 3. EXPANDABLE PRODUCT DETAILS SECTION */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-foreground border-b border-border pb-3">
            Product Details & Specifications
          </h2>

          <div className="divide-y divide-border space-y-2">
            {/* Description Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleSection("description")}
                className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-foreground uppercase tracking-wider cursor-pointer hover:text-brand transition-colors"
              >
                <span>Description</span>
                {expandedSections.description ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSections.description && (
                <div className="py-2 text-xs text-foreground/90 leading-relaxed space-y-2">
                  <p>
                    Experience unmatched quality and style with the <strong>{product.title}</strong> by <strong>{product.brand}</strong>. Engineered for premium durability and modern lifestyle aesthetics.
                  </p>
                </div>
              )}
            </div>

            {/* Specifications Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleSection("specifications")}
                className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-foreground uppercase tracking-wider cursor-pointer hover:text-brand transition-colors"
              >
                <span>Specifications</span>
                {expandedSections.specifications ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSections.specifications && (
                <div className="py-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-border/60 pb-1.5">
                    <span className="text-muted-foreground font-medium">Brand</span>
                    <span className="font-bold text-foreground">{product.brand}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-1.5">
                    <span className="text-muted-foreground font-medium">Category</span>
                    <span className="font-bold text-foreground">{product.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-1.5">
                    <span className="text-muted-foreground font-medium">Country of Origin</span>
                    <span className="font-bold text-foreground">India</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-1.5">
                    <span className="text-muted-foreground font-medium">Warranty</span>
                    <span className="font-bold text-foreground">1 Year Brand Warranty</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fabric / Material Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleSection("fabric")}
                className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-foreground uppercase tracking-wider cursor-pointer hover:text-brand transition-colors"
              >
                <span>Material / Build Quality</span>
                {expandedSections.fabric ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSections.fabric && (
                <div className="py-2 text-xs text-foreground/90 space-y-1 font-medium">
                  <p>• Premium grade materials crafted for durability</p>
                  <p>• Certified quality assurance & official brand warranty</p>
                </div>
              )}
            </div>

            {/* Fit / Style Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => toggleSection("fit")}
                className="w-full flex items-center justify-between py-2 text-xs font-extrabold text-foreground uppercase tracking-wider cursor-pointer hover:text-brand transition-colors"
              >
                <span>Style & Usage Guide</span>
                {expandedSections.fit ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {expandedSections.fit && (
                <div className="py-2 text-xs text-foreground/90 space-y-1 font-medium">
                  <p>• <strong>Category:</strong> {product.category}</p>
                  <p>• <strong>Finish:</strong> Premium Matte / Glossy Finish</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. RATINGS & REVIEWS SECTION */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-base font-black text-foreground">Ratings & Customer Reviews</h2>
              <p className="text-xs text-muted-foreground">Authentic buyer feedback & rating score</p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer transition-all shadow-sm"
            >
              <MessageSquare className="size-4" /> Write a Review
            </button>
          </div>

          {/* Write a Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="rounded-xl border border-brand/30 bg-brand/5 p-5 space-y-4 animate-in fade-in">
              <h3 className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-1.5">
                <Star className="size-4 text-amber-500 fill-amber-500" /> Share Your Rating & Experience
              </h3>

              {/* 1-5 Star Selector */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-muted-foreground">Select Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`size-6 ${
                          star <= (hoverRating || newRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">
                    {newRating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Review Comment
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details of your experience with this product..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-5 py-2 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Rating Breakdown & Sentiment Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-4 rounded-xl bg-muted/20 border border-border">
            <div className="text-center space-y-1">
              <span className="text-4xl font-black text-foreground">{dynamicRating.toFixed(1)}</span>
              <div className="flex justify-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= Math.round(dynamicRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold">
                Overall Score ({totalReviewsCount} Reviews)
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-xs">
              {starBreakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-8 font-bold text-muted-foreground text-right">{row.stars} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: row.pct }}
                    />
                  </div>
                  <span className="w-10 text-[11px] font-bold text-muted-foreground">{row.pct}</span>
                </div>
              ))}

              {/* Customer Feedback Sentiment Tags */}
              <div className="flex items-center gap-2 pt-2 flex-wrap text-[11px]">
                <span className="font-bold text-muted-foreground">Customers say:</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  👍 High Quality
                </span>
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                  ✨ Excellent Performance
                </span>
                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full border border-purple-500/20">
                  👌 Value for Money
                </span>
              </div>
            </div>
          </div>

          {/* User Reviews List */}
          <div className="space-y-4 divide-y divide-border">
            {allReviews.map((rev) => (
              <div key={rev.id} className="pt-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground">{rev.userName}</span>
                    {rev.verified && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-500" />
                  ))}
                </div>

                <p className="text-foreground/90 font-medium leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products Recommendation Grid */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="border-b-2 border-brand pb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Similar Products You May Like</h2>
            </div>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} badgeLabel="Similar" />
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
