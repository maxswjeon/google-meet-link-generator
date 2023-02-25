export type CreateCalendarEventResponse = {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  creator: {
    email: string;
  };
  organizer: {
    email: string;
    displayName: string;
    self: boolean;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  iCalUID: string;
  sequence: number;
  attendees: {
    email: string;
    displayName: string;
    responseStatus: string;
  }[];
  hangoutLink: string;
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
      status: {
        statusCode: string;
      };
    };
    entryPoints: {
      entryPointType: string;
      uri: string;
      label: string;
    }[];
    conferenceSolution: {
      key: {
        type: string;
      };
      name: string;
      iconUri: string;
    };
    conferenceId: string;
  };
  reminders: {
    useDefault: boolean;
  };
  eventType: string;
};

export type CalendarListResponse = {
  kind: "calendar#calendarList";
  etag: string;
  nextPageToken: string;
  nextSyncToken: string;
  items: CalendarListResource[];
};

export type CalendarListResource = {
  kind: "calendar#calendarListEntry";
  etag: string;
  id: string;
  summary: string;
  description: string;
  location: string;
  timeZone: string;
  summaryOverride: string;
  colorId: string;
  backgroundColor: string;
  foregroundColor: string;
  hidden: boolean;
  selected: boolean;
  accessRole: string;
  defaultReminders: [
    {
      method: string;
      minutes: number;
    }
  ];
  notificationSettings: {
    notifications: [
      {
        type: string;
        method: string;
      }
    ];
  };
  primary: boolean;
  deleted: boolean;
  conferenceProperties: {
    allowedConferenceSolutionTypes: [string];
  };
};

export type IPAUserFindResponse = {
  result: {
    result: {
      cn: string[];
      displayname: string[];
      initials: string[];
      gecos: string[];
      objectclass: string[];
      ipauniqueid: string[];
      mepmanagedentry: string[];
      ipantsecurityidentifier: string[];
      employeenumber: string[];
      departmentnumber: string[];
      uidnumber: string[];
      uid: string[];
      homedirectory: string[];
      sn: string[];
      mail: string[];
      gidnumber: string[];
      krbcanonicalname: string[];
      krbprincipalname: string[];
      givenname: string[];
      loginshell: string[];
      nsaccountlock: boolean;
      preserved: boolean;
      memberof_group: string[];
      dn: string;
    }[];
    count: number;
    truncated: boolean;
    summary: string;
  };
  error: unknown;
  id: number;
  principal: string;
  version: string;
};
