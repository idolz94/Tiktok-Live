"use client";

import { useCallback, useEffect, useState } from "react";
import { getLicenseCurrentApi, refreshLicenseApi, LicenseCurrentResponse } from "@/api/licensesApi";
import { ShopLicense } from "@/types/database";

type UseLicenseState = {
  license: ShopLicense | null;
  canUseApp: boolean;
  reason: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useLicense(): UseLicenseState {
  const [license, setLicense] = useState<ShopLicense | null>(null);
  const [canUseApp, setCanUseApp] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyResponse = (data: LicenseCurrentResponse) => {
    setLicense(data.license);
    setCanUseApp(data.canUseApp);
    setReason(data.reason);
  };

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLicenseCurrentApi();
      applyResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được thông tin gói");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await refreshLicenseApi();
      applyResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không làm mới được thông tin gói");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { license, canUseApp, reason, isLoading, error, refresh };
}
