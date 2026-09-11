import test from "node:test";
import assert from "node:assert/strict";
import { ANSWER_LABELS } from "../src/core.js";
import { consultationReportText, recordMemoItems, recordObservation, recordSearchText } from "../src/report.js";

test("legacy note remains readable as today's observation", () => {
  const record = { note: "積み木を三つ並べた" };
  assert.equal(recordObservation(record), "積み木を三つ並べた");
  assert.deepEqual(recordMemoItems(record), [
    { key: "observation", label: "今日あったこと", value: "積み木を三つ並べた" },
  ]);
});

test("observation interpretation and concern stay separate", () => {
  const record = {
    observation: "帰る声をかけると地面に座って泣いた",
    interpretation: "まだ遊びたかったのかなと思った",
    concern: "切り替えるときに毎回泣くのが気になる",
  };
  const items = recordMemoItems(record);
  assert.deepEqual(items.map(({ label }) => label), ["今日あったこと", "こうかなと思ったこと", "気になったこと"]);
  assert.match(recordSearchText(record), /地面に座って泣いた/);
  assert.match(recordSearchText(record), /まだ遊びたかった/);
  assert.match(recordSearchText(record), /毎回泣く/);
});

test("consultation report labels questions answers and the three memo types", () => {
  const records = {
    "2026-09-11": {
      answers: [{ type: "yes", label: ANSWER_LABELS.yes, question: "一緒に見たものはありましたか？" }],
      observation: "犬を見て指をさした",
      interpretation: "犬を知らせたかったのかなと思った",
      concern: "ことばが少ないことが気になる",
    },
  };
  const report = consultationReportText(records, 2026, 8, {}, new Date(2026, 8, 11), ["2026-09-11"]);
  assert.match(report, /質問：一緒に見たものはありましたか？/);
  assert.match(report, /こたえ：見つけた/);
  assert.match(report, /今日あったこと：犬を見て指をさした/);
  assert.match(report, /こうかなと思ったこと：犬を知らせたかったのかなと思った/);
  assert.match(report, /気になったこと：ことばが少ないことが気になる/);
});
