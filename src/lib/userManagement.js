import { supabaseAdmin } from './supabase'

/**
 * Check if a user exists in the database by email
 * @param {string} email - User's email address
 * @returns {Promise<boolean>} - True if user exists, false otherwise
 */
export async function checkUserExists(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user existence:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * Save a new user to the database
 * @param {Object} userData - User data from NextAuth
 * @returns {Promise<Object|null>} - Saved user data or null if error
 */
export async function saveNewUser(userData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: userData.name,
          email: userData.email,
          email_verified: userData.emailVerified ? new Date(userData.emailVerified) : null,
          image: userData.image,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving new user:', error)
      return null
    }

    // User saved successfully
    return data
  } catch (error) {
    console.error('Error saving new user:', error)
    return null
  }
}

/**
 * Get user from database by email
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user by email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}
