import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/seller/login")({
  component: () => <Navigate to="/login" search={{ role: "seller" }} replace />,
});
