import { Product } from "@/components/ProductCard";

export interface CartItem extends Product {
  quantity: number;
}

class CartStore {
  private cart: CartItem[] = [];
  private listeners: Array<(cart: CartItem[]) => void> = [];

  subscribe(listener: (cart: CartItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.cart));
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(product: Product) {
    const existingItem = this.cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.notify();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.notify();
    }
  }

  removeFromCart(productId: string) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.notify();
  }

  clearCart() {
    this.cart = [];
    this.notify();
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export const cartStore = new CartStore();
