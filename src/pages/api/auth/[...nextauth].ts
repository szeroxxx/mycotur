import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { User } from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

interface AuthError extends Error {
  response?: {
    data: {
      message?: string;
    };
  };
  request?: unknown;
}

// interface UserData {
//   uuid: string;
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// }

interface SessionUser extends User {
  role?: string;
  accessToken?: string;
  uuid?: string;
  categories?: string[];
}

interface CustomSession extends Session {
  user?: SessionUser;
}

interface CustomToken extends JWT {
  role?: string;
  accessToken?: string;
  uuid?: string;
  categories?: string[];
}

if (!process.env.NEXTAUTH_BACKEND_URL) {
  throw new Error("NEXTAUTH_BACKEND_URL is not defined");
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        try {
          const response = await axios.post(
            `${process.env.NEXTAUTH_BACKEND_URL}/api/login`,
            {
              email: credentials.email,
              password: credentials.password,
              role: credentials.role || "agent",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );

          console.log("response::: ", response);
          if (response.status !== 200) {
            throw new Error("Authentication failed");
          }

          const { userData, token } = response.data;

          if (!userData || !token) {
            throw new Error("Invalid response from authentication server");
          }
          console.log("userData::: ", userData);
          return {
            id: userData.uuid || userData.id.toString(),
            name: userData.name,
            email: userData.email,
            role: userData.role,
            accessToken: token,
            categories: userData.categories,
            uuid: userData.uuid,
          };
        } catch (error: unknown) {
          const authError = error as AuthError;
          if (authError.response) {
            throw new Error(
              authError.response.data.message || "Authentication failed"
            );
          } else if (authError.request) {
            throw new Error("No response from authentication server");
          } else {
            throw new Error("Error during authentication process");
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: CustomToken; user?: SessionUser }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.uuid = user.uuid;
        token.categories = user.categories;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: CustomSession;
      token: CustomToken;
    }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
        session.user.uuid = token.uuid;
        session.user.categories = token.categories;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
});
