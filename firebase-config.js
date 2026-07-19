/* ===========================================================
   Nova Studio — Firebase Configuration
   ===========================================================
   عشان الموقع يبقى متصل بقاعدة بيانات حقيقية (Firestore) وأي
   تعديل من لوحة التحكم يظهر لكل زوار الموقع فورًا، لازم تعمل
   مشروع Firebase مجاني وتحط بياناته هنا. الخطوات كاملة موجودة
   في الرسالة اللي هتوصلك بعد الملفات دي.

   استبدل القيم اللي تحت بالقيم اللي هتاخدها من Firebase Console:
   Project settings → General → Your apps → SDK setup and configuration
   =========================================================== */

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

/* Firestore document that holds all editable site content */
const SITE_DOC_REF = db.collection("content").doc("site");
