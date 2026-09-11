export const CURATED_ARTICLES = [
  {
    id: "language",
    title: "ことばの心配（ことばが遅い）",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/kotoba.pdf",
    keywords: ["ことば", "言葉", "発語", "単語", "しゃべ", "話す", "おしゃべり", "指さし", "指差し"],
  },
  {
    id: "tantrum",
    title: "イヤイヤ・かんしゃく",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/iyaiya.pdf",
    keywords: ["イヤ", "いや", "かんしゃく", "癇癪", "泣", "怒", "大泣き", "切り替", "おしまい", "帰りたく", "自分で"],
  },
  {
    id: "rhythm",
    title: "生活リズムについて",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/rhythm.pdf",
    keywords: ["寝", "ねんね", "睡眠", "昼寝", "夜泣", "眠", "起き", "朝", "生活リズム"],
  },
  {
    id: "toilet",
    title: "トイレトレーニングについて",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/toilet.pdf",
    keywords: ["トイレ", "おしっこ", "うんち", "おむつ", "オムツ", "排泄"],
  },
  {
    id: "friends",
    title: "友達とうまく遊べない",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/tomodachi.pdf",
    keywords: ["友達", "お友達", "ほかの子", "他の子", "取り合", "貸して", "かして", "いれて", "入れて", "一緒に遊"],
  },
  {
    id: "play",
    title: "発達をうながす遊び（幼児期）",
    source: "横浜市港北区",
    url: "https://www.city.yokohama.lg.jp/kohoku/kosodate_kyoiku/kosodateshien/kosodateadvice.files/hattatu_youji.pdf",
    keywords: ["遊び", "積み木", "ブロック", "ごっこ", "まね", "真似", "絵本", "おもちゃ"],
  },
  {
    id: "food",
    title: "食事の悩みQ&A〈栄養士監修〉",
    source: "横浜市港南区",
    url: "https://www.city.yokohama.lg.jp/konan/kosodate_kyoiku/kosodateshien/kosodatechishiki/syokuzinonayami.html",
    keywords: ["食べ", "ごはん", "食事", "好き嫌い", "偏食", "遊び食べ", "かむ", "噛む", "丸のみ", "スプーン"],
  },
];

function normalizeText(value) {
  return String(value || "").normalize("NFKC").toLowerCase();
}

export function relatedArticles(text, limit = 3) {
  const normalized = normalizeText(text);
  if (!normalized.trim()) return [];

  return CURATED_ARTICLES
    .map((article, order) => {
      const score = article.keywords.reduce((total, keyword) => {
        return total + (normalized.includes(normalizeText(keyword)) ? 1 : 0);
      }, 0);
      return { article, score, order };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, Math.max(0, limit))
    .map(({ article }) => article);
}
