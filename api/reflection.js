const BLOCKED_PATTERNS = [/必ず|絶対|保証/, /診断|自閉症|発達障害/, /正常|異常|遅れ/, /心配(?:は)?ありません|問題(?:は)?ありません/];

function send(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").json(payload);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "POSTのみ利用できます。" });
  const apiKey = process.env.DIFY_API_KEY;
  const endpoint = process.env.DIFY_API_URL || "https://api.dify.ai/v1/workflows/run";
  if (!apiKey) return send(res, 503, { error: "AIまとめは準備中です。" });
  const answers = Array.isArray(req.body?.answers) ? req.body.answers.slice(0, 3) : [];
  const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 500) : "";
  if (answers.length !== 3 || answers.some((item) => typeof item?.question !== "string" || typeof item?.answer !== "string")) {
    return send(res, 400, { error: "回答形式が正しくありません。" });
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: { answers_json: JSON.stringify(answers), note }, response_mode: "blocking", user: "kizuki-calendar-web" }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`Dify ${response.status}`);
    const outputs = payload?.data?.outputs || {};
    const reflection = String(outputs.reflection || outputs.text || payload.answer || "").trim();
    if (!reflection || reflection.length > 600 || BLOCKED_PATTERNS.some((pattern) => pattern.test(reflection))) {
      return send(res, 422, { error: "安全基準を満たす振り返りを生成できませんでした。" });
    }
    return send(res, 200, { reflection });
  } catch (error) {
    console.error("reflection_error", error instanceof Error ? error.message : "unknown");
    return send(res, 502, { error: "AIまとめを取得できませんでした。" });
  }
}
