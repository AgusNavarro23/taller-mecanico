"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Car, User, Calendar, Edit, Trash2, History } from "lucide-react";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  client: {
    id: string;
    name: string;
  };
  _count: {
    services: number;
  };
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
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vin: "",
    clientId: "",
  });

  useEffect(() => {
    fetchVehicles();
    fetchClients();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingVehicle(null);
        setFormData({
          plate: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          vin: "",
          clientId: "",
        });
        fetchVehicles();
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || "",
      vin: "",
      clientId: vehicle.client.id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este vehículo?")) return;

    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-black">Vehículos</h1>
          <p className="text-gray-500 mt-1">Gestiona los vehículos del taller</p>
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setFormData({
              plate: "",
              brand: "",
              model: "",
              year: new Date().getFullYear(),
              color: "",
              vin: "",
              clientId: "",
            });
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por patente, marca, modelo o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
        />
      </div>

      {/* Vehicles Table */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Servicios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-gray-dark text-white">
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-brand-black">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        {vehicle.color && (
                          <p className="text-sm text-gray-500">{vehicle.color}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        {vehicle.client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {vehicle.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {vehicle._count.services} servicio{vehicle._count.services !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver historial"
                        >
                          <History className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red-light rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-brand-black">
                {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none uppercase"
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    placeholder="Corolla"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    placeholder="Rojo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-lg transition-colors"
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
