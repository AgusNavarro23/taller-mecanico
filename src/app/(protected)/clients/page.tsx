"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Users, Phone, Mail, Car, Edit, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  dni: string | null;
  _count: { vehicles: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", dni: "",
  });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      setClients(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const res = await fetch(url, {
        method: editingClient ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: "", phone: "", email: "", address: "", dni: "" });
        fetchClients();
      }
    } catch (e) { console.error(e); }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name, phone: client.phone || "", email: client.email || "",
      address: client.address || "", dni: client.dni || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Clientes</h1>
          <p className="text-white/40 mt-1">Gestiona los clientes de tu taller</p>
        </div>
        <button
          onClick={() => { setEditingClient(null); setFormData({ name: "", phone: "", email: "", address: "", dni: "" }); setShowModal(true); }}
          className="glass-btn inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-2xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-16">
          <Users className="w-14 h-14 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No se encontraron clientes</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="glass-card card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <span className="text-cyan-400 font-semibold text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 rounded-xl text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{client.name}</h3>

              <div className="space-y-2 text-sm text-white/50">
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-white/30" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-white/30" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-center">
                  <Car className="w-4 h-4 mr-2 text-white/30" />
                  {client._count.vehicles} vehículo{client._count.vehicles !== 1 ? "s" : ""}
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
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingClient(null); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-white/40 text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Nombre *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl" required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Teléfono</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">DNI</label>
                  <input type="text" value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-2xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Dirección</label>
                <input type="text" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-2xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingClient(null); }}
                  className="glass-btn-ghost flex-1 py-3 rounded-2xl font-medium"
                >
                  Cancelar
                </button>
                <button type="submit"
                  className="glass-btn flex-1 py-3 rounded-2xl font-semibold"
                >
                  {editingClient ? "Guardar Cambios" : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
