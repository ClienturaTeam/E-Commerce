import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/dashboard")({
  component: () => <Navigate to="/login" replace />,
});
