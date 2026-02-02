import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product, ProductInput } from "@/hooks/useProducts";
import { formatNaira } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, X, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    price: 0,
    original_price: null,
    images: [],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    category: "Lifestyle",
    is_new: false,
    is_sale: false,
  });
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: null,
      images: [],
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
      category: "Lifestyle",
      is_new: false,
      is_sale: false,
    });
    setImageUrl("");
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        original_price: product.original_price,
        images: product.images || [],
        sizes: product.sizes || [],
        category: product.category,
        is_new: product.is_new || false,
        is_sale: product.is_sale || false,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...formData });
        toast.success("Product updated successfully!");
      } else {
        await createProduct.mutateAsync(formData);
        toast.success("Product created successfully!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save product. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id);
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete product. Please try again.");
      }
    }
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Store
          </button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-headline">Admin Dashboard</h1>
            <button
              onClick={() => handleOpenDialog()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <div
                key={product.id}
                className="bg-secondary rounded-xl p-4 flex gap-4"
              >
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="font-bold text-accent mt-1">
                    {formatNaira(product.price)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleOpenDialog(product)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-background rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No products yet. Add your first product!</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₦) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Price (₦)
                </label>
                <input
                  type="number"
                  value={formData.original_price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      original_price: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Lifestyle">Lifestyle</option>
                <option value="Running">Running</option>
                <option value="Basketball">Basketball</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="btn-primary px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.images?.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new || false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_new: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_sale || false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_sale: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {(createProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
