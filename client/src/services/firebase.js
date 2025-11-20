// Google OAuth Configuration (Direct - No Firebase)
const GOOGLE_CLIENT_ID = '330221998455-l5920jjq016cubbl4pajd8oqits37hgm.apps.googleusercontent.com'

// Initialize Google OAuth
export const initGoogleAuth = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

// Google Sign In
export const signInWithGoogle = (callback) => {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: callback
  })
  
  window.google.accounts.id.prompt()
}

// Render Google Button
export const renderGoogleButton = (elementId, callback) => {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: callback
  })
  
  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    { 
      theme: 'outline', 
      size: 'large',
      text: 'continue_with',
      width: '100%'
    }
  )
}

export default { initGoogleAuth, signInWithGoogle, renderGoogleButton }

