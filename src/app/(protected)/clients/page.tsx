"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Phone, Mail, Car, Edit, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  dni: string | null;
  _count: {
    vehicles: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dni: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: "", phone: "", email: "", address: "", dni: "" });
        fetchClients();
      }
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      dni: client.dni || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(220,38,38,0.8)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Clientes</h1>
          <p className="text-white/60 mt-1">Gestiona los clientes de tu taller</p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setFormData({ name: "", phone: "", email: "", address: "", dni: "" });
            setShowModal(true);
          }}
          className="glass-btn inline-flex items-center justify-center px-4 py-2 font-medium rounded-2xl transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="glass-card text-center py-12 rounded-2xl">
          <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="glass-card card-hover rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.2)" }}>
                  <span className="text-white font-semibold text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-white/40 hover:text-[rgba(220,38,38,1)] hover:bg-[rgba(220,38,38,0.1)] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{client.name}</h3>

              <div className="space-y-2 text-sm text-white/60">
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-center">
                  <Car className="w-4 h-4 mr-2" />
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
          <div className="glass-card rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-2xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">DNI</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-2xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-2xl"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                  }}
                  className="glass-btn-ghost flex-1 px-4 py-2 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="glass-btn flex-1 px-4 py-2 rounded-2xl transition-colors"
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
