import type { Context } from "https://edge.netlify.com";

const TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json";

export default async (request: Request, context: Context) => {
  const apiKey = Netlify.env.get("TICKETMASTER_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing Ticketmaster API key" }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }

  const url = new URL(request.url);
  const proxyUrl = new URL(TM_BASE);
  const paramsToForward = [
    "keyword",
    "startDateTime",
    "endDateTime",
    "size",
    "sort",
  ];

  for (const param of paramsToForward) {
    const value = url.searchParams.get(param);
    if (value) {
      proxyUrl.searchParams.set(param, value);
    }
  }
  proxyUrl.searchParams.set("apikey", apiKey);

  const response = await fetch(proxyUrl.toString(), {
    headers: {
      accept: "application/json",
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") || "application/json",
      "cache-control": "public, max-age=60",
    },
  });
};
