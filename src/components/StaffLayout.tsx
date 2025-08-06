"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Wallet,
  BookMarked,
  Printer,
  BarChart3,
  LogOut,
  PlusCircle,
  QrCode,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import GlobalNotificationService from "./GlobalNotificationService";

const NavLink = ({
  href,
  icon,
  children,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-yellow-600 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`}
  >
    {icon}
    <span className="ml-3">{children}</span>
  </Link>
);

export default function StaffLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Escuchar eventos de toggle sidebar desde OrderList
  useEffect(() => {
    // Exponer la función globalmente para que OrderList la pueda usar directamente
    (window as any).toggleStaffSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    
    return () => {
      delete (window as any).toggleStaffSidebar;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Global Notification Service - Runs silently in background */}
      <GlobalNotificationService />
      
      {/* Hamburger Menu Button - Solo visible cuando está cerrado y no es dashboard */}
      {!isSidebarOpen && pathname !== '/staff/dashboard' && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-56 bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "-ml-56"
        } flex flex-col h-screen shadow-lg flex-shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 bg-gray-900">
          <h1 className="text-lg font-bold tracking-wider">Staff Panel</h1>
          {/* X para cerrar - Solo visible cuando está abierto */}
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <nav className="flex-grow mt-5">
          <NavLink
            href="/staff/dashboard"
            icon={<LayoutGrid size={20} />}
            isActive={pathname === "/staff/dashboard"}
onClick={() => {}}
          >
            Pedidos
          </NavLink>
          <NavLink
            href="/staff/create-order"
            icon={<PlusCircle size={20} />}
            isActive={pathname === "/staff/create-order"}
onClick={() => {}}
          >
            Agregar Pedido
          </NavLink>
          <NavLink
            href="/staff/transactions"
            icon={<Wallet size={20} />}
            isActive={pathname === "/staff/transactions"}
onClick={() => {}}
          >
            Transacciones
          </NavLink>
          <NavLink
            href="/staff/menu"
            icon={<BookMarked size={20} />}
            isActive={pathname.startsWith("/staff/menu")}
onClick={() => {}}
          >
            Menú
          </NavLink>
          <NavLink
            href="/staff/printers"
            icon={<Printer size={20} />}
            isActive={pathname.startsWith("/staff/printers")}
onClick={() => {}}
          >
            Impresoras
          </NavLink>
          <NavLink
            href="/staff/reports"
            icon={<BarChart3 size={20} />}
            isActive={pathname.startsWith("/staff/reports")}
onClick={() => {}}
          >
            Reportes
          </NavLink>
          <NavLink
            href="/staff/qr-codes"
            icon={<QrCode size={20} />}
            isActive={pathname.startsWith("/staff/qr-codes")}
onClick={() => {}}
          >
            Códigos QR
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div
            className="text-xs text-gray-400 mb-2 truncate"
            title={userEmail}
          >
            {userEmail}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium transition-colors text-gray-300 hover:bg-gray-900 hover:text-white rounded-md"
          >
            <LogOut size={20} />
            <span className="ml-3">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-8 pt-16 transition-all duration-300 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
