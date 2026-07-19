/* ===========================================================
   Nova Studio — script.js
   - Contact form: AJAX submit to FormSubmit (no page reload)
   - Login: password is verified as a SHA-256 hash, never stored
     in plain text in this file. Only the site owner knows the
     real password.
   - Dashboard: protected by a per-tab session flag.
   =========================================================== */

// SHA-256 hash of the admin password (plain text password is NOT stored here)
const ADMIN_PASSWORD_HASH = "ca2b592f0a52dec523163b2a5e216f5125c97f78a44ded7242a6ca3a3b7f3f7a";
const SESSION_KEY = "novastudio_admin_session";

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------------- Contact form (index.html) ---------------- */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("form-msg");
    const submitBtn = contactForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "جارِ الإرسال...";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        msgEl.textContent = "تم إرسال طلبك بنجاح! هنتواصل معاك قريب. 🎉";
        msgEl.className = "form-msg show ok";
        contactForm.reset();
      } else {
        throw new Error("submit failed");
      }
    } catch (err) {
      msgEl.textContent = "حصل خطأ أثناء الإرسال، حاول تاني أو تواصل معنا مباشرة عبر واتساب.";
      msgEl.className = "form-msg show err";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال الطلب";
    }
  });
}

/* ---------------- Login (login.html) ---------------- */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("auth-error");
    const password = document.getElementById("password").value;
    const submitBtn = loginForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    const hash = await sha256(password);

    if (hash === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      window.location.href = "dashboard.html";
    } else {
      errorEl.classList.add("show");
      loginForm.reset();
      submitBtn.disabled = false;
    }
  });
}

/* ---------------- Dashboard guard (dashboard.html) ---------------- */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  // Guard: if there's no valid session, kick back to login
  if (sessionStorage.getItem(SESSION_KEY) !== "1") {
    window.location.href = "login.html";
  }
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  });
}
