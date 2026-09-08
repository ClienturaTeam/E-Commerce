import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/login")({
  component: () => <Navigate to="/login" replace />,
});
