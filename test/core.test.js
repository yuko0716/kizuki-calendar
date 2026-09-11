import test from "node:test";
import assert from "node:assert/strict";
import { ANSWER_LABELS, QUESTIONS, SAFE_FEEDBACK, ageInYearsMonths, answerForQuestion, consultationReportText, dateKey, fallbackSummary, monthIndex, monthParts, questionsForDate, recordsForMonth } from "../src/core.js";

test("dateKey uses the local calendar date", () => {
  assert.equal(dateKey(new Date(2026, 0, 7)), "2026-01-07");
});

test("every selected answer keeps its own type and label", () => {
  const question = QUESTIONS[0];
  for (const [type, label] of Object.entries(ANSWER_LABELS)) {
    assert.deepEqual(answerForQuestion(question, type), {
      type,
      label,
      questionId: question.id,
      emoji: question.emoji,
      question: question.text,
    });
  }
});

test("previous month navigation crosses the year boundary", () => {
  const january = monthIndex(new Date(2026, 0, 1));
  assert.deepEqual(monthParts(january - 1), { year: 2025, month: 11 });
});

test("consultation report contains only the selected month in date order", () => {
  const makeRecord = (answer, note = "") => ({ answers: [{ type: answer, label: ANSWER_LABELS[answer], question: "見えたことはありましたか？" }], note });
  const records = {
    "2026-09-12": makeRecord("no"),
    "2026-08-31": makeRecord("yes"),
    "2026-09-02": makeRecord("kinda", "積み木を並べた"),
  };
  assert.deepEqual(recordsForMonth(records, 2026, 8).map(([key]) => key), ["2026-09-02", "2026-09-12"]);
  const report = consultationReportText(records, 2026, 8, {
    childName: "はな",
    birthDate: "2025-01-15",
    mainConcern: "言葉について",
    contexts: "家で毎日",
    strengths: "積み木が好き",
    supportWanted: "家庭での関わり方を相談したい",
  }, new Date(2026, 8, 11));
  assert.match(report, /相談前整理シート/);
  assert.match(report, /お子さんの呼び名：はな/);
  assert.match(report, /生年月日：2025-01-15（作成日時点 1歳7か月）/);
  assert.match(report, /いちばん相談したいこと：言葉について/);
  assert.match(report, /起きる場面・相手・頻度：家で毎日/);
  assert.match(report, /できていること・好きなこと：積み木が好き/);
  assert.match(report, /相談先に希望する支援：家庭での関わり方を相談したい/);
  assert.match(report, /日々の観察記録（付録）/);
  assert.match(report, /積み木を並べた/);
  assert.ok(report.indexOf("2026-09-02") < report.indexOf("2026-09-12"));
  assert.doesNotMatch(report, /2026-08-31/);
});

test("age is calculated in completed years and months", () => {
  assert.equal(ageInYearsMonths("2025-01-15", new Date(2026, 0, 14)), "0歳11か月");
  assert.equal(ageInYearsMonths("2025-01-15", new Date(2026, 0, 15)), "1歳0か月");
  assert.equal(ageInYearsMonths("2027-01-01", new Date(2026, 0, 15)), "");
  assert.equal(ageInYearsMonths("2026-02-30", new Date(2026, 8, 11)), "");
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
