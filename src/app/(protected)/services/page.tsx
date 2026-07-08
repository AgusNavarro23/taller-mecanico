"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Wrench, Car, Calendar, DollarSign, Trash2, Edit, Clock, CheckCircle, AlertCircle, Package, X } from "lucide-react";

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
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    client: {
      name: string;
    };
  };
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    status: "PENDIENTE",
    entryDate: new Date().toISOString().split("T")[0],
    exitDate: "",
    laborCost: 0,
    notes: "",
    vehicleId: "",
    parts: [] as { name: string; quantity: number; price: number }[],
  });

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          laborCost: Number(formData.laborCost),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingService(null);
        setFormData({
          description: "",
          status: "PENDIENTE",
          entryDate: new Date().toISOString().split("T")[0],
          exitDate: "",
          laborCost: 0,
          notes: "",
          vehicleId: "",
          parts: [],
        });
        fetchServices();
      }
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      description: service.description,
      status: service.status,
      entryDate: new Date(service.entryDate).toISOString().split("T")[0],
      exitDate: service.exitDate ? new Date(service.exitDate).toISOString().split("T")[0] : "",
      laborCost: Number(service.laborCost),
      notes: service.notes || "",
      vehicleId: service.vehicle.id,
      parts: service.parts || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) return;

    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const addPart = () => {
    setFormData({
      ...formData,
      parts: [...formData.parts, { name: "", quantity: 1, price: 0 }],
    });
  };

  const removePart = (index: number) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_, i) => i !== index),
    });
  };

  const updatePart = (index: number, field: string, value: any) => {
    const newParts = [...formData.parts];
    (newParts[index] as any)[field] = field === "quantity" || field === "price" ? Number(value) : value;
    setFormData({ ...formData, parts: newParts });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "EN_REPARACION":
        return <Wrench className="w-4 h-4 text-blue-400" />;
      case "LISTO":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "ENTREGADO":
        return <AlertCircle className="w-4 h-4 text-white/40" />;
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

  const filteredServices = services.filter(
    (service) =>
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#0a0a0f] min-h-screen p-6 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Servicios</h1>
          <p className="text-white/60 mt-1">Gestiona los servicios del taller</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              description: "",
              status: "PENDIENTE",
              entryDate: new Date().toISOString().split("T")[0],
              exitDate: "",
              laborCost: 0,
              notes: "",
              vehicleId: "",
              parts: [],
            });
            setShowModal(true);
          }}
          className="glass-btn inline-flex items-center justify-center px-4 py-2 text-white font-medium rounded-2xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Servicio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por descripción, patente, marca o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-12 pr-4 py-3 text-white placeholder-white/40 rounded-2xl outline-none"
        />
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="glass-card text-center py-12 rounded-3xl">
          <Wrench className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No se encontraron servicios</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="glass-card card-hover rounded-2xl p-4 md:p-6 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white">
                        {service.vehicle.plate}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{service.status.replace("_", " ")}</span>
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{service.description}</h3>
                    <p className="text-sm text-white/60 mt-1">
                      {service.vehicle.brand} {service.vehicle.model} • {service.vehicle.client.name}
                    </p>
                    {service.parts && service.parts.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-white/60">
                        <Package className="w-4 h-4 mr-1" />
                        {service.parts.length} repuesto{service.parts.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(service.entryDate).toLocaleDateString("es-AR")}
                    </div>
                    {service.exitDate && (
                      <div className="flex items-center">
                        <span className="mr-1">→</span>
                        {new Date(service.exitDate).toLocaleDateString("es-AR")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        ${Number(service.totalCost).toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-white/40">Total</p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-white/40 hover:text-red-500 hover:bg-white/10 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-2xl shadow-2xl my-8 border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Vehículo *</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="glass-input w-full px-4 py-2 text-white rounded-2xl outline-none"
                  required
                >
                  <option value="" className="bg-[#0a0a0f]">Seleccionar vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id} className="bg-[#0a0a0f]">
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-4 py-2 text-white placeholder-white/40 rounded-2xl outline-none"
                  rows={3}
                  placeholder="Describe el trabajo realizado..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Estado *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input w-full px-4 py-2 text-white rounded-2xl outline-none"
                    required
                  >
                    <option value="PENDIENTE" className="bg-[#0a0a0f]">Pendiente</option>
                    <option value="EN_REPARACION" className="bg-[#0a0a0f]">En Reparación</option>
                    <option value="LISTO" className="bg-[#0a0a0f]">Listo</option>
                    <option value="ENTREGADO" className="bg-[#0a0a0f]">Entregado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Costo Mano de Obra *</label>
                  <input
                    type="number"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: Number(e.target.value) })}
                    className="glass-input w-full px-4 py-2 text-white rounded-2xl outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Fecha de Ingreso *</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="glass-input w-full px-4 py-2 text-white rounded-2xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Fecha de Salida</label>
                  <input
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                    className="glass-input w-full px-4 py-2 text-white rounded-2xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="glass-input w-full px-4 py-2 text-white placeholder-white/40 rounded-2xl outline-none"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Parts Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/80">Repuestos</label>
                  <button
                    type="button"
                    onClick={addPart}
                    className="inline-flex items-center text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar repuesto
                  </button>
                </div>

                {formData.parts.length > 0 && (
                  <div className="space-y-3">
                    {formData.parts.map((part, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <input
                          type="text"
                          value={part.name}
                          onChange={(e) => updatePart(index, "name", e.target.value)}
                          className="flex-1 px-3 py-1 bg-white/10 border border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          placeholder="Nombre del repuesto"
                          required
                        />
                        <input
                          type="number"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, "quantity", e.target.value)}
                          className="w-20 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          min="1"
                          required
                        />
                        <input
                          type="number"
                          value={part.price}
                          onChange={(e) => updatePart(index, "price", e.target.value)}
                          className="w-24 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          min="0"
                          step="0.01"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                  }}
                  className="glass-btn-ghost flex-1 px-4 py-2 text-white rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="glass-btn flex-1 px-4 py-2 text-white rounded-2xl transition-all"
                >
                  {editingService ? "Guardar Cambios" : "Crear Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
