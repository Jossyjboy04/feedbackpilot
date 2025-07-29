const token = localStorage.getItem("adminToken");
const container = document.getElementById("feedbackContainer");
const logoutBtn = document.getElementById("logoutBtn");
const feedbackLinkInput = document.getElementById("feedbackLink");
const copyBtn = document.getElementById("copyLinkBtn");

// ✅ Logout Handler
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
});

// ✅ Token Check
if (!token) {
  container.innerHTML = `
    <p>You are not logged in.</p>
    <a href="admin-login.html" 
       style="display:inline-block; margin-top:10px; padding:8px 16px; background:#333; color:white; text-decoration:none; font-weight:bold; border-radius:5px;">
      Login
    </a>`;
} else {
  try {
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // const adminId = payload.userId || payload.id;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("🧠 Decoded JWT payload:", payload);
const adminId = payload.id || payload.userId;
if (!adminId) {
  console.error("❌ Missing adminId in token payload!");
} else {
  console.log("✅ adminId found:", adminId);
}

    const feedbackLink = `${window.location.origin}/feedback.html?admin=${adminId}`;
    feedbackLinkInput.value = feedbackLink;

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(feedbackLink);
      alert("📋 Feedback link copied!");
    });

    fetch("/api/feedback", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Invalid or expired token");
        return res.json();
      })
      .then(feedbackList => {
        if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
          container.innerHTML = "<p>No feedback submitted yet.</p>";
          return;
        }

        container.innerHTML = "";
        feedbackList.forEach(item => {
          const div = document.createElement("div");
          div.classList.add("feedbackItem");
          div.style.border = "1px solid #ccc";
          div.style.borderRadius = "8px";
          div.style.padding = "16px";
          div.style.marginBottom = "16px";
          div.style.background = "#f9f9f9";
          div.style.transition = "all 0.3s ease";

          const uniqueId = item._id || Math.random().toString(36).substr(2, 9);

          div.innerHTML = `
            <h3>${item.name || "Anonymous"} - ${item.rating || "No Rating"}⭐</h3>
            <p><strong>Email:</strong> ${item.email}</p>
            <button class="toggle-btn" id="toggle-${uniqueId}" 
              style="margin:10px 0; cursor:pointer; padding:6px 12px; border:none; background:#007BFF; color:#fff; border-radius:4px;">
              Show Details
            </button>

            <div class="details" id="details-${uniqueId}" 
              style="display:none; border-top:1px solid #ccc; padding-top:10px; margin-top:10px; animation: fadeIn 0.3s ease;">
              <p><strong>Phone:</strong> ${item.phone || "N/A"}</p>
              <p><strong>Message:</strong><br>${item.message || "No message provided"}</p>
              ${item.screenshot ? `
                <div style="margin-top:10px;">
                  <strong>Screenshot:</strong><br>
                  <img src="${item.screenshot}" 
                       alt="Screenshot" 
                       style="max-width:100%; height:auto; border:1px solid #ddd; border-radius:6px; margin-top:6px;" />
                </div>`
                : `<p><strong>Screenshot:</strong> None</p>`}
              <small style="color:#666;">Submitted on ${new Date(item.createdAt).toLocaleString()}</small>
            </div>
          `;

          container.appendChild(div);

          // Toggle logic
          setTimeout(() => {
            const btn = document.getElementById(`toggle-${uniqueId}`);
            const details = document.getElementById(`details-${uniqueId}`);
            btn.addEventListener("click", () => {
              const isOpen = details.style.display === "block";
              details.style.display = isOpen ? "none" : "block";
              btn.textContent = isOpen ? "Show Details" : "Hide Details";
            });
          }, 0);
        });
      })
      .catch(err => {
        console.error("Token validation error:", err);
        container.innerHTML = `
          <p>Access denied or session expired.</p>
          <a href="admin-login.html" style="color:blue;text-decoration:none;">Login again</a>
        `;
      });

  } catch (error) {
    console.error("Token decode error:", error);
    container.innerHTML = `
      <p>Session error. Please login again.</p>
      <a href="admin-login.html" style="color:red; text-decoration:underline;">Login</a>
    `;
  }
}
