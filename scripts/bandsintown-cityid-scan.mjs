import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const startId = 5809839;
const count = 11;
const targetXPath = '//*[@id="main"]/div/div[1]/header/div[3]/div/div';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.");
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const sanitizeName = (name) => {
  if (name === "Seattle, WA") return "<not found>";
  return name;
};

const claimJob = async (cityId) => {
  const now = new Date().toISOString();
  const updateResult = await supabase
    .from("bandsintown_city_jobs")
    .update({ status: "claimed", claimed_at: now, updated_at: now })
    .eq("city_id", cityId)
    .eq("status", "pending")
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

let lastCityName = "";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
});

for (let i = 0; i < count; i += 1) {
  const cityId = startId + i;
  const claimed = await claimJob(cityId);
  if (!claimed) {
    continue;
  }
  const url = `https://www.bandsintown.com/?city_id=${cityId}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`xpath=${targetXPath}`, { timeout: 5000 });
    const name = await page.locator(`xpath=${targetXPath}`).innerText();
    const cityName = sanitizeName(name.trim());
    const normalizedName = cityName.toLowerCase();
    if (normalizedName && normalizedName === lastCityName.toLowerCase()) {
      await supabase.from("bandsintown_cities").upsert(
        { city_id: cityId, city_name: "<not found>", fetched_at: new Date().toISOString() },
        { onConflict: "city_id" },
      );
      await supabase
        .from("bandsintown_city_jobs")
        .update({ status: "not_found", updated_at: new Date().toISOString() })
        .eq("city_id", cityId);
      console.log(`${cityId}\t<not found>`);
      continue;
    }
    lastCityName = cityName;
    await supabase.from("bandsintown_cities").upsert(
      { city_id: cityId, city_name: cityName, fetched_at: new Date().toISOString() },
      { onConflict: "city_id" },
    );
    await supabase
      .from("bandsintown_city_jobs")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("city_id", cityId);
    console.log(`${cityId}\t${cityName}`);
  } catch {
    await supabase.from("bandsintown_cities").upsert(
      { city_id: cityId, city_name: "<not found>", fetched_at: new Date().toISOString() },
      { onConflict: "city_id" },
    );
    await supabase
      .from("bandsintown_city_jobs")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("city_id", cityId);
    console.log(`${cityId}\t<not found>`);
  }
}

await browser.close();
