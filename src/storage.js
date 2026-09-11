const RECORDS_KEY = "kizuki_records_v2";
const LEGACY_KEY = "kizuki";
export const CONSENT_KEY = "kizuki_consent_v2";
export const MAX_PHOTO_DATA_URL_LENGTH = 750_000;

function storageMessage(error) {
  if (error?.name === "QuotaExceededError") return "記録をのこす場所がいっぱいです。先にバックアップをのこして、いらない写真を消してください。";
  return "記録をのこせませんでした。スマホやパソコンの空きがあるか、ブラウザの設定を見てください。";
}

export function loadRecords() {
  try {
    const current = localStorage.getItem(RECORDS_KEY);
    if (current) return JSON.parse(current);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return {};
    const parsed = JSON.parse(legacy);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(parsed));
    return parsed;
  } catch { return {}; }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return { ok: true };
  } catch (error) { return { ok: false, message: storageMessage(error) }; }
}

export function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) { reject(new Error("写真や画像をえらんでください。")); return; }
    if (file.size > 10 * 1024 * 1024) { reject(new Error("写真が大きすぎます。10MBより小さい画像をえらんでください。")); return; }
    const image = new Image();
    const url = URL.createObjectURL(file);
    const cleanUp = () => URL.revokeObjectURL(url);
    const timer = setTimeout(() => { cleanUp(); reject(new Error("写真を読みこめませんでした。もう一度ためしてください。")); }, 10_000);
    image.onerror = () => { clearTimeout(timer); cleanUp(); reject(new Error("この写真は読みこめませんでした。別の画像をためしてください。")); };
    image.onload = () => {
      clearTimeout(timer);
      const scale = Math.min(1, 900 / image.width, 900 / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      cleanUp();
      const result = canvas.toDataURL("image/jpeg", 0.68);
      if (result.length > MAX_PHOTO_DATA_URL_LENGTH) { reject(new Error("写真を小さくしても、のこせませんでした。別の写真をえらんでください。")); return; }
      resolve(result);
    };
    image.src = url;
  });
}

export function downloadBackup(records) {
  const payload = JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), records }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `kizuki-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readBackup(file) {
  const parsed = JSON.parse(await file.text());
  if (parsed?.version !== 2 || !parsed.records || Array.isArray(parsed.records) || typeof parsed.records !== "object") {
    throw new Error("きづきカレンダーのバックアップではないようです。別のファイルをえらんでください。");
  }
  const entries = Object.entries(parsed.records);
  if (entries.length > 3660 || entries.some(([key, record]) =>
    !/^\d{4}-\d{2}-\d{2}$/.test(key)
    || !record
    || !Array.isArray(record.answers)
    || record.answers.length !== 3
    || (record.photo != null && (typeof record.photo !== "string" || record.photo.length > MAX_PHOTO_DATA_URL_LENGTH))
  )) {
    throw new Error("このバックアップは読みこめませんでした。別のバックアップがあれば、そちらをためしてください。");
  }
  return Object.fromEntries(entries);
}
