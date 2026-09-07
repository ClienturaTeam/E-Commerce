import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginRoute,
});

function AdminLoginRoute() {
  return (
    <PortalAuthForm
      role="ADMIN"
      portalTitle="System Admin Portal Authentication"
      portalDescription="Access Level-2 administration controls for catalog moderation, seller approvals, and order oversight."
      dashboardPath="/admin/dashboard"
      demoCredentials={{
        email: "admin@kartly.com",
        password: "password123",
        name: "System Admin (Level 2)",
      }}
    />
  );
}
