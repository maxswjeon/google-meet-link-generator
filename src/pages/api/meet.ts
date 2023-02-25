import axios from "axios";
import * as JWT from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import {
  CalendarListResource,
  CalendarListResponse,
  CreateCalendarEventResponse,
} from "types/Response";
import CREDENTIALS from "../../../credentials.json";

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

    const { name, start, repeat, repeatEnd } = req.body;
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

    const { data } = await axios.post<CreateCalendarEventResponse>(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        summary: name,
        start: {
          dateTime: start,
        },
        end: {
          dateTime: new Date(+new Date(start) + 60 * 60 * 1000).toISOString(),
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

    const { data: meetData } = await axios.post(
      `https://calendar-pa.clients6.google.com/v1/meeting/${data.conferenceData.conferenceId}/calendar/${process.env.GOOGLE_CLIENT_EMAIL}}/settings?alt=protojson&key=${process.env.GOOGLE_API_KEY}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
}
