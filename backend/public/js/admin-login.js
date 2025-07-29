const form = document.getElementById("loginForm");
const errorText = document.getElementById("error");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");

// Auto-fill username if remembered
window.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    document.getElementById("username").value = savedUsername;
    rememberMe.checked = true;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    errorText.textContent = "Both username and password are required.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.status === 403) {
      errorText.textContent = "Account not verified. Check your email.";
      return;
    }

    if (res.status === 401 || res.status === 404) {
      errorText.textContent = "Invalid credentials. Try again.";
      return;
    }

    if (!res.ok) {
      errorText.textContent = data.message || "Login failed. Try again.";
      return;
    }

    // Save token and ID
    localStorage.setItem("token", data.token);
    localStorage.setItem("adminId", data.adminId);

    // Handle Remember Me
    if (rememberMe.checked) {
      localStorage.setItem("rememberedUsername", username);
    } else {
      localStorage.removeItem("rememberedUsername");
    }

    window.location.href = "admin-dashboard.html";
  } catch (err) {
    console.error("Login Error:", err);
    errorText.textContent = "Server error. Try again.";
  }
});

// 👁 Toggle password visibility
togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});
