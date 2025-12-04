"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { setSessionLicense } from "@/lib/device";
import { Instagram, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"google" | "license">("google");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [adminClickCount, setAdminClickCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setGoogleUser(session.user);
        checkExistingBinding(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setGoogleUser(session.user);
        await checkExistingBinding(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (adminClickCount >= 5) {
      router.push("/admin");
    }
  }, [adminClickCount, router]);

  const handleAdminClick = () => {
    setAdminClickCount((prev) => prev + 1);
    setTimeout(() => setAdminClickCount(0), 2000);
  };

  const checkExistingBinding = async (googleUserId: string) => {
    const supabase = getSupabase();

    const { data: license } = await supabase
      .from("license_keys")
      .select("*")
      .eq("google_user_id", googleUserId)
      .eq("is_active", true)
      .single();

    if (license) {
      const now = new Date();
      const expiresAt = new Date(license.expires_at);

      if (expiresAt > now) {
        setSessionLicense(license.key, license.expires_at);
        router.push("/courses");
        return;
      } else {
        setError("라이선스가 만료되었습니다.");
      }
    } else {
      setStep("license");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    const supabase = getSupabase();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setError("구글 로그인에 실패했습니다.");
      setIsLoading(false);
    }
  };

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.slice(0, 4).join("-");
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(formatLicenseKey(e.target.value));
    setError("");
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!googleUser) {
      setError("구글 로그인이 필요합니다.");
      return;
    }

    if (licenseKey.length !== 19) {
      setError("올바른 라이선스 키를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    const supabase = getSupabase();

    const { data: license, error: licenseError } = await supabase
      .from("license_keys")
      .select("*")
      .eq("key", licenseKey)
      .single();

    if (licenseError || !license) {
      setError("유효하지 않은 라이선스 키입니다.");
      setIsLoading(false);
      return;
    }

    if (license.google_user_id && license.google_user_id !== googleUser.id) {
      setError("이 라이선스는 다른 계정에 연결되어 있습니다.");
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const expiresAt = new Date(license.expires_at);

    if (expiresAt <= now) {
      setError("만료된 라이선스입니다.");
      setIsLoading(false);
      return;
    }

    if (!license.is_active) {
      setError("비활성화된 라이선스입니다.");
      setIsLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("license_keys")
      .update({
        google_user_id: googleUser.id,
        google_email: googleUser.email,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    if (updateError) {
      setError("계정 연결에 실패했습니다.");
      setIsLoading(false);
      return;
    }

    setSessionLicense(license.key, license.expires_at);
    router.push("/courses");
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setGoogleUser(null);
    setStep("google");
    setLicenseKey("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-[#88cc00] flex items-center justify-center">
            <Instagram className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">릴스 마스터 클래스</h1>
          <p className="text-gray-400">로그인하고 강의를 시청하세요</p>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          {step === "google" && !googleUser && (
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white text-black font-medium rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 로그인
                  </>
                )}
              </button>

              {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
            </div>
          )}

          {googleUser && (
            <div>
              <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl mb-4">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{googleUser.email}</p>
                  <p className="text-xs text-gray-400">구글 계정 연결됨</p>
                </div>
                <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white">
                  변경
                </button>
              </div>

              <form onSubmit={handleLicenseSubmit}>
                <label className="block text-sm text-gray-400 mb-2">라이선스 키</label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={handleKeyChange}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full h-12 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 text-white text-center text-lg tracking-widest placeholder-gray-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
                  maxLength={19}
                />

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading || licenseKey.length !== 19}
                  className="w-full h-12 mt-4 bg-[#CCFF00] text-black font-semibold rounded-xl hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "시작하기"}
                </button>
              </form>

              <p className="mt-4 text-xs text-gray-500 text-center">
                라이선스 키는 구매 후 이메일로 발송됩니다.
                <br />한 번 연결된 키는 다른 계정에서 사용할 수 없습니다.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-[#CCFF00] transition-colors">
            아직 라이선스가 없으신가요? 구매하기 →
          </a>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#CCFF00]">100만+</p>
            <p className="text-xs text-gray-500">누적 조회수</p>
          </div>
          <div onClick={handleAdminClick} className="cursor-default select-none">
            <p className="text-2xl font-bold text-[#CCFF00]">500+</p>
            <p className="text-xs text-gray-500">수강생</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#CCFF00]">98%</p>
            <p className="text-xs text-gray-500">만족도</p>
          </div>
        </div>
      </div>
    </div>
  );
}