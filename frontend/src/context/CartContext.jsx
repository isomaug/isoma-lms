import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Initialize from local storage if available
    try {
      const savedCart = localStorage.getItem("courseCart");
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Failed to parse cart from local storage", error);
    }
    return [];
  });

  // Sync cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("courseCart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (course) => {
    setCart((prevCart) => {
      // Check if course already exists in cart
      if (prevCart.some((item) => item.id === course.id)) {
        return prevCart; // Do nothing if already in cart
      }
      return [...prevCart, course];
    });
  };

  const removeFromCart = (courseId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + Number(item.price_ugx), 0);
  };

  const isInCart = (courseId) => {
    return cart.some((item) => item.id === courseId);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    isInCart,
    itemCount: cart.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
