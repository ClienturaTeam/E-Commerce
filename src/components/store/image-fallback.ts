import * as React from "react";

export const DEFAULT_FALLBACK_IMAGES: Record<string, string> = {
  Mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  Mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  Smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  Fashion: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  Clothing: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  Apparel: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  Electronics: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  Laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  Audio: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
  Beauty: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
  Skincare: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
  Makeup: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
  Home: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
  Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
  Lighting: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  Appliances: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
  Refrigerators: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
  Toys: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=600&q=80",
  "Toys & Gifts": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=600&q=80",
  Grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  Food: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  Sports: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  Fitness: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  Books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  Default: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
};

export function getFallbackImage(category?: string): string {
  if (!category || category.toLowerCase().includes("no image") || category === "undefined") {
    return DEFAULT_FALLBACK_IMAGES.Default;
  }
  const clean = category.toLowerCase().trim();

  for (const [key, url] of Object.entries(DEFAULT_FALLBACK_IMAGES)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return url;
    }
  }

  if (clean.includes("men") || clean.includes("women") || clean.includes("dress") || clean.includes("shirt") || clean.includes("jeans")) {
    return DEFAULT_FALLBACK_IMAGES.Fashion;
  }
  if (clean.includes("phone") || clean.includes("mobile") || clean.includes("5g")) {
    return DEFAULT_FALLBACK_IMAGES.Mobiles;
  }
  if (clean.includes("tv") || clean.includes("fridge") || clean.includes("appliance")) {
    return DEFAULT_FALLBACK_IMAGES.Appliances;
  }

  return DEFAULT_FALLBACK_IMAGES.Default;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string
) {
  const target = e.currentTarget;
  const fallback = getFallbackImage(category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
