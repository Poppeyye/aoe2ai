"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  UserCheck,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserX,
  Radio,
  Cpu,
  Lock,
  Calendar,
  Layers,
} from "lucide-react";
import { useLocale } from "@/i18n/I18nProvider";
import { isAdminEmail } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
  aoe2ProfileId?: number | null;
  aoe2Name?: string | null;
  provider: string;
}

interface AdminMetricsResponse {
  kpis: {
    totalUsers: number;
    linkedUsers: number;
    unlinkedUsers: number;
    linkedPercentage: number;
    usersLast7Days: number;
    usersLast30Days: number;
    usersThisMonth: number;
    usersPrevMonth: number;
    momGrowth: number;
  };
  providers: Record<string, number>;
  charts: {
    monthlyHistory: Array<{ month: string; count: number }>;
    dailyHistory: Array<{ date: string; count: number; label: string }>;
  };
  users: AdminUser[];
  system: {
    model: string;
    timestamp: string;
    nodeEnv: string;
    serverRegion: string;
  };
}

export default function AdminPage() {
  const locale = useLocale();
  const isEs = locale === "es";
  const { data: session, status: authStatus } = useSession();

  const [data, setData] = useState<AdminMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "linked" | "unlinked" | "google" | "discord">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const userEmail = session?.user?.email;
  const isAuthorized = Boolean(userEmail && isAdminEmail(userEmail));

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) {
        if (res.status === 404 || res.status === 401) {
          throw new Error("Unauthorized or not found");
        }
        throw new Error("Failed to load metrics");
      }
      const json: AdminMetricsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && isAuthorized) {
      fetchMetrics();
    } else if (authStatus === "authenticated" && !isAuthorized) {
      setLoading(false);
    }
  }, [authStatus, isAuthorized, fetchMetrics]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    let list = data.users;

    if (activeFilter === "linked") {
      list = list.filter((u) => u.aoe2ProfileId !== null);
    } else if (activeFilter === "unlinked") {
      list = list.filter((u) => u.aoe2ProfileId === null);
    } else if (activeFilter === "google") {
      list = list.filter((u) => u.provider.toLowerCase() === "google");
    } else if (activeFilter === "discord") {
      list = list.filter((u) => u.provider.toLowerCase() === "discord");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.aoe2Name && u.aoe2Name.toLowerCase().includes(q)) ||
          (u.aoe2ProfileId && String(u.aoe2ProfileId).includes(q))
      );
    }

    return list;
  }, [data?.users, activeFilter, searchQuery]);

  const totalPages = Math.max(Math.ceil(filteredUsers.length / pageSize), 1);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Export CSV function
  const handleExportCSV = () => {
    if (!data?.users) return;
    const headers = ["ID", "Name", "Email", "Provider", "JoinedDate", "AoE2ProfileId", "AoE2Name"];
    const rows = data.users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.provider}"`,
      `"${u.createdAt}"`,
      `"${u.aoe2ProfileId || ""}"`,
      `"${(u.aoe2Name || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aoe2ai-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON function
  const handleExportJSON = () => {
    if (!data) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `aoe2ai-analytics-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-aoe-accent animate-spin" />
        <p className="text-gray-400 text-sm">
          {isEs ? "Cargando métricas de administración..." : "Loading admin analytics..."}
        </p>
      </div>
    );
  }

  // Not authorized / 404 view
  if (!session || !isAuthorized || error) {
    return (
      <div className="max-w-md mx-auto my-20 card text-center p-8 border-red-500/30">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-white mb-2">
          {isEs ? "Página no encontrada" : "Page Not Found"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {isEs
            ? "No tienes permisos de administrador para ver este panel."
            : "You do not have administrator permissions to access this dashboard."}
        </p>
        <Link href={`/${locale}`} className="btn-primary inline-flex items-center gap-2 text-sm">
          {isEs ? "Volver al inicio" : "Return to Home"}
        </Link>
      </div>
    );
  }

  const kpis = data?.kpis;
  const providers = data?.providers || {};
  const googleCount = providers["google"] || 0;
  const discordCount = providers["discord"] || 0;
  const totalProv = Math.max(googleCount + discordCount, 1);
  const googlePct = Math.round((googleCount / totalProv) * 100);
  const discordPct = Math.round((discordCount / totalProv) * 100);

  const maxMonthCount = Math.max(...(data?.charts.monthlyHistory.map((m) => m.count) || [1]), 1);
  const maxDayCount = Math.max(...(data?.charts.dailyHistory.map((d) => d.count) || [1]), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-aoe-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-aoe-accent/20 text-aoe-accent border border-aoe-accent/30 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              ADMIN PORTAL
            </span>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Production
            </span>
          </div>
          <h1 className="text-3xl font-medieval font-bold gold-gradient flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-aoe-accent" />
            {isEs ? "Panel de Métricas & Usuarios" : "Analytics & User Intelligence"}
          </h1>
          <p className="text-xs text-gray-400">
            {isEs ? "Base de datos en tiempo real de aoe2.ai" : "Real-time production database stats for aoe2.ai"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="btn-secondary text-xs !px-3 !py-2 flex items-center gap-1.5"
            title={isEs ? "Actualizar métricas" : "Refresh metrics"}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin text-aoe-accent")} />
            {refreshing ? (isEs ? "Actualizando..." : "Refreshing...") : (isEs ? "Actualizar" : "Refresh")}
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs !px-3 !py-2 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-secondary text-xs !px-3 !py-2 flex items-center gap-1.5 text-gray-400"
          >
            <Layers className="w-3.5 h-3.5" />
            JSON
          </button>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs !px-3.5 !py-2 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Google Analytics
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Registered Users */}
          <div className="card !p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>{isEs ? "Total Usuarios" : "Total Users"}</span>
              <Users className="w-4 h-4 text-aoe-accent" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{kpis.totalUsers}</div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{kpis.usersLast30Days} {isEs ? "últimos 30 días" : "last 30 days"}</span>
            </div>
          </div>

          {/* Linked AoE2 Profiles */}
          <div className="card !p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>{isEs ? "Perfiles AoE2 Vinculados" : "Linked AoE2 Profiles"}</span>
              <UserCheck className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">{kpis.linkedUsers}</div>
            <div className="text-xs text-gray-400">
              <span className="font-semibold text-white">{kpis.linkedPercentage}%</span> {isEs ? "de conversión" : "conversion rate"}
            </div>
          </div>

          {/* Users Last 7 Days */}
          <div className="card !p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>{isEs ? "Nuevos (Últimos 7 días)" : "New Users (Last 7d)"}</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">+{kpis.usersLast7Days}</div>
            <div className="text-xs text-gray-400">
              <span>{isEs ? "Ritmo semanal activo" : "Active weekly velocity"}</span>
            </div>
          </div>

          {/* MoM Growth / Monthly Signups */}
          <div className="card !p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>{isEs ? "Este Mes" : "This Month"}</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{kpis.usersThisMonth}</div>
            <div className="text-xs text-gray-400">
              <span className="text-green-400 font-bold">{kpis.momGrowth > 0 ? `+${kpis.momGrowth}%` : `${kpis.momGrowth}%`}</span> {isEs ? "vs mes anterior" : "vs prev month"}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts & Auth Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Signups Bar Chart */}
        <div className="lg:col-span-8 card !p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-aoe-accent" />
                {isEs ? "Evolución Mensual de Registros" : "Monthly Registration Growth"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEs ? "Crecimiento acumulado desde el lanzamiento" : "Cumulative trajectory since launch"}
              </p>
            </div>
            <span className="text-xs font-mono text-aoe-accent bg-aoe-dark px-2.5 py-1 rounded border border-aoe-border">
              {data?.charts.monthlyHistory.length || 0} {isEs ? "meses activos" : "active months"}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-44 flex items-end gap-3 sm:gap-6 border-b border-aoe-border/80 px-2">
              {data?.charts.monthlyHistory.map((item) => {
                const heightPct = Math.max((item.count / maxMonthCount) * 100, 8);
                const monthName = new Date(`${item.month}-01`).toLocaleDateString(locale, {
                  month: "short",
                  year: "2-digit",
                });
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-aoe-dark border border-aoe-accent text-white text-[11px] font-bold px-2 py-0.5 rounded pointer-events-none shadow-xl z-20 whitespace-nowrap">
                      {item.count} {isEs ? "usuarios" : "users"}
                    </div>

                    <span className="text-xs font-bold text-white tabular-nums">{item.count}</span>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-aoe-accent/40 via-aoe-accent/80 to-yellow-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] text-gray-400 capitalize mt-1 truncate">{monthName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auth Provider Distribution & Health Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Provider Breakdown */}
          <div className="card !p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-aoe-accent" />
              {isEs ? "Métodos de Acceso" : "OAuth Providers"}
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 font-medium">Google</span>
                  <span className="text-white font-bold">{googleCount} ({googlePct}%)</span>
                </div>
                <div className="w-full bg-aoe-dark rounded-full h-2.5 overflow-hidden border border-aoe-border/50">
                  <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: `${googlePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 font-medium">Discord</span>
                  <span className="text-white font-bold">{discordCount} ({discordPct}%)</span>
                </div>
                <div className="w-full bg-aoe-dark rounded-full h-2.5 overflow-hidden border border-aoe-border/50">
                  <div className="bg-[#5865F2] h-full rounded-full transition-all" style={{ width: `${discordPct}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-aoe-border/50 text-xs text-gray-400 leading-relaxed">
              {isEs
                ? "El 84%+ de los usuarios entran con su cuenta de Google con 1 solo clic."
                : "Over 84% of players sign in using their Google account via 1-click."}
            </div>
          </div>

          {/* System & Runtime Health */}
          <div className="card !p-5 space-y-2.5 text-xs text-gray-300">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-aoe-accent" />
              {isEs ? "Estado de la Plataforma" : "Platform Engine Status"}
            </div>
            <div className="flex justify-between py-1 border-b border-aoe-border/30">
              <span className="text-gray-400">AI Model</span>
              <span className="font-mono text-aoe-accent font-bold">{data?.system.model || "gpt-5.6-luna"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-aoe-border/30">
              <span className="text-gray-400">Database</span>
              <span className="font-mono text-white">SQLite (Volume persistent)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Region</span>
              <span className="font-mono text-green-400 font-medium">{data?.system.serverRegion || "eu-west-1"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Signups Sparkline (Last 30 Days) */}
      <div className="card !p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-aoe-accent" />
              {isEs ? "Actividad Diaria (Últimos 30 días)" : "Daily Signups Velocity (Last 30 Days)"}
            </h2>
            <p className="text-xs text-gray-400">
              {isEs ? "Nuevos registros por día natural" : "New daily user registrations"}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <div className="h-20 flex items-end gap-1 sm:gap-2">
            {data?.charts.dailyHistory.map((d) => {
              const hPct = Math.max((d.count / maxDayCount) * 100, 4);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-aoe-dark border border-aoe-border text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none shadow-lg whitespace-nowrap z-20">
                    {d.label}: {d.count}
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      d.count > 0 ? "bg-aoe-accent hover:bg-yellow-400" : "bg-aoe-dark/50"
                    )}
                    style={{ height: `${hPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1">
            <span>{data?.charts.dailyHistory[0]?.label}</span>
            <span>{data?.charts.dailyHistory[Math.floor((data?.charts.dailyHistory.length || 0) / 2)]?.label}</span>
            <span>{data?.charts.dailyHistory[(data?.charts.dailyHistory.length || 1) - 1]?.label}</span>
          </div>
        </div>
      </div>

      {/* Registered Users Directory Table */}
      <div className="card !p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-aoe-accent" />
              {isEs ? "Directorio de Usuarios Registrados" : "Registered User Directory"}
            </h2>
            <p className="text-xs text-gray-400">
              {filteredUsers.length} {isEs ? "usuarios encontrados" : "users matching filter"}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={isEs ? "Buscar por nombre, email o AoE2 ID..." : "Search name, email, or AoE2..."}
              className="input-field w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-aoe-border/50">
          {[
            { id: "all", label: isEs ? `Todos (${data?.users.length || 0})` : `All (${data?.users.length || 0})` },
            { id: "linked", label: isEs ? `Con AoE2 (${kpis?.linkedUsers || 0})` : `Linked (${kpis?.linkedUsers || 0})` },
            { id: "unlinked", label: isEs ? `Sin vincular (${kpis?.unlinkedUsers || 0})` : `Unlinked (${kpis?.unlinkedUsers || 0})` },
            { id: "google", label: `Google (${googleCount})` },
            { id: "discord", label: `Discord (${discordCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id as any);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                activeFilter === f.id
                  ? "bg-aoe-accent text-aoe-dark shadow-md"
                  : "bg-aoe-dark text-gray-400 border border-aoe-border hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-lg border border-aoe-border/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-aoe-dark border-b border-aoe-border text-gray-400">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">{isEs ? "Usuario" : "User"}</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">{isEs ? "Email" : "Email"}</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">OAuth</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">{isEs ? "Registro" : "Joined"}</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">{isEs ? "Perfil AoE2" : "AoE2 Account"}</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">{isEs ? "Acciones" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aoe-border/30 text-gray-200">
              {paginatedUsers.map((u) => {
                const joinedDate = new Date(u.createdAt);
                const isLinked = u.aoe2ProfileId !== null;

                return (
                  <tr key={u.id} className="hover:bg-aoe-dark/50 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-7 h-7 rounded-full shrink-0 border border-aoe-border" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-300">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-white truncate max-w-[150px]">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px] truncate max-w-[180px]">
                      {u.email}
                    </td>

                    {/* Provider */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          u.provider.toLowerCase() === "discord"
                            ? "bg-[#5865F2]/20 text-[#8ea0ff] border border-[#5865F2]/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        )}
                      >
                        {u.provider}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {joinedDate.toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* AoE2 Profile Status */}
                    <td className="py-3 px-4">
                      {isLinked ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                          <span className="font-bold text-aoe-accent">{u.aoe2Name || `Player #${u.aoe2ProfileId}`}</span>
                          <span className="text-[10px] text-gray-500 font-mono">({u.aoe2ProfileId})</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-[11px] italic">{isEs ? "Sin vincular" : "Not linked"}</span>
                      )}
                    </td>

                    {/* Action Links */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isLinked ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${locale}/live?profileId=${u.aoe2ProfileId}`}
                            className="text-xs text-aoe-accent hover:underline flex items-center gap-1"
                            title={isEs ? "Ver Scout en Vivo" : "View Live Scout"}
                          >
                            <Radio className="w-3 h-3" />
                            Scout
                          </Link>
                          <a
                            href={`https://www.aoe2insights.com/user/${u.aoe2ProfileId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-300"
                            title="AoE2Insights"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    {isEs ? "No se encontraron usuarios coincidentes" : "No matching users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
            <span>
              {isEs
                ? `Página ${currentPage} de ${totalPages} (${filteredUsers.length} usuarios)`
                : `Page ${currentPage} of ${totalPages} (${filteredUsers.length} users)`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary !p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary !p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
