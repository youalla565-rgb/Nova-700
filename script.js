/* ===========================================================
   Nova Studio — script.js
   - index.html : loads live content (texts/colors/links) from
     Firestore and applies it on top of the default HTML, so
     the site still works even before Firebase is connected.
   - login.html : signs the admin in with Firebase Authentication.
   - dashboard.html : reads/writes the Firestore content doc and
     lets the admin change their password.
   =========================================================== */

/* ---------------- Default content (fallback + first seed) ---------------- */
const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "GRAPHIC DESIGN STUDIO",
    title: "هوية بصرية تتكلم",
    titleAccent: "باسم علامتك",
    titleRest: "قبل ما حد يقرا اسمها",
    lead: "استوديو متخصص في تصميم الشعارات، الهوية البصرية، منشورات السوشيال ميديا، الإعلانات، والمطبوعات الاحترافية — نحوّل فكرتك لتصميم يخلّي علامتك التجارية متميزة."
  },
  services: [
    { title: "تصميم الشعارات", desc: "شعار مميز وقابل للتذكر، مبني على شخصية علامتك التجارية وسوقك المستهدف." },
    { title: "الهوية البصرية الكاملة", desc: "ألوان، خطوط، وأنظمة تصميم متكاملة تضمن ثبات هوية علامتك في كل مكان." },
    { title: "منشورات السوشيال ميديا", desc: "تصاميم جاهزة للنشر تحافظ على تناسق هويتك عبر جميع منصات التواصل." },
    { title: "الإعلانات", desc: "تصاميم إعلانية جذابة تلفت الانتباه وتزيد من تفاعل جمهورك المستهدف." },
    { title: "البوسترات والملصقات", desc: "ملصقات قوية بصريًا لفعالياتك وحملاتك الترويجية بأي مقاس تحتاجه." },
    { title: "المطبوعات الاحترافية", desc: "بطاقات أعمال، بروشورات، وقوائم أسعار جاهزة للطباعة بجودة عالية." }
  ],
  links: {
    whatsapp: "201508664132",
    instagram: "https://www.instagram.com/info.novastudio1",
    facebook: "https://www.facebook.com/profile.php?id=61591853639270",
    email: "info.novastudio1@gmail.com",
    portfolio: "https://drive.google.com/file/d/1tkBIcbopFV_fEY_k9bmoBonfOFh7nm8Z/view?usp=drivesdk"
  },
  colors: {
    coral: "#C1573B",
    coralDim: "#9B4530",
    lime: "#C79A44",
    ink: "#1C1721",
    paper: "#EDE3CE"
  }
};

const firebaseReady = typeof firebase !== "undefined" && firebase.apps && firebase.apps.length > 0;

/* ---------------- Apply content to the public site (index.html + dashboard.html) ---------------- */
function applyColors(colors) {
  const root = document.documentElement;
  if (!colors) return;
  if (colors.coral) root.style.setProperty("--coral", colors.coral);
  if (colors.coralDim) root.style.setProperty("--coral-dim", colors.coralDim);
  if (colors.lime) root.style.setProperty("--lime", colors.lime);
  if (colors.ink) root.style.setProperty("--ink", colors.ink);
  if (colors.paper) root.style.setProperty("--paper", colors.paper);
}

function applyPublicContent(content) {
  if (!content) return;

  const eyebrowEl = document.querySelector(".hero .eyebrow");
  if (eyebrowEl && content.hero) eyebrowEl.textContent = content.hero.eyebrow;
  const titleEl = document.querySelector(".hero h1");
  if (titleEl && content.hero) {
    titleEl.innerHTML = "";
    titleEl.append(document.createTextNode((content.hero.title || "") + " "));
    const span = document.createElement("span");
    span.className = "accent";
    span.textContent = content.hero.titleAccent || "";
    titleEl.appendChild(span);
    titleEl.append(document.createTextNode(" " + (content.hero.titleRest || "")));
  }
  const leadEl = document.querySelector(".hero .lead");
  if (leadEl && content.hero) leadEl.textContent = content.hero.lead;

  if (content.services) {
    const cards = document.querySelectorAll(".service-card");
    cards.forEach((card, i) => {
      const s = content.services[i];
      if (!s) return;
      const h3 = card.querySelector("h3");
      const p = card.querySelector("p");
      if (h3) h3.textContent = s.title;
      if (p) p.textContent = s.desc;
    });
  }

  if (content.links) {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => {
      a.href = "https://wa.me/" + content.links.whatsapp;
    });
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
      a.href = content.links.instagram;
    });
    document.querySelectorAll('a[href*="facebook.com"]').forEach(a => {
      a.href = content.links.facebook;
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = "mailto:" + content.links.email;
    });
    document.querySelectorAll('a[href*="drive.google.com"]').forEach(a => {
      a.href = content.links.portfolio;
    });
    const emailSmall = document.querySelector('.contact-card[href^="mailto:"] small');
    if (emailSmall) emailSmall.textContent = content.links.email;
    const form = document.getElementById("contact-form");
    if (form) form.action = "https://formsubmit.co/" + content.links.email;
  }

  applyColors(content.colors);
}

async function loadPublicContent() {
  if (!firebaseReady) return;
  try {
    const snap = await SITE_DOC_REF.get();
    if (snap.exists) {
      applyPublicContent(snap.data());
    }
  } catch (err) {
    console.error("تعذر تحميل محتوى الموقع من Firebase:", err);
  }
}

if (document.querySelector(".hero")) {
  loadPublicContent();
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
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = loginForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    errorEl.classList.remove("show");

    if (!firebaseReady) {
      errorEl.textContent = "لوحة التحكم مش متصلة بـ Firebase لسه. اتبع خطوات الإعداد في firebase-config.js.";
      errorEl.classList.add("show");
      submitBtn.disabled = false;
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = "الإيميل أو كلمة السر غير صحيحة، حاول مرة أخرى.";
      errorEl.classList.add("show");
      loginForm.reset();
      submitBtn.disabled = false;
    }
  });
}

/* ---------------- Dashboard (dashboard.html) ---------------- */
const dashRoot = document.getElementById("dash-root");
if (dashRoot) {
  const logoutBtn = document.getElementById("logout-btn");
  const saveBtn = document.getElementById("save-btn");
  const saveMsg = document.getElementById("save-msg");
  const pwForm = document.getElementById("password-form");
  const pwMsg = document.getElementById("password-msg");

  if (!firebaseReady) {
    dashRoot.innerHTML = '<div class="dash-note"><strong>لسه محتاج خطوة:</strong> لوحة التحكم مش متصلة بـ Firebase. افتح ملف <code>firebase-config.js</code> واتبع التعليمات فيه.</div>';
  } else {
    auth.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = "login.html";
      }
    });

    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => window.location.href = "login.html");
    });

    function fieldRow(labelText, inputHTML) {
      const wrap = document.createElement("div");
      wrap.className = "field";
      wrap.innerHTML = `<label>${labelText}</label>${inputHTML}`;
      return wrap;
    }

    let current = JSON.parse(JSON.stringify(DEFAULT_CONTENT));

    async function loadIntoForm() {
      try {
        const snap = await SITE_DOC_REF.get();
        if (snap.exists) current = { ...DEFAULT_CONTENT, ...snap.data() };
      } catch (err) {
        console.error(err);
      }
      renderForm();
    }

    function renderForm() {
      const textsSection = document.getElementById("edit-texts");
      const servicesSection = document.getElementById("edit-services");
      const linksSection = document.getElementById("edit-links");
      const colorsSection = document.getElementById("edit-colors");

      textsSection.innerHTML = "";
      textsSection.appendChild(fieldRow("عنوان صغير أعلى العنوان الرئيسي (Eyebrow)", `<input type="text" id="f-eyebrow" value="${current.hero.eyebrow}">`));
      textsSection.appendChild(fieldRow("العنوان الرئيسي — الجزء الأول", `<input type="text" id="f-title" value="${current.hero.title}">`));
      textsSection.appendChild(fieldRow("العنوان الرئيسي — الجزء المميز بالون", `<input type="text" id="f-title-accent" value="${current.hero.titleAccent}">`));
      textsSection.appendChild(fieldRow("العنوان الرئيسي — باقي الجملة", `<input type="text" id="f-title-rest" value="${current.hero.titleRest}">`));
      textsSection.appendChild(fieldRow("الفقرة التعريفية", `<textarea id="f-lead">${current.hero.lead}</textarea>`));

      servicesSection.innerHTML = "";
      current.services.forEach((s, i) => {
        servicesSection.appendChild(fieldRow(`اسم الخدمة ${i + 1}`, `<input type="text" id="f-service-title-${i}" value="${s.title}">`));
        servicesSection.appendChild(fieldRow(`وصف الخدمة ${i + 1}`, `<textarea id="f-service-desc-${i}">${s.desc}</textarea>`));
      });

      linksSection.innerHTML = "";
      linksSection.appendChild(fieldRow("رقم واتساب (بدون + وبكود الدولة، مثال 2010xxxxxxxx)", `<input type="text" id="f-whatsapp" value="${current.links.whatsapp}">`));
      linksSection.appendChild(fieldRow("رابط انستجرام", `<input type="text" id="f-instagram" value="${current.links.instagram}">`));
      linksSection.appendChild(fieldRow("رابط فيسبوك", `<input type="text" id="f-facebook" value="${current.links.facebook}">`));
      linksSection.appendChild(fieldRow("الإيميل", `<input type="email" id="f-email" value="${current.links.email}">`));
      linksSection.appendChild(fieldRow("رابط البورتفوليو (Google Drive)", `<input type="text" id="f-portfolio" value="${current.links.portfolio}">`));

      colorsSection.innerHTML = "";
      const colorLabels = { coral: "اللون الأساسي (Coral)", coralDim: "اللون الأساسي الغامق", lime: "لون التمييز (الفويل الذهبي)", ink: "لون الخلفية الغامقة", paper: "لون الورقي" };
      Object.keys(colorLabels).forEach(key => {
        colorsSection.appendChild(fieldRow(colorLabels[key], `
          <div style="display:flex; gap:10px; align-items:center">
            <input type="color" id="f-color-${key}" value="${current.colors[key]}" style="width:50px; height:40px; padding:2px; border-radius:8px">
            <input type="text" id="f-color-text-${key}" value="${current.colors[key]}" style="max-width:140px">
          </div>
        `));
        const picker = document.getElementById(`f-color-${key}`);
        const text = document.getElementById(`f-color-text-${key}`);
        picker.addEventListener("input", () => { text.value = picker.value; });
        text.addEventListener("input", () => { if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) picker.value = text.value; });
      });
    }

    function collectFromForm() {
      const data = JSON.parse(JSON.stringify(current));
      data.hero.eyebrow = document.getElementById("f-eyebrow").value;
      data.hero.title = document.getElementById("f-title").value;
      data.hero.titleAccent = document.getElementById("f-title-accent").value;
      data.hero.titleRest = document.getElementById("f-title-rest").value;
      data.hero.lead = document.getElementById("f-lead").value;

      data.services = data.services.map((s, i) => ({
        title: document.getElementById(`f-service-title-${i}`).value,
        desc: document.getElementById(`f-service-desc-${i}`).value
      }));

      data.links.whatsapp = document.getElementById("f-whatsapp").value;
      data.links.instagram = document.getElementById("f-instagram").value;
      data.links.facebook = document.getElementById("f-facebook").value;
      data.links.email = document.getElementById("f-email").value;
      data.links.portfolio = document.getElementById("f-portfolio").value;

      Object.keys(data.colors).forEach(key => {
        data.colors[key] = document.getElementById(`f-color-text-${key}`).value;
      });

      return data;
    }

    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveMsg.textContent = "جارِ الحفظ...";
      saveMsg.className = "form-msg show";
      try {
        const data = collectFromForm();
        await SITE_DOC_REF.set(data, { merge: true });
        current = data;
        applyColors(data.colors);
        saveMsg.textContent = "تم الحفظ! التغييرات هتظهر لكل زوار الموقع فورًا. ✅";
        saveMsg.className = "form-msg show ok";
      } catch (err) {
        console.error(err);
        saveMsg.textContent = "حصل خطأ أثناء الحفظ، حاول تاني.";
        saveMsg.className = "form-msg show err";
      } finally {
        saveBtn.disabled = false;
      }
    });

    if (pwForm) {
      pwForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        pwMsg.className = "form-msg show";
        const currentPw = document.getElementById("current-password").value;
        const newPw = document.getElementById("new-password").value;
        const newPw2 = document.getElementById("new-password-confirm").value;
        const submitBtn = pwForm.querySelector("button[type=submit]");

        if (newPw !== newPw2) {
          pwMsg.textContent = "كلمة السر الجديدة غير متطابقة في الخانتين.";
          pwMsg.className = "form-msg show err";
          return;
        }
        if (newPw.length < 8) {
          pwMsg.textContent = "كلمة السر لازم تكون 8 حروف/أرقام على الأقل.";
          pwMsg.className = "form-msg show err";
          return;
        }

        submitBtn.disabled = true;
        try {
          const user = auth.currentUser;
          const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPw);
          await user.reauthenticateWithCredential(cred);
          await user.updatePassword(newPw);
          pwMsg.textContent = "تم تغيير كلمة السر بنجاح. ✅";
          pwMsg.className = "form-msg show ok";
          pwForm.reset();
        } catch (err) {
          console.error(err);
          pwMsg.textContent = "كلمة السر الحالية غير صحيحة أو حصل خطأ، حاول تاني.";
          pwMsg.className = "form-msg show err";
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    loadIntoForm();
  }
}
