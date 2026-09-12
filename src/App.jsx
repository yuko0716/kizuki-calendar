import { useEffect, useRef, useState } from "react";

const QUESTIONS = [
  { id: 1, group: "やりとり・ことば", emoji: "🤝", text: "あなたが部屋に入ったとき、お子さんが気づいて反応しましたか？", hint: "目を向ける、声を出す、近づくなど、見えたことだけで大丈夫です。" },
  { id: 2, group: "やりとり・ことば", emoji: "😄", text: "一緒に笑ったり、表情をやりとりする場面がありましたか？", hint: "どんな場面だったか思い出してみてください。" },
  { id: 3, group: "やりとり・ことば", emoji: "👆", text: "何かを指差したり、あなたに「見て」と伝えようとしましたか？", hint: "指差しだけでなく、視線・声・身振りも含めて見てみます。" },
  { id: 4, group: "やりとり・ことば", emoji: "🫶", text: "困ったとき、あなたの方を見る・近づく・声を出す場面がありましたか？", hint: "どんな助けの求め方だったか、そのまま残せます。" },
  { id: 5, group: "やりとり・ことば", emoji: "🎭", text: "あなたや周りの人のしぐさ・動作を真似しましたか？", hint: "家事、食事、手遊びなど、どんな真似でも。" },
  { id: 6, group: "やりとり・ことば", emoji: "🗣️", text: "声・言葉・身振りで、何かを伝えようとした場面がありましたか？", hint: "言葉になっていなくても、実際に見えた伝え方を残します。" },
  { id: 7, group: "やりとり・ことば", emoji: "🙅", text: "嫌なときや違うとき、何らかの形で伝えましたか？", hint: "首を振る、手を払う、声を出す、離れるなど。" },
  { id: 8, group: "やりとり・ことば", emoji: "📖", text: "絵本や本を一緒に見たとき、どんな反応がありましたか？", hint: "めくる、指す、声を出す、離れるなど、どれでも記録です。" },
  { id: 9, group: "やりとり・ことば", emoji: "😊", text: "あなたが声をかけたとき、表情・視線・動きに変化がありましたか？", hint: "反応の有無だけでなく、どんな変化だったかを見ます。" },
  { id: 10, group: "やりとり・ことば", emoji: "🎵", text: "歌や声かけ、身近な音に何か反応しましたか？", hint: "振り向く、止まる、動く、声を出すなど。" },

  { id: 11, group: "遊び・動き", emoji: "🔍", text: "何かにじっと集中していた瞬間がありましたか？", hint: "対象と、どのくらい続いたかを覚えていれば残せます。" },
  { id: 12, group: "遊び・動き", emoji: "🔁", text: "同じ動作や遊びを繰り返していましたか？", hint: "何を、どんなふうに繰り返していたかを見ます。" },
  { id: 13, group: "遊び・動き", emoji: "📦", text: "入れる・出す・並べる・積むなど、手を使った遊びがありましたか？", hint: "遊び方をそのまま記録すれば十分です。" },
  { id: 14, group: "遊び・動き", emoji: "🐛", text: "小さなものや動くものをじっと見ていましたか？", hint: "虫、葉、水、車など、何を見ていたかを残します。" },
  { id: 15, group: "遊び・動き", emoji: "⏸️", text: "一人で遊んだり、一人で落ち着いて過ごす時間がありましたか？", hint: "一人だった時間があったかどうかだけでも記録になります。" },
  { id: 16, group: "遊び・動き", emoji: "👁️", text: "自分から何かに向かって動く場面がありましたか？", hint: "何に向かったのか、何をしたのかを見ます。" },
  { id: 17, group: "遊び・動き", emoji: "🤲", text: "つまむ・はめる・積むなど、指先を使う場面がありましたか？", hint: "できた・できないではなく、どんな動きをしていたかを残します。" },
  { id: 18, group: "遊び・動き", emoji: "💧", text: "水・砂・布・食べ物などの感触に、自分から触れる場面がありましたか？", hint: "触れた、避けた、何度も触ったなど、そのまま記録します。" },
  { id: 19, group: "遊び・動き", emoji: "🎶", text: "音や声に反応して、体や表情が動く場面がありましたか？", hint: "揺れる、止まる、振り向くなど、見えた反応を残します。" },
  { id: 20, group: "遊び・動き", emoji: "🏃", text: "歩く・走る・よじ登る・しゃがむなど、全身を使う場面がありましたか？", hint: "どんな動きをしていたかをそのまま残します。" },

  { id: 21, group: "生活・いつもとの違い", emoji: "💪", text: "うまくいかなかったあと、もう一度やってみる場面がありましたか？", hint: "やめた、やり直した、助けを求めたなども記録です。" },
  { id: 22, group: "生活・いつもとの違い", emoji: "👟", text: "食事・着替え・靴などを、自分でやろうとする場面がありましたか？", hint: "どこまで自分でやろうとしたかを見ます。" },
  { id: 23, group: "生活・いつもとの違い", emoji: "🍽️", text: "食事の時間で、いつもと違う様子や印象に残ったことがありましたか？", hint: "食べ方、座り方、要求、拒否など、具体的な場面を残します。" },
  { id: 24, group: "生活・いつもとの違い", emoji: "🌿", text: "外で、行きたい場所や触りたいものを自分で選ぶ場面がありましたか？", hint: "どこへ行き、何に興味を示したかを残します。" },
  { id: 25, group: "生活・いつもとの違い", emoji: "🧸", text: "今日は特に気に入っていた物や遊びがありましたか？", hint: "何を、どんなふうに楽しんでいたかを見ます。" },
  { id: 26, group: "生活・いつもとの違い", emoji: "💡", text: "「こんなことがわかるんだ」と感じた具体的な場面がありましたか？", hint: "そう感じた出来事を、できればそのままの言葉で残します。" },
  { id: 27, group: "生活・いつもとの違い", emoji: "🌱", text: "昨日までと少し違う、新しく見えた姿がありましたか？", hint: "小さな違いで大丈夫。なければ「なかった」も記録です。" },
  { id: 28, group: "生活・いつもとの違い", emoji: "🔄", text: "予定変更や遊びの切り替えのとき、どんな様子でしたか？", hint: "すぐ切り替えた、時間がかかった、別の方法で納得したなど。" },
  { id: 29, group: "生活・いつもとの違い", emoji: "🌤️", text: "今日、特に印象に残った表情や気持ちの動きはありましたか？", hint: "笑った、怒った、驚いた、ほっとしたなど、場面と一緒に残します。" },
  { id: 30, group: "生活・いつもとの違い", emoji: "📝", text: "今日、あとで誰かに伝えておきたいと思った出来事がありましたか？", hint: "相談したいことでも、うれしかったことでも大丈夫です。" },
];

const GROUPS = [
  QUESTIONS.filter((q) => q.group === "やりとり・ことば"),
  QUESTIONS.filter((q) => q.group === "遊び・動き"),
  QUESTIONS.filter((q) => q.group === "生活・いつもとの違い"),
];

const RESPONSE = {
  yes: "今日はこの様子が見られたんですね。いつ・どこで・何をしていたときかも残せると、あとで振り返りやすくなります。",
  kinda: "少しだけ見られたんですね。はっきりしなくても、そのまま残して大丈夫です。",
  no: "今日は見られなかった、という記録も大切です。日によって違うこともあります。",
};

const LABELS = { yes: "あった", kinda: "ちょっとだけ", no: "今日はなかった" };

function dkey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function tkey() { return dkey(new Date()); }
function dateLabel(key) {
  const [y, m, d] = key.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
function getQs(key) {
  const n = Number(key.replace(/-/g, ""));
  return GROUPS.map((group, i) => group[(n + i * 3) % group.length]);
}
function load() {
  try { return JSON.parse(localStorage.getItem("kizuki") || "{}"); } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem("kizuki", JSON.stringify(data)); }
  catch {
    const copy = { ...data };
    Object.keys(copy).sort().forEach((k, i) => {
      if (i % 2 === 0 && copy[k]?.photo) { copy[k] = { ...copy[k] }; delete copy[k].photo; }
    });
    try { localStorage.setItem("kizuki", JSON.stringify(copy)); } catch { /* 保存できない場合は終了 */ }
  }
}
function compress(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const timer = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error("timeout")); }, 10000);
    img.onerror = () => { clearTimeout(timer); URL.revokeObjectURL(url); reject(new Error("load failed")); };
    img.onload = () => {
      clearTimeout(timer);
      const scale = Math.min(1, 900 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = url;
  });
}
function makeDailySummary(notes) {
  const parts = [];
  if (notes.observation?.trim()) parts.push("今日あったことを記録しました。");
  if (notes.concern?.trim()) parts.push("気になったことも、相談のためのメモとして残しました。");
  if (!parts.length) parts.push("今日の3つの問いへの答えを記録しました。");
  return `${parts.join("")} 毎日同じように見える必要はありません。気づいた日の記録が、あとで経過を振り返る材料になります。`;
}

const BTN = { padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 15, fontWeight: 600, width: "100%", display: "block", marginTop: 10 };
const BTN_DARK = { ...BTN, background: "#7a4a58", color: "white" };
const BTN_SOFT = { ...BTN, background: "#fdf0f2", color: "#80636d", border: "1.5px solid #e8c0c8" };
const BTN_GHOST = { ...BTN, background: "transparent", color: "#a89098", fontSize: 13 };
const BTN_YES = { ...BTN, background: "#c4788a", color: "white", marginTop: 0 };
const BTN_KINDA = { ...BTN, background: "#fdf0f2", color: "#80636d", border: "1.5px solid #e8c0c8" };
const BTN_NO = { ...BTN, background: "#f5f2f3", color: "#80636d" };
const NAV_BTN = { width: 32, height: 32, borderRadius: "50%", border: "1px solid #eadde1", background: "#fff", color: "#80636d", fontSize: 24, lineHeight: 1, cursor: "pointer" };
const CARD = { background: "white", borderRadius: 24, padding: "34px 28px", maxWidth: 430, width: "100%", boxShadow: "0 4px 32px rgba(150,80,100,0.08)", position: "relative", zIndex: 1 };
const INFO_BOX = { background: "linear-gradient(135deg,#fdf0f4,#f8f0f5)", borderRadius: 18, padding: 20, fontSize: 14, color: "#4a3038", lineHeight: 1.85, marginBottom: 20 };

function Modal({ onClose, children, style }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 24, padding: "28px 24px", maxWidth: 440, width: "100%", boxShadow: "0 8px 48px rgba(150,80,100,0.15)", maxHeight: "88vh", overflowY: "auto", ...style }}>{children}</div>
  </div>;
}
function MHead({ title, onClose, left }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 20 }}>
    <div style={{ minWidth: 32 }}>{left}</div>
    <span style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, color: "#3a2830", textAlign: "center" }}>{title}</span>
    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "#b8a0a8", cursor: "pointer", padding: "4px 8px" }}>✕</button>
  </div>;
}
function DisclaimerModal({ onAgree }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "32px 28px 40px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>🌱</div>
      <p style={{ fontSize: 11, color: "#b8a0a8", textAlign: "center", marginBottom: 4 }}>1歳半健診などで「様子を見ましょう」と<br />言われたあとに</p>
      <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, fontWeight: 600, color: "#3a2830", textAlign: "center", marginBottom: 24 }}>きづきカレンダー</h2>
      <div style={{ fontSize: 14, color: "#4a3038", lineHeight: 1.9, marginBottom: 20 }}>
        <p style={{ marginBottom: 14 }}>このアプリは、次の相談までの日々に「何を見ればいいの？」と迷わないための観察記録ツールです。</p>
        <p style={{ marginBottom: 14 }}>発達の正常・異常、年齢相当、診断、医療・療育の必要性を判定するものではありません。気になることがある場合は、健診担当者、自治体の相談窓口、医療機関などへご相談ください。</p>
        <p style={{ marginBottom: 14 }}>記録はこの端末のブラウザ内に保存されます。端末変更、ブラウザデータ削除などで消えることがあります。</p>
        <p>「見られなかった」「よく分からなかった」も大切な記録です。できた・できないの採点として使わないでください。</p>
      </div>
      <button onClick={onAgree} style={BTN_DARK}>同意してはじめる</button>
    </div>
  </div>;
}
function NoteFields({ value, onChange, compact = false }) {
  const items = [
    ["observation", "今日あったこと", "例：冷蔵庫まで私の手を引いて、ドアを見ながら「あ」と声を出した"],
    ["interpretation", "こうかなと思ったこと", "例：ジュースが欲しいと伝えていたのかもしれない"],
    ["concern", "気になったこと・相談したいこと", "例：ことばが増えているのか相談したい"],
  ];
  return <div>
    {!compact && <div style={{ background: "#f8f5f6", borderRadius: 14, padding: 14, fontSize: 12, color: "#80636d", lineHeight: 1.7, marginBottom: 18 }}>文字入力でも、スマホのキーボードにある 🎙 マイクから話して入力してもOKです。</div>}
    {items.map(([key, label, placeholder]) => <label key={key} style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#5f414c", marginBottom: 6 }}>{label}</span>
      <textarea value={value[key] || ""} onChange={(e) => onChange({ ...value, [key]: e.target.value })} placeholder={placeholder} rows={compact ? 2 : 3} style={{ width: "100%", resize: "vertical", border: "1.5px solid #eadde1", borderRadius: 12, padding: "12px 13px", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 14, lineHeight: 1.6, color: "#3a2830", outline: "none", background: "#fffdfd" }} />
    </label>)}
  </div>;
}
function DayModal({ dk, rec, records, setRecords, onClose }) {
  const qs = getQs(dk), ans = rec.answers || [];
  const [photo, setPhoto] = useState(rec.photo || null);
  const [notes, setNotes] = useState({ observation: rec.observation || "", interpretation: rec.interpretation || "", concern: rec.concern || "" });
  const [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return; setBusy(true);
    try { const img = await compress(file); setPhoto(img); const next = { ...records, [dk]: { ...records[dk], photo: img } }; setRecords(next); save(next); } finally { setBusy(false); }
  }
  function removePhoto() { const copy = { ...records[dk] }; delete copy.photo; const next = { ...records, [dk]: copy }; setPhoto(null); setRecords(next); save(next); }
  function saveNotes() { const next = { ...records, [dk]: { ...records[dk], ...notes } }; setRecords(next); save(next); setSaved(true); setTimeout(() => setSaved(false), 1500); }
  return <Modal onClose={onClose}>
    <MHead title={`${dateLabel(dk)}の記録`} onClose={onClose} />
    {photo ? <div style={{ position: "relative", marginBottom: 16 }}><img src={photo} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "cover", maxHeight: 220 }} /><button onClick={removePhoto} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 30, height: 30 }}>✕</button></div> :
      <label style={{ display: "block", border: "2px dashed #e8c0c8", borderRadius: 14, padding: 18, textAlign: "center", color: "#9b6b7a", fontSize: 13, background: "#fdf0f2", cursor: "pointer", marginBottom: 18 }}>{busy ? "読み込み中…" : "📷 今日の一枚を追加"}<input type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} /></label>}
    <div style={{ marginBottom: 20 }}>{qs.map((q, i) => <div key={q.id} style={{ borderLeft: "3px solid #e8c0c8", paddingLeft: 12, marginBottom: 12 }}><div style={{ fontSize: 12, color: "#9b6b7a", marginBottom: 3 }}>{q.group}</div><div style={{ fontSize: 13, color: "#3a2830", marginBottom: 4 }}>{q.emoji} {q.text}</div><div style={{ fontSize: 12, color: "#80636d" }}>→ {ans[i] ? LABELS[ans[i].type] : "未回答"}</div></div>)}</div>
    <NoteFields value={notes} onChange={setNotes} compact />
    <button style={BTN_DARK} onClick={saveNotes}>{saved ? "保存しました ✓" : "この日のメモを保存"}</button>
  </Modal>;
}
function reportText(selected, records) {
  const keys = [...selected].sort(); if (!keys.length) return "";
  const lines = ["きづきカレンダー　相談用メモ", `対象期間：${dateLabel(keys[0])} ～ ${dateLabel(keys[keys.length - 1])}`, `記録日数：${keys.length}日`, "", "※このメモは家庭での観察記録です。発達の判定・診断結果ではありません。", "", "【気になったこと・相談したいこと】"];
  const concerns = keys.flatMap((k) => records[k]?.concern?.trim() ? [`${dateLabel(k)}：${records[k].concern.trim()}`] : []); lines.push(...(concerns.length ? concerns : ["記録なし"]));
  lines.push("", "【家庭で観察した具体的な出来事】");
  keys.forEach((k) => { const rec = records[k] || {}; lines.push(`${dateLabel(k)}：${rec.observation?.trim() || "自由記録なし"}`); const qs = getQs(k); (rec.answers || []).forEach((a, i) => { if (qs[i]) lines.push(`  ・${qs[i].text} → ${LABELS[a.type] || a.text || ""}`); }); });
  lines.push("", "【保護者の受け止め・考え】");
  const interpretations = keys.flatMap((k) => records[k]?.interpretation?.trim() ? [`${dateLabel(k)}：${records[k].interpretation.trim()}`] : []); lines.push(...(interpretations.length ? interpretations : ["記録なし"]));
  return lines.join("\n");
}
function ConsultationReport({ selected, records, onClose }) {
  const text = reportText(selected, records); const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); } catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); document.body.removeChild(area); } setCopied(true); setTimeout(() => setCopied(false), 1600); }
  function printReport() { const w = window.open("", "_blank"); if (!w) return; const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); w.document.write(`<html><head><meta charset="utf-8"><title>きづきカレンダー 相談用メモ</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;padding:32px;line-height:1.7;color:#222}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head><body><pre>${escaped}</pre></body></html>`); w.document.close(); w.focus(); w.print(); }
  return <Modal onClose={onClose}><MHead title="相談に持っていくメモ" onClose={onClose} /><div style={{ background: "#f8f5f6", borderRadius: 14, padding: 14, fontSize: 12, color: "#80636d", lineHeight: 1.7, marginBottom: 16 }}>選んだ日の記録を、観察事実と保護者の考えを分けて並べています。AIによる発達判定はしていません。</div><pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 13, lineHeight: 1.7, color: "#3a2830", background: "#fffdfd", border: "1px solid #eee2e5", borderRadius: 12, padding: 14, maxHeight: "46vh", overflowY: "auto" }}>{text}</pre><button style={BTN_DARK} onClick={copy}>{copied ? "コピーしました ✓" : "メモをコピー"}</button><button style={BTN_SOFT} onClick={printReport}>印刷・PDF保存</button><p style={{ fontSize: 11, color: "#a89098", lineHeight: 1.6, marginTop: 12 }}>次段階では、この複数日の記録をAIが「よく見られた様子・場面の違い・前との変化」に整理する機能を追加します。</p></Modal>;
}
function CalModal({ records, setRecords, onClose, startSelection = false }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dayView, setDayView] = useState(null), [selectionMode, setSelectionMode] = useState(startSelection), [selected, setSelected] = useState([]), [showReport, setShowReport] = useState(false);
  const yr = viewDate.getFullYear(), mo = viewDate.getMonth(), firstDay = new Date(yr, mo, 1).getDay(), lastDay = new Date(yr, mo + 1, 0).getDate(), prefix = `${yr}-${String(mo + 1).padStart(2, "0")}`;
  if (dayView) return <DayModal dk={dayView} rec={records[dayView]} records={records} setRecords={setRecords} onClose={() => setDayView(null)} />;
  if (showReport) return <ConsultationReport selected={selected} records={records} onClose={() => setShowReport(false)} />;
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: lastDay }, (_, i) => i + 1));
  function toggle(k) { if (!records[k]) return; setSelected((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]); }
  function changeMonth(delta) { setViewDate(new Date(yr, mo + delta, 1)); }
  return <Modal onClose={onClose}>
    <MHead title={`${yr}年${mo + 1}月`} onClose={onClose} left={<button onClick={() => changeMonth(-1)} style={NAV_BTN}>‹</button>} />
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -54, marginBottom: 18, paddingRight: 36 }}><button onClick={() => changeMonth(1)} style={NAV_BTN}>›</button></div>
    {selectionMode && <div style={{ background: "#fdf0f2", color: "#80636d", borderRadius: 12, padding: 12, fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>相談に持っていきたい記録の日をタップしてください。月をまたいで何日でも選べます。</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 12 }}>
      {["日", "月", "火", "水", "木", "金", "土"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#b8a0a8", padding: "4px 0" }}>{d}</div>)}
      {cells.map((d, i) => { if (!d) return <div key={`e${i}`} />; const k = `${prefix}-${String(d).padStart(2, "0")}`, done = !!records[k], isSelected = selected.includes(k), isToday = k === tkey(); return <button key={k} onClick={() => { if (!done) return; if (selectionMode) toggle(k); else setDayView(k); }} style={{ border: isSelected ? "2px solid #c4788a" : "none", textAlign: "center", fontSize: 13, padding: "8px 2px", borderRadius: 9, color: done ? "#7a4a58" : "#b9adb1", background: isSelected ? "#f6dfe5" : done ? "#fdf0f2" : "transparent", fontWeight: done ? 600 : 400, cursor: done ? "pointer" : "default", outline: isToday && !isSelected ? "2px solid #e8c0c8" : "none", outlineOffset: -2 }}>{d}{done && <div style={{ width: 5, height: 5, borderRadius: "50%", margin: "3px auto 0", background: records[k].concern ? "#9b6b7a" : "#c4788a" }} />}</button>; })}
    </div>
    {selectionMode ? <><div style={{ fontSize: 13, color: "#80636d", textAlign: "center", margin: "16px 0 8px" }}>{selected.length}日 選択中</div><button style={{ ...BTN_DARK, opacity: selected.length ? 1 : 0.4 }} disabled={!selected.length} onClick={() => setShowReport(true)}>相談メモを作る</button><button style={BTN_GHOST} onClick={() => { setSelectionMode(false); setSelected([]); }}>選択をやめる</button></> : <button style={BTN_SOFT} onClick={() => setSelectionMode(true)}>📝 相談用の記録を選ぶ</button>}
  </Modal>;
}

export default function App() {
  const tk = tkey(), todayQs = getQs(tk), now = new Date();
  const [agreed, setAgreed] = useState(true), [screen, setScreen] = useState("home"), [qi, setQi] = useState(0), [answers, setAnswers] = useState([]), answersRef = useRef([]), [resp, setResp] = useState(""), [notes, setNotes] = useState({ observation: "", interpretation: "", concern: "" }), [summary, setSummary] = useState(""), [records, setRecords] = useState({}), [showCal, setShowCal] = useState(false), [selectOnOpen, setSelectOnOpen] = useState(false);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => {
    if (!localStorage.getItem("kizuki_agreed")) setAgreed(false);
    const all = load(); setRecords(all); const today = all[tk];
    if (today?.completed) { setAnswers(today.answers || []); answersRef.current = today.answers || []; setNotes({ observation: today.observation || "", interpretation: today.interpretation || "", concern: today.concern || "" }); setSummary(today.summary || ""); setScreen("done"); }
  }, [tk]);
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthCount = Object.keys(records).filter((k) => k.startsWith(monthPrefix) && records[k]?.completed).length;
  function resetTodayFlow() { setQi(0); setAnswers([]); answersRef.current = []; setResp(""); setNotes({ observation: "", interpretation: "", concern: "" }); setSummary(""); setScreen("q"); }
  function answer(type) { const q = todayQs[qi]; const next = [...answersRef.current, { questionId: q.id, type, text: LABELS[type] }]; answersRef.current = next; setAnswers(next); setResp(RESPONSE[type]); setScreen("resp"); }
  function next() { if (qi + 1 >= todayQs.length) setScreen("notes"); else { setQi((v) => v + 1); setResp(""); setScreen("q"); } }
  function finish() {
    const s = makeDailySummary(notes);
    const nextRecords = { ...records, [tk]: { ...(records[tk] || {}), completed: true, answers: answersRef.current, observation: notes.observation.trim(), interpretation: notes.interpretation.trim(), concern: notes.concern.trim(), summary: s } };
    setRecords(nextRecords); save(nextRecords); setSummary(s); setScreen("summary");
  }
  function openCalendar(selection = false) { setSelectOnOpen(selection); setShowCal(true); }
  return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Shippori+Mincho:wght@400;600&display=swap');*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;background:#faf5f6}.app{font-family:'Zen Maru Gothic',sans-serif;min-height:100vh;background:#faf5f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.card-anim{animation:fu .35s ease}button:disabled{cursor:default}`}</style>
    <div className="app">
      {!agreed && <DisclaimerModal onAgree={() => { localStorage.setItem("kizuki_agreed", "1"); setAgreed(true); }} />}
      {showCal && <CalModal records={records} setRecords={setRecords} startSelection={selectOnOpen} onClose={() => setShowCal(false)} />}
      {screen === "home" && <div style={CARD} className="card-anim"><div style={{ fontSize: 52, textAlign: "center", marginBottom: 14 }}>🌱</div><p style={{ fontSize: 12, color: "#a89098", textAlign: "center", marginBottom: 4 }}>「様子を見ましょう」の、その後を記録する</p><h1 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 25, fontWeight: 600, color: "#3a2830", textAlign: "center", lineHeight: 1.6, margin: "0 0 16px" }}>きづきカレンダー</h1><div style={{ ...INFO_BOX, textAlign: "center" }}>今月は <strong style={{ fontSize: 22, color: "#c4788a" }}>{monthCount}日</strong> 記録があります。<br /><span style={{ fontSize: 12, color: "#80636d" }}>毎日でなくても大丈夫。気づいた日に残せば十分です。</span></div><button style={BTN_DARK} onClick={resetTodayFlow}>今日の記録をはじめる</button><button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 カレンダーを見る</button><button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談に持っていく記録を選ぶ</button></div>}
      {screen === "done" && <div style={{ ...CARD, textAlign: "center" }} className="card-anim"><div style={{ fontSize: 46, marginBottom: 12 }}>🌿</div><h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, color: "#3a2830", marginBottom: 12 }}>今日は記録済みです</h2><div style={INFO_BOX}>{summary || "今日の記録が残っています。"}</div><button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 記録を見返す</button><button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談用の記録を選ぶ</button><button style={BTN_GHOST} onClick={resetTodayFlow}>今日の記録をやり直す</button></div>}
      {screen === "q" && <div style={CARD} className="card-anim"><div style={{ display: "inline-block", background: "#fdf0f2", color: "#80636d", fontSize: 12, padding: "4px 12px", borderRadius: 20, marginBottom: 16 }}>{now.getMonth() + 1}月{now.getDate()}日</div><div style={{ height: 4, background: "#f0e8ea", borderRadius: 4, marginBottom: 24, overflow: "hidden" }}><div style={{ height: "100%", background: "#c4788a", width: `${(qi / todayQs.length) * 100}%` }} /></div><div style={{ fontSize: 11, color: "#a89098", marginBottom: 8 }}>{todayQs[qi].group}　{qi + 1} / 3</div><div style={{ fontSize: 36, marginBottom: 10 }}>{todayQs[qi].emoji}</div><p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 18, color: "#3a2830", lineHeight: 1.7, marginBottom: 8 }}>{todayQs[qi].text}</p><p style={{ fontSize: 12, color: "#a89098", lineHeight: 1.6, marginBottom: 26 }}>{todayQs[qi].hint}</p><button style={BTN_YES} onClick={() => answer("yes")}>あった</button><button style={BTN_KINDA} onClick={() => answer("kinda")}>ちょっとだけ</button><button style={BTN_NO} onClick={() => answer("no")}>今日はなかった</button></div>}
      {screen === "resp" && <div style={CARD} className="card-anim"><div style={{ fontSize: 12, color: "#a89098", marginBottom: 12 }}>{qi + 1} / 3</div><div style={{ fontSize: 36, marginBottom: 10 }}>{todayQs[qi].emoji}</div><p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15, color: "#3a2830", lineHeight: 1.7, marginBottom: 8 }}>{todayQs[qi].text}</p><p style={{ fontSize: 13, color: "#80636d", marginBottom: 16 }}>→ {LABELS[answers[answers.length - 1]?.type]}</p><div style={{ background: "#fdf0f4", borderLeft: "3px solid #c4788a", borderRadius: "0 14px 14px 14px", padding: "17px 18px", marginBottom: 22, fontSize: 14, color: "#4a3038", lineHeight: 1.8 }}>{resp}</div><button style={BTN_DARK} onClick={next}>{qi + 1 >= 3 ? "今日あったことも残す" : "次へ"}</button></div>}
      {screen === "notes" && <div style={CARD} className="card-anim"><div style={{ fontSize: 12, color: "#a89098", marginBottom: 6 }}>3つの問いに答えました</div><h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 19, color: "#3a2830", marginBottom: 8 }}>今日あったことを残す</h2><p style={{ fontSize: 12, color: "#80636d", lineHeight: 1.6, marginBottom: 18 }}>全部書かなくて大丈夫。料理中なら、キーボードの🎙からそのまま話して入力できます。</p><NoteFields value={notes} onChange={setNotes} /><button style={BTN_DARK} onClick={finish}>今日の記録を保存</button><button style={BTN_GHOST} onClick={finish}>メモなしで保存</button></div>}
      {screen === "summary" && <div style={{ ...CARD, textAlign: "center" }} className="card-anim"><div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div><h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, color: "#3a2830", marginBottom: 14 }}>今日の様子を残せました</h2><div style={INFO_BOX}>{summary}</div><p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 16, color: "#80636d", lineHeight: 1.7, marginBottom: 18 }}>「私、ちゃんと様子を見られてる」<br />そう思える記録を少しずつ。</p><button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 カレンダーを見る</button><button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談に持っていく記録を選ぶ</button><button style={BTN_GHOST} onClick={() => setScreen("home")}>トップに戻る</button></div>}
    </div>
  </>;
}
