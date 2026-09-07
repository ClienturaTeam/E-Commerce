import * as React from "react";
import { Navigate } from "@tanstack/react-router";
import { useEnterpriseAuth, UserRole } from "./enterprise-auth-context";
import { toast } from "sonner";

interface RequirePortalAuthProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

const ROLE_LOGIN_PATHS: Record<UserRole, string> = {
  CUSTOMER: "/customer/login",
  SELLER: "/seller/login",
  ADMIN: "/admin/login",
  SUPER_ADMIN: "/super-admin/login",
  WAREHOUSE: "/warehouse/login",
  DELIVERY: "/delivery/login",
  SUPPORT: "/support/login",
  FINANCE: "/finance/login",
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
