import { useState } from "react";
import { User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function Profile() {
  const { user, login, register, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
  });
  const [authError, setAuthError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await login(loginData.email, loginData.password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      setAuthError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await register(registerData);
      toast.success("Account created! Please sign in with your credentials.");
      setLoginData({ email: registerData.email, password: "" });
      setActiveTab("login");
      setRegisterData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "CUSTOMER",
      });
    } catch (err: any) {
      setAuthError(err?.message || "Registration failed. Email may already be in use.");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // ── Logged-in view ──
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">My Profile</h1>
            <p className="text-lg text-white/90">Manage your account</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-orange-100 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white">
                      <User className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                      <span
                        className={`inline-block mt-1 px-3 py-0.5 rounded-full text-sm font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "ADMIN" ? "🔑 Admin" : "👤 Customer"}
                      </span>
                    </div>
                  </div>

                  {/* Logout button */}
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-orange-600" /> Full Name
                    </Label>
                    <Input
                      value={user.name}
                      disabled
                      className="border-orange-200 opacity-70"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-orange-600" /> Email
                    </Label>
                    <Input
                      value={user.email}
                      disabled
                      className="border-orange-200 opacity-70"
                    />
                  </div>
                  {user.phone && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-orange-600" /> Phone
                      </Label>
                      <Input
                        value={user.phone}
                        disabled
                        className="border-orange-200 opacity-70"
                      />
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-600" /> Address
                      </Label>
                      <Textarea
                        value={user.address}
                        disabled
                        rows={2}
                        className="border-orange-200 opacity-70"
                      />
                    </div>
                  )}
                </div>

                {user.role === "ADMIN" && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-orange-800 font-semibold mb-3">
                      🔑 Admin Access — Manage your restaurant
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => navigate("/admin")}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => navigate("/admin/menu")}
                      >
                        Manage Menu
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => navigate("/admin/orders")}
                      >
                        Manage Orders
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Account</h1>
          <p className="text-lg text-white/90">Sign in or create an account</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6 bg-white border border-orange-200">
              <TabsTrigger
                value="login"
                className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email *</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password *</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="••••••••"
                      />
                    </div>
                    {authError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {authError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name">Full Name *</Label>
                      <Input
                        id="reg-name"
                        required
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, name: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password *</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        required
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, password: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-phone">Phone (optional)</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, phone: e.target.value })
                        }
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-address">Default Address (optional)</Label>
                      <Textarea
                        id="reg-address"
                        value={registerData.address}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, address: e.target.value })
                        }
                        rows={2}
                        className="border-orange-200 focus:border-orange-400"
                        placeholder="123 Main St, City"
                      />
                    </div>

                    {/* Role Selector */}
                    <div>
                      <Label htmlFor="reg-role">Register As *</Label>
                      <Select
                        value={registerData.role}
                        onValueChange={(value) =>
                          setRegisterData({ ...registerData, role: value })
                        }
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">
                            👤 Customer — Browse menu and place orders
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            🔑 Admin — Manage menu and orders
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {authError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {authError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}