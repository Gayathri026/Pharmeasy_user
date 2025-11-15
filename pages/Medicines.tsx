import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { mockProducts } from "@/lib/mockData";
import { cartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";

const Medicines = () => {
  const [cartItemCount, setCartItemCount] = useState(cartStore.getItemCount());
  const [searchQuery, setSearchQuery] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartItemCount(cartStore.getItemCount());
    });
    return unsubscribe;
  }, []);

  const handleAddToCart = (product: any) => {
    cartStore.addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = showOutOfStock || product.inStock;
    return matchesSearch && matchesStock;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Medicines</h1>
          <p className="text-muted-foreground">Browse our wide range of medicines and healthcare products</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={showOutOfStock ? "default" : "outline"}
              onClick={() => setShowOutOfStock(!showOutOfStock)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showOutOfStock ? "All Products" : "In Stock Only"}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No medicines found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
