"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Wrench, Car, Calendar, DollarSign, Trash2, Edit, Clock, CheckCircle, AlertCircle, Package } from "lucide-react";

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
    client: { name: string };
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

  useEffect(() => { fetchServices(); fetchVehicles(); }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      setServices(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      setVehicles(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const res = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, laborCost: Number(formData.laborCost) }),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingService(null);
        setFormData({
          description: "", status: "PENDIENTE",
          entryDate: new Date().toISOString().split("T")[0],
          exitDate: "", laborCost: 0, notes: "", vehicleId: "", parts: [],
        });
        fetchServices();
      }
    } catch (e) { console.error(e); }
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setFormData({
      description: s.description, status: s.status,
      entryDate: new Date(s.entryDate).toISOString().split("T")[0],
      exitDate: s.exitDate ? new Date(s.exitDate).toISOString().split("T")[0] : "",
      laborCost: Number(s.laborCost), notes: s.notes || "",
      vehicleId: s.vehicle.id, parts: s.parts || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    fetchServices();
  };

  const addPart = () => setFormData({ ...formData, parts: [...formData.parts, { name: "", quantity: 1, price: 0 }] });
  const removePart = (i: number) => setFormData({ ...formData, parts: formData.parts.filter((_, idx) => idx !== i) });
  const updatePart = (i: number, field: string, value: any) => {
    const p = [...formData.parts];
    (p[i] as any)[field] = field === "quantity" || field === "price" ? Number(value) : value;
    setFormData({ ...formData, parts: p });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDIENTE": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "EN_REPARACION": return <Wrench className="w-4 h-4 text-blue-400" />;
      case "LISTO": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "ENTREGADO": return <AlertCircle className="w-4 h-4 text-white/40" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDIENTE: "badge-pendiente", EN_REPARACION: "badge-en-reparacion",
      LISTO: "badge-listo", ENTREGADO: "badge-entregado",
    };
    return badges[status] || "bg-white/10 text-white/60";
  };

  const filtered = services.filter(
    (s) =>
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicle.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Servicios</h1>
          <p className="text-white/40 mt-1">Gestiona los servicios del taller</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              description: "", status: "PENDIENTE",
              entryDate: new Date().toISOString().split("T")[0],
              exitDate: "", laborCost: 0, notes: "", vehicleId: "", parts: [],
            });
            setShowModal(true);
          }}
          className="glass-btn inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-2xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Servicio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          placeholder="Buscar por descripción, patente, marca o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-16">
          <Wrench className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No se encontraron servicios</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div key={service.id} className="glass-card card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <Wrench className="w-6 h-6 text-cyan-400/80" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 rounded-xl text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{service.description}</h3>

              <div className="space-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wider"
                    style={{
                      background: "rgba(6,182,212,0.2)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      color: "#67e8f9",
                    }}
                  >
                    {service.vehicle.plate}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(service.status)}`}>
                    {getStatusIcon(service.status)}
                    <span className="ml-1">{service.status.replace("_", " ")}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <Car className="w-4 h-4 mr-2 text-white/30" />
                  {service.vehicle.brand} {service.vehicle.model} • {service.vehicle.client.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-white/30" />
                  {new Date(service.entryDate).toLocaleDateString("es-AR")}
                  {service.exitDate && (
                    <span className="ml-1">→ {new Date(service.exitDate).toLocaleDateString("es-AR")}</span>
                  )}
                </div>
                {service.parts && service.parts.length > 0 && (
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-white/30" />
                    {service.parts.length} repuesto{service.parts.length !== 1 ? "s" : ""}
                  </div>
                )}
                <div className="flex items-center font-semibold text-white">
                  <DollarSign className="w-4 h-4 mr-1 text-white/30" />
                  ${Number(service.totalCost).toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-white">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingService(null); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-white/40 text-xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Vehículo *</label>
                <select value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgba(255,255,255,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  required
                >
                  <option value="" style={{ background: "#1a1a2e", color: "#fff" }}>Seleccionar vehículo</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} style={{ background: "#1a1a2e", color: "#fff" }}>
                      {v.plate} - {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Descripción *</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl" rows={3}
                  placeholder="Describe el trabajo realizado..." required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Estado *</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgba(255,255,255,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                    required
                  >
                    <option value="PENDIENTE" style={{ background: "#1a1a2e", color: "#fff" }}>Pendiente</option>
                    <option value="EN_REPARACION" style={{ background: "#1a1a2e", color: "#fff" }}>En Reparación</option>
                    <option value="LISTO" style={{ background: "#1a1a2e", color: "#fff" }}>Listo</option>
                    <option value="ENTREGADO" style={{ background: "#1a1a2e", color: "#fff" }}>Entregado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Costo Mano de Obra *</label>
                  <input type="number" value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: Number(e.target.value) })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" min="0" step="0.01" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Fecha de Ingreso *</label>
                  <input type="date" value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Fecha de Salida</label>
                  <input type="date" value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Notas</label>
                <textarea value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl" rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Parts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/50">Repuestos</label>
                  <button type="button" onClick={addPart}
                    className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar repuesto
                  </button>
                </div>
                {formData.parts.length > 0 && (
                  <div className="space-y-3">
                    {formData.parts.map((part, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <input type="text" value={part.name}
                          onChange={(e) => updatePart(i, "name", e.target.value)}
                          className="flex-1 px-3 py-1 bg-white/10 border border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          placeholder="Nombre del repuesto" required
                        />
                        <input type="number" value={part.quantity}
                          onChange={(e) => updatePart(i, "quantity", e.target.value)}
                          className="w-20 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          min="1" required
                        />
                        <input type="number" value={part.price}
                          onChange={(e) => updatePart(i, "price", e.target.value)}
                          className="w-24 px-3 py-1 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          min="0" step="0.01" required
                        />
                        <button type="button" onClick={() => removePart(i)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => { setShowModal(false); setEditingService(null); }}
                  className="glass-btn-ghost flex-1 py-3 rounded-2xl font-medium"
                >
                  Cancelar
                </button>
                <button type="submit"
                  className="glass-btn flex-1 py-3 rounded-2xl font-semibold"
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
