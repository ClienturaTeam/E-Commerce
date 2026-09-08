import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/warehouse/login")({
  component: () => <Navigate to="/login" search={{ role: "warehouse" }} replace />,
});
