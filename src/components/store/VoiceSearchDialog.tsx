import * as React from "react";
import {
  Mic,
  MicOff,
  Search,
  Sparkles,
  ShoppingBag,
  Volume2,
  X,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "./store-context";
import { products as catalogProducts, inr, type Product } from "./catalog";
import { getAllProducts } from "@/data/categoryData";

// Preset voice prompts with real website categories/products
const VOICE_PROMPTS = [
  { label: "iPhone 15", query: "iphone", icon: "📱" },
  { label: "boAt Earbuds", query: "earbuds", icon: "🎧" },
  { label: "Running Shoes", query: "shoes", icon: "👟" },
  { label: "Smart Watch", query: "watch", icon: "⌚" },
  { label: "Sony Headphones", query: "headphones", icon: "🎵" },
  { label: "Casual Shirt", query: "shirt", icon: "👕" },
  { label: "Lipstick & Beauty", query: "lipstick", icon: "💄" },
  { label: "Samsung Galaxy", query: "samsung", icon: "✨" },
];

export function VoiceSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { setQuery, setCategory, addToCart } = useStore();

  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState("Tap the microphone and speak to search");
  const [matchedProducts, setMatchedProducts] = React.useState<Product[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);

  // Pool all website products for matching
  const allProducts = React.useMemo(() => {
    try {
      const p1 = getAllProducts();
      return p1 && p1.length > 0 ? p1 : catalogProducts;
    } catch {
      return catalogProducts;
    }
  }, []);

  // Match products based on voice query
  const searchProducts = React.useCallback(
    (speechText: string) => {
      const q = speechText.trim().toLowerCase();
      if (!q) return;

      const words = q.split(/\s+/).filter(Boolean);
      const matches = allProducts.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const sub = (p.subCategory || "").toLowerCase();

        return (
          title.includes(q) ||
          brand.includes(q) ||
          category.includes(q) ||
          sub.includes(q) ||
          words.some((w) => title.includes(w) || brand.includes(w) || category.includes(w))
        );
      });

      setMatchedProducts(matches.slice(0, 4));
      setHasSearched(true);

      // Optional friendly audio confirmation
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const count = matches.length;
          const msg = new SpeechSynthesisUtterance(
            count > 0 ? `Found ${count} products for ${speechText}` : `No direct matches for ${speechText}`
          );
          msg.rate = 1.0;
          msg.pitch = 1.0;
          window.speechSynthesis.speak(msg);
        }
      } catch {}
    },
    [allProducts]
  );

  // Initialize Speech Recognition
  const startListening = React.useCallback(() => {
    setTranscript("");
    setMatchedProducts([]);
    setHasSearched(false);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Voice recognition not supported in this browser. Try tapping a sample voice query below.");
      toast.info("Microphone recognition unavailable", {
        description: "Choose a quick voice query below to test dynamic matching!",
      });
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage("Listening... Speak product name now");
      };

      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
        if (event.results[0].isFinal) {
          setStatusMessage(`Identified: "${current}"`);
          searchProducts(current);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setStatusMessage("Microphone permission was denied. Try tapping a sample voice query below.");
        } else {
          setStatusMessage("Could not capture speech. Please try again or tap a suggestion.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      setStatusMessage("Unable to start microphone. Please pick a voice query below.");
    }
  }, [searchProducts]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Auto-start listening on open
  React.useEffect(() => {
    if (open) {
      startListening();
    } else {
      stopListening();
      setTranscript("");
      setMatchedProducts([]);
      setHasSearched(false);
    }
  }, [open, startListening, stopListening]);

  // Handle clicking a preset voice query
  const handleSelectPrompt = (prompt: { label: string; query: string }) => {
    setTranscript(prompt.label);
    setStatusMessage(`Voice query: "${prompt.label}"`);
    setIsListening(false);
    searchProducts(prompt.query);
  };

  // Navigate to full search page
  const handleGoToFullSearch = () => {
    const q = transcript.trim();
    if (!q) return;
    setCategory("For You");
    setQuery(q);
    onOpenChange(false);
    navigate({ to: "/search", search: { q } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-border bg-card shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Mic className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                Voice Search Assistant
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Speak any product name or brand to view accurate matches with live images
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Active Listening Animated Visualizer */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-gradient-to-b from-muted/30 to-background p-6 text-center shadow-xs">
            {/* Pulsing Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative flex size-20 items-center justify-center rounded-full transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse scale-105"
                  : "bg-brand text-primary-foreground hover:bg-brand-deep hover:scale-105"
              }`}
              title={isListening ? "Click to stop listening" : "Click to speak"}
            >
              {isListening ? (
                <div className="flex items-center gap-1">
                  <span className="inline-block w-1 bg-white animate-bounce [animation-delay:0ms] h-6 rounded-full" />
                  <span className="inline-block w-1 bg-white animate-bounce [animation-delay:150ms] h-8 rounded-full" />
                  <span className="inline-block w-1 bg-white animate-bounce [animation-delay:300ms] h-5 rounded-full" />
                  <span className="inline-block w-1 bg-white animate-bounce [animation-delay:450ms] h-7 rounded-full" />
                </div>
              ) : (
                <Mic className="size-8" />
              )}
            </button>

            {/* Status & Live Transcript */}
            <div className="mt-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">{statusMessage}</p>
              {transcript && (
                <p className="text-base font-bold text-foreground flex items-center justify-center gap-1.5 animate-in fade-in">
                  <Volume2 className="size-4 text-brand shrink-0" />
                  "{transcript}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Voice Suggestion Pills */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Try saying or tap to search:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPrompt(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:border-brand hover:bg-brand/10 hover:text-brand transition-all cursor-pointer"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accurate Website Products Matched via Voice */}
          {hasSearched && (
            <div className="space-y-3 pt-2 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-brand" />
                  Accurate Website Matches ({matchedProducts.length})
                </span>
                {transcript && (
                  <button
                    type="button"
                    onClick={handleGoToFullSearch}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View all in store <ArrowRight className="size-3" />
                  </button>
                )}
              </div>

              {matchedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group flex gap-3 rounded-xl border border-border bg-card p-2.5 hover:border-brand/50 hover:shadow-xs transition-all"
                    >
                      {/* Product Image */}
                      <div
                        onClick={() => {
                          onOpenChange(false);
                          navigate({ to: `/product/${product.id}` });
                        }}
                        className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col justify-between min-w-0 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {product.brand}
                          </span>
                          <h4
                            onClick={() => {
                              onOpenChange(false);
                              navigate({ to: `/product/${product.id}` });
                            }}
                            className="font-bold text-foreground line-clamp-2 hover:text-brand transition-colors cursor-pointer leading-tight"
                          >
                            {product.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                          <div>
                            <span className="text-xs font-black text-foreground">
                              {inr(product.price)}
                            </span>
                            {product.mrp > product.price && (
                              <span className="text-[10px] text-muted-foreground line-through ml-1">
                                {inr(product.mrp)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(product);
                              toast.success("Added to cart", { description: product.title });
                            }}
                            className="rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            + Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                  No exact matches found for "{transcript}". Try searching "iPhone", "Shoes", or "Earbuds".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <span>Powered by Kartly Voice Intelligence</span>
          {transcript && (
            <button
              type="button"
              onClick={handleGoToFullSearch}
              className="font-bold text-brand hover:underline cursor-pointer"
            >
              See All Results →
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
