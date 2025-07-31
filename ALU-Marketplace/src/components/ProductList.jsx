// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import ProductService from '../services/productService';
import CartService from '../services/cartService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts();
        setProducts(response.products || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleAddToCart = async (productId) => {
    try {
      await CartService.addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (err) {
      alert(err.message || 'Failed to add product to cart');
    }
  };
  
  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;
  if (products.length === 0) return <div>No products found</div>;
  
  return (
    <div className="products-container">
      <h2>Available Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.image_url && (
              <img 
                src={`http://localhost:5000/${product.image_url}`} 
                alt={product.name} 
                className="product-image"
              />
            )}
            <h3>{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <button 
              onClick={() => handleAddToCart(product.id)}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;