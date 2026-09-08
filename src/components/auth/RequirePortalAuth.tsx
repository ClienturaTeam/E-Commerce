import * as React from "react";
import { Navigate } from "@tanstack/react-router";
import { useEnterpriseAuth, UserRole } from "./enterprise-auth-context";
import { toast } from "sonner";

interface RequirePortalAuthProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

// Global set to prevent duplicate notification toasts across rapid re-renders
const notifiedSessionKeys = new Set<string>();

export function RequirePortalAuth({ requiredRole, children }: RequirePortalAuthProps) {
  const { isAuthenticated, user, role } = useEnterpriseAuth();
  const targetRole = requiredRole.toLowerCase();

  if (!isAuthenticated || !user) {
    const notifyKey = `unauth-${requiredRole}`;
    if (!notifiedSessionKeys.has(notifyKey) && typeof window !== "undefined") {
      notifiedSessionKeys.add(notifyKey);
      setTimeout(() => notifiedSessionKeys.delete(notifyKey), 10000);
      toast.warning("Authentication Required", {
        description: `Please log in to access the ${requiredRole.replace("_", " ")} Portal.`,
      });
    }
    return <Navigate to="/login" search={{ role: targetRole }} replace />;
  }

  if (role && role !== requiredRole) {
    const notifyKey = `denied-${role}-${requiredRole}`;
    if (!notifiedSessionKeys.has(notifyKey) && typeof window !== "undefined") {
      notifiedSessionKeys.add(notifyKey);
      setTimeout(() => notifiedSessionKeys.delete(notifyKey), 10000);
      toast.error("Access Denied", {
        description: `Logged in as ${role}. Please log in with a ${requiredRole.replace("_", " ")} account.`,
      });
    }
    return <Navigate to="/login" search={{ role: targetRole }} replace />;
  }

  return <>{children}</>;
}
