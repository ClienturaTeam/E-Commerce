import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/support/login")({
  component: SupportLoginRoute,
});

function SupportLoginRoute() {
  return (
    <PortalAuthForm
      role="SUPPORT"
      portalTitle="Customer Support Desk Authentication"
      portalDescription="Sign in to handle live chat escalations, ticket resolution, refund processing, and order disputes."
      dashboardPath="/support/dashboard"
      demoCredentials={{
        email: "support@kartly.com",
        password: "password123",
        name: "Ananya Roy (Senior Executive)",
      }}
    />
  );
}
