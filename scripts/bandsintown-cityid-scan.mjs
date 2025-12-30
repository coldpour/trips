import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const MAX_CITY_ID = 99999999;
const DEFAULT_COUNT = 100000;
const targetXPath = '//*[@id="main"]/div/div[1]/header/div[3]/div/div';

const supabaseUrl = "https://tnyckutfhrdjqqhixswv.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY env var.");
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const claimJob = async (cityId, allowError) => {
  const now = new Date().toISOString();
  const statuses = allowError ? ["pending", "error"] : ["pending"];
  const updateResult = await supabase
    .from("bandsintown_city_jobs")
    .update({ status: "claimed", claimed_at: now, updated_at: now })
    .eq("city_id", cityId)
    .in("status", statuses)
    .select("city_id");
  if (updateResult.error) {
    console.warn(`Failed to claim pending ${cityId}: ${updateResult.error.message}`);
  }
  if (updateResult.data && updateResult.data.length > 0) {
    return true;
  }
  const insertResult = await supabase
    .from("bandsintown_city_jobs")
    .insert({ city_id: cityId, status: "claimed", claimed_at: now, updated_at: now })
    .select("city_id");
  if (insertResult.error) {
    if (insertResult.error.code === "23505") {
      return false;
    }
    console.warn(`Failed to insert claim ${cityId}: ${insertResult.error.message}`);
    return false;
  }
  return insertResult.data && insertResult.data.length > 0;
};

const parseRange = () => {
  const arg = process.argv.find((value) => value.startsWith("--range"));
  if (!arg) return null;
  const [, raw] = arg.split("=");
  const rangeValue = raw || process.argv[process.argv.indexOf(arg) + 1];
  if (!rangeValue) {
    throw new Error("Missing value for --range (expected start-end).");
  }
  const [startRaw, endRaw] = rangeValue.split("-");
  const start = Number(startRaw);
  const end = Number(endRaw);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    throw new Error(`Invalid range: ${rangeValue}`);
  }
  return { start, end };
};

const getMaxJobId = async () => {
  const { data, error } = await supabase
    .from("bandsintown_city_jobs")
    .select("city_id")
    .order("city_id", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    return null;
  }
  return Number(data[0].city_id);
};

const getErrorIds = async (limit) => {
  const { data, error } = await supabase
    .from("bandsintown_city_jobs")
    .select("city_id")
    .eq("status", "error")
    .order("city_id", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => Number(row.city_id)).filter(Number.isFinite);
};

const range = parseRange();
let cityIds = [];
let allowErrorClaim = false;
if (range) {
  const end = Math.min(range.end, MAX_CITY_ID);
  for (let id = range.start; id <= end; id += 1) {
    cityIds.push(id);
  }
} else {
  const maxJobId = await getMaxJobId();
  const start = maxJobId ? Math.min(maxJobId + 1, MAX_CITY_ID) : 1;
  if (start <= MAX_CITY_ID) {
    const end = Math.min(start + DEFAULT_COUNT - 1, MAX_CITY_ID);
    for (let id = start; id <= end; id += 1) {
      cityIds.push(id);
    }
  } else {
    cityIds = await getErrorIds(DEFAULT_COUNT);
    allowErrorClaim = true;
  }
}

if (cityIds.length === 0) {
  console.log("No city ids to scan.");
  process.exit(0);
}

const upsertCity = async (cityId, cityName) => {
  const payload = {
    city_id: cityId,
    city_name: cityName,
    fetched_at: new Date().toISOString(),
  };
  const result = await supabase
    .from("bandsintown_cities")
    .upsert(payload, { onConflict: "city_id" });
  return result;
};
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
});

for (const cityId of cityIds) {
  const claimed = await claimJob(cityId, allowErrorClaim);
  if (!claimed) {
    continue;
  }
  const url = `https://www.bandsintown.com/?city_id=${cityId}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`xpath=${targetXPath}`, { timeout: 5000 });
    const name = await page.locator(`xpath=${targetXPath}`).innerText();
    const cityName = name.trim();
    if (!cityName) {
      await supabase.from("bandsintown_cities").upsert(
        { city_id: cityId, city_name: null, fetched_at: new Date().toISOString() },
        { onConflict: "city_id" },
      );
      await supabase
        .from("bandsintown_city_jobs")
        .update({ status: "not_found", updated_at: new Date().toISOString(), error_message: null })
        .eq("city_id", cityId);
      console.log(`${cityId}\t<not found>`);
      continue;
    }
    const insertResult = await upsertCity(cityId, cityName);
    if (insertResult.error && insertResult.error.code === "23505") {
      await upsertCity(cityId, null);
      await supabase
        .from("bandsintown_city_jobs")
        .update({ status: "not_found", updated_at: new Date().toISOString() })
        .eq("city_id", cityId);
      console.log(`${cityId}\t<not found>`);
      continue;
    }
    if (insertResult.error) {
      throw insertResult.error;
    }
    await supabase
      .from("bandsintown_city_jobs")
      .update({ status: "done", updated_at: new Date().toISOString(), error_message: null })
      .eq("city_id", cityId);
    console.log(`${cityId}\t${cityName}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    await upsertCity(cityId, null);
    await supabase
      .from("bandsintown_city_jobs")
      .update({ status: "error", updated_at: new Date().toISOString(), error_message: message })
      .eq("city_id", cityId);
    console.log(`${cityId}\t<not found>`);
  }
}

await browser.close();
