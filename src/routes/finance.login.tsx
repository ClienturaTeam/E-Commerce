import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/finance/login")({
  component: FinanceLoginRoute,
});

function FinanceLoginRoute() {
  return (
    <PortalAuthForm
      role="FINANCE"
      portalTitle="Finance Comptroller Portal Authentication"
      portalDescription="Sign in to oversee payment reconciliation, seller settlement disbursals, and GST compliance reporting."
      dashboardPath="/finance/dashboard"
      demoCredentials={{
        email: "finance@kartly.com",
        password: "password123",
        name: "Finance Comptroller",
      }}
    />
  );
}
