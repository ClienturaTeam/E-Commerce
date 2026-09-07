import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery")({
  component: DeliveryRootRoute,
});

function DeliveryRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/delivery" || pathname === "/delivery/") {
    return <Navigate to="/delivery/dashboard" replace />;
  }
  return <Outlet />;
}

