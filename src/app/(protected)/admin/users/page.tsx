"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Clock,
  Trash2,
  Eye,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("¿Rechazar y eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingUsers = users.filter((u) => !u.approved);
  const approvedUsers = users.filter((u) => u.approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Gestionar Usuarios
          </h1>
          <p className="text-white/40 mt-1">Aprobá y administrá los registros</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/70">
              {pendingUsers.length} pendiente{pendingUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white/70">
              {approvedUsers.length} aprobado{approvedUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pendientes de aprobación
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(234,179,8,0.3), rgba(234,179,8,0.15))",
                      border: "1px solid rgba(234,179,8,0.3)",
                    }}
                  >
                    <User className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-white/50">{user.email}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Registrado: {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="glass-btn px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Rechazar"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Todos los usuarios
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/40">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(8,145,178,0.4))",
                              border: "1px solid rgba(6,182,212,0.3)",
                            }}
                          >
                            <User className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-white/50">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                            : "bg-white/10 text-white/60 border border-white/10 hover:bg-white/15"
                        }`}
                        title="Clic para cambiar rol"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          user.approved
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}
                      >
                        {user.approved ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aprobado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!user.approved && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="p-2 rounded-xl text-white/40 hover:text-green-400 hover:bg-white/10 transition-all"
                            title="Aprobar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(user.id)}
                          className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
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
        )}
      </div>
    </div>
  );
}
