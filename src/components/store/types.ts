import type { Product } from "./catalog";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isAuth: boolean;
}

export interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault?: boolean;
}

export type PaymentMethodType = "upi" | "card" | "netbanking" | "emi" | "cod";

export interface PaymentDetails {
  method: PaymentMethodType;
  providerName?: string; // e.g. PhonePe, GPay, HDFC, Visa
  upiId?: string;
  cardNumberMasked?: string;
  emiTenureMonths?: number;
  emiMonthlyAmount?: number;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUND_INITIATED"
  | "REFUNDED";

export interface TimelineEvent {
  status: OrderStatus;
  date: string;
  time: string;
  completed: boolean;
  location?: string;
}

export interface OrderItem {
  product: Product;
  qty: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string; // e.g. KARTLY-20260812-00124
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  couponDiscount: number;
  totalAmount: number;
  address: Address;
  payment: PaymentDetails;
  status: OrderStatus;
  estimatedDelivery: string;
  timeline: TimelineEvent[];
  cancellationReason?: string;
  cancelledAt?: string;
  returnReason?: string;
  refundStatus?: "Pending" | "Refund Initiated" | "Refund Completed";
  refundAmount?: number;
  userRating?: number;
  userReview?: string;
}

export interface Coupon {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
}
