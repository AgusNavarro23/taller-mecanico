"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, User, Calendar, Clock, Wrench, CheckCircle, Package, DollarSign, Edit } from "lucide-react";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}

interface Service {
  id: string;
  description: string;
  status: string;
  entryDate: string;
  exitDate: string | null;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string | null;
  parts: any;
  createdAt: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVehicleData();
    }
  }, [params.id]);

  const fetchVehicleData = async () => {
    try {
      const [vehicleRes, servicesRes] = await Promise.all([
        fetch(`/api/vehicles/${params.id}`),
        fetch(`/api/services?vehicleId=${params.id}`),
      ]);

      if (vehicleRes.ok) {
        const vehicleData = await vehicleRes.json();
        setVehicle(vehicleData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "EN_REPARACION":
        return <Wrench className="w-5 h-5 text-blue-400" />;
      case "LISTO":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "ENTREGADO":
        return <CheckCircle className="w-5 h-5 text-white/40" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDIENTE: "badge-pendiente",
      EN_REPARACION: "badge-en-reparacion",
      LISTO: "badge-listo",
      ENTREGADO: "badge-entregado",
    };
    return badges[status] || "bg-white/10 text-white/60";
  };

  const getTimelineDotColor = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return "bg-yellow-500/20";
      case "EN_REPARACION":
        return "bg-blue-500/20";
      case "LISTO":
        return "bg-green-500/20";
      case "ENTREGADO":
        return "bg-white/10";
      default:
        return "bg-white/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">Vehículo no encontrado</p>
        <button
          onClick={() => router.push("/vehicles")}
          className="glass-btn-ghost mt-4"
        >
          Volver a vehículos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="glass-btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-white/60 mt-1">Historial de servicios</p>
          </div>
        </div>
        <Link
          href={`/services?vehicleId=${vehicle.id}`}
          className="glass-btn inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-2xl"
        >
          <Wrench className="w-5 h-5 mr-2" />
          Nuevo Servicio
        </Link>
      </div>

      {/* Vehicle Info Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-white">
                  {vehicle.plate}
                </span>
                {vehicle.color && (
                  <span className="text-sm text-white/60">{vehicle.color}</span>
                )}
              </div>
              <p className="text-lg font-semibold text-white">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </p>
              {vehicle.vin && (
                <p className="text-sm text-white/60 mt-1">VIN: {vehicle.vin}</p>
              )}
            </div>
          </div>

          <div className="glass-card bg-white/5 rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white/60 mb-2">Propietario</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(8,145,178,0.4))",
                  border: "1px solid rgba(6,182,212,0.3)",
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{vehicle.client.name}</p>
                {vehicle.client.phone && (
                  <p className="text-sm text-white/60">{vehicle.client.phone}</p>
                )}
                {vehicle.client.email && (
                  <p className="text-sm text-white/60">{vehicle.client.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{services.length}</p>
            <p className="text-sm text-white/60">Servicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {services.filter((s) => s.status === "PENDIENTE").length}
            </p>
            <p className="text-sm text-white/60">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {services.filter((s) => s.status === "LISTO" || s.status === "ENTREGADO").length}
            </p>
            <p className="text-sm text-white/60">Completados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ${services.reduce((sum, s) => sum + Number(s.totalCost), 0).toLocaleString("es-AR")}
            </p>
            <p className="text-sm text-white/60">Total Gastado</p>
          </div>
        </div>
      </div>

      {/* Service History Timeline */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Historial de Servicios</h2>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No hay servicios registrados</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10"></div>

              {/* Timeline items */}
              <div className="space-y-6">
                {services.map((service, index) => (
                  <div key={service.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="relative z-10 w-16 h-16 flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTimelineDotColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 glass-card bg-white/5 rounded-2xl p-4 ml-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                              {service.status.replace("_", " ")}
                            </span>
                            <span className="text-sm text-white/60">
                              {new Date(service.entryDate).toLocaleDateString("es-AR")}
                            </span>
                            {service.exitDate && (
                              <span className="text-sm text-white/60">
                                → {new Date(service.exitDate).toLocaleDateString("es-AR")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-white">{service.description}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${Number(service.totalCost).toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>

                      {/* Cost breakdown */}
                      <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-3">
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 mr-1" />
                          Mano de obra: ${Number(service.laborCost).toLocaleString("es-AR")}
                        </div>
                        {Number(service.partsCost) > 0 && (
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            Repuestos: ${Number(service.partsCost).toLocaleString("es-AR")}
                          </div>
                        )}
                      </div>

                      {/* Parts list */}
                      {service.parts && service.parts.length > 0 && (
                        <div className="glass-card bg-white/5 rounded-xl p-3 mt-3">
                          <p className="text-sm font-medium text-white/80 mb-2">Repuestos utilizados:</p>
                          <div className="space-y-1">
                            {service.parts.map((part: any, partIndex: number) => (
                              <div key={partIndex} className="flex justify-between text-sm">
                                <span className="text-white/60">
                                  {part.name} x{part.quantity}
                                </span>
                                <span className="text-white">
                                  ${(part.price * part.quantity).toLocaleString("es-AR")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {service.notes && (
                        <div className="mt-3 text-sm text-white/60 glass-card bg-white/5 rounded-xl p-3">
                          <p className="font-medium text-white/80 mb-1">Notas:</p>
                          <p>{service.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
