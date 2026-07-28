"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFirstUser(data.isFirstUser);
        setSuccess(true);
        setTimeout(() => router.push("/login?registered=true"), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Error al crear el usuario");
      }
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-sm relative z-10">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: isFirstUser
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(234, 179, 8, 0.2)",
                border: `1px solid ${isFirstUser ? "rgba(139, 92, 246, 0.3)" : "rgba(234, 179, 8, 0.3)"}`,
              }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: isFirstUser ? "#a78bfa" : "#fbbf24" }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {isFirstUser ? "¡Administrador creado!" : "¡Cuenta creada!"}
            </h2>
            <p className="text-white/50 text-sm mb-3">
              {isFirstUser
                ? "Sos el administrador del sistema. Ya podés iniciar sesión."
                : "Tu cuenta fue creada. Está pendiente de aprobación del administrador."}
            </p>
            {!isFirstUser && (
              <p className="text-xs text-white/40 mb-3">
                Te notificaremos cuando puedas iniciar sesión.
              </p>
            )}
            <p className="text-xs text-white/30">Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full animate-float opacity-20"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent)" }}
      />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full animate-float opacity-10"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.3), transparent)", animationDelay: "3s" }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 animate-float"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.7), rgba(8,145,178,0.8))",
              border: "1px solid rgba(6,182,212,0.4)",
              boxShadow: "0 8px 32px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Image src="/Logo.jpeg" alt="Taller Rocko" width={36} height={36} className="rounded-lg object-cover" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Taller Rocko</h1>
          <p className="text-white/40 mt-1 text-sm">Sistema de Gestión</p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-center text-white mb-5">Crear Cuenta</h2>

          {error && (
            <div className="rounded-xl px-3 py-2 mb-4 text-xs font-medium"
              style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="Tu nombre"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-white/30">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs" style={{ color: "#fca5a5" }}>Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword !== "" && password !== confirmPassword)}
              className="glass-btn w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : "Crear Cuenta"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-white/80 hover:text-white font-medium transition-colors">
              Iniciá sesión
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/login" className="inline-flex items-center text-white/30 hover:text-white/60 transition-colors text-xs">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
