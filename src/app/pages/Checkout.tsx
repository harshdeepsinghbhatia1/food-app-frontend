import { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, User, Phone, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../lib/api";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    deliveryAddress: user?.address || "",
    phone: user?.phone || "",
  });

  if (!user) {
    navigate("/profile");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setLoading(true);
    try {
      // Backend places order from the user's current cart
      const order = await ordersAPI.place(user.id, formData.deliveryAddress);

      // Clear local cart state (backend cart is already cleared by placeOrder)
      await clearCart();

      toast.success("Order placed successfully! 🎉");
      setTimeout(() => navigate("/orders"), 1000);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(error?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Checkout</h1>
          <p className="text-lg text-white/90">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-semibold">Delivery Information</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Read-only customer info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-1 mb-1">
                          <User className="w-4 h-4" /> Full Name
                        </Label>
                        <Input
                          value={user.name}
                          disabled
                          className="border-orange-200 opacity-70"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-1 mb-1">
                          <Phone className="w-4 h-4" /> Phone Number
                        </Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="Your phone number"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        required
                        value={formData.deliveryAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, deliveryAddress: e.target.value })
                        }
                        rows={3}
                        placeholder="Enter your full delivery address"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment note */}
              <Card className="border-orange-100 bg-orange-50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">Payment</h2>
                  <p className="text-gray-600 text-sm">
                    💵 Cash on Delivery — Pay when your order arrives. Online payment
                    integration can be added later.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-orange-100 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span className="text-orange-600">₹{totalPrice.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? (
                      "Placing Order..."
                    ) : (
                      <>
                        Place Order <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Your order will be placed from your current cart items.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
