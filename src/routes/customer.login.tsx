import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/customer/login")({
  component: CustomerLoginRoute,
});

function CustomerLoginRoute() {
  return (
    <PortalAuthForm
      role="CUSTOMER"
      portalTitle="Customer Portal Authentication"
      portalDescription="Sign in or register to manage your orders, wishlist, saved addresses, and loyalty points."
      dashboardPath="/customer/dashboard"
      demoCredentials={{
        email: "customer@kartly.com",
        password: "password123",
        name: "Rahul Sharma",
      }}
    />
  );
}
