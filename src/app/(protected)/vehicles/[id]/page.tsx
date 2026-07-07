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
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "EN_REPARACION":
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case "LISTO":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "ENTREGADO":
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
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
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Vehículo no encontrado</p>
        <button
          onClick={() => router.push("/vehicles")}
          className="mt-4 text-brand-red hover:text-brand-red-dark"
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
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-black">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-500 mt-1">Historial de servicios</p>
          </div>
        </div>
        <Link
          href={`/services?vehicleId=${vehicle.id}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white font-medium rounded-lg transition-colors"
        >
          <Wrench className="w-5 h-5 mr-2" />
          Nuevo Servicio
        </Link>
      </div>

      {/* Vehicle Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-brand-gray-dark rounded-xl flex items-center justify-center">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-brand-gray-dark text-white">
                  {vehicle.plate}
                </span>
                {vehicle.color && (
                  <span className="text-sm text-gray-500">{vehicle.color}</span>
                )}
              </div>
              <p className="text-lg font-semibold text-brand-black">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </p>
              {vehicle.vin && (
                <p className="text-sm text-gray-500 mt-1">VIN: {vehicle.vin}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Propietario</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-brand-black">{vehicle.client.name}</p>
                {vehicle.client.phone && (
                  <p className="text-sm text-gray-500">{vehicle.client.phone}</p>
                )}
                {vehicle.client.email && (
                  <p className="text-sm text-gray-500">{vehicle.client.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-black">{services.length}</p>
            <p className="text-sm text-gray-500">Servicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-black">
              {services.filter((s) => s.status === "PENDIENTE").length}
            </p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-black">
              {services.filter((s) => s.status === "LISTO" || s.status === "ENTREGADO").length}
            </p>
            <p className="text-sm text-gray-500">Completados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-black">
              ${services.reduce((sum, s) => sum + Number(s.totalCost), 0).toLocaleString("es-AR")}
            </p>
            <p className="text-sm text-gray-500">Total Gastado</p>
          </div>
        </div>
      </div>

      {/* Service History Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-brand-black">Historial de Servicios</h2>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay servicios registrados</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline items */}
              <div className="space-y-6">
                {services.map((service, index) => (
                  <div key={service.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="relative z-10 w-16 h-16 bg-white flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        service.status === "PENDIENTE"
                          ? "bg-yellow-100"
                          : service.status === "EN_REPARACION"
                          ? "bg-blue-100"
                          : service.status === "LISTO"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}>
                        {getStatusIcon(service.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 ml-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                              {service.status.replace("_", " ")}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(service.entryDate).toLocaleDateString("es-AR")}
                            </span>
                            {service.exitDate && (
                              <span className="text-sm text-gray-500">
                                → {new Date(service.exitDate).toLocaleDateString("es-AR")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-brand-black">{service.description}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-brand-black">
                            ${Number(service.totalCost).toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>

                      {/* Cost breakdown */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
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
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Repuestos utilizados:</p>
                          <div className="space-y-1">
                            {service.parts.map((part: any, partIndex: number) => (
                              <div key={partIndex} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {part.name} x{part.quantity}
                                </span>
                                <span className="text-gray-900">
                                  ${(part.price * part.quantity).toLocaleString("es-AR")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {service.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-white rounded-lg p-3">
                          <p className="font-medium text-gray-700 mb-1">Notas:</p>
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
