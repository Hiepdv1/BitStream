import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import type { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;

        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      const jwt = token as JWT;

      session.accessToken = jwt.accessToken;
      session.idToken = jwt.idToken;
      session.provider = jwt.provider;
      session.providerAccountId = jwt.providerAccountId;

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
