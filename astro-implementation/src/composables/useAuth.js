import { ref } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase.js'

// Singleton reactive user — shared across all components in this page session
const user = ref(null)
const authReady = ref(false)

onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  authReady.value = true
})

export function useAuth() {
  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  return { user, authReady, login, logout }
}
