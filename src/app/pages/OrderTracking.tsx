import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, TruckIcon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ordersAPI, Order } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

const STATUS_MAP: Record<string, { label: string; className: string; step: number }> = {
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 border-yellow-300", step: 0 },
  PREPARING: { label: "Preparing", className: "bg-blue-100 text-blue-800 border-blue-300",       step: 1 },
  READY:     { label: "Ready",     className: "bg-purple-100 text-purple-800 border-purple-300", step: 2 },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-300",    step: 3 },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-300",          step: -1 },
};

const STEPS = ["Placed", "Preparing", "Ready", "Delivered"];

export function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadOrders();
    else setLoading(false);
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getHistory(user!.id);
      setOrders(data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Please log in</h2>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate("/profile")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Orders</h1>
          <p className="text-lg text-white/90">Track your orders and view order history</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">Start ordering delicious food from our menu!</p>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate("/menu")}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {orders.map((order) => {
              // use orderStatus (backend field) with fallback to status (alias)
              const status = (order.orderStatus ?? order.status ?? "PENDING").toUpperCase();
              const statusInfo = STATUS_MAP[status] ?? STATUS_MAP["PENDING"];
              const isCancelled = status === "CANCELLED";
              const total = parseFloat(String(order.orderTotal ?? order.total ?? 0)) || 0;

              return (
                <Card key={order.id} className="border-orange-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">Order #{order.orderId}</h3>
                          <Badge className={`${statusInfo.className} border`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                        </p>
                        {order.deliveryAddress && (
                          <p className="text-sm text-gray-500 mt-1">📍 {order.deliveryAddress}</p>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{total.toFixed(2)}
                      </p>
                    </div>

                    <Separator className="my-4" />

                    {/* Items — use itemName and unitPrice (backend field names) */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-3">Items</h4>
                      <div className="space-y-2">
                        {(order.items ?? []).map((item: any, index: number) => {
                          const itemName  = item.itemName ?? item.name ?? "Item";
                          const unitPrice = parseFloat(item.unitPrice ?? item.price ?? 0) || 0;
                          const qty       = parseInt(item.quantity ?? 1) || 1;
                          return (
                            <div
                              key={index}
                              className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg"
                            >
                              <span className="text-gray-700">{qty}x {itemName}</span>
                              <span className="font-medium">₹{(unitPrice * qty).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    {!isCancelled && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Order Status</h4>
                        <div className="flex justify-between items-center">
                          {STEPS.map((step, idx) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  idx <= statusInfo.step
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                                }`}>
                                  {idx <= statusInfo.step ? "✓" : idx + 1}
                                </div>
                                <span className="text-xs mt-1 text-center">{step}</span>
                              </div>
                              {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 mb-4 ${
                                  idx < statusInfo.step ? "bg-green-500" : "bg-gray-300"
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-700 font-medium">❌ This order was cancelled.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}