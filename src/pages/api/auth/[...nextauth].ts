import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,

      style: {
        logo: "/logo.png",
        logoDark: "/logo.png",
        bg: "#0011ff",
        bgDark: "#0011ff",
        text: "#fff",
        textDark: "#fff",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.google = profile?.google;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.google = token.google;

      return session;
    },
  },
} as NextAuthOptions;

export default NextAuth(authOptions);
