"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookMarked,
  Printer,
  BarChart3,
  LogOut,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  PlusCircle,
  Wallet,
  QrCode,
  Menu,
  X,
  Truck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

export default function SideTable({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persistir estado del sidebar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebar-open", JSON.stringify(newState));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Menu toggle button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-56" : "w-0"
        } flex-shrink-0 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <div className="h-16 flex items-center justify-center px-4 bg-gray-900 min-w-56">
          <h1 className="text-lg font-bold tracking-wider">Panel de Control</h1>
        </div>
        <nav className="flex-grow mt-5 min-w-56">
          <NavLink
            href="/admin/dashboard"
            icon={<TrendingUp size={20} />}
            isActive={pathname.startsWith("/admin/dashboard")}
          >
            Dashboard
          </NavLink>
          <NavLink
            href="/staff/dashboard"
            icon={<LayoutGrid size={20} />}
            isActive={pathname === "/staff/dashboard"}
          >
            Pedidos
          </NavLink>
          <NavLink
            href="/staff/create-order"
            icon={<PlusCircle size={20} />}
            isActive={pathname === "/staff/create-order"}
          >
            Agregar Pedido
          </NavLink>
          <NavLink
            href="/staff/transactions"
            icon={<Wallet size={20} />}
            isActive={pathname === "/staff/transactions"}
          >
            Transacciones
          </NavLink>
          <NavLink
            href="/admin/menu"
            icon={<BookMarked size={20} />}
            isActive={
              pathname.startsWith("/admin/menu") ||
              pathname.startsWith("/staff/menu")
            }
          >
            Menú
          </NavLink>
          <NavLink
            href="/admin/delivery-setup"
            icon={<Truck size={20} />}
            isActive={pathname.startsWith("/admin/delivery-setup")}
          >
            Delivery
          </NavLink>
          <NavLink
            href="/admin/costs"
            icon={<DollarSign size={20} />}
            isActive={pathname.startsWith("/admin/costs")}
          >
            Costos
          </NavLink>
          <NavLink
            href="/admin/printers"
            icon={<Printer size={20} />}
            isActive={
              pathname.startsWith("/admin/printers") ||
              pathname.startsWith("/staff/printers")
            }
          >
            Impresoras
          </NavLink>
          <NavLink
            href="/admin/reports"
            icon={<BarChart3 size={20} />}
            isActive={
              pathname.startsWith("/admin/reports") ||
              pathname.startsWith("/staff/reports")
            }
          >
            Reportes
          </NavLink>
          <NavLink
            href="/staff/qr-codes"
            icon={<QrCode size={20} />}
            isActive={pathname.startsWith("/staff/qr-codes")}
          >
            Códigos QR
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700 min-w-56">
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
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <main className="flex-1 p-8 pt-10">{children}</main>
      </div>
    </div>
  );
}
