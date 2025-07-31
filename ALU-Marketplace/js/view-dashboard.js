function loadCategories() {
    fetch('http://localhost:5000/api/product-categories')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const dataContainer = document.getElementById("cat-list");
        dataContainer.innerHTML = "";
        data.forEach(item => {
            const aListItem = document.createElement("a");
            const listItem = document.createElement("li");
            aListItem.textContent = item.name;
            listItem.classList.add("cat-list-item");
            listItem.appendChild(aListItem);
            dataContainer.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error("Error fetching categories:", error);
    });
}

// Fetch and display orders
function loadOrders() {
    fetch("http://localhost:5000/api/orders")
        .then(response => response.json())
        .then(data => {
            const ordersContainer = document.getElementById("orders-list");
            ordersContainer.innerHTML = ""; // Clear previous data

            data.forEach(order => {
                const orderItem = document.createElement("div");
                orderItem.classList.add("order-item");

                orderItem.innerHTML = `
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Customer:</strong> ${order.customer}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <hr>
                `;

                ordersContainer.appendChild(orderItem);
            });
        })
        .catch(error => console.error("Error fetching orders:", error));
}

// Fetch and display product inventory
function loadInventory() {
    fetch("http://localhost:5000/api/inventory")
        .then(response => response.json())
        .then(data => {
            const inventoryContainer = document.getElementById("inventory-list");
            inventoryContainer.innerHTML = ""; // Clear previous data

            data.forEach(product => {
                const productItem = document.createElement("div");
                productItem.classList.add("inventory-item");

                productItem.innerHTML = `
                    <p><strong>Product:</strong> ${product.name}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <hr>
                `;

                inventoryContainer.appendChild(productItem);
            });
        })
        .catch(error => console.error("Error fetching inventory:", error));
}

// Load orders and inventory when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadCategories()
    loadOrders();
    loadInventory();
});
