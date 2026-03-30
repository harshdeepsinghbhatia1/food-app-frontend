import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Star, Leaf, Flame, ShoppingCart } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { menuAPI, MenuItem } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuAPI.getAll();
      // Filter to only available items for customers
      setMenuItems(items.filter((i) => i.available !== false));
    } catch (error) {
      console.error("Failed to load menu:", error);
      toast.error("Failed to load menu. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault(); // don't navigate to detail page
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }
    setAddingId(item.id);
    try {
      await addToCart(item.id);
      toast.success(`${item.name} added to cart!`);
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingId(null);
    }
  };

  // Categories come from backend enum names e.g. "STARTERS", "MAINS"
  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Menu</h1>
          <p className="text-lg text-white/90">Discover our delicious selection of dishes</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-white border border-orange-200 flex-wrap h-auto gap-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No dishes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link to={`/menu/${item.id}`} key={item.id}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-orange-100 h-full">
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {item.isVegetarian && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Leaf className="w-3 h-3 mr-1" /> Veg
                        </Badge>
                      )}
                      {item.isVegan && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Vegan</Badge>
                      )}
                      {item.spiceLevel && item.spiceLevel > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600">
                          <Flame className="w-3 h-3 mr-1" /> Spicy
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        {item.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-orange-600">
                        ₹{item.price.toFixed(2)}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{item.rating}</span>
                          {item.reviews && (
                            <span className="text-gray-500">({item.reviews})</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={addingId === item.id}
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addingId === item.id ? "Adding..." : "Add to Cart"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
