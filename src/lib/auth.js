import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Debug environment variables
console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "UNDEFINED");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "UNDEFINED");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "UNDEFINED");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "UNDEFINED");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "UNDEFINED"); 
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "UNDEFINED");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "UNDEFINED");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "SET" : "UNDEFINED");
console.log("=== END DEBUG ===");

// Additional check for Google OAuth
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ GOOGLE_CLIENT_ID is missing!");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ GOOGLE_CLIENT_SECRET is missing!");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is missing!");
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  // Use JWT strategy for now - we'll add Supabase later
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        session.user.id = token?.sub
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
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
