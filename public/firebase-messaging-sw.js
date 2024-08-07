importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js")

const firebaseConfig = {
    apiKey: "AIzaSyAnj8clJ6oJfReQLYU7LlK7ZF4fxiubvhc",
    authDomain: "experience-9062b.firebaseapp.com",
    projectId: "experience-9062b",
    storageBucket: "experience-9062b.appspot.com",
    messagingSenderId: "514143788543",
    appId: "1:514143788543:web:bfcba670f8ec1b19025bca",
    measurementId: "G-TXY42BLJYY",
  };

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(payload=>{
    const notificationTitle=payload.notification.title
    const notificationOption={
        body:payload.notification.body
    }
    self.registration.showNotification(notificationTitle,notificationOption)
  })
  self.addEventListener("message",event=>{
    const {type,data}=event.data
    if (type==="showNotification"){
      const {title,body}=data
      self.registration.showNotification(title,{
        body:body,
      })
    }
    self.registration.showNotification(title)
  })