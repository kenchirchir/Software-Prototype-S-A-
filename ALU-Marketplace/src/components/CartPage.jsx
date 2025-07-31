// src/components/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../services/cartService';
import OrderService from '../services/orderService';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await CartService.getCart();
      setCart(cartData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await CartService.updateCartItem(itemId, newQuantity);
      fetchCart(); // Refresh cart data
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await CartService.removeFromCart(itemId);
      fetchCart(); // Refresh cart data
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      // Create an order from the cart
      await OrderService.createOrder({
        shippingAddress: 'Default Address', // Replace with actual address input
        paymentMethod: 'Cash on Delivery' // Replace with actual payment method selection
      });

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'Failed to place order');
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/products')} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      ) : (
        <div>
          <ul className="cart-items">
            {cart.items.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price}</p>
                  <div className="cart-item-actions">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button onClick={() => handleRemoveItem(item.id)} className="remove-btn">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <h3>Total: ${cart.total.toFixed(2)}</h3>
            <button onClick={handleCheckout} className="checkout-btn">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
