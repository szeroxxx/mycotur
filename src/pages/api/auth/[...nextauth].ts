import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.email === 'admin@cotur.com' && credentials?.password === 'admin@123') {
          return {
            id: '1',
            name: 'Admin User',
            email: 'admin@cotur.com',
            role: 'admin'
          };
        }
        
        if (credentials?.email === 'agent@cotur.com' && credentials?.password === 'agent@123') {
          return {
            id: '2',
            name: 'Test Agent',
            email: 'agent@cotur.com',
            role: 'agent'
          };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    }
  },  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, 
  },
});