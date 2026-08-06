// Smoke check for the Supabase wake-up status function against a deployed site.
// Exits non-zero if the function is unavailable so misconfiguration (e.g. a
// missing/invalid SUPABASE_MANAGEMENT_TOKEN in Netlify) fails loudly instead of
// silently degrading the login experience.
//
// Usage: node scripts/check-wake.mjs [base-url]
//   node scripts/check-wake.mjs https://deploy-preview-34--funtrips.netlify.app

const base = (
  process.argv[2] ||
  process.env.WAKE_CHECK_URL ||
  "https://funtrips.netlify.app"
).replace(/\/$/, "");
const url = `${base}/.netlify/functions/supabase-status`;

let res, body;
try {
  res = await fetch(url, { headers: { Accept: "application/json" } });
  body = await res.json();
} catch (error) {
  console.error(`FAIL: could not reach ${url}\n  ${error.message}`);
  process.exit(1);
}

console.log(`${url} -> [${res.status}] ${JSON.stringify(body)}`);

const healthy = res.ok && (body.status === "active" || body.status === "restoring");
if (!healthy) {
  console.error(
    "FAIL: status function is not healthy (expected active or restoring). " +
      "Check SUPABASE_MANAGEMENT_TOKEN in Netlify env vars.",
  );
  process.exit(1);
}
console.log("OK: Supabase status function is healthy.");
