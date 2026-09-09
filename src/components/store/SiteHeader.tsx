import * as React from "react";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Search,
  ShoppingCart,
  Store,
  UserRound,
  X,
  Mic,
  Camera,
  Heart,
  Package,
  MapPinCheck,
  Wallet,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories, products, inr } from "./catalog";
import { AuthDialog } from "./AuthDialog";
import { DeliveryAddressModal } from "./DeliveryAddressModal";
import { CameraSearchDialog } from "./CameraSearchDialog";
import { VoiceSearchDialog } from "./VoiceSearchDialog";
import { UserWalletModal, getSavedWalletState } from "./UserWalletModal";
import { useStore } from "./store-context";
import { useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";

export function SiteHeader() {
  const navigate = useNavigate();
  const { user: entUser, logout: entLogout, isAuthenticated: entAuth } = useEnterpriseAuth();
  const {
    query,
    setQuery,
    category,
    setCategory,
    cartCount,
    setCartOpen,
    user,
    signOut,
    openAuthModal,
    pincode,
    setPincode,
    wishlist,
    orders,
    addresses,
    selectedAddressId,
    deliveryCity,
    openAddressModal,
  } = useStore();

  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [walletTab, setWalletTab] = React.useState<"overview" | "add" | "refund" | "transactions">("overview");
  const [walletBalance, setWalletBalance] = React.useState(() => {
    try {
      return getSavedWalletState().balance;
    } catch {
      return 2450;
    }
  });

  React.useEffect(() => {
    const updateBalance = (e: any) => {
      if (e.detail?.balance !== undefined) {
        setWalletBalance(e.detail.balance);
      } else {
        try {
          setWalletBalance(getSavedWalletState().balance);
        } catch {}
      }
    };
    window.addEventListener("kartly_wallet_updated", updateBalance);
    return () => window.removeEventListener("kartly_wallet_updated", updateBalance);
  }, []);

  const activeAddress = React.useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  const displayDeliveryTarget = React.useMemo(() => {
    if (activeAddress?.city) {
      return `${activeAddress.city} ${activeAddress.pincode || pincode}`;
    }
    return `${deliveryCity || "India"} ${pincode || "560001"}`;
  }, [activeAddress, deliveryCity, pincode]);

  const location = useLocation();

  const activeCategory = React.useMemo(() => {
    const path = (location.pathname || "").toLowerCase();
    if (path === "/" || path === "/for-you") return "For You";
    if (path.startsWith("/fashion")) return "Fashion";
    if (path.startsWith("/mobiles")) return "Mobiles";
    if (path.startsWith("/electronics")) return "Electronics";
    if (path.startsWith("/beauty")) return "Beauty";
    if (path.startsWith("/home")) return "Home";
    if (path.startsWith("/appliances")) return "Appliances";
    if (path.startsWith("/toys-gifts") || path.startsWith("/toys")) return "Toys & Gifts";
    if (path.startsWith("/grocery")) return "Grocery";
    if (path.startsWith("/sports")) return "Sports";
    if (path.startsWith("/books")) return "Books";

    if (path.startsWith("/category/")) {
      const rawCat = decodeURIComponent(location.pathname.replace(/^\/category\//i, ""));
      const match = categories.find((c) => c.toLowerCase() === rawCat.toLowerCase());
      if (match) return match;
    }

    return category || "For You";
  }, [location.pathname]);

  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(query);
  const [isListening, setIsListening] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => setDraft(query), [query]);

  // Live Search Suggestions Calculation
  const liveSuggestions = React.useMemo(() => {
    const term = draft.trim().toLowerCase();
    if (!term || term.length < 1) return [];
    return products
      .filter((p) => {
        const titleMatch = (p.title || "").toLowerCase().includes(term);
        const brandMatch = (p.brand || "").toLowerCase().includes(term);
        const catMatch = (p.category || "").toLowerCase().includes(term);
        const subMatch = (p.subCategory || "").toLowerCase().includes(term);
        return titleMatch || brandMatch || catMatch || subMatch;
      })
      .slice(0, 6);
  }, [draft]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = draft.trim();
    setQuery(term);
    setIsFocused(false);
    navigate({ to: "/search", search: { q: term } });
  };

  // Voice Search (Web Speech API)
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice search unsupported", {
        description: "Your browser does not support voice search.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast("Listening...", { description: "Speak now to search" });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDraft(transcript);
          setQuery(transcript);
          toast.success("Voice Search", { description: `Searching for "${transcript}"` });
          navigate({ to: "/search", search: { q: transcript } });
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Permission denied", {
            description: "Microphone permission was denied.",
          });
        } else {
          toast.error("Speech error", { description: "Could not recognize speech." });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      toast.error("Permission denied", {
        description: "Error accessing microphone.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-brand text-primary-foreground">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-2.5">
          <Link to="/" className="flex items-baseline gap-1.5 cursor-pointer">
            <span className="rounded-sm bg-accent px-2 py-0.5 text-lg font-black italic tracking-tight text-accent-foreground">
              Kartly
            </span>
            <span className="hidden text-[11px] italic opacity-80 sm:inline">Explore Plus</span>
          </Link>

          {/* Search Form Wrapper */}
          <div className="order-3 relative flex min-w-0 flex-1 flex-col md:order-none">
            <form
              className="flex items-center gap-2 rounded-sm bg-card px-3 py-2 border border-border/40 focus-within:border-brand shadow-sm"
              onSubmit={handleSearchSubmit}
            >
              <button type="submit" aria-label="Submit search" className="text-muted-foreground hover:text-brand cursor-pointer">
                <Search className="size-4 shrink-0" />
              </button>
              <input
                type="search"
                aria-label="Search for products, brands and more"
                placeholder={isListening ? "Listening..." : "Search for products, brands and more..."}
                value={draft}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft(val);
                  setQuery(val);
                  if (location.pathname === "/search") {
                    navigate({ to: "/search", search: { q: val } });
                  }
                }}
                className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground font-medium"
              />
              {draft && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setDraft("");
                    setQuery("");
                    if (location.pathname === "/search") {
                      navigate({ to: "/search", search: { q: "" } });
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}

              {/* Microphone Icon (Voice Search) */}
              <button
                type="button"
                aria-label="Voice search"
                onClick={() => setVoiceOpen(true)}
                className={`rounded-md p-1 text-muted-foreground hover:bg-brand/10 hover:text-brand transition-all cursor-pointer ${
                  voiceOpen ? "text-brand bg-brand/10 scale-110 animate-pulse" : ""
                }`}
                title="Search with Voice (Mic)"
              >
                <Mic className="size-4" />
              </button>

              {/* Camera Icon (Image Search) */}
              <button
                type="button"
                aria-label="Camera search"
                onClick={() => setCameraOpen(true)}
                className={`rounded-md p-1 text-muted-foreground hover:bg-brand/10 hover:text-brand transition-all cursor-pointer ${
                  cameraOpen ? "text-brand bg-brand/10 scale-110" : ""
                }`}
                title="Visual Image Search (Camera)"
              >
                <Camera className="size-4" />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {isFocused && draft.trim().length >= 1 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Matching Suggestions ({liveSuggestions.length})</span>
                  {liveSuggestions.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={() => handleSearchSubmit()}
                      className="text-brand hover:underline font-black cursor-pointer text-xs"
                    >
                      View all results →
                    </button>
                  )}
                </div>

                {liveSuggestions.length > 0 ? (
                  <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
                    {liveSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onMouseDown={() => {
                          setIsFocused(false);
                          navigate({ to: "/product/$id", params: { id: item.id } });
                        }}
                        className="p-2.5 flex items-center gap-3 hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="size-10 object-contain rounded bg-white p-0.5 border border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate text-foreground">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{item.brand} • {item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-foreground">{inr(item.price)}</span>
                          {item.mrp > item.price && (
                            <span className="block text-[10px] text-emerald-600 font-extrabold">
                              {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                    <p className="font-bold text-foreground">No matching products for "{draft}"</p>
                    <p className="text-[11px]">Press Enter or Search to see full store results.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium">
            {entAuth && entUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-colors hover:bg-brand-deep cursor-pointer">
                  <UserRound className="size-4" />
                  <span className="max-w-[120px] truncate">{entUser.name}</span>
                  <span className="text-[10px] bg-accent/30 text-accent font-extrabold px-1.5 py-0.5 rounded uppercase">
                    {entUser.role}
                  </span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={`/${entUser.role.toLowerCase().replace("_", "-")}/dashboard` as any} className="flex items-center gap-2 cursor-pointer w-full font-bold text-brand">
                      <Store className="size-4 text-brand" />
                      <span>{entUser.role.replace("_", " ")} Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center justify-between cursor-pointer w-full py-2">
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 text-brand" />
                        <span className="font-semibold text-xs">My Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full text-foreground">
                          {orders.length}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setWalletTab("main");
                      setIsWalletOpen(true);
                    }}
                    className="flex items-center justify-between cursor-pointer w-full py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="size-4 text-amber-500" />
                      <span className="font-bold text-xs">Kartly Wallet</span>
                    </div>
                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-2xs">
                      {inr(walletBalance)}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center justify-between cursor-pointer w-full py-2">
                      <div className="flex items-center gap-2.5">
                        <Heart className="size-4 text-rose-500" />
                        <span className="font-semibold text-xs">Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full text-foreground">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      entLogout();
                      signOut();
                    }}
                    className="cursor-pointer text-red-600 dark:text-red-400 font-bold py-2"
                  >
                    <LogOut className="size-4 mr-1.5" />
                    <span>Logout Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : user && user.isAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-brand-deep/80 border border-transparent hover:border-brand-deep cursor-pointer">
                  <div className="size-6 rounded-full bg-accent/20 text-accent font-bold text-[10px] flex items-center justify-center border border-accent/40">
                    {(user.name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate font-bold text-xs">{user.name}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl shadow-xl border border-border bg-card">
                  {/* Premium User Profile Header */}
                  <div className="p-3 border-b border-border/60 bg-muted/40 rounded-xl mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-black text-xs flex items-center justify-center shadow-xs">
                        {(user.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-foreground leading-tight">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email || "demo@kartly.com"}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <Sparkles className="size-3 shrink-0" />
                      <span>Explore Plus VIP Member</span>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center justify-between cursor-pointer w-full py-2 px-2.5 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 text-brand" />
                        <span className="font-semibold text-xs">My Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                          {orders.length}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setWalletTab("main");
                      setIsWalletOpen(true);
                    }}
                    className="flex items-center justify-between cursor-pointer w-full py-2 px-2.5 rounded-lg group hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="size-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-xs block leading-tight">Kartly Wallet</span>
                        <span className="text-[9px] text-muted-foreground">1-Click Pay & Rewards</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-black bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-2xs">
                      {inr(walletBalance)}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 dark:text-red-400 font-bold py-2 px-2.5 rounded-lg hover:bg-red-500/10">
                    <LogOut className="size-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 bg-brand-deep/60 hover:bg-brand-deep font-bold transition-colors cursor-pointer"
              >
                <UserRound className="size-4" />
                Login
              </Link>
            )}

            {/* Dynamic Active Wishlist Button */}
            <Link
              to="/wishlist"
              className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                location.pathname === "/wishlist"
                  ? "bg-rose-500/25 text-rose-300 font-bold ring-1 ring-rose-400/50 shadow-sm"
                  : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 active:scale-95"
              }`}
              title="View Wishlist"
              aria-label={`Wishlist (${wishlist.length} items)`}
            >
              <Heart
                className={`size-4 transition-transform duration-200 group-hover:scale-110 ${
                  wishlist.length > 0 || location.pathname === "/wishlist"
                    ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"
                    : "text-primary-foreground group-hover:text-rose-400"
                }`}
              />
              <span className="font-semibold text-xs tracking-wide">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1.5 rounded-full bg-rose-500 text-[10px] font-black leading-none text-white shadow-sm ring-1 ring-white/30 animate-in zoom-in-75">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-80 cursor-pointer"
            >
              <ShoppingCart className="size-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground text-center">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          <button
            type="button"
            onClick={openAddressModal}
            title="Click to change delivery address or PIN code"
            className="order-4 flex w-full items-center gap-2 rounded-lg border border-border/40 bg-card/20 px-2.5 py-1.5 text-xs text-foreground/90 transition-all hover:border-accent/60 hover:bg-card/40 hover:text-accent sm:w-auto md:order-none cursor-pointer group shadow-2xs"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent transition-transform group-hover:scale-110">
              <MapPin className="size-3.5 text-accent animate-pulse" />
            </div>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-accent/80 flex items-center gap-1">
                Deliver to
                <ChevronDown className="size-2.5 transition-transform group-hover:translate-y-0.5 text-muted-foreground group-hover:text-accent" />
              </span>
              <span className="font-bold text-accent truncate max-w-[140px] text-xs">
                {displayDeliveryTarget}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <ul className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 text-sm font-medium text-foreground/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => {
            const isSelected = activeCategory.toLowerCase() === c.toLowerCase();
            const targetPath =
              c === "For You"
                ? "/"
                : c === "Fashion"
                ? "/fashion"
                : c === "Mobiles"
                ? "/mobiles"
                : c === "Electronics"
                ? "/electronics"
                : c === "Beauty"
                ? "/beauty"
                : c === "Home"
                ? "/home"
                : c === "Appliances"
                ? "/appliances"
                : c === "Toys & Gifts" || c === "Toys & Baby"
                ? "/toys-gifts"
                : c === "Grocery"
                ? "/grocery"
                : c === "Sports"
                ? "/sports"
                : c === "Books & Stationery" || c === "Books"
                ? "/books"
                : `/category/${encodeURIComponent(c)}`;

            return (
              <li key={c}>
                <Link
                  to={targetPath}
                  onClick={() => setCategory(c)}
                  aria-current={isSelected ? "true" : undefined}
                  className={
                    "inline-block whitespace-nowrap border-b-2 px-3.5 py-3 transition-colors cursor-pointer " +
                    (isSelected
                      ? "border-b-[3px] border-foreground font-black text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground")
                  }
                >
                  {c}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <AuthDialog />
      <DeliveryAddressModal />
      <CameraSearchDialog open={cameraOpen} onOpenChange={setCameraOpen} />
      <VoiceSearchDialog open={voiceOpen} onOpenChange={setVoiceOpen} />
      <UserWalletModal
        open={isWalletOpen}
        onOpenChange={setIsWalletOpen}
        initialTab={walletTab}
      />
    </header>
  );
}
