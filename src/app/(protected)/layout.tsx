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
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3), transparent)" }}
        />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full opacity-10 animate-float"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.2), transparent)", animationDelay: "3s" }}
        />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full opacity-15 animate-float"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent)", animationDelay: "5s" }}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
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
        className={`transition-all duration-300 relative z-10 ${
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
