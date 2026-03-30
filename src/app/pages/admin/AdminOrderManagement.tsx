import { useState, useEffect } from "react";
import { Search, Eye, ChevronRight, XCircle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ordersAPI, Order } from "../../lib/api";
import { toast } from "sonner";

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-300",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-300",
  READY:     "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  PLACED:    "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.adminGetPaged(page, PAGE_SIZE);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.totalOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (orderId: string) => {
    setActionLoading(orderId + "_advance");
    try {
      const updated = await ordersAPI.advanceStatus(orderId);
      toast.success(`Order advanced to ${updated.orderStatus}`);
      loadOrders();
    } catch (error: any) {
      toast.error(error?.message || "Failed to advance order status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(orderId + "_cancel");
    try {
      await ordersAPI.cancelOrder(orderId);
      toast.success("Order cancelled");
      loadOrders();
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel order");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.deliveryAddress ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = orders.reduce(
    (acc, o) => {
      const s = o.orderStatus ?? o.status ?? "PENDING";
      return { ...acc, [s]: (acc[s] || 0) + 1 };
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage all customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {(["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const).map((s) => (
          <Card key={s} className="border-orange-100">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{s}</p>
              <p className="text-2xl font-bold text-orange-600">{statusCounts[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by order ID, customer, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="border-orange-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const status = (order.orderStatus ?? order.status ?? "PENDING").toUpperCase();
                  const total = parseFloat(String(order.orderTotal ?? order.total ?? 0)) || 0;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">#{order.orderId}</TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customerName || `User #${order.userId}`}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{order.deliveryAddress}</p>
                      </TableCell>
                      <TableCell>
                        {(order.items ?? []).length} item{(order.items ?? []).length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        ₹{total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_STYLE[status] ?? ""} border`}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedOrder(order); setIsDialogOpen(true); }}
                            className="hover:bg-orange-100"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {status !== "DELIVERED" && status !== "CANCELLED" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAdvance(order.id)}
                                className="hover:bg-green-100 text-green-700"
                                disabled={actionLoading === order.id + "_advance"}
                                title="Advance status"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(order.id)}
                                className="hover:bg-red-100 text-red-600"
                                disabled={actionLoading === order.id + "_cancel"}
                                title="Cancel order"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <p>Total: {totalOrders} orders</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-3 py-1 bg-white border rounded">
            {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details — #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const status = (selectedOrder.orderStatus ?? selectedOrder.status ?? "PENDING").toUpperCase();
            const total = parseFloat(String(selectedOrder.orderTotal ?? selectedOrder.total ?? 0)) || 0;
            return (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold">
                      {selectedOrder.customerName || `User #${selectedOrder.userId}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={`${STATUS_STYLE[status]} border`}>
                      {status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-semibold">
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-semibold text-orange-600 text-lg">
                      ₹{total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-medium">{selectedOrder.deliveryAddress || "—"}</p>
                </div>

                {/* Order Items — using correct backend field names */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Items</p>
                  <div className="space-y-2">
                    {(selectedOrder.items ?? []).map((item: any, idx: number) => {
                      const itemName  = item.itemName ?? item.name ?? "Item";
                      const unitPrice = parseFloat(item.unitPrice ?? item.price ?? 0) || 0;
                      const qty       = parseInt(item.quantity ?? 1) || 1;
                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-gray-500">Qty: {qty}</p>
                          </div>
                          <p className="font-semibold">
                            ₹{(unitPrice * qty).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {status !== "DELIVERED" && status !== "CANCELLED" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        handleAdvance(selectedOrder.id);
                        setIsDialogOpen(false);
                      }}
                    >
                      <ChevronRight className="w-4 h-4 mr-1" /> Advance Status
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleCancel(selectedOrder.id);
                        setIsDialogOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}