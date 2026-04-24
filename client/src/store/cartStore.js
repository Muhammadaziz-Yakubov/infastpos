import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cart: [],
  discount: 0,
  paymentMethod: 'cash',

  addItem: (product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.productId === product._id);

    if (existingItem) {
      set({
        cart: cart.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellPrice }
            : item
        )
      });
    } else {
      set({
        cart: [...cart, {
          productId: product._id,
          name: product.name,
          image: product.image,
          unit: product.unit,
          quantity: 1,
          sellPrice: product.sellPrice,
          buyPrice: product.buyPrice,
          total: product.sellPrice
        }]
      });
    }
  },

  updateQuantity: (productId, delta) => {
    const { cart } = get();
    set({
      cart: cart.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, total: newQty * item.sellPrice };
        }
        return item;
      })
    });
  },

  removeItem: (productId) => {
    set({ cart: get().cart.filter(item => item.productId !== productId) });
  },

  setDiscount: (value) => set({ discount: value }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearCart: () => set({ cart: [], discount: 0, paymentMethod: 'cash' }),

  getTotals: () => {
    const { cart, discount } = get();
    const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);
    const finalAmount = Math.max(0, totalAmount - discount);
    return { totalAmount, finalAmount };
  }
}));

export default useCartStore;
