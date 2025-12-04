import { NextRequest, NextResponse } from "next/server";
import { generateVdoCipherOTP } from "@/lib/vdocipher";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { videoId, licenseKey } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: "Video ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 라이선스 키로 사용자 정보 조회 (워터마크용)
    let watermark: string | undefined;
    
    if (licenseKey) {
      const supabase = getSupabase();
      const { data: license } = await supabase
        .from("license_keys")
        .select("id, memo")
        .eq("key", licenseKey)
        .single();

      if (license) {
        // 워터마크: 라이선스 키 일부 + 메모 (구매자 정보)
        const keyPart = licenseKey.substring(0, 9);  // XXXX-XXXX
        watermark = license.memo 
          ? `${license.memo} (${keyPart})` 
          : keyPart;
      }
    }

    // OTP 발급
    const otpData = await generateVdoCipherOTP(videoId, { watermark });

    if (!otpData) {
      return NextResponse.json(
        { success: false, message: "OTP 발급에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: otpData,
    });
  } catch (error) {
    console.error("OTP 발급 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
