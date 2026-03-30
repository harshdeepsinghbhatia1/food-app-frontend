import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Clock, Flame, Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { menuAPI, MenuItem } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function MenuItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    try {
      const data = await menuAPI.getById(id);
      setItem(data || null);
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!item) return;
    if (!user) {
      toast.error("Please log in to add items to cart");
      navigate("/profile");
      return;
    }
    setAdding(true);
    try {
      // Backend adds 1 unit per call — loop for selected quantity
      for (let i = 0; i < quantity; i++) {
        await addToCart(item.id);
      }
      toast.success(`Added ${quantity}× ${item.name} to cart!`);
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Item not found</h2>
        <Button onClick={() => navigate("/menu")}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/menu")}
          className="mb-6 hover:bg-orange-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <Card className="overflow-hidden border-orange-100">
              <div className="relative h-96 bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80";
                  }}
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {item.isVegetarian && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Leaf className="w-3 h-3 mr-1" /> Vegetarian
                    </Badge>
                  )}
                  {item.isVegan && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Vegan</Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <Badge variant="outline" className="mb-3 border-orange-300 text-orange-700">
                {item.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-3">{item.name}</h1>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{item.rating}</span>
                    {item.reviews && (
                      <span className="text-gray-500">({item.reviews} reviews)</span>
                    )}
                  </div>
                )}
                {item.preparationTime && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{item.preparationTime}</span>
                  </div>
                )}
                {item.spiceLevel && item.spiceLevel > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm">Spice Level: {item.spiceLevel}/5</span>
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-4">
                ₹{item.price.toFixed(2)}
              </p>
            </div>

            <Card className="mb-6 border-orange-100">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                {item.ingredients && item.ingredients.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="secondary">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
                {item.calories && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Calories:</span> {item.calories} kcal
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quantity + Add to Cart */}
            <Card className="border-orange-100">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-4 p-3 bg-orange-50 rounded-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{(item.price * quantity).toFixed(2)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {adding ? "Adding to Cart..." : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}