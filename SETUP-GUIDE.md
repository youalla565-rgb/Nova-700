# دليل ربط موقع Nova Studio بـ Firebase (خطوة بخطوة)

بعد الخطوات دي، لوحة التحكم هتبقى بتتحكم في الموقع فعليًا: أي نص أو لون أو رابط أو كلمة سر تغيّرها من اللوحة، هتظهر لكل زوار الموقع فورًا — من غير ما تلمس الكود تاني.

---

## 1) اعمل مشروع Firebase (مجاني)

1. روح على https://console.firebase.google.com
2. اضغط **Add project** واكتب اسم زي `nova-studio`
3. تقدر تعطّل Google Analytics، مش لازمة هنا
4. استنى لحد ما المشروع يتعمل

## 2) فعّل Firestore (قاعدة البيانات)

1. من القائمة الجانبية: **Build → Firestore Database**
2. اضغط **Create database**
3. اختار **Start in production mode**
4. اختار أقرب Location (زي `eur3` أو `me-west1`)
5. بعد ما تتعمل، افتح تبويب **Rules** وامسح اللي موجود وحط بدله:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /content/site {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

القاعدة دي معناها: أي حد يقدر **يقرا** محتوى الموقع (عادي، هو موقع عام)، لكن **الكتابة/التعديل** مسموحة بس لمين مسجل دخول (يعني الأدمن بتاعك من اللوحة).

اضغط **Publish**.

## 3) فعّل تسجيل الدخول بالإيميل وكلمة السر

1. من القائمة الجانبية: **Build → Authentication**
2. اضغط **Get started**
3. من تبويب **Sign-in method**، فعّل **Email/Password**
4. روح لتبويب **Users** واضغط **Add user**
5. حط إيميل (مش لازم يكون إيميل حقيقي يستقبل رسائل، هو مجرد معرّف دخول) — مثلاً:
   `admin@novastudio.site`
6. حط كلمة السر: `NS#Studio26@Kx9vR!`
7. احفظ الإيميل وكلمة السر دول عندك كويس، هما مفتاح دخولك للوحة التحكم

> ملحوظة: لو حبيت تغيّر كلمة السر بعد كده، مش محتاج ترجع لـ Firebase — في اللوحة نفسها فيه قسم "تغيير كلمة السر".

## 4) هات مفاتيح المشروع (Config)

1. من القائمة الجانبية اضغط على أيقونة الترس ⚙️ → **Project settings**
2. انزل لقسم **Your apps** واضغط على أيقونة الويب `</>`
3. سمّي التطبيق أي اسم (زي `nova-web`) واضغط **Register app**
4. هيديك كود فيه object اسمه `firebaseConfig` — انسخ القيم دي

## 5) حط المفاتيح في ملف `firebase-config.js`

افتح ملف `firebase-config.js` اللي جوه ملفات الموقع، واستبدل القيم دي:

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
```

بالقيم الحقيقية اللي نسختها من Firebase. احفظ الملف.

## 6) ارفع الموقع

ارفع كل الملفات (بما فيها `firebase-config.js` بعد ما عدلته) على الاستضافة بتاعتك زي ما هي دلوقتي (نفس الطريقة القديمة، مفيش حاجة اتغيرت في الاستضافة نفسها).

## 7) جرّب

1. افتح `login.html` من الموقع
2. سجّل دخول بالإيميل وكلمة السر اللي عملتهم في خطوة 3
3. جرّب تغيّر أي نص أو لون واضغط **حفظ ونشر التعديلات**
4. افتح الموقع الرئيسي (من متصفح تاني أو موبايل) وشوف التغيير ظهر لكل الزوار

---

## أسئلة شائعة

**هل ده هيكلفني فلوس؟**
Firebase عنده خطة مجانية (Spark) سخية جدًا وكافية تمامًا لموقع بحجمك — آلاف القراءات والكتابات يوميًا مجانًا. مش هتدفع حاجة إلا لو الموقع كبر جدًا وبقى عنده زوار بالملايين.

**لو نسيت كلمة السر؟**
من Firebase Console → Authentication → Users، تقدر تحذف المستخدم وتعمل واحد جديد بكلمة سر تانية.

**اللوحة قالتلي "لسه محتاج خطوة"؟**
معناها إنك لسه ما حطتش المفاتيح الحقيقية في `firebase-config.js` (لسه فيها القيم اللي بتبدأ بـ PASTE_).
