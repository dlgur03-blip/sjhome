import { getSupabase } from "./supabase";
import { LicenseValidationResult } from "@/types";

/**
 * 라이선스 키 검증
 */
export async function validateLicense(
  key: string,
  deviceId: string
): Promise<LicenseValidationResult> {
  const supabase = getSupabase();

  // 1. 키 조회
  const { data: license, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("key", key)
    .single();

  if (error || !license) {
    return {
      success: false,
      message: "존재하지 않는 라이선스 키입니다.",
    };
  }

  // 2. 활성화 여부 확인
  if (!license.is_active) {
    return {
      success: false,
      message: "비활성화된 라이선스 키입니다.",
    };
  }

  // 3. 만료 여부 확인
  const now = new Date();
  const expiresAt = new Date(license.expires_at);
  if (now > expiresAt) {
    return {
      success: false,
      message: "만료된 라이선스 키입니다.",
    };
  }

  // 4. 기기 확인 (다른 기기에서 사용 중인지)
  if (license.current_device_id && license.current_device_id !== deviceId) {
    // 마지막 접속 시간 확인 (30분 이상 지났으면 새 기기 허용)
    const lastAccessed = license.last_accessed_at
      ? new Date(license.last_accessed_at)
      : null;
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    if (lastAccessed && lastAccessed > thirtyMinutesAgo) {
      return {
        success: false,
        message: "다른 기기에서 사용 중입니다. 잠시 후 다시 시도해주세요.",
      };
    }
  }

  // 5. 기기 등록 및 접속 시간 업데이트
  const { error: updateError } = await supabase
    .from("license_keys")
    .update({
      current_device_id: deviceId,
      last_accessed_at: now.toISOString(),
    })
    .eq("id", license.id);

  if (updateError) {
    return {
      success: false,
      message: "인증 처리 중 오류가 발생했습니다.",
    };
  }

  return {
    success: true,
    message: "인증 성공",
    expiresAt: license.expires_at,
    licenseKeyId: license.id,
  };
}

/**
 * 랜덤 라이선스 키 생성 (XXXX-XXXX-XXXX-XXXX 형태)
 */
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = [];

  for (let i = 0; i < 4; i++) {
    let segment = "";
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join("-");
}

/**
 * 라이선스 남은 일수 계산
 */
export function getRemainingDays(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * 라이선스 키 접속 갱신 (heartbeat)
 */
export async function refreshLicenseAccess(
  key: string,
  deviceId: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("license_keys")
    .update({
      last_accessed_at: new Date().toISOString(),
    })
    .eq("key", key)
    .eq("current_device_id", deviceId);

  return !error;
}
