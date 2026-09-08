import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/login")({
  component: () => <Navigate to="/login" search={{ role: "customer" }} replace />,
});
