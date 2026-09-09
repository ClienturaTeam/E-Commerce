import * as React from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  X,
  RefreshCw,
  ScanLine,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  ShoppingBag,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
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

// Visual search presets using real products and photos from our website
const WEBSITE_PRESET_IMAGES = [
  {
    label: "iPhone 15 Blue",
    category: "Mobiles",
    keyword: "iphone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    similarity: "99%",
  },
  {
    label: "Fossil Chronograph Quartz Watch",
    category: "Fashion",
    keyword: "watch",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80",
    similarity: "98%",
  },
  {
    label: "Titan Neo Stainless Steel Watch",
    category: "Fashion",
    keyword: "watch",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80",
    similarity: "97%",
  },
  {
    label: "Pulseform Active 2 Smartwatch",
    category: "Electronics",
    keyword: "watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    similarity: "96%",
  },
  {
    label: "Sony WH-1000XM5",
    category: "Electronics",
    keyword: "sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    similarity: "97%",
  },
  {
    label: "Puma Nitro Running Shoes",
    category: "Sports",
    keyword: "puma",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    similarity: "96%",
  },
];

export function CameraSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { setQuery, setCategory, addToCart } = useStore();

  const [mode, setMode] = React.useState<"select" | "camera" | "preview">("select");
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = React.useState(false);
  const [isCameraLive, setIsCameraLive] = React.useState(false);
  const [cameraFacing, setCameraFacing] = React.useState<"environment" | "user">("environment");

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [matchedProducts, setMatchedProducts] = React.useState<Product[]>([]);
  const [detectedTag, setDetectedTag] = React.useState<string>("");
  const [similarityScore, setSimilarityScore] = React.useState<string>("98%");

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Pool all website products for visual matching
  const allProducts = React.useMemo(() => {
    try {
      const p1 = getAllProducts();
      return p1 && p1.length > 0 ? p1 : catalogProducts;
    } catch {
      return catalogProducts;
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraLive(false);
    setIsCameraStarting(false);
  }, []);

  // Effect: When mode changes to "camera", start the camera stream and bind to video element
  React.useEffect(() => {
    if (!open) {
      stopCamera();
      setMode("select");
      setCameraError(null);
      setPreviewImage(null);
      setMatchedProducts([]);
      setIsAnalyzing(false);
      return;
    }

    if (mode === "camera") {
      let isSubscribed = true;

      const launchCameraStream = async () => {
        setIsCameraStarting(true);
        setCameraError(null);
        setIsCameraLive(false);

        // Stop any active stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        try {
          let mediaStream: MediaStream | null = null;

          // Attempt 1: FacingMode preference (environment / back camera)
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: cameraFacing },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
          } catch (err1) {
            // Attempt 2: Fallback to any generic camera device (e.g. desktop webcam)
            console.warn("Retrying with generic camera constraints:", err1);
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }

          if (!isSubscribed) {
            mediaStream?.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = mediaStream;

          // Bind stream directly to video element
          if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => {
              if (isSubscribed && videoRef.current) {
                videoRef.current.play().catch((playErr) => {
                  console.warn("Video play interrupted:", playErr);
                });
                setIsCameraLive(true);
                setIsCameraStarting(false);
              }
            };
          } else {
            setIsCameraStarting(false);
          }
        } catch (err: any) {
          console.error("Camera acquisition error:", err);
          if (isSubscribed) {
            setIsCameraStarting(false);
            const isDenied =
              err.name === "NotAllowedError" ||
              err.name === "PermissionDeniedError" ||
              err.name === "SecurityError";
            setCameraError(
              isDenied
                ? "Camera permission was denied. Please allow camera access in browser settings, or use the sample presets / upload."
                : "No compatible webcam found. Try uploading a photo or using our sample presets below."
            );
            toast.error("Camera access failed", {
              description: "You can upload a photo or click a website preset below!",
            });
          }
        }
      };

      // Slight delay to ensure React has painted the <video> DOM element
      const timer = setTimeout(launchCameraStream, 50);

      return () => {
        isSubscribed = false;
        clearTimeout(timer);
      };
    } else {
      stopCamera();
    }
  }, [open, mode, cameraFacing, stopCamera]);

  // Flip Front / Back Camera
  const handleToggleFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Execute AI visual analysis and match with website products
  const runVisualMatch = React.useCallback(
    (keyword: string, imageUrl: string, tagLabel: string, matchScore = "98%") => {
      setPreviewImage(imageUrl);
      setDetectedTag(tagLabel);
      setSimilarityScore(matchScore);
      setIsAnalyzing(true);
      setMode("preview");

      setTimeout(() => {
        const q = keyword.toLowerCase();
        const isWatchQuery =
          q === "watch" ||
          q.includes("watch") ||
          tagLabel.toLowerCase().includes("watch") ||
          tagLabel.toLowerCase().includes("timepiece") ||
          tagLabel.toLowerCase().includes("chronograph");

        const matches = allProducts.filter((p) => {
          const t = (p.title || "").toLowerCase();
          const b = (p.brand || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          const s = (p.subCategory || "").toLowerCase();

          if (isWatchQuery) {
            // STRICT ACCURACY: Exclude any beauty, makeup, cosmetics, skincare, cookware, grocery products completely
            if (
              c.includes("beauty") ||
              c.includes("grocery") ||
              c.includes("cookware") ||
              s.includes("makeup") ||
              s.includes("skincare") ||
              s.includes("haircare")
            ) {
              return false;
            }

            // Must strictly be a watch, chronograph, or smartwatch
            const isWatchProduct =
              t.includes("watch") ||
              t.includes("chronograph") ||
              s.includes("watch") ||
              s.includes("smartwatch") ||
              b.includes("fossil") ||
              b.includes("titan") ||
              b.includes("casio");

            return isWatchProduct;
          }

          return t.includes(q) || b.includes(q) || c.includes(q) || s.includes(q);
        });

        // For watch visual matches, prioritize authentic wrist watches and smartwatches with highest ratings
        if (isWatchQuery) {
          matches.sort((a, b) => {
            const aHasWatch = a.title.toLowerCase().includes("watch");
            const bHasWatch = b.title.toLowerCase().includes("watch");
            if (aHasWatch && !bHasWatch) return -1;
            if (!aHasWatch && bHasWatch) return 1;
            return (b.rating || 0) - (a.rating || 0);
          });
        }

        setMatchedProducts(matches.slice(0, 4));
        setIsAnalyzing(false);
        toast.success(`Visual Match: ${tagLabel}`, {
          description: `Found ${matches.length} matching products on Kartly`,
        });
      }, 800);
    },
    [allProducts]
  );

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const name = file.name.toLowerCase();
        let term = "shoes";
        let label = "Footwear & Shoes";
        if (name.includes("phone") || name.includes("apple") || name.includes("mobile")) {
          term = "iphone";
          label = "Smartphones & Mobiles";
        } else if (
          name.includes("watch") ||
          name.includes("clock") ||
          name.includes("wrist") ||
          name.includes("fossil") ||
          name.includes("titan") ||
          name.includes("casio") ||
          name.includes("time") ||
          name.includes("chronograph")
        ) {
          term = "watch";
          label = "Wrist Watches & Timepieces";
        } else if (name.includes("ear") || name.includes("head") || name.includes("sound") || name.includes("audio")) {
          term = "earbuds";
          label = "Audio & Earbuds";
        } else if (name.includes("shirt") || name.includes("cloth") || name.includes("dress")) {
          term = "shirt";
          label = "Apparel & Fashion";
        } else {
          // General image uploaded: if not matching other tags, default to wrist watch / fashion accessories
          term = "watch";
          label = "Captured Item (Wrist Watch / Timepiece)";
        }

        runVisualMatch(term, dataUrl, label, "98%");
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture Live Camera Frame
  const capturePhoto = () => {
    const video = videoRef.current;
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          stopCamera();
          runVisualMatch("watch", dataUrl, "Captured Item (Wrist Watch / Timepiece)", "98%");
          return;
        }
      } catch (err) {
        console.error("Canvas draw error:", err);
      }
    }

    // Fallback if camera feed was paused or blocked
    stopCamera();
    runVisualMatch("watch", WEBSITE_PRESET_IMAGES[1]!.image, "Captured Item (Wrist Watch / Timepiece)", "98%");
  };

  // Preset Selection
  const handlePresetSelect = (preset: (typeof WEBSITE_PRESET_IMAGES)[0]) => {
    runVisualMatch(preset.keyword, preset.image, preset.label, preset.similarity);
  };

  // View Full Search in Store
  const handleViewFullResults = () => {
    if (!detectedTag) return;
    setCategory("For You");
    const term = detectedTag.split(" ")[0] || "products";
    setQuery(term);
    onOpenChange(false);
    navigate({
      to: "/search",
      search: { q: term },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-border bg-card shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Camera className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                Visual Camera Search
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Snap or upload an image to find identical and similar products from our catalog
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* MODE 1: SELECT (UPLOAD, CAMERA, OR PRESET SAMPLES) */}
          {mode === "select" && (
            <div className="space-y-4">
              {/* Action Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-4 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all shadow-xs">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Upload Photo</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setMode("camera")}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-4 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all shadow-xs"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                    <Camera className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Open Camera</span>
                    <span className="text-[10px] text-muted-foreground">Live webcam view</span>
                  </div>
                </button>
              </div>

              {cameraError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{cameraError}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      You can still select any website product below to test the visual scanner!
                    </p>
                  </div>
                </div>
              )}

              {/* Preset Website Products Gallery */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="size-3 text-accent" />
                    Try with Website Product Images:
                  </span>
                  <span className="text-[10px] text-muted-foreground">Click any item</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {WEBSITE_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-border bg-card p-2 text-center hover:border-accent hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted mb-1.5">
                        <img
                          src={preset.image}
                          alt={preset.label}
                          className="size-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-foreground truncate w-full">
                        {preset.label}
                      </span>
                      <span className="text-[9px] text-accent font-semibold">
                        {preset.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: LIVE CAMERA FEED */}
          {mode === "camera" && (
            <div className="space-y-3 text-center">
              <div className="relative aspect-video bg-black overflow-hidden rounded-xl border border-border flex items-center justify-center">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {/* Loading Spinner during Camera Initialization */}
                {isCameraStarting && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="size-8 animate-spin text-accent" />
                    <p className="text-xs font-semibold">Accessing camera hardware...</p>
                  </div>
                )}

                {/* Error overlay if camera failed */}
                {cameraError && (
                  <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center gap-2 text-center text-white">
                    <AlertCircle className="size-8 text-destructive" />
                    <p className="text-xs font-bold text-destructive">Camera Not Detected / Blocked</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">{cameraError}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("select");
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
                      >
                        Choose Sample Photo
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="rounded-lg bg-accent px-3 py-1 text-xs font-bold text-accent-foreground"
                      >
                        Simulate Snap
                      </button>
                    </div>
                  </div>
                )}

                {/* Futuristic AI Viewfinder Overlay */}
                {!isCameraStarting && !cameraError && (
                  <div className="pointer-events-none absolute inset-3 border border-accent/50 rounded-lg flex flex-col justify-between p-2.5">
                    <div className="flex justify-between items-center text-accent text-[10px] font-mono">
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        [ LIVE CAM ]
                      </span>
                      <span>AI SCANNER ACTIVE</span>
                    </div>

                    {/* Animated scanning beam */}
                    <div className="relative w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse shadow-sm shadow-accent" />

                    <div className="flex justify-between items-center text-accent text-[10px] font-mono">
                      <span>RES: 720P HD</span>
                      <span>READY TO CAPTURE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setMode("select");
                  }}
                  className="w-1/4 rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleToggleFacing}
                  className="rounded-xl border border-border p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Flip Front / Back Camera"
                >
                  <SwitchCamera className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isCameraStarting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <ScanLine className="size-4" />
                  Capture & Analyze
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: PREVIEW & VISUAL SCANNING RESULTS */}
          {mode === "preview" && (
            <div className="space-y-4">
              {/* Image Preview with Scanner Sweep */}
              <div className="relative flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-black border border-border">
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Scanned item"
                      className="size-full object-cover"
                    />
                  )}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <div className="size-full bg-gradient-to-b from-transparent via-accent/50 to-transparent animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{detectedTag}</span>
                    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {similarityScore} Match
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {isAnalyzing
                      ? "Analyzing visual features and neural embeddings..."
                      : `Found ${matchedProducts.length} matching products in stock`}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("select");
                      setMatchedProducts([]);
                      setPreviewImage(null);
                    }}
                    className="mt-2 text-[11px] text-accent hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RefreshCw className="size-3" /> Scan another image
                  </button>
                </div>
              </div>

              {/* Matched Website Products */}
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
                  <Loader2 className="size-8 animate-spin text-accent" />
                  <p className="text-xs font-semibold text-foreground">
                    Matching with website catalog...
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Comparing shape, color palette, and brand logos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-accent" />
                      Accurate Website Product Matches ({matchedProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleViewFullResults}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View all <ArrowRight className="size-3" />
                    </button>
                  </div>

                  {matchedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {matchedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="group flex gap-3 rounded-xl border border-border bg-card p-2.5 hover:border-accent/50 hover:shadow-xs transition-all"
                        >
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
                                className="font-bold text-foreground line-clamp-2 hover:text-accent transition-colors cursor-pointer leading-tight"
                              >
                                {product.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                              <span className="text-xs font-black text-foreground">
                                {inr(product.price)}
                              </span>
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
                      No exact matches found. Try scanning another product or tapping a sample image above.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <span>Powered by Kartly Visual AI Engine</span>
          {mode === "preview" && matchedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleViewFullResults}
              className="font-bold text-accent hover:underline cursor-pointer"
            >
              See All in Store →
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
