import NextAuth from "next-auth";
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
  debug: true,
};

export default NextAuth(authOptions);
