const BASE_URL = "http://localhost:58822/api";

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API Error: ${response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available?: boolean;
  image?: string;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  spiceLevel?: number;
  rating?: number;
  reviews?: number;
  preparationTime?: string;
  calories?: number;
  ingredients?: string[];
}
export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartItems: CartItem[];
  grandTotal: number;
}

export interface OrderItem {
  orderItemId: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Order {
  orderId: string;
  userId: string;
  customerName: string;
  orderStatus: string;
  deliveryAddress: string;
  placedAt: string;
  orderTotal: number;
  items: OrderItem[];
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string;
  address?: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Different image for each category so no item looks the same
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
    images[category.toUpperCase()] ||
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
  );
}

function normalizeOrder(o: any): Order {
  const itemList = (o.items ?? []).map((i: any) => ({
    orderItemId: String(i.orderItemId ?? ""),
    menuItemId:  String(i.menuItemId ?? ""),
    itemName:    i.itemName ?? "",
    quantity:    Number(i.quantity) || 0,
    unitPrice:   parseFloat(i.unitPrice) || 0,
    itemTotal:   parseFloat(i.itemTotal) || 0,
  }));

  return {
    ...o,
    id:              String(o.orderId ?? ""),
    orderId:         String(o.orderId ?? ""),
    userId:          String(o.userId ?? ""),
    customerName:    o.customerName ?? "",
    orderStatus:     (o.orderStatus ?? "PENDING").toUpperCase(),
    status:          (o.orderStatus ?? "PENDING").toUpperCase(),
    deliveryAddress: o.deliveryAddress ?? "",
    placedAt:        o.placedAt ?? "",
    createdAt:       o.placedAt ?? "",
    orderTotal:      parseFloat(o.orderTotal) || 0,
    total:           parseFloat(o.orderTotal) || 0,
    items:           itemList,
  };
}

function flattenMenu(grouped: Record<string, any[]>): MenuItem[] {
  return Object.entries(grouped).flatMap(([category, items]) =>
    items.map((item: any) => ({
      ...item,
      id: String(item.itemId ?? item.id),
      category,
      // use imageUrl from backend first, then category fallback
      image: item.imageUrl || item.image || getCategoryImage(category),
    }))
  );
}

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────

export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: string;
  }) =>
    apiCall<{
      message: string;
      userId: number;
      name: string;
      email: string;
      role: string;
    }>("/users/register", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        role: (data.role ?? "CUSTOMER").toUpperCase(),
      }),
    }),

  login: (email: string, password: string) =>
    apiCall<{
      message: string;
      userId: number;
      name: string;
      email: string;
      role: string;
    }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall<{ message: string }>("/users/logout", { method: "POST" }),

  getProfile: (userId: string | number) =>
    apiCall<UserProfile>(`/users/${userId}`),
};

// ─────────────────────────────────────────────
// MENU API
// ─────────────────────────────────────────────

export const menuAPI = {
  getAll: async (): Promise<MenuItem[]> => {
    const grouped = await apiCall<Record<string, any[]>>("/menu");
    return flattenMenu(grouped);
  },

 getById: async (id: string): Promise<MenuItem> => {
    const item = await apiCall<any>(`/menu/${id}`);
    return {
      ...item,
      id: String(item.itemId ?? item.id),
      image: item.imageUrl || item.image || getCategoryImage(item.category ?? ""),
    };
  },

  adminGetAll: async (): Promise<MenuItem[]> => {
    const items = await apiCall<any[]>("/menu/admin/all");
    return items.map((item) => ({
      ...item,
      id: String(item.itemId ?? item.id),
      image: item.imageUrl || item.image || getCategoryImage(item.category ?? ""),
    }));
  },
 create: async (data: Partial<MenuItem>) => {
    const item = await apiCall<any>("/menu/admin", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: data.price,
        category: (data.category ?? "").toUpperCase(),
        imageUrl: data.imageUrl ?? "",
      }),
    });
    return { ...item, id: String(item.itemId ?? item.id) };
  },

  update: async (id: string, data: Partial<MenuItem>) => {
    const item = await apiCall<any>(`/menu/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: data.price,
        category: (data.category ?? "").toUpperCase(),
        imageUrl: data.imageUrl ?? "",
      }),
    });
    return { ...item, id: String(item.itemId ?? item.id) };
  },
  delete: (id: string) =>
    apiCall<{ message: string }>(`/menu/admin/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────
// CART API
// ─────────────────────────────────────────────

export const cartAPI = {
  getCart: (userId: string | number) =>
    apiCall<any>(`/cart/${userId}`),

  addItem: (userId: string | number, menuItemId: string | number) =>
    apiCall<any>(`/cart/${userId}/add/${menuItemId}`, { method: "POST" }),

  increaseQty: (userId: string | number, menuItemId: string | number) =>
    apiCall<any>(`/cart/${userId}/increase/${menuItemId}`, { method: "PUT" }),

  decreaseQty: (userId: string | number, menuItemId: string | number) =>
    apiCall<any>(`/cart/${userId}/decrease/${menuItemId}`, { method: "PUT" }),

  removeItem: (userId: string | number, menuItemId: string | number) =>
    apiCall<any>(`/cart/${userId}/remove/${menuItemId}`, { method: "DELETE" }),

  clearCart: (userId: string | number) =>
    apiCall<any>(`/cart/${userId}/clear`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────
// ORDERS API
// ─────────────────────────────────────────────

export const ordersAPI = {
  place: async (userId: string | number, deliveryAddress: string): Promise<Order> => {
    const raw = await apiCall<any>("/orders/place", {
      method: "POST",
      body: JSON.stringify({ userId: Number(userId), deliveryAddress }),
    });
    return normalizeOrder(raw);
  },

  getHistory: async (userId: string | number): Promise<Order[]> => {
    const raw = await apiCall<any[]>(`/orders/history/${userId}`);
    return raw.map(normalizeOrder);
  },

  getById: async (orderId: string | number): Promise<Order> => {
    const raw = await apiCall<any>(`/orders/${orderId}/status`);
    return normalizeOrder(raw);
  },

  adminGetPaged: async (page = 0, size = 10) => {
    const raw = await apiCall<any>(
      `/orders/admin/paged?page=${page}&size=${size}`
    );
    return {
      ...raw,
      orders: (raw.orders ?? []).map(normalizeOrder),
    };
  },

  adminGetAll: async (): Promise<Order[]> => {
    const raw = await apiCall<any[]>("/orders/admin/all");
    return raw.map(normalizeOrder);
  },

  advanceStatus: async (orderId: string | number): Promise<Order> => {
    const raw = await apiCall<any>(`/orders/admin/${orderId}/advance`, {
      method: "PUT",
    });
    return normalizeOrder(raw);
  },

  cancelOrder: async (orderId: string | number): Promise<Order> => {
    const raw = await apiCall<any>(`/orders/admin/${orderId}/cancel`, {
      method: "PUT",
    });
    return normalizeOrder(raw);
  },

  // Backward-compat aliases
  getAll: async (): Promise<Order[]> => ordersAPI.adminGetAll(),
  create: async (data: any): Promise<Order> =>
    ordersAPI.place(data.userId ?? data.customerId, data.deliveryAddress ?? ""),
  updateStatus: async (id: string, _status: string): Promise<Order> =>
    ordersAPI.advanceStatus(id),
};