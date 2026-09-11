export async function requestReflection(answers, note) {
  const response = await fetch("/api/reflection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: answers.map(({ question, label }) => ({ question, answer: label })), note: note.trim().slice(0, 500) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.reflection) throw new Error(payload.error || "AIでまとめられませんでした。");
  return payload.reflection;
}
