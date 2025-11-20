import admin from 'firebase-admin'

let firebaseApp = null

export const initializeFirebaseAdmin = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    // Check if service account is provided via environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('✅ Firebase Admin initialized with service account')
    } else {
      console.log('⚠️  Firebase Admin not initialized - FIREBASE_SERVICE_ACCOUNT not provided')
      console.log('💡 Auth will work in development mode with Firebase client SDK only')
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message)
  }

  return firebaseApp
}

export const verifyFirebaseToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      // In development, we'll allow a simplified flow
      console.log('⚠️  Firebase Admin not available, using simplified auth')
      return null
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Firebase token verification error:', error.message)
    throw new Error('Invalid token')
  }
}

export default admin
