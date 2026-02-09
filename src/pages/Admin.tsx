import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product, ProductInput } from "@/hooks/useProducts";
import { useOrders, useUpdateOrderStatus, Order } from "@/hooks/useOrders";
import { useImageUpload } from "@/hooks/useImageUpload";
import { formatNaira } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, X, ChevronLeft, Upload, Package, ShoppingCart, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const { uploading, uploadMultipleImages } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    price: "" as any,
    original_price: null,
    images: [],
    sizes: [],
    category: "Lifestyle",
    is_new: false,
    is_sale: false,
    is_sold_out: false,
    stock_quantity: 0,
    shipping_fee: null,
  });
  const [sizeInput, setSizeInput] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

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
      price: "" as any,
      original_price: null,
      images: [],
      sizes: [],
      category: "Lifestyle",
      is_new: false,
      is_sale: false,
      is_sold_out: false,
      stock_quantity: 0,
      shipping_fee: null,
    });
    setSizeInput("");
    setPreviewImages([]);
    setPendingFiles([]);
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
        is_sold_out: product.is_sold_out || false,
        stock_quantity: product.stock_quantity || 0,
        shipping_fee: product.shipping_fee,
      });
      setPreviewImages(product.images || []);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setPendingFiles(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    const existingImagesCount = formData.images?.length || 0;
    
    if (index < existingImagesCount) {
      // Remove from existing images
      setFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index) || [],
      }));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from pending files
      const pendingIndex = index - existingImagesCount;
      setPendingFiles(prev => prev.filter((_, i) => i !== pendingIndex));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddSize = () => {
    const size = parseInt(sizeInput);
    if (!isNaN(size) && size > 0 && !(formData.sizes || []).includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), size].sort((a, b) => a - b),
      }));
      setSizeInput("");
    }
  };

  const handleRemoveSize = (size: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes?.filter(s => s !== size) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || formData.price <= 0) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      let uploadedUrls: string[] = [];
      
      if (pendingFiles.length > 0) {
        uploadedUrls = await uploadMultipleImages(pendingFiles);
      }

      const finalImages = [...(formData.images || []), ...uploadedUrls];

      if (editingProduct) {
        await updateProduct.mutateAsync({ 
          id: editingProduct.id, 
          ...formData,
          images: finalImages,
        });
        toast.success("Product updated successfully!");
      } else {
        await createProduct.mutateAsync({
          ...formData,
          images: finalImages,
        });
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

  const handleOrderStatusChange = async (orderId: string, status: Order["status"]) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const styles: Record<Order["status"], string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      paid: "bg-green-500/20 text-green-400",
      processing: "bg-blue-500/20 text-blue-400",
      shipped: "bg-purple-500/20 text-purple-400",
      delivered: "bg-emerald-500/20 text-emerald-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  // Calculate inventory stats
  const inStockProducts = products?.filter(p => !p.is_sold_out && (p.stock_quantity || 0) > 0) || [];
  const outOfStockProducts = products?.filter(p => p.is_sold_out || (p.stock_quantity || 0) <= 0) || [];

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

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <div
                    key={product.id}
                    className="bg-secondary rounded-xl p-4 flex gap-4"
                  >
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
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
                      {product.is_sold_out && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        {product.is_sold_out && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                            Sold
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="font-bold text-accent mt-1">
                        {formatNaira(product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock_quantity || 0}
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
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <div key={order.id} className="bg-secondary rounded-xl p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="font-semibold">
                            {order.shipping_first_name} {order.shipping_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
                          <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-accent">
                            {formatNaira(order.total_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as Order["status"])}
                          className="text-sm px-3 py-1 border border-border rounded-lg bg-background"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-sm font-medium mb-2">Items:</p>
                        <div className="space-y-2">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.product_name} (Size {item.size}) x{item.quantity}
                              </span>
                              <span>{formatNaira(item.product_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Ship to:</strong> {order.shipping_address}, {order.shipping_city}, {order.shipping_state}, {order.shipping_country}
                        </p>
                      </div>
                    </div>
                  ))}

                  {orders?.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <p>No orders yet.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold">In Stock</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-500">{inStockProducts.length}</p>
                  <p className="text-sm text-muted-foreground">products available</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold">Out of Stock</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-500">{outOfStockProducts.length}</p>
                  <p className="text-sm text-muted-foreground">products need restocking</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-center py-3 px-4">Stock</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((product) => (
                      <tr key={product.id} className="border-b border-border/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                              {product.images?.[0] && (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                        <td className="py-3 px-4 text-center font-mono">{product.stock_quantity || 0}</td>
                        <td className="py-3 px-4 text-center">
                          {product.is_sold_out || (product.stock_quantity || 0) <= 0 ? (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Out of Stock</span>
                          ) : (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">In Stock</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenDialog(product)}
                            className="text-sm text-accent hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
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
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value ? parseInt(e.target.value) : ("" as any),
                    }))
                  }
                  placeholder="Enter price"
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

            {/* Shipping Fee */}
            <div>
              <label className="block text-sm font-medium mb-2">Shipping Fee (₦)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shippingType"
                    checked={formData.shipping_fee === null || formData.shipping_fee === 0}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, shipping_fee: null }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Free Shipping</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shippingType"
                    checked={formData.shipping_fee !== null && formData.shipping_fee > 0}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, shipping_fee: 1000 }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Custom Fee</span>
                </label>
              </div>
              {formData.shipping_fee !== null && formData.shipping_fee > 0 && (
                <input
                  type="number"
                  value={formData.shipping_fee || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shipping_fee: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Enter shipping fee"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent mt-2"
                  min="0"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_quantity || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock_quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  min="0"
                />
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
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium mb-2">Available Sizes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="e.g., 42"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  min="1"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="btn-primary px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes?.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(formData.sizes?.length || 0) === 0 && (
                  <span className="text-sm text-muted-foreground">No sizes added</span>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-accent transition-colors flex flex-col items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </span>
              </button>
              
              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previewImages.map((img, index) => (
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
              )}
            </div>

            <div className="flex flex-wrap gap-4">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_sold_out || false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_sold_out: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-destructive">Sold Out</span>
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
                disabled={createProduct.isPending || updateProduct.isPending || uploading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {(createProduct.isPending || updateProduct.isPending || uploading) && (
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
