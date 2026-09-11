import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PHOTO_DATA_URL_LENGTH, readBackup, saveRecords } from "../src/storage.js";

test("saveRecords reports quota errors and never deletes old records", () => {
  const original = { "2026-09-09": { answers: [1, 2, 3] } };
  global.localStorage = {
    setItem() {
      const error = new Error("full");
      error.name = "QuotaExceededError";
      throw error;
    },
  };
  const result = saveRecords({ ...original, "2026-09-10": {} });
  assert.equal(result.ok, false);
  assert.match(result.message, /いっぱい/);
  assert.deepEqual(original, { "2026-09-09": { answers: [1, 2, 3] } });
});

test("readBackup accepts a valid v2 backup", async () => {
  const records = { "2026-09-10": { answers: [{}, {}, {}], photo: null } };
  const file = { text: async () => JSON.stringify({ version: 2, records }) };
  assert.deepEqual(await readBackup(file), records);
});

test("readBackup rejects malformed and oversized photo data", async () => {
  const file = { text: async () => JSON.stringify({
    version: 2,
    records: { "2026-09-10": { answers: [{}, {}, {}], photo: "x".repeat(MAX_PHOTO_DATA_URL_LENGTH + 1) } },
  }) };
  await assert.rejects(() => readBackup(file), /読みこめません/);
});
