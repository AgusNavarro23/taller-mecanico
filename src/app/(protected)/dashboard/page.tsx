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
}

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
