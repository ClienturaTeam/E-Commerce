import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/delivery/login")({
  component: DeliveryLoginRoute,
});

function DeliveryLoginRoute() {
  return (
    <PortalAuthForm
      role="DELIVERY"
      portalTitle="Delivery Partner Portal Authentication"
      portalDescription="Sign in or register to manage active order drops, GPS navigation routes, and customer OTP delivery confirmations."
      dashboardPath="/delivery/dashboard"
      demoCredentials={{
        email: "delivery@kartly.com",
        password: "password123",
        name: "Vikram Singh (Rider #892)",
      }}
    />
  );
}
