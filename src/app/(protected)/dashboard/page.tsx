"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Users, Wrench, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Stats {
  totalClients: number;
  totalVehicles: number;
  totalServices: number;
  pendingServices: number;
  inProgressServices: number;
  readyServices: number;
  deliveredServices: number;
  totalRevenue: number;
  recentServices: any[];
  servicesByArea: { area: string; count: number }[];
  vehiclesByBrand: { brand: string; count: number }[];
}

const CHART_COLORS = [
  "#06b6d4", "#0891b2", "#22d3ee", "#67e8f9", "#a5f3fc", "#0e7490",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/40">Error al cargar los datos</p>
      </div>
    );
  }

  const statCards = [
    { title: "Vehículos", value: stats.totalVehicles, icon: Car, color: "rgba(6,182,212,0.2)", iconColor: "#67e8f9", href: "/vehicles" },
    { title: "Clientes", value: stats.totalClients, icon: Users, color: "rgba(16,185,129,0.2)", iconColor: "#34d399", href: "/clients" },
    { title: "Servicios", value: stats.totalServices, icon: Wrench, color: "rgba(59,130,246,0.2)", iconColor: "#60a5fa", href: "/services" },
    { title: "Ingresos", value: `$${stats.totalRevenue.toLocaleString("es-AR")}`, icon: DollarSign, color: "rgba(168,85,247,0.2)", iconColor: "#c084fc", href: null },
  ];

  const statusCards = [
    { title: "Pendientes", value: stats.pendingServices, icon: Clock, color: "rgba(245,158,11,0.15)", iconColor: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    { title: "En Reparación", value: stats.inProgressServices, icon: Wrench, color: "rgba(59,130,246,0.15)", iconColor: "#60a5fa", border: "rgba(59,130,246,0.25)" },
    { title: "Listos", value: stats.readyServices, icon: CheckCircle, color: "rgba(16,185,129,0.15)", iconColor: "#34d399", border: "rgba(16,185,129,0.25)" },
  ];

  const getStatusBadge = (status: string) => {
    const b: Record<string, string> = { PENDIENTE: "badge-pendiente", EN_REPARACION: "badge-en-reparacion", LISTO: "badge-listo", ENTREGADO: "badge-entregado" };
    return b[status] || "";
  };

  const totalByArea = stats.servicesByArea.reduce((sum, a) => sum + a.count, 0);
  const maxBrandCount = Math.max(...stats.vehiclesByBrand.map((v) => v.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1">Resumen de tu taller mecánico</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const inner = (
            <div className="glass-card rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/40">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: card.color, border: `1px solid ${card.color}` }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
                </div>
              </div>
            </div>
          );
          return card.href ? (
            <Link key={card.title} href={card.href}>{inner}</Link>
          ) : (
            <div key={card.title}>{inner}</div>
          );
        })}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statusCards.map((card) => (
          <div key={card.title} className="glass-card rounded-2xl p-5"
            style={{ border: `1px solid ${card.border}` }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.color }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
              </div>
              <div>
                <p className="text-sm text-white/40">{card.title}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Servicios por Zona */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Servicios por Zona de Reparación</h3>
          {stats.servicesByArea.length === 0 ? (
            <p className="text-white/40 text-center py-8">Sin datos disponibles</p>
          ) : (
            <div className="flex items-center gap-6">
              {/* Donut */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return stats.servicesByArea.map((item, i) => {
                      const pct = (item.count / totalByArea) * 100;
                      const dasharray = `${pct} ${100 - pct}`;
                      const dashoffset = 100 - cumulative;
                      cumulative += pct;
                      return (
                        <circle
                          key={item.area}
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth="3.5"
                          strokeDasharray={dasharray}
                          strokeDashoffset={dashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{totalByArea}</p>
                    <p className="text-xs text-white/40">Total</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-2">
                {stats.servicesByArea.map((item, i) => (
                  <div key={item.area} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-white/70">{item.area}</span>
                    </div>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Vehículos por Marca */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Vehículos por Marca</h3>
          {stats.vehiclesByBrand.length === 0 ? (
            <p className="text-white/40 text-center py-8">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {stats.vehiclesByBrand.map((item, i) => (
                <div key={item.brand} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-28 text-right truncate">{item.brand}</span>
                  <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center px-2"
                      style={{
                        width: `${(item.count / maxBrandCount) * 100}%`,
                        background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}cc, ${CHART_COLORS[i % CHART_COLORS.length]}88)`,
                        minWidth: "2rem",
                      }}
                    >
                      <span className="text-xs font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Services */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-lg font-semibold text-white">Servicios Recientes</h2>
        </div>
        {stats.recentServices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Wrench className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/40">No hay servicios registrados</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {stats.recentServices.map((service: any) => (
              <Link
                key={service.id}
                href={`/vehicles/${service.vehicle.id}`}
                className="block px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.1))",
                        border: "1px solid rgba(6,182,212,0.2)",
                      }}
                    >
                      <Car className="w-5 h-5 text-cyan-400/60" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{service.vehicle.brand} {service.vehicle.model}</p>
                      <p className="text-sm text-white/40">{service.vehicle.plate} · {service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white/30 hidden sm:block">
                      {new Date(service.entryDate).toLocaleDateString("es-AR")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                      {service.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
