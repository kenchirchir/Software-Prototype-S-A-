

function loadCartItems() {
    fetch("http://localhost:5000/api/cart")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const cartContainer = document.getElementById("cart-items");
            const totalContainer = document.getElementById("cart-total");
            cartContainer.innerHTML = ""; 

            let totalPrice = 0;

            data.forEach(item => {
                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");

                const itemName = document.createElement("p");
                itemName.textContent = `${item.name} (x${item.quantity})`;

                const itemPrice = document.createElement("p");
                itemPrice.textContent = `Price: $${item.price}`;

                const itemTotal = document.createElement("p");
                itemTotal.textContent = `Total: $${(item.price * item.quantity).toFixed(2)}`;

                cartItem.appendChild(itemName);
                cartItem.appendChild(itemPrice);
                cartItem.appendChild(itemTotal);
                cartContainer.appendChild(cartItem);

                totalPrice += item.price * item.quantity;
            });

            totalContainer.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
        })
        .catch(error => {
            console.error("Error fetching cart items:", error);
        });
}


document.addEventListener("DOMContentLoaded", loadCartItems);
