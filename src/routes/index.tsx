import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/store/SiteFooter";
import { SiteHeader } from "@/components/store/SiteHeader";
import { CartPanel } from "@/components/store/CartPanel";
import { ForYouSection } from "@/components/store/ForYouSection";
import { ChatBot } from "@/components/store/ChatBot";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { StoreProvider } from "@/components/store/store-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kartly — Mobiles, Fashion, Electronics & Home Online Shopping" },
      {
        name: "description",
        content:
          "Multi-category shopping on Kartly: up to 80% off mobiles, fashion, electronics, home and beauty with free fast delivery.",
      },
      { property: "og:title", content: "Kartly — Mobiles, Fashion, Electronics & Home" },
      {
        property: "og:description",
        content: "Freedom Sale: up to 80% off across mobiles, fashion, electronics and home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background font-sans pb-16 md:pb-0">
      <SiteHeader />

      <main className="space-y-4">
        <h1 className="sr-only">
          Kartly online shopping — multi-category store for mobiles, fashion, electronics and home
        </h1>

        {/* 10-SECTION MASTER E-COMMERCE HOMEPAGE */}
        <ForYouSection />
      </main>

      <SiteFooter />
    </div>
  );
}
