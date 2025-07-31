

function displayProductDetails(product) {
    const container = document.getElementById("product-container");

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const productImage = document.createElement("img");
    productImage.src = product.imageUrl;
    productImage.alt = product.name;
    productImage.style.width = "100%";
    productImage.style.height = "auto";

    const productTitle = document.createElement("div");
    productTitle.classList.add("product-title");
    productTitle.textContent = product.name;

    const productPrice = document.createElement("div");
    productPrice.classList.add("product-price");
    productPrice.textContent = product.price;

    const productDescription = document.createElement("div");
    productDescription.classList.add("product-description");
    productDescription.textContent = product.description;

    // Append the elements to the product card
    productCard.appendChild(productImage);
    productCard.appendChild(productTitle);
    productCard.appendChild(productPrice);
    productCard.appendChild(productDescription);

    // Add the product card to the container
    container.appendChild(productCard);
}

fetch('https://localhost:5000/api/products/1')
    .then(response => response.json())
    .then(product => {
        displayProductDetails(product);
    })
    .catch(error => {
        console.error('Error fetching product data:', error);
    });
