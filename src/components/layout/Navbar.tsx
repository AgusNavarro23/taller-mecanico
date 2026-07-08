"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell, User } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "rgba(10, 10, 15, 0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
              style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
            />
          </button>

          {/* User */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white/90">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-white/40">
                {session?.user?.email || "admin@taller.com"}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(153,27,27,0.4))",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-9 h-9 rounded-xl" />
              ) : (
                <User className="w-4 h-4 text-white/80" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
