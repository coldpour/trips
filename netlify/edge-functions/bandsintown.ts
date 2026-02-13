import type { Context } from "https://edge.netlify.com";

const BANDSINTOWN_BASE = "https://www.bandsintown.com/citySuggestions";

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);
  const searchString = url.searchParams.get("string");

  if (!searchString) {
    return new Response(JSON.stringify({ error: "Missing 'string' parameter" }), {
      status: 400,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const proxyUrl = new URL(BANDSINTOWN_BASE);
  proxyUrl.searchParams.set("string", searchString);

  const response = await fetch(proxyUrl.toString(), {
    headers: {
      accept: "application/json",
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "public, max-age=3600",
    },
  });
};
