"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Car, User, Calendar, Edit, Trash2, History, X } from "lucide-react";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  client: { id: string; name: string };
  _count: { services: number };
}

interface Client {
  id: string;
  name: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: "", brand: "", model: "",
    year: new Date().getFullYear(),
    color: "", vin: "", clientId: "",
  });

  useEffect(() => { fetchVehicles(); fetchClients(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      setVehicles(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      setClients(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const res = await fetch(url, {
        method: editingVehicle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, year: Number(formData.year) }),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingVehicle(null);
        setFormData({ plate: "", brand: "", model: "", year: new Date().getFullYear(), color: "", vin: "", clientId: "" });
        fetchVehicles();
      }
    } catch (e) { console.error(e); }
  };

  const handleEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ plate: v.plate, brand: v.brand, model: v.model, year: v.year, color: v.color || "", vin: "", clientId: v.client.id });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    fetchVehicles();
  };

  const filtered = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Vehículos</h1>
          <p className="text-white/40 mt-1">Gestiona los vehículos del taller</p>
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setFormData({ plate: "", brand: "", model: "", year: new Date().getFullYear(), color: "", vin: "", clientId: "" }); setShowModal(true); }}
          className="glass-btn inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-2xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          placeholder="Buscar por patente, marca, modelo o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl"
        />
      </div>

      {/* Vehicles Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-16">
          <Car className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-card rounded-2xl p-5 card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.08))",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <Car className="w-6 h-6 text-red-400/80" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wider"
                      style={{
                        background: "rgba(220,38,38,0.2)",
                        border: "1px solid rgba(220,38,38,0.3)",
                        color: "#f87171",
                      }}
                    >
                      {vehicle.plate}
                    </span>
                    <span className="text-sm text-white/30">{vehicle.year}</span>
                    {vehicle.color && <span className="text-sm text-white/30">{vehicle.color}</span>}
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center text-sm text-white/40">
                      <User className="w-4 h-4 mr-1.5" />
                      {vehicle.client.name}
                    </span>
                    <span className="text-sm text-white/30">
                      {vehicle._count.services} servicio{vehicle._count.services !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)" }}
                    title="Ver historial"
                  >
                    <History className="w-4 h-4 text-blue-400" />
                  </Link>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.15)" }}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-red-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)" }}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-300/60" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div className="glass-card rounded-3xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-white">
                {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingVehicle(null); }}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Patente</label>
                <input type="text" value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="glass-input w-full px-4 py-3 rounded-2xl uppercase tracking-wider"
                  placeholder="ABC123" required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Marca</label>
                  <input type="text" value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="Toyota" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Modelo</label>
                  <input type="text" value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="Corolla" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Año</label>
                  <input type="number" value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                    min="1900" max={new Date().getFullYear() + 1} required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Color</label>
                  <input type="text" value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="Rojo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Cliente</label>
                <select value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgba(255,255,255,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  required
                >
                  <option value="" style={{ background: "#1a1a2e", color: "#fff" }}>Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#1a1a2e", color: "#fff" }}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingVehicle(null); }}
                  className="glass-btn-ghost flex-1 py-3 rounded-2xl font-medium"
                >
                  Cancelar
                </button>
                <button type="submit"
                  className="glass-btn flex-1 py-3 rounded-2xl font-semibold"
                >
                  {editingVehicle ? "Guardar Cambios" : "Crear Vehículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
