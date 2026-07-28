"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Car, User, Edit, Trash2, History } from "lucide-react";

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
    color: "", vin: "", mileage: "", clientId: "",
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
        body: JSON.stringify({ ...formData, year: Number(formData.year), mileage: formData.mileage ? Number(formData.mileage) : undefined }),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingVehicle(null);
        setFormData({ plate: "", brand: "", model: "", year: new Date().getFullYear(), color: "", vin: "", mileage: "", clientId: "" });
        fetchVehicles();
      }
    } catch (e) { console.error(e); }
  };

  const handleEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ plate: v.plate, brand: v.brand, model: v.model, year: v.year, color: v.color || "", vin: "", mileage: "", clientId: v.client.id });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    fetchVehicles();
  };

  const filtered = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.client.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Vehículos</h1>
          <p className="text-white/40 mt-1">Gestiona los vehículos del taller</p>
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setFormData({ plate: "", brand: "", model: "", year: new Date().getFullYear(), color: "", vin: "", mileage: "", clientId: "" }); setShowModal(true); }}
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

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-16">
          <Car className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No se encontraron vehículos</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vehicle) => (
            <div key={vehicle.id} className="glass-card card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <Car className="w-6 h-6 text-cyan-400/80" />
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="p-2 rounded-xl text-white/40 hover:text-blue-400 hover:bg-white/10 transition-all"
                    title="Ver historial"
                  >
                    <History className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 rounded-xl text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {vehicle.brand} {vehicle.model}
              </h3>

              <div className="space-y-2 text-sm text-white/50">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wider mr-2"
                    style={{
                      background: "rgba(6,182,212,0.2)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      color: "#67e8f9",
                    }}
                  >
                    {vehicle.plate}
                  </span>
                  <span className="text-white/30">{vehicle.year}</span>
                  {vehicle.color && <span className="text-white/30 ml-2">{vehicle.color}</span>}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-white/30" />
                  {vehicle.client.name}
                </div>
                <div className="text-white/30">
                  {vehicle._count.services} servicio{vehicle._count.services !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-white">
                {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingVehicle(null); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-white/40 text-xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Patente *</label>
                <input type="text" value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="glass-input w-full px-4 py-3 rounded-2xl uppercase tracking-wider"
                  placeholder="ABC123" required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Marca *</label>
                  <input type="text" value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="Toyota" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Modelo *</label>
                  <input type="text" value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="Corolla" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Año *</label>
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
                <label className="block text-sm font-medium text-white/50 mb-2">Kilometraje (km)</label>
                <input type="number" value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl" placeholder="0" min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Cliente *</label>
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
