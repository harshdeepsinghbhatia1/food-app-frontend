import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Clock,
  Shield,
  Star,
  Truck,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { menuAPI, MenuItem } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      menuAPI
        .getAll()
        .then((items) => setFeaturedItems(items.slice(0, 4)))
        .catch(() => {});
    }
  }, [isAdmin]);

  // ── ADMIN HOME PAGE ──
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* Admin Hero */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-orange-400 font-semibold mb-2 text-lg">
                Welcome back,
              </p>
              <h1 className="text-5xl font-bold mb-4">
                {user?.name} 👋
              </h1>
              <p className="text-gray-300 text-xl mb-8">
                Manage your restaurant from one place — menu, orders, and more.
              </p>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 font-semibold"
                onClick={() => navigate("/admin")}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </section>

        {/* Admin Quick Actions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate("/admin")}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dashboard</h3>
                  <p className="text-gray-600 text-sm">
                    View revenue, order stats and recent activity
                  </p>
                  <Button
                    className="mt-4 bg-orange-500 hover:bg-orange-600 w-full"
                    onClick={() => navigate("/admin")}
                  >
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate("/admin/menu")}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Menu Management</h3>
                  <p className="text-gray-600 text-sm">
                    Add, edit or remove items from your menu
                  </p>
                  <Button
                    className="mt-4 bg-green-500 hover:bg-green-600 w-full"
                    onClick={() => navigate("/admin/menu")}
                  >
                    Manage Menu
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate("/admin/orders")}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Order Management</h3>
                  <p className="text-gray-600 text-sm">
                    View, advance or cancel customer orders
                  </p>
                  <Button
                    className="mt-4 bg-blue-500 hover:bg-blue-600 w-full"
                    onClick={() => navigate("/admin/orders")}
                  >
                    Manage Orders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Admin Info */}
        <section className="py-12 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl mb-2">🍽️</div>
                <h3 className="font-bold text-lg mb-1">Manage Menu</h3>
                <p className="text-gray-600 text-sm">
                  Add new dishes, update prices and soft-delete unavailable items
                </p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-bold text-lg mb-1">Track Orders</h3>
                <p className="text-gray-600 text-sm">
                  Advance order status from Pending → Preparing → Ready → Delivered
                </p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-bold text-lg mb-1">View Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Monitor revenue, top items and daily order trends
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── CUSTOMER HOME PAGE ──
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Delicious Food
              <br />
              <span className="text-yellow-300">Delivered Fast</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Order your favourite meals and get them delivered straight to your door.
            </p>
            <Link to="/menu">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 font-semibold shadow-xl"
              >
                Order Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Truck,  bg: "bg-orange-100", color: "text-orange-600", title: "Fast Delivery",  desc: "Get your food delivered in 30 minutes or less" },
              { icon: Star,   bg: "bg-green-100",  color: "text-green-600",  title: "Top Quality",   desc: "Fresh ingredients and premium quality meals" },
              { icon: Shield, bg: "bg-blue-100",   color: "text-blue-600",   title: "Safe & Secure", desc: "Contactless delivery and secure payments" },
              { icon: Clock,  bg: "bg-purple-100", color: "text-purple-600", title: "24/7 Service",  desc: "Order anytime, anywhere, we're always here" },
            ].map(({ icon: Icon, bg, color, title, desc }) => (
              <Card key={title} className="border-orange-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className={`${bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      {featuredItems.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-orange-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Featured Dishes</h2>
              <p className="text-gray-600 text-lg">
                Try our most popular and delicious items
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Link to={`/menu/${item.id}`} key={item.id}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-orange-100 h-full">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80";
                        }}
                      />
                    </div>
                    <CardContent className="p-4 flex flex-col gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{item.price.toFixed(2)}
                        </span>
                        {item.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{item.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600 mt-1"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/menu/${item.id}`);
                        }}
                      >
                        View Item <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/menu">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  View Full Menu <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of happy customers and experience the best food delivery service
          </p>
          <Link to="/menu">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold shadow-xl"
            >
              Start Ordering Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}