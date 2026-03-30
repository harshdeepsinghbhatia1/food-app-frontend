import { Outlet, Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Utensils,
  LogOut,
  User,
  Settings,
  ClipboardList,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export function Layout() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                FoodieHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium">
                Home
              </Link>

              {/* ADMIN nav — only admin-related links */}
              {isAdmin ? (
                <>
                  <Link to="/admin" className="text-orange-600 font-semibold hover:text-orange-700">
                    Dashboard
                  </Link>
                  <Link to="/admin/menu" className="text-orange-600 font-semibold hover:text-orange-700">
                    Menu Management
                  </Link>
                  <Link to="/admin/orders" className="text-orange-600 font-semibold hover:text-orange-700">
                    Order Management
                  </Link>
                </>
              ) : (
                /* CUSTOMER nav */
                <>
                  <Link to="/menu" className="text-gray-700 hover:text-orange-600 font-medium">
                    Menu
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-orange-600 font-medium">
                    My Orders
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Cart — ONLY for customers, not admins */}
              {!isAdmin && (
                <button
                  onClick={() => navigate("/cart")}
                  className="relative p-2 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <>
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-semibold text-gray-800 leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs text-orange-500 leading-none mt-0.5">
                            {user.role}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
                      {/* User info header */}
                      <div className="px-3 py-2 border-b border-gray-100 bg-orange-50">
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs font-medium text-orange-600 mt-0.5">{user.role}</p>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="cursor-pointer gap-2 mt-1"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </DropdownMenuItem>

                      {/* CUSTOMER-only dropdown items */}
                      {!isAdmin && (
                        <>
                          <DropdownMenuItem
                            onClick={() => navigate("/orders")}
                            className="cursor-pointer gap-2"
                          >
                            <ClipboardList className="w-4 h-4" />
                            My Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/cart")}
                            className="cursor-pointer gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            My Cart
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* ADMIN-only dropdown items */}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate("/admin")}
                            className="cursor-pointer gap-2 text-orange-600"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/admin/menu")}
                            className="cursor-pointer gap-2 text-orange-600"
                          >
                            <Settings className="w-4 h-4" />
                            Menu Management
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/admin/orders")}
                            className="cursor-pointer gap-2 text-orange-600"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Order Management
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      {/* Logout — always visible */}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer gap-2 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Always visible Logout button */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hidden md:flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Hamburger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="md:hidden p-2 rounded-lg hover:bg-orange-100">
                    <MenuIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    Home
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/menu")}>
                        Menu Management
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/orders")}>
                        Order Management
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/menu")}>
                        Menu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/cart")}>
                        My Cart
                      </DropdownMenuItem>
                    </>
                  )}
                  {user && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 font-semibold"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">FoodieHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Delicious food delivered to your doorstep.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {isAdmin ? (
                  <>
                    <li>
                      <Link to="/admin" className="hover:text-orange-400 transition-colors">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/menu" className="hover:text-orange-400 transition-colors">
                        Menu Management
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/orders" className="hover:text-orange-400 transition-colors">
                        Order Management
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/menu" className="hover:text-orange-400 transition-colors">
                        Menu
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="hover:text-orange-400 transition-colors">
                        Track Order
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: support@foodiehub.com</li>
                <li>Phone: +91 98765 43210</li>
                <li>Hours: 9 AM - 11 PM</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">F</a>
                <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">T</a>
                <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">I</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            © 2026 FoodieHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}