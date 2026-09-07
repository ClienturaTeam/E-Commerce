import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/finance")({
  component: FinanceRootRoute,
});

function FinanceRootRoute() {
  const { pathname } = useLocation();
  if (pathname === "/finance" || pathname === "/finance/") {
    return <Navigate to="/finance/dashboard" replace />;
  }
  return <Outlet />;
}

