const form = document.getElementById("registerForm");
const messageBox = document.getElementById("message");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = passwordInput.value;

  try {
    const res = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, username, password }),
    });

    const data = await res.json();

    if (res.status === 429) {
      messageBox.style.color = "orange";
      messageBox.textContent = "Too many requests. Please wait before trying again.";
    } else if (!res.ok) {
      messageBox.style.color = "red";
      messageBox.textContent = data.message || "Registration failed.";
    } else {
      messageBox.style.color = "green";
      messageBox.textContent = "✅ Registered successfully! Check your mail for verification link.";
      form.reset();
    }

  } catch (err) {
    console.error("Registration error:", err);
    messageBox.style.color = "red";
    messageBox.textContent = "Server error. Try again.";
  }
});

// 👁 Toggle password visibility
togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});
