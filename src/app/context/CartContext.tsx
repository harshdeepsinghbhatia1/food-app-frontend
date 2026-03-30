import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { cartAPI, menuAPI } from "../lib/api";
import { useAuth } from "./AuthContext";

export interface UICartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  subtotal: number;
  category: string;
}

interface CartContextType {
  items: UICartItem[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (menuItemId: string | number) => Promise<void>;
  removeFromCart: (menuItemId: string | number) => Promise<void>;
  updateQuantity: (menuItemId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    STARTERS:
      "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80",
    MAIN_COURSE:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    DESSERTS:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    BEVERAGES:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
  };
  return (
    images[(category ?? "").toUpperCase()] ||
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<UICartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);

      // Fetch cart and full menu at the same time
      const [cartData, menuItems] = await Promise.all([
        cartAPI.getCart(user.id),
        menuAPI.getAll(),
      ]);

      // Build a map of menuItemId -> image from the menu
      const imageMap: Record<string, string> = {};
      menuItems.forEach((m) => {
        imageMap[String(m.id)] = m.image || getCategoryImage(m.category);
      });

      const rawItems = cartData?.cartItems ?? (Array.isArray(cartData) ? cartData : []);

      const mapped: UICartItem[] = rawItems.map((item: any) => {
        const category = item.category ?? "";
        const menuItemId = String(item.menuItemId ?? item.cartItemId ?? "");
        return {
          id:       menuItemId,
          name:     item.itemName ?? item.menuItemName ?? item.name ?? "Unknown",
          price:    parseFloat(item.unitPrice ?? item.price ?? 0) || 0,
          quantity: parseInt(item.quantity ?? 1) || 1,
          subtotal: parseFloat(item.itemTotal ?? item.subtotal ?? 0) || 0,
          category: category,
          // use image from menu map first, then category fallback
          image:    imageMap[menuItemId] || getCategoryImage(category),
        };
      });

      setItems(mapped);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (menuItemId: string | number) => {
    if (!user) return;
    try {
      await cartAPI.addItem(user.id, menuItemId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  const removeFromCart = async (menuItemId: string | number) => {
    if (!user) return;
    try {
      await cartAPI.removeItem(user.id, menuItemId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      throw err;
    }
  };

  const updateQuantity = async (
    menuItemId: string | number,
    quantity: number
  ) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(menuItemId);
      return;
    }
    const current = items.find((i) => i.id === String(menuItemId));
    if (!current) return;
    const diff = quantity - current.quantity;
    if (diff === 0) return;
    try {
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          await cartAPI.increaseQty(user.id, menuItemId);
        }
      } else {
        for (let i = 0; i < Math.abs(diff); i++) {
          await cartAPI.decreaseQty(user.id, menuItemId);
        }
      }
      await refreshCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await cartAPI.clearCart(user.id);
      setItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}