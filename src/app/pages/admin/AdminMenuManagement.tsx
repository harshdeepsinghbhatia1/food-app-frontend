import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { menuAPI, MenuItem } from "../../lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const BACKEND_CATEGORIES = [
  "STARTERS",
  "MAIN_COURSE",
  "BEVERAGES",
  "DESSERTS",
];

type FormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  price: 0,
  category: "",
  imageUrl: "",
};

export function AdminMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuAPI.adminGetAll();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category.toUpperCase(),
        imageUrl: item.imageUrl ?? "",
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      formData.price <= 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await menuAPI.update(editingItem.id, formData);
        toast.success("Menu item updated successfully!");
      } else {
        await menuAPI.create(formData);
        toast.success("Menu item added successfully!");
      }
      setIsDialogOpen(false);
      loadMenu();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Mark "${name}" as unavailable?`)) return;
    try {
      await menuAPI.delete(id);
      toast.success("Item marked as unavailable");
      loadMenu();
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
          <p className="text-gray-600">Add, edit, or remove menu items</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Item
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-orange-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.available === false ? "opacity-50" : ""}
                >
                  <TableCell>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80";
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{item.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{item.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.available === false
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      {item.available === false ? "Unavailable" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                        className="hover:bg-orange-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Paneer Tikka"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="border-orange-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Must match backend Category enum values
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Brief description of the dish"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="text"
                value={formData.price === 0 ? "" : String(formData.price)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setFormData({
                      ...formData,
                      price: val === "" ? 0 : parseFloat(val) || 0,
                    });
                  }
                }}
                placeholder="Enter price e.g. 250"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            {/* Image URL — NEW FIELD */}
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="border-orange-200 focus:border-orange-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste any image URL — leave empty to use category default image
              </p>
              {/* Live image preview */}
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-lg border border-orange-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={saving}
            >
              {saving ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}