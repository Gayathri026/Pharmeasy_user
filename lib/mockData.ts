import { Product } from "@/components/ProductCard";
import medicine1 from "@/assets/medicine-1.jpg";
import medicine2 from "@/assets/medicine-2.jpg";
import medicine3 from "@/assets/medicine-3.jpg";
import medicine4 from "@/assets/medicine-4.jpg";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    description: "Fast relief from fever and pain. Pack of 15 tablets.",
    price: 25,
    originalPrice: 40,
    image: medicine1,
    discount: 38,
    inStock: true,
  },
  {
    id: "2",
    name: "Vitamin D3 Capsules",
    description: "Essential vitamin supplement for bone health. 60 capsules.",
    price: 299,
    originalPrice: 450,
    image: medicine2,
    discount: 34,
    inStock: true,
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    description: "Anti-inflammatory pain relief. Pack of 20 tablets.",
    price: 45,
    originalPrice: 60,
    image: medicine3,
    discount: 25,
    inStock: true,
  },
  {
    id: "4",
    name: "Amoxicillin 500mg",
    description: "Antibiotic for bacterial infections. 10 capsules.",
    price: 120,
    image: medicine4,
    inStock: true,
  },
  {
    id: "5",
    name: "Cough Syrup 100ml",
    description: "Effective relief from dry and wet cough.",
    price: 85,
    originalPrice: 110,
    image: medicine1,
    discount: 23,
    inStock: true,
  },
  {
    id: "6",
    name: "Multivitamin Tablets",
    description: "Complete daily nutrition. 30 tablets.",
    price: 199,
    originalPrice: 280,
    image: medicine2,
    discount: 29,
    inStock: false,
  },
  {
    id: "7",
    name: "Aspirin 75mg",
    description: "Heart health and pain relief. 30 tablets.",
    price: 35,
    originalPrice: 50,
    image: medicine3,
    discount: 30,
    inStock: true,
  },
  {
    id: "8",
    name: "Calcium Supplements",
    description: "Bone strength formula. 60 tablets.",
    price: 250,
    image: medicine4,
    inStock: true,
  },
];
