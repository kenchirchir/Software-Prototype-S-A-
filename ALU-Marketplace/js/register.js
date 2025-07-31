

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("register successful!");
            window.location.href = "login.html";
        } else {
            errorMessage.textContent = "Invalid username or password!";
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        errorMessage.textContent = "An error occurred during login!";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const logInForm = document.getElementById("signUpForm");
    logInForm.addEventListener("submit", handleLogin);
})

