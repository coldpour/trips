import type { Context } from "https://edge.netlify.com";

const EVENTBRITE_BASE = "https://www.eventbriteapi.com/v3/events/search/";

export default async (request: Request, context: Context) => {
  const apiToken =
    context.env?.EVENTBRITE_API_TOKEN ||
    (typeof Deno !== "undefined" ? Deno.env.get("EVENTBRITE_API_TOKEN") : undefined);

  if (!apiToken) {
    return new Response(JSON.stringify({ error: "Missing Eventbrite API token" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const url = new URL(request.url);
  const proxyUrl = new URL(EVENTBRITE_BASE);
  const paramsToForward = [
    "q",
    "location.latitude",
    "location.longitude",
    "location.within",
    "start_date.range_start",
    "start_date.range_end",
    "expand",
  ];

  for (const param of paramsToForward) {
    const value = url.searchParams.get(param);
    if (value) {
      proxyUrl.searchParams.set(param, value);
    }
  }

  const response = await fetch(proxyUrl.toString(), {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      accept: "application/json",
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "public, max-age=60",
    },
  });
};
