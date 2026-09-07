import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/warehouse")({
  component: WarehouseRootRoute,
});

function WarehouseRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/warehouse" || pathname === "/warehouse/") {
    return <Navigate to="/warehouse/dashboard" replace />;
  }
  return <Outlet />;
}

