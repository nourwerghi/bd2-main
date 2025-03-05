import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  showCart: false,
  setShowCart: (show) => set({ showCart: show }),
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.product._id === product._id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    set({
      items: get().items.filter(item => item.product._id !== productId)
    });
  },
  updateQuantity: (productId, newQuantity) => {
    if (newQuantity === 0) {
      get().removeItem(productId);
    } else {
      set({
        items: get().items.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      });
    }
  },
  clearCart: () => set({ items: [] }),
  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }
}));