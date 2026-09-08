import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery/login")({
  component: () => <Navigate to="/login" search={{ role: "delivery" }} replace />,
});
