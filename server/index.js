import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INITIAL_PRODUCTS } from "./productsData.js";
import {
  connectDB,
  isMongoConnected,
  UserModel,
  ProductModel,
  CartModel,
  OrderModel,
  AddressModel,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "kartly-super-secret-key-2026";

app.use(cors());
app.use(express.json());

// Enable dual route handling (support both /api/xxx and /xxx endpoints)
app.use((req, res, next) => {
  if (req.url !== "/health" && !req.url.startsWith("/api/")) {
    req.originalUrl = req.url;
    req.url = "/api" + req.url;
  }
  next();
});

// Database Schemas & Data Store
const defaultDb = {
  users: [
    {
      id: "usr-demo",
      user_id: "usr-demo",
      name: "Kartly Demo User",
      email: "demo@kartly.com",
      phone: "9999999999",
      password: "password123",
      role: "CUSTOMER",
      rewardPoints: 250,
    },
    {
      id: "usr-customer",
      user_id: "usr-customer",
      name: "Rahul Sharma",
      email: "customer@kartly.com",
      phone: "9876543210",
      password: "password123",
      role: "CUSTOMER",
      address: "Flat 402, Sunshine Apartments, Indiranagar, Bengaluru - 560001",
    },
    {
      id: "usr-seller",
      user_id: "usr-seller",
      name: "Apex Retailers Pvt Ltd",
      email: "seller@kartly.com",
      phone: "9876543211",
      password: "password123",
      role: "SELLER",
      shopName: "Apex Digital Hub",
    },
    {
      id: "usr-admin",
      user_id: "usr-admin",
      name: "System Admin",
      email: "admin@kartly.com",
      phone: "9876543212",
      password: "password123",
      role: "ADMIN",
    },
  ],
  products: INITIAL_PRODUCTS.map((p) => ({
    ...p,
    product_id: p.id,
    name: p.title,
    base_price: p.price,
    description: p.description || `${p.title} - High quality product from ${p.brand}.`,
    variants: p.variants || [
      { color: "Default", size: "Standard", price: p.price, stock: 50, images: [p.image] },
    ],
  })),
  cart: [],
  wishlist: [],
  addresses: [
    {
      id: "addr-1",
      address_id: "addr-1",
      userId: "usr-demo",
      user_id: "usr-demo",
      name: "Kartly Demo User",
      phone: "9999999999",
      house: "Flat 402, Sai Vardhini Heights",
      street: "Road No. 12, Banjara Hills",
      address_line: "Flat 402, Sai Vardhini Heights, Road No. 12, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
      type: "home",
      isDefault: true,
    },
    {
      id: "addr-2",
      address_id: "addr-2",
      userId: "usr-demo",
      user_id: "usr-demo",
      name: "Kartly Demo User",
      phone: "9999999999",
      house: "Building 5B, Mindspace IT Park",
      street: "HITEC City",
      address_line: "Building 5B, Mindspace IT Park, HITEC City",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      type: "work",
      isDefault: false,
    },
  ],
  orders: [
    {
      id: "KARTLY-20260812-00124",
      order_id: "KARTLY-20260812-00124",
      userId: "usr-demo",
      user_id: "usr-demo",
      date: "12 Aug 2026",
      created_at: new Date().toISOString(),
      order_status: "out_for_delivery",
      status: "OUT_FOR_DELIVERY",
      payment_status: "success",
      payment_method: "upi",
      expectedDelivery: "15 Aug 2026",
      subtotal: 13499,
      discount: 5500,
      gst_amount: 2429,
      platform_fee: 10,
      delivery_fee: 0,
      total_amount: 13499,
      final_amount: 15938,
      items: [
        {
          product_id: INITIAL_PRODUCTS[0]?.id || "nexon-note-5g",
          product: INITIAL_PRODUCTS[0],
          qty: 1,
          quantity: 1,
          price: INITIAL_PRODUCTS[0]?.price || 13499,
          priceAtPurchase: INITIAL_PRODUCTS[0]?.price || 13499,
        },
      ],
      address: {
        address_id: "addr-1",
        name: "Kartly Demo User",
        phone: "9999999999",
        address_line: "Flat 402, Sai Vardhini Heights, Road No. 12, Banjara Hills",
        city: "Hyderabad",
        pincode: "500034",
        type: "home",
      },
      payment: {
        method: "upi",
        providerName: "PhonePe",
        upiId: "demo@ybl",
        status: "success",
      },
      timeline: [
        { status: "placed", date: "12 Aug 2026", time: "10:30 AM", completed: true },
        { status: "confirmed", date: "12 Aug 2026", time: "11:00 AM", completed: true },
        { status: "shipped", date: "13 Aug 2026", time: "09:00 AM", completed: true },
        { status: "out_for_delivery", date: "13 Aug 2026", time: "02:30 PM", completed: true },
        { status: "delivered", date: "15 Aug 2026", time: "Pending", completed: false },
      ],
    },
  ],
};

// Load DB from persistent JSON file
let db = defaultDb;
if (fs.existsSync(DB_FILE)) {
  try {
    const fileData = fs.readFileSync(DB_FILE, "utf-8");
    db = JSON.parse(fileData);
    if (!db.users) db.users = defaultDb.users;
    if (!db.products) db.products = defaultDb.products;
    if (!db.cart) db.cart = defaultDb.cart;
    if (!db.addresses) db.addresses = defaultDb.addresses;
    if (!db.orders) db.orders = defaultDb.orders;
    if (!db.wishlist) db.wishlist = defaultDb.wishlist;
  } catch (err) {
    console.error("Failed to load db.json, starting with default DB:", err);
  }
} else {
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to db.json:", err);
  }
}

// Connect to MongoDB database
connectDB().then(async () => {
  if (isMongoConnected) {
    try {
      // Seed products if empty
      const count = await ProductModel.countDocuments();
      if (count === 0) {
        const prodDocs = db.products.map((p) => ({
          product_id: p.id || p.product_id,
          name: p.title || p.name,
          category: p.category,
          description: p.description,
          original_price: p.mrp || p.original_price || p.price,
          discounted_price: p.price || p.discounted_price,
          discount_percentage: p.discount_percentage || 0,
          brand: p.brand,
          rating: p.rating,
          reviews: String(p.reviews || "1,250"),
          image: p.image,
          subCategory: p.subCategory,
          fashionCategory: p.fashionCategory,
          variants: p.variants || [],
        }));
        await ProductModel.insertMany(prodDocs);
        console.log(`📦 Seeded ${prodDocs.length} products into MongoDB.`);
      }

      // Seed users if empty
      const uCount = await UserModel.countDocuments();
      if (uCount === 0) {
        await UserModel.insertMany(db.users.map(u => ({
          user_id: u.id || u.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          password: u.password,
          role: u.role || "CUSTOMER",
          rewardPoints: u.rewardPoints || 0
        })));
        console.log(`👤 Seeded ${db.users.length} users into MongoDB.`);
      }
    } catch (e) {
      console.error("MongoDB initial seeding error:", e.message);
    }
  }
});

// Helper: Calculate GST Rate per category
function getGstRateForCategory(category = "") {
  const cat = category.toLowerCase();
  if (cat.includes("mobile") || cat.includes("electronic") || cat.includes("appliance")) {
    return 0.18; // 18% GST
  }
  if (cat.includes("fashion") || cat.includes("beauty") || cat.includes("home") || cat.includes("toy") || cat.includes("sport")) {
    return 0.12; // 12% GST
  }
  if (cat.includes("grocery") || cat.includes("book")) {
    return 0.05; // 5% GST
  }
  return 0.18; // Default 18%
}

// Authentication Token Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = db.users[0]; // Fallback to demo user if no token passed
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = db.users[0];
      return next();
    }
    const foundUser = db.users.find((u) => u.id === decoded.id || u.user_id === decoded.id);
    req.user = foundUser || db.users[0];
    next();
  });
}

// ==========================================
// 1. HEALTH & UTILITY API
// ==========================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kartly Full-Stack Express REST API",
    isMongoConnected,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kartly Full-Stack Express REST API",
    isMongoConnected,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. AUTHENTICATION APIs
// ==========================================

// POST /auth/register & /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password, role = "CUSTOMER", ...details } = req.body || {};

  if (!name || (!email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email or phone number, and password are required.",
    });
  }

  const cleanEmail = email ? email.toString().toLowerCase().trim() : `${phone}@kartly.com`;
  const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "9999999999";

  const existingUser = db.users.find(
    (u) => u.email?.toLowerCase().trim() === cleanEmail || (cleanPhone && u.phone?.replace(/\D/g, "") === cleanPhone)
  );

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User account with this email address or phone already exists.",
    });
  }

  const userId = `usr-${Date.now()}`;
  const newUser = {
    id: userId,
    user_id: userId,
    name: name.toString().trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: password.toString(),
    role: role.toString().toUpperCase(),
    rewardPoints: 100,
    created_at: new Date().toISOString(),
    ...details,
  };

  db.users.push(newUser);
  saveDb();

  if (isMongoConnected) {
    try {
      await UserModel.create(newUser);
    } catch (err) {
      console.error("MongoDB user register sync error:", err.message);
    }
  }

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    message: "Registration successful!",
    token,
    user: userWithoutPassword,
  });
});

// POST /auth/login & /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, email, phone, password, role } = req.body || {};
  const queryVal = (emailOrPhone || email || phone || "").toString().toLowerCase().trim();
  const digits = queryVal.replace(/\D/g, "");

  let foundUser = db.users.find((u) => {
    const matchEmail = u.email?.toLowerCase().trim() === queryVal;
    const matchPhone = digits.length >= 7 && u.phone?.replace(/\D/g, "") === digits;
    return matchEmail || matchPhone;
  });

  if (!foundUser && role) {
    foundUser = db.users.find((u) => u.role?.toUpperCase() === role.toString().toUpperCase());
  }

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials. No user found with this email/phone.",
    });
  }

  if (password && foundUser.password && foundUser.password !== password.toString()) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials. Incorrect password.",
    });
  }

  const activeRole = foundUser.role || role || "CUSTOMER";
  foundUser.role = activeRole;
  saveDb();

  const token = jwt.sign({ id: foundUser.id, email: foundUser.email, role: activeRole }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const { password: _, ...userWithoutPassword } = foundUser;

  res.json({
    success: true,
    message: "Login successful!",
    token,
    user: userWithoutPassword,
  });
});

// GET /auth/me & /api/auth/me
app.get("/api/auth/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({
    success: true,
    user: userWithoutPassword,
  });
});

// ==========================================
// 3. PRODUCT APIs
// ==========================================

// GET /products & /api/products
app.get("/api/products", (req, res) => {
  const { category, q, brand, discount, minDiscount, maxDiscount } = req.query;
  let result = db.products;

  if (category && category.toString().toLowerCase() !== "all" && category.toString().toLowerCase() !== "for you") {
    const targetCat = category.toString().toLowerCase().trim();

    result = result.filter((p) => {
      const mainCat = (p.category || "").toLowerCase();
      const subCat = (p.subCategory || "").toLowerCase();
      const fashionCat = (p.fashionCategory || "").toLowerCase();

      if (targetCat === "mens" || targetCat === "men") {
        return subCat === "men" || fashionCat === "men" || mainCat.includes("men");
      }
      if (targetCat === "womens" || targetCat === "women") {
        return subCat === "women" || fashionCat === "women" || mainCat.includes("women");
      }
      if (targetCat === "kids") {
        return subCat === "kids" || fashionCat === "kids" || mainCat.includes("kid");
      }

      return (
        mainCat === targetCat ||
        subCat === targetCat ||
        fashionCat === targetCat ||
        mainCat.includes(targetCat) ||
        targetCat.includes(mainCat)
      );
    });
  }

  if (brand) {
    result = result.filter((p) => (p.brand || "").toLowerCase() === brand.toString().toLowerCase());
  }

  if (q) {
    const searchTerm = q.toString().toLowerCase().trim();
    result = result.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(searchTerm) ||
        (p.brand || "").toLowerCase().includes(searchTerm) ||
        (p.category || "").toLowerCase().includes(searchTerm)
    );
  }

  // Parse and apply Discount Banner Filter
  let minPct = minDiscount ? parseInt(minDiscount.toString(), 10) : undefined;
  let maxPct = maxDiscount ? parseInt(maxDiscount.toString(), 10) : undefined;

  if (discount && (minPct === undefined || maxPct === undefined)) {
    const discStr = discount.toString().toUpperCase().trim();
    const match = discStr.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (discStr.includes("MIN")) {
        minPct = val;
        maxPct = 100;
      } else {
        // e.g. "Up to 40% OFF" -> 35% to 40%
        minPct = Math.max(5, val - 5);
        maxPct = val;
      }
    }
  }

  if (minPct !== undefined || maxPct !== undefined) {
    const minVal = minPct !== undefined ? minPct : 0;
    const maxVal = maxPct !== undefined ? maxPct : 100;

    const discountFiltered = result.filter((p) => {
      const mrp = Number(p.mrp || p.original_price || p.price || 0);
      const price = Number(p.price || p.discounted_price || 0);
      const pct = typeof p.discount_percentage === "number"
        ? p.discount_percentage
        : mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

      return pct >= minVal && pct <= maxVal;
    });

    result = discountFiltered;
  }

  // Enrich product objects with standard fields
  let enriched = result.map((p) => {
    const mrp = Number(p.mrp || p.original_price || p.price || 0);
    const price = Number(p.price || p.discounted_price || 0);
    const discount_percentage = typeof p.discount_percentage === "number"
      ? p.discount_percentage
      : mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return {
      ...p,
      product_id: p.id || p.product_id,
      title: p.title || p.name || "Product",
      name: p.title || p.name || "Product",
      mrp,
      price,
      original_price: mrp,
      discounted_price: price,
      discount_percentage,
      category: p.category || "General",
      rating: Number(p.rating) || 4.5,
      reviews: p.reviews ? String(p.reviews) : "1,250",
      description: p.description || `${p.title || p.name} - High quality ${p.category} product by ${p.brand || "Kartly"}.`,
    };
  });

  // Fallback Dummy Data: If empty, load dummy products for category
  if (enriched.length === 0) {
    const cat = (category && category !== "all" && category !== "For You") ? category.toString() : "Mobiles";
    const targetDiscount = maxPct || 40;
    const dummyPrice = 11999;
    const dummyMrp = Math.round(dummyPrice / (1 - targetDiscount / 100));

    enriched = [
      {
        id: `dummy-prod-1-${Date.now()}`,
        product_id: `dummy-prod-1-${Date.now()}`,
        title: `Kartly ${cat} Mega Savings Edition`,
        name: `Kartly ${cat} Mega Savings Edition`,
        brand: "Kartly Store",
        mrp: dummyMrp,
        price: dummyPrice,
        original_price: dummyMrp,
        discounted_price: dummyPrice,
        discount_percentage: targetDiscount,
        rating: 4.7,
        reviews: "2,450",
        category: cat,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
        description: `Official Kartly ${cat} product with ${targetDiscount}% discount.`,
        isBestseller: true,
        isAssured: true,
      },
      {
        id: `dummy-prod-2-${Date.now()}`,
        product_id: `dummy-prod-2-${Date.now()}`,
        title: `Apex ${cat} Flagship Smart Deal`,
        name: `Apex ${cat} Flagship Smart Deal`,
        brand: "Apex Hub",
        mrp: dummyMrp,
        price: dummyPrice,
        original_price: dummyMrp,
        discounted_price: dummyPrice,
        discount_percentage: targetDiscount,
        rating: 4.8,
        reviews: "5,120",
        category: cat,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        description: `High performance ${cat} item available at ${targetDiscount}% OFF.`,
        isAssured: true,
      },
    ];
  }

  res.json({
    success: true,
    count: enriched.length,
    products: enriched,
  });
});

// GET /products/:id & /api/products/:id
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = db.products.find((p) => p.id === id || p.product_id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

// ==========================================
// 4. CART APIs (FULL PERSISTENCE)
// ==========================================

// GET /cart & /api/cart
app.get("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  const userCart = db.cart.filter((item) => item.userId === userId || item.user_id === userId);

  res.json({
    success: true,
    cart_id: `cart-${userId}`,
    user_id: userId,
    cart: userCart,
  });
});

// POST /cart/add & /api/cart/add
app.post("/api/cart/add", authenticateToken, async (req, res) => {
  const { product, qty = 1, variant, productId, product_id, quantity } = req.body;
  const targetProduct = product || db.products.find((p) => p.id === (productId || product_id) || p.product_id === (productId || product_id));
  const activeQty = Number(qty || quantity || 1);

  if (!targetProduct || (!targetProduct.id && !targetProduct.product_id)) {
    return res.status(400).json({ success: false, message: "Valid product is required to add to cart." });
  }

  const userId = req.user.id || req.user.user_id;
  const pId = targetProduct.id || targetProduct.product_id;

  const existingIndex = db.cart.findIndex(
    (item) => (item.userId === userId || item.user_id === userId) && (item.product?.id === pId || item.product_id === pId)
  );

  if (existingIndex >= 0) {
    db.cart[existingIndex].qty += activeQty;
    db.cart[existingIndex].quantity += activeQty;
    if (variant) db.cart[existingIndex].variant = variant;
  } else {
    const cartItemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.cart.push({
      id: cartItemId,
      cart_id: `cart-${userId}`,
      userId,
      user_id: userId,
      product_id: pId,
      product: targetProduct,
      qty: activeQty,
      quantity: activeQty,
      price: targetProduct.price || targetProduct.base_price || 0,
      variant: variant || { color: "Default", size: "Standard" },
    });
  }

  saveDb();

  const userCart = db.cart.filter((item) => item.userId === userId || item.user_id === userId);

  if (isMongoConnected) {
    try {
      await CartModel.findOneAndUpdate(
        { user_id: userId },
        { cart_id: `cart-${userId}`, user_id: userId, items: userCart },
        { upsert: true }
      );
    } catch (e) {
      console.error("MongoDB Cart sync error:", e.message);
    }
  }

  res.json({ success: true, message: "Item added to cart successfully", cart: userCart });
});

// PUT /cart/update & /api/cart/update
app.put("/api/cart/update", authenticateToken, async (req, res) => {
  const { productId, product_id, qty, quantity } = req.body;
  const pId = productId || product_id;
  const activeQty = Number(qty !== undefined ? qty : quantity);
  const userId = req.user.id || req.user.user_id;

  if (!pId) {
    return res.status(400).json({ success: false, message: "productId is required." });
  }

  if (activeQty <= 0) {
    db.cart = db.cart.filter(
      (item) => !((item.userId === userId || item.user_id === userId) && (item.product?.id === pId || item.product_id === pId || item.id === pId))
    );
  } else {
    const item = db.cart.find(
      (item) => (item.userId === userId || item.user_id === userId) && (item.product?.id === pId || item.product_id === pId || item.id === pId)
    );
    if (item) {
      item.qty = activeQty;
      item.quantity = activeQty;
    }
  }

  saveDb();
  const userCart = db.cart.filter((item) => item.userId === userId || item.user_id === userId);

  if (isMongoConnected) {
    try {
      await CartModel.findOneAndUpdate(
        { user_id: userId },
        { cart_id: `cart-${userId}`, user_id: userId, items: userCart },
        { upsert: true }
      );
    } catch (e) {
      console.error("MongoDB Cart update error:", e.message);
    }
  }

  res.json({ success: true, message: "Cart updated", cart: userCart });
});

// DELETE /cart/remove & /api/cart/remove/:id
app.delete("/api/cart/remove/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.user_id;

  db.cart = db.cart.filter(
    (item) => !((item.userId === userId || item.user_id === userId) && (item.product?.id === id || item.product_id === id || item.id === id))
  );

  saveDb();
  const userCart = db.cart.filter((item) => item.userId === userId || item.user_id === userId);

  if (isMongoConnected) {
    try {
      await CartModel.findOneAndUpdate({ user_id: userId }, { items: userCart });
    } catch (e) {
      console.error("MongoDB Cart item remove error:", e.message);
    }
  }

  res.json({ success: true, message: "Item removed from cart", cart: userCart });
});

app.delete("/api/cart/remove", authenticateToken, async (req, res) => {
  const { productId, product_id, id } = req.body || {};
  const targetId = productId || product_id || id;
  const userId = req.user.id || req.user.user_id;

  if (targetId) {
    db.cart = db.cart.filter(
      (item) => !((item.userId === userId || item.user_id === userId) && (item.product?.id === targetId || item.product_id === targetId || item.id === targetId))
    );
    saveDb();
  }

  const userCart = db.cart.filter((item) => item.userId === userId || item.user_id === userId);

  if (isMongoConnected) {
    try {
      await CartModel.findOneAndUpdate({ user_id: userId }, { items: userCart });
    } catch (e) {
      console.error("MongoDB Cart remove error:", e.message);
    }
  }

  res.json({ success: true, message: "Item removed from cart", cart: userCart });
});

// DELETE /cart/clear & /api/cart/clear
app.delete("/api/cart/clear", authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.user_id;
  db.cart = db.cart.filter((item) => item.userId !== userId && item.user_id !== userId);
  saveDb();

  if (isMongoConnected) {
    try {
      await CartModel.findOneAndUpdate({ user_id: userId }, { items: [] });
    } catch (e) {
      console.error("MongoDB Cart clear error:", e.message);
    }
  }

  res.json({ success: true, message: "Cart cleared", cart: [] });
});

// ==========================================
// 5. ADDRESSES APIs
// ==========================================

// GET /addresses & /api/addresses
app.get("/api/addresses", authenticateToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  const userAddresses = db.addresses.filter((a) => a.userId === userId || a.user_id === userId);
  res.json({ success: true, addresses: userAddresses });
});

// POST /addresses & /api/addresses
app.post("/api/addresses", authenticateToken, async (req, res) => {
  const { name, phone, house, street, address_line, city, state, pincode, type = "home", isDefault = false } = req.body;
  const userId = req.user.id || req.user.user_id;

  if (isDefault) {
    db.addresses.forEach((a) => {
      if (a.userId === userId || a.user_id === userId) a.isDefault = false;
    });
  }

  const addrId = `addr-${Date.now()}`;
  const formattedAddressLine = address_line || `${house || ""}, ${street || ""}, ${city || "Hyderabad"}`;

  const newAddress = {
    id: addrId,
    address_id: addrId,
    userId,
    user_id: userId,
    name: name || req.user.name,
    phone: phone || req.user.phone,
    house: house || "",
    street: street || "",
    address_line: formattedAddressLine,
    city: city || "Hyderabad",
    state: state || "Telangana",
    pincode: pincode || "500034",
    type,
    isDefault: isDefault || db.addresses.filter((a) => a.userId === userId || a.user_id === userId).length === 0,
  };

  db.addresses.push(newAddress);
  saveDb();

  if (isMongoConnected) {
    try {
      await AddressModel.create(newAddress);
    } catch (e) {
      console.error("MongoDB Address create error:", e.message);
    }
  }

  const userAddresses = db.addresses.filter((a) => a.userId === userId || a.user_id === userId);
  res.status(201).json({ success: true, address: newAddress, addresses: userAddresses });
});

// DELETE /addresses/:id & /api/addresses/:id
app.delete("/api/addresses/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.user_id;

  db.addresses = db.addresses.filter((a) => !((a.userId === userId || a.user_id === userId) && (a.id === id || a.address_id === id)));
  saveDb();

  if (isMongoConnected) {
    try {
      await AddressModel.deleteOne({ address_id: id });
    } catch (e) {
      console.error("MongoDB Address delete error:", e.message);
    }
  }

  const userAddresses = db.addresses.filter((a) => a.userId === userId || a.user_id === userId);
  res.json({ success: true, addresses: userAddresses });
});

// ==========================================
// 6. CHECKOUT APIs
// ==========================================

// POST /checkout & /api/checkout
app.post("/api/checkout", authenticateToken, (req, res) => {
  const { items, addressId, couponCode, buyNowItem } = req.body;
  const userId = req.user.id || req.user.user_id;

  let checkoutItems = items;
  if (!checkoutItems || checkoutItems.length === 0) {
    if (buyNowItem) {
      checkoutItems = [buyNowItem];
    } else {
      checkoutItems = db.cart.filter((c) => c.userId === userId || c.user_id === userId);
    }
  }

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty. Add items to checkout." });
  }

  let subtotal = 0;
  let mrpTotal = 0;
  let gstTotal = 0;

  const itemBreakdown = checkoutItems.map((ci) => {
    const p = ci.product || ci;
    const qty = ci.qty || ci.quantity || 1;
    const price = Number(p.price || p.base_price || 0);
    const mrp = Number(p.mrp || p.price || p.base_price || 0);

    const itemSubtotal = price * qty;
    const itemMrp = mrp * qty;
    const rate = getGstRateForCategory(p.category || "");
    const itemGst = Math.round(itemSubtotal * rate);

    subtotal += itemSubtotal;
    mrpTotal += itemMrp;
    gstTotal += itemGst;

    return {
      product_id: p.id || p.product_id,
      title: p.title || p.name,
      price,
      mrp,
      qty,
      quantity: qty,
      category: p.category,
      variant: ci.variant || { color: "Default", size: "Standard" },
      gstRate: Math.round(rate * 100),
      gstAmount: itemGst,
      total: itemSubtotal,
    };
  });

  const platformFee = 10;
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;

  let couponDiscount = 0;
  if (couponCode === "WELCOME10") {
    couponDiscount = Math.min(Math.round(subtotal * 0.1), 1000);
  } else if (couponCode === "SAVE500" && subtotal >= 1999) {
    couponDiscount = 500;
  } else if (couponCode === "KARTLY100" && subtotal >= 299) {
    couponDiscount = 100;
  }

  const finalAmount = Math.max(0, subtotal + gstTotal + platformFee + deliveryFee - couponDiscount);
  const discount = Math.max(0, mrpTotal - subtotal);

  const selectedAddress =
    db.addresses.find((a) => (a.id === addressId || a.address_id === addressId) && (a.userId === userId || a.user_id === userId)) ||
    db.addresses.find((a) => (a.userId === userId || a.user_id === userId) && a.isDefault) ||
    db.addresses[0];

  res.json({
    success: true,
    summary: {
      subtotal,
      mrpTotal,
      discount,
      gstTotal,
      platformFee,
      deliveryFee,
      couponDiscount,
      finalAmount,
      total_amount: subtotal,
      gst_amount: gstTotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      final_amount: finalAmount,
    },
    items: itemBreakdown,
    address: selectedAddress,
  });
});

// ==========================================
// 7. ORDER APIs (PERSISTED IN DB)
// ==========================================

// POST /orders/place & /api/orders/place
app.post("/api/orders/place", authenticateToken, async (req, res) => {
  const { items, address, paymentMethod, payment_method, paymentDetails, totals, isBuyNow } = req.body;
  const userId = req.user.id || req.user.user_id;

  let orderItems = items;
  if (!orderItems || orderItems.length === 0) {
    orderItems = db.cart.filter((c) => c.userId === userId || c.user_id === userId);
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: "No items to order." });
  }

  const orderId = `KARTLY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
    10000 + Math.random() * 90000
  )}`;

  const now = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(now.getDate() + 3);

  const formattedDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formattedDelivery = deliveryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const activePaymentMethod = (paymentMethod || payment_method || "upi").toLowerCase();

  const newOrder = {
    id: orderId,
    order_id: orderId,
    userId,
    user_id: userId,
    date: formattedDate,
    created_at: now.toISOString(),
    order_status: "placed",
    status: "PLACED",
    payment_status: activePaymentMethod === "cod" ? "pending" : "success",
    payment_method: activePaymentMethod,
    expectedDelivery: formattedDelivery,
    items: orderItems,
    address: address || db.addresses.find((a) => (a.userId === userId || a.user_id === userId) && a.isDefault) || db.addresses[0],
    payment: {
      method: activePaymentMethod,
      status: activePaymentMethod === "cod" ? "pending" : "success",
      details: paymentDetails || {},
    },
    subtotal: totals?.subtotal || 0,
    mrpTotal: totals?.mrpTotal || 0,
    discount: totals?.discount || 0,
    gst_amount: totals?.gstTotal || totals?.gst_amount || 0,
    platform_fee: totals?.platformFee || totals?.platform_fee || 10,
    delivery_fee: totals?.deliveryFee || totals?.delivery_fee || 0,
    total_amount: totals?.finalAmount || totals?.subtotal || 0,
    final_amount: totals?.finalAmount || totals?.final_amount || totals?.subtotal || 0,
    timeline: [
      { status: "placed", date: formattedDate, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
      { status: "confirmed", date: formattedDate, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
      { status: "shipped", date: formattedDelivery, time: "Expected", completed: false },
      { status: "out_for_delivery", date: formattedDelivery, time: "Expected", completed: false },
      { status: "delivered", date: formattedDelivery, time: "Expected", completed: false },
    ],
  };

  db.orders.unshift(newOrder);

  // Clear cart if not buy-now flow
  if (!isBuyNow) {
    db.cart = db.cart.filter((c) => c.userId !== userId && c.user_id !== userId);
  }
  saveDb();

  if (isMongoConnected) {
    try {
      await OrderModel.create(newOrder);
      if (!isBuyNow) {
        await CartModel.findOneAndUpdate({ user_id: userId }, { items: [] });
      }
    } catch (e) {
      console.error("MongoDB Order create error:", e.message);
    }
  }

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    orderId,
    order: newOrder,
  });
});

// GET /orders & /api/orders
app.get("/api/orders", authenticateToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  const userOrders = db.orders.filter((o) => o.userId === userId || o.user_id === userId);

  res.json({
    success: true,
    count: userOrders.length,
    orders: userOrders,
  });
});

// GET /orders/:id & /api/orders/:id
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id || o.order_id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order });
});

// GET /orders/:id/status & /api/orders/:id/status
app.get("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id || o.order_id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({
    success: true,
    orderId: order.id || order.order_id,
    order_id: order.id || order.order_id,
    status: order.order_status || order.status,
    order_status: order.order_status || order.status,
    payment_status: order.payment_status,
    timeline: order.timeline,
    expectedDelivery: order.expectedDelivery,
  });
});

// ==========================================
// 8. PAYMENT APIs
// ==========================================

// POST /payment/initiate & /api/payment/initiate
app.post("/api/payment/initiate", authenticateToken, (req, res) => {
  const { orderId, order_id, amount, paymentMethod = "upi", upiId } = req.body;
  const targetId = orderId || order_id;

  const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    message: "Payment initiated successfully",
    transactionId: txnId,
    orderId: targetId,
    order_id: targetId,
    amount,
    status: "INITIATED",
    redirectUrl: `/payment?orderId=${targetId}&txnId=${txnId}`,
  });
});

// POST /payment/verify & /api/payment/verify
app.post("/api/payment/verify", authenticateToken, async (req, res) => {
  const { orderId, order_id, transactionId, status = "success" } = req.body;
  const targetId = orderId || order_id;

  const order = db.orders.find((o) => o.id === targetId || o.order_id === targetId);

  if (order) {
    order.payment_status = status.toLowerCase() === "success" ? "success" : "failed";
    order.order_status = "confirmed";
    order.status = "CONFIRMED";
    order.payment = {
      ...(order.payment || {}),
      status: status.toLowerCase() === "success" ? "success" : "failed",
      transactionId,
    };
    saveDb();

    if (isMongoConnected) {
      try {
        await OrderModel.findOneAndUpdate(
          { order_id: targetId },
          { payment_status: order.payment_status, order_status: "confirmed" }
        );
      } catch (e) {
        console.error("MongoDB Order payment verify error:", e.message);
      }
    }
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    payment_status: order?.payment_status || "success",
    order,
  });
});

// ==========================================
// 9. WISHLIST APIs
// ==========================================

app.get("/api/wishlist", authenticateToken, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  const userWishlist = db.wishlist.filter((w) => w.userId === userId || w.user_id === userId).map((w) => w.productId);
  res.json({ success: true, wishlist: userWishlist });
});

app.post("/api/wishlist/toggle", authenticateToken, (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id || req.user.user_id;
  if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

  const existingIndex = db.wishlist.findIndex((w) => (w.userId === userId || w.user_id === userId) && w.productId === productId);

  if (existingIndex >= 0) {
    db.wishlist.splice(existingIndex, 1);
  } else {
    db.wishlist.push({ userId, user_id: userId, productId });
  }

  saveDb();
  const userWishlist = db.wishlist.filter((w) => w.userId === userId || w.user_id === userId).map((w) => w.productId);
  res.json({ success: true, wishlist: userWishlist });
});

// Start Express REST API Server
app.listen(PORT, () => {
  console.log(`🚀 Kartly Full-Stack E-Commerce API Server running on http://localhost:${PORT}`);
});
