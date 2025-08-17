// public/firebase-messaging-sw.js
importScripts('/firebase-app-compat.js');
importScripts('/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBEy2mk7jIzEvkSzaj300Yego_mS-iWPZ0',
  authDomain: 'drovo-food-app.firebaseapp.com',
  projectId: 'drovo-food-app',
  storageBucket: 'drovo-food-app.firebasestorage.app',
  messagingSenderId: '115840144565',
  appId: '1:115840144565:web:31a02646b27a7012ee5afc',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

