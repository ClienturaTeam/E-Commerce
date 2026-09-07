// Discount Filtering & Banner Navigation Utility

export interface DiscountRange {
  min: number;
  max: number;
  label: string;
}

/**
 * Parses discount strings from banners such as:
 * - "UP TO 40% OFF" -> { min: 35, max: 40 }
 * - "40% OFF" -> { min: 35, max: 40 }
 * - "MIN 50% OFF" -> { min: 50, max: 100 }
 * - "FLAT 30% OFF" -> { min: 25, max: 35 }
 */
export function parseDiscountFromBanner(discountStr?: string | number | null): DiscountRange | null {
  if (discountStr === undefined || discountStr === null || discountStr === "") return null;

  const str = String(discountStr).toUpperCase().trim();
  const match = str.match(/\d+/);
  if (!match) return null;

  const val = parseInt(match[0], 10);
  if (isNaN(val) || val <= 0) return null;

  if (str.includes("MIN")) {
    return { min: val, max: 100, label: `Min ${val}% OFF` };
  }

  if (str.includes("FLAT") || str.includes("EXACT")) {
    return { min: Math.max(0, val - 5), max: Math.min(100, val + 5), label: `Flat ${val}% OFF` };
  }

  // Default: "Up to X% OFF" or numeric X -> range [val - 5, val]
  // e.g., 40% OFF -> 35% to 40%
  const minVal = Math.max(5, val - 5);
  return { min: minVal, max: val, label: `Up to ${val}% OFF` };
}

export function calculateDiscountPct(mrp?: number, price?: number): number {
  const m = Number(mrp || 0);
  const p = Number(price || 0);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

export function filterProductsByDiscount<T extends {
  mrp?: number;
  price?: number;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
}>(
  productsList: T[],
  discountQuery?: string | number | null
): T[] {
  const range = parseDiscountFromBanner(discountQuery);
  if (!range) return productsList;

  return productsList.filter((p) => {
    const mrp = Number(p.original_price || p.mrp || p.price || 0);
    const price = Number(p.discounted_price || p.price || 0);
    const discountPct = typeof p.discount_percentage === "number"
      ? p.discount_percentage
      : calculateDiscountPct(mrp, price);

    return discountPct >= range.min && discountPct <= range.max;
  });
}
