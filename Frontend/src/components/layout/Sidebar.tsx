import {Link, useLocation} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {LayoutDashboard, TrendingUp, CreditCard, FileText, Users, Activity, X} from "lucide-react";
import {ROUTES} from "@/utils/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({isOpen, onClose}: SidebarProps) {
  const {isAdmin} = useAuth();
  const location = useLocation();

  const userMenuItems = [
    {icon: LayoutDashboard, label: "Dashboard", path: ROUTES.DASHBOARD},
    {icon: TrendingUp, label: "Investments", path: ROUTES.INVESTMENTS},
    {icon: CreditCard, label: "Transactions", path: ROUTES.TRANSACTIONS},
    {icon: FileText, label: "Reports", path: ROUTES.REPORTS},
  ];

  const adminMenuItems = [
    {icon: LayoutDashboard, label: "Admin Dashboard", path: ROUTES.ADMIN_DASHBOARD},
    {icon: Users, label: "User Management", path: ROUTES.ADMIN_USERS},
    {icon: Activity, label: "Activity Log", path: ROUTES.ADMIN_ACTIVITY},
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button onClick={onClose} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${active ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-100"}
                      `}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
