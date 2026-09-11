import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ANSWER_LABELS,
  answerForQuestion,
  dateKey,
  fallbackSummary,
  monthIndex,
  monthParts,
  questionsForDate,
  recordQuestions,
} from "./core.js";
import {
  CONSENT_KEY,
  compressPhoto,
  downloadBackup,
  loadRecords,
  readBackup,
  saveRecords,
} from "./storage.js";
import { requestReflection } from "./reflection.js";
import "./styles.css";

function Modal({ title, onClose, children, persistent = false }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector("button, input, textarea")?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !persistent) closeRef.current();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled])")];
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
      <section ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
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

function Consent({ onAccept }) {
  return (
    <Modal title="はじめる前に" onClose={() => {}} persistent>
      <div className="notice">
        <p><strong>このアプリは、日々見えた出来事を記録するためのものです。</strong></p>
        <p>発達・健康・親子関係を診断、評価、保証するものではありません。心配がある場合は、医療・保健・子育て支援の専門窓口へご相談ください。</p>
        <p>記録と写真は、このブラウザの端末内ストレージへ保存されます。アプリ独自の暗号化はしていないため、共用端末では写真や個人を特定できる情報を保存しないでください。ブラウザのデータ消去や端末変更で失われることがあります。</p>
        <p>AI振り返りを選んだ場合だけ、3つの回答と任意メモをDifyへ送信します。写真は送信しません。氏名・住所などの個人情報は入力しないでください。</p>
      </div>
      <button className="button primary" type="button" onClick={onAccept}>理解してはじめる</button>
    </Modal>
  );
}

function RecordDetail({ recordKey, record, onRecords, onClose }) {
  const [status, setStatus] = useState("");
  const questions = recordQuestions(record, recordKey);

  const updatePhoto = async (file) => {
    if (!file) return;
    setStatus("画像を圧縮しています…");
    try {
      const photo = await compressPhoto(file);
      const result = onRecords((current) => ({
        ...current,
        [recordKey]: { ...current[recordKey], photo },
      }));
      setStatus(result.ok ? "写真を端末へ保存しました。" : result.message);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removePhoto = () => {
    const result = onRecords((current) => ({
      ...current,
      [recordKey]: { ...current[recordKey], photo: null },
    }));
    setStatus(result.ok ? "写真を削除しました。" : result.message);
  };

  return (
    <Modal title={`${recordKey} の記録`} onClose={onClose}>
      {record.photo ? (
        <div className="photo-wrap">
          <img src={record.photo} alt={`${recordKey}に保存した記録写真`} />
          <button className="photo-remove" type="button" onClick={removePhoto}>写真を削除する</button>
        </div>
      ) : (
        <label className="photo-input">
          記録に写真を追加する
          <input type="file" accept="image/*" onChange={(event) => updatePhoto(event.target.files?.[0])} />
        </label>
      )}
      <p className="small">写真はAIには送信されません。共有時に「保存した写真も共有に含める」を選んだ場合だけ添付されます。</p>
      {status && <p className="status" role="status">{status}</p>}
      <div className="answer-list">
        {record.answers?.map((answer, index) => {
          const question = questions[index];
          return (
            <div key={`${recordKey}-${index}`}>
              <p>{question?.emoji} {question?.text || "記録した質問"}</p>
              <span>{answer.label || ANSWER_LABELS[answer.type] || "回答済み"}</span>
            </div>
          );
        })}
      </div>
      {record.note && <><h2>メモ</h2><p>{record.note}</p></>}
      <h2>振り返り</h2>
      <p className="summary">{record.summary}</p>
      <button className="button secondary" type="button" onClick={onClose}>閉じる</button>
    </Modal>
  );
}

function Calendar({ records, onRecords, onClose }) {
  const now = new Date();
  const currentMonthIndex = monthIndex(now);
  const [shownMonthIndex, setShownMonthIndex] = useState(currentMonthIndex);
  const [detailKey, setDetailKey] = useState(null);
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
      setStatus(result.ok ? "バックアップを読み込みました。同じ日付はバックアップ内容で更新しました。" : result.message);
    } catch (error) {
      setStatus(error.message || "バックアップを読み込めませんでした。");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  return (
    <Modal title="きづきカレンダー" onClose={onClose}>
      <nav className="month-nav" aria-label="表示する月">
        <button className="month-button" type="button" onClick={() => setShownMonthIndex((value) => value - 1)}>← 前月</button>
        <strong aria-live="polite">{year}年{month + 1}月</strong>
        <button className="month-button" type="button" onClick={() => setShownMonthIndex((value) => Math.min(value + 1, currentMonthIndex))} disabled={isCurrentMonth}>翌月 →</button>
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
      <div className="backup-actions">
        <h2>バックアップ</h2>
        <p className="small">写真を含む全記録を書き出します。個人情報として安全な場所で保管してください。</p>
        <button className="button secondary" type="button" onClick={() => downloadBackup(records)}>全記録を書き出す</button>
        <button className="button secondary" type="button" onClick={() => importRef.current?.click()}>バックアップを読み込む</button>
        <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => importBackup(event.target.files?.[0])} />
        {status && <p className="status" role="status">{status}</p>}
      </div>
      {detailKey && records[detailKey] && (
        <RecordDetail recordKey={detailKey} record={records[detailKey]} onRecords={onRecords} onClose={() => setDetailKey(null)} />
      )}
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
  const [note, setNote] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [screen, setScreen] = useState(() => records[today] ? "done" : "home");
  const [summary, setSummary] = useState(() => records[today]?.summary || "");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
      // 同意状態を保存できない環境でも、現在の画面では利用を続けられる。
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
    setNote(records[today]?.note || "");
    setUseAi(false);
    setIncludePhoto(false);
    setStatus("");
    setScreen("question");
  };

  const finish = async () => {
    setLoading(true);
    setStatus("");
    let nextSummary = fallbackSummary(answers);
    let source = "fixed";
    if (useAi) {
      try {
        nextSummary = await requestReflection(answers, note);
        source = "dify";
      } catch (error) {
        setStatus(`${error.message} 固定の振り返り文で保存しました。`);
      }
    }
    const nextRecords = { ...records, [today]: { date: today, answers, note: note.trim(), summary: nextSummary, summarySource: source, photo: records[today]?.photo || null } };
    const result = saveRecords(nextRecords);
    if (!result.ok) {
      setStatus(result.message);
      setLoading(false);
      return;
    }
    setRecords(nextRecords);
    setSummary(nextSummary);
    setScreen("done");
    setLoading(false);
  };

  const share = async () => {
    const text = `きづきカレンダー ${today}\n${summary}\n\n※日々の観察記録であり、診断や評価ではありません。`;
    try {
      if (navigator.share) {
        const shareData = { title: "きづきカレンダー", text };
        if (includePhoto && records[today]?.photo) {
          const blob = await (await fetch(records[today].photo)).blob();
          const file = new File([blob], `kizuki-${today}.jpg`, { type: blob.type || "image/jpeg" });
          if (!navigator.canShare?.({ files: [file] })) throw new Error("このブラウザでは写真を共有できません。写真の選択を外して文章だけ共有してください。");
          shareData.files = [file];
        }
        await navigator.share(shareData);
        setStatus(`共有画面を開きました。${shareData.files ? "写真も含まれています。" : "写真は含まれていません。"}`);
      } else if (navigator.clipboard) {
        if (includePhoto) throw new Error("このブラウザでは写真を共有できません。写真の選択を外して文章だけコピーしてください。");
        await navigator.clipboard.writeText(text);
        setStatus("共有用の文章をコピーしました。写真は含まれていません。");
      } else {
        throw new Error("共有機能を利用できません。");
      }
    } catch (error) {
      if (error.name !== "AbortError") setStatus(error.message || "共有できませんでした。");
    }
  };

  return (
    <main className="app">
      <section className="card">
        {screen === "home" && (
          <>
            <div className="hero-icon" aria-hidden="true">🌱</div>
            <p className="eyebrow">見えたことを、そのまま記録</p>
            <h1>きづきカレンダー</h1>
            <p>1日3つの問いで、お子さんとの今日を振り返ります。答えに正解はありません。</p>
            <button className="button primary" type="button" onClick={() => setScreen("question")}>今日の記録をはじめる</button>
            <button className="button ghost" type="button" onClick={() => setCalendarOpen(true)}>過去の記録を見る</button>
          </>
        )}

        {screen === "question" && (
          <>
            <p className="progress-text">質問 {step + 1} / 3</p>
            <progress value={step + 1} max="3">{step + 1} / 3</progress>
            <div className="question-emoji" aria-hidden="true">{questions[step].emoji}</div>
            <h1>{questions[step].text}</h1>
            <p className="hint">{questions[step].hint}</p>
            <p id="answer-help" className="answer-help">1つ選び、「この回答で次へ」を押してください。</p>
            <div role="group" aria-label="回答" aria-describedby="answer-help">
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
            <button className="button primary confirm-answer" type="button" disabled={!selectedAnswer} onClick={confirmAnswer}>この回答で次へ</button>
          </>
        )}

        {screen === "review" && (
          <>
            <div className="hero-icon" aria-hidden="true">📝</div>
            <h1>今日のメモ</h1>
            <p>残したい出来事があれば、500文字以内で書けます。空欄でも保存できます。</p>
            <label htmlFor="note">任意メモ</label>
            <textarea id="note" maxLength="500" value={note} onChange={(event) => setNote(event.target.value)} placeholder="例：積み木を何度も並べ直していた" />
            <label className="check">
              <input type="checkbox" checked={useAi} onChange={(event) => setUseAi(event.target.checked)} />
              Difyで振り返り文を作る（回答とメモだけを送信。写真は送信しません）
            </label>
            <p className="small">個人情報は入力しないでください。AIの出力は診断・助言ではなく、記録を振り返るための文章です。</p>
            <button className="button primary" type="button" disabled={loading} onClick={finish}>{loading ? "保存しています…" : "今日の記録を保存する"}</button>
            {status && <p className="status" role="status">{status}</p>}
          </>
        )}

        {screen === "done" && (
          <>
            <div className="hero-icon" aria-hidden="true">🌿</div>
            <p className="eyebrow">{today} の記録</p>
            <h1>今日のきづき</h1>
            <p className="summary">{summary}</p>
            <p className="small">この文章は日々の観察を整理したもので、発達・健康・親子関係の診断や保証ではありません。</p>
            {records[today]?.photo && (
              <label className="check">
                <input type="checkbox" checked={includePhoto} onChange={(event) => setIncludePhoto(event.target.checked)} />
                保存した写真も共有に含める
              </label>
            )}
            <button className="button primary" type="button" onClick={share}>{includePhoto ? "文章と写真を共有する" : "文章を共有する"}</button>
            <button className="button secondary" type="button" onClick={() => setCalendarOpen(true)}>カレンダー・写真・バックアップ</button>
            <button className="button ghost" type="button" onClick={restartToday}>今日の回答をやり直す</button>
            {status && <p className="status" role="status">{status}</p>}
          </>
        )}
      </section>

      {!consented && <Consent onAccept={acceptConsent} />}
      {calendarOpen && <Calendar records={records} onRecords={updateRecords} onClose={() => setCalendarOpen(false)} />}
    </main>
  );
}
