import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/support/login")({
  component: () => <Navigate to="/login" search={{ role: "support" }} replace />,
});
