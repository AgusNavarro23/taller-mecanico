"use client";

import { useEffect, useState } from "react";
import { Car, Users, Wrench, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Stats {
  totalVehicles: number;
  totalClients: number;
  totalServices: number;
  pendingServices: number;
  inProgressServices: number;
  completedServices: number;
  totalRevenue: number;
  recentServices: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // For now, we'll use mock data
      // In production, this would be an API call
      setStats({
        totalVehicles: 12,
        totalClients: 8,
        totalServices: 24,
        pendingServices: 3,
        inProgressServices: 2,
        completedServices: 19,
        totalRevenue: 45000,
        recentServices: [
          {
            id: 1,
            vehicle: { plate: "ABC123", brand: "Toyota", model: "Corolla" },
            description: "Cambio de aceite y filtros",
            status: "LISTO",
            entryDate: "2024-01-15",
          },
          {
            id: 2,
            vehicle: { plate: "XYZ789", brand: "Ford", model: "Focus" },
            description: "Reparación de motor",
            status: "EN_REPARACION",
            entryDate: "2024-01-14",
          },
          {
            id: 3,
            vehicle: { plate: "DEF456", brand: "Chevrolet", model: "Cruze" },
            description: "Cambio de frenos",
            status: "PENDIENTE",
            entryDate: "2024-01-13",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Error al cargar los datos</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Vehículos",
      value: stats.totalVehicles,
      icon: Car,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clientes",
      value: stats.totalClients,
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Servicios Totales",
      value: stats.totalServices,
      icon: Wrench,
      color: "bg-brand-red",
      bgColor: "bg-brand-red-light",
    },
    {
      title: "Ingresos Totales",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const statusCards = [
    {
      title: "Pendientes",
      value: stats.pendingServices,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "En Reparación",
      value: stats.inProgressServices,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completados",
      value: stats.completedServices,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDIENTE: "badge-pendiente",
      EN_REPARACION: "badge-en-reparacion",
      LISTO: "badge-listo",
      ENTREGADO: "badge-entregado",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-black">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tu taller mecánico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl md:text-3xl font-bold text-brand-black mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {statusCards.map((card) => (
          <div
            key={card.title}
            className={`${card.bgColor} rounded-xl p-4 md:p-6 border border-gray-100`}
          >
            <div className="flex items-center space-x-3">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-brand-black">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-brand-black">Servicios Recientes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentServices.map((service) => (
            <div key={service.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-gray-dark rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-black">
                      {service.vehicle.brand} {service.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {service.vehicle.plate} • {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{service.entryDate}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      service.status
                    )}`}
                  >
                    {service.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
