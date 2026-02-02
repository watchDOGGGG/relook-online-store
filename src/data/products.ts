import sneaker1 from "@/assets/sneaker-1.jpg";
import sneaker1Alt1 from "@/assets/sneaker-1-alt1.jpg";
import sneaker2 from "@/assets/sneaker-2.jpg";
import sneaker2Alt1 from "@/assets/sneaker-2-alt1.jpg";
import sneaker2Alt2 from "@/assets/sneaker-2-alt2.jpg";
import sneaker3 from "@/assets/sneaker-3.jpg";
import sneaker3Alt1 from "@/assets/sneaker-3-alt1.jpg";
import sneaker3Alt2 from "@/assets/sneaker-3-alt2.jpg";
import sneaker4 from "@/assets/sneaker-4.jpg";
import sneaker4Alt1 from "@/assets/sneaker-4-alt1.jpg";
import sneaker4Alt2 from "@/assets/sneaker-4-alt2.jpg";
import sneaker5 from "@/assets/sneaker-5.jpg";
import sneaker5Alt1 from "@/assets/sneaker-5-alt1.jpg";
import sneaker5Alt2 from "@/assets/sneaker-5-alt2.jpg";
import sneaker6 from "@/assets/sneaker-6.jpg";
import sneaker6Alt1 from "@/assets/sneaker-6-alt1.jpg";
import sneaker6Alt2 from "@/assets/sneaker-6-alt2.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: number[];
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Air Cloud Elite",
    description: "Premium white leather sneaker with sleek black accents. Engineered for ultimate comfort with responsive cushioning technology and breathable mesh lining. Perfect for everyday wear or athletic performance.",
    price: 95000,
    images: [sneaker1, sneaker1Alt1, sneaker1Alt1],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    category: "Running",
    isNew: true,
  },
  {
    id: "2",
    name: "Urban Street High",
    description: "Bold black high-top with signature amber accents. Crafted from premium leather with padded ankle support. The perfect statement piece for street style enthusiasts.",
    price: 79500,
    originalPrice: 99500,
    images: [sneaker2, sneaker2Alt1, sneaker2Alt2],
    sizes: [39, 40, 41, 42, 43, 44],
    category: "Lifestyle",
    isSale: true,
  },
  {
    id: "3",
    name: "Velocity Runner",
    description: "Lightweight performance runner in cool grey. Features advanced knit technology for breathability and a responsive midsole for optimal energy return.",
    price: 72500,
    images: [sneaker3, sneaker3Alt1, sneaker3Alt2],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45, 46],
    category: "Running",
  },
  {
    id: "4",
    name: "Heritage Classic",
    description: "Vintage-inspired mid-top in cream and rich brown leather. A timeless design that pays homage to classic basketball aesthetics with modern comfort features.",
    price: 87500,
    images: [sneaker4, sneaker4Alt1, sneaker4Alt2],
    sizes: [40, 41, 42, 43, 44, 45],
    category: "Lifestyle",
    isNew: true,
  },
  {
    id: "5",
    name: "Shadow Stealth",
    description: "All-black premium sneaker with subtle textured details. Minimalist design meets maximum impact. Versatile enough for any occasion, from casual to semi-formal.",
    price: 82500,
    images: [sneaker5, sneaker5Alt1, sneaker5Alt2],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    category: "Lifestyle",
  },
  {
    id: "6",
    name: "Solar Boost",
    description: "Eye-catching white and golden amber colorway. Designed for runners who want to stand out. Features premium cushioning and durable outsole grip.",
    price: 99500,
    originalPrice: 124500,
    images: [sneaker6, sneaker6Alt1, sneaker6Alt2],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    category: "Running",
    isSale: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return products;
  
  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  });
};
