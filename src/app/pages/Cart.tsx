import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, loading } =
    useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Please log in</h2>
            <p className="text-gray-600 mb-8">
              You need to be logged in to view your cart.
            </p>
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => navigate("/profile")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items yet.
            </p>
            <Link to="/menu">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Browse Menu <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleRemove = async (menuItemId: string) => {
    try {
      await removeFromCart(menuItemId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleQtyChange = async (menuItemId: string, newQty: number) => {
    try {
      await updateQuantity(menuItemId, newQty);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Shopping Cart</h1>
          <p className="text-lg text-white/90">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border-orange-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {items.map((item) => {
                    const price    = item.price || 0;
                    const quantity = item.quantity || 1;
                    return (
                      <div key={item.id}>
                        <div className="flex gap-4">
                          {/* Item image — category based */}
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80";
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            {/* Item name from backend */}
                            <h3 className="font-semibold mb-1">{item.name}</h3>
                            {item.category && (
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-300 text-orange-700 mb-1"
                              >
                                {item.category}
                              </Badge>
                            )}
                            <p className="text-lg font-bold text-orange-600">
                              ₹{price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Subtotal: ₹{(price * quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-orange-300 hover:bg-orange-100"
                                onClick={() =>
                                  handleQtyChange(item.id, quantity - 1)
                                }
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-orange-300 hover:bg-orange-100"
                                onClick={() =>
                                  handleQtyChange(item.id, quantity + 1)
                                }
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-orange-100 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{(totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">
                      ₹{(totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 mb-3"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout{" "}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Link to="/menu">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-orange-300 hover:bg-orange-50"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}