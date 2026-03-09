"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  offeredPrice: number;
  image: string;
  quantity: number;
  material?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart storage error", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const productId = product.id || product._id;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);

      if (existingItem) {
        toast.info(`Increased quantity of ${product.name}`);
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      toast.success(`${product.name} added to cart!`);
      return [
        ...prevCart,
        {
          id: productId,
          name: product.name,
          price: Number(product.price) || 0,
          offeredPrice: Number(product.offeredPrice) || 0,
          image: product.images?.[0] || "",
          quantity: 1,
          material: product.material,
        },
      ];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.error("Removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart error");
  return context;
};
