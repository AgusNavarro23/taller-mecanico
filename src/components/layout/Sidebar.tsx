"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Wrench,
  LayoutDashboard,
  Users,
  Car,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clients", icon: Users },
  { label: "Vehículos", href: "/vehicles", icon: Car },
  { label: "Servicios", href: "/services", icon: Wrench },
];

interface SidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 sidebar-transition
          ${isOpen ? "w-64" : "w-20"}
          hidden lg:flex flex-col`}
        style={{
          background: "linear-gradient(180deg, rgba(10,10,15,0.92) 0%, rgba(15,15,25,0.95) 100%)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.8), rgba(8,145,178,0.9))",
                border: "1px solid rgba(6,182,212,0.4)",
              }}
            >
              <Wrench className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <span className="text-lg font-bold text-white tracking-tight">Taller Mecánico</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 group ${
                      isActive ? "text-white" : "text-white/50 hover:text-white/80"
                    }`}
                    style={isActive ? {
                      background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.1))",
                      border: "1px solid rgba(6,182,212,0.3)",
                      boxShadow: "0 4px 16px rgba(6,182,212,0.15)",
                    } : {
                      border: "1px solid transparent",
                    }}
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isOpen ? "mr-3" : "mx-auto"}`} />
                    {isOpen && <span className="whitespace-nowrap font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-3 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group"
            title={!isOpen ? "Cerrar sesión" : undefined}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-1 ${isOpen ? "mr-3" : "mx-auto"}`} />
            {isOpen && <span className="whitespace-nowrap font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 sidebar-transition transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden flex flex-col`}
        style={{
          background: "linear-gradient(180deg, rgba(10,10,15,0.96) 0%, rgba(15,15,25,0.98) 100%)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "4px 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.8), rgba(8,145,178,0.9))",
                border: "1px solid rgba(6,182,212,0.4)",
              }}
            >
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Taller Mecánico</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${
                      isActive ? "text-white" : "text-white/50 hover:text-white/80"
                    }`}
                    style={isActive ? {
                      background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.1))",
                      border: "1px solid rgba(6,182,212,0.3)",
                      boxShadow: "0 4px 16px rgba(6,182,212,0.15)",
                    } : {
                      border: "1px solid transparent",
                    }}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-3 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
