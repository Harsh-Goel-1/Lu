import { useState, useEffect } from "react";
import { viewFunctions, CampaignInfo } from "@/lib/aptos";

export function useCampaign(address: string) {
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await viewFunctions.getCampaignInfo(address);
      setCampaign(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadCampaign();
    }
  }, [address]);

  return {
    campaign,
    loading,
    error,
    refetch: loadCampaign,
  };
}