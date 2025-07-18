import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Wallet, LogOut, BookMarked } from "lucide-react";

const NavLink = ({
  href,
  icon,
  children,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}) => (
  <Link
    href={href}
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
  onLogout,
}: {
  children: React.ReactNode;
  userEmail: string | undefined;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center px-4 bg-gray-900">
          <h1 className="text-2xl font-bold tracking-wider">QRMenu</h1>
        </div>
        <nav className="flex-grow mt-5">
          <NavLink
            href="/staff/dashboard"
            icon={<LayoutGrid size={20} />}
            isActive={pathname === "/staff/dashboard"}
          >
            Pedidos
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
            isActive={pathname.startsWith("/admin/menu")}
          >
            Menú
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
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium transition-colors text-gray-300 hover:bg-red-600 hover:text-white rounded-md"
          >
            <LogOut size={20} />
            <span className="ml-3">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
