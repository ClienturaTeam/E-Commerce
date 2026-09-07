import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/customer")({
  component: CustomerRootRoute,
});

function CustomerRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/customer" || pathname === "/customer/") {
    return <Navigate to="/customer/dashboard" replace />;
  }
  return <Outlet />;
}

