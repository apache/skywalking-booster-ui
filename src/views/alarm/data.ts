export const AlarmOptions = [
  { label: "All", value: "" },
  { label: "Service", value: "Service" },
  { label: "ServiceInstance", value: "ServiceInstance" },
  { label: "Endpoint", value: "Endpoint" },
  { label: "ServiceRelation", value: "ServiceRelation" },
  { label: "ServiceInstanceRelation", value: "ServiceInstanceRelation" },
  { label: "EndpointRelation", value: "EndpointRelation" },
];
export const EventsDetailHeaders = [
  { text: "eventID", class: "uuid" },
  { text: "eventName", class: "name" },
  { text: "eventsType", class: "type" },
  { text: "startTime", class: "startTime" },
  { text: "endTime", class: "endTime" },
];

export const AlarmDetailCol = [
  {
    label: "scope",
    value: "scope",
  },
  {
    label: "startTime",
    value: "startTime",
  },
  {
    label: "tags",
    value: "tags",
  },
  {
    label: "message",
    value: "message",
  },
  {
    label: "events",
    value: "eventDetail",
  },
];

export const EventsDetailKeys = [
  { text: "eventID", class: "uuid" },
  { text: "eventName", class: "name" },
  { text: "eventsType", class: "type" },
  { text: "startTime", class: "startTime" },
  { text: "endTime", class: "endTime" },
  { text: "eventsMessage", class: "message" },
  { text: "eventSource", class: "source" },
];
