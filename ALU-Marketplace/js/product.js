async function fetchProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
  
      if (data.success) {
        const productsList = data.products.map(product => `
          <div class="product">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: $${product.price}</p>
            <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
          </div>
        `).join('');
  
        document.getElementById('products-list').innerHTML = productsList;
  
        // Add event listeners to 'Add to Cart' buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
          button.addEventListener('click', async (event) => {
            const productId = event.target.dataset.productId;
            const token = localStorage.getItem('token');
  
            const response = await fetch('http://localhost:5000/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ productId })
            });
  
            const data = await response.json();
            if (data.success) {
              alert('Product added to cart!');
            } else {
              alert('Failed to add to cart: ' + data.message);
            }
          });
        });
  
      } else {
        alert('Failed to load products: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('An error occurred. Please try again.');
    }
  }
  
  fetchProducts();