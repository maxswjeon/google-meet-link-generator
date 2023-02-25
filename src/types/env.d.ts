declare module NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL: string;

    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
    KEYCLOAK_ISSUER: string;

    GOOGLE_API_KEY: string;
    GOOGLE_CLIENT_EMAIL: string;
  }
}
