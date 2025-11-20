import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBHv_TqG5ZlQ3xU9X8mZJKqV4oRnWYwE7s",
  authDomain: "learnapp-demo.firebaseapp.com",
  projectId: "learnapp-demo",
  storageBucket: "learnapp-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider, signInWithPopup, signOut }
export default app
