import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { getUserByEmail } from './userManagement';

/**
 * Get the authenticated user's ID from the session
 * @returns {Promise<string|null>} - User ID or null if not authenticated
 */
export async function getAuthenticatedUserId() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await getUserByEmail(session.user.email);
    return user?.id || null;
  } catch (error) {
    console.error('Error getting authenticated user ID:', error);
    return null;
  }
}

/**
 * Middleware function to check authentication and return user ID
 * @param {Request} request - The incoming request
 * @returns {Promise<{userId: string, error: Response|null}>} - User ID and any error response
 */
export async function requireAuth(request) {
  const userId = await getAuthenticatedUserId();
  
  if (!userId) {
    return {
      userId: null,
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  return { userId, error: null };
}
