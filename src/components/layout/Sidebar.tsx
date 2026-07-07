"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Wrench,
  LayoutDashboard,
  Users,
  Car,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Vehículos",
    href: "/vehicles",
    icon: Car,
  },
  {
    label: "Servicios",
    href: "/services",
    icon: Wrench,
  },
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
        className={`fixed top-0 left-0 h-full bg-brand-black text-white z-50 sidebar-transition
          ${isOpen ? "w-64" : "w-20"}
          hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-gray-mid">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <span className="text-lg font-bold whitespace-nowrap">Taller Mecánico</span>
            )}
          </div>
          <button
            onClick={() => {}}
            className="p-1 rounded-lg hover:bg-brand-gray-mid transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
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
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-brand-red text-white"
                        : "text-gray-300 hover:bg-brand-gray-mid hover:text-white"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isOpen ? "mr-3" : "mx-auto"}`} />
                    {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-brand-gray-mid p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-3 py-3 text-gray-300 hover:bg-brand-gray-mid hover:text-white rounded-lg transition-all duration-200"
            title={!isOpen ? "Cerrar sesión" : undefined}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 ${isOpen ? "mr-3" : "mx-auto"}`} />
            {isOpen && <span className="whitespace-nowrap">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-brand-black text-white z-50 sidebar-transition transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-gray-mid">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold">Taller Mecánico</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brand-gray-mid transition-colors"
          >
            <X className="w-5 h-5" />
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
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-brand-red text-white"
                        : "text-gray-300 hover:bg-brand-gray-mid hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-brand-gray-mid p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-3 py-3 text-gray-300 hover:bg-brand-gray-mid hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
