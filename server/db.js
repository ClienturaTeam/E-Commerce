import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kartly_ecommerce";

export let isMongoConnected = false;

// 1. USERS SCHEMA
const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: "CUSTOMER" },
    rewardPoints: { type: Number, default: 0 },
    address: { type: String },
  },
  { timestamps: true }
);

// 2. PRODUCTS SCHEMA
const productSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    original_price: { type: Number, required: true },
    discounted_price: { type: Number, required: true },
    discount_percentage: { type: Number, default: 0 },
    brand: { type: String },
    rating: { type: Number, default: 4.5 },
    reviews: { type: String, default: "1,250" },
    image: { type: String },
    subCategory: { type: String },
    fashionCategory: { type: String },
    isBestseller: { type: Boolean, default: false },
    isAssured: { type: Boolean, default: true },
    variants: [
      {
        color: String,
        size: String,
        price: Number,
        stock: Number,
        images: [String],
      },
    ],
  },
  { timestamps: true }
);

// 3. CART SCHEMA
const cartSchema = new mongoose.Schema(
  {
    cart_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    items: [
      {
        product_id: String,
        title: String,
        brand: String,
        image: String,
        price: Number,
        original_price: Number,
        discount_percentage: Number,
        variant: mongoose.Schema.Types.Mixed,
        quantity: { type: Number, default: 1 },
        qty: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

// 4. ORDERS SCHEMA
const orderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    items: { type: Array, required: true },
    total_amount: { type: Number, required: true },
    gst_amount: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },
    platform_fee: { type: Number, default: 10 },
    final_amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.Mixed, required: true },
    payment_method: { type: String, default: "upi" },
    payment_status: { type: String, default: "success" },
    order_status: { type: String, default: "placed" },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 5. ADDRESSES SCHEMA
const addressSchema = new mongoose.Schema(
  {
    address_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address_line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: "home" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
export const AddressModel = mongoose.models.Address || mongoose.model("Address", addressSchema);

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`🍃 Connected to MongoDB database successfully (${MONGODB_URI})`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${err.message}). Operating in hybrid persistent database mode with JSON sync.`);
  }
}
