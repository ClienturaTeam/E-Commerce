import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INITIAL_PRODUCTS } from "./productsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "kartly-super-secret-key-2026";

app.use(cors());
app.use(express.json());

// Initial database template
const defaultDb = {
  users: [
    {
      id: "usr-demo",
      name: "Kartly Demo User",
      email: "demo@kartly.com",
      phone: "9999999999",
      password: "password123",
      role: "CUSTOMER",
      rewardPoints: 250,
    },
    {
      id: "usr-customer",
      name: "Rahul Sharma",
      email: "customer@kartly.com",
      phone: "9876543210",
      password: "password123",
      role: "CUSTOMER",
      address: "Flat 402, Sunshine Apartments, Indiranagar, Bengaluru - 560001",
    },
    {
      id: "usr-seller",
      name: "Apex Retailers Pvt Ltd",
      email: "seller@kartly.com",
      phone: "9876543211",
      password: "password123",
      role: "SELLER",
      shopName: "Apex Digital Hub",
      businessType: "Electronics Retailer",
    },
    {
      id: "usr-admin",
      name: "System Admin (Level 2)",
      email: "admin@kartly.com",
      phone: "9876543212",
      password: "password123",
      role: "ADMIN",
      employeeId: "ADM-9021",
    },
    {
      id: "usr-superadmin",
      name: "Root Super Admin",
      email: "superadmin@kartly.com",
      phone: "9876543213",
      password: "password123",
      role: "SUPER_ADMIN",
      employeeId: "ROOT-0001",
    },
    {
      id: "usr-warehouse",
      name: "Rajesh Kumar (Packing Station)",
      email: "warehouse@kartly.com",
      phone: "9876543214",
      password: "password123",
      role: "WAREHOUSE",
      employeeId: "WH-BLR-04",
      stationId: "WH-BLR-04",
    },
    {
      id: "usr-delivery",
      name: "Vikram Singh (Rider #892)",
      email: "delivery@kartly.com",
      phone: "9876543215",
      password: "password123",
      role: "DELIVERY",
      vehicleType: "Electric Two-Wheeler",
      licenseNumber: "KA-01-2024-8921",
    },
    {
      id: "usr-support",
      name: "Ananya Roy (Senior Executive)",
      email: "support@kartly.com",
      phone: "9876543216",
      password: "password123",
      role: "SUPPORT",
      employeeId: "SUP-4019",
      department: "Tier-2 Escalations & Refunds",
    },
    {
      id: "usr-finance",
      name: "Finance Comptroller",
      email: "finance@kartly.com",
      phone: "9876543217",
      password: "password123",
      role: "FINANCE",
      employeeId: "FIN-8802",
      designation: "Chief Comptroller",
    },
  ],
  products: [...INITIAL_PRODUCTS],
  cart: [], // [{ id, userId, product, qty, variant }]
  wishlist: [], // [{ userId, productId }]
  addresses: [
    {
      id: "addr-1",
      userId: "usr-demo",
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
      userId: "usr-demo",
      name: "Kartly Demo User",
      phone: "9999999999",
      house: "Building 5B, Mindspace IT Park",
      street: "HITEC City",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      type: "work",
      isDefault: false,
    },
  ],
  orders: [
    {
      id: "OD982410491",
      order_id: "OD982410491",
      userId: "usr-demo",
      date: "12 Aug 2026",
      created_at: new Date().toISOString(),
      order_status: "OUT_FOR_DELIVERY",
      payment_status: "SUCCESS",
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
          product: INITIAL_PRODUCTS[0],
          qty: 1,
          priceAtPurchase: INITIAL_PRODUCTS[0]?.price || 13499,
        },
      ],
      address: {
        id: "addr-1",
        name: "Kartly Demo User",
        phone: "9999999999",
        house: "Flat 402, Sai Vardhini Heights",
        street: "Road No. 12, Banjara Hills",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500034",
        type: "home",
      },
      payment: {
        method: "upi",
        providerName: "PhonePe",
        upiId: "demo@ybl",
        status: "SUCCESS",
      },
      timeline: [
        { status: "Placed", date: "12 Aug 2026", time: "10:30 AM", completed: true },
        { status: "Confirmed", date: "12 Aug 2026", time: "11:00 AM", completed: true },
        { status: "Shipped", date: "13 Aug 2026", time: "09:00 AM", completed: true },
        { status: "Out for Delivery", date: "13 Aug 2026", time: "02:30 PM", completed: true },
        { status: "Delivered", date: "15 Aug 2026", time: "Pending", completed: false },
      ],
    },
  ],
};

// Load DB from file or save initial
let db = defaultDb;
if (fs.existsSync(DB_FILE)) {
  try {
    const fileData = fs.readFileSync(DB_FILE, "utf-8");
    db = JSON.parse(fileData);
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

// Helper: Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = db.users[0]; // Fallback to demo user if no token
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = db.users[0];
      return next();
    }
    const foundUser = db.users.find((u) => u.id === decoded.id);
    req.user = foundUser || db.users[0];
    next();
  });
}

// ==========================================
// 1. HEALTH & UTILITY API
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Kartly Full-Stack E-Commerce Express API",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1.5 AUTHENTICATION API
// ==========================================

// POST /api/auth/register -> Register new user with role & role-specific details
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password, role, ...roleDetails } = req.body || {};

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Full Name, Email, Phone Number, Password, and Role are required.",
    });
  }

  const cleanEmail = email.toString().toLowerCase().trim();
  const cleanPhone = phone.toString().replace(/\D/g, "");

  // Check if account already exists
  const existingUser = db.users.find(
    (u) => u.email?.toLowerCase().trim() === cleanEmail || (cleanPhone && u.phone?.replace(/\D/g, "") === cleanPhone)
  );

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Account already exists with this email address or phone number.",
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.toString().trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: password.toString(),
    role: role.toString().toUpperCase(),
    createdAt: new Date().toISOString(),
    ...roleDetails,
  };

  db.users.push(newUser);
  saveDb();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    message: `Account created successfully for ${role} portal.`,
    token,
    user: userWithoutPassword,
  });
});

// POST /api/auth/login -> Authenticate user by email/phone + password
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, password, role } = req.body || {};

  if (!emailOrPhone) {
    return res.status(400).json({
      success: false,
      message: "Email address or Mobile number is required.",
    });
  }

  const query = emailOrPhone.toString().toLowerCase().trim();
  const digits = emailOrPhone.toString().replace(/\D/g, "");

  let foundUser = db.users.find((u) => {
    const matchEmail = u.email?.toLowerCase().trim() === query;
    const matchPhone = digits.length >= 7 && u.phone?.replace(/\D/g, "") === digits;
    return matchEmail || matchPhone;
  });

  if (!foundUser && role) {
    foundUser = db.users.find((u) => u.role?.toUpperCase() === role.toString().toUpperCase());
  }

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      message: "Incorrect credentials. No registered user found.",
    });
  }

  if (password && foundUser.password && foundUser.password !== password.toString()) {
    return res.status(401).json({
      success: false,
      message: "Incorrect credentials. Invalid password.",
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
    message: "Login successful.",
    token,
    user: userWithoutPassword,
  });
});

// GET /api/auth/me -> Current user session lookup
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
// 2. PRODUCTS API
// ==========================================

// GET /api/products -> List & Filter
app.get("/api/products", (req, res) => {
  const { category, q, brand } = req.query;
  let result = db.products;

  if (category && category.toLowerCase() !== "all" && category.toLowerCase() !== "for you") {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toString().toLowerCase()
    );
  }

  if (brand) {
    result = result.filter((p) => p.brand.toLowerCase() === brand.toString().toLowerCase());
  }

  if (q) {
    const searchTerm = q.toString().toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
  }

  res.json({
    success: true,
    count: result.length,
    products: result,
  });
});

// GET /api/products/:id -> Single product lookup
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = db.products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

// ==========================================
// 3. AUTHENTICATION API
// ==========================================

// POST /api/auth/register
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || (!email && !phone) || !password) {
    return res.status(400).json({ success: false, message: "Name, email/phone, and password are required" });
  }

  const existing = db.users.find(
    (u) => (email && u.email.toLowerCase() === email.toLowerCase()) || (phone && u.phone === phone)
  );

  if (existing) {
    return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    user_id: `usr-${Date.now()}`,
    name,
    email: email || `${phone}@kartly.com`,
    phone: phone || "9999999999",
    password,
    rewardPoints: 100,
  };

  db.users.push(newUser);
  saveDb();

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    success: true,
    message: "Registration successful!",
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, rewardPoints: newUser.rewardPoints },
    token,
  });
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { emailOrPhone, email, phone, password } = req.body;
  const queryVal = (emailOrPhone || email || phone || "").toString().toLowerCase().trim();

  const user = db.users.find(
    (u) =>
      (u.email.toLowerCase() === queryVal || u.phone === queryVal) &&
      (u.password === password || !password)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    success: true,
    message: "Login successful!",
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, rewardPoints: user.rewardPoints },
    token,
  });
});

// GET /api/auth/me
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, name: req.user.name, email: req.user.email, phone: req.user.phone, rewardPoints: req.user.rewardPoints },
  });
});

// ==========================================
// 4. CART API
// ==========================================

// GET /api/cart
app.get("/api/cart", authenticateToken, (req, res) => {
  const userCart = db.cart.filter((item) => item.userId === req.user.id);
  res.json({
    success: true,
    cart: userCart,
  });
});

// POST /api/cart/add
app.post("/api/cart/add", authenticateToken, (req, res) => {
  const { product, qty = 1, variant } = req.body;

  if (!product || !product.id) {
    return res.status(400).json({ success: false, message: "Product is required" });
  }

  const existingIndex = db.cart.findIndex(
    (item) => item.userId === req.user.id && item.product.id === product.id
  );

  if (existingIndex >= 0) {
    db.cart[existingIndex].qty += qty;
    if (variant) db.cart[existingIndex].variant = variant;
  } else {
    db.cart.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: req.user.id,
      product,
      qty,
      variant,
    });
  }

  saveDb();
  const userCart = db.cart.filter((item) => item.userId === req.user.id);
  res.json({ success: true, message: "Item added to cart", cart: userCart });
});

// PUT /api/cart/update
app.put("/api/cart/update", authenticateToken, (req, res) => {
  const { productId, qty } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "productId required" });
  }

  if (qty <= 0) {
    db.cart = db.cart.filter((item) => !(item.userId === req.user.id && item.product.id === productId));
  } else {
    const item = db.cart.find((item) => item.userId === req.user.id && item.product.id === productId);
    if (item) item.qty = qty;
  }

  saveDb();
  const userCart = db.cart.filter((item) => item.userId === req.user.id);
  res.json({ success: true, message: "Cart updated", cart: userCart });
});

// DELETE /api/cart/remove/:id
app.delete("/api/cart/remove/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.cart = db.cart.filter((item) => !(item.userId === req.user.id && (item.product.id === id || item.id === id)));
  saveDb();
  const userCart = db.cart.filter((item) => item.userId === req.user.id);
  res.json({ success: true, message: "Item removed from cart", cart: userCart });
});

// DELETE /api/cart/clear
app.delete("/api/cart/clear", authenticateToken, (req, res) => {
  db.cart = db.cart.filter((item) => item.userId !== req.user.id);
  saveDb();
  res.json({ success: true, message: "Cart cleared", cart: [] });
});

// ==========================================
// 5. ADDRESSES API
// ==========================================
app.get("/api/addresses", authenticateToken, (req, res) => {
  const userAddresses = db.addresses.filter((a) => a.userId === req.user.id);
  res.json({ success: true, addresses: userAddresses });
});

app.post("/api/addresses", authenticateToken, (req, res) => {
  const { name, phone, house, street, city, state, pincode, type = "home", isDefault = false } = req.body;

  if (isDefault) {
    db.addresses.forEach((a) => {
      if (a.userId === req.user.id) a.isDefault = false;
    });
  }

  const newAddress = {
    id: `addr-${Date.now()}`,
    userId: req.user.id,
    name: name || req.user.name,
    phone: phone || req.user.phone,
    house: house || "",
    street: street || "",
    city: city || "Hyderabad",
    state: state || "Telangana",
    pincode: pincode || "500034",
    type,
    isDefault: isDefault || db.addresses.filter((a) => a.userId === req.user.id).length === 0,
  };

  db.addresses.push(newAddress);
  saveDb();
  const userAddresses = db.addresses.filter((a) => a.userId === req.user.id);
  res.status(201).json({ success: true, address: newAddress, addresses: userAddresses });
});

app.delete("/api/addresses/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.addresses = db.addresses.filter((a) => !(a.userId === req.user.id && a.id === id));
  saveDb();
  const userAddresses = db.addresses.filter((a) => a.userId === req.user.id);
  res.json({ success: true, addresses: userAddresses });
});

// ==========================================
// 6. CHECKOUT & GST CALCULATION API
// ==========================================
app.post("/api/checkout", authenticateToken, (req, res) => {
  const { items, addressId, couponCode } = req.body;
  const checkoutItems = items || db.cart.filter((c) => c.userId === req.user.id);

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let subtotal = 0;
  let mrpTotal = 0;
  let gstTotal = 0;

  const itemBreakdown = checkoutItems.map((ci) => {
    const p = ci.product;
    const qty = ci.qty || 1;
    const itemSubtotal = p.price * qty;
    const itemMrp = (p.mrp || p.price) * qty;

    const rate = getGstRateForCategory(p.category || "");
    const itemGst = Math.round(itemSubtotal * rate);

    subtotal += itemSubtotal;
    mrpTotal += itemMrp;
    gstTotal += itemGst;

    return {
      product_id: p.id,
      title: p.title,
      price: p.price,
      mrp: p.mrp || p.price,
      qty,
      category: p.category,
      gstRate: Math.round(rate * 100),
      gstAmount: itemGst,
      total: itemSubtotal,
    };
  });

  const platformFee = 10;
  const deliveryFee = subtotal >= 500 ? 0 : 40;

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
    db.addresses.find((a) => a.id === addressId && a.userId === req.user.id) ||
    db.addresses.find((a) => a.userId === req.user.id && a.isDefault) ||
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
    },
    items: itemBreakdown,
    address: selectedAddress,
  });
});

// ==========================================
// 7. ORDERS & TRACKING API
// ==========================================

// POST /api/orders/place
app.post("/api/orders/place", authenticateToken, (req, res) => {
  const { items, address, paymentMethod, paymentDetails, totals } = req.body;
  const orderItems = items || db.cart.filter((c) => c.userId === req.user.id);

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: "No items to order" });
  }

  const orderId = `KARTLY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
    10000 + Math.random() * 90000
  )}`;

  const now = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(now.getDate() + 3);

  const formattedDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formattedDelivery = deliveryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const newOrder = {
    id: orderId,
    order_id: orderId,
    userId: req.user.id,
    user_id: req.user.id,
    date: formattedDate,
    created_at: now.toISOString(),
    order_status: "PLACED",
    status: "PLACED",
    payment_status: paymentMethod === "cod" ? "PENDING" : "SUCCESS",
    expectedDelivery: formattedDelivery,
    items: orderItems,
    address: address || db.addresses.find((a) => a.userId === req.user.id && a.isDefault) || db.addresses[0],
    payment: {
      method: paymentMethod || "upi",
      status: paymentMethod === "cod" ? "PENDING" : "SUCCESS",
      details: paymentDetails || {},
    },
    subtotal: totals?.subtotal || 0,
    mrpTotal: totals?.mrpTotal || 0,
    discount: totals?.discount || 0,
    gst_amount: totals?.gstTotal || 0,
    platform_fee: totals?.platformFee || 10,
    delivery_fee: totals?.deliveryFee || 0,
    total_amount: totals?.finalAmount || totals?.subtotal || 0,
    final_amount: totals?.finalAmount || totals?.subtotal || 0,
    timeline: [
      { status: "Placed", date: formattedDate, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
      { status: "Confirmed", date: formattedDate, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), completed: true },
      { status: "Shipped", date: formattedDelivery, time: "Expected", completed: false },
      { status: "Out for Delivery", date: formattedDelivery, time: "Expected", completed: false },
      { status: "Delivered", date: formattedDelivery, time: "Expected", completed: false },
    ],
  };

  db.orders.unshift(newOrder);

  // Clear user's cart after order placement
  db.cart = db.cart.filter((c) => c.userId !== req.user.id);
  saveDb();

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    orderId,
    order: newOrder,
  });
});

// GET /api/orders -> List user orders
app.get("/api/orders", authenticateToken, (req, res) => {
  const userOrders = db.orders.filter((o) => o.userId === req.user.id);
  res.json({
    success: true,
    count: userOrders.length,
    orders: userOrders,
  });
});

// GET /api/orders/:id -> Single order detail
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id || o.order_id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order });
});

// GET /api/orders/:id/status -> Real-time status lookup
app.get("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id || o.order_id === id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({
    success: true,
    orderId: order.id,
    status: order.order_status || order.status,
    payment_status: order.payment_status,
    timeline: order.timeline,
    expectedDelivery: order.expectedDelivery,
  });
});

// ==========================================
// 8. PAYMENT SIMULATION API
// ==========================================

// POST /api/payment/initiate
app.post("/api/payment/initiate", authenticateToken, (req, res) => {
  const { orderId, amount, paymentMethod = "upi", upiId } = req.body;

  const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    message: "Payment initiated",
    transactionId: txnId,
    orderId,
    amount,
    status: "INITIATED",
    redirectUrl: `/payment?orderId=${orderId}&txnId=${txnId}`,
  });
});

// POST /api/payment/verify
app.post("/api/payment/verify", authenticateToken, (req, res) => {
  const { orderId, transactionId, status = "SUCCESS" } = req.body;

  const order = db.orders.find((o) => o.id === orderId || o.order_id === orderId);

  if (order) {
    order.payment_status = status;
    order.order_status = "CONFIRMED";
    order.status = "CONFIRMED";
    order.payment = {
      ...(order.payment || {}),
      status,
      transactionId,
    };
    saveDb();
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    payment_status: status,
    order,
  });
});

// ==========================================
// 9. WISHLIST API
// ==========================================
app.get("/api/wishlist", authenticateToken, (req, res) => {
  const userWishlist = db.wishlist.filter((w) => w.userId === req.user.id).map((w) => w.productId);
  res.json({ success: true, wishlist: userWishlist });
});

app.post("/api/wishlist/toggle", authenticateToken, (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: "productId required" });

  const existingIndex = db.wishlist.findIndex((w) => w.userId === req.user.id && w.productId === productId);

  if (existingIndex >= 0) {
    db.wishlist.splice(existingIndex, 1);
  } else {
    db.wishlist.push({ userId: req.user.id, productId });
  }

  saveDb();
  const userWishlist = db.wishlist.filter((w) => w.userId === req.user.id).map((w) => w.productId);
  res.json({ success: true, wishlist: userWishlist });
});

// Start Express REST API Server
app.listen(PORT, () => {
  console.log(`🚀 Kartly Full-Stack E-Commerce API Server running on http://localhost:${PORT}`);
});
