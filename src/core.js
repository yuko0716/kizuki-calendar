export const QUESTIONS = [
  [1, "🤝", "あなたが部屋に入ったとき、お子さんが気づいて反応しましたか？", "目が向く、声を出すなど、見えた範囲で"],
  [2, "😄", "一緒に笑えた瞬間がありましたか？", "短い瞬間でも大丈夫です"],
  [3, "👆", "何かを指差したり、「見て」と伝えようとしましたか？", "声・視線・身振りも含めます"],
  [4, "🫶", "困ったとき、あなたのそばに来る様子がありましたか？", "目で探す、近づく、声を出すなど"],
  [5, "🎭", "あなたのしぐさや動作を真似する様子がありましたか？", "掃除・食事・電話など、どんな動作でも"],
  [6, "🗣️", "声・言葉・身振りで何か伝えようとしましたか？", "小さな声や動きも含めます"],
  [7, "🙅", "嫌なとき、何らかの形で気持ちを示しましたか？", "首を振る、手を払う、声を出すなど"],
  [8, "📖", "絵本や本を一緒に開いた時間がありましたか？", "めくる、眺めるだけでも"],
  [9, "😊", "声をかけたとき、表情に変化がありましたか？", "見えたままを振り返ります"],
  [10, "🎵", "歌や声かけに、体や表情の反応がありましたか？", "揺れる、止まる、振り向くなど"],
  [11, "🔍", "何かにじっと集中していた瞬間がありましたか？", "対象や長さは問いません"],
  [12, "🔁", "同じ動作や遊びを繰り返していましたか？", "何を、どのように繰り返したかを思い出してみましょう"],
  [13, "📦", "入れる・出す・並べるなど、手を動かしていましたか？", "使っていた素材も思い出してみましょう"],
  [14, "🐛", "小さなものや動くものを観察していましたか？", "虫・葉・水など、対象は何でも"],
  [15, "⏸️", "一人で落ち着いて過ごす時間がありましたか？", "あったか、なかったかだけを記録します"],
  [16, "👁️", "自分から何かに向かって動く場面がありましたか？", "どこへ向かったかを思い出してみましょう"],
  [17, "🤲", "つまむ・はめる・積むなど、指先を使っていましたか？", "小さな動きも含めます"],
  [18, "💧", "素材や感触に自分から触れていましたか？", "水・砂・布・食べ物など"],
  [19, "🎶", "音や声に反応して体や表情が動きましたか？", "見えた反応をそのまま振り返ります"],
  [20, "🏃", "全身を使って動く場面がありましたか？", "走る、登る、転がるなど"],
  [21, "💪", "うまくいかない後、もう一度試す様子がありましたか？", "手を伸ばす、やり方を変えるなど"],
  [22, "👟", "何かを自分でやろうとする場面がありましたか？", "靴・服・食事など、内容は何でも"],
  [23, "🍽️", "食事の時間、印象に残った様子がありましたか？", "食べ方、表情、姿勢など見えたことを"],
  [24, "🌿", "外で興味を向けたものがありましたか？", "向かった方向や触れたものなど"],
  [25, "🧸", "お気に入りのものや遊び方がありましたか？", "繰り返し選んだものなど"],
  [26, "💡", "「こんなことに気づいているんだ」と感じた瞬間がありましたか？", "具体的な場面を思い出してみましょう"],
  [27, "🌱", "小さな変化を感じた場面がありましたか？", "比べられる範囲で大丈夫です"],
  [28, "🔄", "お子さんのペースに合わせられた瞬間がありましたか？", "できたかどうかを責めずに振り返ります"],
  [29, "🌤️", "印象に残っている表情はありましたか？", "うれしい顔に限りません"],
  [30, "🤲", "今日、一緒に過ごして印象に残ったことはありましたか？", "小さな出来事でも大丈夫です"],
].map(([id, emoji, text, hint]) => ({ id, emoji, text, hint }));

export const ANSWER_LABELS = { yes: "はい", kinda: "ちょっとだけ", no: "今日はなかったかな" };

export function answerForQuestion(question, type) {
  if (!question || !Object.hasOwn(ANSWER_LABELS, type)) throw new Error("回答を選んでください。");
  return {
    type,
    label: ANSWER_LABELS[type],
    questionId: question.id,
    emoji: question.emoji,
    question: question.text,
  };
}

export const SAFE_FEEDBACK = {
  yes: "見つけた場面を、今日の記録として残しました。",
  kinda: "小さな変化も、見えた範囲で記録しておきましょう。",
  no: "見られなかったことも記録の一つです。日によって様子は変わります。",
};

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthIndex(date = new Date()) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function monthParts(index) {
  const year = Math.floor(index / 12);
  return { year, month: index - year * 12 };
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function questionsForDate(key) {
  let hash = hashString(key);
  const pool = [...QUESTIONS];
  const selected = [];
  while (selected.length < 3) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    selected.push(pool.splice(hash % pool.length, 1)[0]);
  }
  return selected;
}

export function fallbackSummary(answers) {
  const counts = answers.reduce((result, answer) => {
    result[answer.type] = (result[answer.type] || 0) + 1;
    return result;
  }, {});
  if ((counts.no || 0) >= 2) return "今日は見つからなかった場面もありました。見えたことと見えなかったことを、そのまま今日の記録として残します。";
  if ((counts.kinda || 0) >= 2) return "今日は小さな反応や変化をいくつか記録しました。次に似た場面があったときも、見えたことをそのまま残してみましょう。";
  return "今日はお子さんの様子を3つの視点で振り返りました。回答した内容を、今日見えた場面の記録として残します。";
}

export function recordQuestions(record, key) {
  if (record?.answers?.every((answer) => answer.question)) {
    return record.answers.map((answer) => ({ id: answer.questionId, emoji: answer.emoji || "🌱", text: answer.question }));
  }
  return questionsForDate(key);
}

export function recordsForMonth(records, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return Object.entries(records || {})
    .filter(([key]) => key.startsWith(prefix))
    .sort(([first], [second]) => first.localeCompare(second));
}

export const REPORT_FIELD_LABELS = {
  childName: "お子さんの呼び名",
  birthDate: "生年月日",
  mainConcern: "いちばん相談したいこと",
  concernSince: "気になり始めた時期・変化",
  contexts: "起きる場面・相手・頻度",
  communication: "ことば・理解・やりとり",
  relationships: "遊び・人との関わり",
  bodyBehavior: "身体・感覚・行動",
  dailyLife: "食事・睡眠・排泄・健康",
  strengths: "できていること・好きなこと",
  helps: "試したこと・うまくいった対応",
  history: "健診・受診・相談・支援の履歴",
  parentNeeds: "家庭で困っていること・負担",
  supportWanted: "相談先に希望する支援",
};

export function ageInYearsMonths(birthDate, asOf = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || "") || !(asOf instanceof Date) || Number.isNaN(asOf.getTime())) return "";
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year
    || birth.getMonth() !== month - 1
    || birth.getDate() !== day
    || birth > asOf
  ) return "";

  let months = (asOf.getFullYear() - year) * 12 + asOf.getMonth() - (month - 1);
  if (asOf.getDate() < day) months -= 1;
  return `${Math.floor(months / 12)}歳${months % 12}か月`;
}

export function consultationReportText(records, year, month, details = {}, asOf = new Date()) {
  const entries = recordsForMonth(records, year, month);
  const lines = [
    "きづきカレンダー 相談前整理シート",
    `作成日：${dateKey(asOf)}`,
    `観察期間：${year}年${month + 1}月`,
    `記録日数：${entries.length}日`,
  ];
  lines.push("", "【相談前の整理】");
  for (const [key, label] of Object.entries(REPORT_FIELD_LABELS)) {
    const value = String(details[key] || "").trim();
    if (!value) continue;
    const age = key === "birthDate" ? ageInYearsMonths(value, asOf) : "";
    lines.push(`${label}：${value}${age ? `（作成日時点 ${age}）` : ""}`);
  }
  lines.push(
    "",
    "※保護者が相談前に状況を整理するための資料です。医療・発達・親子関係の診断や評価ではありません。必要な確認や判断は相談先で行ってください。",
    "",
    "【日々の観察記録（付録）】",
    "※日によって質問が異なるため、回答数を発達の指標として比較することはできません。",
  );

  for (const [key, record] of entries) {
    lines.push("", `■ ${key}`);
    const questions = recordQuestions(record, key);
    record.answers?.forEach((answer, index) => {
      const question = questions[index];
      lines.push(`・${question?.text || answer.question || "記録した質問"}`);
      lines.push(`  回答：${answer.label || ANSWER_LABELS[answer.type] || "回答済み"}`);
    });
    if (record.note) lines.push(`メモ：${record.note}`);
  }
  return lines.join("\n");
}
