/**
 * VdoCipher API 관련 함수
 */

const VDOCIPHER_API_SECRET = process.env.VDOCIPHER_API_SECRET || "";

export interface VdoCipherVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail_url: string;
  status: string;
}

export interface VdoCipherOTP {
  otp: string;
  playbackInfo: string;
}

/**
 * VdoCipher에서 영상 정보 가져오기
 */
export async function getVdoCipherVideoInfo(videoId: string): Promise<VdoCipherVideoInfo | null> {
  if (!VDOCIPHER_API_SECRET) {
    console.error("VDOCIPHER_API_SECRET이 설정되지 않았습니다.");
    return null;
  }

  try {
    const response = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}`, {
      headers: {
        "Authorization": `Apisecret ${VDOCIPHER_API_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("VdoCipher API 오류:", response.status);
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      title: data.title || "",
      description: data.description || "",
      duration: Math.floor(data.length || 0),
      thumbnail_url: data.poster || "",
      status: data.status || "ready",
    };
  } catch (error) {
    console.error("VdoCipher API 호출 실패:", error);
    return null;
  }
}

/**
 * VdoCipher OTP 발급 (영상 재생용)
 */
export async function generateVdoCipherOTP(
  videoId: string, 
  options?: {
    watermark?: string;
  }
): Promise<VdoCipherOTP | null> {
  if (!VDOCIPHER_API_SECRET) {
    console.error("VDOCIPHER_API_SECRET이 설정되지 않았습니다.");
    return null;
  }

  try {
    // 워터마크 설정 (유출자 추적용)
    const annotateCode = options?.watermark ? JSON.stringify([
      {
        type: "rtext",
        text: options.watermark,
        alpha: "0.5",
        color: "0xFFFFFF",
        size: "12",
        interval: "5000",
      }
    ]) : undefined;

    const body: Record<string, string> = {};
    if (annotateCode) {
      body.annotate = annotateCode;
    }

    const response = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        "Authorization": `Apisecret ${VDOCIPHER_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("VdoCipher OTP 발급 오류:", response.status);
      return null;
    }

    const data = await response.json();

    return {
      otp: data.otp,
      playbackInfo: data.playbackInfo,
    };
  } catch (error) {
    console.error("VdoCipher OTP 발급 실패:", error);
    return null;
  }
}
