import os from "node:os";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const MAX_CITY_ID = 99999999;
const MIN_WORKERS = 4;
const MAX_WORKERS = 1024;
const TARGET_CPU = 0.8;
const CPU_MARGIN = 0.05;
const SCALE_INTERVAL_MS = 10000;
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

const parseWorkers = () => {
  const arg = process.argv.find((value) => value.startsWith("--workers"));
  if (!arg) {
    return MIN_WORKERS;
  }
  const [, raw] = arg.split("=");
  const workerValue = raw || process.argv[process.argv.indexOf(arg) + 1];
  const workerCount = Number(workerValue);
  if (!Number.isFinite(workerCount) || workerCount < 1) {
    throw new Error(`Invalid --workers value: ${workerValue}`);
  }
  return Math.floor(workerCount);
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
    .order("updated_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => Number(row.city_id)).filter(Number.isFinite);
};

const initialWorkerCount = Math.max(MIN_WORKERS, Math.min(MAX_WORKERS, parseWorkers()));
const maxJobId = await getMaxJobId();
const baseStart = Math.min((maxJobId ?? 0) + 1, MAX_CITY_ID);
const hasUnexplored = baseStart <= MAX_CITY_ID;
let nextCityId = baseStart;

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
const workers = [];
const workerPromises = new Set();
let workerIdCounter = 0;
console.log(`Workers: initial ${initialWorkerCount}`);

const createPage = () =>
  browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

const getNextCityId = () => {
  if (!hasUnexplored || nextCityId > MAX_CITY_ID) {
    return null;
  }
  const cityId = nextCityId;
  nextCityId += 1;
  return cityId;
};

const getNextErrorId = async () => {
  const errorIds = await getErrorIds(1);
  return errorIds[0] ?? null;
};

const processCity = async (page, cityId, allowError) => {
  const claimed = await claimJob(cityId, allowError);
  if (!claimed) {
    return;
  }
  const url = `https://www.bandsintown.com/?city_id=${cityId}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`xpath=${targetXPath}`, { timeout: 5000 });
    const name = await page.locator(`xpath=${targetXPath}`).innerText();
    const cityName = name.trim();
    if (!cityName) {
      await upsertCity(cityId, null);
      await supabase
        .from("bandsintown_city_jobs")
        .update({
          status: "not_found",
          updated_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("city_id", cityId);
      console.log(`${cityId}\t<not found>`);
      return;
    }
    const insertResult = await upsertCity(cityId, cityName);
    if (insertResult.error && insertResult.error.code === "23505") {
      await upsertCity(cityId, null);
      await supabase
        .from("bandsintown_city_jobs")
        .update({
          status: "not_found",
          updated_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("city_id", cityId);
      console.log(`${cityId}\t<not found>`);
      return;
    }
    if (insertResult.error) {
      throw insertResult.error;
    }
    await supabase
      .from("bandsintown_city_jobs")
      .update({
        status: "done",
        updated_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("city_id", cityId);
    console.log(`${cityId}\t${cityName}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    await upsertCity(cityId, null);
    await supabase
      .from("bandsintown_city_jobs")
      .update({
        status: "error",
        updated_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("city_id", cityId);
    console.log(`${cityId}\t<not found>`);
  }
};

const runWorker = async (worker) => {
  try {
    while (true) {
      if (worker.shouldStop) {
        break;
      }
      const cityId = getNextCityId();
      if (cityId !== null) {
        await processCity(worker.page, cityId, false);
        continue;
      }
      const errorId = await getNextErrorId();
      if (!errorId) {
        break;
      }
      await processCity(worker.page, errorId, true);
    }
  } finally {
    await worker.page.close();
  }
};

const startWorker = async () => {
  const page = await createPage();
  const worker = {
    id: workerIdCounter++,
    page,
    shouldStop: false,
  };
  const promise = runWorker(worker).finally(() => {
    workerPromises.delete(promise);
    const index = workers.findIndex((item) => item.id === worker.id);
    if (index >= 0) {
      workers.splice(index, 1);
    }
  });
  workerPromises.add(promise);
  workers.push(worker);
};

const scaleWorkersTo = async (targetCount) => {
  const currentCount = workers.length;
  if (targetCount === currentCount) return;
  if (targetCount > currentCount) {
    const toAdd = targetCount - currentCount;
    for (let i = 0; i < toAdd; i += 1) {
      await startWorker();
    }
    console.log(`Workers: scaled to ${workers.length}`);
    return;
  }
  const toStop = currentCount - targetCount;
  for (let i = 0; i < toStop; i += 1) {
    const worker = workers[workers.length - 1 - i];
    if (worker) {
      worker.shouldStop = true;
    }
  }
  console.log(`Workers: scaled to ${Math.max(targetCount, 0)}`);
};

await scaleWorkersTo(initialWorkerCount);

const scalingInterval = setInterval(async () => {
  if (workers.length === 0) {
    clearInterval(scalingInterval);
    return;
  }
  const cpuCount = os.cpus()?.length ?? 1;
  const load = os.loadavg()[0] ?? 0;
  const cpuUtil = Math.min(1, load / cpuCount);
  let targetCount = workers.length;
  if (cpuUtil < TARGET_CPU - CPU_MARGIN) {
    const increaseBy = Math.max(1, Math.ceil(workers.length * 0.2));
    targetCount = Math.min(MAX_WORKERS, workers.length + increaseBy);
  } else if (cpuUtil > TARGET_CPU + CPU_MARGIN) {
    const decreaseBy = Math.max(1, Math.ceil(workers.length * 0.1));
    targetCount = Math.max(MIN_WORKERS, workers.length - decreaseBy);
  }
  if (targetCount !== workers.length) {
    await scaleWorkersTo(targetCount);
  }
}, SCALE_INTERVAL_MS);

const waitForWorkers = async () => {
  while (workerPromises.size > 0) {
    await Promise.race([...workerPromises]);
  }
};

await waitForWorkers();

clearInterval(scalingInterval);
await browser.close();
