import { OAuth2Client } from 'google-auth-library'

const CLIENT_ID = '330221998455-l5920jjq016cubbl4pajd8oqits37hgm.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)

/**
 * Verify Google ID Token
 * @param {string} token - Google ID token from frontend
 * @returns {Promise<Object>} - User payload from Google
 */
export async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    })
    
    const payload = ticket.getPayload()
    
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    }
  } catch (error) {
    console.error('Google token verification failed:', error)
    throw new Error('Invalid Google token')
  }
}

export default { verifyGoogleToken }
