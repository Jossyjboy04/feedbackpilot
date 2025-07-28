const form = document.getElementById("feedbackForm");
const status = document.getElementById("status");

const urlParams = new URLSearchParams(window.location.search);
const adminId = urlParams.get("admin");

if (!adminId) {
  form.style.display = "none";
  status.innerHTML = "<p style='color:red;'>Invalid feedback link. Admin ID is missing.</p>";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone =document.getElementById("phone").value;
  const message = document.getElementById("message").value.trim();
  const rating = document.querySelector('select[name="rating"]').value;
  const screenshot = document.getElementById("screenshot").files[0];

  if (!message || !rating) {
    status.style.color = "red";
    status.textContent = "Please fill in the message and rating.";
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phone", phone);
  formData.append("message", message);
  formData.append("rating", rating);
  formData.append("adminId", adminId);
   formData.append("screenshot", screenshot);
  // if (screenshot) {
  //   formData.append("screenshot", screenshot);
  // }

  try {
    const res = await fetch(`${window.location.origin}/api/feedback`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      status.style.color = "red";
      status.textContent = data.error || "Something went wrong!";
      return;
    }

    status.style.color = "green";
    status.textContent = "✅ Feedback submitted successfully!";
    form.reset();
  } catch (err) {
    console.error("Feedback error:", err);
    status.style.color = "red";
    status.textContent = "Server error. Please try again later.";
  }
});
