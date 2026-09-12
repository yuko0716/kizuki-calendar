import { useEffect, useRef, useState } from "react";

const LEGACY_QUESTIONS = [
  { id: 1, group: "やりとり・ことば", tag: "人との関わり", emoji: "🤝", text: "あなたが部屋に入ったとき、お子さんが気づいて反応しましたか？", hint: "目を向ける、声を出す、近づくなど、見えたことだけで大丈夫です。" },
  { id: 2, group: "やりとり・ことば", tag: "人との関わり", emoji: "😄", text: "一緒に笑ったり、表情をやりとりする場面がありましたか？", hint: "どんな場面だったか思い出してみてください。" },
  { id: 3, group: "やりとり・ことば", tag: "身振り・非言語での意思表示", emoji: "👆", text: "何かを指差したり、あなたに「見て」と伝えようとしましたか？", hint: "指差しだけでなく、視線・声・身振りも含めて見てみます。" },
  { id: 4, group: "やりとり・ことば", tag: "身振り・非言語での意思表示", emoji: "🫶", text: "困ったとき、あなたの方を見る・近づく・声を出す場面がありましたか？", hint: "どんな助けの求め方だったか、そのまま残せます。" },
  { id: 5, group: "やりとり・ことば", tag: "人との関わり", emoji: "🎭", text: "あなたや周りの人のしぐさ・動作を真似しましたか？", hint: "家事、食事、手遊びなど、どんな真似でも。" },
  { id: 6, group: "やりとり・ことば", tag: "ことば・発声", emoji: "🗣️", text: "声・言葉・身振りで、何かを伝えようとした場面がありましたか？", hint: "言葉になっていなくても、実際に見えた伝え方を残します。" },
  { id: 7, group: "やりとり・ことば", tag: "身振り・非言語での意思表示", emoji: "🙅", text: "嫌なときや違うとき、何らかの形で伝えましたか？", hint: "首を振る、手を払う、声を出す、離れるなど。" },
  { id: 8, group: "やりとり・ことば", tag: "言葉の理解・やりとり", emoji: "📖", text: "絵本や本を一緒に見たとき、どんな反応がありましたか？", hint: "めくる、指す、声を出す、離れるなど、どれでも記録です。" },
  { id: 9, group: "やりとり・ことば", tag: "人との関わり", emoji: "😊", text: "あなたが声をかけたとき、表情・視線・動きに変化がありましたか？", hint: "反応の有無だけでなく、どんな変化だったかを見ます。" },
  { id: 10, group: "やりとり・ことば", tag: "言葉の理解・やりとり", emoji: "🎵", text: "歌や声かけ、身近な音に何か反応しましたか？", hint: "振り向く、止まる、動く、声を出すなど。" },

  { id: 11, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🔍", text: "何かにじっと集中していた瞬間がありましたか？", hint: "対象と、どのくらい続いたかを覚えていれば残せます。" },
  { id: 12, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🔁", text: "同じ動作や遊びを繰り返していましたか？", hint: "何を、どんなふうに繰り返していたかを見ます。" },
  { id: 13, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "📦", text: "入れる・出す・並べる・積むなど、手を使った遊びがありましたか？", hint: "遊び方をそのまま記録すれば十分です。" },
  { id: 14, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🐛", text: "小さなものや動くものをじっと見ていましたか？", hint: "虫、葉、水、車など、何を見ていたかを残します。" },
  { id: 15, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "⏸️", text: "一人で遊んだり、一人で落ち着いて過ごす時間がありましたか？", hint: "一人だった時間があったかどうかだけでも記録になります。" },
  { id: 16, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "👁️", text: "自分から何かに向かって動く場面がありましたか？", hint: "何に向かったのか、何をしたのかを見ます。" },
  { id: 17, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🤲", text: "つまむ・はめる・積むなど、指先を使う場面がありましたか？", hint: "できた・できないではなく、どんな動きをしていたかを残します。" },
  { id: 18, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "💧", text: "水・砂・布・食べ物などの感触に、自分から触れる場面がありましたか？", hint: "触れた、避けた、何度も触ったなど、そのまま記録します。" },
  { id: 19, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🎶", text: "音や声に反応して、体や表情が動く場面がありましたか？", hint: "揺れる、止まる、振り向くなど、見えた反応を残します。" },
  { id: 20, group: "遊び・動き", tag: "遊び・興味・身体の使い方", emoji: "🏃", text: "歩く・走る・よじ登る・しゃがむなど、全身を使う場面がありましたか？", hint: "どんな動きをしていたかをそのまま残します。" },

  { id: 21, group: "生活・いつもとの違い", tag: "場面による違い・頻度", emoji: "💪", text: "うまくいかなかったあと、もう一度やってみる場面がありましたか？", hint: "やめた、やり直した、助けを求めたなども記録です。" },
  { id: 22, group: "生活・いつもとの違い", tag: "生活場面", emoji: "👟", text: "食事・着替え・靴などを、自分でやろうとする場面がありましたか？", hint: "どこまで自分でやろうとしたかを見ます。" },
  { id: 23, group: "生活・いつもとの違い", tag: "生活場面", emoji: "🍽️", text: "食事の時間で、いつもと違う様子や印象に残ったことがありましたか？", hint: "食べ方、座り方、要求、拒否など、具体的な場面を残します。" },
  { id: 24, group: "生活・いつもとの違い", tag: "遊び・興味・身体の使い方", emoji: "🌿", text: "外で、行きたい場所や触りたいものを自分で選ぶ場面がありましたか？", hint: "どこへ行き、何に興味を示したかを残します。" },
  { id: 25, group: "生活・いつもとの違い", tag: "遊び・興味・身体の使い方", emoji: "🧸", text: "今日は特に気に入っていた物や遊びがありましたか？", hint: "何を、どんなふうに楽しんでいたかを見ます。" },
  { id: 26, group: "生活・いつもとの違い", tag: "言葉の理解・やりとり", emoji: "💡", text: "「こんなことがわかるんだ」と感じた具体的な場面がありましたか？", hint: "そう感じた出来事を、できればそのままの言葉で残します。" },
  { id: 27, group: "生活・いつもとの違い", tag: "新しく見られたこと・増えたこと", emoji: "🌱", text: "昨日までと少し違う、新しく見えた姿がありましたか？", hint: "小さな違いで大丈夫。なければ「なかった」も記録です。" },
  { id: 28, group: "生活・いつもとの違い", tag: "場面による違い・頻度", emoji: "🔄", text: "予定変更や遊びの切り替えのとき、どんな様子でしたか？", hint: "すぐ切り替えた、時間がかかった、別の方法で納得したなど。" },
  { id: 29, group: "生活・いつもとの違い", tag: "場面による違い・頻度", emoji: "🌤️", text: "今日、特に印象に残った表情や気持ちの動きはありましたか？", hint: "笑った、怒った、驚いた、ほっとしたなど、場面と一緒に残します。" },
  { id: 30, group: "生活・いつもとの違い", tag: "気になった出来事", emoji: "📝", text: "今日、あとで誰かに伝えておきたいと思った出来事がありましたか？", hint: "相談したいことでも、うれしかったことでも大丈夫です。" },
];

const EXTRA_COMMUNICATION = [
  ["ことば・発声", "👂", "名前を呼んだとき、どんな反応がありましたか？", "振り向く、目を向ける、声を出す、続けて遊ぶなど、そのまま残します。"],
  ["ことば・発声", "🐶", "ものや人を見て、自分から声や言葉を出した場面がありましたか？", "何を見て、どんな声や言葉が出たかを残します。"],
  ["ことば・発声", "🔊", "同じ声や言葉を、いつもと違う使い方で出した場面がありましたか？", "強さ、長さ、言う場面などの違いを見ます。"],
  ["ことば・発声", "💬", "大人の言葉や音をまねして声を出したことがありましたか？", "似ていなくても、まねしようとした様子があれば記録です。"],
  ["ことば・発声", "🧑‍🍼", "家族や身近な人を、声・呼び名・決まった音で呼ぶ場面がありましたか？", "誰に向けて、どんな声を出したかを残します。"],
  ["言葉の理解・やりとり", "🥤", "身近な物の名前を聞いたあと、その物を見る・取りに行く場面がありましたか？", "『お茶』『靴』など、言葉のあとに何をしたかを見ます。"],
  ["言葉の理解・やりとり", "📣", "短い声かけを聞いて、何か行動が変わる場面がありましたか？", "『おいで』『どうぞ』などのあとに見えた行動を残します。"],
  ["言葉の理解・やりとり", "📦", "『持ってきて』『入れて』などの声かけに、何か反応しましたか？", "できたかではなく、聞いたあとにどうしたかを見ます。"],
  ["言葉の理解・やりとり", "👀", "大人が見ている物や指した方向を、一緒に見る場面がありましたか？", "同じ物を見る、少し遅れて見る、別の方を見るなども記録です。"],
  ["言葉の理解・やりとり", "🔁", "大人とのやりとりが、2回以上続いた場面がありましたか？", "渡す・返す、声を出し合うなど、続いた回数も覚えていれば残します。"],
  ["身振り・非言語での意思表示", "🤲", "欲しい物があるとき、手を伸ばす・持ってくる・大人を連れていくなどで伝えましたか？", "言葉以外でどう伝えたかをそのまま残します。"],
  ["身振り・非言語での意思表示", "👉", "行きたい場所やしてほしいことを、指差し・視線・体の向きで示しましたか？", "どこを示し、そのあとどうしたかを見ます。"],
  ["身振り・非言語での意思表示", "✋", "『もういらない』『やめたい』を、手や体の動きで伝える場面がありましたか？", "押す、顔をそむける、離れるなども含みます。"],
  ["身振り・非言語での意思表示", "👐", "何かできたときや見つけたとき、大人に見せに来る場面がありましたか？", "物を持ってくる、顔を見る、声を出すなどを残します。"],
  ["身振り・非言語での意思表示", "🫳", "大人の手を取って、場所や物まで連れていくことがありましたか？", "どこへ連れていき、そのあと何をしたかを残します。"],
  ["人との関わり", "🙋", "身近な人が近づいたとき、自分から近づく・離れる・様子を見るなどの反応がありましたか？", "相手による違いもあれば残します。"],
  ["人との関わり", "🧒", "ほかの子どもを見たり、近づいたり、同じ物に手を伸ばす場面がありましたか？", "一緒に遊ばなくても、相手への反応が記録になります。"],
  ["人との関わり", "🤝", "ほかの人から誘われたとき、受け入れる・断る・様子を見るなどの反応がありましたか？", "誰から何に誘われ、どう反応したかを残します。"],
  ["人との関わり", "🪞", "大人の表情を見たあと、自分の表情や行動が変わる場面がありましたか？", "笑顔を見て笑う、驚いた顔を見て止まるなど、見えたことを残します。"],
  ["人との関わり", "🆘", "困ったり不安になったとき、いつもと違う人にも助けを求める場面がありましたか？", "誰にどう近づいたか、声や視線も含めて見ます。"],
];

const EXTRA_PLAY = [
  ["遊び・興味・身体の使い方", "🧱", "積む・重ねる・並べる遊びで、自分なりのやり方が見られましたか？", "見本通りかではなく、どんな並べ方や試し方だったかを残します。"],
  ["遊び・興味・身体の使い方", "🕳️", "穴に入れる・通す・はめる遊びで、何度か試す場面がありましたか？", "成功より、どう試していたかを見ます。"],
  ["遊び・興味・身体の使い方", "📤", "容器から物を全部出す、また戻すなどの遊びがありましたか？", "順番、繰り返し、途中で変わったことなどを残します。"],
  ["遊び・興味・身体の使い方", "🎨", "描く・ちぎる・貼るなど、手を使って素材に働きかける場面がありましたか？", "何を使い、どんな動きをしたかを見ます。"],
  ["遊び・興味・身体の使い方", "🥄", "スプーンや道具を、遊びや生活の中で自分なりに使う場面がありましたか？", "正しい使い方かではなく、どう持ち、どう使ったかを残します。"],
  ["遊び・興味・身体の使い方", "🧸", "人形や物に食べさせる・寝かせるなど、見立てる遊びがありましたか？", "何を何に見立て、どんな動きをしたかを残します。"],
  ["遊び・興味・身体の使い方", "🚗", "車や物を動かしながら、自分なりの流れや物語が続く場面がありましたか？", "言葉がなくても、動きのつながりを見ます。"],
  ["遊び・興味・身体の使い方", "🔔", "押す・引く・たたくと変化が起きる遊びを、繰り返し確かめる場面がありましたか？", "何をすると何が起きるか、どう繰り返したかを残します。"],
  ["遊び・興味・身体の使い方", "🧩", "うまくいかないとき、向きを変える・別の方法を試す場面がありましたか？", "できたかより、試し方の変化を見ます。"],
  ["遊び・興味・身体の使い方", "📚", "好きな絵やページを、自分から何度も見る場面がありましたか？", "何を選び、どう見ていたかを残します。"],
  ["遊び・興味・身体の使い方", "⚽", "ボールを転がす・投げる・追いかけるなどの動きがありましたか？", "相手の有無、方向、繰り返しなども見ます。"],
  ["遊び・興味・身体の使い方", "🪜", "段差や階段で、上る・下りる・止まるなどの場面がありましたか？", "手すりや大人の手を使ったかも含めて残します。"],
  ["遊び・興味・身体の使い方", "🧍", "しゃがむ・立つ・またぐなど、姿勢を大きく変える場面がありましたか？", "どんな場面で、どんな動きをしたかを残します。"],
  ["遊び・興味・身体の使い方", "🏃‍➡️", "行きたい場所へ急いで歩く・走るなど、自分から移動する場面がありましたか？", "目的の場所や物も一緒に残します。"],
  ["遊び・興味・身体の使い方", "🪑", "椅子や低い遊具に、自分で上る・降りる場面がありましたか？", "大人の手助けの有無も含め、見えた動きを残します。"],
  ["遊び・興味・身体の使い方", "🤏", "小さな物を指先でつまむ・拾う・渡す場面がありましたか？", "何をどう持ったかをそのまま残します。"],
  ["遊び・興味・身体の使い方", "👐", "両手を別々に使う場面がありましたか？", "片手で持ち、もう片手で動かすなど、具体的な動きを残します。"],
  ["遊び・興味・身体の使い方", "🦶", "足の裏やつま先を使って、踏む・蹴る・背伸びする場面がありましたか？", "どんな姿勢や遊びだったかを残します。"],
  ["遊び・興味・身体の使い方", "🌊", "水・砂・粘土などで、同じ感触を何度も確かめる場面がありましたか？", "触る、避ける、道具を使うなどの違いも見ます。"],
  ["遊び・興味・身体の使い方", "🔦", "光・影・回る物・動く物などに、特に長く注目する場面がありましたか？", "何に、どのように注目していたかを残します。"],
];

const EXTRA_DAILY = [
  ["生活場面", "🥣", "食事で、自分から食べる・大人に渡す・もっと欲しいと示す場面がありましたか？", "食べた量の評価ではなく、食事中のやりとりを残します。"],
  ["生活場面", "🥤", "飲み物が欲しい・もういらないを、何らかの形で伝えましたか？", "声、手、視線、物を持ってくるなどを見ます。"],
  ["生活場面", "🧥", "着替えのとき、自分から手や足を動かす・逃げる・待つなどの反応がありましたか？", "協力できたかではなく、実際の反応を残します。"],
  ["生活場面", "🧼", "手洗い・歯みがき・おむつ替えなど、いつもの生活動作で印象に残った反応がありましたか？", "何を嫌がった、何ならできたなど具体的に残します。"],
  ["生活場面", "😴", "眠くなったとき、いつも見られるサインや行動がありましたか？", "目をこする、抱っこを求める、動きが変わるなどを残します。"],
  ["生活場面", "🌅", "起きた直後や朝の支度で、いつもと違う様子がありましたか？", "機嫌、動き、声、食事などの違いを残します。"],
  ["場面による違い・頻度", "🚪", "家を出る・帰るなどの切り替えで、今日はどんな様子でしたか？", "すぐ動いた、待った、泣いた、別のことを始めたなどを残します。"],
  ["場面による違い・頻度", "👋", "保護者と離れるとき、また会ったとき、どんな反応がありましたか？", "泣く・切り替える・近づく・笑うなど、そのまま残します。"],
  ["場面による違い・頻度", "🏠", "家と外、家族とそれ以外などで、反応が違うと感じた場面がありましたか？", "どの場面で何が違ったかを具体的に残します。"],
  ["場面による違い・頻度", "👥", "人が多い場所と少ない場所で、行動や表情に違いがありましたか？", "落ち着く、動き回る、固まるなど、見えた違いを残します。"],
  ["場面による違い・頻度", "🔊", "大きな音・初めての場所・いつもと違う環境で、どんな反応がありましたか？", "嫌がる、気にしない、近づくなどを残します。"],
  ["場面による違い・頻度", "⏳", "待つ必要がある場面で、今日はどんなふうに過ごしましたか？", "待った、別の物で遊んだ、強く訴えたなどを残します。"],
  ["場面による違い・頻度", "😣", "思い通りにならなかったとき、どんな反応があり、そのあとどう戻りましたか？", "泣く、怒る、助けを求める、別の遊びに移るなどを残します。"],
  ["場面による違い・頻度", "🤲", "困ったとき、大人の助けを受け入れる・拒む・自分で続けるなどの様子がありましたか？", "その場面と反応を残します。"],
  ["新しく見られたこと・増えたこと", "✨", "今日、初めて見た行動や声がありましたか？", "小さなことでも、初めてなら日付と一緒に残します。"],
  ["新しく見られたこと・増えたこと", "📈", "最近、前より増えたと感じる行動や声がありましたか？", "何が、どんな場面で増えたと感じたかを残します。"],
  ["新しく見られたこと・増えたこと", "🔁", "最近、前は少なかったのに繰り返すようになったことがありますか？", "行動、声、遊びなど、変化した内容を残します。"],
  ["気になった出来事", "❓", "今日、『これってどうなんだろう』と引っかかった場面がありましたか？", "結論を出さず、起きたことだけ先に残して大丈夫です。"],
  ["気になった出来事", "📍", "同じ気になることが、特定の場所や時間に出やすいと感じましたか？", "場所、時間、その前後の出来事を覚えていれば残します。"],
  ["気になった出来事", "🗒️", "次に保健師さんや医師、園の先生に具体的に聞いてみたいことがありましたか？", "質問そのものを、そのままメモして大丈夫です。"],
];

function makeExtra(startId, group, items) {
  return items.map(([tag, emoji, text, hint], index) => ({
    id: startId + index,
    group,
    tag,
    emoji,
    text,
    hint,
  }));
}

const QUESTIONS = [
  ...LEGACY_QUESTIONS,
  ...makeExtra(31, "やりとり・ことば", EXTRA_COMMUNICATION),
  ...makeExtra(51, "遊び・動き", EXTRA_PLAY),
  ...makeExtra(71, "生活・いつもとの違い", EXTRA_DAILY),
];

const GROUPS = [
  QUESTIONS.filter((q) => q.group === "やりとり・ことば"),
  QUESTIONS.filter((q) => q.group === "遊び・動き"),
  QUESTIONS.filter((q) => q.group === "生活・いつもとの違い"),
];

const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [String(q.id), q]));
const REPORT_TAGS = [
  "ことば・発声",
  "言葉の理解・やりとり",
  "身振り・非言語での意思表示",
  "人との関わり",
  "遊び・興味・身体の使い方",
  "生活場面",
  "場面による違い・頻度",
  "新しく見られたこと・増えたこと",
  "気になった出来事",
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
function dayIndexForKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const serial = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return ((serial % 30) + 30) % 30;
}
function getQs(key) {
  const index = dayIndexForKey(key);
  return GROUPS.map((group) => group[index]);
}
function questionForAnswer(answer, fallback) {
  if (answer?.questionId != null) {
    const found = QUESTION_BY_ID[String(answer.questionId)];
    if (found) return found;
  }
  return fallback || null;
}
function resolvedAnswerRows(rec, key) {
  const fallback = getQs(key);
  return (rec?.answers || []).map((answer, index) => ({
    answer,
    question: questionForAnswer(answer, fallback[index]),
  })).filter((row) => row.question);
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
  const rows = resolvedAnswerRows(rec, dk);
  const [photo, setPhoto] = useState(rec.photo || null);
  const [notes, setNotes] = useState({ observation: rec.observation || "", interpretation: rec.interpretation || "", concern: rec.concern || "" });
  const [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return; setBusy(true);
    try { const img = await compress(file); setPhoto(img); const next = { ...records, [dk]: { ...records[dk], photo: img } }; setRecords(next); save(next); }
    finally { setBusy(false); }
  }
  function removePhoto() { const copy = { ...records[dk] }; delete copy.photo; const next = { ...records, [dk]: copy }; setPhoto(null); setRecords(next); save(next); }
  function saveNotes() { const next = { ...records, [dk]: { ...records[dk], ...notes } }; setRecords(next); save(next); setSaved(true); setTimeout(() => setSaved(false), 1500); }
  return <Modal onClose={onClose}>
    <MHead title={`${dateLabel(dk)}の記録`} onClose={onClose} />
    {photo ? <div style={{ position: "relative", marginBottom: 16 }}><img src={photo} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "cover", maxHeight: 220 }} /><button onClick={removePhoto} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 30, height: 30 }}>✕</button></div> :
      <label style={{ display: "block", border: "2px dashed #e8c0c8", borderRadius: 14, padding: 18, textAlign: "center", color: "#9b6b7a", fontSize: 13, background: "#fdf0f2", cursor: "pointer", marginBottom: 18 }}>{busy ? "読み込み中…" : "📷 今日の一枚を追加"}<input type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} /></label>}
    <div style={{ marginBottom: 20 }}>
      {rows.length ? rows.map(({ question, answer }) => <div key={`${question.id}-${answer.type}`} style={{ borderLeft: "3px solid #e8c0c8", paddingLeft: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#9b6b7a", marginBottom: 3 }}>{question.group} ／ {question.tag}</div>
        <div style={{ fontSize: 13, color: "#3a2830", marginBottom: 4 }}>{question.emoji} {question.text}</div>
        <div style={{ fontSize: 12, color: "#80636d" }}>→ {LABELS[answer.type] || answer.text || "記録あり"}</div>
      </div>) : <p style={{ fontSize: 13, color: "#a89098" }}>この日の3択回答はありません。</p>}
    </div>
    <NoteFields value={notes} onChange={setNotes} compact />
    <button style={BTN_DARK} onClick={saveNotes}>{saved ? "保存しました ✓" : "この日のメモを保存"}</button>
  </Modal>;
}
function reportText(selected, records) {
  const keys = [...selected].sort(); if (!keys.length) return "";
  const lines = [
    "きづきカレンダー　相談用メモ",
    `対象期間：${dateLabel(keys[0])} ～ ${dateLabel(keys[keys.length - 1])}`,
    `記録日数：${keys.length}日`,
    "",
    "※このメモは家庭での観察記録です。発達の判定・診断結果ではありません。",
    "",
    "【気になったこと・相談したいこと】",
  ];
  const concerns = keys.flatMap((k) => records[k]?.concern?.trim() ? [`${dateLabel(k)}：${records[k].concern.trim()}`] : []);
  lines.push(...(concerns.length ? concerns : ["記録なし"]));

  lines.push("", "【家庭で観察した具体的な出来事】");
  keys.forEach((k) => {
    const rec = records[k] || {};
    if (rec.observation?.trim()) lines.push(`${dateLabel(k)}：${rec.observation.trim()}`);
  });
  if (!keys.some((k) => records[k]?.observation?.trim())) lines.push("自由記録なし");

  lines.push("", "【質問から残った観察（領域別）】");
  REPORT_TAGS.forEach((tag) => {
    const rows = [];
    keys.forEach((k) => {
      resolvedAnswerRows(records[k], k).forEach(({ question, answer }) => {
        if (question.tag === tag) rows.push(`${dateLabel(k)}：${question.text} → ${LABELS[answer.type] || answer.text || "記録あり"}`);
      });
    });
    if (rows.length) {
      lines.push(`＜${tag}＞`);
      rows.forEach((row) => lines.push(`・${row}`));
    }
  });

  lines.push("", "【保護者の受け止め・考え】");
  const interpretations = keys.flatMap((k) => records[k]?.interpretation?.trim() ? [`${dateLabel(k)}：${records[k].interpretation.trim()}`] : []);
  lines.push(...(interpretations.length ? interpretations : ["記録なし"]));
  return lines.join("\n");
}
function ConsultationReport({ selected, records, onClose }) {
  const text = reportText(selected, records); const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); document.body.removeChild(area);
    }
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  }
  function printReport() {
    const w = window.open("", "_blank"); if (!w) return;
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(`<html><head><meta charset="utf-8"><title>きづきカレンダー 相談用メモ</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;padding:32px;line-height:1.7;color:#222}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head><body><pre>${escaped}</pre></body></html>`);
    w.document.close(); w.focus(); w.print();
  }
  return <Modal onClose={onClose}>
    <MHead title="相談に持っていくメモ" onClose={onClose} />
    <div style={{ background: "#f8f5f6", borderRadius: 14, padding: 14, fontSize: 12, color: "#80636d", lineHeight: 1.7, marginBottom: 16 }}>選んだ日の記録を、観察事実と保護者の考えを分け、質問は相談レポート用の内部タグで整理しています。発達判定はしていません。</div>
    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Zen Maru Gothic',sans-serif", fontSize: 13, lineHeight: 1.7, color: "#3a2830", background: "#fffdfd", border: "1px solid #eee2e5", borderRadius: 12, padding: 14, maxHeight: "46vh", overflowY: "auto" }}>{text}</pre>
    <button style={BTN_DARK} onClick={copy}>{copied ? "コピーしました ✓" : "メモをコピー"}</button>
    <button style={BTN_SOFT} onClick={printReport}>印刷・PDF保存</button>
    <p style={{ fontSize: 11, color: "#a89098", lineHeight: 1.6, marginTop: 12 }}>次段階では、この選択記録だけをAIへ渡し、「よく見られた様子・場面の違い・前との変化」を整理します。</p>
  </Modal>;
}
function CalModal({ records, setRecords, onClose, startSelection = false }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [dayView, setDayView] = useState(null);
  const [selectionMode, setSelectionMode] = useState(startSelection);
  const [selected, setSelected] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const yr = viewDate.getFullYear(), mo = viewDate.getMonth(), firstDay = new Date(yr, mo, 1).getDay(), lastDay = new Date(yr, mo + 1, 0).getDate(), prefix = `${yr}-${String(mo + 1).padStart(2, "0")}`;
  if (dayView) return <DayModal dk={dayView} rec={records[dayView]} records={records} setRecords={setRecords} onClose={() => setDayView(null)} />;
  if (showReport) return <ConsultationReport selected={selected} records={records} onClose={() => setShowReport(false)} />;
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: lastDay }, (_, i) => i + 1));
  const monthRecordKeys = Object.keys(records).filter((k) => k.startsWith(prefix) && records[k]?.completed).sort();
  const allMonthSelected = monthRecordKeys.length > 0 && monthRecordKeys.every((k) => selected.includes(k));

  function toggle(k) {
    if (!records[k]?.completed) return;
    setSelected((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);
  }
  function changeMonth(delta) { setViewDate(new Date(yr, mo + delta, 1)); }
  function selectMonth() {
    setSelected((prev) => Array.from(new Set([...prev, ...monthRecordKeys])));
  }
  function unselectMonth() {
    const monthSet = new Set(monthRecordKeys);
    setSelected((prev) => prev.filter((k) => !monthSet.has(k)));
  }

  return <Modal onClose={onClose}>
    <MHead title={`${yr}年${mo + 1}月`} onClose={onClose} left={<button onClick={() => changeMonth(-1)} style={NAV_BTN}>‹</button>} />
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -54, marginBottom: 18, paddingRight: 36 }}><button onClick={() => changeMonth(1)} style={NAV_BTN}>›</button></div>
    {selectionMode && <>
      <div style={{ background: "#fdf0f2", color: "#80636d", borderRadius: 12, padding: 12, fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>相談に持っていきたい記録の日をタップしてください。月をまたいで何日でも選べます。</div>
      <button style={{ ...BTN_SOFT, marginTop: 0, marginBottom: 10, opacity: monthRecordKeys.length ? 1 : 0.45 }} disabled={!monthRecordKeys.length} onClick={allMonthSelected ? unselectMonth : selectMonth}>
        {allMonthSelected ? `この月の${monthRecordKeys.length}日を選択から外す` : `この月の記録を全部選ぶ（${monthRecordKeys.length}日）`}
      </button>
    </>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 12 }}>
      {["日", "月", "火", "水", "木", "金", "土"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#b8a0a8", padding: "4px 0" }}>{d}</div>)}
      {cells.map((d, i) => {
        if (!d) return <div key={`e${i}`} />;
        const k = `${prefix}-${String(d).padStart(2, "0")}`, done = !!records[k]?.completed, isSelected = selected.includes(k), isToday = k === tkey();
        return <button key={k} onClick={() => { if (!done) return; if (selectionMode) toggle(k); else setDayView(k); }} style={{ border: isSelected ? "2px solid #c4788a" : "none", textAlign: "center", fontSize: 13, padding: "8px 2px", borderRadius: 9, color: done ? "#7a4a58" : "#b9adb1", background: isSelected ? "#f6dfe5" : done ? "#fdf0f2" : "transparent", fontWeight: done ? 600 : 400, cursor: done ? "pointer" : "default", outline: isToday && !isSelected ? "2px solid #e8c0c8" : "none", outlineOffset: -2 }}>
          {d}{done && <div style={{ width: 5, height: 5, borderRadius: "50%", margin: "3px auto 0", background: records[k].concern ? "#9b6b7a" : "#c4788a" }} />}
        </button>;
      })}
    </div>
    {selectionMode ? <>
      <div style={{ fontSize: 13, color: "#80636d", textAlign: "center", margin: "16px 0 8px" }}>{selected.length}日 選択中</div>
      <button style={{ ...BTN_DARK, opacity: selected.length ? 1 : 0.4 }} disabled={!selected.length} onClick={() => setShowReport(true)}>相談メモを作る</button>
      {selected.length > 0 && <button style={BTN_GHOST} onClick={() => setSelected([])}>選択を全部外す</button>}
      <button style={BTN_GHOST} onClick={() => { setSelectionMode(false); setSelected([]); }}>選択をやめる</button>
    </> : <button style={BTN_SOFT} onClick={() => setSelectionMode(true)}>📝 相談用の記録を選ぶ</button>}
  </Modal>;
}

export default function App() {
  const tk = tkey(), todayQs = getQs(tk), now = new Date();
  const [agreed, setAgreed] = useState(true);
  const [screen, setScreen] = useState("home");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef([]);
  const [resp, setResp] = useState("");
  const [notes, setNotes] = useState({ observation: "", interpretation: "", concern: "" });
  const [summary, setSummary] = useState("");
  const [records, setRecords] = useState({});
  const [showCal, setShowCal] = useState(false);
  const [selectOnOpen, setSelectOnOpen] = useState(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => {
    if (!localStorage.getItem("kizuki_agreed")) setAgreed(false);
    const all = load();
    setRecords(all);
    const today = all[tk];
    if (today?.completed) {
      setAnswers(today.answers || []);
      answersRef.current = today.answers || [];
      setNotes({ observation: today.observation || "", interpretation: today.interpretation || "", concern: today.concern || "" });
      setSummary(today.summary || "");
      setScreen("done");
    }
  }, [tk]);

  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthCount = Object.keys(records).filter((k) => k.startsWith(monthPrefix) && records[k]?.completed).length;

  function resetTodayFlow() {
    setQi(0); setAnswers([]); answersRef.current = []; setResp("");
    setNotes({ observation: "", interpretation: "", concern: "" });
    setSummary(""); setScreen("q");
  }
  function answer(type) {
    const q = todayQs[qi];
    const next = [...answersRef.current, { questionId: q.id, type, text: LABELS[type], tag: q.tag }];
    answersRef.current = next; setAnswers(next); setResp(RESPONSE[type]); setScreen("resp");
  }
  function next() {
    if (qi + 1 >= todayQs.length) setScreen("notes");
    else { setQi((v) => v + 1); setResp(""); setScreen("q"); }
  }
  function finish() {
    const s = makeDailySummary(notes);
    const nextRecords = {
      ...records,
      [tk]: {
        ...(records[tk] || {}),
        completed: true,
        answers: answersRef.current,
        observation: notes.observation.trim(),
        interpretation: notes.interpretation.trim(),
        concern: notes.concern.trim(),
        summary: s,
      },
    };
    setRecords(nextRecords); save(nextRecords); setSummary(s); setScreen("summary");
  }
  function openCalendar(selection = false) { setSelectOnOpen(selection); setShowCal(true); }

  return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Shippori+Mincho:wght@400;600&display=swap');*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;background:#faf5f6}.app{font-family:'Zen Maru Gothic',sans-serif;min-height:100vh;background:#faf5f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.card-anim{animation:fu .35s ease}button:disabled{cursor:default}`}</style>
    <div className="app">
      {!agreed && <DisclaimerModal onAgree={() => { localStorage.setItem("kizuki_agreed", "1"); setAgreed(true); }} />}
      {showCal && <CalModal records={records} setRecords={setRecords} startSelection={selectOnOpen} onClose={() => setShowCal(false)} />}

      {screen === "home" && <div style={CARD} className="card-anim">
        <div style={{ fontSize: 52, textAlign: "center", marginBottom: 14 }}>🌱</div>
        <p style={{ fontSize: 12, color: "#a89098", textAlign: "center", marginBottom: 4 }}>「様子を見ましょう」の、その後を記録する</p>
        <h1 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 25, fontWeight: 600, color: "#3a2830", textAlign: "center", lineHeight: 1.6, margin: "0 0 16px" }}>きづきカレンダー</h1>
        <div style={{ ...INFO_BOX, textAlign: "center" }}>今月は <strong style={{ fontSize: 22, color: "#c4788a" }}>{monthCount}日</strong> 記録があります。<br /><span style={{ fontSize: 12, color: "#80636d" }}>30日で90の問いを一巡。毎日でなくても、気づいた日に残せば大丈夫です。</span></div>
        <button style={BTN_DARK} onClick={resetTodayFlow}>今日の記録をはじめる</button>
        <button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 カレンダーを見る</button>
        <button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談に持っていく記録を選ぶ</button>
      </div>}

      {screen === "done" && <div style={{ ...CARD, textAlign: "center" }} className="card-anim">
        <div style={{ fontSize: 46, marginBottom: 12 }}>🌿</div>
        <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, color: "#3a2830", marginBottom: 12 }}>今日は記録済みです</h2>
        <div style={INFO_BOX}>{summary || "今日の記録が残っています。"}</div>
        <button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 記録を見返す</button>
        <button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談用の記録を選ぶ</button>
        <button style={BTN_GHOST} onClick={resetTodayFlow}>今日の記録をやり直す</button>
      </div>}

      {screen === "q" && <div style={CARD} className="card-anim">
        <div style={{ display: "inline-block", background: "#fdf0f2", color: "#80636d", fontSize: 12, padding: "4px 12px", borderRadius: 20, marginBottom: 16 }}>{now.getMonth() + 1}月{now.getDate()}日</div>
        <div style={{ height: 4, background: "#f0e8ea", borderRadius: 4, marginBottom: 24, overflow: "hidden" }}><div style={{ height: "100%", background: "#c4788a", width: `${(qi / todayQs.length) * 100}%` }} /></div>
        <div style={{ fontSize: 11, color: "#a89098", marginBottom: 8 }}>{todayQs[qi].group} ／ {todayQs[qi].tag}　{qi + 1} / 3</div>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{todayQs[qi].emoji}</div>
        <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 18, color: "#3a2830", lineHeight: 1.7, marginBottom: 8 }}>{todayQs[qi].text}</p>
        <p style={{ fontSize: 12, color: "#a89098", lineHeight: 1.6, marginBottom: 26 }}>{todayQs[qi].hint}</p>
        <button style={BTN_YES} onClick={() => answer("yes")}>あった</button>
        <button style={BTN_KINDA} onClick={() => answer("kinda")}>ちょっとだけ</button>
        <button style={BTN_NO} onClick={() => answer("no")}>今日はなかった</button>
      </div>}

      {screen === "resp" && <div style={CARD} className="card-anim">
        <div style={{ fontSize: 12, color: "#a89098", marginBottom: 12 }}>{qi + 1} / 3</div>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{todayQs[qi].emoji}</div>
        <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 15, color: "#3a2830", lineHeight: 1.7, marginBottom: 8 }}>{todayQs[qi].text}</p>
        <p style={{ fontSize: 13, color: "#80636d", marginBottom: 16 }}>→ {LABELS[answers[answers.length - 1]?.type]}</p>
        <div style={{ background: "#fdf0f4", borderLeft: "3px solid #c4788a", borderRadius: "0 14px 14px 14px", padding: "17px 18px", marginBottom: 22, fontSize: 14, color: "#4a3038", lineHeight: 1.8 }}>{resp}</div>
        <button style={BTN_DARK} onClick={next}>{qi + 1 >= 3 ? "今日あったことも残す" : "次へ"}</button>
      </div>}

      {screen === "notes" && <div style={CARD} className="card-anim">
        <div style={{ fontSize: 12, color: "#a89098", marginBottom: 6 }}>3つの問いに答えました</div>
        <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 19, color: "#3a2830", marginBottom: 8 }}>今日あったことを残す</h2>
        <p style={{ fontSize: 12, color: "#80636d", lineHeight: 1.6, marginBottom: 18 }}>全部書かなくて大丈夫。料理中なら、キーボードの🎙からそのまま話して入力できます。</p>
        <NoteFields value={notes} onChange={setNotes} />
        <button style={BTN_DARK} onClick={finish}>今日の記録を保存</button>
        <button style={BTN_GHOST} onClick={finish}>メモなしで保存</button>
      </div>}

      {screen === "summary" && <div style={{ ...CARD, textAlign: "center" }} className="card-anim">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 20, color: "#3a2830", marginBottom: 14 }}>今日の様子を残せました</h2>
        <div style={INFO_BOX}>{summary}</div>
        <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 16, color: "#80636d", lineHeight: 1.7, marginBottom: 18 }}>「私、ちゃんと様子を見られてる」<br />そう思える記録を少しずつ。</p>
        <button style={BTN_SOFT} onClick={() => openCalendar(false)}>📅 カレンダーを見る</button>
        <button style={BTN_SOFT} onClick={() => openCalendar(true)}>📝 相談に持っていく記録を選ぶ</button>
        <button style={BTN_GHOST} onClick={() => setScreen("home")}>トップに戻る</button>
      </div>}
    </div>
  </>;
}
