# API Integration Guide

## Overview

This frontend is designed to connect to your backend API. The API integration layer is located in `/src/app/lib/api.ts`. Currently, it uses mock data for demonstration purposes.

## Backend Configuration

### Step 1: Update Base URL

Open `/src/app/lib/api.ts` and update the `BASE_URL` constant with your backend URL:

```typescript
const BASE_URL = "YOUR_BACKEND_URL_HERE"; 
// Example: "http://localhost:3000/api" or "https://api.yourapp.com"
```

### Step 2: Enable Real API Calls

The API functions are already structured to call your backend. Simply uncomment the API call lines and comment out the mock data returns:

#### Menu API Example

```typescript
export const menuAPI = {
  getAll: async () => {
    return apiCall<MenuItem[]>('/menu');  // Uncomment this
    // return Promise.resolve(mockMenuItems);  // Comment this out
  },

  getById: async (id: string) => {
    return apiCall<MenuItem>(`/menu/${id}`);  // Uncomment this
    // return Promise.resolve(mockMenuItems.find((item) => item.id === id));  // Comment out
  },
  
  // ... same for create, update, delete
};
```

#### Orders API Example

```typescript
export const ordersAPI = {
  getAll: async () => {
    return apiCall<Order[]>('/orders');  // Uncomment this
    // return Promise.resolve(mockOrders);  // Comment out
  },
  
  // ... same for other methods
};
```

## Expected API Endpoints

Your backend should implement the following endpoints:

### Menu Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/menu` | Get all menu items | - | `MenuItem[]` |
| GET | `/menu/:id` | Get menu item by ID | - | `MenuItem` |
| POST | `/menu` | Create new menu item | `MenuItem` | `MenuItem` |
| PUT | `/menu/:id` | Update menu item | `MenuItem` | `MenuItem` |
| DELETE | `/menu/:id` | Delete menu item | - | `{ success: boolean }` |

### Order Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/orders` | Get all orders | - | `Order[]` |
| GET | `/orders/:id` | Get order by ID | - | `Order` |
| POST | `/orders` | Create new order | `CreateOrderRequest` | `Order` |
| PATCH | `/orders/:id/status` | Update order status | `{ status: string }` | `Order` |

### Authentication Endpoints (Optional)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | User login | `{ email, password }` | `{ user, token }` |
| POST | `/auth/register` | User registration | `{ name, email, password }` | `{ user, token }` |
| POST | `/auth/logout` | User logout | - | `{ success: boolean }` |

## Data Types

### MenuItem Type

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: number;
  rating?: number;
  reviews?: number;
  preparationTime?: string;
  calories?: number;
  ingredients?: string[];
}
```

### Order Type

```typescript
interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  deliveryAddress?: string;
  phone?: string;
}
```

## Authentication

The authentication is managed in `/src/app/context/AuthContext.tsx`. To integrate with your backend:

1. Update the `login` function to call your `/auth/login` endpoint
2. Store the authentication token (e.g., in localStorage or cookies)
3. Include the token in API requests headers

Example:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store token
  localStorage.setItem('token', data.token);
  
  // Set user
  setUser(data.user);
};
```

Then update the `apiCall` function to include the token:

```typescript
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

## CORS Configuration

Make sure your backend has CORS enabled to accept requests from your frontend domain:

```javascript
// Example for Express.js
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

## Error Handling

The app uses `sonner` for toast notifications. API errors are caught and displayed to users. You can customize error messages in each page component.

## Testing

1. Start with mock data to test the UI
2. Gradually switch to real API endpoints
3. Test each feature:
   - Menu browsing and filtering
   - Add to cart
   - Checkout flow
   - Order tracking
   - Admin panel (menu management, order management)

## Environment Variables

Consider using environment variables for configuration:

Create a `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Then use it in your code:
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## Additional Features to Implement

1. **Image Upload**: Implement image upload for menu items in the admin panel
2. **Real-time Updates**: Consider using WebSockets for real-time order status updates
3. **Payment Integration**: Integrate with Stripe, PayPal, or your payment provider
4. **Analytics**: Add tracking for user behavior and sales analytics

## Support

If you encounter any issues during integration, check:
1. Network tab in browser DevTools for API errors
2. Console for JavaScript errors
3. Backend logs for server-side issues

Make sure your backend responses match the expected data types defined in `/src/app/lib/api.ts`.
