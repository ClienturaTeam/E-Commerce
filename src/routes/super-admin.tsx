import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin")({
  component: SuperAdminRootRoute,
});

function SuperAdminRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/super-admin" || pathname === "/super-admin/") {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  return <Outlet />;
}

