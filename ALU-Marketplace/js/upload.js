document.getElementById("uploadForm").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const formData = new FormData(this); 

    fetch("http://localhost:5000/api/product", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Item uploaded successfully!");
            this.reset(); // Reset form after successful upload
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error("Error uploading item:", error);
        alert("Failed to upload item. Please try again.");
    });
});
