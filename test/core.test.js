import test from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, SAFE_FEEDBACK, dateKey, fallbackSummary, questionsForDate } from "../src/core.js";

test("dateKey uses the local calendar date", () => {
  assert.equal(dateKey(new Date(2026, 0, 7)), "2026-01-07");
});

test("daily questions are deterministic, unique, and change across years", () => {
  const first = questionsForDate("2026-09-10");
  const again = questionsForDate("2026-09-10");
  const nextYear = questionsForDate("2027-09-10");
  assert.deepEqual(first, again);
  assert.equal(new Set(first.map(({ id }) => id)).size, 3);
  assert.notDeepEqual(first, nextYear);
});

test("user-facing prompts and summaries do not make guarantees or diagnoses", () => {
  const copy = [
    ...QUESTIONS.flatMap(({ text, hint }) => [text, hint]),
    ...Object.values(SAFE_FEEDBACK),
    fallbackSummary([{ type: "yes" }, { type: "yes" }, { type: "kinda" }]),
    fallbackSummary([{ type: "no" }, { type: "no" }, { type: "yes" }]),
  ].join("\n");
  assert.doesNotMatch(copy, /必ず|絶対|保証|診断しました|信頼関係が育|言葉が来/);
});

test("fallback summary reflects answer mix without evaluating development", () => {
  assert.match(fallbackSummary([{ type: "no" }, { type: "no" }, { type: "yes" }]), /見つからなかった/);
  assert.match(fallbackSummary([{ type: "kinda" }, { type: "kinda" }, { type: "yes" }]), /小さな反応/);
});
