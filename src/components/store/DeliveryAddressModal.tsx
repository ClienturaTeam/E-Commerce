import * as React from "react";
import {
  MapPin,
  X,
  Plus,
  Home,
  Building2,
  Navigation,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Search,
  Sparkles,
  Loader2,
  Trash2,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, type Address } from "./store-context";

// Known Indian Metro Hubs for instant one-click selection
const POPULAR_METROS = [
  { city: "Bengaluru", state: "Karnataka", pincode: "560001", tag: "Tech Capital" },
  { city: "Hyderabad", state: "Telangana", pincode: "500034", tag: "Cyberabad" },
  { city: "Mumbai", state: "Maharashtra", pincode: "400001", tag: "Financial Hub" },
  { city: "New Delhi", state: "Delhi", pincode: "110001", tag: "Capital NCR" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001", tag: "Automotive Hub" },
  { city: "Pune", state: "Maharashtra", pincode: "411001", tag: "Oxford of East" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001", tag: "Cultural Hub" },
];

export function DeliveryAddressModal() {
  const {
    isAddressModalOpen,
    closeAddressModal,
    addresses,
    selectedAddressId,
    selectDeliveryAddress,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    pincode,
    setPincode,
    deliveryCity,
    setDeliveryCity,
    user,
    openAuthModal,
  } = useStore();

  const [activeTab, setActiveTab] = React.useState<"saved" | "pincode" | "new">("saved");

  // Pincode Lookup Form State
  const [pinInput, setPinInput] = React.useState(pincode || "560001");
  const [isVerifyingPin, setIsVerifyingPin] = React.useState(false);
  const [pinLookupResult, setPinLookupResult] = React.useState<{
    success: boolean;
    city?: string;
    state?: string;
    pincode?: string;
    message?: string;
  } | null>(null);

  // GPS Geolocation State
  const [isLocating, setIsLocating] = React.useState(false);

  // New Address Form State
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newAddr, setNewAddr] = React.useState({
    name: user?.name || "Kartly Customer",
    phone: user?.phone || "9999999999",
    house: "",
    street: "",
    landmark: "",
    city: deliveryCity || "Bengaluru",
    state: "Karnataka",
    pincode: pincode || "560001",
    type: "home" as "home" | "work" | "other",
    isDefault: false,
  });
  const [isResolvingFormPin, setIsResolvingFormPin] = React.useState(false);

  // Sync PIN input with store pincode on open
  React.useEffect(() => {
    if (isAddressModalOpen) {
      setPinInput(pincode || "560001");
      setPinLookupResult(null);
    }
  }, [isAddressModalOpen, pincode]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isAddressModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAddressModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddressModalOpen, closeAddressModal]);

  if (!isAddressModalOpen) return null;

  // Verify Indian PIN Code via Postal API (with metro fallbacks)
  const handleVerifyPincode = async (targetPin?: string) => {
    const pin = (targetPin || pinInput).trim();
    if (!pin) {
      toast.error("Please enter a PIN code");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setPinLookupResult({
        success: false,
        message: "Please enter a valid 6-digit Indian PIN code",
      });
      return;
    }

    // Check offline metro list first
    const metro = POPULAR_METROS.find((m) => m.pincode === pin);
    if (metro) {
      setPincode(metro.pincode);
      setDeliveryCity(metro.city);
      setPinLookupResult({
        success: true,
        city: metro.city,
        state: metro.state,
        pincode: metro.pincode,
      });
      toast.success(`Delivery location updated to ${metro.city} (${metro.pincode})`);
      return;
    }

    setIsVerifyingPin(true);
    setPinLookupResult(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (!res.ok) throw new Error("Service temporarily unavailable");
      const data = await res.json();

      if (
        data &&
        data[0] &&
        data[0].Status === "Success" &&
        Array.isArray(data[0].PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Name || "India";
        const state = po.State || "";
        setPincode(pin);
        setDeliveryCity(city);
        setPinLookupResult({
          success: true,
          city,
          state,
          pincode: pin,
        });
        toast.success(`Delivery location updated to ${city}, ${state} (${pin})`);
      } else {
        setPinLookupResult({
          success: false,
          message: "PIN code not serviceable or invalid. Please check and try again.",
        });
      }
    } catch (err) {
      // Fallback graceful set
      setPincode(pin);
      setPinLookupResult({
        success: true,
        city: "Standard Delivery Zone",
        pincode: pin,
      });
      toast.success(`Delivery PIN code set to ${pin}`);
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedPin =
            addr.postcode?.replace(/\D/g, "").slice(0, 6) ||
            pincode ||
            "560001";
          const detectedCity =
            addr.city || addr.town || addr.county || addr.state_district || "Current Location";
          const detectedState = addr.state || "";

          setPincode(detectedPin);
          setDeliveryCity(detectedCity);
          setPinInput(detectedPin);
          toast.success("Location detected via GPS!", {
            description: `${detectedCity}, ${detectedState} - ${detectedPin}`,
          });
          closeAddressModal();
        } catch (e) {
          toast.info("Coordinates detected! Defaulting to regional dispatch hub.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter your PIN code manually.");
        } else {
          toast.error("Unable to retrieve your location. Please enter PIN code.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auto-resolve city/state for new address when PIN code is entered
  const handleFormPinChange = async (pinVal: string) => {
    const clean = pinVal.replace(/\D/g, "").slice(0, 6);
    setNewAddr((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      // Check offline popular metros first
      const metro = POPULAR_METROS.find((m) => m.pincode === clean);
      if (metro) {
        setNewAddr((prev) => ({ ...prev, city: metro.city, state: metro.state }));
        return;
      }

      setIsResolvingFormPin(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.[0]) {
          const po = data[0].PostOffice[0];
          setNewAddr((prev) => ({
            ...prev,
            city: po.District || po.Name || prev.city,
            state: po.State || prev.state,
          }));
        }
      } catch {}
      setIsResolvingFormPin(false);
    }
  };

  // Submit New Address
  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name.trim() || !newAddr.phone.trim() || !newAddr.house.trim() || !newAddr.pincode.trim()) {
      toast.error("Please fill in all required fields (Name, Phone, Flat/House, PIN code)");
      return;
    }

    addAddress({
      name: newAddr.name.trim(),
      phone: newAddr.phone.trim(),
      house: newAddr.house.trim(),
      street: newAddr.street.trim() || "Main Street",
      city: newAddr.city.trim() || "City",
      state: newAddr.state.trim() || "State",
      pincode: newAddr.pincode.trim(),
      type: newAddr.type,
      isDefault: newAddr.isDefault,
    });

    setIsAddingNew(false);
    closeAddressModal();
  };

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAddressModal();
      }}
    >
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-xs">
              <MapPin className="size-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Choose your delivery location</h2>
              <p className="text-xs text-muted-foreground">
                Select an address or PIN code to see delivery availability and shipping rates
              </p>
            </div>
          </div>
          <button
            onClick={closeAddressModal}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close delivery address modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-5 pt-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("saved");
              setIsAddingNew(false);
            }}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === "saved"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="size-3.5" />
            Saved Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab("pincode")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 transition-colors cursor-pointer ${
              activeTab === "pincode"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="size-3.5" />
            Enter PIN Code
          </button>

          <button
            onClick={() => {
              setActiveTab("saved");
              setIsAddingNew(true);
            }}
            className="ml-auto flex items-center gap-1 text-xs text-accent hover:underline py-2.5 cursor-pointer font-medium"
          >
            <Plus className="size-3.5" />
            Add New Address
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 [scrollbar-width:thin]">
          {/* Quick GPS Location Bar */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3.5 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                {isLocating ? (
                  <Loader2 className="size-4 animate-spin text-accent" />
                ) : (
                  <Navigation className="size-4 text-accent" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Use My Current Location</p>
                <p className="text-muted-foreground text-[11px]">
                  Using GPS coordinates to find your nearest dispatch center
                </p>
              </div>
            </div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isLocating ? "Detecting..." : "Detect Location"}
            </button>
          </div>

          {/* TAB 1: SAVED ADDRESSES */}
          {activeTab === "saved" && !isAddingNew && (
            <div className="space-y-4">
              {/* Guest Sign-In Banner */}
              {(!user || !user.isAuth) && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">Sign in for personalized delivery</p>
                    <p className="text-muted-foreground text-[11px]">
                      Access your saved addresses across devices & track deliveries faster.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeAddressModal();
                      openAuthModal("Sign in to view and manage your saved addresses.");
                    }}
                    className="rounded-lg bg-foreground text-background px-3 py-1.5 font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Addresses List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Available Delivery Addresses
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Currently delivering to:{" "}
                    <strong className="text-accent font-semibold">
                      {activeAddress?.city || deliveryCity} ({pincode})
                    </strong>
                  </span>
                </div>

                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId || addr.pincode === pincode;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        selectDeliveryAddress(addr);
                        closeAddressModal();
                      }}
                      className={`group relative flex flex-col gap-2 rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent/5 ring-1 ring-accent shadow-xs"
                          : "border-border bg-card hover:border-accent/40 hover:bg-muted/30"
                      }`}
                    >
                      {/* Top Row: Type Badge + Selected Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                            {addr.type === "work" ? (
                              <Building2 className="size-3 text-brand" />
                            ) : (
                              <Home className="size-3 text-accent" />
                            )}
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                              Default
                            </span>
                          )}
                        </div>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent">
                            <Check className="size-3.5 stroke-[3]" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Click to deliver here →
                          </span>
                        )}
                      </div>

                      {/* Recipient Details */}
                      <div className="text-xs">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {addr.name}
                          <span className="text-muted-foreground font-normal">({addr.phone})</span>
                        </div>
                        <p className="mt-1 text-muted-foreground leading-relaxed">
                          {addr.house}, {addr.street}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""},{" "}
                          <strong className="text-foreground">{addr.city}</strong>, {addr.state} —{" "}
                          <span className="font-mono font-bold text-accent">{addr.pincode}</span>
                        </p>
                      </div>

                      {/* Action Row */}
                      <div className="mt-1 flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Truck className="size-3.5" />
                          Delivery in 2-3 days
                        </div>
                        <div className="flex items-center gap-3">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultAddress(addr.id);
                              }}
                              className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="size-3" /> Set Default
                            </button>
                          )}
                          {addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(addr.id);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="size-3" /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Button */}
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer"
              >
                <Plus className="size-4" />
                Add a New Delivery Address
              </button>
            </div>
          )}

          {/* TAB 1 SUB-VIEW: ADD NEW ADDRESS FORM */}
          {activeTab === "saved" && isAddingNew && (
            <form onSubmit={handleAddNewAddress} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Add Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ← Back to Saved Addresses
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kartly User"
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Flat, House no., Building, Apartment *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Sai Vardhini Heights"
                    value={newAddr.house}
                    onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Area, Street, Sector, Village *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Road No. 12, Banjara Hills"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 500034"
                      value={newAddr.pincode}
                      onChange={(e) => handleFormPinChange(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent font-mono"
                    />
                    {isResolvingFormPin && (
                      <Loader2 className="absolute right-3 top-2.5 size-3.5 animate-spin text-accent" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near City Center Mall"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Town / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telangana"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Address Type Selection */}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {(["home", "work", "other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewAddr({ ...newAddr, type: t })}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        newAddr.type === t
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "home" && <Home className="size-3" />}
                      {t === "work" && <Building2 className="size-3" />}
                      {t === "other" && <MapPin className="size-3" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Default Checkbox */}
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Make this my default delivery address</span>
              </label>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PIN CODE LOOKUP */}
          {activeTab === "pincode" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Enter an Indian PIN Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="e.g. 560001"
                      value={pinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setPinInput(val);
                        setPinLookupResult(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVerifyPincode();
                      }}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-accent font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleVerifyPincode()}
                    disabled={isVerifyingPin || pinInput.length !== 6}
                    className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingPin && <Loader2 className="size-3.5 animate-spin" />}
                    Check & Apply
                  </button>
                </div>
              </div>

              {/* Lookup Result Feedback */}
              {pinLookupResult && (
                <div
                  className={`rounded-xl border p-4 text-xs ${
                    pinLookupResult.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {pinLookupResult.success ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                        Delivery Available to {pinLookupResult.city} ({pinLookupResult.pincode})
                      </div>
                      <p className="text-[11px] opacity-90">
                        ⚡ Standard delivery: 2-3 business days. COD & Express shipping active.
                      </p>
                      <button
                        onClick={closeAddressModal}
                        className="mt-2 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white px-3 py-1 font-semibold text-[11px] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Continue Shopping with this PIN →
                      </button>
                    </div>
                  ) : (
                    <p className="font-semibold">{pinLookupResult.message}</p>
                  )}
                </div>
              )}

              {/* Popular Indian Metro Hubs */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Popular Metro Delivery Hubs
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_METROS.map((metro) => {
                    const isCurrent = pincode === metro.pincode;
                    return (
                      <button
                        key={metro.pincode}
                        type="button"
                        onClick={() => {
                          setPinInput(metro.pincode);
                          handleVerifyPincode(metro.pincode);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isCurrent
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border bg-card hover:border-accent/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between text-xs font-bold text-foreground">
                          {metro.city}
                          {isCurrent && <Check className="size-3 text-accent" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] font-semibold text-accent">
                            {metro.pincode}
                          </span>
                          <span className="text-[10px] text-muted-foreground">• {metro.state}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Assurance */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" /> Safe & Contactless Delivery
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Truck className="size-3.5 text-accent" /> Free shipping on orders &gt; ₹499
            </span>
          </div>
          <button
            onClick={closeAddressModal}
            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
