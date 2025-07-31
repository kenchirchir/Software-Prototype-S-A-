function displayProducts(products) {
    const container = document.getElementById("product-container");
    container.innerHTML = '';  // Clear any existing content

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        // Create image element
        const productImage = document.createElement("img");
        productImage.src = product.imageUrl;
        productImage.alt = product.name;

        // Create title element
        const productTitle = document.createElement("div");
        productTitle.classList.add("product-title");
        productTitle.textContent = product.name;

        // Create price element
        const productPrice = document.createElement("div");
        productPrice.classList.add("product-price");
        productPrice.textContent = product.price;

        // Create description element
        const productDescription = document.createElement("div");
        productDescription.classList.add("product-description");
        productDescription.textContent = product.description;

        // Create button element
        const productButton = document.createElement("button");
        productButton.classList.add("product-button");
        productButton.textContent = "Add to Cart";

        // Append all elements to the product card
        productCard.appendChild(productImage);
        productCard.appendChild(productTitle);
        productCard.appendChild(productPrice);
        productCard.appendChild(productDescription);
        productCard.appendChild(productButton);

        // Append product card to the container
        container.appendChild(productCard);
    });
}



fetch('https://localhost:5000/api/products') 
    .then(response => response.json())
    .then(products => {
        displayProducts(products);  
    })
    .catch(error => {
        console.error('Error fetching products:', error);
       
    });