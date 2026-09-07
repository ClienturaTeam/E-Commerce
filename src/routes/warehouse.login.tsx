import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/warehouse/login")({
  component: WarehouseLoginRoute,
});

function WarehouseLoginRoute() {
  return (
    <PortalAuthForm
      role="WAREHOUSE"
      portalTitle="Warehouse Staff Portal Authentication"
      portalDescription="Sign in to manage pick, pack, and dispatch station workflows and live barcode scanner operations."
      dashboardPath="/warehouse/dashboard"
      demoCredentials={{
        email: "warehouse@kartly.com",
        password: "password123",
        name: "Rajesh Kumar (Packing Station)",
      }}
    />
  );
}
