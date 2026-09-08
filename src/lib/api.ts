// Frontend API Client for Kartly Full-Stack E-Commerce Express Backend

const API_BASE = "http://localhost:5000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kartly_auth_token");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("kartly_auth_token", token);
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kartly_auth_token");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// ==========================================
// AUTH APIs
// ==========================================
export async function registerApi(userData: {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  [key: string]: any;
}) {
  const data = await request<{ success: boolean; token?: string; user?: any; message?: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data.success && data.token) setToken(data.token);
  return data;
}

export async function loginApi(credentials: { emailOrPhone?: string; email?: string; phone?: string; password?: string; role?: string }) {
  const data = await request<{ success: boolean; token?: string; user?: any; message?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data.success && data.token) setToken(data.token);
  return data;
}

export async function firebaseSyncApi(userData: {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  authMethod?: string;
}) {
  const data = await request<{ success: boolean; token?: string; user?: any; message?: string }>("/auth/firebase-sync", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data.success && data.token) setToken(data.token);
  return data;
}

export async function fetchMeApi() {
  return request<{ success: boolean; user?: any }>("/auth/me");
}

// ==========================================
// PRODUCTS APIs
// ==========================================
export async function fetchProductsApi(params?: { category?: string; q?: string; brand?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("category", params.category);
  if (params?.q) searchParams.append("q", params.q);
  if (params?.brand) searchParams.append("brand", params.brand);

  const queryStr = searchParams.toString();
  return request<{ success: boolean; count: number; products: any[] }>(
    `/products${queryStr ? `?${queryStr}` : ""}`
  );
}

export async function fetchProductByIdApi(id: string) {
  return request<{ success: boolean; product?: any; message?: string }>(`/products/${id}`);
}

// ==========================================
// CART APIs
// ==========================================
export async function fetchCartApi() {
  return request<{ success: boolean; cart: any[]; cart_id?: string; user_id?: string }>("/cart");
}

export async function addToCartApi(product: any, qty = 1, variant?: any) {
  return request<{ success: boolean; message: string; cart: any[] }>("/cart/add", {
    method: "POST",
    body: JSON.stringify({ product, product_id: product.id || product.product_id, qty, quantity: qty, variant }),
  });
}

export async function updateCartItemApi(productId: string, qty: number) {
  return request<{ success: boolean; message: string; cart: any[] }>("/cart/update", {
    method: "PUT",
    body: JSON.stringify({ productId, product_id: productId, qty, quantity: qty }),
  });
}

export async function removeCartItemApi(productId: string) {
  return request<{ success: boolean; message: string; cart: any[] }>(`/cart/remove/${productId}`, {
    method: "DELETE",
  });
}

export async function clearCartApi() {
  return request<{ success: boolean; message: string; cart: any[] }>("/cart/clear", {
    method: "DELETE",
  });
}

// ==========================================
// ADDRESSES APIs
// ==========================================
export async function fetchAddressesApi() {
  return request<{ success: boolean; addresses: any[] }>("/addresses");
}

export async function addAddressApi(addressData: any) {
  return request<{ success: boolean; address: any; addresses: any[] }>("/addresses", {
    method: "POST",
    body: JSON.stringify(addressData),
  });
}

export async function deleteAddressApi(id: string) {
  return request<{ success: boolean; addresses: any[] }>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// CHECKOUT APIs
// ==========================================
export async function checkoutApi(data: { items?: any[]; addressId?: string; couponCode?: string; buyNowItem?: any }) {
  return request<{
    success: boolean;
    summary: {
      subtotal: number;
      mrpTotal: number;
      discount: number;
      gstTotal: number;
      platformFee: number;
      deliveryFee: number;
      couponDiscount: number;
      finalAmount: number;
      total_amount?: number;
      gst_amount?: number;
      delivery_fee?: number;
      platform_fee?: number;
      final_amount?: number;
    };
    items: any[];
    address: any;
  }>("/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// ORDERS & TRACKING APIs
// ==========================================
export async function placeOrderApi(orderData: {
  items: any[];
  address: any;
  paymentMethod: string;
  payment_method?: string;
  paymentDetails?: any;
  totals?: any;
  isBuyNow?: boolean;
}) {
  return request<{ success: boolean; message: string; orderId: string; order: any }>("/orders/place", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function fetchOrdersApi() {
  return request<{ success: boolean; count: number; orders: any[] }>("/orders");
}

export async function fetchOrderByIdApi(id: string) {
  return request<{ success: boolean; order: any }>(`/orders/${id}`);
}

export async function fetchOrderStatusApi(id: string) {
  return request<{
    success: boolean;
    orderId: string;
    order_id?: string;
    status: string;
    order_status?: string;
    payment_status: string;
    timeline: any[];
    expectedDelivery: string;
  }>(`/orders/${id}/status`);
}

// ==========================================
// PAYMENT APIs
// ==========================================
export async function initiatePaymentApi(paymentData: {
  orderId: string;
  order_id?: string;
  amount: number;
  paymentMethod?: string;
  upiId?: string;
}) {
  return request<{
    success: boolean;
    message: string;
    transactionId: string;
    orderId: string;
    amount: number;
    status: string;
    redirectUrl: string;
  }>("/payment/initiate", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

export async function verifyPaymentApi(verificationData: {
  orderId: string;
  order_id?: string;
  transactionId: string;
  status?: string;
}) {
  return request<{ success: boolean; message: string; payment_status: string; order: any }>(
    "/payment/verify",
    {
      method: "POST",
      body: JSON.stringify(verificationData),
    }
  );
}

// ==========================================
// WISHLIST APIs
// ==========================================
export async function fetchWishlistApi() {
  return request<{ success: boolean; wishlist: string[] }>("/wishlist");
}

export async function toggleWishlistApi(productId: string, action?: "add" | "remove") {
  return request<{ success: boolean; wishlist: string[] }>("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productId, action }),
  });
}
