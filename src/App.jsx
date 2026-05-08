import { useState, useEffect, useRef } from "react";

const ALL_QUESTIONS = [
  { id: 1, emoji: "🤝", text: "あなたが部屋に入ったとき、お子さんが気づいて反応しましたか？", hint: "目が向く、声を出す、どんな小さな反応でも" },
  { id: 2, emoji: "😄", text: "一緒に笑えた瞬間がありましたか？", hint: "どんな場面でも、笑いが生まれたら" },
  { id: 3, emoji: "👆", text: "何かを指差したり、あなたに「見て」と伝えようとしましたか？", hint: "声・視線・身振り、どんな形でも" },
  { id: 4, emoji: "🫶", text: "困ったとき、あなたのそばに来ましたか？", hint: "目で探す、近づく、声を出すなど" },
  { id: 5, emoji: "🎭", text: "あなたのしぐさや動作を真似しましたか？", hint: "掃除・食事・電話など、なんでも" },
  { id: 6, emoji: "🗣️", text: "声・言葉・身振りで何か伝えようとしましたか？", hint: "「あー」「んー」も立派なコミュニケーション" },
  { id: 7, emoji: "😢", text: "嫌なとき、「いや」と何らかの形で伝えましたか？", hint: "首を振る・手を払う・声を出すなど" },
  { id: 8, emoji: "📖", text: "絵本や本を一緒に開いた時間がありましたか？", hint: "めくるだけでも、眺めるだけでも" },
  { id: 9, emoji: "😊", text: "あなたが声をかけたとき、表情が変わりましたか？", hint: "どんな小さな変化でも" },
  { id: 10, emoji: "🎵", text: "あなたの歌や声かけに、何か反応しましたか？", hint: "体が動く・表情が変わる・声を出すなど" },
  { id: 11, emoji: "🔍", text: "何かにじっと集中していた瞬間がありましたか？", hint: "どんな対象でも、集中できていれば" },
  { id: 12, emoji: "🔁", text: "同じ動作や遊びを繰り返していましたか？", hint: "繰り返しは学びのサインです" },
  { id: 13, emoji: "📦", text: "入れる・出す・並べるなど、手を動かして遊んでいましたか？", hint: "どんな素材でも、繰り返しやっていれば" },
  { id: 14, emoji: "🐛", text: "小さなものや動くものをじっと観察していましたか？", hint: "虫・葉・水など、何でも" },
  { id: 15, emoji: "⏸️", text: "一人で落ち着いて過ごしている時間がありましたか？", hint: "一人遊びは安心の証です" },
  { id: 16, emoji: "👁️", text: "今日、お子さんが自分から何かに向かって動く場面を見られましたか？", hint: "観察できた、それだけで十分" },
  { id: 17, emoji: "🤲", text: "つまむ・はめる・積むなど、指先を使っていましたか？", hint: "小さな動きに大きな育ちがあります" },
  { id: 18, emoji: "💧", text: "何かの素材や感触に自分から触れていましたか？", hint: "水・砂・布・食べ物など何でも" },
  { id: 19, emoji: "🎶", text: "音や声に反応して体や表情が動きましたか？", hint: "揺れる・止まる・振り向くなど" },
  { id: 20, emoji: "🏃", text: "全身を使って動き回る場面がありましたか？", hint: "走る・よじ登る・転がるなど" },
  { id: 21, emoji: "💪", text: "うまくいかなくても、もう一度やろうとしましたか？", hint: "あきらめずに手を出し続けるだけでOK" },
  { id: 22, emoji: "👟", text: "何か自分でやろうとする場面がありましたか？", hint: "靴・服・食事など、どんなことでも" },
  { id: 23, emoji: "🍽️", text: "食事の時間、自分のペースで過ごせましたか？", hint: "食べ方より、その場にいられたかどうか" },
  { id: 24, emoji: "🌿", text: "外で自分の興味に向かって動きましたか？", hint: "行きたい方向に歩く、触りに行くなど" },
  { id: 25, emoji: "🧸", text: "お気に入りのものやこだわりの遊び方がありましたか？", hint: "好きなものがある、それ自体が育ちです" },
  { id: 26, emoji: "💡", text: "「あ、こんなことわかるんだ」と思った瞬間がありましたか？", hint: "どんな小さな発見でも" },
  { id: 27, emoji: "🌱", text: "小さくても「育ってる」と感じた場面はありましたか？", hint: "昨日と比べなくていいです" },
  { id: 28, emoji: "🔄", text: "今日、お子さんのペースに合わせられた瞬間がありましたか？", hint: "一瞬でも合わせられたら十分" },
  { id: 29, emoji: "🌤️", text: "今日のお子さんの顔で、印象に残っている表情はありましたか？", hint: "どんな表情でも、思い浮かべてみて" },
  { id: 30, emoji: "🤲", text: "今日、一緒にいられてよかったと思えましたか？", hint: "少しでもそう思えたなら、それで十分" },
];

const R = {
  1: { yes: "気づいてくれた。それはお子さんにとってあなたが特別な存在だということです。", kinda: "ほんの少しでも反応があった。それで十分です。感じ取っています。", no: "今日は気づかなかったかもしれない。でもそばにいたこと、伝わっています。" },
  2: { yes: "笑いを共有できた。これが関係の土台になります。", kinda: "少しでも笑えた瞬間があった。それが今日の一番大事な時間です。", no: "笑えない日もあります。そばにいるだけで十分伝わっています。" },
  3: { yes: "「見て」と伝えてくれた。共感しようとする育ちのサインです。", kinda: "少しでも伝えようとした。その気持ちの芽がちゃんとあります。", no: "今日は出なかった。でも「見て」と伝えたくなる相手がいる。それがあなたです。その瞬間は必ずきます。" },
  4: { yes: "困ったときにあなたを選んだ。信頼関係がしっかり育っています。", kinda: "少しだけ近づいてきた。あなたのことを頼りにしている証です。", no: "今日は来なかった。でも来なくていいと思えるくらい、安心しているのかもしれません。" },
  5: { yes: "真似してくれた。あなたのことをよく見ている証拠です。", kinda: "少し真似しようとした。観察する力が育っています。", no: "今日は出なかった。真似したくなるほど好きな人がいる。それがあなたです。その瞬間を楽しみに待っていてください。" },
  6: { yes: "伝えようとした。その意欲が言葉の土台になります。", kinda: "少しでも伝えようとした。その小さな一歩が積み重なります。", no: "今日は出なかった。言葉はある日突然やってきます。その日を楽しみに待っていてください。" },
  7: { yes: "「いや」と伝えられた。自分の気持ちを持っている証です。", kinda: "少しだけ出た。気持ちを伝えようとする力が育っています。", no: "今日は出なかった。自分の気持ちを出せる日が必ずきます。待っていてください。" },
  8: { yes: "一緒に開けた。その時間がことばと関係の栄養になります。", kinda: "少しだけ開けた。それで十分です。", no: "今日は開けなかった。また明日、一ページだけでいいです。" },
  9: { yes: "表情が変わった。あなたの声をちゃんと受け取っています。", kinda: "少しだけ変わった。感じ取っています。", no: "今日は変わらなかった。あなたの声は届いています。表情に出る日を楽しみに待っていてください。" },
  10: { yes: "反応してくれた。あなたの声が一番届いています。", kinda: "少しだけ反応した。あなたの声を聞いています。", no: "今日は出なかった。歌や声に体が動き出す瞬間が必ずきます。その日まで歌い続けてください。" },
  11: { yes: "集中できた。それがお子さんの学び方です。", kinda: "少しだけ集中した。その瞬間に育ちがあります。", no: "今日は出なかった。夢中になれる何かと出会う瞬間が必ずきます。その顔を見られるのはあなただけです。" },
  12: { yes: "繰り返していた。それは飽きているのではなく、学んでいるサインです。", kinda: "少し繰り返していた。その積み重ねが育ちになります。", no: "今日は出なかった。同じことを何度もやり始めたら、それが夢中になっているサインです。見逃さないでください。" },
  13: { yes: "手を動かして遊んでいた。指先の育ちが着実に進んでいます。", kinda: "少し手を動かしていた。それで十分です。", no: "今日は出なかった。手が動き始めたとき、その集中した顔をじっくり見てあげてください。" },
  14: { yes: "じっと観察していた。世界をちゃんと受け取っています。", kinda: "少し見ていた。その好奇心が育ちの入口です。", no: "今日は出なかった。何かに釘付けになる瞬間が必ずきます。そのとき、一緒に覗き込んであげてください。" },
  15: { yes: "一人で過ごせた。安心できているから一人でいられます。", kinda: "少しだけ一人でいられた。それが安心の証です。", no: "今日はそばにいたかった日。それもお子さんのペースです。求めてくれているうちが、実は一番幸せな時間かもしれません。" },
  16: { yes: "見られた。その観察がお子さんの育ちを一番知っている人になる時間です。", kinda: "少しだけ見られた。その瞬間があれば十分です。", no: "今日は見られなかった。でも毎日見ようとしているあなたがいる。それがお子さんの育ちの土台です。" },
  17: { yes: "指先を使っていた。小さな動きの中に大きな育ちがあります。", kinda: "少し使っていた。その積み重ねが手の育ちになります。", no: "今日は出なかった。指先が動き始めたとき、その真剣な顔をそばで見ていてあげてください。" },
  18: { yes: "自分から触れていた。世界を体で受け取っています。", kinda: "少し触れていた。その好奇心がすべての学びの始まりです。", no: "今日は出なかった。何かに手を伸ばす瞬間が必ずきます。そのとき一緒に触ってみてください。" },
  19: { yes: "体や表情が動いた。音の世界をちゃんと受け取っています。", kinda: "少し動いた。感じ取っています。", no: "今日は出なかった。音に体が動き出す瞬間が必ずきます。その日まで声をかけ続けてください。" },
  20: { yes: "全身で動いていた。その勢いがそのままお子さんの育ちです。", kinda: "少し動いていた。体を動かそうとする気持ちが育っています。", no: "今日はそういう日じゃなかった。動き出したくなる日が必ずきます。その日は一緒に思い切り付き合ってあげてください。" },
  21: { yes: "もう一度やろうとした。その粘り強さがお子さんの一番の力です。", kinda: "少しだけやろうとした。その気持ちがあれば十分です。", no: "今日は出なかった。あきらめずに手を伸ばす瞬間が必ずきます。そのとき、黙って見守っていてあげてください。" },
  22: { yes: "自分でやろうとした。その「やりたい」気持ちが自立の始まりです。", kinda: "少しだけやろうとした。その芽がちゃんとあります。", no: "今日は出なかった。「自分で」と手を払いのける日が来たとき、それを喜んであげてください。" },
  23: { yes: "自分のペースで過ごせた。それが一番大事なことです。", kinda: "少しだけ自分のペースがあった。それで十分です。", no: "今日はしんどい食事の時間だった。それでも一緒にテーブルにいた。それだけで十分です。" },
  24: { yes: "興味に向かって動いた。その好奇心がお子さんの世界を広げていきます。", kinda: "少しだけ動いた。外に出た、それだけで十分です。", no: "今日は出なかった。いつかふと走り出す瞬間がきます。その背中を追いかけてあげてください。" },
  25: { yes: "お気に入りがある。好きなものがあるということが、育ちの証です。", kinda: "少しだけ見えた。その「好き」をこれからも大切にしてあげてください。", no: "今日は出なかった。これだ、という出会いが必ずきます。その瞬間を一緒に喜んであげてください。" },
  26: { yes: "気づけた。その発見があなたをお子さんの一番の理解者にしていきます。", kinda: "少しだけあった。その感覚を大事にしてください。", no: "今日は気づけなかった。でも気づこうとしているあなたがいる。その瞬間は必ずきます。見逃さないでください。" },
  27: { yes: "感じられた。その感覚があなたとお子さんの関係を育てていきます。", kinda: "少しだけ感じた。その「少し」が積み重なっていきます。", no: "今日は感じられなかった。それでいいんです。育ちは感じられない日にも続いています。" },
  28: { yes: "合わせられた。その瞬間がお子さんにとって一番安心できる時間です。", kinda: "少しだけ合わせられた。それで十分です。", no: "今日は合わせられなかった。それでも明日また試みるあなたがいる。それがお子さんには十分伝わっています。" },
  29: { yes: "浮かんだ。その表情を覚えているあなたが、お子さんの一番の記録者です。", kinda: "少し浮かんだ。その記憶がこれからの宝になります。", no: "今日は浮かばなかった。それでいいんです。明日また見ればいい。その顔はどこにも行きません。" },
  30: { yes: "思えた。その気持ちがお子さんの育ちの一番の栄養です。", kinda: "少しだけ思えた。それで十分です。今日もありがとうございました。", no: "思えなかった日もある。それが正直な気持ちなら、それでいいんです。それでも今日一日、一緒にいた。それがすべてです。" },
};

const MP = {
  1: "雪が音もなく積もるように、あなたの愛情は静かに、深く積もっています。",
  2: "梅がどの花より早く春を知るように、あなたはお子さんの小さな変化を、誰より早く感じ取っています。",
  3: "桃の花のように、あなたがそこにいるだけで、お子さんの心が温かくなっています。",
  4: "桜の花びらが一瞬を美しく残すように、今日のお子さんの姿も、かけがえのない記録になっています。",
  5: "花水木が空へ向かって咲くように、お子さんの小さな意欲を、あなたはそばで受けとめています。",
  6: "紫陽花が雨の中で色を変えるように、お子さんの移ろう気持ちの変化を、あなたは丁寧に感じ取っています。",
  7: "朝顔が朝の光にひらくように、お子さんの今日の始まりを、あなたはそばで見守っています。",
  8: "陽に向かう向日葵のように、あなたはいつもお子さんの方を向いていました。それだけで、十分です。",
  9: "秋桜が風に揺れながら咲くように、お子さんの揺れる気持ちも、あなたはそばで見守っています。",
  10: "金木犀の香りにふと気づくように、お子さんの小さな変化を、あなたは見逃さずに拾っています。",
  11: "紅葉が少しずつ色づくように、お子さんの育ちは、今日も静かに進んでいます。",
  12: "柊の木が冬の中で葉を保つように、あなたの記録が来年のお子さんの育ちを支えます。",
};

function dkey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function tkey() {
  return dkey(new Date());
}

function getQs(key) {
  const seed = key.replace(/-/g, "");
  let hash = parseInt(seed, 10) % 10000;
  const pool = ALL_QUESTIONS.slice();
  const out = [];
  while (out.length < 3 && pool.length > 0) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    out.push(pool.splice(hash % pool.length, 1)[0]);
  }
  return out;
}

function load() {
  try {
    return JSON.parse(localStorage.getItem("kizuki") || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem("kizuki", JSON.stringify(data));
  } catch {
    const keys = Object.keys(data).sort();
    for (let i = 0; i < Math.floor(keys.length / 2); i++) {
      if (data[keys[i]] && data[keys[i]].photo) delete data[keys[i]].photo;
    }
    try {
      localStorage.setItem("kizuki", JSON.stringify(data));
    } catch {
      // 保存できない場合は何もしない
    }
  }
}

function compress(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("timeout"));
    }, 10000);

    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error("load failed"));
    };

    img.onload = () => {
      clearTimeout(timer);
      const s = Math.min(1, 800 / img.width);
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };

    img.src = url;
  });
}

function makeSummary(qs, answers) {
  const noCount = answers.filter((a) => a.type === "no").length;
  const kindaCount = answers.filter((a) => a.type === "kinda").length;
  const yesCount = answers.filter((a) => a.type === "yes").length;

  if (noCount >= 2) {
    return "今日は、はっきり見えなかったことも多かったかもしれません。それでも、見ようとしてくれた時間そのものが記録です。育ちは、感じられない日にも静かに続いています。また明日も教えてください。";
  }
  if (kindaCount >= 2) {
    return "今日は、小さな気づきがいくつか残りました。はっきりした変化でなくても、少しだけ見えたことには意味があります。その積み重ねが、お子さんの育ちを見つめる力になります。また明日も教えてください。";
  }
  if (yesCount >= 2) {
    return "今日は、お子さんの姿がいくつも見えた日でした。できたことだけでなく、その場面を見つけられたことが大切な記録です。今日の気づきが、明日の関わりを少しやさしくしてくれます。また明日も教えてください。";
  }
  return "今日も、お子さんのそばで見守ってくれてありがとうございました。小さな気づきも、見えなかったことも、どちらも大切な記録です。お子さんのペースを、また一緒に見つめていきましょう。また明日も教えてください。";
}

function Overlay({ onClick, children }) {
  return (
    <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {children}
    </div>
  );
}

function Modal({ onClose, children, style }) {
  return (
    <Overlay onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={Object.assign({ background: "white", borderRadius: 24, padding: "28px 24px", maxWidth: 380, width: "100%", boxShadow: "0 8px 48px rgba(150,80,100,0.15)", maxHeight: "85vh", overflowY: "auto" }, style || {})}>
        {children}
      </div>
    </Overlay>
  );
}

function MHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, fontFamily: "'Shippori Mincho',serif", fontSize: 17, color: "#3a2830" }}>
      <span>{title}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "#b8a0a8", cursor: "pointer", padding: "4px 8px" }}>✕</button>
    </div>
  );
}

function DisclaimerModal({ onAgree }) {
  return (
    <Overlay onClick={() => {}}>
      <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "32px 28px 40px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>🌱</div>
        <p style={{ fontSize: 11, color: "#b8a0a8", textAlign: "center", marginBottom: 4 }}>
          1歳半健診で様子を見ましょうと<br />言われたお子さんのための
        </p>
        <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, fontWeight: 600, color: "#3a2830", textAlign: "center", marginBottom: 24 }}>きづきカレンダー</h2>
        <div style={{ fontSize: 14, color: "#4a3038", lineHeight: 1.9, marginBottom: 20 }}>
          <p style={{ marginBottom: 16 }}>このアプリは、1歳半健診後の「様子を見ましょう」期間に、日々の関わりの中での気づきを積み重ねるためのツールです。</p>
          <p style={{ marginBottom: 12 }}>本アプリは、医療・療育・福祉的な診断や助言を行うものではありません。お子さまの発達や対応についての最終的な判断は、必ず保護者ご自身の責任において行ってください。気になる点や不安がある場合は、医療機関や専門機関へご相談ください。</p>
          <p style={{ marginBottom: 12 }}>本アプリの記録は、お使いの端末内のみに保存されます。機種変更・アプリ削除・キャッシュ削除等により、記録が消失する可能性があります。大切な記録は、LINEのシェア機能等を利用して外部に保存することを推奨します。</p>
          <p>本アプリは、日々の観察や気づきを支える補助ツールとしてご利用ください。特定の判断や行動を推奨・保証するものではありません。</p>
        </div>
        <div style={{ background: "#fdf0f2", borderRadius: 14, padding: 16, fontSize: 13, color: "#9b6b7a", lineHeight: 1.8, marginBottom: 24 }}>
          上記をご理解のうえ、同意される方のみご利用ください。
        </div>
        <button onClick={onAgree} style={{ padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 15, fontWeight: 500, width: "100%", background: "#7a4a58", color: "white" }}>同意してはじめる</button>
      </div>
    </Overlay>
  );
}

function DayModal({ dk, rec, records, setRecords, onClose }) {
  const qs = getQs(dk);
  const parts = dk.split("-");
  const ans = rec.answers || [];
  const [photo, setPhoto] = useState(rec.photo || null);
  const [busy, setBusy] = useState(false);

  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const img = await compress(f);
      setPhoto(img);
      const next = Object.assign({}, records);
      next[dk] = Object.assign({}, next[dk], { photo: img });
      setRecords(next);
      save(next);
    } catch {
      // 画像読み込み失敗時は何もしない
    }
    setBusy(false);
  }

  function removePhoto() {
    setPhoto(null);
    const next = Object.assign({}, records);
    const copy = Object.assign({}, next[dk]);
    delete copy.photo;
    next[dk] = copy;
    setRecords(next);
    save(next);
  }

  return (
    <Modal onClose={onClose}>
      <MHead title={parseInt(parts[1], 10) + "月" + parseInt(parts[2], 10) + "日の記録"} onClose={onClose} />
      {photo ? (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <img src={photo} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "cover", maxHeight: 200 }} />
          <button onClick={removePhoto} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      ) : (
        <label style={{ display: "block", border: "2px dashed #e8c0c8", borderRadius: 14, padding: 20, textAlign: "center", color: "#9b6b7a", fontSize: 13, background: "#fdf0f2", cursor: "pointer", marginBottom: 16 }}>
          {busy ? "読み込み中…" : "📷 今日の一枚を追加"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        </label>
      )}

      {rec.summary && (
        <div style={{ background: "linear-gradient(135deg,#fdf0f4,#f8f0f5)", borderRadius: 14, padding: 16, marginBottom: 16, fontSize: 14, color: "#4a3038", lineHeight: 1.8 }}>{rec.summary}</div>
      )}

      {qs.map((q, i) => {
        const a = ans[i];
        const response = a && R[q.id] ? R[q.id][a.type] : null;
        return (
          <div key={q.id} style={{ borderLeft: "3px solid #e8c0c8", paddingLeft: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#3a2830", marginBottom: 4 }}>{q.emoji} {q.text}</div>
            {a && <div style={{ fontSize: 12, color: "#9b6b7a", marginBottom: 4 }}>→ {a.text}</div>}
            {response && <div style={{ fontSize: 12, color: "#a89098", lineHeight: 1.6 }}>{response}</div>}
          </div>
        );
      })}
      <button onClick={onClose} style={{ background: "transparent", color: "#b8a0a8", fontSize: 13, border: "none", cursor: "pointer", width: "100%", marginTop: 16, padding: 10 }}>閉じる</button>
    </Modal>
  );
}

function WeekModal({ records, onClose }) {
  const today = new Date();
  const keys = [];

  for (let i = 6; i >= 0; i = i - 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    keys.push(dkey(d));
  }

  const seen = {};
  keys.forEach((k) => {
    const rec = records[k];
    if (!rec) return;
    getQs(k).forEach((q) => {
      seen[q.id] = q;
    });
  });

  const list = Object.values(seen);
  const done = keys.filter((k) => !!records[k]).length;

  return (
    <Modal onClose={onClose}>
      <MHead title="今週の問いかけ一覧" onClose={onClose} />
      <div style={{ fontSize: 13, color: "#a89098", marginBottom: 20 }}>この7日間の記録：<span style={{ color: "#c4788a", fontWeight: 700 }}>{done}日</span></div>
      {list.length === 0 && <p style={{ fontSize: 14, color: "#b8a0a8", textAlign: "center", padding: "24px 0" }}>今週はまだ記録がありません</p>}
      {list.map((q) => (
        <div key={q.id} style={{ borderLeft: "2px solid #f0e0e4", paddingLeft: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#3a2830", lineHeight: 1.6 }}>{q.emoji} {q.text}</div>
        </div>
      ))}
      <button onClick={onClose} style={{ background: "transparent", color: "#b8a0a8", fontSize: 13, border: "none", cursor: "pointer", width: "100%", marginTop: 8, padding: 10 }}>閉じる</button>
    </Modal>
  );
}

function CalModal({ records, setRecords, onClose }) {
  const today = new Date();
  const yr = today.getFullYear();
  const mo = today.getMonth();
  const tk = tkey();
  const firstDay = new Date(yr, mo, 1).getDay();
  const lastDay = new Date(yr, mo + 1, 0).getDate();
  const prefix = yr + "-" + String(mo + 1).padStart(2, "0");
  const [dayView, setDayView] = useState(null);
  const [weekView, setWeekView] = useState(false);

  if (dayView) {
    return <DayModal dk={dayView} rec={records[dayView]} records={records} setRecords={setRecords} onClose={() => setDayView(null)} />;
  }

  if (weekView) {
    return <WeekModal records={records} onClose={() => setWeekView(false)} />;
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);

  return (
    <Modal onClose={onClose}>
      <MHead title={yr + "年" + (mo + 1) + "月"} onClose={onClose} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 12 }}>
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#b8a0a8", padding: "4px 0" }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={"e" + i} />;
          const k = prefix + "-" + String(d).padStart(2, "0");
          const done = !!records[k];
          const hasPhoto = done && !!records[k].photo;
          const isToday = k === tk;
          return (
            <div key={k} onClick={() => { if (done) setDayView(k); }} style={{ textAlign: "center", fontSize: 13, padding: "6px 2px", borderRadius: 8, color: done ? "#9b6b7a" : "#6a4858", background: done ? "#fdf0f2" : "transparent", fontWeight: done ? 500 : 400, cursor: done ? "pointer" : "default", outline: isToday ? "2px solid #c4788a" : "none", outlineOffset: -2 }}>
              {d}
              {done && <div style={{ width: 5, height: 5, borderRadius: "50%", margin: "2px auto 0", background: hasPhoto ? "#9b6b7a" : "#c4788a" }} />}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: "#b8a0a8", display: "flex", gap: 12, marginBottom: 16 }}>
        <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#c4788a", verticalAlign: "middle", marginRight: 4 }} />記録あり</span>
        <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#9b6b7a", verticalAlign: "middle", marginRight: 4 }} />写真あり</span>
      </div>
      <button onClick={() => setWeekView(true)} style={{ padding: "14px 20px", borderRadius: 14, border: "1.5px solid #e8c0c8", cursor: "pointer", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 15, fontWeight: 500, width: "100%", background: "#fdf0f2", color: "#9b6b7a" }}>📊 今週の問いかけ一覧</button>
    </Modal>
  );
}

function MonthReportModal({ report, onClose }) {
  return (
    <Modal onClose={onClose} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
      <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 19, color: "#3a2830", marginBottom: 20, lineHeight: 1.6 }}>{report.month}月の記録</p>
      <div style={{ background: "linear-gradient(135deg,#fdf0f4,#f8f0f5)", borderRadius: 18, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#c4788a", marginBottom: 16 }}>{report.count}日</div>
        <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15, color: "#4a3038", lineHeight: 2, textAlign: "left" }}>
          {report.count}日、記録しました。でも、あなたがお子さんを見つめていない日は一日もありません。その観察が、健診では見えない家庭での育ちの記録になっています。{report.prevCount === 0 ? "これがあなたとお子さんの育ちの記録のはじまりです。" : (MP[report.month] || "")}
        </p>
      </div>
      <button onClick={onClose} style={{ padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 15, fontWeight: 500, width: "100%", background: "#7a4a58", color: "white" }}>今月もはじめる</button>
    </Modal>
  );
}

const BTN = { padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 15, fontWeight: 500, width: "100%", display: "block", marginTop: 10 };
const BTN_DARK = Object.assign({}, BTN, { background: "#7a4a58", color: "white" });
const BTN_SOFT = Object.assign({}, BTN, { background: "#fdf0f2", color: "#9b6b7a", border: "1.5px solid #e8c0c8" });
const BTN_GHOST = Object.assign({}, BTN, { background: "transparent", color: "#b8a0a8", fontSize: 13 });
const BTN_YES = Object.assign({}, BTN, { background: "#c4788a", color: "white", marginTop: 0 });
const BTN_KINDA = Object.assign({}, BTN, { background: "#fdf0f2", color: "#9b6b7a", border: "1.5px solid #e8c0c8" });
const BTN_NO = Object.assign({}, BTN, { background: "#f5f2f3", color: "#a89098" });
const CARD = { background: "white", borderRadius: 24, padding: "36px 32px", maxWidth: 420, width: "100%", boxShadow: "0 4px 32px rgba(150,80,100,0.08)", position: "relative", zIndex: 1 };
const SUMMARY_BOX = { background: "linear-gradient(135deg,#fdf0f4,#f8f0f5)", borderRadius: 18, padding: 24, fontSize: 15, color: "#4a3038", lineHeight: 1.9, marginBottom: 24 };

export default function App() {
  const tk = tkey();
  const qs = getQs(tk);
  const now = new Date();
  const mo = now.getMonth() + 1;
  const dy = now.getDate();

  const [agreed, setAgreed] = useState(true);
  const [screen, setScreen] = useState("home");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef([]);
  const [resp, setResp] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState({});
  const [showCal, setShowCal] = useState(false);
  const [monthReport, setMonthReport] = useState(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!localStorage.getItem("kizuki_agreed")) setAgreed(false);

    const all = load();
    setRecords(all);

    const lastOpen = localStorage.getItem("kizuki_open");
    localStorage.setItem("kizuki_open", tk);

    if (lastOpen && lastOpen !== tk) {
      const ld = new Date(lastOpen);
      if (!isNaN(ld.getTime())) {
        const nd = new Date();
        if (nd.getMonth() !== ld.getMonth() || nd.getFullYear() !== ld.getFullYear()) {
          const lmo = ld.getMonth();
          const lyr = ld.getFullYear();
          const pfx = lyr + "-" + String(lmo + 1).padStart(2, "0");
          const dim = new Date(lyr, lmo + 1, 0).getDate();
          let count = 0;
          for (let d = 1; d <= dim; d++) {
            const k = pfx + "-" + String(d).padStart(2, "0");
            if (all[k] && all[k].completed) count++;
          }
          if (count > 0) {
            const pmo = lmo === 0 ? 11 : lmo - 1;
            const pyr = lmo === 0 ? lyr - 1 : lyr;
            const ppfx = pyr + "-" + String(pmo + 1).padStart(2, "0");
            const pdim = new Date(pyr, pmo + 1, 0).getDate();
            let prev = 0;
            for (let d = 1; d <= pdim; d++) {
              const k = ppfx + "-" + String(d).padStart(2, "0");
              if (all[k] && all[k].completed) prev++;
            }
            setMonthReport({ count, prevCount: prev, month: lmo + 1 });
          }
        }
      } else {
        localStorage.removeItem("kizuki_open");
      }
    }

    if (all[tk] && all[tk].completed) {
      setSummary(all[tk].summary || "");
      setAnswers(all[tk].answers || []);
      answersRef.current = all[tk].answers || [];
      setScreen("done");
    }
  }, [tk]);

  function handleAgree() {
    localStorage.setItem("kizuki_agreed", "1");
    setAgreed(true);
  }

  const streak = (() => {
    let n = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      if (records[dkey(d)]) {
        n++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return n;
  })();

  function answer(type) {
    const labels = { yes: "はい", kinda: "ちょっとだけ", no: "今日はなかったかな" };
    const q = qs[qi] || qs[0];
    const newAnswer = { questionId: q.id, text: labels[type], type };
    const newAnswers = answersRef.current.concat([newAnswer]);
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
    setResp((R[q.id] && R[q.id][type]) || "");
    setScreen("resp");
  }

  async function next() {
    const currentAnswers = answersRef.current;

    if (qi + 1 >= qs.length) {
      setScreen("summary");
      setLoading(true);

      const s = makeSummary(qs, currentAnswers);

      setTimeout(() => {
        setSummary(s);
        setLoading(false);
        const nr = Object.assign({}, records);
        nr[tk] = { completed: true, summary: s, answers: currentAnswers };
        setRecords(nr);
        save(nr);
      }, 500);
    } else {
      setQi(qi + 1);
      setResp("");
      setScreen("q");
    }
  }

  function lineShare() {
    if (!summary || loading) return;
    const currentAnswers = answersRef.current;
    const lines = [mo + "月" + dy + "日の記録\n"];

    qs.forEach((q, i) => {
      const a = currentAnswers[i];
      if (a) lines.push(q.text + "\n→ " + a.text);
    });

    lines.push("\n" + summary + "\n\nきづきカレンダー");

    const a = document.createElement("a");
    a.href = "https://line.me/R/share?text=" + encodeURIComponent(lines.join("\n"));
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const q = qs[qi] || qs[0];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Shippori+Mincho:wght@400;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{background:#faf5f6;min-height:100vh;} .app{font-family:'Zen Maru Gothic',sans-serif;min-height:100vh;background:#faf5f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px;} @keyframes fu{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}} .card-anim{animation:fu 0.4s ease;}`}</style>
      <div className="app">
        {!agreed && <DisclaimerModal onAgree={handleAgree} />}
        {showCal && <CalModal records={records} setRecords={setRecords} onClose={() => setShowCal(false)} />}
        {monthReport && <MonthReportModal report={monthReport} onClose={() => setMonthReport(null)} />}

        {screen === "home" && (
          <div style={CARD} className="card-anim">
            <div style={{ fontSize: 52, textAlign: "center", marginBottom: 16 }}>🌱</div>
            <p style={{ fontSize: 12, color: "#b8a0a8", textAlign: "center", marginBottom: 4 }}>
              1歳半健診で様子を見ましょうと<br />言われたお子さんのための
            </p>
            <h1 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 24, fontWeight: 600, color: "#3a2830", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>きづきカレンダー</h1>

            {streak > 0 && (
              <div style={{ background: "linear-gradient(135deg,#fdf0f2,#f8e8ec)", border: "1.5px solid #e8c0c8", borderRadius: 16, padding: "12px 20px", textAlign: "center", marginBottom: 24, fontSize: 13, color: "#9b6b7a" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#c4788a", display: "block" }}>🔥 {streak}日連続</span>
                続いています
              </div>
            )}

            <button style={BTN_DARK} onClick={() => setScreen("q")}>今日の記録をはじめる</button>
            <button style={BTN_SOFT} onClick={() => setShowCal(true)}>📅 カレンダーを見る</button>
          </div>
        )}

        {screen === "done" && (
          <div style={Object.assign({}, CARD, { textAlign: "center" })} className="card-anim">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
            <p style={{ fontSize: 12, color: "#b8a0a8", marginBottom: 4 }}>
              1歳半健診で様子を見ましょうと<br />言われたお子さんのための
            </p>
            <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, fontWeight: 600, color: "#3a2830", marginBottom: 12 }}>きづきカレンダー</h2>
            <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 16, color: "#9b6b7a", marginBottom: 20, lineHeight: 1.6 }}>あなたが今日もがんばっていたこと、<br />伝わりました 🌿</p>
            <div style={SUMMARY_BOX}>{summary}</div>
            <button style={Object.assign({}, BTN_SOFT, { marginTop: 0 })} onClick={() => setShowCal(true)}>📅 カレンダーを見る</button>
            <button style={BTN_GHOST} onClick={lineShare}>💚 LINEで保存・シェアする</button>
            <p style={{ fontSize: 13, color: "#a89098", marginTop: 16 }}>また明日ここに来てね。</p>
          </div>
        )}

        {screen === "q" && (
          <div style={CARD} className="card-anim">
            <div style={{ display: "inline-block", background: "#fdf0f2", color: "#9b6b7a", fontSize: 12, padding: "4px 12px", borderRadius: 20, marginBottom: 20 }}>{mo}月{dy}日</div>
            <div style={{ height: 4, background: "#f0e8ea", borderRadius: 4, marginBottom: 28, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#d4909a,#c4788a)", borderRadius: 4, width: (qi / qs.length * 100) + "%" }} />
            </div>
            <div style={{ fontSize: 12, color: "#b8a0a8", marginBottom: 12 }}>{qi + 1} / {qs.length}</div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{q.emoji}</div>
            <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 18, color: "#3a2830", lineHeight: 1.7, marginBottom: 8 }}>{q.text}</p>
            <p style={{ fontSize: 12, color: "#b8a0a8", marginBottom: 28, lineHeight: 1.5 }}>{q.hint}</p>
            <button style={BTN_YES} onClick={() => answer("yes")}>はい</button>
            <button style={BTN_KINDA} onClick={() => answer("kinda")}>ちょっとだけ</button>
            <button style={BTN_NO} onClick={() => answer("no")}>今日はなかったかな</button>
          </div>
        )}

        {screen === "resp" && (
          <div style={CARD} className="card-anim">
            <div style={{ fontSize: 12, color: "#b8a0a8", marginBottom: 12 }}>{qi + 1} / {qs.length}</div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{q.emoji}</div>
            <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15, color: "#3a2830", lineHeight: 1.7, marginBottom: 6 }}>{q.text}</p>
            <p style={{ fontSize: 13, color: "#b8a0a8", marginBottom: 16 }}>→ {answers[answers.length - 1] && answers[answers.length - 1].text}</p>
            <div style={{ fontSize: 11, color: "#9b6b7a", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em" }}>💬 サトウさんより</div>
            <div style={{ background: "#fdf0f4", borderLeft: "3px solid #c4788a", borderRadius: "0 14px 14px 14px", padding: "18px 20px", marginBottom: 24, fontSize: 15, color: "#4a3038", lineHeight: 1.8 }}>{resp}</div>
            <button style={Object.assign({}, BTN_DARK, { marginTop: 0 })} onClick={next}>{qi + 1 >= qs.length ? "今日のまとめを見る" : "次へ"}</button>
          </div>
        )}

        {screen === "summary" && (
          <div style={CARD} className="card-anim">
            <div style={{ display: "inline-block", background: "#fdf0f2", color: "#9b6b7a", fontSize: 12, padding: "4px 12px", borderRadius: 20, marginBottom: 20 }}>{mo}月{dy}日の記録</div>
            <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 17, color: "#3a2830", marginBottom: 20, lineHeight: 1.6 }}>あなたが今日もがんばっていたこと、<br />伝わりました 🌿</p>
            {loading ? (
              <p style={{ textAlign: "center", color: "#b8a0a8", padding: "32px 0" }}>まとめています…</p>
            ) : (
              <div style={SUMMARY_BOX}>{summary}</div>
            )}
            <button style={Object.assign({}, BTN_SOFT, { marginTop: 0 })} onClick={() => setShowCal(true)}>📅 カレンダーを見る</button>
            <button style={Object.assign({}, BTN_GHOST, { opacity: loading ? 0.4 : 1 })} onClick={lineShare} disabled={loading}>💚 LINEで保存・シェアする</button>
            <button style={BTN_GHOST} onClick={() => setScreen("home")}>トップに戻る</button>
          </div>
        )}
      </div>
    </>
  );
}
