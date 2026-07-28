"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Cuenta creada exitosamente. Ya podés iniciar sesión.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        if (result.error.includes("pendiente de aprobación")) {
          setError("Tu cuenta está pendiente de aprobación del administrador. Contactá al administrador del taller.");
        } else {
          setError("Email o contraseña incorrectos");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-bold text-center text-white mb-5">Iniciar Sesión</h2>

      {error && (
        <div className="rounded-xl px-3 py-2 mb-4 text-xs font-medium"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl px-3 py-2 mb-4 text-xs font-medium flex items-center"
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#6ee7b7",
          }}
        >
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glass-btn w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          ) : "Ingresar"}
        </button>
      </form>

      <div className="mt-5">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-white/30">O continúa con</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="glass-btn-ghost flex items-center justify-center py-2 rounded-xl text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="ml-2">Google</span>
          </button>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="glass-btn-ghost flex items-center justify-center py-2 rounded-xl text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span className="ml-2">GitHub</span>
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-white/40">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-white/80 hover:text-white font-medium transition-colors">
          Registrate aquí
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full animate-float opacity-20"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent)" }}
      />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full animate-float opacity-10"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.3), transparent)", animationDelay: "2s" }}
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

        <Suspense fallback={
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-cyan-500 animate-spin" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
