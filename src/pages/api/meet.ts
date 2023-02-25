import axios from "axios";
import * as JWT from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import {
  CalendarListResource,
  CalendarListResponse,
  CreateCalendarEventResponse,
} from "types/Response";
import { authOptions } from "./auth/[...nextauth]";

import CREDENTIALS from "../../../credentials.json";

function encodeCookies(cookies: Record<string, string>) {
  return Object.keys(cookies)
    .map((key) => `${key}=${cookies[key]}`)
    .join("; ");
}

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default async function MeetLinkGenerate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      res.status(401).end();
      return;
    }

    const userName = session.user.name;
    const userMail = session.user.email;

    if (!(userName && userMail)) {
      res.status(403).end();
      return;
    }

    const { name, start, repeatEnd } = req.body;
    if (!(name && start)) {
      res.status(400).end();
      return;
    }

    const key = await JWT.importPKCS8(CREDENTIALS.private_key, "RS256");

    const jwt = await new JWT.SignJWT({
      scope: "https://www.googleapis.com/auth/calendar",
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(CREDENTIALS.client_email)
      .setIssuedAt()
      .setSubject(process.env.GOOGLE_CLIENT_EMAIL)
      .setExpirationTime("5m")
      .setAudience("https://oauth2.googleapis.com/token")
      .sign(key);

    console.log(
      "Successfully signed JWT for Google service account authentication"
    );

    const {
      data: { access_token },
    } = await axios.post("https://oauth2.googleapis.com/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    });

    console.log("Successfully obtained access token for Google Calendar API");

    const calendars: CalendarListResource[] = [];
    let nextPageToken: string = "";
    do {
      const { data: calendarListData } = await axios.get<CalendarListResponse>(
        `https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250${nextPageToken}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      console.log("Successfully obtained calendar list");

      calendars.push(...calendarListData.items);
      nextPageToken = `&pageToken=${calendarListData.nextPageToken}`;
    } while (!nextPageToken);

    if (
      calendars.filter((calendar) =>
        calendar.summary.includes(userMail.split("@")[0])
      ).length === 0
    ) {
      console.log("Creating new calendar for user");

      const { data } = await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars",
        {
          summary: `스터디 - ${userName} (${userMail.split("@")[0]})`,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      console.log("Successfully created new calendar for user");

      calendars.push(data);
    }

    const calendarId =
      calendars.find((calendar) =>
        calendar.summary.includes(userMail.split("@")[0])
      )?.id || "primary";

    console.log(`Found calendar for user - ${calendarId}`);

    const untilDate = repeatEnd
      ? `${
          new Date(+new Date(repeatEnd) + 15 * 60 * 60 * 1000)
            .toISOString()
            .replaceAll("-", "")
            .replaceAll(":", "")
            .split(".")[0]
        }Z`
      : undefined;

    const { data } = await axios.post<CreateCalendarEventResponse>(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        summary: name,
        start: {
          dateTime: start,
          timeZone: "Asia/Seoul",
        },
        end: {
          dateTime: new Date(+new Date(start) + 60 * 60 * 1000).toISOString(),
          timeZone: "Asia/Seoul",
        },
        attendees: [
          {
            displayName: userName,
            email: userMail,
          },
        ],
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
            requestId: `ycc-study-${Math.random()}`,
          },
        },
        recurrence: repeatEnd
          ? [`RRULE:FREQ=WEEKLY;UNTIL=${untilDate}`]
          : undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log(
      `Successfully created event - ${data.id} (${data.conferenceData.conferenceId})`
    );

    const { data: meetSettingsData } = await axios.get(
      `https://calendar-pa.clients6.google.com/v1/meeting/${data.conferenceData.conferenceId}/calendar/${calendarId}/settings?alt=protojson&key=AIzaSyAJV0pH9dpVwdNZeLajIGsIpjcPu3tVgAE`,
      {
        headers: {
          Authorization: `SAPISIDHASH ${process.env.GOOGLE_ADMIN_SAPISID_HASH}`,
          "Content-Type": "application/json+protobuf",
          "X-Origin": "https://calendar.google.com",
          "X-Goog-Authuser": process.env.GOOGLE_ADMIN_AUTHUSER,
          Cookie: encodeCookies({
            SID: process.env.GOOGLE_ADMIN_SID,
            HSID: process.env.GOOGLE_ADMIN_HSID,
            SSID: process.env.GOOGLE_ADMIN_SSID,
            APISID: process.env.GOOGLE_ADMIN_APISID,
            SAPISID: process.env.GOOGLE_ADMIN_SAPISID,
          }),
        },
      }
    );

    const spaceId = meetSettingsData[1][0];
    console.log(`Found space ID - ${spaceId}`);

    const { data: meetData } = await axios.post(
      `https://calendar-pa.clients6.google.com/v1/meeting/${data.conferenceData.conferenceId}/calendar/${calendarId}/settings?alt=protojson&key=AIzaSyAJV0pH9dpVwdNZeLajIGsIpjcPu3tVgAE`,
      [
        data.conferenceData.conferenceId,
        calendarId,
        [
          spaceId,
          data.conferenceData.conferenceId,
          null,
          null,
          [],
          null,
          null,
          null,
          null,
          null,
          [],
          null,
          [],
          null,
          [null, null, null, null, true, null, null, true],
        ],
        [
          [
            "settings.moderation_enabled",
            "settings.cohost_artifact_sharing_enabled",
            "cohost_config",
          ],
        ],
        true,
        [
          [
            ["localId_5834079313", "소그룹 세션 1", null, []],
            ["localId_9296729851", "소그룹 세션 2", null, []],
          ],
        ],
        [
          [
            spaceId,
            data.conferenceData.conferenceId,
            null,
            null,
            [],
            null,
            null,
            null,
            null,
            null,
            [],
            null,
            [],
            null,
            [null, null, null, null, true, null, null, true],
          ],
          [
            [
              ["localId_5834079313", "소그룹 세션 1", null, []],
              ["localId_9296729851", "소그룹 세션 2", null, []],
            ],
          ],
          [[session.user.google], []],
          null,
          [],
        ],
      ],
      {
        headers: {
          Authorization: `SAPISIDHASH ${process.env.GOOGLE_ADMIN_SAPISID_HASH}`,
          "Content-Type": "application/json+protobuf",
          "X-Origin": "https://calendar.google.com",
          "X-Goog-Authuser": process.env.GOOGLE_ADMIN_AUTHUSER,
          Cookie: encodeCookies({
            SID: process.env.GOOGLE_ADMIN_SID,
            HSID: process.env.GOOGLE_ADMIN_HSID,
            SSID: process.env.GOOGLE_ADMIN_SSID,
            APISID: process.env.GOOGLE_ADMIN_APISID,
            SAPISID: process.env.GOOGLE_ADMIN_SAPISID,
          }),
        },
      }
    );

    console.log("Successfully updated meet settings");

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
}
