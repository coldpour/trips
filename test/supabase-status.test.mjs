// oxlint-disable no-floating-promises -- node:test runs top-level test() calls
import { test } from "node:test";
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/supabase-status.js";

const TOKEN = "SUPABASE_MANAGEMENT_TOKEN";

function withFetch(impl) {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return impl(String(url), options);
  };
  return {
    calls,
    restore() {
      global.fetch = original;
    },
  };
}

function mgmt(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test("returns 405 for non-GET requests", async () => {
  const res = await handler({ httpMethod: "POST" });
  assert.equal(res.statusCode, 405);
});

test("returns unavailable, and calls nothing, when the token is missing", async () => {
  const prev = process.env[TOKEN];
  delete process.env[TOKEN];
  const f = withFetch(() => mgmt({}));
  try {
    const res = await handler({ httpMethod: "GET" });
    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).status, "unavailable");
    assert.equal(f.calls.length, 0);
  } finally {
    f.restore();
    if (prev !== undefined) process.env[TOKEN] = prev;
  }
});

test("reports active when the project is ACTIVE_HEALTHY", async () => {
  process.env[TOKEN] = "sbp_test";
  const f = withFetch(() => mgmt({ status: "ACTIVE_HEALTHY" }));
  try {
    const res = await handler({ httpMethod: "GET" });
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "active");
    assert.equal(body.progress, 100);
  } finally {
    f.restore();
  }
});

test("triggers a restore and reports restoring when the project is INACTIVE", async () => {
  process.env[TOKEN] = "sbp_test";
  const f = withFetch((url) =>
    mgmt(url.endsWith("/restore") ? {} : { status: "INACTIVE" }),
  );
  try {
    const res = await handler({ httpMethod: "GET" });
    assert.equal(res.statusCode, 200);
    assert.equal(JSON.parse(res.body).status, "restoring");
    const restore = f.calls.find((c) => c.url.endsWith("/restore"));
    assert.ok(restore, "expected a POST to the restore endpoint");
    assert.equal(restore.options.method, "POST");
  } finally {
    f.restore();
  }
});

test("reports unavailable when the management token is rejected (401)", async () => {
  process.env[TOKEN] = "bad-token";
  const f = withFetch(() =>
    mgmt({ message: "JWT could not be decoded" }, { ok: false, status: 401 }),
  );
  try {
    const res = await handler({ httpMethod: "GET" });
    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).status, "unavailable");
  } finally {
    f.restore();
  }
});
