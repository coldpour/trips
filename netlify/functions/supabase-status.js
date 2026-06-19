const PROJECT_REF = "tnyckutfhrdjqqhixswv";
const SUPABASE_MANAGEMENT_API = "https://api.supabase.com/v1";
const WAKE_MESSAGE =
  "Please bear with me while I awaken our sleeping cloud resources.";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function progressForStatus(status) {
  switch (status) {
    case "INACTIVE":
      return 25;
    case "COMING_UP":
    case "RESTORING":
    case "RESTARTING":
      return 65;
    case "ACTIVE_HEALTHY":
      return 100;
    default:
      return 45;
  }
}

async function callSupabaseManagement(path, options = {}) {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  if (!token) {
    throw new Error("SUPABASE_MANAGEMENT_TOKEN is not configured.");
  }

  const response = await fetch(`${SUPABASE_MANAGEMENT_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Supabase Management API ${response.status}: ${body || response.statusText}`,
    );
  }

  return response.json();
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const project = await callSupabaseManagement(`/projects/${PROJECT_REF}`);
    const projectStatus = project.status;

    if (projectStatus === "ACTIVE_HEALTHY") {
      return json(200, {
        status: "active",
        progress: 100,
      });
    }

    if (projectStatus === "INACTIVE") {
      await callSupabaseManagement(`/projects/${PROJECT_REF}/restore`, {
        method: "POST",
      });
    }

    return json(200, {
      status: "restoring",
      supabaseStatus: projectStatus,
      progress: progressForStatus(projectStatus),
      message: WAKE_MESSAGE,
    });
  } catch (error) {
    console.error(error);
    return json(503, {
      status: "unavailable",
      error: "Unable to check Supabase project status.",
    });
  }
}
