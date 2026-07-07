"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell, User } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Right side - User info */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.email || "admin@taller.com"}
              </p>
            </div>
            <div className="w-10 h-10 bg-brand-gray-dark rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
