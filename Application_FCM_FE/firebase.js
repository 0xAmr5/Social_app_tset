const firebaseConfig = {
  apiKey: "AIzaSyC4U067nW-zGFxi3s-FI4iBSomFQSqyuyU",
  authDomain: "social-media-app-66b81.firebaseapp.com",
  projectId: "social-media-app-66b81",
  storageBucket: "social-media-app-66b81.firebasestorage.app",
  messagingSenderId: "674957289035",
  appId: "1:674957289035:web:faf364ba3c18dc543c8fce",
  measurementId: "G-FEPTCCPKJ9"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

export { messaging };