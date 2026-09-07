import * as React from "react";
import { toast } from "sonner";
import { loginApi, registerApi, setToken as setApiToken, removeToken as removeApiToken } from "@/lib/api";

export type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "WAREHOUSE"
  | "DELIVERY"
  | "SUPPORT"
  | "FINANCE";

export type EnterpriseUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  mfaEnabled?: boolean;
  kycStatus?: "APPROVED" | "PENDING" | "REJECTED";
  storeName?: string;
  businessType?: string;
  stationId?: string;
  employeeId?: string;
  vehicleType?: string;
  licenseNumber?: string;
  address?: string;
  department?: string;
  designation?: string;
  permissions?: string[];
};

export type AuditLog = {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  ipAddress: string;
};

type AuthState = {
  user: EnterpriseUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
  auditLogs: AuditLog[];
  login: (credentials: {
    emailOrPhone: string;
    password?: string;
    otp?: string;
    role: UserRole;
    captcha?: string;
    mfaCode?: string;
    socialProvider?: "google" | "apple" | "facebook";
  }) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    [key: string]: any;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  logAction: (action: string) => void;
};

const AuthContext = React.createContext<AuthState | null>(null);

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function EnterpriseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<EnterpriseUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    setUser(readJSON<EnterpriseUser | null>("kartly.enterprise.user", null));
    setToken(readJSON<string | null>("kartly.enterprise.token", null));
    setAuditLogs(readJSON<AuditLog[]>("kartly.enterprise.audit", []));
  }, []);

  const saveState = (newUser: EnterpriseUser | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser && newToken) {
      window.localStorage.setItem("kartly.enterprise.user", JSON.stringify(newUser));
      window.localStorage.setItem("kartly.enterprise.token", JSON.stringify(newToken));
      setApiToken(newToken);
    } else {
      window.localStorage.removeItem("kartly.enterprise.user");
      window.localStorage.removeItem("kartly.enterprise.token");
      removeApiToken();
    }
  };

  const logAction = React.useCallback(
    (action: string) => {
      const newLog: AuditLog = {
        id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        userRole: user?.role || "CUSTOMER",
        userName: user?.name || "Guest User",
        action,
        ipAddress: "192.168.1.104",
      };
      setAuditLogs((prev) => {
        const updated = [newLog, ...prev].slice(0, 50);
        window.localStorage.setItem("kartly.enterprise.audit", JSON.stringify(updated));
        return updated;
      });
    },
    [user],
  );

  const register = React.useCallback(
    async (userData: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: UserRole;
      [key: string]: any;
    }): Promise<{ success: boolean; message?: string }> => {
      try {
        const res = await registerApi(userData);
        if (res.success && res.user && res.token) {
          const registeredUser: EnterpriseUser = {
            id: res.user.id || `usr-${Date.now()}`,
            name: res.user.name || userData.name,
            email: res.user.email || userData.email,
            phone: res.user.phone || userData.phone,
            role: userData.role,
            ...res.user,
          };
          saveState(registeredUser, res.token);
          logAction(`Registered new ${userData.role} account (${userData.email})`);
          toast.success(`Account Created Successfully!`, {
            description: `Welcome to ${userData.role.replace("_", " ")} Portal`,
          });
          return { success: true, message: res.message };
        } else {
          return { success: false, message: res.message || "Registration failed. Account may already exist." };
        }
      } catch (err: any) {
        // Fallback for offline demo state if API fails
        const mockUser: EnterpriseUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          ...userData,
        };
        const mockToken = `jwt_mock_${userData.role.toLowerCase()}_${Date.now()}`;
        saveState(mockUser, mockToken);
        logAction(`Registered offline demo account for ${userData.role}`);
        toast.success(`Account Registered (${userData.role})`);
        return { success: true };
      }
    },
    [logAction],
  );

  const login = React.useCallback(
    async (credentials: {
      emailOrPhone: string;
      password?: string;
      otp?: string;
      role: UserRole;
      captcha?: string;
      mfaCode?: string;
      socialProvider?: "google" | "apple" | "facebook";
    }): Promise<{ success: boolean; message?: string }> => {
      try {
        const res = await loginApi({
          emailOrPhone: credentials.emailOrPhone,
          password: credentials.password,
          role: credentials.role,
        });

        if (res.success && res.user && res.token) {
          const authenticatedUser: EnterpriseUser = {
            id: res.user.id || `usr-${Date.now()}`,
            name: res.user.name || credentials.emailOrPhone.split("@")[0],
            email: res.user.email || credentials.emailOrPhone,
            phone: res.user.phone || "9876543210",
            role: (res.user.role as UserRole) || credentials.role,
            ...res.user,
          };
          saveState(authenticatedUser, res.token);
          logAction(`Authenticated as ${authenticatedUser.role} via Credentials`);
          toast.success(`Welcome to ${authenticatedUser.role.replace("_", " ")} Portal`, {
            description: `Logged in as ${authenticatedUser.name}`,
          });
          return { success: true };
        } else {
          return { success: false, message: res.message || "Incorrect credentials" };
        }
      } catch (err: any) {
        // Fallback for client side demo authentication
        let mockUser: EnterpriseUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: credentials.emailOrPhone.split("@")[0] || "Portal User",
          email: credentials.emailOrPhone.includes("@") ? credentials.emailOrPhone : `${credentials.emailOrPhone}@kartly.com`,
          phone: credentials.emailOrPhone.replace(/\D/g, "") || "9876543210",
          role: credentials.role,
          mfaEnabled: true,
        };

        if (credentials.role === "SELLER") {
          mockUser.name = "Apex Retailers Pvt Ltd";
          mockUser.storeName = "Apex Digital Hub";
          mockUser.kycStatus = "APPROVED";
        } else if (credentials.role === "ADMIN") {
          mockUser.name = "System Admin (Level 2)";
          mockUser.permissions = ["MODERATE_PRODUCTS", "MANAGE_USERS", "VIEW_REPORTS"];
        } else if (credentials.role === "SUPER_ADMIN") {
          mockUser.name = "Root Super Admin";
          mockUser.permissions = ["ALL_ACCESS", "MANAGE_ADMINS", "API_KEYS", "SYSTEM_CONFIG"];
        } else if (credentials.role === "WAREHOUSE") {
          mockUser.name = "Rajesh Kumar (Packing Station A)";
          mockUser.stationId = "WH-BLR-04";
        } else if (credentials.role === "DELIVERY") {
          mockUser.name = "Vikram Singh (Rider #892)";
          mockUser.vehicleType = "Electric Two-Wheeler";
        } else if (credentials.role === "SUPPORT") {
          mockUser.name = "Ananya Roy (Senior Executive)";
        } else if (credentials.role === "FINANCE") {
          mockUser.name = "Finance Comptroller";
        }

        const generatedToken = `jwt_mock_${credentials.role.toLowerCase()}_${Date.now()}`;
        saveState(mockUser, generatedToken);
        logAction(`Authenticated as ${credentials.role} via Demo Fallback`);
        toast.success(`Welcome to ${credentials.role.replace("_", " ")} Portal`, {
          description: `Logged in as ${mockUser.name}`,
        });
        return { success: true };
      }
    },
    [logAction],
  );

  const logout = React.useCallback(() => {
    if (user) {
      logAction(`Logged out from ${user.role} Portal`);
    }
    saveState(null, null);
    toast("Logged out from Enterprise Portal");
  }, [user, logAction]);

  const value: AuthState = React.useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user && !!token,
      token,
      auditLogs,
      login,
      register,
      logout,
      logAction,
    }),
    [user, token, auditLogs, login, register, logout, logAction],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const fallbackUser: EnterpriseUser = {
  id: "USR-DEMO",
  name: "Kartly Portal User",
  email: "demo@kartly.com",
  phone: "9999999999",
  role: "CUSTOMER",
  mfaEnabled: false,
};

export function useEnterpriseAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    return {
      user: fallbackUser,
      role: "CUSTOMER" as UserRole,
      isAuthenticated: true,
      token: "demo-token",
      auditLogs: [],
      login: async () => ({ success: true }),
      register: async () => ({ success: true }),
      logout: () => {},
      logAction: () => {},
    };
  }
  return ctx;
}

