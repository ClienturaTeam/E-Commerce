import * as React from "react";
import { Navigate } from "@tanstack/react-router";
import { useEnterpriseAuth, UserRole } from "./enterprise-auth-context";
import { toast } from "sonner";

interface RequirePortalAuthProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

const ROLE_LOGIN_PATHS: Record<string, string> = {
  CUSTOMER: "/login?role=customer",
  SELLER: "/login?role=seller",
  ADMIN: "/login?role=admin",
  SUPER_ADMIN: "/login",
  WAREHOUSE: "/login?role=warehouse",
  DELIVERY: "/login?role=delivery",
  SUPPORT: "/login?role=support",
  FINANCE: "/login?role=finance",
};

export function RequirePortalAuth({ requiredRole, children }: RequirePortalAuthProps) {
  const { isAuthenticated, user, role } = useEnterpriseAuth();
  const hasNotifiedRef = React.useRef(false);

  const targetLoginPath = ROLE_LOGIN_PATHS[requiredRole] || "/portals";

  if (!isAuthenticated || !user) {
    if (!hasNotifiedRef.current && typeof window !== "undefined") {
      hasNotifiedRef.current = true;
      toast.warning("Authentication Required", {
        description: `Please log in to access the ${requiredRole.replace("_", " ")} Portal.`,
      });
    }
    return <Navigate to={targetLoginPath as any} replace />;
  }

  if (role && role !== requiredRole) {
    if (!hasNotifiedRef.current && typeof window !== "undefined") {
      hasNotifiedRef.current = true;
      toast.error("Access Denied", {
        description: `Logged in as ${role}. Please log in with a ${requiredRole.replace("_", " ")} account.`,
      });
    }
    return <Navigate to={targetLoginPath as any} replace />;
  }

  return <>{children}</>;
}
