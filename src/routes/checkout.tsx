import * as React from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Check,
  ChevronRight,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  Truck,
  Building2,
  Calendar,
  Package,
  ShoppingBag,
  Info,
  Tag,
  Edit,
  Trash2,
  Star,
  X,
  AlertCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { ChatBot } from "@/components/store/ChatBot";
import { StoreProvider, useStore, getProductGstRate } from "@/components/store/store-context";
import { inr } from "@/components/store/catalog";
import { GstBreakdownModal, PlatformFeeModal } from "@/components/store/BillBreakdownModals";
import { UpiPaymentWidget } from "@/components/store/UpiPaymentWidget";
import type { Address, PaymentDetails, PaymentMethodType } from "@/components/store/types";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    user,
    cart,
    buyNowProduct,
    appliedCoupon,
    couponDiscountAmount,
    addresses,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
    placeOrder,
    openAuthModal,
    pincode,
    selectedAddressId,
    selectDeliveryAddress,
  } = useStore();

  const router = useRouter();

  // Redirect if guest
  React.useEffect(() => {
    if (!user || !user.isAuth) {
      openAuthModal("Please sign in to access checkout.");
    }
  }, [user, openAuthModal]);

  // Modal states for GST & Platform Fee popups
  const [isGstModalOpen, setIsGstModalOpen] = React.useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = React.useState(false);

  // Determine active checkout items: buyNowProduct if available, otherwise cart
  const checkoutItems = React.useMemo(() => {
    if (buyNowProduct && buyNowProduct.product && buyNowProduct.product.id) {
      return [buyNowProduct];
    }
    if (!cart || !Array.isArray(cart)) return [];
    return cart.filter((item) => item && item.product && typeof item.product.price === "number");
  }, [buyNowProduct, cart]);

  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3 | 4>(2);
  const [selectedAddrId, setSelectedAddrId] = React.useState<string>(
    selectedAddressId || addresses[0]?.id || "addr-1"
  );

  React.useEffect(() => {
    if (selectedAddressId) {
      setSelectedAddrId(selectedAddressId);
    }
  }, [selectedAddressId]);
  const [showAddAddressForm, setShowAddAddressForm] = React.useState(false);
  // New Address Form State
  const [newAddr, setNewAddr] = React.useState({
    name: user?.name || "Kartly Customer",
    phone: user?.phone || "9999999999",
    house: "",
    street: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: pincode || "500034",
    type: "home" as "home" | "work" | "other",
  });

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>("upi");
  const [upiProvider, setUpiProvider] = React.useState("PhonePe");
  const [upiIdInput, setUpiIdInput] = React.useState("");
  const [cardFields, setCardFields] = React.useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [selectedBank, setSelectedBank] = React.useState("HDFC Bank");
  const [emiTenure, setEmiTenure] = React.useState(3);

  // Dynamic Swiggy/Zomato Style Bill Calculations
  const platformFee = 10;

  const checkoutSubtotal = checkoutItems.reduce((acc, line) => acc + line.product.price * (line.qty || 1), 0);
  const checkoutMrpTotal = checkoutItems.reduce((acc, line) => acc + line.product.mrp * (line.qty || 1), 0);
  const checkoutCount = checkoutItems.reduce((acc, line) => acc + (line.qty || 1), 0);

  const checkoutGstTotal = checkoutItems.reduce((acc, line) => {
    const rate = getProductGstRate(line.product);
    return acc + Math.round((line.product.price * (line.qty || 1) * rate) / 100);
  }, 0);

  const deliveryCharge = checkoutSubtotal > 499 ? 0 : checkoutItems.length > 0 ? 40 : 0;
  const finalPayable = Math.max(0, checkoutSubtotal + checkoutGstTotal + platformFee + deliveryCharge - couponDiscountAmount);
  const totalSavings = (checkoutMrpTotal - checkoutSubtotal) + couponDiscountAmount;

  const selectedAddressObj =
    addresses.find((a) => a.id === selectedAddrId) || addresses[0] || {
      id: "addr-1",
      name: user?.name || "Kartly User",
      phone: "9999999999",
      house: "Flat 402",
      street: "Road No. 12",
      city: "Hyderabad",
      state: "Telangana",
      pincode: pincode || "500034",
      type: "home",
    };

  // Address Management State
  const [editingAddr, setEditingAddr] = React.useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [pincodeState, setPincodeState] = React.useState<{ status: "idle" | "loading" | "valid" | "invalid"; message: string }>({ status: "idle", message: "" });
  const [isLocating, setIsLocating] = React.useState(false);

  const checkPincode = async (pincode: string) => {
    const trimmed = String(pincode || "").trim();
    if (!trimmed || trimmed.length !== 6 || !/^\d{6}$/.test(trimmed) || trimmed.startsWith("0")) {
      setPincodeState({ status: "invalid", message: "❌ Invalid PIN code. Must be 6 digits." });
      return false;
    }
    setPincodeState({ status: "loading", message: "Checking delivery availability..." });
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${trimmed}`);
      if (!res.ok) {
        setPincodeState({ status: "invalid", message: "❌ Delivery Currently Unavailable" });
        return false;
      }
      const data = await res.json();
      if (data && data[0] && data[0].Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        setPincodeState({ status: "valid", message: "✓ Delivery Available" });
        return true;
      } else {
        setPincodeState({ status: "invalid", message: "❌ Delivery Currently Unavailable" });
        return false;
      }
    } catch (e) {
      setPincodeState({ status: "invalid", message: "❌ Delivery Currently Unavailable" });
      return false;
    }
  };

  const handleGetCurrentLocation = (isEditing = false) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const updateObj = {
              city: data.address.city || data.address.state_district || data.address.town || "",
              state: data.address.state || "",
              pincode: data.address.postcode || "",
              street: data.address.road || data.address.suburb || "",
            };
            if (isEditing && editingAddr) {
              setEditingAddr({ ...editingAddr, ...updateObj });
            } else {
              setNewAddr((prev) => ({ ...prev, ...updateObj }));
            }
            if (updateObj.pincode) checkPincode(updateObj.pincode);
            toast.success("Location fetched successfully!");
          }
        } catch (e) {
          toast.error("Failed to fetch address from location");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to retrieve your location. Please check permissions.");
      }
    );
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name.trim() || !newAddr.phone.trim() || !newAddr.house.trim() || !newAddr.street.trim() || !newAddr.pincode.trim()) {
      toast.error("Please fill in all required address fields!");
      return;
    }
    const isValidPin = await checkPincode(newAddr.pincode);
    if (!isValidPin) {
      toast.error("❌ Delivery Currently Unavailable for this PIN code.");
      return;
    }
    const newId = `addr-${Date.now()}`;
    addAddress({ ...newAddr });
    setSelectedAddrId(newId);
    setShowAddAddressForm(false);
    toast.success("New address added and selected as delivery location!");
    setNewAddr({
      name: user?.name || "Kartly Customer",
      phone: user?.phone || "9999999999",
      house: "",
      street: "",
      city: "Hyderabad",
      state: "Telangana",
      pincode: pincode || "500034",
      type: "home",
    });
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddr) return;
    if (!editingAddr.name.trim() || !editingAddr.phone.trim() || !editingAddr.house.trim() || !editingAddr.street.trim() || !editingAddr.pincode.trim()) {
      toast.error("Please fill in all required address fields!");
      return;
    }
    const isValidPin = await checkPincode(editingAddr.pincode);
    if (!isValidPin) {
      toast.error("❌ Delivery Currently Unavailable for this PIN code.");
      return;
    }
    editAddress(editingAddr.id, editingAddr);
    setEditingAddr(null);
    toast.success("Address updated successfully!");
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteAddress(deleteConfirmId);
    if (selectedAddrId === deleteConfirmId) {
      const remaining = addresses.filter((a) => a.id !== deleteConfirmId);
      if (remaining.length > 0 && remaining[0]) {
        setSelectedAddrId(remaining[0].id);
      }
    }
    setDeleteConfirmId(null);
    toast.success("Address deleted successfully!");
  };

  const handleConfirmOrder = async () => {
    // Step 2 Validation: Check cart items exist
    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("Your checkout is empty! Add products before placing an order.");
      return;
    }

    // Step 2 Validation: Check address is selected
    if (!selectedAddrId || !selectedAddressObj) {
      toast.error("Please select a delivery address!");
      return;
    }
    const pinStr = String(selectedAddressObj.pincode || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(pinStr)) {
      toast.error("❌ Delivery Currently Unavailable for this PIN code.");
      return;
    }

    const isPinValid = await checkPincode(pinStr);
    if (!isPinValid) {
      toast.error("❌ Delivery Currently Unavailable for this PIN code. Order cannot be placed.");
      return;
    }

    // Step 2 Validation: Check payment method is selected
    if (!paymentMethod) {
      toast.error("Please select a payment method!");
      return;
    }

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      providerName:
        paymentMethod === "upi"
          ? upiProvider
          : paymentMethod === "netbanking"
          ? selectedBank
          : paymentMethod === "emi"
          ? "HDFC Credit Card EMI"
          : paymentMethod === "card"
          ? "Visa Debit Card"
          : "Cash on Delivery",
      upiId: upiIdInput || "demo@ybl",
      cardNumberMasked: cardFields.number ? `•••• ${cardFields.number.slice(-4)}` : "•••• 4242",
      emiTenureMonths: emiTenure,
      emiMonthlyAmount: Math.round(finalPayable / emiTenure),
    };

    // Step 3: Create Order
    const newOrder = placeOrder(paymentDetails, selectedAddrId);
    if (!newOrder) {
      toast.error("Failed to create order. Please try again.");
      return;
    }

    // Save order ID to localStorage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kartly.lastOrderId", newOrder.id);
      }
    } catch {}

    // Step 4: Routing based on payment method
    if (paymentMethod === "cod") {
      // Cash on delivery: redirect directly to Order Success page
      toast.success("Order Placed Successfully!");
      router.navigate({ to: "/order-success", search: { orderId: newOrder.id } });
    } else {
      // Online payment required: redirect to Payment page
      toast.info("Proceeding to payment gateway...");
      router.navigate({ to: "/payment", search: { orderId: newOrder.id } });
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <SiteHeader />
        <main className="mx-auto max-w-[1400px] px-4 py-16 text-center space-y-4">
          <ShoppingBag className="mx-auto size-16 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground">Your checkout is empty</h2>
          <p className="text-sm text-muted-foreground">
            Add items to cart or click "Buy Now" on a product before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand px-6 py-2.5 text-sm font-bold text-primary-foreground rounded-md shadow-xs"
          >
            Return to Store
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1300px] px-4 py-6 space-y-6">
        {/* Checkout Header Progress Bar */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-bold">
            <div className="flex items-center gap-2 text-brand">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-primary-foreground font-extrabold text-[11px]">
                1
              </span>
              <span>Account</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground opacity-50" />
            <div className={`flex items-center gap-2 ${activeStep >= 2 ? "text-brand" : "text-muted-foreground"}`}>
              <span className={`flex size-6 items-center justify-center rounded-full font-extrabold text-[11px] ${activeStep >= 2 ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </span>
              <span>Delivery Address</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground opacity-50" />
            <div className={`flex items-center gap-2 ${activeStep >= 3 ? "text-brand" : "text-muted-foreground"}`}>
              <span className={`flex size-6 items-center justify-center rounded-full font-extrabold text-[11px] ${activeStep >= 3 ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                3
              </span>
              <span>Order Summary</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground opacity-50" />
            <div className={`flex items-center gap-2 ${activeStep >= 4 ? "text-brand" : "text-muted-foreground"}`}>
              <span className={`flex size-6 items-center justify-center rounded-full font-extrabold text-[11px] ${activeStep >= 4 ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                4
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          {/* Main Steps Accordion Container */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Logged In Account Info */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span>1. Logged In User</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {user?.name} ({user?.phone})
                </span>
              </div>
            </div>

            {/* Step 2: Delivery Address Selection */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <MapPin className="size-4 text-brand" />
                  2. Select Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAddressForm(!showAddAddressForm);
                    setEditingAddr(null);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Add New Address
                </button>
              </div>

              {/* Add New Address Form Panel */}
              {showAddAddressForm && (
                <form onSubmit={handleSaveAddress} className="rounded-xl border border-brand/40 bg-brand/5 p-4 sm:p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-brand/20 pb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="size-3.5 text-brand" /> Add New Delivery Address
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleGetCurrentLocation(false)}
                        disabled={isLocating}
                        className="flex items-center gap-1 text-[10px] bg-brand/10 text-brand font-bold px-2 py-1 rounded hover:bg-brand/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <MapPin className="size-3" />
                        {isLocating ? "Locating..." : "Use Current Location"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Mobile Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="10-digit mobile number"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Flat / House No. / Building <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 402, Sai Vardhini Heights"
                        value={newAddr.house}
                        onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Street Address / Locality <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Road No. 12, Banjara Hills"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        City <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        State <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1">
                        <span>Pincode <span className="text-destructive">*</span></span>
                        {pincodeState.status !== "idle" && !editingAddr && (
                          <span className={`text-[9px] ${pincodeState.status === "valid" ? "text-emerald-500" : pincodeState.status === "invalid" ? "text-destructive" : "text-brand"}`}>
                            {pincodeState.message}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="6-digit pincode"
                        value={newAddr.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setNewAddr({ ...newAddr, pincode: val });
                          setPincodeState({ status: "idle", message: "" });
                          if (val.length === 6) checkPincode(val);
                        }}
                        className={`w-full rounded-lg border bg-background p-2.5 text-foreground focus:outline-none ${
                          !editingAddr && pincodeState.status === "invalid" ? "border-destructive focus:border-destructive" : !editingAddr && pincodeState.status === "valid" ? "border-emerald-500 focus:border-emerald-500" : "border-border focus:border-brand"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Address Type
                      </label>
                      <div className="flex gap-2 pt-0.5">
                        {(["home", "work", "other"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewAddr({ ...newAddr, type: t })}
                            className={`flex-1 py-2 rounded-md border text-xs font-bold uppercase transition-all cursor-pointer ${
                              newAddr.type === t
                                ? "border-brand bg-brand text-primary-foreground font-black"
                                : "border-border bg-background text-foreground hover:border-brand/40"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-brand px-5 py-2.5 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer transition-all shadow-sm"
                      >
                        Save & Use Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(false)}
                        className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Edit Existing Address Panel */}
              {editingAddr && (
                <form onSubmit={handleUpdateAddress} className="rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-4 sm:p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Edit className="size-3.5 text-blue-600" /> Edit Delivery Address
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleGetCurrentLocation(true)}
                        disabled={isLocating}
                        className="flex items-center gap-1 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <MapPin className="size-3" />
                        {isLocating ? "Locating..." : "Use Current Location"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAddr(null)}
                      className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.name}
                        onChange={(e) => setEditingAddr({ ...editingAddr, name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Mobile Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.phone}
                        onChange={(e) => setEditingAddr({ ...editingAddr, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Flat / House No. / Building <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.house}
                        onChange={(e) => setEditingAddr({ ...editingAddr, house: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Street Address / Locality <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.street}
                        onChange={(e) => setEditingAddr({ ...editingAddr, street: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        City <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.city}
                        onChange={(e) => setEditingAddr({ ...editingAddr, city: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        State <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddr.state}
                        onChange={(e) => setEditingAddr({ ...editingAddr, state: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1">
                        <span>Pincode <span className="text-destructive">*</span></span>
                        {pincodeState.status !== "idle" && editingAddr && (
                          <span className={`text-[9px] ${pincodeState.status === "valid" ? "text-emerald-500" : pincodeState.status === "invalid" ? "text-destructive" : "text-brand"}`}>
                            {pincodeState.message}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={editingAddr.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setEditingAddr({ ...editingAddr, pincode: val });
                          setPincodeState({ status: "idle", message: "" });
                          if (val.length === 6) checkPincode(val);
                        }}
                        className={`w-full rounded-lg border bg-background p-2.5 text-foreground focus:outline-none ${
                          editingAddr && pincodeState.status === "invalid" ? "border-destructive focus:border-destructive" : editingAddr && pincodeState.status === "valid" ? "border-emerald-500 focus:border-emerald-500" : "border-border focus:border-brand"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Address Type
                      </label>
                      <div className="flex gap-2 pt-0.5">
                        {(["home", "work", "other"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditingAddr({ ...editingAddr, type: t })}
                            className={`flex-1 py-2 rounded-md border text-xs font-bold uppercase transition-all cursor-pointer ${
                              editingAddr.type === t
                                ? "border-brand bg-brand text-primary-foreground font-black"
                                : "border-border bg-background text-foreground hover:border-brand/40"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-5 py-2.5 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer transition-all shadow-sm"
                    >
                      Update Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAddr(null)}
                      className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Address Confirmation Modal */}
              {deleteConfirmId && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-destructive font-black text-xs uppercase tracking-wider">
                    <AlertCircle className="size-4" /> Confirm Delete Address
                  </div>
                  <p className="text-xs text-foreground font-medium">
                    Are you sure you want to delete this address? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="rounded-lg bg-destructive px-4 py-2 text-xs font-black text-destructive-foreground hover:opacity-90 cursor-pointer shadow-sm"
                    >
                      Yes, Delete Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Address Cards */}
              {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
                  <MapPin className="size-10 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground">
                    No delivery address saved yet
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Please add a delivery address to proceed with your purchase.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-black text-primary-foreground hover:bg-brand-deep cursor-pointer"
                  >
                    <Plus className="size-4" /> Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddrId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddrId(addr.id);
                          selectDeliveryAddress(addr);
                          setActiveStep(3);
                        }}
                        className={`relative flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand bg-brand/5 ring-1 ring-brand shadow-2xs"
                            : "border-border bg-card hover:border-brand/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryAddress"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedAddrId(addr.id);
                            selectDeliveryAddress(addr);
                            setActiveStep(3);
                          }}
                          className="mt-1 size-4 text-brand accent-brand cursor-pointer"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-foreground text-sm">{addr.name}</span>
                              <span className="uppercase text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                {addr.type}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
                                  DEFAULT
                                </span>
                              )}
                            </div>

                            {/* Card Action Controls: Set Default, Edit, Delete */}
                            <div className="flex items-center gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => setDefaultAddress(addr.id)}
                                  className="text-[11px] font-bold text-muted-foreground hover:text-brand transition-colors cursor-pointer"
                                  title="Mark as default delivery address"
                                >
                                  Set as Default
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAddr(addr);
                                  setShowAddAddressForm(false);
                                }}
                                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer p-0.5"
                                title="Edit this address"
                              >
                                <Edit className="size-3.5" /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(addr.id)}
                                className="inline-flex items-center gap-1 font-bold text-destructive hover:opacity-80 transition-opacity cursor-pointer p-0.5"
                                title="Delete this address"
                              >
                                <Trash2 className="size-3.5" /> Delete
                              </button>
                            </div>
                          </div>

                          <p className="text-foreground/90 font-medium leading-relaxed">
                            {addr.house}, {addr.street}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.city}, {addr.state} - <strong className="text-foreground font-bold">{addr.pincode}</strong>
                          </p>
                          <p className="text-muted-foreground font-medium">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Order Summary & Review */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Package className="size-4 text-brand" />
                  3. Order Items ({checkoutCount})
                </h2>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Truck className="size-3.5" />
                  Estimated Delivery in 3 Days
                </span>
              </div>

              <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((line) => (
                  <div key={line.product.id} className="flex items-center gap-3 py-2.5 text-xs">
                    <img
                      src={line.product.image}
                      alt={line.product.title}
                      className="size-12 object-contain border border-border rounded bg-muted p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{line.product.title}</p>
                      <p className="text-muted-foreground">Qty: {line.qty}</p>
                    </div>
                    <span className="font-bold text-foreground">
                      {inr(line.product.price * line.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Organized Payment Methods */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" />
                  4. Select Payment Method
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  100% secure payment gateway with SSL encryption
                </p>
              </div>

              {/* Payment Tabs */}
              <div className="space-y-3">
                {/* 1. UPI */}
                <div
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-lg border p-3.5 cursor-pointer transition-all ${
                    paymentMethod === "upi"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border bg-card hover:border-brand/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentGroup"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                        className="size-4 accent-brand cursor-pointer"
                      />
                      <Smartphone className="size-4 text-brand" />
                      <span className="text-xs font-bold text-foreground">UPI (PhonePe, GPay, Paytm)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <UpiPaymentWidget
                        payableAmount={finalPayable}
                        onPaymentSuccess={async (details) => {
                          if (!selectedAddrId || !selectedAddressObj) {
                            toast.error("Please select a delivery address!");
                            return;
                          }
                          const pinStr = String(selectedAddressObj.pincode || "").trim();
                          if (!/^[1-9][0-9]{5}$/.test(pinStr)) {
                            toast.error("❌ Delivery Currently Unavailable for this PIN code.");
                            return;
                          }
                          const isPinValid = await checkPincode(pinStr);
                          if (!isPinValid) {
                            toast.error("❌ Delivery Currently Unavailable for this PIN code. Order cannot be placed.");
                            return;
                          }
                          const paymentDetails: PaymentDetails = {
                            method: "upi",
                            providerName: details.providerName,
                            upiId: details.upiId,
                          };
                          const newOrder = placeOrder(paymentDetails, selectedAddrId);
                          if (newOrder) {
                            try {
                              if (typeof window !== "undefined") {
                                window.localStorage.setItem("kartly.lastOrderId", newOrder.id);
                              }
                            } catch {}
                            router.navigate({ to: "/order-success", search: { orderId: newOrder.id } });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-lg border p-3.5 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border bg-card hover:border-brand/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentGroup"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="size-4 accent-brand cursor-pointer"
                    />
                    <CreditCard className="size-4 text-brand" />
                    <span className="text-xs font-bold text-foreground">Credit / Debit / ATM Card</span>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-3 pt-3 border-t border-border/60 space-y-2 max-w-md text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8921"
                          value={cardFields.number}
                          onChange={(e) => setCardFields({ ...cardFields, number: e.target.value })}
                          className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardFields.expiry}
                            onChange={(e) => setCardFields({ ...cardFields, expiry: e.target.value })}
                            className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardFields.cvv}
                            onChange={(e) => setCardFields({ ...cardFields, cvv: e.target.value })}
                            className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Net Banking */}
                <div
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`rounded-lg border p-3.5 cursor-pointer transition-all ${
                    paymentMethod === "netbanking"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border bg-card hover:border-brand/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentGroup"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="size-4 accent-brand cursor-pointer"
                    />
                    <Building2 className="size-4 text-brand" />
                    <span className="text-xs font-bold text-foreground">Net Banking</span>
                  </div>

                  {paymentMethod === "netbanking" && (
                    <div className="mt-3 pt-3 border-t border-border/60 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank"].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                              selectedBank === b
                                ? "border-brand bg-brand text-primary-foreground font-bold"
                                : "border-border bg-background text-foreground hover:border-brand"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Credit Card EMI */}
                <div
                  onClick={() => setPaymentMethod("emi")}
                  className={`rounded-lg border p-3.5 cursor-pointer transition-all ${
                    paymentMethod === "emi"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border bg-card hover:border-brand/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentGroup"
                        checked={paymentMethod === "emi"}
                        onChange={() => setPaymentMethod("emi")}
                        className="size-4 accent-brand cursor-pointer"
                      />
                      <Calendar className="size-4 text-brand" />
                      <span className="text-xs font-bold text-foreground">EMI (Easy Monthly Installments)</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                      No Cost EMI Available
                    </span>
                  </div>

                  {paymentMethod === "emi" && (
                    <div className="mt-3 pt-3 border-t border-border/60 text-xs space-y-2">
                      <p className="text-muted-foreground">Select EMI Tenure:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[3, 6, 9, 12].map((m) => {
                          const perMonth = Math.round(finalPayable / m);
                          const isSel = emiTenure === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setEmiTenure(m)}
                              className={`p-2 rounded border text-left cursor-pointer transition-all ${
                                isSel
                                  ? "border-brand bg-brand/10 text-brand font-bold ring-1 ring-brand"
                                  : "border-border bg-background text-foreground hover:border-brand"
                              }`}
                            >
                              <div className="font-extrabold">{m} Months</div>
                              <div className="text-[11px]">{inr(perMonth)}/mo</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-lg border p-3.5 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-border bg-card hover:border-brand/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentGroup"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="size-4 accent-brand cursor-pointer"
                      />
                      <Truck className="size-4 text-brand" />
                      <span className="text-xs font-bold text-foreground">Cash on Delivery (COD)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Price Breakdown & Action */}
          <div className="lg:col-span-1 sticky top-20 space-y-4 font-sans">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-3 uppercase tracking-wide flex items-center justify-between">
                <span>Bill Detailed Breakdown</span>
                <span className="text-[11px] font-semibold text-muted-foreground lowercase font-normal">
                  ({checkoutCount} items)
                </span>
              </h2>

              <div className="space-y-3 text-xs">
                {/* Item Total */}
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Item Total</span>
                  <span className="font-semibold text-foreground">{inr(checkoutSubtotal)}</span>
                </div>

                {/* GST & Statutory Taxes line with Clickable Popup Trigger */}
                <div className="flex justify-between items-center text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setIsGstModalOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer group text-left"
                    title="Click to view detailed per-product GST breakdown"
                  >
                    <span className="underline decoration-dotted underline-offset-4 font-medium">
                      GST & Statutory Taxes
                    </span>
                    <span className="bg-brand/10 text-brand rounded-full p-0.5 group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                      <Info className="size-3.5" />
                    </span>
                  </button>
                  <span className="font-semibold text-brand">+{inr(checkoutGstTotal)}</span>
                </div>

                {/* Platform Fee line with Clickable Popup Trigger */}
                <div className="flex justify-between items-center text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setIsPlatformModalOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer group text-left"
                    title="Click to view platform fee details"
                  >
                    <span className="underline decoration-dotted underline-offset-4 font-medium">
                      Platform Fee
                    </span>
                    <span className="bg-brand/10 text-brand rounded-full p-0.5 group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                      <Info className="size-3.5" />
                    </span>
                  </button>
                  <span className="font-semibold text-foreground">+{inr(platformFee)}</span>
                </div>

                {/* Delivery Fee */}
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Delivery Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">{inr(deliveryCharge)}</span>
                  )}
                </div>

                {/* Coupon Discount if applied */}
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-200/50">
                    <span className="flex items-center gap-1">
                      <Tag className="size-3.5" /> Coupon ({appliedCoupon?.code})
                    </span>
                    <span>-{inr(couponDiscountAmount)}</span>
                  </div>
                )}

                {/* Final Payable Amount line */}
                <div className="border-t border-dashed border-border pt-3.5 flex justify-between items-center font-black text-foreground">
                  <div className="space-y-0.5">
                    <span className="text-sm uppercase tracking-wider block">To Pay</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Inclusive of all taxes & charges
                    </span>
                  </div>
                  <span className="text-xl text-brand font-black">{inr(finalPayable)}</span>
                </div>
              </div>

              {/* Savings Badge */}
              {totalSavings > 0 && (
                <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold p-2.5 rounded-lg text-center border border-emerald-200/80 flex items-center justify-center gap-1.5 shadow-2xs">
                  <span>🎉</span> You save <span className="underline font-extrabold">{inr(totalSavings)}</span> on this order!
                </div>
              )}

              {/* Delivery Address Summary preview */}
              <div className="border-t border-border pt-3 text-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Delivering To:
                </span>
                <p className="font-bold text-foreground truncate">{selectedAddressObj.name}</p>
                <p className="text-muted-foreground line-clamp-1">
                  {selectedAddressObj.house}, {selectedAddressObj.street}, {selectedAddressObj.city} - {selectedAddressObj.pincode}
                </p>
              </div>

              <button
                onClick={handleConfirmOrder}
                className="w-full rounded-xl bg-brand py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md transition-all hover:bg-brand-deep cursor-pointer hover:scale-[1.01]"
              >
                Confirm & Place Order
              </button>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 text-xs flex items-center gap-2.5 shadow-2xs">
              <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-tight">
                Safe and Secure Payments. Easy returns within 7 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamic Swiggy/Zomato Style Interactive Popups */}
      <GstBreakdownModal
        isOpen={isGstModalOpen}
        onClose={() => setIsGstModalOpen(false)}
        items={checkoutItems}
        gstTotal={checkoutGstTotal}
      />

      <PlatformFeeModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        feeAmount={platformFee}
      />

      <SiteFooter />
    </div>
  );
}
