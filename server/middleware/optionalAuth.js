import jwt from 'jsonwebtoken'
import LMSUser from '../models/LMSUser.js'

/**
 * Optional Authentication Middleware
 * Allows access without login but adds user context if token exists
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.headers.authorization?.split(' ')[1]
    
    if (token) {
      // Token exists - validate it
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        
        // Get user from token
        const user = await LMSUser.findById(decoded.id).select('-password')
        
        if (user) {
          req.user = user
          req.authenticated = true
        } else {
          req.authenticated = false
        }
      } catch (error) {
        // Invalid token - continue without auth
        req.authenticated = false
      }
    } else {
      // No token - continue without auth
      req.authenticated = false
    }
    
    next()
  } catch (error) {
    // Error in middleware - continue without auth
    req.authenticated = false
    next()
  }
}

export default optionalAuth
