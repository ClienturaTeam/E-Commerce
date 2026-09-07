import * as React from "react";
import { toast } from "sonner";
import { products, type Product } from "./catalog";
import type {
  Address,
  Coupon,
  Order,
  OrderStatus,
  PaymentDetails,
  UserProfile,
} from "./types";
import {
  fetchCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  fetchAddressesApi,
  addAddressApi,
  deleteAddressApi,
  fetchOrdersApi,
  placeOrderApi,
  fetchWishlistApi,
  toggleWishlistApi,
  fetchMeApi,
} from "@/lib/api";

export type {
  Address,
  Coupon,
  Order,
  OrderStatus,
  PaymentDetails,
  UserProfile,
} from "./types";

export type CartLine = { product: Product; qty: number };

export const DEFAULT_USER: UserProfile = {
  name: "Kartly Demo User",
  email: "demo@kartly.com",
  phone: "9999999999",
  isAuth: true,
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    name: "Kartly Demo User",
    phone: "9999999999",
    house: "Flat 402, Sai Vardhini Heights",
    street: "Road No. 12, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    type: "home",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Kartly Demo User",
    phone: "9999999999",
    house: "Building 5B, Mindspace IT Park",
    street: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    type: "work",
  },
];

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    discountType: "percent",
    value: 10,
    minOrderValue: 499,
    maxDiscount: 1000,
    description: "Get 10% OFF up to ₹1,000 on your order!",
  },
  {
    code: "SAVE500",
    discountType: "fixed",
    value: 500,
    minOrderValue: 1999,
    description: "Flat ₹500 OFF on orders above ₹1,999",
  },
  {
    code: "KARTLY100",
    discountType: "fixed",
    value: 100,
    minOrderValue: 299,
    description: "Flat ₹100 OFF on your cart",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "KARTLY-20260812-00124",
    date: "12 Aug 2026",
    items: [
      {
        product: products[0],
        qty: 1,
        priceAtPurchase: products[0].price,
      },
    ],
    subtotal: 13499,
    discount: 5500,
    deliveryCharge: 0,
    couponDiscount: 500,
    totalAmount: 12999,
    address: INITIAL_ADDRESSES[0],
    payment: {
      method: "upi",
      providerName: "PhonePe",
      upiId: "demo@ybl",
    },
    status: "OUT_FOR_DELIVERY",
    estimatedDelivery: "15 Aug 2026",
    timeline: [
      { status: "PLACED", date: "12 Aug 2026", time: "10:30 AM", completed: true },
      { status: "CONFIRMED", date: "12 Aug 2026", time: "11:00 AM", completed: true },
      { status: "PACKED", date: "12 Aug 2026", time: "04:15 PM", completed: true },
      { status: "SHIPPED", date: "13 Aug 2026", time: "09:00 AM", completed: true },
      { status: "OUT_FOR_DELIVERY", date: "13 Aug 2026", time: "02:30 PM", completed: true },
      { status: "DELIVERED", date: "15 Aug 2026", time: "Pending", completed: false },
    ],
  },
];

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: "home" | "work";
};

export type StoreState = {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  visibleProducts: Product[];
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  cartMrpTotal: number;
  cartSubtotal: number;
  cartGstTotal: number;
  deliveryFee: number;
  addToCart: (p: Product) => void;
  buyNowProduct: CartLine | null;
  setBuyNowProduct: (v: CartLine | null) => void;
  buyNow: (p: Product) => void;
  clearBuyNow: () => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wishlist: string[];
  toggleWishlist: (p: Product) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  
  // User Session & Auth
  user: UserProfile | null;
  signIn: (name: string, email: string, phone: string) => void;
  signOut: () => void;
  authModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;

  // Address Management
  addresses: Address[];
  addAddress: (addr: Omit<Address, "id">) => void;
  editAddress: (id: string, addr: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Orders Management
  orders: Order[];
  placeOrder: (payment: PaymentDetails, addressId: string) => Order | null;
  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  rateProduct: (orderId: string, rating: number, review: string) => void;
  reorderItems: (orderId: string) => void;

  // Coupon Management
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  couponDiscountAmount: number;

  // Pincode
  pincode: string;
  setPincode: (v: string) => void;
  savedAddress: DeliveryAddress | null;
  setSavedAddress: (addr: DeliveryAddress | null) => void;

  // Custom Product Reviews
  customReviews: Record<string, any[]>;
  addProductReview: (productId: string, rating: number, comment: string, userName?: string) => void;
};

const StoreContext = React.createContext<StoreState | null>(null);

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== undefined && parsed !== null ? (parsed as T) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return fallback;
  }
};

const normalizeProductLine = (item: any): CartLine | null => {
  if (!item) return null;
  if (item.product && item.product.id) {
    return {
      product: {
        id: String(item.product.id),
        title: item.product.title || item.product.name || "Product",
        price: Number(item.product.price) || 0,
        mrp: Number(item.product.mrp || item.product.price) || 0,
        brand: item.product.brand || "Brand",
        image: item.product.image || "https://picsum.photos/300?fallback",
        category: item.product.category || "general",
        rating: Number(item.product.rating) || 4.5,
        reviews: Number(item.product.reviews) || 10,
        ...item.product,
      },
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1,
    };
  }
  if (item.id) {
    return {
      product: {
        id: String(item.id),
        title: item.title || item.name || "Product",
        price: Number(item.price) || 0,
        mrp: Number(item.mrp || item.price) || 0,
        brand: item.brand || "Brand",
        image: item.image || "https://picsum.photos/300?fallback",
        category: item.category || "general",
        rating: Number(item.rating) || 4.5,
        reviews: Number(item.reviews) || 10,
        ...item,
      },
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1,
    };
  }
  return null;
};

const normalizeOrder = (o: any): Order | null => {
  if (!o) return null;
  const orderId = String(o.id || o.order_id || `KARTLY-ORD-${Date.now()}`);
  const rawStatus = (o.status || o.order_status || "PLACED").toString().toUpperCase();
  const status: OrderStatus = (
    ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(rawStatus)
      ? rawStatus
      : "PLACED"
  ) as OrderStatus;

  const totalAmount = Number(o.totalAmount || o.final_amount || o.finalAmount || o.total_amount || 0);

  const rawItems = Array.isArray(o.items) ? o.items : [];
  const normalizedItems = rawItems.map((item: any) => {
    const prod = item.product || item;
    return {
      product: {
        id: String(prod.id || prod.product_id || "prod-unknown"),
        title: prod.title || prod.name || "Product",
        price: Number(prod.price || prod.base_price || 0),
        mrp: Number(prod.mrp || prod.price || prod.base_price || 0),
        brand: prod.brand || "Kartly",
        image: prod.image || "https://picsum.photos/300",
        category: prod.category || "general",
        rating: Number(prod.rating) || 4.5,
        reviews: Number(prod.reviews) || 10,
        ...prod,
      },
      qty: Number(item.qty || item.quantity || 1),
      priceAtPurchase: Number(item.priceAtPurchase || item.price || prod.price || 0),
    };
  });

  return {
    ...o,
    id: orderId,
    order_id: orderId,
    date: o.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    created_at: o.created_at || new Date().toISOString(),
    items: normalizedItems,
    subtotal: Number(o.subtotal || o.total_amount || totalAmount),
    discount: Number(o.discount || 0),
    deliveryCharge: Number(o.deliveryCharge || o.delivery_fee || 0),
    couponDiscount: Number(o.couponDiscount || o.coupon_discount || 0),
    totalAmount,
    final_amount: totalAmount,
    address: o.address || {
      id: "addr-1",
      name: o.user_name || "Customer",
      phone: "9999999999",
      house: "Flat 402",
      street: "Main Street",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
      type: "home",
    },
    payment: o.payment || {
      method: o.payment_method || "upi",
      providerName: "Payment Gateway",
      status: o.payment_status || "SUCCESS",
    },
    status,
    order_status: status,
    payment_status: o.payment_status || "SUCCESS",
    estimatedDelivery: o.estimatedDelivery || o.expectedDelivery || "3-5 Days",
    timeline: Array.isArray(o.timeline) ? o.timeline : [],
  };
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("For You");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [buyNowProduct, setBuyNowProduct] = React.useState<CartLine | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<string[]>([]);
  const [user, setUser] = React.useState<UserProfile | null>(DEFAULT_USER);
  const [addresses, setAddresses] = React.useState<Address[]>(INITIAL_ADDRESSES);
  const [orders, setOrders] = React.useState<Order[]>(INITIAL_ORDERS);
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [pincode, setPincode] = React.useState("560001");
  const [savedAddress, setSavedAddress] = React.useState<DeliveryAddress | null>(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authModalReason, setAuthModalReason] = React.useState("");

  React.useEffect(() => {
    const data1 = safeRead<any[]>("cartItems", []);
    const data2 = safeRead<any[]>("antigravity_cart", []);
    const data3 = safeRead<any[]>("kartly.cart", []);
    const rawCart = Array.isArray(data1) && data1.length > 0 ? data1 : Array.isArray(data2) && data2.length > 0 ? data2 : Array.isArray(data3) ? data3 : [];
    
    const normalizedCart: CartLine[] = rawCart
      .map(normalizeProductLine)
      .filter((item): item is CartLine => Boolean(item));

    setCart(normalizedCart);

    const savedBuyNow = safeRead<any>("buyNowProduct", null);
    if (savedBuyNow) {
      const norm = normalizeProductLine(savedBuyNow);
      if (norm) setBuyNowProduct(norm);
    }

    setWishlist(safeRead<string[]>("antigravity_wishlist", safeRead<string[]>("kartly.wishlist", [])));
    setRecentlyViewed(safeRead<string[]>("antigravity_recent", safeRead<string[]>("kartly.recentlyViewed", [])));
    setUser(safeRead<UserProfile | null>("antigravity_user", safeRead<UserProfile | null>("kartly.user", DEFAULT_USER)));
    setPincode(safeRead<string>("antigravity_pincode", safeRead<string>("kartly.pincode", "560001")));
    setSavedAddress(safeRead<DeliveryAddress | null>("antigravity_address", null));
    setAddresses(safeRead<Address[]>("kartly.addresses", INITIAL_ADDRESSES));
    const rawOrders = safeRead<any[]>("kartly.orders", INITIAL_ORDERS);
    setOrders(Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder).filter((o): o is Order => Boolean(o)) : INITIAL_ORDERS);
    setCustomReviews(safeRead<Record<string, any[]>>("kartly.custom_reviews", {}));

    // Async sync with Express Backend APIs
    async function syncBackendData() {
      try {
        const cartRes = await fetchCartApi();
        if (cartRes?.success && Array.isArray(cartRes.cart) && cartRes.cart.length > 0) {
          const apiCart = cartRes.cart.map(normalizeProductLine).filter((i): i is CartLine => Boolean(i));
          if (apiCart.length > 0) setCart(apiCart);
        }
      } catch (err) {}

      try {
        const orderRes = await fetchOrdersApi();
        if (orderRes?.success && Array.isArray(orderRes.orders) && orderRes.orders.length > 0) {
          const apiOrders = orderRes.orders.map(normalizeOrder).filter((o): o is Order => Boolean(o));
          if (apiOrders.length > 0) setOrders(apiOrders);
        }
      } catch (err) {}

      try {
        const addrRes = await fetchAddressesApi();
        if (addrRes?.success && Array.isArray(addrRes.addresses) && addrRes.addresses.length > 0) {
          setAddresses(addrRes.addresses);
        }
      } catch (err) {}

      try {
        const wishRes = await fetchWishlistApi();
        if (wishRes?.success && Array.isArray(wishRes.wishlist)) {
          setWishlist(wishRes.wishlist);
        }
      } catch (err) {}
    }

    syncBackendData();
  }, []);

  const [customReviews, setCustomReviews] = React.useState<Record<string, any[]>>({});

  const addProductReview = React.useCallback((productId: string, rating: number, comment: string, userName?: string) => {
    if (!productId || !comment.trim()) return;
    const author = userName || user?.name || "Verified Customer";
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: author,
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      verified: true,
    };

    setCustomReviews((prev) => {
      const existing = prev[productId] || [];
      const updated = { ...prev, [productId]: [newRev, ...existing] };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("kartly.custom_reviews", JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });

    toast.success("Review submitted successfully!", { description: "Thank you for your feedback!" });
  }, [user]);

  // Save to localStorage
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cartItems", JSON.stringify(cart));
        window.localStorage.setItem("antigravity_cart", JSON.stringify(cart));
        window.localStorage.setItem("kartly.cart", JSON.stringify(cart));
      }
    } catch (e) {
      console.error("Failed to save cartItems to localStorage", e);
    }
  }, [cart]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (buyNowProduct) {
          window.localStorage.setItem("buyNowProduct", JSON.stringify(buyNowProduct));
        } else {
          window.localStorage.removeItem("buyNowProduct");
        }
      }
    } catch (e) {
      console.error("Failed to save buyNowProduct to localStorage", e);
    }
  }, [buyNowProduct]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("antigravity_wishlist", JSON.stringify(wishlist));
        window.localStorage.setItem("kartly.wishlist", JSON.stringify(wishlist));
      }
    } catch {}
  }, [wishlist]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("antigravity_recent", JSON.stringify(recentlyViewed));
        window.localStorage.setItem("kartly.recentlyViewed", JSON.stringify(recentlyViewed));
      }
    } catch {}
  }, [recentlyViewed]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("antigravity_user", JSON.stringify(user));
        window.localStorage.setItem("kartly.user", JSON.stringify(user));
      }
    } catch {}
  }, [user]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("antigravity_pincode", JSON.stringify(pincode));
        window.localStorage.setItem("kartly.pincode", JSON.stringify(pincode));
      }
    } catch {}
  }, [pincode]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && savedAddress) {
        window.localStorage.setItem("antigravity_address", JSON.stringify(savedAddress));
      }
    } catch {}
  }, [savedAddress]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kartly.addresses", JSON.stringify(addresses));
      }
    } catch {}
  }, [addresses]);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kartly.orders", JSON.stringify(orders));
      }
    } catch {}
  }, [orders]);

  const openAuthModal = React.useCallback((reason = "Please log in to continue.") => {
    setAuthModalReason(reason);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const signIn = React.useCallback((name: string, email: string, phone: string) => {
    const newUser: UserProfile = { name, email, phone, isAuth: true };
    setUser(newUser);
    setAuthModalOpen(false);
    toast.success("Signed in successfully", { description: `Welcome back, ${name}!` });
  }, []);

  const signOut = React.useCallback(() => {
    setUser(null);
    toast("Signed out", { description: "You have logged out of Kartly." });
  }, []);

  const visibleProducts = React.useMemo(() => {
    let result = products;
    if (category !== "For You") {
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.subCategory?.toLowerCase() === category.toLowerCase() ||
          p.fashionCategory?.toLowerCase() === category.toLowerCase()
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [category, query]);

  const addToCart = React.useCallback((p: Product) => {
    if (!p || !p.id) return;
    setCart((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const found = current.find((l) => l && l.product && l.product.id === p.id);
      let updated: CartLine[];
      if (found) {
        updated = current.map((l) =>
          l && l.product && l.product.id === p.id ? { ...l, qty: (l.qty || 1) + 1 } : l
        );
      } else {
        updated = [...current, { product: p, qty: 1 }];
      }
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cartItems", JSON.stringify(updated));
          window.localStorage.setItem("antigravity_cart", JSON.stringify(updated));
          window.localStorage.setItem("kartly.cart", JSON.stringify(updated));
        }
      } catch (e) {
        console.error("Error saving cartItems to localStorage", e);
      }
      return updated;
    });

    addToCartApi(p, 1).catch((err) => console.error("addToCartApi error:", err));
    toast.success("Added to cart", { description: p.title || (p as any).name });
  }, []);

  const buyNow = React.useCallback((p: Product) => {
    if (!p || !p.id) return;
    const line = { product: p, qty: 1 };
    setBuyNowProduct(line);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("buyNowProduct", JSON.stringify(line));
      }
    } catch (e) {
      console.error("Error saving buyNowProduct to localStorage", e);
    }
    toast.success("Proceeding to Buy Now", { description: p.title || (p as any).name });
  }, []);

  const clearBuyNow = React.useCallback(() => {
    setBuyNowProduct(null);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("buyNowProduct");
      }
    } catch (e) {
      console.error("Error removing buyNowProduct from localStorage", e);
    }
  }, []);

  const setQty = React.useCallback((id: string, qty: number) => {
    setCart((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return qty <= 0
        ? current.filter((l) => l && l.product && l.product.id !== id)
        : current.map((l) => (l && l.product && l.product.id === id ? { ...l, qty } : l));
    });
    updateCartItemApi(id, qty).catch((err) => console.error("updateCartItemApi error:", err));
  }, []);

  const removeFromCart = React.useCallback((id: string) => {
    setCart((prev) => (Array.isArray(prev) ? prev.filter((l) => l && l.product && l.product.id !== id) : []));
    removeCartItemApi(id).catch((err) => console.error("removeCartItemApi error:", err));
    toast("Removed from cart");
  }, []);

  const clearCart = React.useCallback(() => {
    setCart([]);
    clearCartApi().catch((err) => console.error("clearCartApi error:", err));
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("cartItems");
        window.localStorage.removeItem("antigravity_cart");
        window.localStorage.removeItem("kartly.cart");
      }
    } catch (e) {
      console.error("Error clearing cartItems from localStorage", e);
    }
  }, []);

  const toggleWishlist = React.useCallback((p: Product) => {
    if (!p || !p.id) return;
    setWishlist((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const has = current.includes(p.id);
      toast(has ? "Removed from wishlist" : "Saved to wishlist", { description: p.title });
      return has ? current.filter((id) => id !== p.id) : [...current, p.id];
    });
    toggleWishlistApi(p.id).catch((err) => console.error("toggleWishlistApi error:", err));
  }, []);

  const addRecentlyViewed = React.useCallback((id: string) => {
    if (!id) return;
    setRecentlyViewed((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const clean = current.filter((i) => i !== id);
      return [id, ...clean].slice(0, 12);
    });
  }, []);

  // Address Actions
  const addAddress = React.useCallback((newAddr: Omit<Address, "id">) => {
    const id = `addr-${Date.now()}`;
    const fullAddr: Address = { ...newAddr, id };
    setAddresses((prev) => {
      if ((newAddr as any).isDefault) {
        return prev.map((a) => ({ ...a, isDefault: false })).concat(fullAddr);
      }
      return [...prev, fullAddr];
    });
    toast.success("Address added");
  }, []);

  const editAddress = React.useCallback((id: string, updatedFields: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    toast.success("Address updated");
  }, []);

  const deleteAddress = React.useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast("Address removed");
  }, []);

  const setDefaultAddress = React.useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast.success("Default address updated");
  }, []);

  const safeCart = Array.isArray(cart) ? cart.filter((l) => l && l.product) : [];
  const cartCount = safeCart.reduce((n, l) => n + (l.qty || 1), 0);
  const cartSubtotal = safeCart.reduce((n, l) => n + (l.qty || 1) * (l.product.price || 0), 0);
  const cartMrpTotal = safeCart.reduce((n, l) => n + (l.qty || 1) * (l.product.mrp || 0), 0);
  const cartGstTotal = safeCart.reduce(
    (n, l) => n + Math.round(((l.product.price || 0) * (l.qty || 1) * ((l.product.price || 0) <= 1000 ? 5 : 12)) / 100),
    0
  );
  const deliveryFee = cartSubtotal > 0 && cartSubtotal < 499 ? 40 : 0;
  const cartTotal = cartSubtotal + cartGstTotal + deliveryFee;

  const couponDiscountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartTotal < appliedCoupon.minOrderValue) return 0;
    if (appliedCoupon.discountType === "percent") {
      const calculated = (cartTotal * appliedCoupon.value) / 100;
      return appliedCoupon.maxDiscount
        ? Math.min(calculated, appliedCoupon.maxDiscount)
        : calculated;
    }
    return appliedCoupon.value;
  }, [appliedCoupon, cartTotal]);

  const applyCoupon = React.useCallback(
    (code: string) => {
      const found = AVAILABLE_COUPONS.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase()
      );
      if (!found) {
        toast.error("Invalid coupon code");
        return false;
      }
      if (cartTotal < found.minOrderValue) {
        toast.error(`Minimum order value for ${found.code} is ₹${found.minOrderValue}`);
        return false;
      }
      setAppliedCoupon(found);
      toast.success(`Coupon ${found.code} applied!`, { description: found.description });
      return true;
    },
    [cartTotal]
  );

  const removeCoupon = React.useCallback(() => {
    setAppliedCoupon(null);
    toast("Coupon removed");
  }, []);

  // Place Order Action
  const placeOrder = React.useCallback(
    (payment: PaymentDetails, addressId: string): Order | null => {
      if (!user || !user.isAuth) {
        openAuthModal("Please log in to complete your purchase.");
        return null;
      }

      const orderItems: CartLine[] =
        buyNowProduct && buyNowProduct.product && buyNowProduct.product.id
          ? [buyNowProduct]
          : safeCart;

      if (orderItems.length === 0) {
        toast.error("No items found to place order!");
        return null;
      }

      const selectedAddress =
        addresses.find((a) => a.id === addressId) || addresses[0] || INITIAL_ADDRESSES[0]!;

      const now = new Date();
      const orderDate = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const deliveryDateObj = new Date();
      deliveryDateObj.setDate(deliveryDateObj.getDate() + 3);
      const estDelivery = deliveryDateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `KARTLY-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${randomNum}`;

      const itemsSubtotal = orderItems.reduce((n, l) => n + (l.qty || 1) * (l.product.price || 0), 0);
      const itemsMrpTotal = orderItems.reduce((n, l) => n + (l.qty || 1) * (l.product.mrp || 0), 0);
      const itemsDeliveryCharge = itemsSubtotal > 500 ? 0 : 40;
      const finalAmount = Math.max(0, itemsSubtotal - couponDiscountAmount + itemsDeliveryCharge);

      const newOrder: Order = {
        id: orderId,
        date: orderDate,
        items: orderItems.map((l) => ({
          product: l.product,
          qty: l.qty || 1,
          priceAtPurchase: l.product.price,
        })),
        subtotal: itemsSubtotal,
        discount: itemsMrpTotal - itemsSubtotal,
        deliveryCharge: itemsDeliveryCharge,
        couponDiscount: couponDiscountAmount,
        totalAmount: finalAmount,
        address: selectedAddress,
        payment,
        status: "PLACED",
        estimatedDelivery: estDelivery,
        timeline: [
          { status: "PLACED", date: orderDate, time: "Just now", completed: true },
          { status: "CONFIRMED", date: orderDate, time: "Pending", completed: false },
          { status: "PACKED", date: orderDate, time: "Pending", completed: false },
          { status: "SHIPPED", date: estDelivery, time: "Pending", completed: false },
          { status: "OUT_FOR_DELIVERY", date: estDelivery, time: "Pending", completed: false },
          { status: "DELIVERED", date: estDelivery, time: "Pending", completed: false },
        ],
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Persist last created order ID for payment & success page hydration
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("kartly.lastOrderId", orderId);
        }
      } catch (e) {
        console.error("Error setting lastOrderId in localStorage", e);
      }

      // Save order to Express REST API Backend DB
      placeOrderApi({
        items: orderItems,
        address: selectedAddress,
        paymentMethod: payment.method || "upi",
        paymentDetails: payment,
        totals: {
          subtotal: itemsSubtotal,
          mrpTotal: itemsMrpTotal,
          discount: itemsMrpTotal - itemsSubtotal,
          deliveryFee: itemsDeliveryCharge,
          couponDiscount: couponDiscountAmount,
          finalAmount,
        },
      }).catch((err) => console.error("placeOrderApi error:", err));

      if (buyNowProduct) {
        clearBuyNow();
      } else {
        clearCart();
      }

      setAppliedCoupon(null);
      toast.success("Order created successfully!", { description: `Order ID: ${orderId}` });

      // Trigger Real-Time Order Status Updates Progress Simulation (5s, 10s, 15s, 20s, 25s)
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && o.status === "PLACED"
              ? {
                  ...o,
                  status: "CONFIRMED",
                  timeline: o.timeline.map((t: any) =>
                    t.status === "PLACED" || t.status === "CONFIRMED"
                      ? { ...t, completed: true, time: t.completed ? t.time : "Just now" }
                      : t
                  ),
                }
              : o
          )
        );
        toast.success("Order Confirmed! ✅", {
          description: `Seller accepted your order #${orderId}`,
        });
      }, 5000);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && (o.status === "CONFIRMED" || o.status === "PLACED")
              ? {
                  ...o,
                  status: "PACKED",
                  timeline: o.timeline.map((t: any) =>
                    t.status === "PLACED" || t.status === "CONFIRMED" || t.status === "PACKED"
                      ? { ...t, completed: true, time: t.completed ? t.time : "Just now" }
                      : t
                  ),
                }
              : o
          )
        );
        toast.success("Order Packed & Sealed! 📦", {
          description: `Items for #${orderId} packed at fulfillment center.`,
        });
      }, 10000);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && (o.status === "PACKED" || o.status === "CONFIRMED" || o.status === "PLACED")
              ? {
                  ...o,
                  status: "SHIPPED",
                  timeline: o.timeline.map((t: any) =>
                    t.status === "SHIPPED"
                      ? { ...t, completed: true, time: "In Transit (Express)" }
                      : t.completed ? t : { ...t, completed: true }
                  ),
                }
              : o
          )
        );
        toast.info("Order Shipped in Transit! 🚚", {
          description: `Express courier tracking active for #${orderId}`,
        });
      }, 15000);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && (o.status === "SHIPPED" || o.status === "PACKED")
              ? {
                  ...o,
                  status: "OUT_FOR_DELIVERY",
                  timeline: o.timeline.map((t: any) =>
                    t.status === "OUT_FOR_DELIVERY"
                      ? { ...t, completed: true, time: "Arriving Today" }
                      : t.completed ? t : { ...t, completed: true }
                  ),
                }
              : o
          )
        );
        toast.info("Out for Delivery! 🛵", {
          description: `Delivery agent is arriving soon for #${orderId}`,
        });
      }, 20000);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && (o.status === "OUT_FOR_DELIVERY" || o.status === "SHIPPED")
              ? {
                  ...o,
                  status: "DELIVERED",
                  timeline: o.timeline.map((t: any) => ({ ...t, completed: true })),
                }
              : o
          )
        );
        toast.success("Order Delivered Successfully! 🎉", {
          description: `Package for #${orderId} handed to recipient.`,
        });
      }, 25000);

      return newOrder;
    },
    [user, buyNowProduct, safeCart, addresses, couponDiscountAmount, openAuthModal, clearBuyNow, clearCart]
  );

  const cancelOrder = React.useCallback((orderId: string, reason: string) => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedTimeline = o.timeline.map((t) =>
          t.status === "CANCELLED" ? { ...t, completed: true, time: "Just now" } : t
        );
        return {
          ...o,
          status: "CANCELLED" as OrderStatus,
          cancellationReason: reason,
          cancelledAt: today,
          refundStatus: o.payment.method !== "cod" ? ("Refund Initiated" as const) : ("Pending" as const),
          refundAmount: o.payment.method !== "cod" ? o.totalAmount : 0,
          timeline: updatedTimeline,
        };
      })
    );
    toast.success("Order cancelled", { description: `Order ${orderId} has been cancelled.` });
  }, []);

  const requestReturn = React.useCallback((orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "RETURN_REQUESTED" as OrderStatus,
              returnReason: reason,
              refundStatus: "Pending",
            }
          : o
      )
    );
    toast.success("Return requested", { description: "We will arrange pickup within 48 hours." });
  }, []);

  const updateOrderStatus = React.useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        
        const statusOrder: OrderStatus[] = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
        const targetIdx = statusOrder.indexOf(newStatus);

        const updatedTimeline = o.timeline.map((t: any) => {
          const idx = statusOrder.indexOf(t.status);
          if (idx !== -1 && targetIdx !== -1) {
            return { ...t, completed: idx <= targetIdx };
          }
          return t;
        });

        return { ...o, status: newStatus, timeline: updatedTimeline };
      })
    );
    toast.info(`Order ${orderId} status updated to ${newStatus}`);
  }, []);

  const rateProduct = React.useCallback((orderId: string, rating: number, review: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, userRating: rating, userReview: review } : o))
    );
    toast.success("Thank you for your rating & review!");
  }, []);

  const reorderItems = React.useCallback((orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    targetOrder.items.forEach((item: any) => {
      addToCart(item.product);
    });
    setCartOpen(true);
    toast.success("Items reordered & added to cart!");
  }, [orders, addToCart, setCartOpen]);

  const value: StoreState = React.useMemo(
    () => ({
      query,
      setQuery,
      category,
      setCategory,
      visibleProducts,
      cart: safeCart,
      cartCount,
      cartTotal,
      cartMrpTotal,
      cartSubtotal,
      cartGstTotal,
      deliveryFee,
      addToCart,
      buyNowProduct,
      setBuyNowProduct,
      buyNow,
      clearBuyNow,
      setQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      recentlyViewed,
      addRecentlyViewed,
      user,
      signIn,
      signOut,
      authModalOpen,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      addresses,
      addAddress,
      editAddress,
      deleteAddress,
      setDefaultAddress,
      orders,
      placeOrder,
      cancelOrder,
      requestReturn,
      updateOrderStatus,
      rateProduct,
      reorderItems,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      couponDiscountAmount,
      pincode,
      setPincode,
      savedAddress,
      setSavedAddress,
      customReviews,
      addProductReview,
    }),
    [
      query,
      setQuery,
      category,
      setCategory,
      visibleProducts,
      safeCart,
      cartCount,
      cartTotal,
      cartMrpTotal,
      cartSubtotal,
      cartGstTotal,
      deliveryFee,
      addToCart,
      buyNowProduct,
      setBuyNowProduct,
      buyNow,
      clearBuyNow,
      setQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      recentlyViewed,
      addRecentlyViewed,
      user,
      signIn,
      signOut,
      authModalOpen,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      addresses,
      addAddress,
      editAddress,
      deleteAddress,
      setDefaultAddress,
      orders,
      placeOrder,
      cancelOrder,
      requestReturn,
      updateOrderStatus,
      rateProduct,
      reorderItems,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      couponDiscountAmount,
      pincode,
      setPincode,
      savedAddress,
      setSavedAddress,
      customReviews,
      addProductReview,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) {
    return {
      query: "",
      setQuery: () => {},
      category: "For You",
      setCategory: () => {},
      visibleProducts: products,
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      cartMrpTotal: 0,
      cartSubtotal: 0,
      cartGstTotal: 0,
      deliveryFee: 0,
      addToCart: () => {},
      buyNowProduct: null,
      setBuyNowProduct: () => {},
      buyNow: () => {},
      clearBuyNow: () => {},
      setQty: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      cartOpen: false,
      setCartOpen: () => {},
      wishlist: [],
      toggleWishlist: () => {},
      recentlyViewed: [],
      addRecentlyViewed: () => {},
      user: DEFAULT_USER,
      signIn: () => {},
      signOut: () => {},
      authModalOpen: false,
      authModalReason: "",
      openAuthModal: () => {},
      closeAuthModal: () => {},
      addresses: INITIAL_ADDRESSES,
      addAddress: () => {},
      editAddress: () => {},
      deleteAddress: () => {},
      setDefaultAddress: () => {},
      orders: INITIAL_ORDERS,
      placeOrder: () => null,
      cancelOrder: () => {},
      requestReturn: () => {},
      updateOrderStatus: () => {},
      rateProduct: () => {},
      reorderItems: () => {},
      appliedCoupon: null,
      applyCoupon: () => false,
      removeCoupon: () => {},
      couponDiscountAmount: 0,
      pincode: "560001",
      setPincode: () => {},
      savedAddress: null,
      setSavedAddress: () => {},
      customReviews: {},
      addProductReview: () => {},
    };
  }
  return ctx;
}

export function getProductGstRate(product?: any): number {
  if (!product) return 12;
  let categoryStr = "";
  if (typeof product === "string") {
    categoryStr = product;
  } else if (typeof product === "object") {
    categoryStr = `${product.category || ""} ${product.subCategory || ""} ${product.title || ""}`;
  } else if (typeof product === "number") {
    return product <= 1000 ? 5 : 12;
  }
  const cat = categoryStr.toLowerCase();

  if (
    cat.includes("grocery") ||
    cat.includes("food") ||
    cat.includes("supermarket") ||
    cat.includes("essential") ||
    cat.includes("organic") ||
    cat.includes("fruit") ||
    cat.includes("vegetable")
  ) {
    return 5;
  }
  if (
    cat.includes("fashion") ||
    cat.includes("clothing") ||
    cat.includes("apparel") ||
    cat.includes("shirt") ||
    cat.includes("jeans") ||
    cat.includes("dress") ||
    cat.includes("men") ||
    cat.includes("women") ||
    cat.includes("kids") ||
    cat.includes("shoe") ||
    cat.includes("footwear")
  ) {
    return 12;
  }
  if (
    cat.includes("electronics") ||
    cat.includes("mobile") ||
    cat.includes("phone") ||
    cat.includes("appliance") ||
    cat.includes("laptop") ||
    cat.includes("tv") ||
    cat.includes("gadget") ||
    cat.includes("audio") ||
    cat.includes("camera")
  ) {
    return 18;
  }
  return 12;
}

export function getGstBreakdown(price: number, qty: number, product?: any) {
  const safePrice = price || 0;
  const safeQty = qty || 1;
  const rate = getProductGstRate(product || safePrice);
  const gstAmount = Math.round((safePrice * safeQty * rate) / 100);
  const itemPrice = safePrice * safeQty;
  const totalPrice = itemPrice + gstAmount;
  return { rate, gstAmount, itemPrice, totalPrice };
}

export function getGstRate(priceOrProduct: any) {
  return getProductGstRate(priceOrProduct);
}


