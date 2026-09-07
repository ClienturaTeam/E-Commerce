import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";

export const Route = createFileRoute("/track-order/$orderId")({
  component: TrackOrderRoute,
});

function TrackOrderRoute() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate({ to: "/track/$id", params: { id: orderId }, replace: true });
  }, [orderId, navigate]);

  return null;
}
