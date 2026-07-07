"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <Navbar
          onMenuClick={() => {
            if (window.innerWidth >= 1024) {
              setSidebarOpen(!sidebarOpen);
            } else {
              setMobileSidebarOpen(!mobileSidebarOpen);
            }
          }}
        />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
