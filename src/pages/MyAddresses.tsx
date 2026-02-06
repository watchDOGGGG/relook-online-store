import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Star, Loader2, MapPin, Edit2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useAuth } from "@/context/AuthContext";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress, UserAddress } from "@/hooks/useAddresses";
import { useCountries } from "@/hooks/useCountries";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddressFormData {
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
}

const defaultFormData: AddressFormData = {
  label: "Home",
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  is_default: false,
};

const MyAddresses = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: addresses, isLoading } = useAddresses();
  const { countries, loading: countriesLoading } = useCountries();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/my-addresses");
    }
  }, [user, authLoading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Required";
    if (!formData.last_name.trim()) newErrors.last_name = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    if (!formData.address.trim()) newErrors.address = "Required";
    if (!formData.city.trim()) newErrors.city = "Required";
    if (!formData.state.trim()) newErrors.state = "Required";
    if (!formData.country) newErrors.country = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingAddress) {
        await updateAddress.mutateAsync({ id: editingAddress.id, ...formData });
        toast.success("Address updated");
      } else {
        await addAddress.mutateAsync(formData);
        toast.success("Address added");
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData(defaultFormData);
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Cart />
        <main className="pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="container-wide max-w-4xl flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container-wide max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-headline">My Addresses</h1>
            <button
              onClick={() => {
                setEditingAddress(null);
                setFormData(defaultFormData);
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {addresses && addresses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-5 bg-card relative ${
                    address.is_default ? "border-accent" : "border-border"
                  }`}
                >
                  {address.is_default && (
                    <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" fill="currentColor" />
                      Default
                    </span>
                  )}
                  <p className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    {address.label}
                  </p>
                  <p className="font-semibold">
                    {address.first_name} {address.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                  <p className="text-sm text-muted-foreground mt-2">{address.phone}</p>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {!address.is_default && (
                      <>
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Star className="w-4 h-4" />
                          Set Default
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="text-sm font-medium text-destructive hover:text-destructive/80 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary rounded-lg">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No saved addresses</h2>
              <p className="text-muted-foreground mb-6">
                Add an address to speed up checkout.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Address Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Home, Office, etc."
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.first_name ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.last_name ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234..."
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.phone ? "border-destructive" : "border-border"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.address ? "border-destructive" : "border-border"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.city ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.state ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                {countriesLoading ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                      errors.country ? "border-destructive" : "border-border"
                    }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="is_default" className="text-sm">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  setFormData(defaultFormData);
                }}
                className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={addAddress.isPending || updateAddress.isPending}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
              >
                {(addAddress.isPending || updateAddress.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingAddress ? "Save Changes" : "Add Address"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAddresses;
