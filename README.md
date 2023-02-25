# Google Meet Link Generator

This is a Google Meet Link Generator that generates a Google Meet link for you.

## What is this? Why should I use this?

This is for users who...

- don't have money to buy a Google Workspace subscription for all the users in their organization
- but have money to run a [Keycloak](https://www.keycloak.org/) and a [FreeIPA](https://www.freeipa.org/) server

So, normal Google users have no need to use this.

For Google Workspace users:

- Google Workspace Business Starter: You cannot use this. (https://support.google.com/meet/answer/10885841)
- Google Workspace Business Standard or above: You can benefit from using this.
  - Allow your organization people to benefit from Google Meet features given to the Google Workspace Business Standard or above subscription.
    - US or international dial-in phone numbers
    - Digital whiteboarding
    - Meeting recordings saved to Google Drive
    - Polling and Q&A
    - Moderation controls
    - Hand raising
    - Breakout rooms
    - Attendance tracking (\* above Business Plus)
    - In-domain live streaming (\* above Enterprise)

## How to use this?

### 1. Create a Google API project

1. Visit [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Enable the [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) for the project.
3. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials) and create a new API Key

   - Click "CREATE CREDENTIALS" button.
   - Select "API key" from the dropdown menu.
   - Copy the API key and save it somewhere safe.
   - Add the API key to the `GOOGLE_API_KEY` environment variable.

4. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a Service Account for the project.

   - Skip the "Grant this service account access to project" section.
   - Skip the "Grant users access to this service account" section.

5. Go to IAM & Admin > Service Accounts > \[Service Account Name\] > Keys and create a new key.

   - Click the "ADD KEY" button.
   - Select "JSON" as the key type.
   - Click the "CREATE" button.

6. Download the JSON file and save it somewhere safe. Rename it to `credentials.json`.
7. Go to [Admin Console](https://admin.google.com/) and go to [Security > Access and data control > API controls > Domain-wide Delegation](https://admin.google.com/u/0/ac/owl/domainwidedelegation)
   - Click the "Add new" button.
   - Put the Service Account's email address in the "Client ID" field.
   - Put the following scopes in the "Scope" field.
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/drive`

### 2. Get credentials from Google Calendar

Since the [Google Calendar](https://calendar.google.com/) is using Private API to add co-hosts to the meeting, you need to get credentials from Google Calendar.

1. Go to [Google Calendar](https://calendar.google.com/) and log in with your Google Workspace account.
2. Open the developer console by pressing `F12` or `Ctrl + Shift + I` (`Cmd + Option + I` in Macs).
3. Go to the "Network" tab.
4. Filter the requests by type "Fetch/XHR" and `calendar-pa.clients6.google.com`.
5. Click the "Create" button to create a new event.
6. Click the "Add a Google Meet video call" button.
7. Click the Settings button next to the "Join with Google meet" button.
8. Find the request starts with `settings`
9. Copy these values in `Request Headers`
   - Authorization
   - Cookie
   - x-goog-authuser
10. Open any text editor you like, and extract from cookie value by this methods below

    - Paste Cookie value from (9)
    - Replace `; ` with `\n`
    - Copy values after `=` sign for these values
      - SID
      - HSID
      - SSID
      - APISID
      - SAPISID
    - Paste these values to .env
      - SID => GOOGLE_ADMIN_SID
      - HSID => GOOGLE_ADMIN_HSID
      - SSID => GOOGLE_ADMIN_SSID
      - APISID => GOOGLE_ADMIN_APISID
      - SAPISID => GOOGLE_ADMIN_SAPISID

    > **Note**
    >
    > The GOOGLE_ADMIN_SAPISID_HASH should not contain SAPISIDHASH, but only the hash value.

### 3. Get credentials from FreeIPA and set up FreeIPA

Send a request to FreeIPA to get a token.

    - URL: `https://<your FreeIPA server>/ipa/session/login_password`
    - Method: `POST`
    - Headers:
      - `Accept`: `text/plain`
      - `Content-Type`: `application/x-www-form-urlencoded`
      - `Referer`: `https://<your FreeIPA server>/ipa/session/login_password`

Copy `ipa_session` cookie value from the response and put it to the `IPA_SESSION_COOKIE` environment variable.

> **Warning**
>
> The FreeIPA user should have their `Google Account ID` set in the `departmentNumber` field.

### 4. Set up Keycloak

Add a new client to Keycloak, and set the following values. - KEYCLOAK_CLIENT_ID - KEYCLOAK_CLIENT_SECRET - KEYCLOAK_ISSUER: `https://<your Keycloak server>/auth/realms/<your realm name>`

### 5. Set up the application

Put these environment variables to the `.env` file.

    - next-auth related
        - `NEXTAUTH_URL`: The URL of your application
        - `NEXTAUTH_SECRET`: A secret string. Recommended to use `openssl rand -hex 32`
    - Keycloak related
        - `KEYCLOAK_CLIENT_ID`: The client ID of the client you created in Keycloak
        - `KEYCLOAK_CLIENT_SECRET`: The client secret of the client you created in Keycloak
        - `KEYCLOAK_ISSUER`: The issuer URL of your Keycloak server. (e.g. `https://<your Keycloak server>/auth/realms/<your realm name>`)
    - Google API related (For Public APIs, Legit)
        - `GOOGLE_API_KEY`: The API key you created in Google Cloud Console
        - `GOOGLE_CLIENT_EMAIL`: The email address of the Google Workspace owner. **All the meetings will be created by this account.**
    - Google API related (For Private APIs, Not Legit)
        - `GOOGLE_ADMIN_SID`: The SID value of the cookie you got from Google Calendar
        - `GOOGLE_ADMIN_HSID`: The HSID value of the cookie you got from Google Calendar
        - `GOOGLE_ADMIN_SSID`: The SSID value of the cookie you got from Google Calendar
        - `GOOGLE_ADMIN_APISID`: The APISID value of the cookie you got from Google Calendar
        - `GOOGLE_ADMIN_SAPISID`: The SAPISID value of the cookie you got from Google Calendar
        - `GOOGLE_ADMIN_SAPISID_HASH`: The hash value after the SAPISIDHASH in the Authorization header you got from Google Calendar
        - `GOOGLE_ADMIN_AUTHUSER`: The x-goog-authuser value of the request you got from Google Calendar
    - FreeIPA Server related
        - `IPA_SERVER_URL`: The URL of your FreeIPA server
        - `IPA_SERVER_COOKIE`: The `ipa_session` cookie value you got from FreeIPA

## Usage

```bash
docker compose up -d
```
