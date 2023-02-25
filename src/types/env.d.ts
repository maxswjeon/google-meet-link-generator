declare module NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL: string;

    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
    KEYCLOAK_ISSUER: string;

    GOOGLE_API_KEY: string;
    GOOGLE_CLIENT_EMAIL: string;

    GOOGLE_ADMIN_SID: string;
    GOOGLE_ADMIN_HSID: string;
    GOOGLE_ADMIN_SSID: string;
    GOOGLE_ADMIN_APISID: string;
    GOOGLE_ADMIN_SAPISID: string;
    GOOGLE_ADMIN_SAPISID_HASH: string;
    GOOGLE_ADMIN_AUTHUSER: string;
  }
}
