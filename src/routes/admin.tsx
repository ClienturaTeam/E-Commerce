import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminRootRoute,
});

function AdminRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/admin" || pathname === "/admin/") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}

