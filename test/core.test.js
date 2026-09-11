import test from "node:test";
import assert from "node:assert/strict";
import { ANSWER_LABELS, QUESTION_DAYS, QUESTIONS, SAFE_FEEDBACK, ageInYearsMonths, answerForQuestion, consultationReportText, dateKey, fallbackSummary, monthIndex, monthParts, questionsForDate, recordsForMonth, selectedRecordsForReport } from "../src/core.js";

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
      domain: question.domain,
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

test("consultation report includes only explicitly selected record dates", () => {
  const records = {
    "2026-09-01": { answers: [{ type: "yes", label: ANSWER_LABELS.yes, question: "1日の質問" }] },
    "2026-09-02": { answers: [{ type: "no", label: ANSWER_LABELS.no, question: "2日の質問" }] },
    "2026-09-03": { answers: [{ type: "kinda", label: ANSWER_LABELS.kinda, question: "3日の質問" }] },
  };
  assert.deepEqual(selectedRecordsForReport(records, 2026, 8, ["2026-09-03", "2026-09-01"]).map(([key]) => key), ["2026-09-01", "2026-09-03"]);
  const report = consultationReportText(records, 2026, 8, {}, new Date(2026, 8, 11), ["2026-09-03", "2026-09-01"]);
  assert.match(report, /記録日数：2日/);
  assert.match(report, /2026-09-01/);
  assert.match(report, /2026-09-03/);
  assert.doesNotMatch(report, /2026-09-02/);
});

test("question bank contains 30 days and 90 unique prompts", () => {
  assert.equal(QUESTION_DAYS.length, 30);
  assert.equal(QUESTIONS.length, 90);
  assert.equal(new Set(QUESTIONS.map(({ id }) => id)).size, 90);
});

test("every day contains exactly one question from each observation domain", () => {
  const expected = ["context", "interaction", "play"];
  for (const day of QUESTION_DAYS) {
    assert.equal(day.length, 3);
    assert.deepEqual(day.map(({ domain }) => domain).sort(), expected);
  }
});

test("daily questions are deterministic and advance through the 30-day cycle", () => {
  const day1 = questionsForDate("2026-09-11");
  const again = questionsForDate("2026-09-11");
  const day2 = questionsForDate("2026-09-12");
  const day31 = questionsForDate("2026-10-11");
  assert.deepEqual(day1, again);
  assert.notDeepEqual(day1, day2);
  assert.deepEqual(day1, day31);
  assert.deepEqual(day1.map(({ domain }) => domain), ["interaction", "play", "context"]);
});

test("answer labels describe observation rather than success or failure", () => {
  assert.deepEqual(ANSWER_LABELS, {
    yes: "見つけた",
    kinda: "少し気づいた",
    no: "今日は分からなかった",
  });
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
  assert.match(fallbackSummary([{ type: "no" }, { type: "no" }, { type: "yes" }]), /分からなかった/);
  assert.match(fallbackSummary([{ type: "kinda" }, { type: "kinda" }, { type: "yes" }]), /少し気づいた/);
});
