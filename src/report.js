import {
  ANSWER_LABELS,
  REPORT_FIELD_LABELS,
  ageInYearsMonths,
  dateKey,
  recordQuestions,
  selectedRecordsForReport,
} from "./core.js";

export function recordObservation(record) {
  return String(record?.observation || record?.note || "").trim();
}

export function recordMemoItems(record) {
  const items = [];
  const observation = recordObservation(record);
  const interpretation = String(record?.interpretation || "").trim();
  const concern = String(record?.concern || "").trim();
  if (observation) items.push({ key: "observation", label: "今日あったこと", value: observation });
  if (interpretation) items.push({ key: "interpretation", label: "こうかなと思ったこと", value: interpretation });
  if (concern) items.push({ key: "concern", label: "気になったこと", value: concern });
  return items;
}

export function recordSearchText(record) {
  return recordMemoItems(record).map(({ value }) => value).join("\n");
}

export function consultationReportText(records, year, month, details = {}, asOf = new Date(), selectedKeys = null) {
  const entries = selectedRecordsForReport(records, year, month, selectedKeys);
  const lines = [
    "きづきカレンダー 相談に持っていくメモ",
    `作った日：${dateKey(asOf)}`,
    `記録した月：${year}年${month + 1}月`,
    `えらんだ記録：${entries.length}日分`,
  ];

  lines.push("", "【相談で伝えたいこと】");
  for (const [key, label] of Object.entries(REPORT_FIELD_LABELS)) {
    const value = String(details[key] || "").trim();
    if (!value) continue;
    const age = key === "birthDate" ? ageInYearsMonths(value, asOf) : "";
    lines.push(`${label}：${value}${age ? `（今 ${age}）` : ""}`);
  }

  lines.push(
    "",
    "※これは、おうちで見たことを相談先へ伝えるためのメモです。『できる・できない』を決める紙ではありません。気になることは、相談先でいっしょにたしかめてください。",
    "",
    "【えらんだ日の記録】",
    "※毎日3つの質問で記録しています。こたえの数で、お子さんの育ちを決めるものではありません。",
  );

  for (const [key, record] of entries) {
    lines.push("", `■ ${key}`);
    const questions = recordQuestions(record, key);
    record.answers?.forEach((answer, index) => {
      const question = questions[index];
      lines.push(`質問：${question?.text || answer.question || "その日の質問"}`);
      lines.push(`こたえ：${answer.label || ANSWER_LABELS[answer.type] || "こたえた"}`);
    });
    for (const item of recordMemoItems(record)) lines.push(`${item.label}：${item.value}`);
  }

  return lines.join("\n");
}
