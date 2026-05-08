importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC4U067nW-zGFxi3s-FI4iBSomFQSqyuyU",
  authDomain: "social-media-app-66b81.firebaseapp.com",
  projectId: "social-media-app-66b81",
  storageBucket: "social-media-app-66b81.firebasestorage.app",
  messagingSenderId: "674957289035",
  appId: "1:674957289035:web:faf364ba3c18dc543c8fce",
  measurementId: "G-FEPTCCPKJ9"
});

const messaging = firebase.messaging();

// ✅ Background Notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  self.registration.showNotification(
    payload.data?.title || "New Notification",
    {
      body: payload.data?.body || "You have a message",
      // icon: "/firebase-logo.png"
    }
  );
});