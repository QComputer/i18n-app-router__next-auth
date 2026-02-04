import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import prisma from "@/lib/db/prisma"
import type { Provider } from "next-auth/providers"
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

// Extend the default NextAuth types
declare module "next-auth" {
  interface User {
    role: string
    organizationId: string | null
    name?: string | null
    image?: string | null
  }

  interface Session {
    user: {
      id: string
      username: string
      role: string
      organizationId: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface JWT {
    role: string
    organizationId: string | null
  }
}

// Build providers array conditionally
const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
      },
    },
  }),
  CredentialsProvider({
    name: "credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) {
        throw new Error("Username and password are required")
      }
      const username = credentials.username as string;
      const password = credentials.password as string;
      const normalizedUsername = username.trim().toLowerCase();

      const user = await prisma.user.findFirst({
          where: { username: normalizedUsername },
      });

      if (!user) {
        throw new Error("Invalid username")
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;


      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      }
    },
  }),
]

// Conditionally add EmailProvider if SMTP is configured
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }) as Provider
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/signup",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string | null
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return true
      }
      if (account?.provider === "credentials") {
        return true
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.id)
    },
  },
  debug: process.env.NODE_ENV === "development",
})
