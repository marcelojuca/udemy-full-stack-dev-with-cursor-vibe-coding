import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { checkUserExists, saveNewUser, getUserByEmail } from './userManagement'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  ],
  // NextAuth callbacks with Supabase integration
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists in our database
        const userExists = await checkUserExists(user.email)
        
        if (!userExists) {
          // Save new user to database
          const savedUser = await saveNewUser({
            name: user.name,
            email: user.email,
            emailVerified: profile?.email_verified,
            image: user.image
          })
          
          if (!savedUser) {
            console.error('Failed to save new user to database')
            return false // Prevent sign in if we can't save user
          }
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false // Prevent sign in on error
      }
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        session.user.id = token?.sub
        
        // Get user data from database to ensure we have the latest info
        try {
          const dbUser = await getUserByEmail(session.user.email)
          if (dbUser) {
            session.user.dbId = dbUser.id
            session.user.createdAt = dbUser.created_at
          }
        } catch (error) {
          console.error('Error fetching user data for session:', error)
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: false, // Disable debug logs
}

export default NextAuth(authOptions)
