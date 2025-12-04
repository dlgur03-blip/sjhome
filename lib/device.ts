/**
 * 브라우저 fingerprint를 생성합니다.
 * User-Agent, 화면 크기, 언어, 타임존 등을 조합하여 고유 ID를 만듭니다.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    // Canvas fingerprint (간단 버전)
    getCanvasFingerprint(),
  ];

  const fingerprint = components.join("|");
  return hashString(fingerprint);
}

/**
 * Canvas fingerprint 생성 (간단 버전)
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("LMS-fingerprint", 2, 2);

    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-error";
  }
}

/**
 * 문자열을 해시로 변환 (djb2 알고리즘)
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * 세션 스토리지에서 라이선스 정보 가져오기
 */
export function getSessionLicense(): {
  key: string | null;
  expires: string | null;
} {
  if (typeof window === "undefined") {
    return { key: null, expires: null };
  }

  return {
    key: sessionStorage.getItem("license_key"),
    expires: sessionStorage.getItem("license_expires"),
  };
}

/**
 * 세션 스토리지에 라이선스 정보 저장
 */
export function setSessionLicense(key: string, expires: string): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("license_key", key);
  sessionStorage.setItem("license_expires", expires);
}

/**
 * 세션 스토리지에서 라이선스 정보 삭제
 */
export function clearSessionLicense(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("license_key");
  sessionStorage.removeItem("license_expires");
}
