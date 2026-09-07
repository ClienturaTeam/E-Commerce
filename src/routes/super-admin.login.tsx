import { createFileRoute } from "@tanstack/react-router";
import { PortalAuthForm } from "@/components/auth/PortalAuthForm";

export const Route = createFileRoute("/super-admin/login")({
  component: SuperAdminLoginRoute,
});

function SuperAdminLoginRoute() {
  return (
    <PortalAuthForm
      role="SUPER_ADMIN"
      portalTitle="Root Super Admin Authentication"
      portalDescription="Highest privilege access portal for key rotation, infrastructure backups, admin management, and security audit logs."
      dashboardPath="/super-admin/dashboard"
      demoCredentials={{
        email: "superadmin@kartly.com",
        password: "password123",
        name: "Root Super Admin",
      }}
    />
  );
}
