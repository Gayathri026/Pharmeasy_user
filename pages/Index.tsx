import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import PrescriptionUpload from "@/components/PrescriptionUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pill, TestTube, Stethoscope, Heart, Sparkles } from "lucide-react";
import { mockProducts } from "@/lib/mockData";
import { cartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-medicines.jpg";

const Index = () => {
  const [cartItemCount, setCartItemCount] = useState(cartStore.getItemCount());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartItemCount(cartStore.getItemCount());
    });
    return unsubscribe;
  }, []);

  const handleAddToCart = (product: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    cartStore.addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const categories = [
    {
      title: "Medicines",
      icon: Pill,
      description: "Browse all medicines",
      href: "/medicines",
    },
    {
      title: "Lab Tests",
      icon: TestTube,
      description: "Book tests online",
      href: "/medicines",
    },
    {
      title: "Consult Doctor",
      icon: Stethoscope,
      description: "Online consultation",
      href: "/medicines",
    },
    {
      title: "Healthcare",
      icon: Heart,
      description: "Health products",
      href: "/medicines",
    },
  ];

  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent-foreground">
                <Sparkles className="h-4 w-4" />
                Save up to 60% on medicines
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Your Health,
                <br />
                <span className="text-primary">Our Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Order medicines online with fast delivery. Upload prescription and get genuine medicines at your doorstep.
              </p>

              {/* Search Bar */}
              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for medicines..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link to="/medicines">
                  <Button size="lg" className="h-12 px-8">
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <img
                src={heroImage}
                alt="Medical supplies"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Browse our wide range of healthcare products</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </section>

      {/* Prescription Upload */}
      <PrescriptionUpload />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Featured Medicines</h2>
            <p className="text-muted-foreground">Popular medicines with great discounts</p>
          </div>
          <Link to="/medicines">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Genuine Medicines</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground">Delivery on orders above ₹500</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
