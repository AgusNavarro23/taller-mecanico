import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        if (!user.approved) {
          throw new Error("Tu cuenta está pendiente de aprobación del administrador");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, approved: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.approved = dbUser.approved;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).approved = token.approved;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!dbUser) {
          const userCount = await prisma.user.count();
          const isFirstUser = userCount === 0;

          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!.split("@")[0],
              image: user.image,
              role: isFirstUser ? "ADMIN" : "USER",
              approved: isFirstUser,
            },
          });

          user.id = newUser.id;
          (user as any).role = newUser.role;

          if (!isFirstUser) {
            const { createNotification } = await import("@/lib/notifications");
            const admins = await prisma.user.findMany({
              where: { role: "ADMIN", approved: true },
            });
            for (const admin of admins) {
              await createNotification({
                title: "Nuevo registro pendiente",
                message: `${newUser.name} (${newUser.email}) se registró via ${account.provider} y espera aprobación.`,
                type: "registration",
                entityId: newUser.id,
                entityType: "user",
              });
            }
          }
        } else {
          (user as any).role = dbUser.role;
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
