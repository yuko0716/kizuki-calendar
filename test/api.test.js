import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/reflection.js";

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader() { return this; },
    json(body) { this.body = body; return this; },
  };
}

const validBody = {
  answers: [1, 2, 3].map((number) => ({ question: `質問${number}`, answer: "はい" })),
  note: "積み木を並べていた",
};

test("API requires its server-side key", { concurrency: false }, async () => {
  const previous = process.env.DIFY_API_KEY;
  delete process.env.DIFY_API_KEY;
  const res = responseRecorder();
  await handler({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 503);
  if (previous) process.env.DIFY_API_KEY = previous;
});

test("API rejects malformed input", { concurrency: false }, async () => {
  process.env.DIFY_API_KEY = "test-key";
  const res = responseRecorder();
  await handler({ method: "POST", body: { answers: [] } }, res);
  assert.equal(res.statusCode, 400);
  delete process.env.DIFY_API_KEY;
});

test("API blocks diagnostic or guaranteed generated text", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  process.env.DIFY_API_KEY = "test-key";
  global.fetch = async () => ({ ok: true, json: async () => ({ data: { outputs: { reflection: "成長は必ず進みます。" } } }) });
  const res = responseRecorder();
  await handler({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 422);
  global.fetch = originalFetch;
  delete process.env.DIFY_API_KEY;
});

test("API returns a neutral Dify reflection", { concurrency: false }, async () => {
  const originalFetch = global.fetch;
  process.env.DIFY_API_KEY = "test-key";
  global.fetch = async () => ({ ok: true, json: async () => ({ data: { outputs: { reflection: "今日は積み木を並べる様子を記録しました。" } } }) });
  const res = responseRecorder();
  await handler({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body.reflection, /積み木/);
  global.fetch = originalFetch;
  delete process.env.DIFY_API_KEY;
});
