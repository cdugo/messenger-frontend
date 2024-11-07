import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { apiClient } from "./api/apiClient"
import type { LoginCredentials, User } from "./types/user"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    user: User
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const loginCredentials: LoginCredentials = {
          username: credentials.username as string,
          password: credentials.password as string,
        };

        try {
          const user = await apiClient.login(loginCredentials);
          return user;
        } catch {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as User & AdapterUser;
      return session;
    }
  }
}) 