"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionLicense, clearSessionLicense } from "@/lib/device";
import { getRemainingDays, refreshLicenseAccess } from "@/lib/license";

export function useLicense() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { key, expires } = getSessionLicense();

    if (!key) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setLicenseKey(key);
    setIsAuthenticated(true);

    if (expires) {
      const days = getRemainingDays(expires);
      setRemainingDays(days);

      // 만료되었으면 세션 삭제
      if (days <= 0) {
        clearSessionLicense();
        setIsAuthenticated(false);
      }
    }

    setIsLoading(false);

    // 5분마다 접속 갱신
    const interval = setInterval(() => {
      const { key } = getSessionLicense();
      if (key) {
        refreshLicenseAccess(key, "current-device");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    clearSessionLicense();
    setIsAuthenticated(false);
    setLicenseKey(null);
    router.push("/");
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  };

  return {
    isAuthenticated,
    isLoading,
    remainingDays,
    licenseKey,
    logout,
    requireAuth,
  };
}
