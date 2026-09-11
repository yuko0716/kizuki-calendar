import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ANSWER_LABELS,
  REPORT_FIELD_LABELS,
  ageInYearsMonths,
  answerForQuestion,
  dateKey,
  fallbackSummary,
  monthIndex,
  monthParts,
  questionsForDate,
  recordQuestions,
  recordsForMonth,
  selectedRecordsForReport,
} from "./core.js";
import { relatedArticles } from "./resources.js";
import {
  consultationReportText,
  recordMemoItems,
  recordObservation,
  recordSearchText,
} from "./report.js";
import {
  CONSENT_KEY,
  compressPhoto,
  downloadBackup,
  loadRecords,
  readBackup,
  saveRecords,
} from "./storage.js";
import "./styles.css";

const DOMAIN_LABELS = {
  interaction: "やりとり",
  play: "遊び・動き",
  context: "いつもとのちがい",
};

function Modal({ title, onClose, children, persistent = false, className = "" }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector("button, input, textarea, a, summary")?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !persistent) closeRef.current();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], summary")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [persistent]);

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (!persistent && event.target === event.currentTarget) onClose();
      }}
    >
      <section ref={dialogRef} className={`modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-head">
          <h2 id={titleId}>{title}</h2>
          {!persistent && (
            <button className="icon-button" type="button" aria-label="閉じる" onClick={onClose}>×</button>
          )}
        </header>
        {children}
      </section>
    </div>
  );
}

function ReportField({ id, label, value = "", onChange }) {
  return (
    <label htmlFor={`report-${id}`}>
      {label} <span className="small">（書けるときだけ）</span>
      <textarea id={`report-${id}`} value={value} onChange={(event) => onChange(event.target.value)} maxLength="400" />
    </label>
  );
}

function RelatedArticles({ text }) {
  const articles = useMemo(() => relatedArticles(text, 3), [text]);
  if (!articles.length) return null;

  return (
    <section className="report-summary" aria-labelledby="related-articles-title">
      <h2 id="related-articles-title">今日の記録に近いテーマの記事</h2>
      <p className="small">診断や判定ではありません。今日の記録に出てきた言葉から、あらかじめ確認して登録した記事だけを出しています。</p>
      {articles.map((article) => (
        <div className="report-day" key={article.id}>
          <p><strong>{article.title}</strong></p>
          <p className="small">{article.source}</p>
          <a href={article.url} target="_blank" rel="noreferrer">記事を開く ↗</a>
        </div>
      ))}
      <p className="small">リンクを開くまで、今日の記録内容がリンク先へ送られることはありません。</p>
    </section>
  );
}

function MemoItems({ record }) {
  const items = recordMemoItems(record);
  if (!items.length) return null;
  return (
    <section className="memo-display" aria-label="その日のメモ">
      {items.map((item) => (
        <div key={item.key}>
          <h2>{item.label}</h2>
          <p>{item.value}</p>
        </div>
      ))}
    </section>
  );
}

function ConsultationReport({ records, year, month, onClose }) {
  const [details, setDetails] = useState({});
  const [status, setStatus] = useState("");
  const entries = recordsForMonth(records, year, month);
  const [selectedKeys, setSelectedKeys] = useState(() => entries.slice(-7).map(([key]) => key));
  const selectedEntries = selectedRecordsForReport(records, year, month, selectedKeys);
  const updateDetail = (key, value) => setDetails((current) => ({ ...current, [key]: value }));
  const toggleRecord = (key) => {
    setSelectedKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };
  const summaryItems = Object.entries(REPORT_FIELD_LABELS).flatMap(([key, label]) => {
    const value = String(details[key] || "").trim();
    if (!value) return [];
    const age = key === "birthDate" ? ageInYearsMonths(value) : "";
    return [{ key, label, value: `${value}${age ? `（今 ${age}）` : ""}` }];
  });

  const shareReport = async () => {
    const text = consultationReportText(records, year, month, details, undefined, selectedKeys);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${year}年${month + 1}月 相談に持っていくメモ`, text });
        setStatus("送る画面を開きました。送り先をえらんでください。");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setStatus("メモをコピーしました。");
      } else {
        throw new Error("この端末ではメモを送れませんでした。");
      }
    } catch (error) {
      if (error.name !== "AbortError") setStatus(error.message || "うまく送れませんでした。");
    }
  };

  return (
    <Modal title={`${year}年${month + 1}月 相談に持っていくメモ`} onClose={onClose} className="consultation-report">
      <p className="report-lead">次の相談で話したいことを、先にまとめておけます。書けるところだけでOKです。</p>

      <fieldset className="report-picker">
        <legend>いっしょに入れる日の記録</legend>
        <p className="small">まず最近7日分にチェックがついています。見せたい日だけにできます。</p>
        <div className="report-picker-actions">
          <button type="button" onClick={() => setSelectedKeys(entries.map(([key]) => key))} disabled={selectedKeys.length === entries.length}>全部えらぶ</button>
          <button type="button" onClick={() => setSelectedKeys([])} disabled={!selectedKeys.length}>いったん外す</button>
        </div>
        <div className="report-date-list">
          {entries.map(([key]) => (
            <label className={selectedKeys.includes(key) ? "selected" : ""} key={key}>
              <input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => toggleRecord(key)} />
              <span>{key}</span>
            </label>
          ))}
        </div>
        <p className="report-count" aria-live="polite">{entries.length}日分のうち {selectedEntries.length}日分をえらんでいます</p>
        {selectedEntries.length > 10 && <p className="report-warning" role="note">10日分より多いと長くなります。特に見せたい日にしぼると読みやすいです。</p>}
        {!selectedEntries.length && <p className="report-warning" role="alert">1日以上えらんでください。</p>}
      </fieldset>

      <div className="report-form">
        <h2>お子さんのこと</h2>
        <label htmlFor="report-child">呼び名 <span className="small">（書かなくてもOK）</span></label>
        <input id="report-child" value={details.childName || ""} onChange={(event) => updateDetail("childName", event.target.value)} maxLength="30" />
        <label htmlFor="report-birth">生まれた日 <span className="small">（書かなくてもOK）</span></label>
        <input id="report-birth" type="date" value={details.birthDate || ""} max={dateKey()} onChange={(event) => updateDetail("birthDate", event.target.value)} />

        <h2>いちばん伝えたいこと</h2>
        <ReportField id="main-concern" label="いちばん聞きたいこと" value={details.mainConcern} onChange={(value) => updateDetail("mainConcern", value)} />
        <ReportField id="concern-since" label="いつごろから気になった？" value={details.concernSince} onChange={(value) => updateDetail("concernSince", value)} />
        <ReportField id="contexts" label="どんなときに起きる？" value={details.contexts} onChange={(value) => updateDetail("contexts", value)} />
        <ReportField id="support-wanted" label="相談先で聞きたいこと" value={details.supportWanted} onChange={(value) => updateDetail("supportWanted", value)} />

        <h2>ふだんの様子</h2>
        <ReportField id="communication" label="ことばややりとり" value={details.communication} onChange={(value) => updateDetail("communication", value)} />
        <ReportField id="relationships" label="遊びや人との関わり" value={details.relationships} onChange={(value) => updateDetail("relationships", value)} />
        <ReportField id="body-behavior" label="体の動き・音や光・におい・味・さわり心地など" value={details.bodyBehavior} onChange={(value) => updateDetail("bodyBehavior", value)} />
        <ReportField id="daily-life" label="ごはん・ねんね・トイレ・体の調子" value={details.dailyLife} onChange={(value) => updateDetail("dailyLife", value)} />

        <h2>家でのこと</h2>
        <ReportField id="strengths" label="好きなこと・得意なこと" value={details.strengths} onChange={(value) => updateDetail("strengths", value)} />
        <ReportField id="helps" label="うまくいったこと" value={details.helps} onChange={(value) => updateDetail("helps", value)} />
        <ReportField id="history" label="これまで相談したこと" value={details.history} onChange={(value) => updateDetail("history", value)} />
        <ReportField id="parent-needs" label="家で困っていること" value={details.parentNeeds} onChange={(value) => updateDetail("parentNeeds", value)} />
        <p className="small">ここに書いたことは、この画面を閉じると消えます。住所や学校名、仕事先などは書かないでください。</p>
      </div>

      <section className="report-summary">
        <h2>このまま相談に持っていけます</h2>
        <p><strong>{year}年{month + 1}月</strong>の記録から、<strong>{selectedEntries.length}日分</strong>をえらんでいます。</p>
        {summaryItems.length ? (
          <dl>{summaryItems.map((item) => <div key={item.key}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        ) : (
          <p className="small">上に書いたことが、ここに出ます。</p>
        )}
        <p className="small">これは診断書ではありません。おうちで見たことを、相談先に伝えるためのメモです。</p>
      </section>

      <h2 className="report-appendix-title">えらんだ日の記録</h2>
      <p className="small">毎日3つの質問で記録しています。こたえの数で、お子さんの育ちを決めるものではありません。</p>
      {selectedEntries.map(([key, record]) => {
        const questions = recordQuestions(record, key);
        return (
          <section className="report-day" key={key}>
            <h2>{key}</h2>
            <ul>
              {record.answers?.map((answer, index) => (
                <li key={`${key}-report-${index}`}>
                  <span>{questions[index]?.text || answer.question || "その日の質問"}</span>
                  <strong>{answer.label || ANSWER_LABELS[answer.type] || "こたえた"}</strong>
                </li>
              ))}
            </ul>
            <MemoItems record={record} />
          </section>
        );
      })}
      <p className="small report-photo-note">写真と関連リンクは、このメモには入れません。</p>
      <div className="report-actions">
        <button className="button primary" type="button" disabled={!selectedEntries.length} onClick={shareReport}>送る</button>
        <button className="button secondary" type="button" disabled={!selectedEntries.length} onClick={() => window.print()}>紙にする・PDFにする</button>
        <button className="button ghost" type="button" onClick={onClose}>閉じる</button>
        {status && <p className="status" role="status">{status}</p>}
      </div>
    </Modal>
  );
}

function Consent({ onAccept }) {
  return (
    <Modal title="はじめる前に" onClose={() => {}} persistent>
      <div className="notice">
        <p><strong>きづきカレンダーは、健診のあとや次の相談までに、おうちで気づいたことをのこすためのアプリです。</strong></p>
        <p>「できる・できない」を決めるアプリではありません。気になることがあるときは、病院や保健師さん、子育て相談などに話してください。</p>
        <p>記録と写真は、このスマホやパソコンのブラウザにのこります。家族と同じ端末を使うときは、顔写真や、だれのものか分かる情報を入れすぎないようにしてください。ブラウザのデータを消したり、端末を変えたりすると、記録が消えることがあります。</p>
        <p>今日の記録に近いテーマが見つかったときは、あらかじめ確認して登録した外部の記事を表示します。記録内容そのものを記事のサイトへ送って探すことはしません。</p>
      </div>
      <button className="button primary" type="button" onClick={onAccept}>わかった、はじめる</button>
    </Modal>
  );
}

function RecordDetail({ recordKey, record, onRecords, onClose }) {
  const [status, setStatus] = useState("");
  const questions = recordQuestions(record, recordKey);

  const updatePhoto = async (file) => {
    if (!file) return;
    setStatus("写真を小さくしています…");
    try {
      const photo = await compressPhoto(file);
      const result = onRecords((current) => ({
        ...current,
        [recordKey]: { ...current[recordKey], photo },
      }));
      setStatus(result.ok ? "写真をのこしました。" : result.message);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removePhoto = () => {
    const result = onRecords((current) => ({
      ...current,
      [recordKey]: { ...current[recordKey], photo: null },
    }));
    setStatus(result.ok ? "写真を消しました。" : result.message);
  };

  return (
    <Modal title={`${recordKey} の記録`} onClose={onClose}>
      {record.photo ? (
        <div className="photo-wrap">
          <img src={record.photo} alt={`${recordKey}にのこした写真`} />
          <button className="photo-remove" type="button" onClick={removePhoto}>写真を消す</button>
        </div>
      ) : (
        <label className="photo-input">
          写真を1枚つける
          <input type="file" accept="image/*" onChange={(event) => updatePhoto(event.target.files?.[0])} />
        </label>
      )}
      <p className="small">写真は関連する記事を探すためには使いません。送るときも、写真を入れるか自分でえらべます。</p>
      {status && <p className="status" role="status">{status}</p>}
      <div className="answer-list">
        {record.answers?.map((answer, index) => {
          const question = questions[index];
          return (
            <div key={`${recordKey}-${index}`}>
              <p>{question?.emoji} {question?.text || "その日の質問"}</p>
              <span>{answer.label || ANSWER_LABELS[answer.type] || "こたえた"}</span>
            </div>
          );
        })}
      </div>
      <MemoItems record={record} />
      <h2>今日のまとめ</h2>
      <p className="summary">{record.summary}</p>
      <RelatedArticles text={recordSearchText(record)} />
      <button className="button secondary" type="button" onClick={onClose}>閉じる</button>
    </Modal>
  );
}

function Calendar({ records, onRecords, onClose }) {
  const now = new Date();
  const currentMonthIndex = monthIndex(now);
  const [shownMonthIndex, setShownMonthIndex] = useState(currentMonthIndex);
  const [detailKey, setDetailKey] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [status, setStatus] = useState("");
  const importRef = useRef(null);
  const { year, month } = monthParts(shownMonthIndex);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay();
  const isCurrentMonth = shownMonthIndex >= currentMonthIndex;

  const importBackup = async (file) => {
    if (!file) return;
    try {
      const imported = await readBackup(file);
      const result = onRecords((current) => ({ ...current, ...imported }));
      setStatus(result.ok ? "バックアップを読みこみました。" : result.message);
    } catch (error) {
      setStatus(error.message || "バックアップを読みこめませんでした。");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  return (
    <Modal title="きづきカレンダー" onClose={onClose}>
      <nav className="month-nav" aria-label="見る月">
        <button className="month-button" type="button" onClick={() => setShownMonthIndex((value) => value - 1)}>← 前の月</button>
        <strong aria-live="polite">{year}年{month + 1}月</strong>
        <button className="month-button" type="button" onClick={() => setShownMonthIndex((value) => Math.min(value + 1, currentMonthIndex))} disabled={isCurrentMonth}>次の月 →</button>
      </nav>

      <div className="calendar" role="grid" aria-label={`${year}年${month + 1}月の記録`}>
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => <div className="weekday" role="columnheader" key={day}>{day}</div>)}
        {Array.from({ length: offset }).map((_, index) => <div key={`blank-${index}`} />)}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const key = dateKey(new Date(year, month, day));
          const hasRecord = Boolean(records[key]);
          return (
            <button
              className={`day${hasRecord ? " recorded" : ""}`}
              type="button"
              role="gridcell"
              key={key}
              disabled={!hasRecord}
              aria-label={`${month + 1}月${day}日${hasRecord ? "、記録あり" : "、記録なし"}`}
              onClick={() => hasRecord && setDetailKey(key)}
            >
              {day}{hasRecord && <span aria-hidden="true">•</span>}
            </button>
          );
        })}
      </div>

      <div className="report-entry">
        <h2>相談に持っていくメモ</h2>
        <p className="small">この月の記録から、次の相談で見せるメモを作れます。</p>
        <button className="button primary" type="button" disabled={!recordsForMonth(records, year, month).length} onClick={() => setReportOpen(true)}>メモを作る</button>
      </div>

      <div className="backup-actions">
        <h2>もしものためのバックアップ</h2>
        <p className="small">スマホを変えたときなどに、記録をもどすためのファイルです。相談で見せるものではありません。</p>
        <button className="button secondary" type="button" onClick={() => downloadBackup(records)}>バックアップをのこす</button>
        <button className="button secondary" type="button" onClick={() => importRef.current?.click()}>バックアップを読みこむ</button>
        <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => importBackup(event.target.files?.[0])} />
        {status && <p className="status" role="status">{status}</p>}
      </div>

      {detailKey && records[detailKey] && (
        <RecordDetail recordKey={detailKey} record={records[detailKey]} onRecords={onRecords} onClose={() => setDetailKey(null)} />
      )}
      {reportOpen && <ConsultationReport records={records} year={year} month={month} onClose={() => setReportOpen(false)} />}
    </Modal>
  );
}

export default function App() {
  const today = dateKey();
  const questions = useMemo(() => questionsForDate(today), [today]);
  const [consented, setConsented] = useState(() => localStorage.getItem(CONSENT_KEY) === "accepted");
  const [records, setRecords] = useState(loadRecords);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [observation, setObservation] = useState(() => recordObservation(records[today]));
  const [interpretation, setInterpretation] = useState(() => records[today]?.interpretation || "");
  const [concern, setConcern] = useState(() => records[today]?.concern || "");
  const [screen, setScreen] = useState(() => records[today] ? "done" : "home");
  const [summary, setSummary] = useState(() => records[today]?.summary || "");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [status, setStatus] = useState("");

  const updateRecords = (updater) => {
    const next = updater(records);
    const result = saveRecords(next);
    if (result.ok) setRecords(next);
    return result;
  };

  const acceptConsent = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // 保存できなくても、この画面では使い続けられる。
    }
    setConsented(true);
  };

  const confirmAnswer = () => {
    if (!selectedAnswer) return;
    const question = questions[step];
    const nextAnswers = [...answers, answerForQuestion(question, selectedAnswer)];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);
    if (step < questions.length - 1) setStep((current) => current + 1);
    else setScreen("review");
  };

  const restartToday = () => {
    setStep(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setObservation(recordObservation(records[today]));
    setInterpretation(records[today]?.interpretation || "");
    setConcern(records[today]?.concern || "");
    setIncludePhoto(false);
    setStatus("");
    setScreen("question");
  };

  const finish = () => {
    setStatus("");
    const nextSummary = fallbackSummary(answers);
    const nextRecords = {
      ...records,
      [today]: {
        date: today,
        answers,
        observation: observation.trim(),
        interpretation: interpretation.trim(),
        concern: concern.trim(),
        note: observation.trim(),
        summary: nextSummary,
        summarySource: "fixed",
        photo: records[today]?.photo || null,
      },
    };
    const result = saveRecords(nextRecords);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setRecords(nextRecords);
    setSummary(nextSummary);
    setScreen("done");
  };

  const share = async () => {
    const record = records[today] || { observation, interpretation, concern };
    const memoText = recordMemoItems(record).map((item) => `${item.label}：${item.value}`).join("\n");
    const text = `きづきカレンダー ${today}\n${summary}${memoText ? `\n\n${memoText}` : ""}\n\n※おうちで見たことをのこした記録です。「できる・できない」を決めるものではありません。`;
    try {
      if (navigator.share) {
        const shareData = { title: "きづきカレンダー", text };
        if (includePhoto && records[today]?.photo) {
          const blob = await (await fetch(records[today].photo)).blob();
          const file = new File([blob], `kizuki-${today}.jpg`, { type: blob.type || "image/jpeg" });
          if (!navigator.canShare?.({ files: [file] })) throw new Error("この端末では写真をいっしょに送れません。写真のチェックを外して、文章だけ送ってください。");
          shareData.files = [file];
        }
        await navigator.share(shareData);
        setStatus(shareData.files ? "送る画面を開きました。写真も入っています。" : "送る画面を開きました。文章だけ入っています。");
      } else if (navigator.clipboard) {
        if (includePhoto) throw new Error("この端末では写真をいっしょに送れません。写真のチェックを外してください。");
        await navigator.clipboard.writeText(text);
        setStatus("文章をコピーしました。");
      } else {
        throw new Error("この端末では送れませんでした。");
      }
    } catch (error) {
      if (error.name !== "AbortError") setStatus(error.message || "うまく送れませんでした。");
    }
  };

  return (
    <main className="app">
      <section className="card">
        {screen === "home" && (
          <>
            <div className="hero-icon" aria-hidden="true">🌱</div>
            <p className="eyebrow">「様子を見ましょう」の、そのあとに</p>
            <h1>きづきカレンダー</h1>
            <p><strong>健診のあと、次に相談するまで。</strong> 1日3問で、家で見えた小さな変化をのこすカレンダーです。</p>
            <p className="small">できたかどうかを判定するのではなく、今日のお子さんの様子を思い出すために使います。</p>
            <button className="button primary" type="button" onClick={() => setScreen("question")}>今日の3問をはじめる</button>
            <button className="button ghost" type="button" onClick={() => setCalendarOpen(true)}>これまでの記録を見る</button>
          </>
        )}

        {screen === "question" && (
          <>
            <p className="progress-text">{step + 1} / 3</p>
            <progress value={step + 1} max="3">{step + 1} / 3</progress>
            <p className="eyebrow">{DOMAIN_LABELS[questions[step].domain]}</p>
            <div className="question-emoji" aria-hidden="true">{questions[step].emoji}</div>
            <h1>{questions[step].text}</h1>
            <p className="hint">{questions[step].hint}</p>
            <p id="answer-help" className="answer-help">いちばん近いものを1つえらんでください。</p>
            <div role="group" aria-label="こたえ" aria-describedby="answer-help">
              {Object.entries(ANSWER_LABELS).map(([type, label]) => (
                <button
                  className={`button answer${selectedAnswer === type ? " selected" : ""}`}
                  type="button"
                  key={type}
                  aria-pressed={selectedAnswer === type}
                  onClick={() => setSelectedAnswer(type)}
                >
                  {selectedAnswer === type && <span aria-hidden="true">✓ </span>}{label}
                </button>
              ))}
            </div>
            <button className="button primary confirm-answer" type="button" disabled={!selectedAnswer} onClick={confirmAnswer}>{step === 2 ? "これでメモへ" : "これで次へ"}</button>
          </>
        )}

        {screen === "review" && (
          <>
            <div className="hero-icon" aria-hidden="true">📝</div>
            <h1>今日のことを、もう少しのこす？</h1>
            <p>見たことと、そう思ったことを分けて残せます。何も書かなくても大丈夫です。</p>
            <div className="memo-fields">
              <label htmlFor="observation"><strong>今日あったこと</strong> <span className="small">（なくてもOK）</span></label>
              <p className="small">まずは、見たこと・聞いたことをそのまま。</p>
              <textarea id="observation" maxLength="500" value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="例：公園から帰る声をかけると、地面に座って泣いた" />
              <p className="small">文字を打つのが大変なときは、スマホのキーボードにあるマイクから話して入力してもOKです。</p>

              <details className="optional-memo">
                <summary>思ったこと・気になることも残す</summary>
                <label htmlFor="interpretation"><strong>こうかなと思ったこと</strong> <span className="small">（書きたいときだけ）</span></label>
                <p className="small">見たこととは分けて、「こういう気持ちかな」などを書けます。</p>
                <textarea id="interpretation" maxLength="500" value={interpretation} onChange={(event) => setInterpretation(event.target.value)} placeholder="例：まだ遊びたかったのかなと思った" />

                <label htmlFor="concern"><strong>気になったこと</strong> <span className="small">（書きたいときだけ）</span></label>
                <p className="small">あとで相談したいことや、心配していることがあれば。</p>
                <textarea id="concern" maxLength="500" value={concern} onChange={(event) => setConcern(event.target.value)} placeholder="例：切り替えるときに毎回とても泣くのが気になる" />
              </details>
            </div>
            <p className="small">記録に近いテーマが見つかったときだけ、確認済みの記事をあとで表示します。</p>
            <button className="button primary" type="button" onClick={finish}>今日の記録をのこす</button>
            {status && <p className="status" role="status">{status}</p>}
          </>
        )}

        {screen === "done" && (
          <>
            <div className="hero-icon" aria-hidden="true">🌿</div>
            <p className="eyebrow">{today}</p>
            <h1>今日の記録、できました</h1>
            <p className="summary">{summary}</p>
            <p className="small">これは、おうちで見たことをまとめた記録です。「できる・できない」を決めるものではありません。</p>
            <MemoItems record={records[today] || { observation, interpretation, concern }} />
            <RelatedArticles text={recordSearchText(records[today] || { observation, interpretation, concern })} />
            {records[today]?.photo && (
              <label className="check">
                <input type="checkbox" checked={includePhoto} onChange={(event) => setIncludePhoto(event.target.checked)} />
                写真もいっしょに送る
              </label>
            )}
            <button className="button primary" type="button" onClick={share}>{includePhoto ? "文章と写真を送る" : "文章を送る"}</button>
            <button className="button secondary" type="button" onClick={() => setCalendarOpen(true)}>カレンダーを見る</button>
            <button className="button ghost" type="button" onClick={restartToday}>今日の3問をやり直す</button>
            {status && <p className="status" role="status">{status}</p>}
          </>
        )}
      </section>

      {!consented && <Consent onAccept={acceptConsent} />}
      {calendarOpen && <Calendar records={records} onRecords={updateRecords} onClose={() => setCalendarOpen(false)} />}
    </main>
  );
}
