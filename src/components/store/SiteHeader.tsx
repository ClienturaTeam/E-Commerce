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
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "./catalog";
import { AuthDialog } from "./AuthDialog";
import { CameraSearchDialog } from "./CameraSearchDialog";
import { useStore } from "./store-context";
import { useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";

export function SiteHeader() {
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
  } = useStore();

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
  const [draft, setDraft] = React.useState(query);
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => setDraft(query), [query]);

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

          <form
            className="order-3 flex min-w-0 flex-1 items-center gap-2 rounded-sm bg-card px-3 py-2 md:order-none"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(draft);
            }}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search for products, brands and more"
              placeholder={isListening ? "Listening..." : "Search for products, brands and more"}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setQuery(e.target.value);
              }}
              className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setDraft("");
                  setQuery("");
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
              onClick={handleVoiceSearch}
              className={`text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                isListening ? "text-brand animate-pulse" : ""
              }`}
              title="Voice Search"
            >
              <Mic className="size-4" />
            </button>

            {/* Camera Icon (Image Search) */}
            <button
              type="button"
              aria-label="Camera search"
              onClick={() => setCameraOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Image Search"
            >
              <Camera className="size-4" />
            </button>
          </form>

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
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer w-full">
                      <Package className="size-4 text-brand" />
                      <span>My Orders ({orders.length})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer w-full">
                      <Heart className="size-4 text-brand" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      entLogout();
                      signOut();
                    }}
                    className="cursor-pointer text-red-600 dark:text-red-400 font-bold"
                  >
                    <LogOut className="size-4" />
                    <span>Logout Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : user && user.isAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-colors hover:bg-brand-deep cursor-pointer">
                  <UserRound className="size-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer w-full">
                      <Package className="size-4 text-brand" />
                      <span>My Orders ({orders.length})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer w-full">
                      <Heart className="size-4 text-brand" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => openAuthModal("Sign in to manage orders, wishlist, and profile.")}
                className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-colors hover:bg-brand-deep cursor-pointer"
              >
                <UserRound className="size-4" />
                Login
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            )}

            {/* 8 ROLE PORTALS DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md bg-accent/20 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent/30 cursor-pointer">
                <Store className="size-4" />
                <span>All Portals (8 Roles)</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/portals" className="font-extrabold text-brand cursor-pointer">
                    🌐 Portals Hub (Directory)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/customer/dashboard" className="cursor-pointer">
                    👤 Customer Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/seller/dashboard" className="cursor-pointer">
                    🏪 Seller Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="cursor-pointer">
                    🛡️ Admin Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/super-admin/dashboard" className="cursor-pointer">
                    👑 Super Admin Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/warehouse/dashboard" className="cursor-pointer">
                    📦 Warehouse Staff
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/delivery/dashboard" className="cursor-pointer">
                    🚚 Delivery Partner
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support/dashboard" className="cursor-pointer">
                    🎧 Customer Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/finance/dashboard" className="cursor-pointer">
                    💰 Finance Team
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/seller"
              className="hidden items-center gap-1.5 transition-opacity hover:opacity-80 sm:flex cursor-pointer"
            >
              <Store className="size-4" />
              Become a Seller
            </Link>

            <Link
              to="/orders"
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-80 cursor-pointer"
              title="View My Orders"
            >
              <Package className="size-4" />
              <span className="hidden sm:inline">My Orders</span>
              {orders.length > 0 && (
                <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground text-center">
                  {orders.length}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-80 cursor-pointer"
              title="View Wishlist"
            >
              <Heart className="size-4" />
              Wishlist
              {wishlist.length > 0 && (
                <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground text-center">
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

          <p className="order-4 flex w-full items-center gap-1.5 text-xs md:order-none md:w-auto">
            <MapPin className="size-3.5 text-accent" />
            Deliver to
            <input
              aria-label="Delivery pincode"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="w-14 bg-transparent font-semibold underline decoration-dotted outline-none text-accent"
            />
          </p>
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
      <CameraSearchDialog open={cameraOpen} onOpenChange={setCameraOpen} />
    </header>
  );
}
