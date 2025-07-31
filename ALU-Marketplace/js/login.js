

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            errorMessage.textContent = "Invalid email or password!";
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        errorMessage.textContent = "An error occurred during login!";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const logInForm = document.getElementById("logInForm");
    logInForm.addEventListener("submit", handleLogin);
})

