import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/finance/login")({
  component: () => <Navigate to="/login" search={{ role: "finance" }} replace />,
});
