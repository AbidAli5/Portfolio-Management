import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {LogOut, User, Menu} from "lucide-react";
import {useState} from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({onMenuClick}: HeaderProps) {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {onMenuClick && (
              <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              Portfolio Manager
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
