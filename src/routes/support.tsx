import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportRootRoute,
});

function SupportRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/support" || pathname === "/support/") {
    return <Navigate to="/support/dashboard" replace />;
  }
  return <Outlet />;
}

