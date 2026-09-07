import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Crown, Key, Database, ShieldCheck, Activity, UserPlus, LogOut, Download } from "lucide-react";
import { SiteHeader } from "@/components/store/SiteHeader";
import { SiteFooter } from "@/components/store/SiteFooter";
import { StoreProvider } from "@/components/store/store-context";
import { EnterpriseAuthProvider, useEnterpriseAuth } from "@/components/auth/enterprise-auth-context";
import { toast } from "sonner";

import { RequirePortalAuth } from "@/components/auth/RequirePortalAuth";

export const Route = createFileRoute("/super-admin/dashboard")({
  component: SuperAdminDashboardRoute,
});

function SuperAdminDashboardRoute() {
  return (
    <RequirePortalAuth requiredRole="SUPER_ADMIN">
      <SuperAdminDashboardPage />
    </RequirePortalAuth>
  );
}

function SuperAdminDashboardPage() {
  const { user, auditLogs, logout, logAction } = useEnterpriseAuth();

  const handleCreateAdmin = () => {
    logAction("Created new Level-2 System Admin account");
    toast.success("New Level-2 Admin Created", { description: "Credentials sent to admin email." });
  };

  const handleBackup = () => {
    logAction("Triggered Full System Database Backup");
    toast.success("System Backup Started", { description: "Database snapshot created at 192.168.1.104." });
  };

  const handleRotateKey = () => {
    logAction("Rotated Master API Security Keys");
    toast.success("API Keys Rotated Successfully");
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
        {/* Root Banner */}
        <div className="border-2 border-red-500/40 bg-card p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-red-100 text-red-700 font-extrabold text-xl flex items-center justify-center border border-red-300">
              <Crown className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-foreground">{user?.name || "Root Super Admin"}</h1>
                <span className="text-xs bg-red-100 text-red-900 font-bold px-2.5 py-0.5 rounded border border-red-300">
                  FULL SYSTEM ROOT PRIVILEGE
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Master Encryption: RSA-4096 · IP: 192.168.1.104 · Session Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCreateAdmin}
              className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-red-700 cursor-pointer"
            >
              <UserPlus className="size-3.5" /> Create Admin
            </button>
            <Link to="/portals" className="border border-border px-3 py-1.5 rounded text-xs font-semibold hover:bg-muted">
              Portals Directory
            </Link>
            <button
              onClick={logout}
              className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-destructive/20 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Revoke Session
            </button>
          </div>
        </div>

        {/* Root Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleRotateKey}
            className="border border-border bg-card p-4 rounded-lg text-left space-y-2 hover:border-red-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold text-foreground">API Keys Management</span>
              <Key className="size-4 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground">Rotate API secrets, HMAC signatures & OAuth client keys.</p>
            <span className="text-xs font-bold text-brand block">Rotate Keys Now →</span>
          </button>

          <button
            onClick={handleBackup}
            className="border border-border bg-card p-4 rounded-lg text-left space-y-2 hover:border-red-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold text-foreground">Database Backup & Restore</span>
              <Database className="size-4 text-emerald-600" />
            </div>
            <p className="text-xs text-muted-foreground">Automated snapshot schedule & cloud recovery routines.</p>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Download className="size-3" /> Backup Snapshot →
            </span>
          </button>

          <div className="border border-border bg-card p-4 rounded-lg text-left space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold text-foreground">Security Policies</span>
              <ShieldCheck className="size-4 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">IP Whitelisting, Password Enforcements & MFA policies active.</p>
            <span className="text-xs font-bold text-purple-600 block">Enforced Active</span>
          </div>
        </div>

        {/* Real-time System Audit Logs Table */}
        <div className="border border-border bg-card p-5 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
            <span className="flex items-center gap-2">
              <Activity className="size-4 text-red-600" /> Real-time System Audit Logs
            </span>
            <span className="text-xs text-muted-foreground font-mono">Immutable Security Trail</span>
          </h2>

          <div className="divide-y divide-border text-xs font-mono">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{log.timestamp}</span>
                    <span className="font-bold text-foreground">[{log.userRole}]</span>
                    <span className="text-foreground">{log.action}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0">{log.ipAddress}</span>
                </div>
              ))
            ) : (
              <div className="py-3 text-muted-foreground text-center">
                LOG-891042 · 17:35:10 · [SUPER_ADMIN] Root Session Authenticated · 192.168.1.104
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
