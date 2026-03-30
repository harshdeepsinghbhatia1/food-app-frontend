import { Outlet, Link, useNavigate } from "react-router";
import { LayoutDashboard, UtensilsCrossed, Package, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link to="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-orange-50 hover:text-orange-600"
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/menu">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-orange-50 hover:text-orange-600"
              >
                <UtensilsCrossed className="w-4 h-4 mr-3" />
                Menu Management
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-orange-50 hover:text-orange-600"
              >
                <Package className="w-4 h-4 mr-3" />
                Order Management
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
