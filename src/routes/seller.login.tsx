import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/seller/login")({
  component: SellerLoginRoute,
});

function SellerLoginRoute() {
  return (
    <PortalAuthForm
      role="SELLER"
      portalTitle="Seller Portal Authentication"
      portalDescription="Sign in or register your business to manage inventory, catalog listings, sales analytics, and payouts."
      dashboardPath="/seller/dashboard"
      demoCredentials={{
        email: "seller@kartly.com",
        password: "password123",
        name: "Apex Retailers Pvt Ltd",
      }}
    />
  );
}
